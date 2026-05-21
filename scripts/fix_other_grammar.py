#!/usr/bin/env python3
"""Fix generic English drills in grammar_month1.json and grammar_days31_45.json"""
import json

# Month 1 grammar drill fixes
M1_DRILLS = {
    "GR_M1_D01": {
        "transform": ["用 '我是___' 自我介紹", "用 '我叫___' 說你的名字", "問 '你是___嗎？'"],
        "produce": ["自我介紹給新朋友", "'你好，我是___，我叫___'"],
        "errors": ["說 '我學生' 忘了 '是'", "'嗎' 放在句首"],
        "repair": {"word_order": "主語 + 是 + 身分", "question": "加 '嗎' 在句尾變問句"}
    },
    "GR_M1_D02": {
        "transform": ["用 '我是___人' 說國籍", "問 '你是哪國人？'"],
        "produce": ["說你是哪國人", "'我是___人'"],
        "errors": ["忘了 '人'", "'哪國' 和 '什麼國' 混淆"],
        "repair": {"word_order": "我是 + 國名 + 人"}
    },
    "GR_M1_D03": {
        "transform": ["用 '我住在___' 說住處", "問 '你住在哪裡？'"],
        "produce": ["跟新朋友說你住哪裡", "'我住在___'"],
        "errors": ["說 '我住台北' 忘了 '在'", "'住在' 和 '住' 用法混淆"],
        "repair": {"word_order": "住在 + 地方"}
    },
    "GR_M1_D04": {
        "transform": ["用 '我喜歡___' 說喜好", "問 '你喜歡___嗎？'"],
        "produce": ["說你喜歡的台灣食物", "'我喜歡___，很好吃'"],
        "errors": ["'喜歡' 放在受詞後面", "回答 '喜歡' 不加 '很'"],
        "repair": {"word_order": "主語 + 喜歡 + 名詞"}
    },
}

# Days 31-45 grammar drill fixes  
D3145_DRILLS = {
    "GR_D31_CAN_REQUEST": {
        "transform": ["把 '我要咖啡' 改成 '可以給我一杯咖啡嗎？'", "用 '可以...嗎？' 點三種飲料"],
        "produce": ["在咖啡店禮貌點餐", "'你好，可以___嗎？'"],
        "errors": ["'嗎' 忘了放在句尾", "用 '要' 而非 '可以' 太直接"],
        "repair": {"word_order": "可以 + 動詞 + 受詞 + 嗎？", "politeness": "'可以...嗎？' 是台灣最常用的禮貌請求"}
    },
    "GR_D31_WANT_OBJECT": {
        "transform": ["用 '想要' 點三種飲料", "把 '我要' 改成 '我想要'"],
        "produce": ["在咖啡店說你想要什麼", "'我想要___'"],
        "errors": ["'想要' 後面加 '嗎'", "正式場合用 '要' 太直接"],
        "repair": {"word_order": "想要 + 名詞", "vs_yao": "'想要'=would like (softer)，'要'=want"}
    },
    "GR_D31_POLITE_SOFTENER": {
        "transform": ["在請求前加 '不好意思'", "用 '麻煩你' 替代 '不好意思'"],
        "produce": ["在商店禮貌地問價錢", "'不好意思，請問___？'"],
        "errors": ["'不好意思' 放在句尾", "道歉用 '不好意思' 而非 '對不起'"],
        "repair": {"word_order": "不好意思 + 請求", "vs_duibuqi": "'不好意思'=excuse me，'對不起'=sorry"}
    },
}

# Generic fallback (Chinese-focused)
GENERIC_DRILLS = {
    "transform": ["用這個句型造句", "把陳述句改成問句"],
    "produce": ["用這個句型說你自己的經驗"],
    "errors": ["詞序錯誤"],
    "repair": {"word_order": "注意詞序"}
}

def fix_file(filepath, drill_map, label):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    fixed = 0
    for entry in data:
        gid = entry.get('id', '')
        drills = drill_map.get(gid, GENERIC_DRILLS)
        
        # Only fix if drills look generic (English boilerplate)
        current_transform = entry.get('transformation_drills', [])
        current_produce = entry.get('production_drills', [])
        
        is_generic = any(
            g in ' '.join(current_transform + current_produce)
            for g in ['Change the subject', 'Add a time expression', 'Turn this into',
                       'Use this pattern in', 'Ask a follow-up', 'Give a reason']
        )
        
        if is_generic or gid in drill_map:
            entry['transformation_drills'] = drills['transform']
            entry['production_drills'] = drills['produce']
            entry['common_error_patterns'] = drills['errors']
            if 'repair' in drills:
                entry['repair_feedback'] = drills['repair']
            
            # Trim examples
            if len(entry.get('correct_examples', [])) > 4:
                entry['correct_examples'] = entry['correct_examples'][:4]
            if len(entry.get('drill_examples', [])) > 3:
                entry['drill_examples'] = entry['drill_examples'][:3]
            fixed += 1
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    size = len(json.dumps(data, ensure_ascii=False))
    print(f"{label}: fixed {fixed}/{len(data)} entries, {size/1024:.0f} KB")

fix_file(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\grammar_month1.json', M1_DRILLS, 'grammar_month1')
fix_file(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\grammar_days31_45.json', D3145_DRILLS, 'grammar_days31_45')
