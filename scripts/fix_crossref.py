import json
import os

BASE = r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data'

# 1. Find and fix duplicate vocab IDs
vocab_files = ['vocab_month1.json', 'vocab_days31_45.json', 'vocab_days46_90.json']
all_vocab = {}
for fname in vocab_files:
    data = json.load(open(os.path.join(BASE, fname), 'r', encoding='utf-8'))
    for v in data:
        vid = v['id']
        if vid in all_vocab:
            print(f"DUPLICATE: {vid} in {all_vocab[vid]} and {fname}")
            print(f"  char1: {v.get('char','?')}, char2: ?")
        all_vocab[vid] = fname

# Find which file the dupe is in for VOC_D44_*
print("\nLooking for VOC_D44_* duplicates...")
for fname in vocab_files:
    data = json.load(open(os.path.join(BASE, fname), 'r', encoding='utf-8'))
    d44 = [v for v in data if v['id'].startswith('VOC_D44_')]
    if d44:
        print(f"  {fname}: {len(d44)} VOC_D44 entries")
        for v in d44[:3]:
            print(f"    {v['id']}: {v['char']} ({v['pinyin']}) - {v['meaning_en']}")

# Check if vocab_month1 has VOC_D44 entries (it shouldn't)
m1 = json.load(open(os.path.join(BASE, 'vocab_month1.json'), 'r', encoding='utf-8'))
m1_d44 = [v for v in m1 if v['id'].startswith('VOC_D44_')]
if m1_d44:
    print(f"\nvocab_month1.json has {len(m1_d44)} unexpected VOC_D44 entries!")
    for v in m1_d44[:3]:
        print(f"  {v['id']}: {v['char']}")

# Check if both days31_45 and days46_90 have VOC_D44
d3145 = json.load(open(os.path.join(BASE, 'vocab_days31_45.json'), 'r', encoding='utf-8'))
d4690 = json.load(open(os.path.join(BASE, 'vocab_days46_90.json'), 'r', encoding='utf-8'))

d3145_d44 = [v for v in d3145 if v['id'].startswith('VOC_D44_')]
d4690_d44 = [v for v in d4690 if v['id'].startswith('VOC_D44_')]

print(f"\nvocab_days31_45.json: {len(d3145_d44)} VOC_D44 entries")
print(f"vocab_days46_90.json: {len(d4690_d44)} VOC_D44 entries")

if d3145_d44 and d4690_d44:
    # Rename the ones in days46_90 to avoid conflict
    # Days 46-90 should have D46-D90 prefixes, not D44
    print("\nFIXING: Renaming duplicate VOC_D44 entries in days46_90...")
    renamed = 0
    for v in d4690:
        if v['id'].startswith('VOC_D44_'):
            old_id = v['id']
            # These should not be in days46_90 at all
            # Remove them from days46_90
            pass
    
    # Actually, let me just remove VOC_D44 entries from days46_90
    # They're already in days31_45
    d4690_filtered = [v for v in d4690 if not v['id'].startswith('VOC_D44_')]
    removed = len(d4690) - len(d4690_filtered)
    print(f"  Removed {removed} VOC_D44 entries from vocab_days46_90.json")
    
    with open(os.path.join(BASE, 'vocab_days46_90.json'), 'w', encoding='utf-8') as f:
        json.dump(d4690_filtered, f, ensure_ascii=False, indent=2)

# 2. Fix missing sentence SEN_D31_013
print("\nChecking for SEN_D31_013...")
sentences = json.load(open(os.path.join(BASE, 'sentences_month1.json'), 'r', encoding='utf-8')) + \
            json.load(open(os.path.join(BASE, 'sentences_days31_45.json'), 'r', encoding='utf-8')) + \
            json.load(open(os.path.join(BASE, 'sentences_days46_90.json'), 'r', encoding='utf-8'))

d31_sents = [s for s in sentences if s['id'].startswith('SEN_D31_')]
print(f"SEN_D31_* sentences found: {len(d31_sents)}")
ids = sorted([s['id'] for s in d31_sents])
print(f"IDs: {ids[:5]}...{ids[-3:]}")

# Find the gap
expected = set()
for s in d31_sents:
    num = int(s['id'].split('_')[2])
    expected.add(num)

all_nums = set(range(1, max(expected)+1))
missing_nums = all_nums - expected
if missing_nums:
    print(f"Missing sentence numbers: {sorted(missing_nums)}")

# Fix the grammar reference - remove SEN_D31_013 from example_ids
grammar_d3145 = json.load(open(os.path.join(BASE, 'grammar_days31_45.json'), 'r', encoding='utf-8'))
for g in grammar_d3145:
    if 'SEN_D31_013' in g.get('example_ids', []):
        print(f"\nRemoving SEN_D31_013 from grammar {g['id']} example_ids")
        g['example_ids'] = [eid for eid in g['example_ids'] if eid != 'SEN_D31_013']
        # Add a replacement if there's another sentence available
        for s in d31_sents:
            if s['id'] not in g['example_ids']:
                g['example_ids'].append(s['id'])
                print(f"  Added {s['id']} as replacement")
                break

with open(os.path.join(BASE, 'grammar_days31_45.json'), 'w', encoding='utf-8') as f:
    json.dump(grammar_d3145, f, ensure_ascii=False, indent=2)

print("\nDone fixing cross-reference issues.")
