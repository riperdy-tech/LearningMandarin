import json

with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\vocab_days31_45.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Original count: {len(data)}")

# Deduplicate by ID
seen = set()
deduped = []
for item in data:
    vid = item['id']
    if vid not in seen:
        seen.add(vid)
        deduped.append(item)

print(f"Deduped count: {len(deduped)}")
print(f"Removed {len(data) - len(deduped)} duplicates")

with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\vocab_days31_45.json', 'w', encoding='utf-8') as f:
    json.dump(deduped, f, ensure_ascii=False, indent=2)

print("Written deduped vocab_days31_45.json")
