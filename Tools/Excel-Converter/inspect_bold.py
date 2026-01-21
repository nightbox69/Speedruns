import openpyxl
import os

input_file = r'd:\Work\Speedruns\Games\Persona-5\Notes\P5R PC Notes (Advanced).xlsx'

if not os.path.exists(input_file):
    print(f"Error: {input_file} not found")
else:
    print(f"Inspecting bold styles in '{input_file}'...")
    wb = openpyxl.load_workbook(input_file, data_only=True)
    ws = wb.worksheets[0]
    
    # Check first 50 rows for bold text
    for i in range(1, 51):
        for j in range(1, 10): # Check first few columns
            cell = ws.cell(row=i, column=j)
            if cell.value and cell.font and cell.font.b:
                 print(f"Row {i}, Col {j}: Bold=True, Value='{cell.value}'")
