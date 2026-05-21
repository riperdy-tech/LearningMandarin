import json

with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\lessons\lessons_days46_90.json', 'r', encoding='utf-8') as f:
    lessons = json.load(f)
with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\grammar_days46_90.json', 'r', encoding='utf-8') as f:
    grammar = json.load(f)

grammar_ids = set(g['id'] for g in grammar)
missing = []
for lesson in lessons:
    for gid in lesson.get('grammar_ids', []):
        if gid not in grammar_ids:
            missing.append(f"Day {lesson['order']}: {gid}")

if missing:
    print('MISSING grammar IDs:')
    for m in missing:
        print(f'  {m}')
else:
    print('ALL grammar IDs from lessons are present in grammar file!')

referenced = set()
for lesson in lessons:
    for gid in lesson.get('grammar_ids', []):
        referenced.add(gid)

unreferenced = grammar_ids - referenced
if unreferenced:
    print('\nUNREFERENCED grammar IDs (not in any lesson):')
    for gid in sorted(unreferenced):
        print(f'  {gid}')
else:
    print('\nAll grammar IDs are referenced by at least one lesson!')
