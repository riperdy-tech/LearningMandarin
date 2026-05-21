import json

with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\grammar_days31_45.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# The 4 entries without IDs at indices 28, 29, 43, 44
# Not referenced by any lesson, but need IDs for data integrity
id_map = {
    28: 'GR_D36_BI_COMPARISON_EXTRA',
    29: 'GR_D37_ZAI_LOCATION_EXTRA',
    43: 'GR_D42_JUEDE_OPINION_EXTRA',
    44: 'GR_D43_KEYI_REQUEST_EXTRA',
}

for idx, new_id in id_map.items():
    data[idx]['id'] = new_id
    print(f"Added ID '{new_id}' to entry at index {idx}: {data[idx].get('title', '?')[:50]}")

with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\grammar_days31_45.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Verify
data2 = json.load(open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\grammar_days31_45.json', 'r', encoding='utf-8'))
missing = sum(1 for g in data2 if 'id' not in g)
print(f"Remaining entries without ID: {missing}")
