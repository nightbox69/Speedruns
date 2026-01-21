import pandas as pd
import openpyxl # type: ignore
import os
import sys
import html
from typing import Optional, List, Dict, Tuple, Any

# Constants
INPUT_FILE = r'd:\Work\Speedruns\Conversion-Files\P5R-Notes.xlsx'
OUTPUT_FILE = r'd:\Work\Speedruns\Conversion-Files\NotesTable.md'

class ExcelStyleExtractor:
    """Handles extraction of styles (colors, borders, fonts) from Excel cells."""

    BORDER_STYLE_MAP = {
        'thin': '1px solid #000',
        'medium': '2px solid #000',
        'thick': '3px solid #000',
        'double': '3px double #000',
        'hair': '1px solid #ccc',
        'dashed': '1px dashed #000',
        'dotted': '1px dotted #000'
    }

    @staticmethod
    def get_row_color(row_cells: tuple) -> Optional[str]:
        """
        Returns the background color (RGB Hex) of the row if it's not default.
        Scans first 5 cells to find a color.
        """
        try:
            for i in range(min(5, len(row_cells))):
                cell = row_cells[i]
                fg = cell.fill.fgColor
                if fg.type == 'rgb':
                    rgb = fg.rgb
                    if rgb and rgb != "00000000":
                        # Strip alpha if present (8 chars)
                        return "#" + rgb[2:] if len(rgb) == 8 else "#" + rgb
        except Exception:
            pass
        return None

    @staticmethod
    def get_contrast_text_color(hex_color: str) -> Optional[str]:
        """
        Returns '#FFFFFF' (white) or '#000000' (black) based on background luminance.
        """
        if not hex_color or not hex_color.startswith('#') or len(hex_color) != 7:
            return None

        try:
            r = int(hex_color[1:3], 16)
            g = int(hex_color[3:5], 16)
            b = int(hex_color[5:7], 16)
            # Standard luminance formula
            luminance = (0.299 * r + 0.587 * g + 0.114 * b)
            return '#FFFFFF' if luminance < 128 else '#000000'
        except Exception:
            return None

    @classmethod
    def get_border_css(cls, border_style: Optional[str]) -> Optional[str]:
        """Maps Excel border styles to CSS border strings."""
        if not border_style:
            return None
        return cls.BORDER_STYLE_MAP.get(border_style, '1px solid #000')

    @classmethod
    def extract_cell_borders(cls, cell) -> Dict[str, str]:
        """Extracts CSS border styles for a single cell."""
        borders = {}
        try:
            if cell.border:
                b = cell.border
                if b.top and b.top.style:
                    borders['top'] = cls.get_border_css(b.top.style)
                if b.bottom and b.bottom.style:
                    borders['bottom'] = cls.get_border_css(b.bottom.style)
                if b.left and b.left.style:
                    borders['left'] = cls.get_border_css(b.left.style)
                if b.right and b.right.style:
                    borders['right'] = cls.get_border_css(b.right.style)
        except Exception:
            pass
        return {k: v for k, v in borders.items() if v} # Filter None

    @staticmethod
    def is_bold(cell) -> bool:
        """Checks if a cell has bold font."""
        try:
            return bool(cell.font and cell.font.b)
        except Exception:
            return False


class HtmlTableGenerator:
    """Generates an HTML table from a pandas DataFrame and OpenPyXL Worksheet."""

    def __init__(self, extractor: ExcelStyleExtractor):
        self.extractor = extractor

    def generate(self, df: pd.DataFrame, ws: Any, output_handle):
        """Writes the HTML table to the output file handle."""
        
        # Identify valid columns (columns that have at least some data)
        valid_cols = [col for col in df.columns if df[col].any()]

        output_handle.write("<table>\n<tbody>\n")

        # Iterate through all rows in dataframe
        # Note: OpenPyXL is 1-indexed, Pandas is 0-indexed
        for index, row in df.iterrows():
            # Skip completely empty rows
            if all(not cell for cell in row):
                continue

            self._process_row(index, row, ws, valid_cols, output_handle)

        output_handle.write("</tbody>\n</table>\n\n")

    def _process_row(self, index: int, row: pd.Series, ws: Any, valid_cols: List, f):
        openpyxl_row = None
        bg_color = None
        text_color = None

        try:
            openpyxl_row = ws[index + 1] # Match pandas 0-index to Excel 1-index
            bg_color = self.extractor.get_row_color(openpyxl_row)
            if bg_color:
                text_color = self.extractor.get_contrast_text_color(bg_color)
        except Exception:
            pass

        # Row Styles
        style_parts = []
        if bg_color:
            style_parts.append(f"background-color: {bg_color}")
        if text_color:
            style_parts.append(f"color: {text_color}")
        
        style_attr = f' style="{"; ".join(style_parts)}"' if style_parts else ""
        f.write(f'<tr{style_attr}>')

        # Extract data for all cells in valid columns first
        # Format: (value, is_bold, borders_dict)
        row_data: List[Tuple[Any, bool, Dict[str, str]]] = []

        for col_name in valid_cols:
            val = row[col_name]
            
            # User Request: If column B (index 1) is empty, replace with '-'
            if col_name == 1 and (not val or not str(val).strip()):
                val = "-"

            is_bold = False
            borders = {}
            
            # Map column name/index to OpenPyXL cell
            # Assumption: valid_cols entries correspond to column indices if header=None was used
            try:
                if openpyxl_row:
                    # If valid_cols are indices, we can use them directly
                    cell_idx = col_name 
                    if isinstance(cell_idx, int) and cell_idx < len(openpyxl_row):
                        cell_obj = openpyxl_row[cell_idx]
                        is_bold = self.extractor.is_bold(cell_obj)
                        borders = self.extractor.extract_cell_borders(cell_obj)
            except Exception:
                pass
            
            row_data.append((val, is_bold, borders))

        # Render Cells with Colspan Logic
        i = 0
        ln = len(row_data)
        while i < ln:
            cell_val, is_bold, start_borders = row_data[i]
            colspan = 1
            
            # Check for empty subsequent cells to merge
            end_borders = start_borders
            for j in range(i + 1, ln):
                next_val, _, next_borders = row_data[j]
                if not next_val: # If empty value
                    colspan += 1
                    end_borders = next_borders # Inherit right border from last merged cell
                else:
                    break
            
            # Compose Cell CSS
            cell_styles = []
            if 'top' in start_borders: cell_styles.append(f"border-top: {start_borders['top']}")
            if 'bottom' in start_borders: cell_styles.append(f"border-bottom: {start_borders['bottom']}")
            if 'left' in start_borders: cell_styles.append(f"border-left: {start_borders['left']}")
            if 'right' in end_borders: cell_styles.append(f"border-right: {end_borders['right']}")
            
            # User Request: Limit Column A (index 0) spacing to 1.5 inches
            # We apply this width constraint to the first column cells.
            if i == 0:
                cell_styles.append("width: 1.5in")
            
            td_style = f' style="{"; ".join(cell_styles)}"' if cell_styles else ""

            # Content Formatting
            content = html.escape(str(cell_val).strip())
            if is_bold and content:
                content = f"<b>{content}</b>"
            
            if colspan > 1:
                f.write(f'<td colspan="{colspan}"{td_style}>{content}</td>')
                i += colspan
            else:
                f.write(f'<td{td_style}>{content}</td>')
                i += 1
        
        f.write("</tr>\n")


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: File '{INPUT_FILE}' not found.")
        sys.exit(1)

    try:
        print(f"Loading '{INPUT_FILE}'...")
        # Load workbook for styles
        wb = openpyxl.load_workbook(INPUT_FILE, data_only=True)
        # Load data for values
        xl_pd = pd.read_excel(INPUT_FILE, sheet_name=None, engine='openpyxl', header=None)
        
        extractor = ExcelStyleExtractor()
        generator = HtmlTableGenerator(extractor)

        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            for sheet_name, df in xl_pd.items():
                print(f"Converting sheet: {sheet_name}")
                if sheet_name in wb:
                    ws = wb[sheet_name]
                    f.write(f"# {sheet_name}\n\n")
                    
                    # Clean data
                    df = df.fillna('')
                    df = df.map(lambda x: str(x).strip())
                    
                    generator.generate(df, ws, f)
                else:
                     print(f"Warning: Sheet {sheet_name} not found in workbook styles.")

        print(f"Successfully converted to '{OUTPUT_FILE}'")

    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
