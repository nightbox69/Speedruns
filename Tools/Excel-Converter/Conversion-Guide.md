# Excel to Markdown Conversion Guide

This guide explains how to manually convert your Excel notes file (`P5R PC Notes (Advanced).xlsx`) into a formatted Markdown table (`NotesTable.md`) completely on your own using the provided Python scripts.

## 1. Prerequisites (One-Time Setup)

Before running the scripts for the first time, you need to ensure Python and the required libraries are installed.

### Step 1: Install Python
Check if Python is installed by opening a terminal (PowerShell or Command Prompt) and verifying the version:
```cmd
python --version
```
If Python is not installed, download it from [python.org](https://www.python.org/downloads/) and install it. Make sure to check **"Add Python to PATH"** during installation.

### Step 2: Install Required Libraries
The scripts rely on `pandas` for data handling and `openpyxl` for reading Excel colors and formatting. Install them via terminal:

```cmd
pip install pandas openpyxl
```

---

## 2. Setting Up Paths (If Files Move)

The conversion script (`convert_to_table.py`) is currently configured with specific file paths:

*   **Input File:** `d:\Work\Speedruns\Games\Persona-5\Notes\P5R PC Notes (Advanced).xlsx`
*   **Output File:** `d:\Work\Speedruns\Games\Persona-5\Notes\NotesTable.md`

If your Excel file or destination folder changes location, you will need to update these paths in the script.

1.  Right-click `convert_to_table.py` and choose **Edit** (or open with Notepad/VS Code).
2.  Locate the section at the top:
    ```python
    input_file = r'd:\Path\To\Your\ExcelFile.xlsx'
    output_file = r'd:\Path\To\Your\Output.md'
    ```
3.  Change the paths to match your new file locations.
    *   **Tip:** Keep the `r` before the quotes (e.g., `r'C:\Users...'`) to handle backslashes correctly on Windows.

---

## 3. Running the Conversion

Once set up, you can generate the Markdown table whenever you update your Excel file.

1.  Open your terminal or command prompt.
2.  Navigate to the `Excel-Converter` folder (or where you saved the scripts):
    ```cmd
    cd d:\Work\Speedruns\Tools\Excel-Converter
    ```
3.  Run the conversion script:
    ```cmd
    py convert_to_table.py
    ```
    *(Note: You can use `python` instead of `py` if `py` is not available)*

### Success!
If successful, you will see the message:
`Successfully converted to '...'`

You can now open the generated `.md` file to see your changes.

---

## 4. Features Included

*   **HTML & Markdown Hybrid:** Generates an HTML table compatible with Markdown viewers.
*   **Colspan Support:** Automatically merges empty cells into the previous cell to prevent text wrapping issues (mimicking the "Notes" column).
*   **Color Preservation:** Reads background colors from Excel rows and applies them to the table rows.
*   **Smart Text Contrast:** Automatically switches text color to White or Black based on the background brightness for readability.
*   **Bold Support:** Detects bold text in Excel cells and wraps it in `<b>` tags.
*   **Border Support:** Extracts cell borders (top, bottom, left, right) and applies them as CSS styles.
*   **Empty Column B:** Automatically replaces empty cells in the second column (Column B) with a `-`.
*   **Column A Spacing:** Restricts the first column width to `1.5in` to prevent excessive spacing.
