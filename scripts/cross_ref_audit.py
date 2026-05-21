#!/usr/bin/env python3
"""
CROSS-REFERENCE AUDIT: Check all IDs link correctly between files.
"""
import json
import os
from collections import defaultdict

BASE = r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data'
LESSONS_BASE = r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\lessons'

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

# Load all data
all_vocab = load_json(os.path.join(BASE, 'vocab_month1.json')) + \
            load_json(os.path.join(BASE, 'vocab_days31_45.json')) + \
            load_json(os.path.join(BASE, 'vocab_days46_90.json'))

all_sentences = load_json(os.path.join(BASE, 'sentences_month1.json')) + \
                load_json(os.path.join(BASE, 'sentences_days31_45.json')) + \
                load_json(os.path.join(BASE, 'sentences_days46_90.json'))

all_grammar = load_json(os.path.join(BASE, 'grammar_month1.json')) + \
              load_json(os.path.join(BASE, 'grammar_days31_45.json')) + \
              load_json(os.path.join(BASE, 'grammar_days46_90.json'))

# Debug: check for non-dict items
for i, g in enumerate(all_grammar):
    if not isinstance(g, dict):
        print(f"DEBUG: all_grammar[{i}] is {type(g).__name__}: {str(g)[:100]}")
    elif 'id' not in g:
        print(f"DEBUG: all_grammar[{i}] missing 'id': keys={list(g.keys())[:10]}")

all_dialogues = load_json(os.path.join(BASE, 'dialogues_days31_45.json')) + \
                load_json(os.path.join(BASE, 'dialogues_days46_90.json'))

all_lessons = load_json(os.path.join(LESSONS_BASE, 'lessons_month1.json')) + \
              load_json(os.path.join(LESSONS_BASE, 'lessons_days31_45.json')) + \
              load_json(os.path.join(LESSONS_BASE, 'lessons_days46_90.json'))

# Build ID sets
vocab_ids = {v['id'] for v in all_vocab}
sentence_ids = {s['id'] for s in all_sentences}
grammar_ids = {g['id'] for g in all_grammar}
dialogue_ids = {d['id'] for d in all_dialogues}
lesson_ids = {l['id'] for l in all_lessons}

print("=" * 60)
print("CROSS-REFERENCE AUDIT")
print("=" * 60)
print(f"Vocab IDs: {len(vocab_ids)}")
print(f"Sentence IDs: {len(sentence_ids)}")
print(f"Grammar IDs: {len(grammar_ids)}")
print(f"Dialogue IDs: {len(dialogue_ids)}")
print(f"Lesson IDs: {len(lesson_ids)}")

issues = []

def check_ref(source_file, source_id, ref_type, ref_ids, valid_set):
    for rid in ref_ids:
        if rid not in valid_set:
            issues.append(f"[{source_file}] {source_id}: {ref_type} '{rid}' NOT FOUND")

# 1. Check grammar example_ids -> sentences
print("\n--- Checking grammar.example_ids -> sentences ---")
for g in all_grammar:
    check_ref('grammar', g['id'], 'example_id', g.get('example_ids', []), sentence_ids)

# 2. Check sentence grammar_ids -> grammar
print("--- Checking sentence.grammar_ids -> grammar ---")
for s in all_sentences:
    check_ref('sentences', s['id'], 'grammar_id', s.get('grammar_ids', []), grammar_ids)

# 3. Check sentence token_ids -> vocab
print("--- Checking sentence.token_ids -> vocab ---")
for s in all_sentences:
    check_ref('sentences', s['id'], 'token_id', s.get('token_ids', []), vocab_ids)

# 4. Check vocab example_ids -> sentences
print("--- Checking vocab.example_ids -> sentences ---")
for v in all_vocab:
    check_ref('vocab', v['id'], 'example_id', v.get('example_ids', []), sentence_ids)

# 5. Check lesson vocab_ids -> vocab
print("--- Checking lesson.vocab_ids -> vocab ---")
for l in all_lessons:
    check_ref('lessons', l['id'], 'vocab_id', l.get('vocab_ids', []), vocab_ids)

# 6. Check lesson sentence_ids -> sentences
print("--- Checking lesson.sentence_ids -> sentences ---")
for l in all_lessons:
    check_ref('lessons', l['id'], 'sentence_id', l.get('sentence_ids', []), sentence_ids)

# 7. Check lesson grammar_ids -> grammar
print("--- Checking lesson.grammar_ids -> grammar ---")
for l in all_lessons:
    check_ref('lessons', l['id'], 'grammar_id', l.get('grammar_ids', []), grammar_ids)

# 8. Check lesson dialogue_ids -> dialogues
print("--- Checking lesson.dialogue_ids -> dialogues ---")
for l in all_lessons:
    check_ref('lessons', l['id'], 'dialogue_id', l.get('dialogue_ids', []), dialogue_ids)

# 9. Check dialogue grammar_ids -> grammar
print("--- Checking dialogue.grammar_ids -> grammar ---")
for d in all_dialogues:
    check_ref('dialogues', d['id'], 'grammar_id', d.get('grammar_ids', []), grammar_ids)

# 10. Check dialogue turn token_ids -> vocab
print("--- Checking dialogue turn.token_ids -> vocab ---")
for d in all_dialogues:
    for t in d.get('turns', []):
        check_ref('dialogues', f"{d['id']}.{t.get('id', '?')}", 'token_id', t.get('token_ids', []), vocab_ids)

# 11. Check for duplicate IDs
print("--- Checking for duplicate IDs ---")
id_counts = defaultdict(list)
for v in all_vocab:
    id_counts[v['id']].append('vocab')
for s in all_sentences:
    id_counts[s['id']].append('sentences')
for g in all_grammar:
    id_counts[g['id']].append('grammar')
for l in all_lessons:
    id_counts[l['id']].append('lessons')

dupes = {k: v for k, v in id_counts.items() if len(v) > 1}
if dupes:
    for k, v in list(dupes.items())[:10]:
        issues.append(f"DUPLICATE ID: {k} appears in {v}")

# 12. Check listening sentence_ids -> sentences
listening_all = load_json(os.path.join(BASE, 'listening_days31_45.json')) + \
                load_json(os.path.join(BASE, 'listening_days46_90.json'))
print("--- Checking listening.sentence_id -> sentences ---")
for item in listening_all:
    sid = item.get('sentence_id', '')
    if sid and sid not in sentence_ids:
        issues.append(f"[listening] {item['id']}: sentence_id '{sid}' NOT FOUND")

# 13. Check speaking related_sentence_id -> sentences
speaking_all = load_json(os.path.join(BASE, 'speaking_days31_45.json')) + \
               load_json(os.path.join(BASE, 'speaking_days46_90.json'))
print("--- Checking speaking.related_sentence_id -> sentences ---")
for item in speaking_all:
    sid = item.get('related_sentence_id', '')
    if sid and sid not in sentence_ids:
        issues.append(f"[speaking] {item['id']}: related_sentence_id '{sid}' NOT FOUND")

# 14. Check grammar slot vocab_ids -> vocab
print("--- Checking grammar.slots[].vocab_id -> vocab ---")
for g in all_grammar:
    for slot in g.get('slots', []):
        for val in slot.get('values', []):
            vid = val.get('vocab_id', '')
            if vid and vid not in vocab_ids:
                issues.append(f"[grammar] {g['id']}: vocab_id '{vid}' in slots NOT FOUND")

print(f"\n{'='*60}")
print(f"TOTAL CROSS-REFERENCE ISSUES: {len(issues)}")
print(f"{'='*60}")

if issues:
    print("\n--- ALL ISSUES ---")
    for i in issues[:50]:
        print(f"  {i}")
    if len(issues) > 50:
        print(f"  ... and {len(issues) - 50} more")
else:
    print("\nALL CROSS-REFERENCES VALID! No broken links found.")
