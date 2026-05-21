#!/usr/bin/env python3
"""
COMPRESS & FIX: Slim down grammar entries for 1-hour sessions.
- Max 3-4 correct_examples per entry
- Max 2-3 drill_examples per entry
- Specific Chinese-focused transformation/production drills
- Real, pattern-specific common errors and repair feedback
- Remove filler/boilerplate
"""
import json

with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\grammar_days46_90.json', 'r', encoding='utf-8') as f:
    grammar = json.load(f)

# Pattern-specific drill templates (replace generic ones)
DRILL_MAP = {
    # Day 46: Completed actions
    "GR_D46_COMPLETED_LE": {
        "transform": ["說 '我昨天買菜了' 換成 '看電影'", "把 '他煮飯了' 改成問句"],
        "produce": ["用 '了' 說出你昨天做的三件事", "問朋友昨天做了什麼"],
        "errors": ["把 '了' 放在動詞前面", "忘了在句尾加 '了'"],
        "repair": {"word_order": "動詞 + 受詞 + 了，不是 了 + 動詞", "missing_le": "說過去完成的事要加 '了'"}
    },
    "GR_D46_YESTERDAY_TIME": {
        "transform": ["把 '我昨天買菜了' 的時間詞換成 '上個禮拜'", "把時間詞移到句尾並修正"],
        "produce": ["用 '昨天' 造句描述你做的事", "用 '上個禮拜' 造句"],
        "errors": ["把時間詞放在句尾（英文習慣）", "時間詞和動詞位置顛倒"],
        "repair": {"word_order": "時間詞在動詞前面，如 '我昨天...'", "english_interference": "不要像英文把 yesterday 放句尾"}
    },
    "GR_D46_VERB_OBJECT_LE": {
        "transform": ["把 '我昨天買菜了' 換受詞為 '看書'", "用 '了' 說三種不同的動作"],
        "produce": ["說出你今天早上完成的三件事", "用 '了' 說一個完整的一天"],
        "errors": ["受詞太長時忘了加 '了'", "否定句誤加 '了'"],
        "repair": {"word_order": "時間 + 動詞 + 受詞 + 了", "negation": "否定過去用 '沒有'，不加 '了'"}
    },

    # Day 47: Sequencing
    "GR_D47_RANHOU": {
        "transform": ["把兩個獨立句子用 '然後' 連接", "說出一個三步驟的順序"],
        "produce": ["用 '然後' 說出你今天的計畫", "告訴朋友怎麼從捷運站走到你家"],
        "errors": ["'然後' 前面忘了逗號", "一連串的 '然後' 太多"],
        "repair": {"word_order": "句子A，然後句子B", "overuse": "不要每句都用 '然後'"}
    },
    "GR_D47_XIAN_RANHOU": {
        "transform": ["把 '看書，然後聽音樂' 改成 '先...然後...'", "描述做菜的順序"],
        "produce": ["用 '先...然後...' 說出你早上的習慣", "教朋友你國家的一道菜的做法"],
        "errors": ["'先' 放在動詞後面", "忘了 '先' 對應的 '然後'"],
        "repair": {"word_order": "先 + 動作1，然後 + 動作2", "pairing": "'先' 和 '然後' 是配對使用的"}
    },
    "GR_D47_LE_POSITION_REVIEW": {
        "transform": ["在連續動作中正確放置 '了'", "描述昨天一連串發生的事"],
        "produce": ["用 '了' + '然後' 說出你上週末做的事"],
        "errors": ["每個動詞都加 '了'", "'了' 放在 '然後' 前面"],
        "repair": {"word_order": "'了' 在每個完成動作的句尾", "sequence": "做了A（了），然後做了B（了）"}
    },

    # Day 48: Experience
    "GR_D48_GUO_EXPERIENCE": {
        "transform": ["把 '我去台北' 改成經驗說法", "問朋友 '你去過...嗎？' 五個地方"],
        "produce": ["用 '過' 說三個你去過的地方", "說一個你吃過最好吃的台灣食物"],
        "errors": ["把 '過' 和 '了' 混用", "'過' 放在受詞後面"],
        "repair": {"word_order": "動詞 + 過 + 受詞", "vs_le": "'過'=經驗，'了'=完成，不一樣"}
    },
    "GR_D48_MEIYOU_GUO": {
        "transform": ["把 '我去過' 改成否定 '從來沒有...過'", "問朋友沒做過什麼事"],
        "produce": ["用 '從來沒有...過' 說三件你沒做過的事", "說一個台灣人常做但你沒做過的事"],
        "errors": ["只用 '沒有' 而忘了 '過'", "'從來沒有' 後面忘了 '過'"],
        "repair": {"word_order": "從來 + 沒有 + 動詞 + 過 + 受詞", "missing_guo": "'從來沒有' 後面一定要有 '過'"}
    },
    "GR_D48_YI_QIAN": {
        "transform": ["把 '我去過台北' 加上 '以前'", "把 '以前' 從句首移到主語後面"],
        "produce": ["用 '以前' 說一個你以前住的國家或城市", "說一個你以前常做但現在不做的事"],
        "errors": ["'以前' 放在動詞後面", "混淆 '以前' 和 '已經'"],
        "repair": {"word_order": "以前 + 句子 / 主語 + 以前 + 動詞", "vs_yijing": "'以前'=before，'已經'=already"}
    },

    # Day 49: Progressive
    "GR_D49_ZAI_PROGRESSIVE": {
        "transform": ["把 '我看書' 改成進行式", "描述畫面中的人在做什麼"],
        "produce": ["用 '在' 說你現在正在做什麼", "打電話時說 '我在...' 解釋為何不能講話"],
        "errors": ["用 '是' 表進行", "在形容詞前加 '在'"],
        "repair": {"word_order": "主語 + 在 + 動詞 + 受詞", "not_shi": "不是 '我是吃飯'，而是 '我在吃飯'"}
    },
    "GR_D49_ZHENGZAI": {
        "transform": ["把 '我在吃飯' 改成 '正在' 強調", "加上 '呢' 讓語氣更自然"],
        "produce": ["用 '正在...呢' 說你正在做什麼", "解釋為什麼現在不能出門"],
        "errors": ["'正在' 用於習慣性動作", "'正在' 後面加形容詞"],
        "repair": {"word_order": "主語 + 正在 + 動詞 + 受詞 + 呢", "habitual": "'正在' 只能用在說話的當下"}
    },
    "GR_D49_NOW_BUSY": {
        "transform": ["把 '他很忙' 加上 '現在'", "用 '現在在' 描述正在做的事"],
        "produce": ["用 '現在' 說你今天的心情和在做的事", "解釋為何現在不能聊天"],
        "errors": ["'現在' 放在動詞後面", "混淆 '現在' 和 '正在'"],
        "repair": {"word_order": "現在 + 在 + 動詞", "vs_zhengzai": "'現在'=now，'正在'=in the middle of"}
    },

    # Day 50: Ability
    "GR_D50_HUI_ABILITY": {
        "transform": ["把 '我說中文' 改成能力說法", "問朋友 '你會...嗎？' 五個技能"],
        "produce": ["用 '會' 說三個你會做的事", "說你會做什麼台灣菜"],
        "errors": ["用 '可以' 表能力", "'會' 放在受詞後面"],
        "repair": {"word_order": "主語 + 會 + 動詞 + 受詞", "vs_keyi": "'會'=技能，'可以'=允許"}
    },
    "GR_D50_BU_HUI": {
        "transform": ["把 '我會游泳' 改成否定", "說三件你 '不太會' 的事"],
        "produce": ["用 '不會' 說三件你做不到的事", "說 '我不會...可是我會...'"],
        "errors": ["用 '不能' 代替 '不會'", "把 '不' 放在動詞後面"],
        "repair": {"word_order": "主語 + 不 + 會 + 動詞", "vs_buneng": "'不會'=沒技能，'不能'=沒能力/不允許"}
    },
    "GR_D50_HAI_BU_TAI": {
        "transform": ["把 '我不會說中文' 改成比較客氣的說法", "說 '還不太' + 三種不同的技能"],
        "produce": ["用 '還不太會' 說你的中文程度", "說一個你在學但還不太好的技能"],
        "errors": ["把 '還' 放在 '不太' 後面", "對完全不會的事說 '還不太會'"],
        "repair": {"word_order": "還 + 不太 + 會 + 動詞", "usage": "有點會但不好才用 '還不太會'"}
    },

    # Day 51-52: Modifiers & Comparisons
    "GR_D51_DE_MODIFIER": {
        "transform": ["把 '紅色衣服' 改成 '紅色的衣服'", "描述 '穿紅色衣服的人'"],
        "produce": ["用 '的' 描述你最喜歡的餐廳", "'我最喜歡的___是___'"],
        "errors": ["簡單形容詞加 '的' 太囉嗦", "'的' 放在名詞後面"],
        "repair": {"word_order": "修飾語 + 的 + 名詞", "simple_adj": "單音節形容詞加單音節名詞不用 '的'"}
    },
    "GR_D51_HEN_ADJ": {
        "transform": ["把 '這好吃' 改成自然的說法", "用 '很' 描述三種食物"],
        "produce": ["用 '很' 描述今天的天氣和心情", "'台灣的___很___'"],
        "errors": ["加 '是' 在形容詞前", "忘了加 '很'"],
        "repair": {"word_order": "主語 + 很 + 形容詞", "no_shi": "不要說 '我是很好'，說 '我很好'"}
    },
    "GR_D51_NA_GE_REN": {
        "transform": ["描述 '那個人' 的特徵", "用 '那個' + 量詞 + 名詞 + 的 + 描述"],
        "produce": ["描述教室裡的一個人讓朋友猜", "說 '那個在___的人是我的___'"],
        "errors": ["忘了量詞", "'的' 位置錯誤"],
        "repair": {"word_order": "那 + 量詞 + 名詞 + 的 + 描述", "measure_word": "一定要有量詞"}
    },
    "GR_D52_BI_COMPARISON": {
        "transform": ["用 '比' 比較兩種交通工具", "說 'A比B + 形容詞'"],
        "produce": ["比較台灣和你的國家的食物", "比較兩家你喜歡的餐廳"],
        "errors": ["形容詞前加 '很'", "'比' 放在形容詞後面"],
        "repair": {"word_order": "A + 比 + B + 形容詞", "no_hen": "'比' 後面不加 '很'"}
    },
    "GR_D52_BIJIAO": {
        "transform": ["把 '這個好' 改成比較的說法", "用 '比較' 比較兩種飲料"],
        "produce": ["用 '比較' 建議朋友買哪一個", "說 '我覺得___比較___'"],
        "errors": ["'比較' 放錯位置", "'比' 和 '比較' 重複使用"],
        "repair": {"word_order": "主語 + 比較 + 形容詞", "vs_bi": "'比' + B + adj，'比較' + adj"}
    },
    "GR_D52_MEIYOU_COMPARISON": {
        "transform": ["把 '公車比捷運慢' 改成否定比較", "說 'A沒有B那麼___'"],
        "produce": ["用 '沒有...那麼...' 比較兩個城市", "說一個東西沒有你想像的那麼貴"],
        "errors": ["用 '不比' 代替 '沒有'", "忘了 '那麼'"],
        "repair": {"word_order": "A + 沒有 + B + 那麼 + 形容詞", "vs_bubi": "'沒有'=not as，'不比'=not more than"}
    },

    # Day 53: Frequency
    "GR_D53_CHANGCHANG": {
        "transform": ["說你 '常常' 做的事（換不同動詞）", "用 '常常' 和 '不常' 對比"],
        "produce": ["用 '常常' 說你的週末習慣", "'我常常去___，因為___'"],
        "errors": ["'常常' 放在句尾", "混淆 '常常' 和 '平常'"],
        "repair": {"word_order": "主語 + 常常 + 動詞", "vs_pingchang": "'常常'=often，'平常'=usually/ordinarily"}
    },
    "GR_D53_YOU_SHIHOU": {
        "transform": ["用 '有時候' 替代 '常常'", "說 '有時候...有時候...'"],
        "produce": ["用 '有時候' 說你偶爾做的事", "'有時候我覺得___，有時候___'"],
        "errors": ["'有時候' 放在動詞後面", "用 '有時' 和 '有時候' 混淆"],
        "repair": {"word_order": "有時候 + 句子 / 主語 + 有時候 + 動詞"}
    },
    "GR_D53_XIHUAN_VERB_OBJECT": {
        "transform": ["用 '喜歡' 說三種不同的嗜好", "問朋友 '你喜歡___嗎？'"],
        "produce": ["用 '喜歡' 說你喜歡的台灣食物", "'我喜歡___，可是我不喜歡___'"],
        "errors": ["'喜歡' 後面加 '了'", "'喜歡' 放在受詞後面"],
        "repair": {"word_order": "主語 + 喜歡 + 動詞 + 受詞", "no_le": "'喜歡' 是持續的，不加 '了'"}
    },

    # Day 54: Suggestions
    "GR_D54_YAOBUYAO": {
        "transform": ["把 '你去嗎？' 改成 '要不要' 的問法", "用 '要不要' 邀請朋友做三件事"],
        "produce": ["用 '要不要' 約朋友吃飯", "'要不要一起___？'"],
        "errors": ["'要不要' 放在動詞後面", "對長輩用 '要不要' 太隨便"],
        "repair": {"word_order": "要不要 + 動詞？", "formality": "正式場合改用 '要不要一起...呢？'"}
    },
    "GR_D54_GAI_TIME": {
        "transform": ["說 '該___了' 表示時間到了（換不同動詞）", "用 '該' 提醒朋友"],
        "produce": ["用 '該...了' 說你今天應該做的事", "'已經X點了，該___了'"],
        "errors": ["忘了句尾的 '了'", "'該' 和 '應該' 混淆"],
        "repair": {"word_order": "該 + 動詞 + 了", "vs_yinggai": "'該...了'=it's time，'應該'=should"}
    },
    "GR_D54_BUHAOYISI": {
        "transform": ["用 '不好意思' 開頭請求幫助", "把直接的請求改成 '不好意思' 開頭"],
        "produce": ["用 '不好意思' 問路", "'不好意思，請問___怎麼走？'"],
        "errors": ["把 '不好意思' 放在句尾", "道歉用 '不好意思' 而非 '對不起'"],
        "repair": {"word_order": "不好意思，+ 請求", "vs_duibuqi": "'不好意思'=excuse me，'對不起'=I'm sorry"}
    },

    # Day 56: Health
    "GR_D56_BODY_HURTS": {
        "transform": ["用 '不舒服' 說三個身體部位的不適", "用 '痛' 說哪裡痛"],
        "produce": ["跟醫生說你哪裡不舒服", "'我___痛'，'我___不舒服'"],
        "errors": ["用 '是' 描述症狀", "'痛' 和 '不舒服' 用錯地方"],
        "repair": {"word_order": "身體部位 + 痛 / 不舒服", "no_shi": "不要說 '我是頭痛'"}
    },
    "GR_D56_YOU_DIAN_SYMPTOM": {
        "transform": ["把 '我很累' 用 '有點' 軟化", "用 '有點' 描述三個症狀"],
        "produce": ["用 '有點' 跟朋友說你不太舒服", "'我今天有點___，可能___'"],
        "errors": ["'有點' 用於正面形容詞", "'有點' 放在名詞前面"],
        "repair": {"word_order": "有點 + 形容詞（通常是負面的）", "positive_adj": "'有點好吃' 不對，用 '還不錯'"}
    },
    "GR_D56_JI_TIAN": {
        "transform": ["問 '幾天' 表示 'how many days'", "用 '幾天' 說 'a few days'"],
        "produce": ["說你感冒幾天了", "'我已經___了___天了'"],
        "errors": ["忘了量詞直接用 '幾'", "'幾天' 的問句和直述語調混淆"],
        "repair": {"word_order": "幾 + 量詞 + 名詞", "question_vs_statement": "語調上升=問句，下降=直述"}
    },

    # Day 57: Medicine
    "GR_D57_YAO_MEDICINE": {
        "transform": ["用 '要' 說你需要什麼藥", "用 '要' 說你需要看醫生"],
        "produce": ["在藥局說你要買什麼", "'我要買___'，'我要看___'"],
        "errors": ["在藥局用 '想' 而不用 '要'", "'要' 和 '需要' 混淆"],
        "repair": {"word_order": "我要 + 動詞 + 受詞", "vs_xiang": "買東西時 '要' 比 '想' 更直接合適"}
    },
    "GR_D57_MEI_TIAN_TIMES": {
        "transform": ["說 '一天三次' 用不同的數字", "問 '一天幾次？'"],
        "produce": ["說你一天吃幾次藥", "'這個藥一天___次'"],
        "errors": ["量詞用錯", "'次' 放在時間詞前面"],
        "repair": {"word_order": "一天 + 數字 + 次", "measure": "'次'=occurrences，'遍'=complete times"}
    },
    "GR_D57_KEYI_BUKEYI_MEDICAL": {
        "transform": ["用 '可以...嗎？' 問用藥問題", "把 '可以' 改成 '可不可以'"],
        "produce": ["問藥師 '可以跟飯一起吃嗎？'", "'可以___嗎？' 問三個醫療問題"],
        "errors": ["用 '會' 問可行性", "'可以' 放在受詞後面"],
        "repair": {"word_order": "可以 + 動詞 + 受詞 + 嗎？", "vs_hui": "'可以'=allowed/possible，'會'=ability"}
    },

    # Day 58: Facilities
    "GR_D58_YOU_FACILITY": {
        "transform": ["說三個地方 '有' 什麼設施", "用 '沒有' 說缺少什麼"],
        "produce": ["問咖啡店有沒有WiFi", "'這裡有___嗎？'"],
        "errors": ["用 '是' 表示存在", "'有' 放在地方前面"],
        "repair": {"word_order": "地方 + 有 + 東西", "vs_shi": "'有'=has/there is，'是'=is/identity"}
    },
    "GR_D58_LOCATION_EXISTENCE": {
        "transform": ["用 '在...有' 描述位置", "描述捷運站附近有什麼"],
        "produce": ["告訴朋友醫院旁邊有什麼", "'在___附近有___'"],
        "errors": ["'在' 和 '有' 位置顛倒", "少了 '在' 意思不清"],
        "repair": {"word_order": "在 + 地方 + 有 + 東西"}
    },
    "GR_D58_BROKEN": {
        "transform": ["用 '壞了' 說三個不能用的東西", "用 '不能用' 替代 '壞了'"],
        "produce": ["跟房東說冷氣壞了", "'___壞了，可以幫我___嗎？'"],
        "errors": ["用 '破了' 說機器故障", "'壞了' 放在主語前面"],
        "repair": {"word_order": "東西 + 壞了 / 不能用了", "vs_pole": "'壞了'=broken，'破了'=torn/punctured"}
    },

    # Day 59: Help
    "GR_D59_QING_HELP": {
        "transform": ["用 '請' 和 '麻煩你' 請求幫忙", "把直接的句子改成禮貌請求"],
        "produce": ["用 '麻煩你' 請店員幫忙", "'不好意思，麻煩你___'"],
        "errors": ["只用 '請' 但沒說要做什麼", "'麻煩你' 和 '謝謝' 一起用"],
        "repair": {"word_order": "請/麻煩你 + 動詞 + 受詞", "politeness": "'麻煩你' 比 '請' 更有禮貌"}
    },
    "GR_D59_SHENME_SHIHOU_KEYI": {
        "transform": ["問三個不同服務的 '什麼時候可以'", "用 '什麼時候比較好' 問時間"],
        "produce": ["問醫生什麼時候可以看診", "'我什麼時候可以___？'"],
        "errors": ["'什麼時候' 和 '幾點' 不分", "'什麼時候' 放在動詞後面"],
        "repair": {"word_order": "什麼時候 + 可以 + 動詞？", "vs_jidian": "'什麼時候'=when (general)，'幾點'=what time"}
    },
    "GR_D59_MAYBE_PROBLEM": {
        "transform": ["用 '可能' 說不確定的事", "用 '也許' 替代 '可能'"],
        "produce": ["用 '可能' 委婉拒絕", "'我可能沒辦法___'"],
        "errors": ["'可能' 和 '可以' 混淆", "'可能' 放在動詞後面"],
        "repair": {"word_order": "可能 + 句子", "vs_keyi": "'可能'=maybe，'可以'=can"}
    },

    # Day 61: Cause & Result
    "GR_D61_FASHENG": {
        "transform": ["用 '發生' 描述一個意外", "問 '發生了什麼事？'"],
        "produce": ["說昨天發生了一件有趣的事", "'昨天發生了___'"],
        "errors": ["'發生' 用於計畫好的事", "忘了加 '了'"],
        "repair": {"word_order": "發生了 + 事情 / 事情 + 發生了", "usage": "'發生'=happen unexpectedly"}
    },
    "GR_D61_JIEGUO": {
        "transform": ["用 '結果' 連接原因和結果", "說一個意想不到的 '結果'"],
        "produce": ["說一個計畫改變的故事", "'我本來___，結果___'"],
        "errors": ["'結果' 用於預期的結果", "混淆 '結果' 和 '所以'"],
        "repair": {"word_order": "句子，結果 + 結果", "vs_suoyi": "'結果'=as it turned out，'所以'=therefore"}
    },
    "GR_D61_YINWEI_SUOYI_REPAIR": {
        "transform": ["用 '因為...所以...' 解釋原因", "只用 '所以' 不用 '因為'"],
        "produce": ["解釋為什麼昨天沒來", "'因為___，所以___'"],
        "errors": ["'所以' 放在 '因為' 前面", "口語中只用 '因為' 忘了 '所以'"],
        "repair": {"word_order": "因為 + 原因，所以 + 結果"}
    },

    # Day 62: Help request
    "GR_D62_BANG_WO": {
        "transform": ["用 '幫我' 請求三種不同的幫助", "用 '幫你' 主動提供幫助"],
        "produce": ["請朋友幫你拿東西", "'可以幫我___嗎？'"],
        "errors": ["'幫' 和 '給' 混淆", "'幫我' 放在動詞後面"],
        "repair": {"word_order": "幫 + 人 + 動詞 + 受詞", "vs_gei": "'幫'=help/for，'給'=give"}
    },
    "GR_D62_XUYAO": {
        "transform": ["用 '需要' 說你需要什麼", "用 '需要幫忙嗎？' 主動問"],
        "produce": ["說你需要什麼幫助", "'我需要___，你可以___嗎？'"],
        "errors": ["'需要' 用於小事情太正式", "'需要' 後面直接加動詞忘了 '要'"],
        "repair": {"word_order": "需要 + 名詞/動詞", "formality": "需要比想要更正式"}
    },
    "GR_D62_KE_BI_KE_YI_HELP": {
        "transform": ["把 '幫我' 改成 '可以幫我...嗎？'", "用 '可不可以幫我' 替代 '可以幫我'"],
        "produce": ["用最禮貌的方式請求陌生人幫忙", "'不好意思，可以幫我___嗎？'"],
        "errors": ["忘了 '嗎'", "'可以' 放在 '幫我' 後面"],
        "repair": {"word_order": "可以 + 幫我 + 動詞 + 嗎？"}
    },

    # Day 63: Problems
    "GR_D63_XIANG_RETURN": {
        "transform": ["用 '想' 說三個你想做的事", "把 '要' 改成 '想' 更禮貌"],
        "produce": ["用 '想' 說你想去的地方", "'我想___，可是___'"],
        "errors": ["'想' 和 '要' 的心理強度不分", "'想' 放在受詞後面"],
        "repair": {"word_order": "主語 + 想 + 動詞", "vs_yao": "'想'=would like，'要'=want/need"}
    },
    "GR_D63_YOU_WENTI": {
        "transform": ["用 '有問題' 指出三個不同的問題", "軟化為 '有點問題'"],
        "produce": ["跟店員說產品有問題", "'這個有問題，可以___嗎？'"],
        "errors": ["用 '有問題' 直接說人（不禮貌）", "'有問題' 放在主語前面"],
        "repair": {"word_order": "東西 + 有問題", "politeness": "說人有問題不禮貌，說事情有問題OK"}
    },
    "GR_D63_KEBUKEYI_CHANGE": {
        "transform": ["用 '可以換嗎？' 要求換貨", "說 '我想換' + 三種不同的東西"],
        "produce": ["在商店說要換尺寸", "'可以換___嗎？'"],
        "errors": ["用 '改' 而非 '換'", "'換' 放在受詞後面"],
        "repair": {"word_order": "可以 + 換 + 受詞 + 嗎？", "vs_gai": "'換'=exchange，'改'=change/modify"}
    },

    # Day 64: Appointments
    "GR_D64_YUYUE": {
        "transform": ["用 '預約' 說你預約了什麼", "問 '我需要預約嗎？'"],
        "produce": ["打電話預約看牙醫", "'我想預約___'"],
        "errors": ["用 '訂' 而非 '預約'", "忘了加 '了' 表示已預約"],
        "repair": {"word_order": "預約 + 了 + 時間", "vs_ding": "'預約'=reserve time，'訂'=order/buy"}
    },
    "GR_D64_GAI_SHIJIAN": {
        "transform": ["用 '改' 說改時間", "用 '改到' 說新的時間"],
        "produce": ["打電話說要改時間", "'我想改時間，可以改到___嗎？'"],
        "errors": ["用 '換' 而非 '改'", "'改到' 後面忘了新時間"],
        "repair": {"word_order": "改 + 時間 + 了 / 改到 + 新時間"}
    },
    "GR_D64_QUE_REN": {
        "transform": ["用 '確認一下' 確認三個資訊", "把 '確認' 改成 '確認一下'"],
        "produce": ["打電話確認預約時間", "'我想確認一下___'"],
        "errors": ["不用 '一下' 語氣太硬", "'確認' 放在受詞後面"],
        "repair": {"word_order": "確認 + 一下 + 資訊", "softener": "加 '一下' 讓語氣更溫和"}
    },

    # Day 65: Obligations
    "GR_D65_YINGGAI": {
        "transform": ["用 '應該' 給三個建議", "把命令句改成 '你應該...'"],
        "produce": ["建議感冒的朋友做什麼", "'你應該___'"],
        "errors": ["用 '必須' 而非 '應該'（太強）", "'應該' 放在動詞後面"],
        "repair": {"word_order": "主語 + 應該 + 動詞", "vs_bixu": "'應該'=should，'必須'=must"}
    },
    "GR_D65_XUYAO": {
        "transform": ["用 '需要' 說三件必須做的事", "比較 '需要' 和 '應該'"],
        "produce": ["說辦理證件需要帶什麼", "'你需要帶___'"],
        "errors": ["'需要' 放在動詞後面", "'需要' 和 '想要' 混淆"],
        "repair": {"word_order": "需要 + 動詞/名詞", "vs_xiangyao": "'需要'=need，'想要'=want"}
    },
    "GR_D65_BIXU": {
        "transform": ["用 '必須' 說三條規則", "比較 '必須' 和 '應該' 的強度"],
        "produce": ["說搭飛機必須帶什麼", "'你必須___'"],
        "errors": ["一般場合用 '必須' 太強硬", "'必須' 放在受詞後面"],
        "repair": {"word_order": "必須 + 動詞", "strength": "'必須' 是最強的說法，沒有選擇"}
    },

    # Day 66: Conditionals
    "GR_D66_RUGUO_JIU": {
        "transform": ["用 '如果...就...' 做三個假設", "只用 '如果' 不用 '就'"],
        "produce": ["說如果明天下雨怎麼辦", "'如果___，我就___'"],
        "errors": ["'就' 放在 '如果' 前面", "忘了 '就' 句子不完整"],
        "repair": {"word_order": "如果 + 條件，就 + 結果"}
    },
    "GR_D66_BU_RAN": {
        "transform": ["用 '不然' 給兩個替代方案", "把 '否則' 改成口語的 '不然'"],
        "produce": ["提醒朋友要帶傘", "'快點，不然___'"],
        "errors": ["'不然' 放在建議前面口氣不對", "混淆 '不然' 和 '但是'"],
        "repair": {"word_order": "建議/陳述，不然 + 替代方案", "vs_danshi": "'不然'=otherwise，'但是'=but"}
    },
    "GR_D66_KENENG": {
        "transform": ["用 '可能' 說三個不確定的事", "用 '可能會' 說未來可能的事"],
        "produce": ["用 '可能' 委婉說你不能來", "'我可能___'"],
        "errors": ["'可能' 放在動詞後面", "混淆 '可能' 和 '可以'"],
        "repair": {"word_order": "可能 + 句子 / 可能會 + 動詞"}
    },

    # Day 67: Contrast
    "GR_D67_SUIRAN_KESHI": {
        "transform": ["用 '雖然...可是...' 做兩個對比", "把 '可是' 換成 '但是'"],
        "produce": ["說一個東西貴但值得", "'雖然___，可是___'"],
        "errors": ["只用 '雖然' 沒有 '可是'", "英文影響：只說 '但是' 不用 '雖然'"],
        "repair": {"word_order": "雖然 + 讓步，可是 + 轉折"}
    },
    "GR_D67_DANSHI_REVIEW": {
        "transform": ["用 '可是' 連接兩個相反的事", "用 '但是' 替代 '可是'"],
        "produce": ["說一個你想做但不能做的事", "'我想___，可是___'"],
        "errors": ["'可是' 放在句首不連接前句", "'可是' 和 '還是' 混淆"],
        "repair": {"word_order": "句子A，可是 + 句子B", "vs_haishi": "'可是'=but，'還是'=still"}
    },
    "GR_D67_HAI_SHI_STILL": {
        "transform": ["用 '還是' 說不放棄的事", "'雖然...還是...'"],
        "produce": ["說雖然很難但你還是繼續學中文", "'雖然___，我還是___'"],
        "errors": ["'還是' 和 '或者' 混淆", "'還是' 放在主語後面"],
        "repair": {"word_order": "主語 + 還是 + 動詞", "vs_huozhe": "'還是'=still，'或者'=or"}
    },

    # Day 68: Direction Complements
    "GR_D68_LAI_QU": {
        "transform": ["說 '拿來' vs '拿去' 的差別", "用 '來' 和 '去' 說三組動作"],
        "produce": ["叫人把東西拿過來", "'請你___來'，'他___去了'"],
        "errors": ["方向搞反（以說話者為中心）", "'來/去' 放在動詞前面"],
        "repair": {"word_order": "動詞 + 來（向我）/ 動詞 + 去（離我）"}
    },
    "GR_D68_JIN_CHU": {
        "transform": ["說 '進來' vs '出去'", "用 '進/出' + '來/去' 說四種方向"],
        "produce": ["請人進來坐", "'請___'，'他___了'"],
        "errors": ["'進/出' 放在 '來/去' 後面", "方向以對方為中心而非自己"],
        "repair": {"word_order": "動詞 + 進/出 + 來/去"}
    },
    "GR_D68_SHANG_XIA": {
        "transform": ["說 '上來' vs '下去'", "用 '上/下' + '來/去' 說上下方向"],
        "produce": ["叫樓上的人下來", "'請你___'，'我___'"],
        "errors": ["'上/下' 放在 '來/去' 後面", "上下車不用 '來/去'"],
        "repair": {"word_order": "動詞 + 上/下 + 來/去", "vehicle": "上車/下車不用來/去"}
    },

    # Day 69: Bring/Take
    "GR_D69_DAI_LAI_DAI_QU": {
        "transform": ["說 '帶來' vs '帶去'", "用 '帶' 說帶東西和帶人"],
        "produce": ["請朋友帶東西來聚會", "'你可以帶___來嗎？'"],
        "errors": ["'帶' 和 '拿' 混淆", "'帶來/帶去' 方向搞反"],
        "repair": {"word_order": "帶 + 受詞 + 來/去", "vs_na": "'帶'=bring/take along，'拿'=hold/carry"}
    },
    "GR_D69_HUI_LAI_HUI_QU": {
        "transform": ["說 '回來' vs '回去'", "問 '你什麼時候回來？'"],
        "produce": ["說你要回家了", "'我要___了'"],
        "errors": ["'回來/回去' 和 '回家' 混淆", "方向搞反"],
        "repair": {"word_order": "回 + 來/去", "vs_huijia": "'回來'=come back HERE，'回家'=go home"}
    },
    "GR_D69_NA_LAI_NA_QU": {
        "transform": ["說 '拿來' vs '拿去'", "用 '拿' 說三個動作"],
        "produce": ["請人把桌上的書拿來", "'幫我把___拿來'"],
        "errors": ["'拿' 和 '帶' 混用", "方向補語省略"],
        "repair": {"word_order": "拿 + 受詞 + 來/去"}
    },

    # Day 71: Work
    "GR_D71_ZAI_COMPANY_WORK": {
        "transform": ["說你在哪裡上班", "問朋友 '你在哪裡上班？'"],
        "produce": ["自我介紹說你的工作", "'我在___上班'"],
        "errors": ["用 '工作' 沒有 '在'", "'上班' 和 '工作' 不分"],
        "repair": {"word_order": "在 + 地方 + 上班/工作", "vs_gongzuo": "'上班'=go to work，'工作'=work (general)"}
    },
    "GR_D71_DANG_ROLE": {
        "transform": ["用 '當' 說三種職業", "問 '你做什麼工作？' 兩種問法"],
        "produce": ["說你的職業", "'我當___'"],
        "errors": ["用 '是' 不用 '當'", "'當' 放在職業後面"],
        "repair": {"word_order": "當 + 職業", "vs_shi": "'當'=serve as，'是'=is"}
    },
    "GR_D71_MANG_BU_MANG": {
        "transform": ["問 '你忙不忙？'", "回答 '很忙' / '不太忙'"],
        "produce": ["問同事最近忙不忙", "'你最近___？'"],
        "errors": ["說 '你是忙'", "'忙不忙' 語序錯誤"],
        "repair": {"word_order": "主語 + 忙不忙？", "no_shi": "不要加 '是'"}
    },

    # Day 72: Work status
    "GR_D72_YAO_FINISH": {
        "transform": ["用 '快要...了' 說三個快完成的事", "用 '就要...了' 替代"],
        "produce": ["說你快下班了", "'快要___了'"],
        "errors": ["忘了句尾 '了'", "'快要' 和 '就要' 語法不同"],
        "repair": {"word_order": "快要/就要 + 動詞 + 了"}
    },
    "GR_D72_ZAI_KAIHUI": {
        "transform": ["說 '我在開會'", "用 '正在開會' 強調"],
        "produce": ["跟打電話的人說你在開會", "'不好意思，我在___'"],
        "errors": ["說 '我在會議'", "'開會' 和 '會議' 混淆"],
        "repair": {"word_order": "在 + 開會", "vs_huiyi": "'開會'=have a meeting，'會議'=meeting (noun)"}
    },
    "GR_D72_HAI_MEI_FINISH": {
        "transform": ["用 '還沒' 說三件未完成的事", "加上 '呢' 軟化語氣"],
        "produce": ["說你還沒吃完飯", "'我還沒___'"],
        "errors": ["用 '沒有' 而非 '還沒'", "'還沒' 放在主語前面"],
        "repair": {"word_order": "主語 + 還沒 + 動詞", "vs_meiyou": "'還沒'=not yet，'沒有'=didn't"}
    },

    # Day 73: Opinions
    "GR_D73_WO_JUEDE": {
        "transform": ["用 '我覺得' 說三個意見", "問 '你覺得怎麼樣？'"],
        "produce": ["說你覺得台灣怎麼樣", "'我覺得___'"],
        "errors": ["用 '我認為' 在輕鬆場合", "'覺得' 放在受詞後面"],
        "repair": {"word_order": "主語 + 覺得 + 句子", "vs_renwei": "'覺得'=feel/think (casual)，'認為'=believe (formal)"}
    },
    "GR_D73_WO_RENWEI_INTRO": {
        "transform": ["用 '我認為' 說三個正式意見", "比較 '覺得' 和 '認為'"],
        "produce": ["用 '我認為' 在會議中發言", "'我認為___'"],
        "errors": ["輕鬆聊天用 '我認為' 太正式", "'認為' 放在受詞後面"],
        "repair": {"word_order": "主語 + 認為 + 句子", "formality": "開會用 '認為'，聊天用 '覺得'"}
    },
    "GR_D73_BU_YIDING": {
        "transform": ["用 '不一定' 說三個不絕對的事", "比較 '不一定' 和 '一定不'"],
        "produce": ["說貴的東西不一定好吃", "'___不一定___'"],
        "errors": ["混淆 '不一定' 和 '一定不'", "'不一定' 放在名詞前面"],
        "repair": {"word_order": "主語 + 不一定 + 句子", "vs_yidingbu": "'不一定'=not necessarily，'一定不'=definitely not"}
    },

    # Day 74: Argumentation
    "GR_D74_BIJING": {
        "transform": ["用 '畢竟' 說三個根本原因", "把理由用 '畢竟' 強化"],
        "produce": ["解釋為什麼學中文要時間", "'畢竟___'"],
        "errors": ["小事情用 '畢竟' 太重", "'畢竟' 放在句子中間不順"],
        "repair": {"word_order": "畢竟 + 根本原因", "usage": "'畢竟'=after all，用在最重要的原因"}
    },
    "GR_D74_LIRU": {
        "transform": ["用 '比如' 舉三個例子", "用 '例如' 替代 '比如'"],
        "produce": ["說你喜歡的台灣小吃，例如___", "'比如___'"],
        "errors": ["口語用 '例如' 太書面", "'比如' 放在句子尾"],
        "repair": {"word_order": "陳述，比如 + 例子", "formality": "'比如'=casual，'例如'=formal"}
    },
    "GR_D74_SUOYI_CONCLUSION": {
        "transform": ["用 '所以' 做三個結論", "把原因和結論用 '所以' 連接"],
        "produce": ["解釋你為什麼學中文", "'___，所以___'"],
        "errors": ["'所以' 放在句首沒前文", "'所以' 和 '因為' 只用一個"],
        "repair": {"word_order": "原因，所以 + 結論"}
    },

    # Day 76: Storytelling
    "GR_D76_BENLAI_HOULAI": {
        "transform": ["用 '本來...後來...結果...' 說一個故事", "只說 '本來' 和 '結果' 的短版"],
        "produce": ["說一個你本來要做但後來改變的事", "'我本來___，可是後來___，結果___'"],
        "errors": ["'本來' 用於未來計畫", "三個連接詞只用一個"],
        "repair": {"word_order": "本來 + 原計畫，可是後來 + 變化，結果 + 結局"}
    },
    "GR_D76_YINWEI_RESULT": {
        "transform": ["用 '因為...結果...' 說因果故事", "只用 '結果' 表示意外結局"],
        "produce": ["說一個因為天氣改變計畫的故事", "'因為___，結果___'"],
        "errors": ["'結果' 用於預期中的事", "因果關係不明顯用 '結果'"],
        "repair": {"word_order": "因為 + 原因，結果 + 意外結局"}
    },
    "GR_D76_FEELING_AFTER_EVENT": {
        "transform": ["在故事結尾加感受", "用 '所以' 或 '結果' 連接事件和感受"],
        "produce": ["說一個故事並表達你的感受", "'___，結果我覺得___'"],
        "errors": ["感受和事件沒有連接詞", "用 '是' 描述感受"],
        "repair": {"word_order": "事件，結果/所以 + 我覺得 + 感受", "no_shi": "不要說 '我是開心'"}
    },

    # Day 77: Storytelling II
    "GR_D77_RANHOU_NE": {
        "transform": ["在故事中停頓問 '然後呢？'", "用 '然後呢' 引導對方繼續說"],
        "produce": ["聽朋友講故事時用 '然後呢？' 回應", "說完一段後問對方 '然後呢？'"],
        "errors": ["'然後呢' 語氣不耐煩", "連續太多次 '然後呢'"],
        "repair": {"usage": "'然後呢？'=and then? (showing interest)", "tone": "語調上揚表示好奇，下降表示不耐煩"}
    },
    "GR_D77_HOU_LAI": {
        "transform": ["用 '後來' 說故事的時間轉折", "比較 '後來' 和 '然後'"],
        "produce": ["說一個後來才知道的事", "'後來我才知道___'"],
        "errors": ["'後來' 用於未來", "混淆 '後來' 和 '以後'"],
        "repair": {"word_order": "後來 + 句子", "vs_yihou": "'後來'=later (past)，'以後'=after (future)"}
    },
    "GR_D77_NI_DE_YISI_SHI": {
        "transform": ["用 '你的意思是...？' 確認理解", "用 '你是說...？' 替代"],
        "produce": ["確認你聽懂對方的意思", "'你的意思是___，是不是？'"],
        "errors": ["聽不懂卻不確認", "用 '什麼？' 而非 '你的意思是'"],
        "repair": {"word_order": "你的意思是 + 理解 + ？", "politeness": "比 '什麼？' 禮貌很多"}
    },

    # Day 78: Fillers
    "GR_D78_NAGE_FILLER": {
        "transform": ["在停頓時自然加入 '那個...'", "用 '那個' 爭取思考時間"],
        "produce": ["用 '那個...' 起頭問一個問題", "'那個...我想問你___'"],
        "errors": ["正式場合用太多 '那個'", "每句都加 '那個'"],
        "repair": {"usage": "思考停頓時用，不要太頻繁", "pronunciation": "口語常發音成 'nèige'"}
    },
    "GR_D78_DUI_DUI_DUI": {
        "transform": ["用 '對對對' 熱烈同意", "區分 '對'、'對對'、'對對對' 的熱度"],
        "produce": ["贊同朋友的意見", "'對對對！我也___'"],
        "errors": ["'對對對' 用於正式場合", "語氣敷衍"],
        "repair": {"usage": "三個 '對'=非常同意", "formality": "朋友之間用，正式場合用 '是的'"}
    },
    "GR_D78_WO_SHI_SHUO": {
        "transform": ["用 '我是說' 修正你的話", "用 '我的意思是' 替代"],
        "produce": ["當對方誤解時澄清", "'我是說___，不是___'"],
        "errors": ["用 '我是說' 完全改變原意", "'我是說' 语气不耐煩"],
        "repair": {"word_order": "我是說 + 澄清", "usage": "用於修正而非否認"}
    },

    # Day 79: Repair
    "GR_D79_QING_ZAI_SHUO_YI_CI": {
        "transform": ["用 '可以再說一次嗎？' 請求重複", "加上 '不好意思' 更禮貌"],
        "produce": ["聽不懂時禮貌請對方重複", "'不好意思，可以___嗎？'"],
        "errors": ["只說 '什麼？' 不禮貌", "'再說一次' 不加 '可以' 太直接"],
        "repair": {"politeness": "一定要加 '不好意思' 或 '可以...嗎？'"}
    },
    "GR_D79_MAN_YI_DIAN": {
        "transform": ["用 '可以說慢一點嗎？' 請求放慢", "加上理由 '我的中文不太好'"],
        "produce": ["請對方說慢一點", "'不好意思，可以___嗎？'"],
        "errors": ["說 '太慢了' 像批評", "'慢一點' 放在動詞前面"],
        "repair": {"word_order": "說 + 慢一點", "politeness": "說 '可以說慢一點嗎' 而非 '太慢了'"}
    },
    "GR_D79_SHI_BU_SHI_MEAN": {
        "transform": ["用 '是不是...？' 確認理解", "句尾加 '是不是？'"],
        "produce": ["確認對方的意思", "'你的意思是___，是不是？'"],
        "errors": ["用 '是嗎' 而非 '是不是'", "'是不是' 放在句子中間不順"],
        "repair": {"word_order": "陳述 + 是不是？"}
    },

    # Day 80: Signs
    "GR_D80_QING_DO": {
        "transform": ["辨識三個 '請' 開頭的標誌", "區分 '請' 和 '請勿'"],
        "produce": ["讀懂 '請排隊'、'請勿吸煙'", "寫一個 '請隨手關門' 的標誌"],
        "errors": ["'請勿' 和 '不要' 在標誌上混用", "標誌用口語"],
        "repair": {"formality": "標誌用 '請' 和 '請勿'，不用 '不要'"}
    },
    "GR_D80_BU_KE": {
        "transform": ["辨識三個 '禁止' 標誌", "比較 '禁止' 和 '請勿' 的強度"],
        "produce": ["讀懂 '禁止停車'、'禁止進入'", "說明哪裡可以看到這些標誌"],
        "errors": ["口語用 '禁止' 太強硬", "混淆 '不可' 和 '不能'"],
        "repair": {"strength": "'禁止'=strictly prohibited，'請勿'=please don't"}
    },
    "GR_D80_NOTICE_STYLE": {
        "transform": ["比較標誌語言和口語的差別", "把口語改寫成標誌體"],
        "produce": ["在台灣公共場所看標誌時能理解", "寫三個常用的標誌"],
        "errors": ["標誌太長太囉嗦", "標誌用口語詞彙"],
        "repair": {"style": "標誌=簡短、直接，常用 '請' 和 '禁止'"}
    },

    # Day 81: Phone
    "GR_D81_WEI_PHONE": {
        "transform": ["練習電話開頭 '喂？'", "'喂，你好' vs '喂，請問'"],
        "produce": ["接電話時說 '喂？'", "打電話給朋友開頭說 '喂，我是___'"],
        "errors": ["面對面說 '喂' 不禮貌", "'喂' 語調不對"],
        "repair": {"usage": "'喂' 只在電話中使用", "tone": "語調上揚=等待回應，下降=確認"}
    },
    "GR_D81_QING_WEN_CALL": {
        "transform": ["用 '請問___在嗎？' 找特定人", "說 '我是___' 自我介紹"],
        "produce": ["打電話到公司找人", "'喂，請問___在嗎？'"],
        "errors": ["直接說 '___在嗎？' 不加 '請問'", "忘了自我介紹"],
        "repair": {"politeness": "打電話一定要先說 '請問' 再找人"}
    },
    "GR_D81_WO_XIANG_YAO_CALL": {
        "transform": ["用 '我想找___' 說你要找誰", "用 '我想要___' 說你打電話的目的"],
        "produce": ["打電話預約", "'喂，我想找___'"],
        "errors": ["用 '我想跟___說話' 太囉嗦", "'找' 和 '找' 混淆"],
        "repair": {"word_order": "我想找 + 人", "usage": "'找' on phone = 'speak with'"}
    },

    # Day 82: Messages
    "GR_D82_MESSAGE_ELLIPSIS": {
        "transform": ["把完整的句子縮成訊息體", "辨識訊息中的省略"],
        "produce": ["回覆朋友的LINE訊息", "'知道了'，'收到了'"],
        "errors": ["訊息太正式像寫信", "省略太多對方不懂"],
        "repair": {"style": "訊息可以省略主語，但要清楚"}
    },
    "GR_D82_SHORT_CONFIRM": {
        "transform": ["用 '好'、'可以'、'沒問題' 回覆", "比較三種確認的用法"],
        "produce": ["用LINE確認明天的約會", "'好，明天見！'"],
        "errors": ["正式場合只用 '好' 太隨便", "用 '了解' 對朋友太冷淡"],
        "repair": {"usage": "'好'=OK (casual)，'沒問題'=no problem，'了解'=understood (formal)"}
    },
    "GR_D82_BUHAOYISI_MESSAGE": {
        "transform": ["用 '不好意思' 開頭回覆晚回的訊息", "用 '抱歉' 替代 '不好意思'"],
        "produce": ["回覆你晚看到的訊息", "'不好意思，現在才回'"],
        "errors": ["只說 '抱歉' 不解釋", "'不好意思' 後面沒有說明"],
        "repair": {"word_order": "不好意思/抱歉 + 說明"}
    },

    # Day 83: Decisions
    "GR_D83_BU_RAN": {
        "transform": ["用 '不然' 提替代方案", "把 '要不要' 改成 '不然'"],
        "produce": ["討論要去哪裡時提替代方案", "'那家很多人，不然___？'"],
        "errors": ["'不然' 口氣像否定對方", "'不然' 放在建議後面"],
        "repair": {"word_order": "陳述，不然 + 替代建議"}
    },
    "GR_D83_YAOBU": {
        "transform": ["用 '要不' 提隨興建議", "比較 '要不' 和 '要不要'"],
        "produce": ["臨時約朋友吃飯", "'要不我們去___？'"],
        "errors": ["正式場合用 '要不' 太隨便", "'要不' 和 '不然' 混淆"],
        "repair": {"usage": "'要不'=how about (casual)，'要不要'=do you want"}
    },
    "GR_D83_JIU_ZHE_YANG": {
        "transform": ["用 '就這樣吧' 敲定決定", "用 '那就這樣了' 說已決定的事"],
        "produce": ["討論完後說 '那就這樣吧'", "'好，那就___'"],
        "errors": ["沒討論就用 '就這樣吧'（像命令）", "少了 '吧' 語氣太硬"],
        "repair": {"word_order": "那就這樣 + 吧/了", "softener": "一定要加 '吧' 或 '了'"}
    },

    # Day 84: Goals
    "GR_D84_LAI_TAIWAN_DUOJIU": {
        "transform": ["問 '你來台灣多久了？'", "回答 '我來台灣___年了'"],
        "produce": ["回答台灣人最常問的問題", "'我來台灣___了'"],
        "errors": ["用 '多久' 忘了 '了'", "回答時用 '月' 而不用 '年'"],
        "repair": {"word_order": "來 + 地方 + 多久 + 了"}
    },
    "GR_D84_WEILE": {
        "transform": ["用 '為了' 說三個目的", "把 '因為' 改成 '為了'"],
        "produce": ["說你為了什麼來台灣", "'為了___，我___'"],
        "errors": ["'為了' 和 '因為' 混淆", "'為了' 放在動詞後面"],
        "repair": {"word_order": "為了 + 目的，+ 行動", "vs_yinwei": "'為了'=for the sake of，'因為'=because"}
    },
    "GR_D84_XUE_ZHONGWEN_GOAL": {
        "transform": ["說 '我在學中文'", "說 '我想學好中文'"],
        "produce": ["跟台灣人說你在學中文", "'我在學___，可是___'"],
        "errors": ["說 '我在學習中文' 太正式", "'學好' 和 '學會' 混淆"],
        "repair": {"word_order": "在學 + 語言", "formality": "口語說 '在學中文'，不用 '學習'"}
    },

    # Day 85: Topic shifts
    "GR_D85_TOPIC_SHIFT": {
        "transform": ["用 '對了' 自然轉話題", "用 '說到了' 連接相關話題"],
        "produce": ["聊天時想到一件事用 '對了' 開頭", "'對了，你___？'"],
        "errors": ["每句話都用 '對了'", "完全不相關的話題用 '對了' 太突兀"],
        "repair": {"usage": "'對了'=by the way，用在相關但不同的話題"}
    },
    "GR_D85_NI_NE": {
        "transform": ["回答後用 '你呢？' 反問", "用 '那你呢？' 替代"],
        "produce": ["自我介紹後問對方", "'我是___人，你呢？'"],
        "errors": ["每句都用 '你呢'", "'你呢' 語調不對"],
        "repair": {"usage": "答完後一定要反問，這是台灣對話習慣"}
    },
    "GR_D85_SHUNBIAN_WEN": {
        "transform": ["用 '順便問一下' 加問題", "用 '順便' 說順路做的事"],
        "produce": ["聊到相關話題時順便問", "'順便問一下，___？'"],
        "errors": ["完全無關的事用 '順便'", "'順便' 放在動詞後面"],
        "repair": {"word_order": "順便 + 動詞 / 順便問一下 + 問題"}
    },
}

DEFAULT_DRILLS = {
    "transform": ["用這個句型造句", "把陳述句改成問句"],
    "produce": ["用這個句型說你自己的經驗"],
    "errors": ["詞序錯誤"],
    "repair": {"word_order": "注意詞序"}
}

# Apply fixes
fixed = 0
for entry in grammar:
    gid = entry['id']
    
    # Trim examples to max 3 correct, max 2 drill
    if len(entry.get('correct_examples', [])) > 3:
        entry['correct_examples'] = entry['correct_examples'][:3]
    if len(entry.get('drill_examples', [])) > 3:
        entry['drill_examples'] = entry['drill_examples'][:3]
    
    # Fix transformation/production drills
    drills = DRILL_MAP.get(gid, DEFAULT_DRILLS)
    entry['transformation_drills'] = drills['transform']
    entry['production_drills'] = drills['produce']
    entry['common_error_patterns'] = drills['errors']
    if 'repair' in drills:
        entry['repair_feedback'] = drills['repair']
    
    # Also remove empty/large slot arrays
    if 'slots' in entry and (not entry['slots'] or len(str(entry['slots'])) > 5000):
        # Keep only 4 slot values max
        for slot in entry.get('slots', []):
            if len(slot.get('values', [])) > 4:
                slot['values'] = slot['values'][:4]
    
    # Trim negative_examples to 1
    if len(entry.get('negative_examples', [])) > 1:
        entry['negative_examples'] = entry['negative_examples'][:1]
    if len(entry.get('incorrect_examples', [])) > 1:
        entry['incorrect_examples'] = entry['incorrect_examples'][:1]
    
    fixed += 1

# Write compressed file
with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\grammar_days46_90.json', 'w', encoding='utf-8') as f:
    json.dump(grammar, f, ensure_ascii=False, indent=2)

# Stats
total_size = len(json.dumps(grammar, ensure_ascii=False))
print(f"Fixed {fixed} grammar entries")
print(f"Total file size: {total_size:,} bytes ({total_size/1024:.0f} KB)")

# Sample check
for entry in grammar:
    if entry['id'] == 'GR_D76_BENLAI_HOULAI':
        print(f"\nSample - {entry['id']}:")
        print(f"  Examples: {len(entry.get('correct_examples',[]))}")
        print(f"  Transform: {entry['transformation_drills']}")
        print(f"  Produce: {entry['production_drills']}")
        print(f"  Errors: {entry['common_error_patterns']}")
        break
