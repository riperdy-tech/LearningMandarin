import json

with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\writing_days46_90.json', 'r', encoding='utf-8') as f:
    writing = json.load(f)

# Fix last 2
EXTRA = {'划': (6, '刂'), '傷': (13, '亻')}

for item in writing:
    if item['char'] in EXTRA:
        sc, rad = EXTRA[item['char']]
        item['stroke_count'] = sc
        item['radical'] = rad
        item['strokes'] = [f"Stroke order: {sc} strokes, radical: {rad}. Visit strokeorder.com for animation."]

with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\writing_days46_90.json', 'w', encoding='utf-8') as f:
    json.dump(writing, f, ensure_ascii=False, indent=2)

# Verify
still = sum(1 for d in writing if d['stroke_count'] == 0 or d['radical'] == 'see reference')
print(f"Still broken: {still}")
