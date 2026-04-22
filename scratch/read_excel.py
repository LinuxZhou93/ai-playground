import pandas as pd
import json

file_path = "/Users/zhoulin/Desktop/课程阶段蓝图.xlsx"
df = pd.read_excel(file_path, header=None)
print("Data Shape:", df.shape)

# Convert to list of lists for easy reading
data = df.values.tolist()
for i, row in enumerate(data):
    print(f"Row {i}: {row}")

# Saving to a scratch file just in case
with open("/Users/zhoulin/.gemini/antigravity/brain/5a4582fa-33aa-4323-9e6e-5bba27e5780e/excel_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
