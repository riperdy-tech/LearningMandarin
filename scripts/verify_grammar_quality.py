import json
g = json.load(open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\grammar_days46_90.json', 'r', encoding='utf-8'))

# Check a few entries for quality
for entry in g:
    if entry['id'] in ['GR_D46_COMPLETED_LE', 'GR_D67_SUIRAN_KESHI', 'GR_D76_BENLAI_HOULAI', 'GR_D81_WEI_PHONE']:
        print(f"\n{'='*50}")
        print(f"ID: {entry['id']}")
        print(f"Pattern: {entry['pattern']}")
        print(f"Title: {entry['title']}")
        print(f"Examples ({len(entry.get('correct_examples',[]))}):")
        for ex in entry.get('correct_examples',[]):
            print(f"  {ex['text'][:70]}")
        print(f"Transform drills:")
        for d in entry.get('transformation_drills',[]):
            print(f"  - {d}")
        print(f"Production drills:")
        for d in entry.get('production_drills',[]):
            print(f"  - {d}")
        print(f"Common errors:")
        for e in entry.get('common_error_patterns',[]):
            print(f"  - {e}")
