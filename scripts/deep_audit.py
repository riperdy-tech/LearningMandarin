#!/usr/bin/env python3
"""
COMPREHENSIVE AUDIT: Check all data files for quality issues.
"""
import json
import os
import re
from collections import defaultdict

BASE = r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data'
ISSUES = []

def issue(severity, file_name, detail):
    ISSUES.append((severity, file_name, detail))

def has_chinese_in_ascii_field(text):
    """Check if a field that should be ASCII/pinyin has Chinese characters."""
    if not text:
        return False
    for c in text:
        if '\u4e00' <= c <= '\u9fff' or '\u3400' <= c <= '\u4dbf':
            return True
    return False

def is_garbage_translation(text):
    """Check for known garbage patterns in translations."""
    if not text:
        return False
    garbage = [
        'Today is very old', 'He goes book', 'I have liked food before',
        'Can I want', 'He goes water', 'I have went water before',
        'He goes money', 'What do you think of money', 'I had.',
        'Did you have?', 'This is very old', 'I have went',
        '가다했습니까', '가다합니다', '좋아하다한', '말하다했습니다',
        '원하다할', '낡다니다', '있다했습니다', '있다했습니까',
        '물을/를 가다', '책을/를 가다', '돈은/는', '음식을/를 좋아하다',
        '오늘은 매우 낡다', '저는 말하다', '그는 책을',
    ]
    return any(g in text for g in garbage)

def is_placeholder(text):
    """Check for placeholder text."""
    placeholders = ['see reference', 'Use the on-page animation', 'StrokeOrder link']
    return any(p in text for p in placeholders)

# ============================================================
# 1. AUDIT ALL JSON FILES
# ============================================================
print("=" * 60)
print("AUDIT 1: All data files - garbage detection")
print("=" * 60)

json_files = sorted([f for f in os.listdir(BASE) if f.endswith('.json')])
print(f"Found {len(json_files)} JSON files")

for fname in json_files:
    fpath = os.path.join(BASE, fname)
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        issue('CRITICAL', fname, f"Failed to parse JSON: {e}")
        continue

    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        items = [data]
    else:
        continue

    # Check each item
    for i, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        item_id = item.get('id', f'item[{i}]')

        # Check pinyin fields for Chinese characters (these should be ASCII)
        for pinyin_field in ['pinyin', 'pinyin_numeric', 'model_pinyin']:
            val = item.get(pinyin_field, '')
            if not val:
                continue
            if has_chinese_in_ascii_field(val):
                issue('CRITICAL', fname, f"{item_id}: Chinese chars in '{pinyin_field}': {str(val)[:60]}")

        # Check translation fields for garbage
        for trans_field in ['translation_en', 'translation_ko', 'model_translation_en', 'meaning_en', 'meaning_ko']:
            val = item.get(trans_field, '')
            if not val:
                continue
            if is_garbage_translation(str(val)):
                issue('CRITICAL', fname, f"{item_id}: Garbage in '{trans_field}': {str(val)[:60]}")

        # Check for placeholder text (skip text fields that should have Chinese)
        skip_placeholder_check = {'text', 'char', 'pattern', 'structure', 'model_answer', 'slots'}
        for key in item:
            if key in skip_placeholder_check:
                continue
            val = item[key]
            if val is None:
                continue
            if isinstance(val, str) and is_placeholder(val):
                issue('WARN', fname, f"{item_id}: Placeholder in '{key}': {val[:60]}")
            elif isinstance(val, list):
                for v in val:
                    if isinstance(v, str) and is_placeholder(v):
                        issue('WARN', fname, f"{item_id}: Placeholder in '{key}[]': {v[:60]}")

        # Check stroke_count = 0
        if item.get('stroke_count') == 0:
            issue('WARN', fname, f"{item_id}: stroke_count is 0")
        
        # Check radical = "see reference"
        if item.get('radical') == 'see reference':
            issue('WARN', fname, f"{item_id}: radical is placeholder")

        # Check empty required fields
        for req_field in ['id', 'char', 'text', 'pattern']:
            if req_field in item and not item[req_field]:
                issue('WARN', fname, f"{item_id}: Empty '{req_field}'")

        # Check nested structures (turns in dialogues, tasks in assessment)
        for nested_key, nested_fields in [('turns', ['pinyin', 'translation_en']), 
                                           ('tasks', ['prompt_en'])]:
            nested = item.get(nested_key, [])
            if not isinstance(nested, list):
                continue
            for j, nested_item in enumerate(nested):
                if not isinstance(nested_item, dict):
                    continue
                for nf in nested_fields:
                    val = nested_item.get(nf, '')
                    if not val:
                        continue
                    if nf == 'pinyin' and has_chinese_in_ascii_field(str(val)):
                        issue('CRITICAL', fname, f"{item_id}.{nested_key}[{j}]: Chinese chars in '{nf}'")
                    if is_garbage_translation(str(val)):
                        issue('CRITICAL', fname, f"{item_id}.{nested_key}[{j}]: Garbage in '{nf}'")

print(f"\nFound {len(ISSUES)} issues")

# Print summary by severity
critical = [i for i in ISSUES if i[0] == 'CRITICAL']
warnings = [i for i in ISSUES if i[0] == 'WARN']
print(f"  CRITICAL: {len(critical)}")
print(f"  WARNINGS: {len(warnings)}")

if critical:
    print("\n--- CRITICAL ISSUES ---")
    for sev, fname, detail in critical[:30]:
        print(f"  [{fname}] {detail}")
    if len(critical) > 30:
        print(f"  ... and {len(critical) - 30} more")

if warnings:
    print("\n--- WARNINGS ---")
    for sev, fname, detail in warnings[:20]:
        print(f"  [{fname}] {detail}")
    if len(warnings) > 20:
        print(f"  ... and {len(warnings) - 20} more")
