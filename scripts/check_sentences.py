import json
sentences = json.load(open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\sentences_days46_90.json', 'r', encoding='utf-8'))
for s in sentences:
    if s['id'] in ['SEN_D67_005', 'SEN_D67_006', 'SEN_D68_003', 'SEN_D68_004', 'SEN_D76_005']:
        print(f"{s['id']}: {s['text']}")
        print(f"  pinyin: {s['pinyin']}")
        print(f"  EN: {s['translation_en']}")
        print()
