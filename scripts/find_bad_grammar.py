import json, os

BASE = r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data'

# Check each grammar file
for fname in ['grammar_month1.json', 'grammar_days31_45.json', 'grammar_days46_90.json']:
    data = json.load(open(os.path.join(BASE, fname), 'r', encoding='utf-8'))
    for i, g in enumerate(data):
        if 'id' not in g:
            print(f"FILE: {fname}, INDEX: {i}")
            print(f"  Pattern: {g.get('pattern', 'N/A')[:60]}")
            print(f"  Title: {g.get('title', 'N/A')[:60]}")
            print()
