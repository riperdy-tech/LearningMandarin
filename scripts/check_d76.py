import json
with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\grammar_days46_90.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
for g in data:
    if g['id'].startswith('GR_D76_'):
        print(f"ID: {g['id']}")
        print(f"Pattern: {g['pattern']}")
        print(f"Title: {g['title']}")
        print(f"Meaning: {g['meaning']}")
        print(f"Example IDs: {g['example_ids']}")
        print("Correct examples:")
        for ex in g.get('correct_examples', [])[:2]:
            print(f"  {ex['text']}")
            print(f"  EN: {ex['translation_en']}")
        print()
