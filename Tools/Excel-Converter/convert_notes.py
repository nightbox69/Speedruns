import pandas as pd
import os
import sys

# Define file paths
input_file = r'd:\Work\Speedruns\Games\Persona-5\Notes\P5R PC Notes (Advanced).xlsx'
output_file = r'd:\Work\Speedruns\Games\Persona-5\Notes\P5R_PC_Notes_Advanced.md'

# Check if file exists
if not os.path.exists(input_file):
    print(f"Error: File '{input_file}' not found.")
    sys.exit(1)

try:
    # Load Excel file (all sheets)
    print(f"Loading '{input_file}'...")
    # Read without headers
    xl = pd.read_excel(input_file, sheet_name=None, engine='openpyxl', header=None)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Iterate through sheets
        for sheet_name, df in xl.items():
            print(f"Converting sheet: {sheet_name}")
            
            # Write sheet name as Top Level Header
            f.write(f"# {sheet_name}\n\n")
            
            # Forward fill the first column to handle merged cells/groupings
            # But we must be careful not to fill across huge gaps if they exist. 
            # In these notes, usually Col 0 is the "Section".
            df[0] = df[0].ffill()
            
            # Replace NaNs with empty string in the whole dataframe
            df = df.fillna('')
            
            last_col0 = None
            
            for index, row in df.iterrows():
                # Get Column 0 (Header/Section)
                col0 = str(row[0]).strip()
                
                # Get the rest of the columns (Body)
                # Filter out empty cells
                body_parts = [str(x).strip() for x in row[1:] if str(x).strip()]
                body_text = ' - '.join(body_parts)
                
                # Logic for printing
                is_new_section = (col0 != last_col0)
                
                if is_new_section:
                    last_col0 = col0
                    
                    if body_text:
                        # New Section with content -> Print Header then Content
                        # Use Level 3 header for sections
                        f.write(f"\n### {col0}\n")
                        f.write(f"- {body_text}\n")
                    else:
                        # New Section but no content columns -> Treat as a standalone note/bold bullet
                        # Use a bold bullet point
                        f.write(f"- **{col0}**\n")
                
                else:
                    # Same section as previous row
                    if body_text:
                        # Just append content as bullet
                        f.write(f"- {body_text}\n")
                    else:
                        # Same section, no content? 
                        # This implies a row with Col0 same as above, and empty body.
                        # Usually duplicate or empty row. Ignore.
                        pass
            
            f.write("\n\n")
            
    print(f"Successfully converted to '{output_file}'")

except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
