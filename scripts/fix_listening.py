import json

# Load listening data
with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\listening_days46_90.json', 'r', encoding='utf-8') as f:
    listening = json.load(f)

# Load sentences data to use for fixing
with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\sentences_days46_90.json', 'r', encoding='utf-8') as f:
    sentences = json.load(f)

# Build sentence lookup
sent_lookup = {}
for s in sentences:
    sent_lookup[s['id']] = s

# Identify garbage items and what days they're from
garbage_days = set()
good_count = 0
garbage_count = 0

for item in listening:
    pinyin = item.get('pinyin', '')
    text = item.get('text', '')
    trans = item.get('translation_en', '')
    
    # Garbage indicators:
    # 1. Chinese characters in pinyin field
    # 2. Nonsensical translations
    is_garbage = False
    
    # Check for Chinese chars in pinyin
    for c in pinyin:
        if '\u4e00' <= c <= '\u9fff' or '\u3400' <= c <= '\u4dbf':
            is_garbage = True
            break
    
    # Check for clearly nonsensical translations
    if not is_garbage:
        garbage_phrases = [
            'Today is very old', 'He goes book', 'I have liked food before',
            'Can I want', 'This is very old', 'I had', 'Did you have',
            'He goes water', 'I have went water before',
            '가다했습니까', '가다합니다', '좋아하다한', '말하다했습니다',
            '원하다할', '낡다니다', '있다했습니다', '있다했습니까',
            '물을/를 가다'
        ]
        for phrase in garbage_phrases:
            if phrase in trans:
                is_garbage = True
                break
    
    if is_garbage:
        garbage_count += 1
        # Extract day from ID
        parts = item['id'].split('_')
        for p in parts:
            if p.startswith('D') and p[1:].isdigit():
                garbage_days.add(int(p[1:]))
                break
    else:
        good_count += 1

print(f"Good items: {good_count}")
print(f"Garbage items: {garbage_count}")
print(f"Garbage days: {sorted(garbage_days)}")

# Now fix the garbage items by regenerating them from sentence data
# For each garbage listening item, replace with data from the referenced sentence
fixed_count = 0
for item in listening:
    sent_id = item.get('sentence_id', '')
    if sent_id and sent_id in sent_lookup:
        sent = sent_lookup[sent_id]
        pinyin = item.get('pinyin', '')
        # Check if this item is garbage
        has_chinese_in_pinyin = any('\u4e00' <= c <= '\u9fff' or '\u3400' <= c <= '\u4dbf' for c in pinyin)
        if has_chinese_in_pinyin:
            # Replace with real sentence data
            item['text'] = sent['text']
            item['pinyin'] = sent['pinyin']
            item['pinyin_numeric'] = sent['pinyin_numeric']
            item['translation_en'] = sent['translation_en']
            item['translation_ko'] = sent.get('translation_ko', '')
            fixed_count += 1

print(f"\nFixed {fixed_count} items by cross-referencing sentences data")

# Write fixed file
with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\listening_days46_90.json', 'w', encoding='utf-8') as f:
    json.dump(listening, f, ensure_ascii=False, indent=2)

print("Written fixed listening_days46_90.json")

# Verify
with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\listening_days46_90.json', 'r', encoding='utf-8') as f:
    fixed = json.load(f)

remaining_garbage = 0
for item in fixed:
    pinyin = item.get('pinyin', '')
    if any('\u4e00' <= c <= '\u9fff' or '\u3400' <= c <= '\u4dbf' for c in pinyin):
        remaining_garbage += 1

print(f"Remaining garbage after fix: {remaining_garbage}")

# Show a few fixed examples
print("\nSample fixed items:")
for item in fixed:
    if item['id'] in ['LIS_D67_01', 'LIS_D67_03', 'LIS_D67_05']:
        print(f"  {item['id']}: {item['text']}")
        print(f"    Pinyin: {item['pinyin']}")
        print(f"    EN: {item['translation_en']}")
