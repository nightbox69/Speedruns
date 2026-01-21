import pandas as pd
import os

input_file = r'd:\Work\Speedruns\Games\Persona-5\Notes\P5R PC Notes (Advanced).xlsx'

if not os.path.exists(input_file):
    print(f"Error: {input_file} not found")
else:
    print(f"Inspecting '{input_file}'...")
    try:
        # Read first 20 rows
        df = pd.read_excel(input_file, sheet_name=0, header=None, nrows=20, engine='openpyxl')
        print(df.to_string())
    except Exception as e:
        print(e)
