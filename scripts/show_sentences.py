import json

with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\sentences_days46_90.json', 'r', encoding='utf-8') as f:
    sentences = json.load(f)

# Show sample sentences for a few days
for day in [46, 47, 48, 52, 67, 68, 76]:
    print(f"\n=== DAY {day} SAMPLE SENTENCES ===")
    count = 0
    for s in sentences:
        if s['id'].startswith(f'SEN_D{day}_') and count < 6:
            print(f"  {s['id']}: {s['text']}")
            print(f"    Pinyin: {s['pinyin']}")
            print(f"    EN: {s['translation_en']}")
            count += 1
