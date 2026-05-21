import json
data = json.load(open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\writing_days46_90.json', 'r', encoding='utf-8'))
print(f'Total entries: {len(data)}')
chars = [d['char'] for d in data]
unique = list(set(chars))
print(f'Unique characters: {len(unique)}')
print(f'All stroke_count=0: {all(d["stroke_count"]==0 for d in data)}')
print(f'Sample chars: {unique[:20]}')
