import json

# Load data
with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\listening_days46_90.json', 'r', encoding='utf-8') as f:
    listening = json.load(f)
with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\sentences_days46_90.json', 'r', encoding='utf-8') as f:
    sentences = json.load(f)

sent_lookup = {s['id']: s for s in sentences}

# Garbage translation patterns
garbage_translations = [
    'Today is very old', 'He goes book', 'I have liked food before',
    'Can I want', 'This is very old', 'I had.', 'Did you have?',
    'He goes water', 'I have went water before', 'He goes money',
    'What do you think of money', 'What do you think of book',
    'I have went', 'He goes', 'She goes', 'I goes',
    '가다했습니까', '가다합니다', '좋아하다한', '말하다했습니다',
    '원하다할', '낡다니다', '있다했습니다', '있다했습니까',
    '물을/를 가다', '책을/를 가다', '돈은/는', '음식을/를 좋아하다',
    '오늘은 매우 낡다', '저는 말하다', '그는 책을', '저는 음식을',
    '저는 있다', '그는 물을', '돈은/는 어때요', '원하다할 수 있어요',
]

fixed_count = 0
for item in listening:
    trans = item.get('translation_en', '')
    pinyin = item.get('pinyin', '')
    
    is_garbage = False
    
    # Check Chinese chars in pinyin
    for c in pinyin:
        if '\u4e00' <= c <= '\u9fff':
            is_garbage = True
            break
    
    # Check garbage translations
    if not is_garbage:
        for phrase in garbage_translations:
            if phrase in trans:
                is_garbage = True
                break
    
    if is_garbage:
        sent_id = item.get('sentence_id', '')
        if sent_id and sent_id in sent_lookup:
            sent = sent_lookup[sent_id]
            item['text'] = sent['text']
            item['pinyin'] = sent['pinyin']
            item['pinyin_numeric'] = sent['pinyin_numeric']
            item['translation_en'] = sent['translation_en']
            item['translation_ko'] = sent.get('translation_ko', '')
            fixed_count += 1

print(f"Fixed {fixed_count} listening items")

# Write
with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\listening_days46_90.json', 'w', encoding='utf-8') as f:
    json.dump(listening, f, ensure_ascii=False, indent=2)

# Verify
with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\listening_days46_90.json', 'r', encoding='utf-8') as f:
    fixed = json.load(f)

# Check a few previously bad items
for item in fixed:
    if item['id'] in ['LIS_D67_05', 'LIS_D67_06', 'LIS_D68_03', 'LIS_D68_04']:
        print(f"\n{item['id']}: {item['text']}")
        print(f"  EN: {item['translation_en']}")

# Count remaining garbage
remaining = 0
for item in fixed:
    trans = item.get('translation_en', '')
    for phrase in garbage_translations:
        if phrase in trans:
            remaining += 1
            break
print(f"\nRemaining garbage: {remaining}")
