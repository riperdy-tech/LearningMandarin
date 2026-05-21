#!/usr/bin/env python3
"""
Generate proper grammar entries for days 46-90.
The sentences data is correct; we just need proper grammar patterns that reference them.
"""

import json
import sys

def load_sentences():
    with open(r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\sentences_days46_90.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def get_sentence_ids_for_day(sentences, day, count=4):
    """Get first N sentence IDs for a given day."""
    prefix = f"SEN_D{day}_"
    ids = [s['id'] for s in sentences if s['id'].startswith(prefix)]
    return ids[:count]

def get_sentence_data(sentences, sent_id):
    """Get a sentence object by ID."""
    for s in sentences:
        if s['id'] == sent_id:
            return s
    return None

def make_grammar_entry(id_, pattern, structure, explanation_en, title, meaning,
                       when_to_use, when_not_to_use, pragmatic_notes, word_order_notes,
                       english_contrast, korean_contrast, example_ids,
                       correct_examples, drill_examples=None,
                       slots=None, negative_examples=None,
                       transformation_drills=None, production_drills=None,
                       common_error_patterns=None, repair_feedback=None):
    entry = {
        "id": id_,
        "pattern": pattern,
        "structure": structure,
        "explanation_en": explanation_en,
        "title": title,
        "meaning": meaning,
        "when_to_use": when_to_use,
        "when_not_to_use": when_not_to_use,
        "pragmatic_notes": pragmatic_notes,
        "word_order_notes": word_order_notes,
        "english_contrast": english_contrast,
        "korean_contrast": korean_contrast,
        "example_ids": example_ids,
        "correct_examples": correct_examples,
        "negative_examples": negative_examples or [
            {"text": "*錯的順序", "error": "This word order is not correct Mandarin."}
        ],
        "transformation_drills": transformation_drills or [
            "Change the subject.",
            "Add a time expression.",
            "Turn this into a question."
        ],
        "production_drills": production_drills or [
            "Use this pattern in a sentence about your own life.",
            "Ask a follow-up question using this pattern."
        ],
        "common_error_patterns": common_error_patterns or [
            "Putting words in the wrong order.",
            "Using English word order."
        ],
        "repair_feedback": repair_feedback or {
            "word_order": "Move the main action before the object.",
            "missing_particle": "Add the required particle (了／過／的／嗎)."
        }
    }
    if drill_examples:
        entry["drill_examples"] = drill_examples
    if slots:
        entry["slots"] = slots
    return entry

def make_review_entry(id_, title, day_range, example_ids=None):
    return {
        "id": id_,
        "pattern": f"Review: {title}",
        "structure": ["review"],
        "explanation_en": f"Consolidation and review of grammar patterns from days {day_range}.",
        "title": title,
        "meaning": f"Review of key patterns from days {day_range}.",
        "when_to_use": ["When reviewing previously learned patterns."],
        "when_not_to_use": ["Not a new pattern — focus on integration."],
        "pragmatic_notes": "Use this session to practice combining multiple patterns naturally in conversation.",
        "word_order_notes": "Pay attention to how different patterns interact in longer sentences.",
        "english_contrast": "Practice producing Chinese without translating from English.",
        "korean_contrast": "Practice producing Chinese without translating from Korean.",
        "example_ids": example_ids or [],
        "correct_examples": [],
        "drill_examples": [],
        "negative_examples": [],
        "slots": [],
        "transformation_drills": [],
        "production_drills": [],
        "common_error_patterns": [],
        "repair_feedback": {}
    }

def main():
    sentences = load_sentences()
    
    grammar_entries = []
    
    # ========== DAY 46: Completed Actions with 了 ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D46_COMPLETED_LE",
        "Subject + verb + object + 了",
        ["subject", "verb", "object", "了"],
        "Use 了 at the end of a sentence to mark a completed action. In Taiwan Mandarin, 了 frequently appears at the end to indicate that something has been done. This is the most basic completion marker.",
        "Completed Action with 了",
        "Completed-action 了 (perfective aspect marker)",
        [
            "When talking about something you did (past completed action)",
            "When confirming that an action has been done",
            "When reporting daily activities"
        ],
        [
            "Do not use 了 for habitual or recurring actions",
            "Do not use 了 with stative verbs like 是 (shì) or 在 (zài)",
            "Do not use 了 when the sentence has a modal verb like 要 (yào) or 想 (xiǎng) in the main clause"
        ],
        "In Taiwan, 了 is used frequently in casual conversation to mark completion. The position at the end of the sentence is the most natural for short declarative statements about daily activities.",
        "The basic structure is: Subject + Time + Verb + Object + 了. Time expressions like 昨天 (zuótiān) go before the verb.",
        "English uses past tense ('I bought'). Chinese uses 了 after the object to mark completion. There is no tense conjugation in Chinese.",
        "Korean uses '~었/았다' as a past tense suffix on the verb. Chinese uses the particle 了 after the object instead.",
        get_sentence_ids_for_day(sentences, 46, 6),
        [
            {"text": "我昨天買菜了。", "pinyin": "Wǒ zuótiān mǎi cài le.", "translation_en": "I bought groceries yesterday."},
            {"text": "他昨天煮飯了。", "pinyin": "Tā zuótiān zhǔ fàn le.", "translation_en": "He cooked rice yesterday."},
            {"text": "我昨天打掃家了。", "pinyin": "Wǒ zuótiān dǎsǎo jiā le.", "translation_en": "I cleaned the house yesterday."},
            {"text": "她昨天看電影了。", "pinyin": "Tā zuótiān kàn diànyǐng le.", "translation_en": "She watched a movie yesterday."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D46_YESTERDAY_TIME",
        "昨天 + subject + verb + object + 了",
        ["昨天", "subject", "verb", "object", "了"],
        "In Mandarin, time expressions like 昨天 (zuótiān, yesterday) always come BEFORE the verb, often at the start of the sentence or right after the subject. This is different from English where 'yesterday' can go at the end.",
        "Time-First Word Order",
        "Time expressions precede the verb in Mandarin.",
        [
            "When stating when something happened",
            "When the time is the topic or context of the sentence",
            "In both formal and casual speech in Taiwan"
        ],
        [
            "Do not place the time expression at the end of the sentence",
            "Do not separate the time expression from the action it modifies"
        ],
        "Taiwan Mandarin consistently places time expressions before the verb. This is one of the most important word-order rules to master.",
        "Time expressions (昨天, 今天, 明天, 上個禮拜, etc.) always come BEFORE the verb phrase. The pattern is: Time + Subject + Verb + Object.",
        "English allows 'I went out yesterday' (time at end). Chinese MUST have time before the verb: 我昨天出門了 (literally: I yesterday went out).",
        "Korean also places time before the verb (어제 나갔어요), which is similar to Chinese. However, Korean uses a past tense suffix while Chinese uses 了.",
        get_sentence_ids_for_day(sentences, 46, 6)[:4],
        [
            {"text": "我昨天買菜了。", "pinyin": "Wǒ zuótiān mǎi cài le.", "translation_en": "I bought groceries yesterday."},
            {"text": "他昨天煮飯了。", "pinyin": "Tā zuótiān zhǔ fàn le.", "translation_en": "He cooked rice yesterday."},
            {"text": "我昨天出門了。", "pinyin": "Wǒ zuótiān chūmén le.", "translation_en": "I went out yesterday."},
            {"text": "他昨天洗澡了。", "pinyin": "Tā zuótiān xǐzǎo le.", "translation_en": "He took a shower yesterday."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D46_VERB_OBJECT_LE",
        "Verb + object + 了 (with time expression)",
        ["time", "subject", "verb", "object", "了"],
        "When a sentence has both a time expression and a specific object, the 了 goes after the object to mark completion of the whole verb phrase. This is the standard Taiwan Mandarin pattern for reporting completed daily activities.",
        "Verb-Object-了 Pattern",
        "了 after object marks completion of the action on that object.",
        [
            "When reporting what you did with a specific object",
            "When the object is definite or specific",
            "In everyday conversation about completed tasks"
        ],
        [
            "Do not place 了 immediately after the verb if there is a specific object",
            "Do not use 了 after 沒 (méi) in negative sentences about the past"
        ],
        "In Taiwan casual speech, 了 at the end of a short declarative sentence is extremely common. It makes the sentence sound complete and natural.",
        "Time + Subject + Verb + Object + 了. All elements before 了 contribute to the completed action.",
        "English: 'I ate dinner' (past tense on verb). Chinese: 我吃飯了 (I eat rice LE = I ate).",
        "Korean: '밥 먹었어요' (rice ate-past). Chinese: 我吃飯了 (I eat rice LE). Note the different position of the completion marker.",
        get_sentence_ids_for_day(sentences, 46, 4)[:4],
        [
            {"text": "我昨天買菜了。", "pinyin": "Wǒ zuótiān mǎi cài le.", "translation_en": "I bought groceries yesterday."},
            {"text": "她昨天看電影了。", "pinyin": "Tā zuótiān kàn diànyǐng le.", "translation_en": "She watched a movie yesterday."},
        ]
    ))
    
    # ========== DAY 47: Sequencing with 然後 and 先...然後... ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D47_RANHOU",
        "Clause 1，然後 + clause 2",
        ["clause 1", "然後", "clause 2"],
        "Use 然後 (ránhòu) to connect two sequential actions, meaning 'and then' or 'after that'. It is one of the most frequently used connectors in Taiwan Mandarin conversation.",
        "Sequencing with 然後",
        "and then; after that",
        [
            "When narrating a sequence of events",
            "When telling someone what you did step by step",
            "In both casual and semi-formal conversation in Taiwan"
        ],
        [
            "Do not overuse 然後 as a filler word in every sentence",
            "Do not place 然後 at the very beginning of the first action"
        ],
        "Taiwan speakers frequently use 然後 in everyday narration. It is natural and expected in casual storytelling.",
        "The first clause describes the first action, then 然後 introduces the second action. Both clauses should be complete verb phrases.",
        "English uses 'and then' or 'and' between clauses. Chinese uses 然後 which is more explicit about sequence.",
        "Korean uses '그리고' (and) or '그 다음에' (after that). Chinese 然後 is closer to '그 다음에' in meaning.",
        get_sentence_ids_for_day(sentences, 47, 6),
        [
            {"text": "我昨天早上起床，然後吃早餐。", "pinyin": "Wǒ zuótiān zǎoshang qǐchuáng, ránhòu chī zǎocān.", "translation_en": "I got up yesterday morning and then ate breakfast."},
            {"text": "他先看書，然後聽音樂。", "pinyin": "Tā xiān kàn shū, ránhòu tīng yīnyuè.", "translation_en": "He first reads a book, then listens to music."},
            {"text": "我們去餐廳吃飯，然後去公園散步。", "pinyin": "Wǒmen qù cāntīng chī fàn, ránhòu qù gōngyuán sànbù.", "translation_en": "We went to a restaurant to eat, and then went for a walk in the park."},
            {"text": "她先洗澡，然後穿衣服。", "pinyin": "Tā xiān xǐzǎo, ránhòu chuān yīfu.", "translation_en": "She first takes a shower, then gets dressed."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D47_XIAN_RANHOU",
        "先 + action 1，然後 + action 2",
        ["先", "action 1", "然後", "action 2"],
        "The pair 先 (xiān)...然後 (ránhòu)... emphasizes the order of two sequential actions. 先 marks the first action as happening first, and 然後 introduces the second. This is a very common pattern for giving instructions or narrating sequences.",
        "First...Then... with 先...然後...",
        "first... and then...",
        [
            "When giving step-by-step instructions",
            "When emphasizing that one action must happen before another",
            "When narrating a planned sequence of events"
        ],
        [
            "Do not reverse the order — 先 always marks the first action",
            "Do not use 先 without a second action (it implies there is more to come)"
        ],
        "Taiwan Mandarin uses 先...然後... frequently in daily conversation. It is a clear way to organize information.",
        "先 + Verb Phrase 1 + 然後 + Verb Phrase 2. Both verb phrases should be complete.",
        "English: 'First I eat, then I go.' Chinese: 我先吃飯，然後去。The 先 comes before the verb, unlike English 'first' which starts the clause.",
        "Korean: '먼저 밥을 먹고, 그 다음에 가요.' Chinese: 我先吃飯，然後去。Similar structure with first-action marker before the verb.",
        get_sentence_ids_for_day(sentences, 47, 4)[:4],
        [
            {"text": "他先看書，然後聽音樂。", "pinyin": "Tā xiān kàn shū, ránhòu tīng yīnyuè.", "translation_en": "He first reads a book, then listens to music."},
            {"text": "她先洗澡，然後穿衣服。", "pinyin": "Tā xiān xǐzǎo, ránhòu chuān yīfu.", "translation_en": "She first takes a shower, then gets dressed."},
            {"text": "我打算先做功課，然後看電視。", "pinyin": "Wǒ dǎsuàn xiān zuò gōngkè, ránhòu kàn diànshì.", "translation_en": "I plan to do my homework first, and then watch TV."},
            {"text": "他先買咖啡，然後去公司上班。", "pinyin": "Tā xiān mǎi kāfēi, ránhòu qù gōngsī shàngbān.", "translation_en": "He first buys coffee, then goes to the office to work."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D47_LE_POSITION_REVIEW",
        "Review: 了 position in sequence sentences",
        ["clause 1", "了", "然後", "clause 2"],
        "Review the correct placement of 了 when combining sequence markers with completed actions. When narrating a sequence of past events, 了 typically appears at the end of each completed clause.",
        "了 Position Review in Sequences",
        "Review: placing 了 correctly in multi-clause sentences.",
        [
            "When reviewing the 了 pattern in longer narratives",
            "When combining 了 with 然後 in the same sentence"
        ],
        [
            "Do not place 了 before the object in sequence sentences",
            "Do not omit 了 when the first action is clearly completed"
        ],
        "In narrative sequences, each completed action can take its own 了. The 了 goes after the object of each clause.",
        "Clause 1 + Object + 了，然後 + Clause 2 + Object + 了.",
        "English uses past tense on each verb. Chinese places 了 after each object.",
        "Korean uses ~고 (connective) between past tense verbs. Chinese uses 了 + 然後.",
        get_sentence_ids_for_day(sentences, 47, 4)[:4],
        [
            {"text": "我昨天早上起床，然後吃早餐。", "pinyin": "Wǒ zuótiān zǎoshang qǐchuáng, ránhòu chī zǎocān.", "translation_en": "I got up yesterday morning and then ate breakfast."},
        ]
    ))
    
    # ========== DAY 48: Experience with 過 ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D48_GUO_EXPERIENCE",
        "Subject + verb + 過 + object",
        ["subject", "verb", "過", "object"],
        "Use 過 (guò) after a verb to indicate that someone has had the experience of doing something. It means 'have ever done' and is used for life experiences, not for specific completed actions.",
        "Experience Marker 過",
        "have ever done (experiential aspect marker)",
        [
            "When asking if someone has ever done something",
            "When sharing life experiences",
            "When talking about things you have or haven't tried"
        ],
        [
            "Do not use 過 for a specific, one-time completed action (use 了 instead)",
            "Do not use 過 for actions that are happening right now",
            "過 is different from 了 — 了 marks completion, 過 marks experience"
        ],
        "In Taiwan, asking '你V過O嗎?' (Have you ever V-ed O?) is a common conversation starter and a natural way to get to know someone's experiences.",
        "Subject + Verb + 過 + Object. 過 comes directly after the verb and before the object.",
        "English: 'Have you ever been to Taipei?' Chinese: 你去過臺北嗎？(You go-GUO Taipei MA?). The 過 is like 'have ever' in English.",
        "Korean: '~아/어 본 적이 있다' (have the experience of). Chinese 過 is similar to '~아/어 보다' in Korean.",
        get_sentence_ids_for_day(sentences, 48, 6),
        [
            {"text": "你去過臺北嗎？", "pinyin": "Nǐ qù guò Táiběi ma?", "translation_en": "Have you been to Taipei?"},
            {"text": "我吃過滷肉飯，很好吃。", "pinyin": "Wǒ chī guò lǔròufàn, hěn hǎochī.", "translation_en": "I have eaten braised pork rice; it's very delicious."},
            {"text": "我們看過九份的風景，很漂亮。", "pinyin": "Wǒmen kàn guò Jiǔfèn de fēngjǐng, hěn piàoliang.", "translation_en": "We have seen the scenery of Jiufen; it's very beautiful."},
            {"text": "你聽過這首歌嗎？", "pinyin": "Nǐ tīng guò zhè shǒu gē ma?", "translation_en": "Have you heard this song?"}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D48_MEIYOU_GUO",
        "Subject + 從來 + 沒有 + verb + 過 (+ object)",
        ["subject", "從來", "沒有", "verb", "過", "object"],
        "Use 從來沒有...過 (cónglái méiyǒu...guò) to say 'have never done something'. 從來 (cónglái) emphasizes 'ever/never' and strengthens the negation. This is a very common and natural pattern in Taiwan Mandarin.",
        "Never Have with 從來沒有...過",
        "have never done (strong negation of experience)",
        [
            "When you want to strongly say you have never done something",
            "When expressing surprise that someone hasn't experienced something common",
            "When contrasting your experience with someone else's"
        ],
        [
            "Do not use 了 with this pattern — 過 is already marking experience",
            "Do not use 沒有...過 for things happening right now"
        ],
        "Taiwan speakers use 從來沒有...過 frequently. Adding 從來 makes the negation stronger and more natural in conversation.",
        "Subject + 從來 + 沒有 + Verb + 過 (+ Object). 從來 and 沒有 go before the verb, 過 goes after the verb.",
        "English: 'I have never eaten this.' Chinese: 我從來沒有吃過這個。(I ever not-have eat-GUO this).",
        "Korean: '한 번도 ~아/어 본 적이 없다.' Chinese 從來沒有...過 is structurally similar to Korean's '한 번도...ㄴ 적이 없다.'",
        get_sentence_ids_for_day(sentences, 48, 4)[:4],
        [
            {"text": "他從來沒有喝過珍珠奶茶。", "pinyin": "Tā cónglái méiyǒu hē guò zhēnzhū nǎichá.", "translation_en": "He has never drunk bubble tea."},
            {"text": "我從來沒有去過那個地方。", "pinyin": "Wǒ cónglái méiyǒu qù guò nà ge dìfāng.", "translation_en": "I have never been to that place."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D48_YI_QIAN",
        "以前 + subject + verb + 過 / Subject + 以前 + verb + 過",
        ["以前", "subject", "verb", "過"],
        "Use 以前 (yǐqián) to mean 'before' or 'previously'. When combined with 過, it emphasizes that the experience happened in the past. 以前 can go at the beginning of the sentence or after the subject.",
        "Before/Previously with 以前",
        "before; previously; ago",
        [
            "When contrasting past experience with present situation",
            "When telling someone about your background",
            "When the time frame of the experience matters"
        ],
        [
            "Do not confuse 以前 (before/ago) with 已經 (already)",
            "Do not place 以前 after the verb"
        ],
        "以前 is versatile. It can mean 'ago' (三天以前 = three days ago) or 'before/previously' depending on context.",
        "以前 can be placed at the start of the sentence or after the subject. Both are correct: 以前我去過 / 我以前去過.",
        "English: 'I have been there before.' Chinese: 我以前去過那裡。(I before go-GUO there).",
        "Korean: '전에 가 본 적이 있어요.' Chinese 以前 corresponds to Korean '전에'.",
        get_sentence_ids_for_day(sentences, 48, 4)[:4],
        [
            {"text": "我學過中文，可是不太流利。", "pinyin": "Wǒ xué guò Zhōngwén, kěshì bú tài liúlì.", "translation_en": "I have studied Chinese, but I'm not very fluent."},
        ]
    ))
    
    # ========== DAY 49: Progressive 在/正在 ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D49_ZAI_PROGRESSIVE",
        "Subject + 在 + verb (+ object)",
        ["subject", "在", "verb", "object"],
        "Use 在 (zài) before a verb to indicate an action in progress, similar to English '-ing'. This is the most common way to describe what someone is doing right now in Taiwan Mandarin.",
        "Progressive Action with 在",
        "in the middle of doing (progressive aspect marker)",
        [
            "When describing what someone is doing right now",
            "When answering 'What are you doing?'",
            "When giving a reason for being unavailable"
        ],
        [
            "Do not use 在 with stative verbs like 是 (shì), 知道 (zhīdào), 喜歡 (xǐhuān)",
            "Do not confuse 在 (progressive) with 在 (location — 'at')"
        ],
        "In Taiwan casual speech, 在 + verb is the most natural way to say 'I'm VERB-ing'. It's shorter and more common than 正在.",
        "Subject + 在 + Verb (+ Object). 在 goes directly before the action verb.",
        "English: 'I am eating.' Chinese: 我在吃飯。(I ZAI eat rice). 在 functions like 'am -ing'.",
        "Korean: '~고 있다' (am doing). Chinese 在 is similar to Korean '~고 있다'.",
        get_sentence_ids_for_day(sentences, 49, 6),
        [
            {"text": "我在看書。", "pinyin": "Wǒ zài kàn shū.", "translation_en": "I am reading a book."},
            {"text": "他在打電話。", "pinyin": "Tā zài dǎ diànhuà.", "translation_en": "He is making a phone call."},
            {"text": "媽媽在煮飯。", "pinyin": "Māma zài zhǔ fàn.", "translation_en": "Mom is cooking."},
            {"text": "我們在聊天。", "pinyin": "Wǒmen zài liáotiān.", "translation_en": "We are chatting."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D49_ZHENGZAI",
        "Subject + 正在 + verb (+ object) (+ 呢)",
        ["subject", "正在", "verb", "object", "呢"],
        "正在 (zhèngzài) is a more emphatic form of the progressive aspect, meaning 'right in the middle of doing'. Adding 呢 (ne) at the end softens the tone and makes it more conversational in Taiwan Mandarin.",
        "Emphatic Progressive with 正在",
        "right in the middle of doing (emphatic progressive)",
        [
            "When emphasizing that an action is happening at this exact moment",
            "When you are busy and can't do something else",
            "In slightly more formal narration"
        ],
        [
            "Do not use 正在 for habitual actions",
            "正在 is more emphatic than 在 — use 在 for casual statements"
        ],
        "Taiwan speakers often add 呢 at the end of 正在 sentences to make them sound friendlier: 我正在吃飯呢 (I'm eating right now — friendly tone).",
        "Subject + 正在 + Verb (+ Object) + 呢. 呢 is optional but adds a conversational tone.",
        "English: 'I am eating right now.' Chinese: 我正在吃飯呢。The 正在 emphasizes the 'right now' aspect.",
        "Korean: '지금 ~고 있어요.' Chinese 正在 is similar to Korean '지금' + '~고 있다'.",
        get_sentence_ids_for_day(sentences, 49, 4)[:4],
        [
            {"text": "我正在看書呢。", "pinyin": "Wǒ zhèngzài kàn shū ne.", "translation_en": "I am reading a book right now."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D49_NOW_BUSY",
        "Subject + 現在 + 在 + verb ／ 現在 + 很 + adjective",
        ["現在", "subject", "在", "verb"],
        "Use 現在 (xiànzài, 'now') with 在 to describe what is happening at the present moment, or with an adjective to describe the current state. This is a very practical pattern for daily communication.",
        "Now / Currently with 現在",
        "now; at the moment",
        [
            "When stating what is happening now",
            "When describing current status or mood",
            "When explaining why you can or can't do something"
        ],
        [
            "Do not confuse 現在 (now) with 正在 (right in the middle of)",
            "現在 can be used with adjectives: 現在很忙 (now very busy)"
        ],
        "現在 is one of the most useful time words. Combined with 在 + verb, it clearly anchors the action to the present moment.",
        "現在 + Subject + 在 + Verb / Subject + 現在 + 很 + Adjective.",
        "English: 'I am busy now.' Chinese: 我現在很忙。(I now very busy). Notice no 'am' is needed with adjectives.",
        "Korean: '지금 바빠요.' (now busy). Chinese 現在 corresponds directly to Korean '지금'.",
        get_sentence_ids_for_day(sentences, 49, 4)[:4],
        [
            {"text": "我現在在看電視。", "pinyin": "Wǒ xiànzài zài kàn diànshì.", "translation_en": "I am watching TV now."},
            {"text": "他現在很忙。", "pinyin": "Tā xiànzài hěn máng.", "translation_en": "He is very busy now."},
        ]
    ))
    
    # ========== DAY 50: Ability with 會 ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D50_HUI_ABILITY",
        "Subject + 會 + verb (+ object)",
        ["subject", "會", "verb", "object"],
        "Use 會 (huì) to express learned ability or skill — things you know how to do because you learned them. This is different from 可以 (kěyǐ) which is about permission, and 能 (néng) which is about physical capability.",
        "Learned Ability with 會",
        "can; know how to (learned skill)",
        [
            "When talking about skills you have learned",
            "When asking if someone knows how to do something",
            "When describing abilities like speaking a language, cooking, driving"
        ],
        [
            "Do not use 會 for physical capability (use 能 néng)",
            "Do not use 會 for permission (use 可以 kěyǐ)",
            "會 also means 'will' for future — context distinguishes the meaning"
        ],
        "In Taiwan, 你會說中文嗎？(Can you speak Chinese?) is one of the most common questions asked of foreigners. 會 is the standard word for language ability.",
        "Subject + 會 + Verb (+ Object). 會 goes directly before the action verb.",
        "English: 'I can speak Chinese.' Chinese: 我會說中文。(I HUI speak Chinese). 會 is like 'can' for learned skills.",
        "Korean: '~할 줄 알다' (know how to do). Chinese 會 corresponds to Korean '~ㄹ 줄 알다'.",
        get_sentence_ids_for_day(sentences, 50, 6),
        [
            {"text": "我會說一點中文。", "pinyin": "Wǒ huì shuō yī diǎn Zhōngwén.", "translation_en": "I can speak a little Chinese."},
            {"text": "他會煮臺灣菜。", "pinyin": "Tā huì zhǔ Táiwān cài.", "translation_en": "He can cook Taiwanese food."},
            {"text": "你會開車嗎？", "pinyin": "Nǐ huì kāi chē ma?", "translation_en": "Can you drive?"},
            {"text": "她會彈鋼琴。", "pinyin": "Tā huì tán gāngqín.", "translation_en": "She can play the piano."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D50_BU_HUI",
        "Subject + 不會 + verb (+ object)",
        ["subject", "不會", "verb", "object"],
        "Use 不會 (bú huì) to say you cannot do something (a learned skill) or don't know how to do it. 不 negates 會 directly. This is the standard way to express lack of ability.",
        "Cannot / Don't Know How with 不會",
        "cannot; don't know how to (negation of learned ability)",
        [
            "When you want to say you don't know how to do something",
            "When admitting a skill you haven't learned yet",
            "When politely declining because you lack the skill"
        ],
        [
            "Do not use 不會 for things you're not allowed to do (use 不可以)",
            "Do not use 不會 for physical inability (use 不能)"
        ],
        "Taiwan speakers often soften 我不會 with 不太會 (not very good at) to be more modest: 我不太會說中文 (I can't really speak Chinese well).",
        "Subject + 不 + 會 + Verb (+ Object). 不 negates 會 directly, then the verb follows.",
        "English: 'I can't swim.' Chinese: 我不會游泳。(I not-HUI swim).",
        "Korean: '~할 줄 모르다' (don't know how to do). Chinese 不會 corresponds to Korean '~ㄹ 줄 모르다'.",
        get_sentence_ids_for_day(sentences, 50, 4)[:4],
        [
            {"text": "我不會說日文。", "pinyin": "Wǒ bú huì shuō Rìwén.", "translation_en": "I can't speak Japanese."},
            {"text": "他不會游泳。", "pinyin": "Tā bú huì yóuyǒng.", "translation_en": "He can't swim."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D50_HAI_BU_TAI",
        "Subject + 還不太會 + verb / Subject + 還不太 + adjective",
        ["subject", "還", "不太", "會", "verb"],
        "Use 還不太 (hái bú tài) to soften a negative statement, meaning 'not quite yet' or 'still not very'. 還不太會 means 'still not very good at'. This is a very Taiwan-style way to be modest and polite.",
        "Not Quite Yet with 還不太",
        "still not very; not quite yet (softened negation)",
        [
            "When you want to modestly say you're not good at something",
            "When something is still in progress but not there yet",
            "When you can do something a little but not well"
        ],
        [
            "Do not use 還不太 for things you definitely cannot do (use 不會)",
            "還不太 implies you are learning or it's changeable"
        ],
        "Taiwan culture values modesty. 還不太會 is a polite way to downplay your abilities even when you can actually do something reasonably well.",
        "Subject + 還 + 不太 + 會 + Verb / Subject + 還 + 不太 + Adjective.",
        "English: 'I still can't speak very well.' Chinese: 我還不太會說。(I still not-too-HUI speak).",
        "Korean: '아직 잘 못해요.' Chinese 還不太 is similar to Korean '아직 잘 못~'.",
        get_sentence_ids_for_day(sentences, 50, 4)[:4],
        [
            {"text": "我還不太會說中文。", "pinyin": "Wǒ hái bú tài huì shuō Zhōngwén.", "translation_en": "I still can't speak Chinese very well."},
            {"text": "這個還不太熱。", "pinyin": "Zhège hái bú tài rè.", "translation_en": "This is still not very hot."},
        ]
    ))
    
    # ========== DAY 51: Modifier 的 ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D51_DE_MODIFIER",
        "Modifier + 的 + noun",
        ["modifier", "的", "noun"],
        "Use 的 (de) to connect a modifier (adjective, noun, or clause) to a noun. This is the most versatile particle in Chinese. It can mark possession (我的書 = my book), description (好吃的東西 = delicious food), and relative clauses.",
        "Modifier Particle 的",
        "possessive/descriptive/modifier particle",
        [
            "When describing a noun with an adjective",
            "When showing possession (my, your, his, etc.)",
            "When creating a longer description before a noun",
            "In practically every conversation in Taiwan"
        ],
        [
            "Do not use 的 with single-syllable adjectives + single-syllable nouns in very close relationships (好朋友, not 好的朋友)",
            "Do not use 的 after 這 (zhè) or 那 (nà) when followed directly by a noun"
        ],
        "Taiwan Mandarin uses 的 extensively. Mastering 的 is essential for natural speech. It's the most frequently used character in Chinese.",
        "Modifier + 的 + Noun. The modifier can be an adjective, a noun (possessive), or a full clause.",
        "English: 'delicious food' — adjective before noun. Chinese: 好吃的東西 (delicious DE thing). 的 is like a connector.",
        "Korean: '맛있는 음식' uses '~ㄴ/은' as modifier. Chinese 的 functions similarly to Korean's adnominal endings.",
        get_sentence_ids_for_day(sentences, 51, 6),
        [
            {"text": "這是我最喜歡的餐廳。", "pinyin": "Zhè shì wǒ zuì xǐhuān de cāntīng.", "translation_en": "This is my favorite restaurant."},
            {"text": "那個穿紅色衣服的人是我朋友。", "pinyin": "Nà ge chuān hóngsè yīfu de rén shì wǒ péngyou.", "translation_en": "That person wearing red clothes is my friend."},
            {"text": "好吃的東西不一定很貴。", "pinyin": "Hǎochī de dōngxi bù yīdìng hěn guì.", "translation_en": "Delicious things are not necessarily expensive."},
            {"text": "我買了一杯冰的咖啡。", "pinyin": "Wǒ mǎi le yī bēi bīng de kāfēi.", "translation_en": "I bought a cup of iced coffee."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D51_HEN_ADJ",
        "Subject + 很 + adjective",
        ["subject", "很", "adjective"],
        "In Chinese, adjectives are predicates and need 很 (hěn) before them in declarative sentences. While 很 literally means 'very', in this structure it often functions as a grammatical linker rather than carrying strong 'very' meaning. Without 很, the sentence sounds incomplete or comparative.",
        "Adjective Predicates with 很",
        "very; grammatical linker for adjectives",
        [
            "When describing something with an adjective",
            "In almost every descriptive sentence in Chinese",
            "When 很 doesn't necessarily mean 'very' but just links subject to adjective"
        ],
        [
            "Do not add 是 before adjectives — Chinese adjectives don't need 'to be'",
            "Do use 很 even when you don't mean 'very' — it's grammatically required in most cases"
        ],
        "Taiwan speakers use 很 so frequently with adjectives that it often loses its 'very' meaning and just becomes a grammatical connector. To really say 'very', you can use 非常 (fēicháng) or 很 with emphasis.",
        "Subject + 很 + Adjective. No verb 'to be' is needed.",
        "English: 'This is delicious.' Chinese: 這個很好吃。(This HEN delicious). No 'is' — 很 connects subject to adjective.",
        "Korean: '이거 맛있어요.' (this delicious). Chinese: 這個很好吃。Both drop the copula with adjectives.",
        get_sentence_ids_for_day(sentences, 51, 4)[:4],
        [
            {"text": "這家餐廳很好吃。", "pinyin": "Zhè jiā cāntīng hěn hǎochī.", "translation_en": "This restaurant is delicious."},
            {"text": "那個地方很漂亮。", "pinyin": "Nà ge dìfāng hěn piàoliang.", "translation_en": "That place is very beautiful."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D51_NA_GE_REN",
        "那 + measure word + noun + 的 + description",
        ["那", "measure word", "noun", "的", "description"],
        "Use 那個 (nà ge) / 那種 (nà zhǒng) to point out a specific person or thing and then describe it with 的. This pattern is essential for identifying and describing things in conversation.",
        "That (Specific Reference) with 那個",
        "that (specific thing/person) + description",
        [
            "When pointing out something specific",
            "When identifying a person by their characteristics",
            "When comparing or distinguishing between items"
        ],
        [
            "Do not drop the measure word — 那書 is incorrect, use 那本書",
            "Different nouns take different measure words"
        ],
        "In Taiwan, 那個 (nèige in casual speech) is extremely common both as a determiner ('that one') and as a filler word in conversation.",
        "那 + Measure Word + Noun + 的 + Description.",
        "English: 'That person wearing a hat.' Chinese: 那個戴帽子的人。(That GE wear hat DE person).",
        "Korean: '저 모자 쓴 사람.' Chinese 那 + MW + N + 的 corresponds to Korean '저/그 + N'.",
        get_sentence_ids_for_day(sentences, 51, 4)[:4],
        [
            {"text": "那個穿紅色衣服的人是我朋友。", "pinyin": "Nà ge chuān hóngsè yīfu de rén shì wǒ péngyou.", "translation_en": "That person wearing red clothes is my friend."},
        ]
    ))
    
    # ========== DAY 52: Comparison with 比 ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D52_BI_COMPARISON",
        "A + 比 + B + adjective",
        ["A", "比", "B", "adjective"],
        "Use 比 (bǐ) to compare two things, meaning 'A is more ADJ than B'. This is the fundamental comparison pattern in Chinese. It is extremely common in daily Taiwan conversation for comparing prices, quality, speed, etc.",
        "Comparison with 比",
        "compared to; more than (comparison marker)",
        [
            "When comparing two things (prices, quality, people, places)",
            "When making shopping decisions",
            "When discussing preferences and choices"
        ],
        [
            "Do not use 很 before the adjective in a 比 comparison",
            "Do not use 比 for equality (use 跟...一樣 instead)",
            "The adjective after 比 must be a gradable adjective"
        ],
        "Taiwan speakers use 比 constantly when shopping, discussing food, and comparing options. It's one of the most practical patterns for daily life.",
        "A + 比 + B + Adjective. The adjective comes AFTER both nouns, unlike English 'A is ADJ-er than B'.",
        "English: 'A is cheaper than B.' Chinese: A比B便宜 (A compared-to B cheap). No 'more' — the 比 structure already implies comparison.",
        "Korean: 'A가 B보다 싸다.' Chinese 比 is similar to Korean '보다'.",
        get_sentence_ids_for_day(sentences, 52, 6),
        [
            {"text": "這家餐廳的牛肉麵比那家好吃。", "pinyin": "Zhè jiā cāntīng de niúròumiàn bǐ nà jiā hǎochī.", "translation_en": "The beef noodles at this restaurant are tastier than those at that one."},
            {"text": "便利商店的咖啡比咖啡店便宜很多。", "pinyin": "Biànlì shāngdiàn de kāfēi bǐ kāfēidiàn piányí hěnduō.", "translation_en": "The coffee at convenience stores is much cheaper than at coffee shops."},
            {"text": "坐捷運比坐公車快，也比較方便。", "pinyin": "Zuò jiéyùn bǐ zuò gōngchē kuài, yě bǐjiào fāngbiàn.", "translation_en": "Taking the MRT is faster than taking the bus, and also more convenient."},
            {"text": "這家店的服務態度比那家好很多。", "pinyin": "Zhè jiā diàn de fúwù tàidù bǐ nà jiā hǎo hěnduō.", "translation_en": "The service attitude at this shop is much better than at that one."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D52_BIJIAO",
        "Subject + 比較 + adjective / A + 比 + B + 比較 + adjective",
        ["subject", "比較", "adjective"],
        "Use 比較 (bǐjiào) to mean 'comparatively' or 'relatively'. It can be used alone to say something is 'more ADJ' in a general sense, or combined with 比 to soften the comparison. In Taiwan, 比較 is extremely common in everyday speech.",
        "Comparatively with 比較",
        "comparatively; relatively; more",
        [
            "When saying something is comparatively more [adjective]",
            "When softening a comparison to be polite",
            "When making a general comparison without explicitly naming B"
        ],
        [
            "Do not use 比較 with extreme adjectives",
            "比較 can be used without 比 for a general comparison"
        ],
        "Taiwan speakers love 比較. It's a softer, more flexible way to compare than the strict 比 pattern. '這個比較好' (This one is better) is heard all the time.",
        "比較 + Adjective / 比 + B + 比較 + Adjective.",
        "English: 'This one is better.' Chinese: 這個比較好。(This compare good). 比較 adds the comparative meaning.",
        "Korean: '이게 더 좋아요.' Chinese 比較 corresponds to Korean '더' (more).",
        get_sentence_ids_for_day(sentences, 52, 4)[:4],
        [
            {"text": "坐捷運比坐公車快，也比較方便。", "pinyin": "Zuò jiéyùn bǐ zuò gōngchē kuài, yě bǐjiào fāngbiàn.", "translation_en": "Taking the MRT is faster than taking the bus, and also more convenient."},
            {"text": "同樣的價格，我覺得買這個比較划算。", "pinyin": "Tóngyàng de jiàgé, wǒ juéde mǎi zhège bǐjiào huásuàn.", "translation_en": "At the same price, I think buying this one is more cost-effective."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D52_MEIYOU_COMPARISON",
        "A + 沒有 + B + (那麼) + adjective",
        ["A", "沒有", "B", "那麼", "adjective"],
        "Use 沒有 (méiyǒu) for negative comparison: 'A is not as ADJ as B'. Adding 那麼 (nàme, 'that/so') before the adjective is common and natural. This pattern is used when A falls short of B in some quality.",
        "Negative Comparison with 沒有",
        "not as...as (negative comparison)",
        [
            "When saying something is not as good/big/expensive as something else",
            "When managing expectations or making a modest comparison",
            "When correcting an assumption about relative quality"
        ],
        [
            "Do not use 不比 for simple negative comparison — 不比 implies 'not more than' which has a different nuance",
            "Do not drop 那麼 in most cases — it makes the sentence more natural"
        ],
        "In Taiwan, 沒有...那麼... is the go-to pattern for 'not as X as Y'. It's straightforward and widely used.",
        "A + 沒有 + B + 那麼 + Adjective.",
        "English: 'This is not as expensive as that.' Chinese: 這個沒有那個那麼貴。(This not-have that so expensive).",
        "Korean: '이게 저것만큼 비싸지 않아요.' Chinese 沒有...那麼 corresponds to Korean '~만큼 ~지 않다'.",
        get_sentence_ids_for_day(sentences, 52, 4)[:4],
        [
            {"text": "公車沒有捷運那麼快。", "pinyin": "Gōngchē méiyǒu jiéyùn nàme kuài.", "translation_en": "The bus is not as fast as the MRT."},
            {"text": "這家店沒有那家那麼好吃。", "pinyin": "Zhè jiā diàn méiyǒu nà jiā nàme hǎochī.", "translation_en": "This restaurant is not as delicious as that one."},
        ]
    ))
    
    # ========== DAY 53: Frequency ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D53_CHANGCHANG",
        "Subject + 常常 + verb (+ object)",
        ["subject", "常常", "verb", "object"],
        "Use 常常 (chángcháng) before a verb to indicate that an action happens often or frequently. It is one of the most common frequency adverbs in Taiwan Mandarin.",
        "Often/Frequently with 常常",
        "often; frequently",
        [
            "When describing habits and routines",
            "When talking about things that happen regularly",
            "When contrasting frequency of different activities"
        ],
        [
            "Do not use 常常 for one-time events",
            "常常 goes before the verb, never at the end"
        ],
        "Taiwan speakers frequently use 常常 in daily conversation about routines, habits, and preferences. 常 alone can also be used in more casual speech.",
        "Subject + 常常 + Verb (+ Object). Frequency adverbs always go before the verb.",
        "English: 'I often go there.' Chinese: 我常常去那裡。(I often go there). Same word order.",
        "Korean: '자주 가요.' Chinese 常常 corresponds to Korean '자주'.",
        get_sentence_ids_for_day(sentences, 53, 6),
        [
            {"text": "我常常去那家咖啡店。", "pinyin": "Wǒ chángcháng qù nà jiā kāfēi diàn.", "translation_en": "I often go to that coffee shop."},
            {"text": "他常常加班。", "pinyin": "Tā chángcháng jiābān.", "translation_en": "He often works overtime."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D53_YOU_SHIHOU",
        "Subject + 有時候 + verb / 有時候 + subject + verb",
        ["有時候", "subject", "verb"],
        "Use 有時候 (yǒu shíhou) to mean 'sometimes'. It can go before or after the subject. This is one of the most natural-sounding frequency expressions in Taiwan Mandarin.",
        "Sometimes with 有時候",
        "sometimes; at times",
        [
            "When something happens occasionally but not regularly",
            "When contrasting with 常常 (often) or 從來不 (never)",
            "When describing variable situations"
        ],
        [
            "Do not confuse 有時候 (sometimes) with 有的時候 (there are times when)",
            "有時候 is more casual — use 有時 in formal writing"
        ],
        "有時候 is very commonly used in Taiwan conversation. It's more natural than the shorter 有時 in casual speech.",
        "有時候 + Clause / Subject + 有時候 + Verb.",
        "English: 'Sometimes I don't understand.' Chinese: 我有時候聽不懂。(I sometimes listen-not-understand).",
        "Korean: '가끔 이해 못해요.' Chinese 有時候 corresponds to Korean '가끔'.",
        get_sentence_ids_for_day(sentences, 53, 4)[:4],
        [
            {"text": "我有時候會去夜市吃東西。", "pinyin": "Wǒ yǒu shíhou huì qù yèshì chī dōngxi.", "translation_en": "Sometimes I go to the night market to eat."},
            {"text": "有時候我覺得中文很難。", "pinyin": "Yǒu shíhou wǒ juéde Zhōngwén hěn nán.", "translation_en": "Sometimes I think Chinese is very difficult."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D53_XIHUAN_VERB_OBJECT",
        "Subject + 喜歡 + verb + object / Subject + 喜歡 + noun",
        ["subject", "喜歡", "verb", "object"],
        "Use 喜歡 (xǐhuān) to express liking something or enjoying doing something. 喜歡 can be followed by a noun (我喜歡咖啡) or a verb phrase (我喜歡喝咖啡). This is an essential pattern for expressing preferences.",
        "Like/Enjoy with 喜歡",
        "to like; to enjoy; to be fond of",
        [
            "When expressing preferences and tastes",
            "When talking about hobbies and free time activities",
            "When choosing between options"
        ],
        [
            "Do not use 很 with 喜歡 to mean 'like' — 很喜歡 means 'really like'",
            "喜歡 + verb is the correct pattern for 'like doing'"
        ],
        "In Taiwan, 喜歡 is used frequently. Adding 很 before it (很喜歡) is the natural way to say you like something, not just to say 'really like'.",
        "Subject + 喜歡 + Noun / Subject + 喜歡 + Verb + Object.",
        "English: 'I like drinking coffee.' Chinese: 我喜歡喝咖啡。(I like drink coffee). Both languages use the same structure.",
        "Korean: '커피 마시는 것을 좋아해요.' Chinese 喜歡 corresponds to Korean '좋아하다'.",
        get_sentence_ids_for_day(sentences, 53, 4)[:4],
        [
            {"text": "我喜歡聽音樂。", "pinyin": "Wǒ xǐhuān tīng yīnyuè.", "translation_en": "I like listening to music."},
            {"text": "她喜歡看電影。", "pinyin": "Tā xǐhuān kàn diànyǐng.", "translation_en": "She likes watching movies."},
        ]
    ))
    
    # ========== DAY 54: Suggestions with 要不要 ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D54_YAOBUYAO",
        "Subject + 要不要 + verb (+ object) + ？",
        ["subject", "要不要", "verb", "object"],
        "Use 要不要 (yào bú yào) to make a suggestion or invitation, meaning 'Do you want to...?' or 'How about...?'. This is one of the most common ways to suggest an activity in Taiwan.",
        "Suggestions with 要不要",
        "Do you want to...? / How about...?",
        [
            "When suggesting an activity to someone",
            "When inviting someone to do something together",
            "When offering something to someone"
        ],
        [
            "Do not use 要不要 for formal invitations — use 要不要一起... for casual suggestions",
            "Do not confuse with 想不想 (xiǎng bù xiǎng) which is about desire, not suggestion"
        ],
        "Taiwan speakers use 要不要 constantly for casual invitations. It's friendly and natural. Adding 一起 (yīqǐ, together) makes it extra warm: 要不要一起去？",
        "Subject + 要不要 + Verb (+ Object) + ?",
        "English: 'Do you want to eat?' Chinese: 你要不要吃飯？(You want-not-want eat rice?). The A-not-A form replaces 'Do you...?'",
        "Korean: '~을래요?' Chinese 要不要 corresponds to Korean '~을래요?'.",
        get_sentence_ids_for_day(sentences, 54, 6),
        [
            {"text": "你要不要一起去吃飯？", "pinyin": "Nǐ yào bú yào yīqǐ qù chī fàn?", "translation_en": "Do you want to go eat together?"},
            {"text": "我們要不要去看電影？", "pinyin": "Wǒmen yào bú yào qù kàn diànyǐng?", "translation_en": "Shall we go watch a movie?"},
            {"text": "你要不要試試看？", "pinyin": "Nǐ yào bú yào shì shì kàn?", "translation_en": "Do you want to give it a try?"},
            {"text": "要不要我幫你？", "pinyin": "Yào bú yào wǒ bāng nǐ?", "translation_en": "Do you want me to help you?"}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D54_GAI_TIME",
        "Subject + 該 + verb + 了",
        ["subject", "該", "verb", "了"],
        "Use 該 (gāi) to mean 'should' or 'it's time to'. Adding 了 at the end emphasizes that the time has come. 該...了 is the most natural way to say 'it's time to...' in Taiwan Mandarin.",
        "It's Time To with 該...了",
        "should; ought to; it's time to",
        [
            "When saying it's time to do something",
            "When suggesting someone should do something",
            "When talking about obligations and schedules"
        ],
        [
            "Do not confuse 該 (should/time to) with 應該 (should/ought to) — 該...了 specifically means 'it's time'",
            "該 can sound direct — add 吧 to soften: 該走了吧 (it's probably time to go, right?)"
        ],
        "In Taiwan, 該...了 is commonly used for daily transitions: 該吃飯了 (time to eat), 該回家了 (time to go home), 該睡覺了 (time to sleep).",
        "Subject + 該 + Verb (+ Object) + 了.",
        "English: 'It's time to go.' Chinese: 該走了。(Should go LE). 該 + 了 means 'it's time to'.",
        "Korean: '~할 시간이야.' Chinese 該...了 corresponds to Korean '~할 시간이다'.",
        get_sentence_ids_for_day(sentences, 54, 4)[:4],
        [
            {"text": "我們該走了。", "pinyin": "Wǒmen gāi zǒu le.", "translation_en": "We should go now (it's time to go)."},
            {"text": "你該休息了。", "pinyin": "Nǐ gāi xiūxi le.", "translation_en": "You should rest now (it's time to rest)."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D54_BUHAOYISI",
        "不好意思 + request / 不好意思，+ statement",
        ["不好意思", "request/statement"],
        "Use 不好意思 (bù hǎo yìsi) to politely get someone's attention, apologize for a minor inconvenience, or preface a request. It is the Swiss Army knife of Taiwan politeness — used constantly in daily life.",
        "Excuse Me / Sorry with 不好意思",
        "excuse me; sorry; pardon me (polite opener)",
        [
            "When getting someone's attention politely",
            "When apologizing for a minor inconvenience",
            "When making a request of a stranger",
            "When declining something politely"
        ],
        [
            "Do not use 不好意思 for serious apologies — use 對不起 (duìbuqǐ) for genuine mistakes",
            "Do not overuse in very casual settings with close friends"
        ],
        "In Taiwan, 不好意思 is heard everywhere — in shops, on the MRT, in restaurants. It's the most versatile polite expression. You can start almost any request with it.",
        "不好意思，+ Request/Sentence.",
        "English: 'Excuse me, could you...?' Chinese: 不好意思，可以...嗎？",
        "Korean: '실례합니다 / 죄송합니다.' Chinese 不好意思 is between Korean '실례합니다' and '죄송합니다' in politeness.",
        get_sentence_ids_for_day(sentences, 54, 4)[:4],
        [
            {"text": "不好意思，可以幫我一個忙嗎？", "pinyin": "Bù hǎo yìsi, kěyǐ bāng wǒ yī ge máng ma?", "translation_en": "Excuse me, could you help me with something?"},
            {"text": "不好意思，請問捷運站怎麼走？", "pinyin": "Bù hǎo yìsi, qǐngwèn jiéyùn zhàn zěnme zǒu?", "translation_en": "Excuse me, how do I get to the MRT station?"},
        ]
    ))
    
    # ========== DAY 55: Review (Narration) ==========
    grammar_entries.append(make_review_entry("GR_D55_REVIEW_NARRATION", "Narration & Sequencing Review", "46-54", 
        get_sentence_ids_for_day(sentences, 55, 6)))
    
    # ========== DAY 56: Body & Health ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D56_BODY_HURTS",
        "Body part + 不舒服 / Body part + 痛 / Body part + 不舒服，+ description",
        ["body part", "不舒服/痛", "description"],
        "Use 不舒服 (bù shūfu, 'uncomfortable') or 痛 (tòng, 'painful/hurts') after a body part to describe physical discomfort. This is essential for visiting a doctor or pharmacy in Taiwan.",
        "Body Aches with 不舒服 / 痛",
        "uncomfortable; painful; hurts",
        [
            "When describing physical symptoms",
            "When visiting a doctor or pharmacy",
            "When explaining why you can't do something"
        ],
        [
            "Do not use 不舒服 for emotional discomfort (use 心情不好)",
            "痛 is for acute pain, 不舒服 is for general discomfort"
        ],
        "In Taiwan, knowing how to describe symptoms in Chinese is very practical. Pharmacies are common and pharmacists can give advice for minor issues.",
        "Body Part + 不舒服 / Body Part + 很痛.",
        "English: 'My head hurts.' Chinese: 我頭痛 / 我頭不舒服。(I head hurts / I head uncomfortable).",
        "Korean: '머리가 아파요.' Chinese 痛/不舒服 corresponds to Korean '아프다/불편하다'.",
        get_sentence_ids_for_day(sentences, 56, 6),
        [
            {"text": "我頭痛。", "pinyin": "Wǒ tóu tòng.", "translation_en": "I have a headache."},
            {"text": "他肚子不舒服。", "pinyin": "Tā dùzi bù shūfu.", "translation_en": "His stomach is uncomfortable."},
            {"text": "我喉嚨痛。", "pinyin": "Wǒ hóulóng tòng.", "translation_en": "My throat hurts."},
            {"text": "她覺得身體不舒服。", "pinyin": "Tā juéde shēntǐ bù shūfu.", "translation_en": "She feels physically unwell."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D56_YOU_DIAN_SYMPTOM",
        "Subject + 有點 + adjective / Subject + 有一點 + adjective",
        ["subject", "有點", "adjective"],
        "Use 有點 (yǒu diǎn) or 有一點 (yǒu yī diǎn) to mean 'a little' or 'slightly'. This is the most natural way to describe mild symptoms in Taiwan Mandarin.",
        "A Little / Slightly with 有點",
        "a little; slightly; somewhat",
        [
            "When describing mild symptoms or discomfort",
            "When softening a negative description",
            "When something is slightly different from expected"
        ],
        [
            "Do not use 有點 with positive adjectives (not 有點好吃 — use 還不錯 instead)",
            "有點 is typically used with negative or neutral descriptions"
        ],
        "Taiwan speakers frequently use 有點 to soften statements. '我有點不舒服' sounds more polite and less alarming than '我不舒服'.",
        "Subject + 有點 + Adjective.",
        "English: 'I feel a little tired.' Chinese: 我有點累。(I have-dot tired).",
        "Korean: '좀 피곤해요.' Chinese 有點 corresponds to Korean '좀/조금'.",
        get_sentence_ids_for_day(sentences, 56, 4)[:4],
        [
            {"text": "我有點不舒服。", "pinyin": "Wǒ yǒu diǎn bù shūfu.", "translation_en": "I feel a little uncomfortable."},
            {"text": "他覺得有點累。", "pinyin": "Tā juéde yǒu diǎn lèi.", "translation_en": "He feels a little tired."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D56_JI_TIAN",
        "幾 + measure word + noun / 幾天 / 幾個",
        ["幾", "measure word", "noun"],
        "Use 幾 (jǐ) to ask 'how many' or 'a few'. 幾天 (jǐ tiān) can mean 'how many days' or 'a few days' depending on context. In statements, it typically means 'a few', and in questions, 'how many'.",
        "How Many / A Few with 幾",
        "how many; a few; several",
        [
            "When asking about quantity (how many days/hours/people)",
            "When describing a small, unspecified number (a few days)",
            "In medical contexts: 'How many days have you had this?'"
        ],
        [
            "Do not confuse 幾 (how many, usually <10) with 多少 (duōshao, how many, any amount)",
            "幾 requires a measure word: 幾個人, not 幾人"
        ],
        "In Taiwan, 幾天 is frequently used both as a question and as a statement. Context and intonation distinguish the two uses.",
        "幾 + Measure Word + Noun.",
        "English: 'a few days' / 'how many days?' Chinese: 幾天 — same phrase, different context.",
        "Korean: '며칠' (a few days / how many days). Chinese 幾天 is similar to Korean '며칠'.",
        get_sentence_ids_for_day(sentences, 56, 4)[:4],
        [
            {"text": "我已經不舒服好幾天了。", "pinyin": "Wǒ yǐjīng bù shūfu hǎo jǐ tiān le.", "translation_en": "I've been feeling unwell for several days already."},
            {"text": "你幾天沒睡覺了？", "pinyin": "Nǐ jǐ tiān méi shuìjiào le?", "translation_en": "How many days have you not slept?"},
        ]
    ))
    
    # ========== DAY 57: Medicine & Treatment ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D57_YAO_MEDICINE",
        "Subject + 要 + verb (+ object) / Subject + 要 + noun",
        ["subject", "要", "verb/noun"],
        "Use 要 (yào) to express 'need' or 'want'. In medical contexts, 要 often means 'need to' (take medicine, see a doctor). 要 can also mean 'will' depending on context.",
        "Need / Want with 要",
        "to need; to want; will; going to",
        [
            "When you need to do something (take medicine, rest)",
            "When requesting something at a pharmacy or clinic",
            "When expressing intention or necessity"
        ],
        [
            "Do not confuse 要 (need/want) with 想 (would like — softer)",
            "要 is more direct than 想 — use 想 for polite requests"
        ],
        "In Taiwan, 我要買藥 (I need to buy medicine) is direct and common at pharmacies. 我要 + verb is a very frequent pattern in daily life.",
        "Subject + 要 + Verb (+ Object) / Subject + 要 + Noun.",
        "English: 'I need to buy medicine.' Chinese: 我要買藥。(I want/need buy medicine). 要 can mean both want and need.",
        "Korean: '약을 사야 해요.' Chinese 要 corresponds to both Korean '~해야 하다' (must) and '~고 싶다' (want).",
        get_sentence_ids_for_day(sentences, 57, 6),
        [
            {"text": "我要買感冒藥。", "pinyin": "Wǒ yào mǎi gǎnmào yào.", "translation_en": "I need to buy cold medicine."},
            {"text": "你要看醫生嗎？", "pinyin": "Nǐ yào kàn yīshēng ma?", "translation_en": "Do you need to see a doctor?"},
            {"text": "我要吃藥。", "pinyin": "Wǒ yào chī yào.", "translation_en": "I need to take medicine."},
            {"text": "他要休息。", "pinyin": "Tā yào xiūxi.", "translation_en": "He needs to rest."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D57_MEI_TIAN_TIMES",
        "每天 + verb + number + 次 / 一天 + number + 次",
        ["每天", "verb", "number", "次"],
        "Use 次 (cì) as a measure word for occurrences or times. 一天三次 (yī tiān sān cì) means 'three times a day'. This is essential for understanding medication instructions in Taiwan.",
        "Times Per Day with 次",
        "times; occurrences (frequency measure word)",
        [
            "When talking about medication frequency",
            "When describing how often you do something",
            "When giving or receiving instructions about frequency"
        ],
        [
            "Do not confuse 次 (times/occurrences) with 遍 (biàn, times through from start to finish)",
            "次 is for counting occurrences, 遍 is for counting complete repetitions"
        ],
        "In Taiwan pharmacies, medication instructions often say 一天三次 (three times a day) or 每天兩次 (twice a day). Understanding 次 is practical for daily life.",
        "Time Period + Verb + Number + 次 / Number + 次 + 一天.",
        "English: 'Take this three times a day.' Chinese: 一天吃三次。(One day eat three times).",
        "Korean: '하루에 세 번.' Chinese 次 corresponds to Korean '번'.",
        get_sentence_ids_for_day(sentences, 57, 4)[:4],
        [
            {"text": "這個藥一天吃三次。", "pinyin": "Zhège yào yī tiān chī sān cì.", "translation_en": "Take this medicine three times a day."},
            {"text": "我每天運動兩次。", "pinyin": "Wǒ měitiān yùndòng liǎng cì.", "translation_en": "I exercise twice a day."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D57_KEYI_BUKEYI_MEDICAL",
        "可以 + verb + 嗎？/ 可不可以 + verb？",
        ["可以/可不可以", "verb", "嗎"],
        "Use 可以...嗎 or 可不可以... to ask for permission or whether something is allowed. In medical contexts: 'Can I take this medicine?' 'Can I eat before taking this?'",
        "Permission Questions in Medical Context",
        "Can I...? / Is it okay to...?",
        [
            "When asking if you can do something (take medicine with food, etc.)",
            "When asking a pharmacist or doctor for guidance",
            "When confirming instructions"
        ],
        [
            "Do not use 會 for permission — 會 is about ability/skill",
            "可以 is for permission and possibility"
        ],
        "可以...嗎 is one of the most useful question patterns in Taiwan. It's polite and clear.",
        "可以 + Verb + Object + 嗎？/ 可不可以 + Verb + Object？",
        "English: 'Can I take this with food?' Chinese: 可以跟飯一起吃嗎？",
        "Korean: '~해도 돼요?' Chinese 可以...嗎 corresponds to Korean '~해도 돼요?'.",
        get_sentence_ids_for_day(sentences, 57, 4)[:4],
        [
            {"text": "這個藥可以跟飯一起吃嗎？", "pinyin": "Zhège yào kěyǐ gēn fàn yīqǐ chī ma?", "translation_en": "Can I take this medicine with food?"},
            {"text": "我可以喝水嗎？", "pinyin": "Wǒ kěyǐ hē shuǐ ma?", "translation_en": "Can I drink water?"},
        ]
    ))
    
    # ========== DAY 58: Locations & Facilities ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D58_YOU_FACILITY",
        "Place + 有 + facility / Place + 沒有 + facility",
        ["place", "有/沒有", "facility"],
        "Use 有 (yǒu) to indicate that a place has something (a facility, feature, or amenity). 沒有 (méiyǒu) means the place doesn't have it. This pattern is essential for describing locations in Taiwan.",
        "Place Has / Doesn't Have with 有/沒有",
        "has; there is / doesn't have; there isn't",
        [
            "When describing what facilities a place has",
            "When asking about amenities (WiFi, bathroom, etc.)",
            "When comparing different locations"
        ],
        [
            "Do not use 是 for existence — 是 is for identity, 有 is for possession/existence",
            "Place + 有 + thing is the standard pattern"
        ],
        "In Taiwan, asking '這裡有WiFi嗎？' (Does this place have WiFi?) or '有廁所嗎？' (Is there a bathroom?) are daily-life essentials.",
        "Place + 有 + Noun / Place + 沒有 + Noun.",
        "English: 'This place has WiFi.' Chinese: 這裡有WiFi。(Here has WiFi). 有 means 'has/there is'.",
        "Korean: '여기 WiFi 있어요.' Chinese 有 corresponds to Korean '있다'.",
        get_sentence_ids_for_day(sentences, 58, 6),
        [
            {"text": "這家店有免費的WiFi。", "pinyin": "Zhè jiā diàn yǒu miǎnfèi de WiFi.", "translation_en": "This shop has free WiFi."},
            {"text": "公園裡面有廁所嗎？", "pinyin": "Gōngyuán lǐmiàn yǒu cèsuǒ ma?", "translation_en": "Is there a bathroom inside the park?"},
            {"text": "這家大樓有電梯。", "pinyin": "Zhè jiā dàlóu yǒu diàntī.", "translation_en": "This building has an elevator."},
            {"text": "那家餐廳沒有冷氣。", "pinyin": "Nà jiā cāntīng méiyǒu lěngqì.", "translation_en": "That restaurant doesn't have air conditioning."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D58_LOCATION_EXISTENCE",
        "在 + location + 有 + thing / Location + 有 + thing",
        ["在", "location", "有", "thing"],
        "Use 在...有 (zài...yǒu) to say 'at [location] there is [thing]'. This pattern combines location marking with existence. 在 marks the location, 有 marks existence.",
        "At Location There Is with 在...有",
        "at [location] there is...",
        [
            "When describing what exists at a specific location",
            "When giving directions that reference landmarks",
            "When explaining where something can be found"
        ],
        [
            "Do not use 在 and 有 in the wrong order — 在 comes first for location",
            "在...有 can be shortened to just Location + 有 in casual speech"
        ],
        "Taiwan speakers often drop 在 and just say Location + 有: '車站有7-11' (The station has a 7-11).",
        "在 + Location + 有 + Thing.",
        "English: 'There is a convenience store at the station.' Chinese: 在車站有便利商店。(At station has convenience store).",
        "Korean: '역에 편의점이 있어요.' Chinese 在...有 corresponds to Korean '~에 ~이/가 있다'.",
        get_sentence_ids_for_day(sentences, 58, 4)[:4],
        [
            {"text": "在捷運站附近有一家藥局。", "pinyin": "Zài jiéyùn zhàn fùjìn yǒu yī jiā yàojú.", "translation_en": "There is a pharmacy near the MRT station."},
            {"text": "醫院旁邊有停車場。", "pinyin": "Yīyuàn pángbiān yǒu tíngchēchǎng.", "translation_en": "There is a parking lot next to the hospital."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D58_BROKEN",
        "Thing + 壞了 / Thing + 不能用 / Thing + 有問題",
        ["thing", "壞了", "description"],
        "Use 壞了 (huài le) to say something is broken or not working. 不能用 (bù néng yòng) means 'can't use'. 有問題 (yǒu wèntí) means 'has a problem'. These are essential for reporting issues in Taiwan.",
        "Broken / Not Working",
        "broken; out of order; not working",
        [
            "When something is broken or not functioning",
            "When reporting an issue to staff or a landlord",
            "When explaining why you can't use something"
        ],
        [
            "Do not use 破了 (pò le, torn/broken through) for machines — use 壞了",
            "壞了 is for malfunction, 破了 is for physical breaking/tearing"
        ],
        "In Taiwan, if something in your apartment or at a store isn't working, 壞了 is the word to use. It's direct and clear.",
        "Thing + 壞了 / Thing + 不能用.",
        "English: 'The air conditioner is broken.' Chinese: 冷氣壞了。(AC broken LE).",
        "Korean: '에어컨이 고장 났어요.' Chinese 壞了 corresponds to Korean '고장 났다'.",
        get_sentence_ids_for_day(sentences, 58, 4)[:4],
        [
            {"text": "電梯壞了。", "pinyin": "Diàntī huài le.", "translation_en": "The elevator is broken."},
            {"text": "冷氣不能用。", "pinyin": "Lěngqì bù néng yòng.", "translation_en": "The air conditioner can't be used."},
        ]
    ))
    
    # ========== DAY 59: Asking for Help ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D59_QING_HELP",
        "請 + verb / 請你 + verb / 麻煩你 + verb",
        ["請/麻煩你", "verb", "object"],
        "Use 請 (qǐng) or 麻煩你 (máfan nǐ) to politely ask someone to do something. 請 is 'please', 麻煩你 is 'may I trouble you to...' — slightly more polite. Both are essential for daily interactions in Taiwan.",
        "Polite Requests with 請 / 麻煩你",
        "please; may I trouble you to...",
        [
            "When asking someone for help",
            "When making a polite request of a stranger",
            "In service situations (restaurants, stores, etc.)"
        ],
        [
            "Do not use 請 alone without a verb — it needs an action",
            "麻煩你 is more deferential than 請 alone"
        ],
        "Taiwan service culture is very polite. Starting a request with 麻煩你 or 請 is expected and appreciated. It's one of the most useful phrases to know.",
        "請 (+ 你) + Verb (+ Object) / 麻煩你 + Verb (+ Object).",
        "English: 'Please help me.' Chinese: 請幫我 / 麻煩你幫我。(Please help me / Trouble-you help me).",
        "Korean: '도와주세요 / 실례지만 도와주시겠어요?' Chinese 請/麻煩你 corresponds to Korean '~주세요/실례지만'.",
        get_sentence_ids_for_day(sentences, 59, 6),
        [
            {"text": "請幫我一個忙。", "pinyin": "Qǐng bāng wǒ yī ge máng.", "translation_en": "Please help me with something."},
            {"text": "麻煩你幫我拿一下。", "pinyin": "Máfan nǐ bāng wǒ ná yīxià.", "translation_en": "Could you please help me carry this for a moment?"},
            {"text": "不好意思，請等一下。", "pinyin": "Bù hǎo yìsi, qǐng děng yīxià.", "translation_en": "Excuse me, please wait a moment."},
            {"text": "麻煩你再說一次。", "pinyin": "Máfan nǐ zài shuō yī cì.", "translation_en": "Could you please say that again?"}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D59_SHENME_SHIHOU_KEYI",
        "什麼時候 + 可以 + verb？/ 什麼時候 + verb + 比較好？",
        ["什麼時候", "可以", "verb"],
        "Use 什麼時候 (shénme shíhou) to ask 'when' or 'what time'. Combined with 可以, it asks 'when can I...?' This is essential for scheduling and asking about availability in Taiwan.",
        "When Can I with 什麼時候",
        "when; what time",
        [
            "When asking about timing or scheduling",
            "When asking when something is available",
            "When asking for the best time to do something"
        ],
        [
            "Do not confuse 什麼時候 (when) with 幾點 (what time specifically)",
            "什麼時候 is more general, 幾點 asks for a specific clock time"
        ],
        "In Taiwan, 什麼時候 is used constantly. For specific times, follow up with 幾點: '你什麼時候有空？幾點比較好？'",
        "什麼時候 + Verb？/ Subject + 什麼時候 + Verb？",
        "English: 'When can I come?' Chinese: 我什麼時候可以來？(I when can come?). Time word before verb.",
        "Korean: '언제 올 수 있어요?' Chinese 什麼時候 corresponds to Korean '언제'.",
        get_sentence_ids_for_day(sentences, 59, 4)[:4],
        [
            {"text": "我什麼時候可以拿？", "pinyin": "Wǒ shénme shíhou kěyǐ ná?", "translation_en": "When can I pick it up?"},
            {"text": "什麼時候比較方便？", "pinyin": "Shénme shíhou bǐjiào fāngbiàn?", "translation_en": "When would be more convenient?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D59_MAYBE_PROBLEM",
        "可能 + statement / 也許 + statement / 說不定 + statement",
        ["可能/也許", "statement"],
        "Use 可能 (kěnéng, 'maybe/possibly') or 也許 (yěxǔ, 'perhaps') to express uncertainty. These are essential for polite, non-committal responses in Taiwan culture.",
        "Maybe/Possibly with 可能/也許",
        "maybe; perhaps; possibly",
        [
            "When you're not sure about something",
            "When giving a polite, non-committal answer",
            "When speculating about why something happened"
        ],
        [
            "Do not use 可能 for things that are definitely true",
            "可能 can also mean 'possible': 不可能 = impossible"
        ],
        "Taiwan communication style often uses 可能 and 也許 to soften statements and avoid being too direct. This is culturally important.",
        "可能/也許 + Statement.",
        "English: 'Maybe there is a problem.' Chinese: 可能有問題。(Maybe have problem).",
        "Korean: '아마 문제가 있을 거예요.' Chinese 可能/也許 corresponds to Korean '아마/아마도'.",
        get_sentence_ids_for_day(sentences, 59, 4)[:4],
        [
            {"text": "可能有問題。", "pinyin": "Kěnéng yǒu wèntí.", "translation_en": "There might be a problem."},
            {"text": "也許明天會比較好。", "pinyin": "Yěxǔ míngtiān huì bǐjiào hǎo.", "translation_en": "Perhaps tomorrow will be better."},
        ]
    ))
    
    # ========== DAY 60: Assessment Review ==========
    grammar_entries.append(make_review_entry("GR_D60_ASSESSMENT_REVIEW", "Assessment & Review (Days 46-59)", "46-59",
        get_sentence_ids_for_day(sentences, 60, 6)))
    
    # ========== DAY 61: Cause & Result ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D61_FASHENG",
        "Subject + 發生 + 了 + event / Event + 發生了",
        ["subject", "發生", "了", "event"],
        "Use 發生 (fāshēng) to mean 'happen' or 'occur'. It is used for events, incidents, and things that took place. 發生了 marks a completed occurrence.",
        "Happened with 發生",
        "to happen; to occur; to take place",
        [
            "When describing something that happened",
            "When asking what happened",
            "When reporting an incident or event"
        ],
        [
            "Do not use 發生 for planned events — use 舉辦 (jǔbàn) or 開 (kāi)",
            "發生 is for things that occur, especially unexpected things"
        ],
        "In Taiwan, 發生什麼事了？(What happened?) is a very common question. 發生 is the go-to word for describing occurrences.",
        "Subject + 發生 + 了 (+ Event). / Event + 發生了.",
        "English: 'What happened?' Chinese: 發生什麼事了？(Happen what thing LE?).",
        "Korean: '무슨 일이 있었어요?' Chinese 發生 corresponds to Korean '발생하다/일어나다'.",
        get_sentence_ids_for_day(sentences, 61, 6),
        [
            {"text": "發生了什麼事？", "pinyin": "Fāshēng le shénme shì?", "translation_en": "What happened?"},
            {"text": "昨天發生了一個小意外。", "pinyin": "Zuótiān fāshēng le yī ge xiǎo yìwài.", "translation_en": "A small accident happened yesterday."},
            {"text": "這裡發生了什麼事？", "pinyin": "Zhèlǐ fāshēng le shénme shì?", "translation_en": "What happened here?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D61_JIEGUO",
        "結果 + result / Cause，結果 + result",
        ["cause", "結果", "result"],
        "Use 結果 (jiéguǒ) to mean 'as a result' or 'in the end'. It connects a situation or cause to its outcome. This is essential for storytelling and explaining sequences of events.",
        "Result/Outcome with 結果",
        "as a result; in the end; it turned out that",
        [
            "When explaining what happened as a result of something",
            "When telling a story with an unexpected outcome",
            "When describing the conclusion of a sequence"
        ],
        [
            "Do not confuse 結果 (result) with 所以 (therefore) — 結果 is more about the actual outcome",
            "結果 often implies the outcome was different from what was expected"
        ],
        "Taiwan speakers use 結果 frequently in storytelling. It often carries a slight sense of 'and you know what happened?' — making narratives more engaging.",
        "Clause (cause/situation)，結果 + Clause (outcome).",
        "English: 'I planned to go, but in the end I didn't.' Chinese: 我本來想去，結果沒去。(I originally wanted go, result not go).",
        "Korean: '결국 안 갔어요.' Chinese 結果 corresponds to Korean '결국/결과적으로'.",
        get_sentence_ids_for_day(sentences, 61, 4)[:4],
        [
            {"text": "我本來想去，結果沒去。", "pinyin": "Wǒ běnlái xiǎng qù, jiéguǒ méi qù.", "translation_en": "I originally wanted to go, but in the end I didn't."},
            {"text": "他沒有好好準備，結果考得不好。", "pinyin": "Tā méiyǒu hǎohāo zhǔnbèi, jiéguǒ kǎo de bù hǎo.", "translation_en": "He didn't prepare well, and as a result he didn't do well on the test."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D61_YINWEI_SUOYI_REPAIR",
        "因為 + reason，所以 + result",
        ["因為", "reason", "所以", "result"],
        "Use 因為...所以... (yīnwèi...suǒyǐ...) to express 'because...therefore...'. This is the standard cause-and-effect pattern. In Taiwan casual speech, either 因為 or 所以 can be used alone, but together they form a complete logical structure.",
        "Because...Therefore with 因為...所以...",
        "because... therefore...",
        [
            "When explaining reasons and results",
            "When making a logical argument",
            "When answering 'why' questions"
        ],
        [
            "Do not use 所以 at the beginning of the first clause — it always introduces the result",
            "In casual speech, 因為 alone or 所以 alone is fine"
        ],
        "Taiwan speakers often drop 所以 in casual conversation, using just 因為. But in more structured explanations, the full pair sounds more complete.",
        "因為 + Reason，所以 + Result.",
        "English: 'Because it rained, I didn't go.' Chinese: 因為下雨了，所以我沒去。(Because rain LE, so I not go).",
        "Korean: '비가 와서 안 갔어요.' Chinese 因為...所以 corresponds to Korean '~서/~니까'.",
        get_sentence_ids_for_day(sentences, 61, 4)[:4],
        [
            {"text": "因為下雨了，所以我沒去。", "pinyin": "Yīnwèi xià yǔ le, suǒyǐ wǒ méi qù.", "translation_en": "Because it rained, I didn't go."},
            {"text": "因為他生病了，所以今天請假。", "pinyin": "Yīnwèi tā shēngbìng le, suǒyǐ jīntiān qǐngjià.", "translation_en": "Because he got sick, he took the day off today."},
        ]
    ))
    
    # ========== DAY 62: Asking for Assistance ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D62_BANG_WO",
        "幫 + person + verb / 幫我 + verb",
        ["幫", "person", "verb"],
        "Use 幫 (bāng) to mean 'help' or 'for (someone)'. 幫我 + verb means 'help me do X' or 'do X for me'. This is one of the most practical verbs in daily Taiwan life.",
        "Help / Do For with 幫",
        "to help; to do for (someone)",
        [
            "When asking someone to help you do something",
            "When offering to do something for someone",
            "In service interactions (stores, restaurants)"
        ],
        [
            "Do not confuse 幫 (help/for) with 給 (give)",
            "幫 can mean 'on behalf of' as well as 'help'"
        ],
        "In Taiwan, 幫我... is heard all day long: 幫我拿一下 (grab that for me), 幫我點餐 (order for me), 幫我看看 (take a look for me). It's essential for daily life.",
        "幫 + Person + Verb (+ Object).",
        "English: 'Help me carry this.' Chinese: 幫我拿這個。(Help me carry this).",
        "Korean: '이것 좀 들어주세요.' Chinese 幫 corresponds to Korean '~아/어 주다'.",
        get_sentence_ids_for_day(sentences, 62, 6),
        [
            {"text": "你可以幫我一個忙嗎？", "pinyin": "Nǐ kěyǐ bāng wǒ yī ge máng ma?", "translation_en": "Can you help me with something?"},
            {"text": "幫我拿一下那個。", "pinyin": "Bāng wǒ ná yīxià nà ge.", "translation_en": "Help me grab that for a moment."},
            {"text": "我幫你點餐。", "pinyin": "Wǒ bāng nǐ diǎn cān.", "translation_en": "I'll order for you."},
            {"text": "他幫我翻譯。", "pinyin": "Tā bāng wǒ fānyì.", "translation_en": "He translates for me."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D62_XUYAO",
        "Subject + 需要 + noun/verb",
        ["subject", "需要", "noun/verb"],
        "Use 需要 (xūyào) to express 'need' or 'require'. It is more formal than 要 and is used for genuine necessities. 需要 can be followed by a noun or a verb phrase.",
        "Need/Require with 需要",
        "to need; to require",
        [
            "When expressing genuine needs",
            "When making formal requests",
            "When describing requirements"
        ],
        [
            "Do not use 需要 for casual wants — use 想要 (xiǎng yào) instead",
            "需要 is stronger and more formal than 要"
        ],
        "In Taiwan, 我需要幫助 (I need help) is a clear and direct phrase. 需要 is more appropriate for serious needs than the casual 要.",
        "Subject + 需要 + Noun / Verb Phrase.",
        "English: 'I need help.' Chinese: 我需要幫忙。(I need help).",
        "Korean: '도움이 필요해요.' Chinese 需要 corresponds to Korean '필요하다'.",
        get_sentence_ids_for_day(sentences, 62, 4)[:4],
        [
            {"text": "我需要幫忙。", "pinyin": "Wǒ xūyào bāngmáng.", "translation_en": "I need help."},
            {"text": "你需要什麼嗎？", "pinyin": "Nǐ xūyào shénme ma?", "translation_en": "Do you need anything?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D62_KE_BI_KE_YI_HELP",
        "可以 + 幫我 + verb + 嗎？/ 可不可以 + 幫我 + verb？",
        ["可以/可不可以", "幫我", "verb", "嗎"],
        "Use 可以幫我...嗎 (kěyǐ bāng wǒ...ma) to politely ask 'Can you help me...?' This combines the permission/possibility 可以 with the helpful-action 幫. It's the most common way to ask for assistance in Taiwan.",
        "Can You Help Me with 可以幫我...嗎",
        "Can you help me...?",
        [
            "When politely asking for assistance",
            "When you need someone to do something for you",
            "In almost any service or help situation in Taiwan"
        ],
        [
            "Do not use 要幫我 (want to help me) — use 可以幫我 for polite requests",
            "Adding 不好意思 or 麻煩你 before this pattern makes it extra polite"
        ],
        "Taiwan speakers often say '不好意思，可以幫我...嗎？' as a complete polite request. It's the gold standard for asking for help from strangers.",
        "可以 + 幫我 + Verb (+ Object) + 嗎？",
        "English: 'Can you help me carry this?' Chinese: 可以幫我拿這個嗎？(Can help me carry this MA?).",
        "Korean: '이것 좀 들어주실 수 있나요?' Chinese 可以幫我...嗎 is similar to Korean '~아/어 주실 수 있나요?'.",
        get_sentence_ids_for_day(sentences, 62, 4)[:4],
        [
            {"text": "可以幫我拿一下嗎？", "pinyin": "Kěyǐ bāng wǒ ná yīxià ma?", "translation_en": "Can you help me carry this for a moment?"},
            {"text": "你可以幫我看看這個嗎？", "pinyin": "Nǐ kěyǐ bāng wǒ kàn kàn zhège ma?", "translation_en": "Can you help me take a look at this?"},
        ]
    ))
    
    # ========== DAY 63: Problems & Solutions ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D63_XIANG_RETURN",
        "Subject + 想 + verb (+ object)",
        ["subject", "想", "verb", "object"],
        "Use 想 (xiǎng) to express 'want to' or 'would like to'. It is softer and more polite than 要 (yào). 想 is the preferred word for expressing desires and preferences in Taiwan.",
        "Want/Would Like with 想",
        "to want to; would like to; to think",
        [
            "When expressing a desire or preference",
            "When making a polite request",
            "When talking about future plans (softer than 要)"
        ],
        [
            "Do not use 想 for strong necessity — use 要 or 需要",
            "想 can also mean 'to think' or 'to miss (someone)' — context distinguishes"
        ],
        "In Taiwan, 我想... is the standard way to start expressing what you want. It's softer and more polite than 我要... which can sound demanding.",
        "Subject + 想 + Verb (+ Object).",
        "English: 'I want to go home.' Chinese: 我想回家。(I want return home). 想 is 'want/would like'.",
        "Korean: '집에 가고 싶어요.' Chinese 想 corresponds to Korean '~고 싶다'.",
        get_sentence_ids_for_day(sentences, 63, 6),
        [
            {"text": "我想回家。", "pinyin": "Wǒ xiǎng huí jiā.", "translation_en": "I want to go home."},
            {"text": "你想吃什麼？", "pinyin": "Nǐ xiǎng chī shénme?", "translation_en": "What do you want to eat?"},
            {"text": "他想換工作。", "pinyin": "Tā xiǎng huàn gōngzuò.", "translation_en": "He wants to change jobs."},
            {"text": "我想跟你談一談。", "pinyin": "Wǒ xiǎng gēn nǐ tán yī tán.", "translation_en": "I want to talk with you."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D63_YOU_WENTI",
        "Subject + 有問題 / 跟 + person/thing + 有問題 / 關於 + topic + 有問題",
        ["subject", "有問題"],
        "Use 有問題 (yǒu wèntí) to say 'has a problem' or 'there is a problem'. This is the most direct way to flag an issue in Taiwan. It can be used for machines, situations, or interpersonal issues.",
        "Has a Problem with 有問題",
        "has a problem; there is an issue",
        [
            "When something isn't working right",
            "When you have a concern or issue to raise",
            "When asking if everything is okay"
        ],
        [
            "Do not use 有問題 for small preferences — it implies a real problem",
            "有問題 can sound serious — soften with 有點問題 for minor issues"
        ],
        "In Taiwan, 有問題嗎？(Is there a problem?) can sound confrontational. 有什麼問題嗎？(What's the problem?) is softer. For reporting issues, 這個有問題 (This has a problem) is direct and clear.",
        "Subject + 有問題 / 跟 + Person + 有問題.",
        "English: 'There is a problem with this.' Chinese: 這個有問題。(This has problem).",
        "Korean: '이거 문제가 있어요.' Chinese 有問題 corresponds to Korean '문제가 있다'.",
        get_sentence_ids_for_day(sentences, 63, 4)[:4],
        [
            {"text": "這個有問題。", "pinyin": "Zhège yǒu wèntí.", "translation_en": "There is a problem with this."},
            {"text": "我覺得跟溝通有問題。", "pinyin": "Wǒ juéde gēn gōutōng yǒu wèntí.", "translation_en": "I think there is a problem with the communication."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D63_KEBUKEYI_CHANGE",
        "可以 + 換 + object + 嗎？/ 可不可以 + 換？",
        ["可以/可不可以", "換", "object"],
        "Use 換 (huàn) to mean 'change', 'exchange', or 'swap'. 可以換...嗎 is how you ask to exchange something (a defective product, a different size, etc.) in Taiwan.",
        "Can I Change/Exchange with 換",
        "to change; to exchange; to swap",
        [
            "When you want to exchange a product",
            "When you want to change something (plans, seats, etc.)",
            "When asking for a different option"
        ],
        [
            "Do not confuse 換 (exchange) with 改 (change/alter)",
            "換 is for swapping one thing for another, 改 is for modifying something"
        ],
        "In Taiwan stores, 可以換嗎？(Can I exchange this?) is a common and acceptable request. Most stores have exchange policies.",
        "可以 + 換 + Object + 嗎？",
        "English: 'Can I exchange this?' Chinese: 可以換這個嗎？(Can exchange this MA?).",
        "Korean: '이거 교환할 수 있나요?' Chinese 換 corresponds to Korean '교환하다/바꾸다'.",
        get_sentence_ids_for_day(sentences, 63, 4)[:4],
        [
            {"text": "可以換一個嗎？", "pinyin": "Kěyǐ huàn yī ge ma?", "translation_en": "Can I exchange this for another one?"},
            {"text": "我想換這個。", "pinyin": "Wǒ xiǎng huàn zhège.", "translation_en": "I want to exchange this."},
        ]
    ))
    
    # ========== DAY 64: Appointments & Reservations ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D64_YUYUE",
        "Subject + 預約 + 了 + time/place / 跟 + place + 預約 + 了",
        ["subject", "預約", "了", "time/place"],
        "Use 預約 (yùyuē) to mean 'make a reservation' or 'book an appointment'. In Taiwan, you 預約 doctors, restaurants, salons, and services. 預約了 means 'have booked/reserved'.",
        "Reservation/Appointment with 預約",
        "to reserve; to book; to make an appointment",
        [
            "When booking a doctor's appointment",
            "When making a restaurant reservation",
            "When scheduling any service in advance"
        ],
        [
            "Do not use 訂 (dìng) for appointments — 訂 is for ordering/buying",
            "預約 is specifically for booking time slots and appointments"
        ],
        "In Taiwan, 預約 is essential for daily life. Many clinics require 預約, and popular restaurants need reservations. 我預約了 + time is the standard phrase.",
        "Subject + 預約 + 了 + Time/Place.",
        "English: 'I have a reservation.' Chinese: 我預約了。(I booked LE).",
        "Korean: '예약했어요.' Chinese 預約 corresponds to Korean '예약하다'.",
        get_sentence_ids_for_day(sentences, 64, 6),
        [
            {"text": "我預約了明天下午三點。", "pinyin": "Wǒ yùyuē le míngtiān xiàwǔ sān diǎn.", "translation_en": "I booked an appointment for tomorrow at 3 PM."},
            {"text": "你預約了嗎？", "pinyin": "Nǐ yùyuē le ma?", "translation_en": "Did you make a reservation?"},
            {"text": "我跟牙醫預約了。", "pinyin": "Wǒ gēn yáyī yùyuē le.", "translation_en": "I made an appointment with the dentist."},
            {"text": "我需要預約嗎？", "pinyin": "Wǒ xūyào yùyuē ma?", "translation_en": "Do I need to make a reservation?"}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D64_GAI_SHIJIAN",
        "Subject + 改 + time/plan + 了 / 改到 + new time",
        ["subject", "改", "time/plan", "了"],
        "Use 改 (gǎi) to mean 'change' or 'modify'. 改時間 (gǎi shíjiān) means 'change the time/reschedule'. 改到 + new time means 'change to (a new time)'. This is essential for managing appointments.",
        "Reschedule with 改",
        "to change; to modify; to reschedule",
        [
            "When you need to reschedule an appointment",
            "When changing plans or arrangements",
            "When modifying a booking"
        ],
        [
            "Do not confuse 改 (modify/change) with 換 (exchange/swap)",
            "改時間 = change the time, 換時間 = swap time slots with someone"
        ],
        "In Taiwan, 改時間 is the standard way to say 'reschedule'. It's direct and clear: 我想改時間 (I want to reschedule).",
        "Subject + 改 + 了 + Time / 改到 + New Time.",
        "English: 'I need to reschedule.' Chinese: 我需要改時間。(I need change time).",
        "Korean: '시간을 변경해야 해요.' Chinese 改 corresponds to Korean '변경하다/바꾸다'.",
        get_sentence_ids_for_day(sentences, 64, 4)[:4],
        [
            {"text": "我想改時間。", "pinyin": "Wǒ xiǎng gǎi shíjiān.", "translation_en": "I want to reschedule."},
            {"text": "可以改到星期五嗎？", "pinyin": "Kěyǐ gǎi dào xīngqīwǔ ma?", "translation_en": "Can we change it to Friday?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D64_QUE_REN",
        "Subject + 確認 + 一下 + details / 跟 + person + 確認",
        ["subject", "確認", "details"],
        "Use 確認 (quèrèn) to mean 'confirm'. 確認一下 (quèrèn yīxià) means 'just confirm quickly' — 一下 softens the verb. This is essential for confirming appointments, details, and arrangements in Taiwan.",
        "Confirm with 確認",
        "to confirm; to verify",
        [
            "When double-checking appointment details",
            "When confirming arrangements with someone",
            "When making sure information is correct"
        ],
        [
            "Do not use 確認 for 'make sure' in a commanding way — add 一下 to soften",
            "確認一下 is much more polite than just 確認"
        ],
        "Taiwan speakers frequently use 確認一下 as a soft way to verify information. It's polite and non-confrontational.",
        "Subject + 確認 + 一下 + Details.",
        "English: 'Let me confirm the time.' Chinese: 我確認一下時間。(I confirm YIXIA time). 一下 softens it.",
        "Korean: '시간을 확인할게요.' Chinese 確認 corresponds to Korean '확인하다'.",
        get_sentence_ids_for_day(sentences, 64, 4)[:4],
        [
            {"text": "我想確認一下時間。", "pinyin": "Wǒ xiǎng quèrèn yīxià shíjiān.", "translation_en": "I want to confirm the time."},
            {"text": "請確認一下你的預約。", "pinyin": "Qǐng quèrèn yīxià nǐ de yùyuē.", "translation_en": "Please confirm your reservation."},
        ]
    ))
    
    # ========== DAY 65: Obligations ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D65_YINGGAI",
        "Subject + 應該 + verb (+ object)",
        ["subject", "應該", "verb", "object"],
        "Use 應該 (yīnggāi) to mean 'should' or 'ought to'. It expresses obligation, expectation, or reasonable assumption. It is less strong than 必須 (bìxū, 'must') and is the most common way to give advice in Taiwan.",
        "Should/Ought To with 應該",
        "should; ought to; probably",
        [
            "When giving advice or suggestions",
            "When expressing what is expected or proper",
            "When making a reasonable assumption about something"
        ],
        [
            "Do not use 應該 for absolute requirements — use 必須 or 一定要",
            "應該 can also mean 'probably' when the context suggests speculation"
        ],
        "In Taiwan, 你應該... is the standard way to give friendly advice. It's not pushy — it suggests what would be good to do. 你應該多休息 (You should rest more) is caring, not commanding.",
        "Subject + 應該 + Verb (+ Object).",
        "English: 'You should rest.' Chinese: 你應該休息。(You should rest).",
        "Korean: '쉬어야 해요.' Chinese 應該 corresponds to Korean '~해야 하다'.",
        get_sentence_ids_for_day(sentences, 65, 6),
        [
            {"text": "你應該多休息。", "pinyin": "Nǐ yīnggāi duō xiūxi.", "translation_en": "You should rest more."},
            {"text": "我應該早一點出門。", "pinyin": "Wǒ yīnggāi zǎo yīdiǎn chūmén.", "translation_en": "I should leave earlier."},
            {"text": "他應該知道這件事。", "pinyin": "Tā yīnggāi zhīdào zhè jiàn shì.", "translation_en": "He should know about this matter."},
            {"text": "我們應該先問他。", "pinyin": "Wǒmen yīnggāi xiān wèn tā.", "translation_en": "We should ask him first."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D65_XUYAO",
        "Subject + 需要 + verb/noun (obligation context)",
        ["subject", "需要", "verb/noun"],
        "Review of 需要 in obligation contexts. 需要 can express necessity and obligation, similar to 'need to'. In obligation contexts, 需要 is about what is necessary rather than just what is wanted.",
        "Need To (Obligation) with 需要",
        "need to; have to (necessity/obligation)",
        [
            "When expressing what must be done",
            "When stating requirements",
            "When something is necessary, not optional"
        ],
        [
            "Do not confuse 需要 (necessity) with 想要 (desire)",
            "需要 is about what is needed, not what is wanted"
        ],
        "In Taiwan workplaces, 你需要... (You need to...) is a standard way to communicate requirements. It's more formal than 要 but less strong than 必須.",
        "Subject + 需要 + Verb (+ Object).",
        "English: 'You need to fill out this form.' Chinese: 你需要填這張表格。",
        "Korean: '이 양식을 작성하셔야 해요.' Chinese 需要 corresponds to Korean '~해야 하다/필요하다'.",
        get_sentence_ids_for_day(sentences, 65, 4)[:4],
        [
            {"text": "你需要帶證件。", "pinyin": "Nǐ xūyào dài zhèngjiàn.", "translation_en": "You need to bring your ID."},
            {"text": "我需要先付錢嗎？", "pinyin": "Wǒ xūyào xiān fù qián ma?", "translation_en": "Do I need to pay first?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D65_BIXU",
        "Subject + 必須 + verb (+ object)",
        ["subject", "必須", "verb", "object"],
        "Use 必須 (bìxū) to mean 'must' or 'have to'. This is the strongest obligation word — it indicates something is mandatory, not optional. Use it for rules, requirements, and non-negotiable necessities.",
        "Must/Have To with 必須",
        "must; have to; necessarily",
        [
            "When something is mandatory or required",
            "When stating rules or regulations",
            "When there is no choice or alternative"
        ],
        [
            "Do not use 必須 for gentle suggestions — use 應該 instead",
            "必須 is very direct — use carefully in polite conversation"
        ],
        "In Taiwan, 必須 is used for official requirements: 你必須帶護照 (You must bring your passport). In casual conversation, 一定要 is more common and slightly softer.",
        "Subject + 必須 + Verb (+ Object).",
        "English: 'You must bring your passport.' Chinese: 你必須帶護照。(You must bring passport).",
        "Korean: '반드시 여권을 가져와야 해요.' Chinese 必須 corresponds to Korean '반드시 ~해야 하다'.",
        get_sentence_ids_for_day(sentences, 65, 4)[:4],
        [
            {"text": "你必須帶證件。", "pinyin": "Nǐ bìxū dài zhèngjiàn.", "translation_en": "You must bring identification."},
            {"text": "我們必須在五點以前到。", "pinyin": "Wǒmen bìxū zài wǔ diǎn yǐqián dào.", "translation_en": "We must arrive before 5 o'clock."},
        ]
    ))
    
    # ========== DAY 66: Conditionals ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D66_RUGUO_JIU",
        "如果 + condition，就 + result",
        ["如果", "condition", "就", "result"],
        "Use 如果...就... (rúguǒ...jiù...) to express 'if...then...'. 如果 introduces the condition, 就 introduces the result. This is the most common conditional pattern in Taiwan Mandarin.",
        "If...Then with 如果...就...",
        "if... then...",
        [
            "When talking about hypothetical situations",
            "When giving conditional advice or warnings",
            "When making plans that depend on conditions"
        ],
        [
            "Do not place 就 before 如果 — the condition always comes first",
            "就 is not always required — in casual speech 如果 alone is enough"
        ],
        "Taiwan speakers use 如果...就... constantly in daily planning: 如果下雨，我們就不去 (If it rains, we won't go). It's practical and common.",
        "如果 + Condition，就 + Result.",
        "English: 'If it rains, I won't go.' Chinese: 如果下雨，我就不去。(If rain, JIU I not go). 就 is like 'then'.",
        "Korean: '비가 오면 안 갈 거예요.' Chinese 如果...就 corresponds to Korean '~면/으면'.",
        get_sentence_ids_for_day(sentences, 66, 6),
        [
            {"text": "如果明天下雨，我們就不去公園。", "pinyin": "Rúguǒ míngtiān xià yǔ, wǒmen jiù bú qù gōngyuán.", "translation_en": "If it rains tomorrow, we won't go to the park."},
            {"text": "如果你有空，我們就一起吃飯。", "pinyin": "Rúguǒ nǐ yǒu kòng, wǒmen jiù yīqǐ chī fàn.", "translation_en": "If you're free, let's eat together."},
            {"text": "如果有問題，就告訴我。", "pinyin": "Rúguǒ yǒu wèntí, jiù gàosu wǒ.", "translation_en": "If there's a problem, tell me."},
            {"text": "如果太貴，我就不買。", "pinyin": "Rúguǒ tài guì, wǒ jiù bù mǎi.", "translation_en": "If it's too expensive, I won't buy it."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D66_BU_RAN",
        "Suggestion/Statement，不然 + alternative",
        ["statement", "不然", "alternative"],
        "Use 不然 (bùrán) to mean 'otherwise' or 'or else'. It introduces an alternative or consequence. In Taiwan, it's also commonly used to make suggestions: 不然我們... (How about we... instead?).",
        "Otherwise/Or Else with 不然",
        "otherwise; or else; how about instead",
        [
            "When offering an alternative suggestion",
            "When stating the consequence of not doing something",
            "When pivoting to a different plan"
        ],
        [
            "Do not confuse 不然 (otherwise) with 但是 (but)",
            "不然 can be used at the start of a suggestion: 不然我們去別的地方 (How about we go somewhere else?)"
        ],
        "Taiwan speakers love 不然 for making alternative suggestions. '不然我們去吃火鍋' (How about we go eat hotpot instead?) is a very natural way to change plans.",
        "Statement，不然 + Alternative.",
        "English: 'Let's go, otherwise we'll be late.' Chinese: 我們走吧，不然會遲到。(We go BA, otherwise will late).",
        "Korean: '안 그러면 늦을 거야.' Chinese 不然 corresponds to Korean '안 그러면/그렇지 않으면'.",
        get_sentence_ids_for_day(sentences, 66, 4)[:4],
        [
            {"text": "快一點，不然會遲到。", "pinyin": "Kuài yīdiǎn, bùrán huì chídào.", "translation_en": "Hurry up, otherwise we'll be late."},
            {"text": "不然我們去別的地方？", "pinyin": "Bùrán wǒmen qù bié de dìfāng?", "translation_en": "How about we go somewhere else instead?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D66_KENENG",
        "可能 + statement / Subject + 可能會 + verb",
        ["可能", "statement"],
        "Use 可能 (kěnéng) to mean 'maybe', 'possibly', or 'might'. 可能會 means 'might (do something)'. This is essential for expressing uncertainty and possibility in Taiwan Mandarin.",
        "Might/Possibly with 可能",
        "maybe; possibly; might",
        [
            "When you're not sure about something",
            "When expressing possibility or probability",
            "When giving a tentative answer"
        ],
        [
            "Do not use 可能 for things you're certain about",
            "可能會 = might (future action), 可能 = maybe (general possibility)"
        ],
        "Taiwan speakers use 可能 to stay non-committal and polite. '我可能沒辦法' (I might not be able to) is a softer way to decline than a direct 'no'.",
        "可能 + Statement / Subject + 可能會 + Verb.",
        "English: 'I might not be able to go.' Chinese: 我可能不能去。(I maybe not can go).",
        "Korean: '아마 못 갈 것 같아요.' Chinese 可能 corresponds to Korean '아마/~ㄹ 것 같다'.",
        get_sentence_ids_for_day(sentences, 66, 4)[:4],
        [
            {"text": "我可能不能去。", "pinyin": "Wǒ kěnéng bù néng qù.", "translation_en": "I might not be able to go."},
            {"text": "他可能會遲到。", "pinyin": "Tā kěnéng huì chídào.", "translation_en": "He might be late."},
        ]
    ))
    
    # ========== DAY 67: Contrast & Concession ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D67_SUIRAN_KESHI",
        "雖然 + clause，可是/但是 + clause",
        ["雖然", "clause", "可是/但是", "clause"],
        "Use 雖然...可是/但是... (suīrán...kěshì/dànshì...) to express 'although...but...'. 雖然 introduces a concession, 可是/但是 introduces the contrasting result. This is the standard contrast pattern in Taiwan Mandarin.",
        "Although...But with 雖然...可是...",
        "although... but...",
        [
            "When acknowledging something but stating a contrasting point",
            "When making a nuanced statement with two sides",
            "When giving balanced opinions"
        ],
        [
            "Do not use 但/可是 without 雖然 when the contrast is very strong",
            "In English you can't say 'although...but' — in Chinese the pair is standard"
        ],
        "Taiwan speakers use 雖然...可是... frequently in conversation. It shows you can see both sides of a situation. 可是 is more casual than 但是 in Taiwan.",
        "雖然 + Clause A，可是/但是 + Clause B.",
        "English: 'Although it's expensive, it's delicious.' Chinese: 雖然很貴，可是很好吃。(Although very expensive, but very delicious).",
        "Korean: '비싸지만 맛있어요.' Chinese 雖然...可是 corresponds to Korean '~지만'.",
        get_sentence_ids_for_day(sentences, 67, 6),
        [
            {"text": "雖然今天很冷，但是我還是想去公園散步。", "pinyin": "Suīrán jīntiān hěn lěng, dànshì wǒ háishì xiǎng qù gōngyuán sànbù.", "translation_en": "Although it's very cold today, I still want to go for a walk in the park."},
            {"text": "雖然這家餐廳很貴，但是他們的牛肉麵真的很好吃。", "pinyin": "Suīrán zhè jiā cāntīng hěn guì, dànshì tāmen de niúròumiàn zhēn de hěn hǎochī.", "translation_en": "Although this restaurant is expensive, their beef noodles are really delicious."},
            {"text": "雖然他工作很忙，但是他每天都會打電話給媽媽。", "pinyin": "Suīrán tā gōngzuò hěn máng, dànshì tā měitiān dōu huì dǎ diànhuà gěi māma.", "translation_en": "Although he is very busy with work, he calls his mother every day."},
            {"text": "雖然我喜歡喝咖啡，但是晚上喝的話會睡不著。", "pinyin": "Suīrán wǒ xǐhuān hē kāfēi, dànshì wǎnshàng hē dehuà huì shuì bù zháo.", "translation_en": "Although I like drinking coffee, if I drink it at night, I can't sleep."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D67_DANSHI_REVIEW",
        "Clause，但是/可是 + contrasting clause",
        ["clause", "但是/可是", "contrasting clause"],
        "Review of 但是 (dànshì) and 可是 (kěshì) for 'but'. 可是 is slightly more common in Taiwan casual speech. Both connect contrasting clauses. Unlike 雖然...但是, you can use 但是/可是 alone without 雖然.",
        "But (Review) with 但是/可是",
        "but; however",
        [
            "When contrasting two ideas",
            "When adding a counterpoint",
            "In everyday Taiwan conversation"
        ],
        [
            "Do not start a sentence with 但是/可是 in formal writing",
            "可是 is more casual than 但是"
        ],
        "Taiwan speakers prefer 可是 over 但是 in daily conversation. 可是 feels softer and more natural in casual settings.",
        "Clause A，可是/但是 + Clause B.",
        "English: 'I want to go, but I'm busy.' Chinese: 我想去，可是我很忙。(I want go, but I very busy).",
        "Korean: '가고 싶은데 바빠요.' Chinese 可是/但是 corresponds to Korean '~ㄴ데/지만'.",
        get_sentence_ids_for_day(sentences, 67, 4)[:4],
        [
            {"text": "我想去，可是太遠了。", "pinyin": "Wǒ xiǎng qù, kěshì tài yuǎn le.", "translation_en": "I want to go, but it's too far."},
            {"text": "這件衣服很好看，但是太貴了。", "pinyin": "Zhè jiàn yīfu hěn hǎokàn, dànshì tài guì le.", "translation_en": "These clothes look great, but they're too expensive."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D67_HAI_SHI_STILL",
        "Subject + 還是 + verb / 雖然...，還是...",
        ["subject", "還是", "verb"],
        "Use 還是 (háishì) to mean 'still' or 'nevertheless'. When combined with 雖然, it emphasizes that the action continues despite the circumstance. 還是 is different from 還是 (háishì) meaning 'or' (in questions).",
        "Still/Nevertheless with 還是",
        "still; nevertheless; had better",
        [
            "When something continues despite obstacles",
            "When emphasizing persistence",
            "When giving advice: 你還是... (you'd better...)"
        ],
        [
            "Do not confuse 還是 (still) with 還是 (or) — same characters, different function",
            "還是 + verb = still doing; 還是 + noun = still is/are (with 是 implied)"
        ],
        "In Taiwan, 還是 is versatile. 我還是覺得... (I still think...) is common. 你還是去看看吧 (You'd better go check) is friendly advice.",
        "Subject + 還是 + Verb / 雖然...，Subject + 還是 + Verb.",
        "English: 'I still think it's good.' Chinese: 我還是覺得很好。(I still think very good).",
        "Korean: '그래도 좋은 것 같아요.' Chinese 還是 corresponds to Korean '그래도/여전히'.",
        get_sentence_ids_for_day(sentences, 67, 4)[:4],
        [
            {"text": "雖然很累，我還是想去。", "pinyin": "Suīrán hěn lèi, wǒ háishì xiǎng qù.", "translation_en": "Although I'm tired, I still want to go."},
            {"text": "我還是覺得這個比較好。", "pinyin": "Wǒ háishì juéde zhège bǐjiào hǎo.", "translation_en": "I still think this one is better."},
        ]
    ))
    
    # ========== DAY 68: Direction Complements ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D68_LAI_QU",
        "Verb + 來 / Verb + 去",
        ["verb", "來/去"],
        "Use 來 (lái) and 去 (qù) as direction complements after verbs. Verb + 來 indicates movement toward the speaker. Verb + 去 indicates movement away from the speaker. This is fundamental for describing movement in Chinese.",
        "Direction Complements 來/去",
        "toward speaker (來) / away from speaker (去)",
        [
            "When describing movement toward or away from the speaker",
            "When giving directions",
            "When narrating where someone went"
        ],
        [
            "Do not confuse the direction of 來 (toward speaker) and 去 (away from speaker)",
            "The direction is relative to the SPEAKER, not the subject"
        ],
        "In Taiwan, direction complements are essential for clear communication. 拿來 (bring here) vs 拿去 (take away) is a daily-life distinction.",
        "Verb + 來 (toward speaker) / Verb + 去 (away from speaker).",
        "English: 'Bring it here' (toward me) vs 'Take it away' (away from me). Chinese: 拿來 vs 拿去.",
        "Korean: '가져와' (bring) vs '가져가' (take). Chinese 來/去 corresponds to Korean '오다/가다'.",
        get_sentence_ids_for_day(sentences, 68, 6),
        [
            {"text": "請你走進來。", "pinyin": "Qǐng nǐ zǒu jìnlái.", "translation_en": "Please walk in."},
            {"text": "他跑出去了。", "pinyin": "Tā pǎo chūqù le.", "translation_en": "He ran out."},
            {"text": "請你帶咖啡上去。", "pinyin": "Qǐng nǐ dài kāfēi shàngqù.", "translation_en": "Please bring the coffee up."},
            {"text": "貓從窗戶跳下來。", "pinyin": "Māo cóng chuānghu tiào xiàlái.", "translation_en": "The cat jumped down from the window."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D68_JIN_CHU",
        "Verb + 進 + 來/去 / Verb + 出 + 來/去",
        ["verb", "進/出", "來/去"],
        "Use 進 (jìn, 'enter') and 出 (chū, 'exit') as direction complements combined with 來/去. 進來 = come in, 進去 = go in, 出來 = come out, 出去 = go out. These compound direction complements are extremely common.",
        "In/Out Complements with 進/出",
        "in/out direction complements",
        [
            "When describing entering or exiting",
            "When giving instructions about movement",
            "In daily spatial descriptions"
        ],
        [
            "Do not reverse the order — 進/出 comes before 來/去",
            "進來 = come in (toward speaker), 進去 = go in (away from speaker)"
        ],
        "In Taiwan, 進來！(Come in!) and 出去！(Get out!) are direct and common. For politeness, add 請: 請進來 (Please come in).",
        "Verb + 進 + 來/去 / Verb + 出 + 來/去.",
        "English: 'Come in.' Chinese: 進來。'Go out.' Chinese: 出去。",
        "Korean: '들어와' (come in) / '나가' (go out). Chinese 進來/出去 corresponds to Korean '들어오다/나가다'.",
        get_sentence_ids_for_day(sentences, 68, 4)[:4],
        [
            {"text": "他走進教室裡面。", "pinyin": "Tā zǒu jìn jiàoshì lǐmiàn.", "translation_en": "He walked into the classroom."},
            {"text": "我們把書拿出來。", "pinyin": "Wǒmen bǎ shū ná chūlái.", "translation_en": "We take the book out."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D68_SHANG_XIA",
        "Verb + 上 + 來/去 / Verb + 下 + 來/去",
        ["verb", "上/下", "來/去"],
        "Use 上 (shàng, 'up') and 下 (xià, 'down') as direction complements. 上來 = come up, 上去 = go up, 下來 = come down, 下去 = go down. These describe vertical movement.",
        "Up/Down Complements with 上/下",
        "up/down direction complements",
        [
            "When describing vertical movement",
            "When giving directions involving stairs, elevators, etc.",
            "In Taiwan, for getting on/off transportation"
        ],
        [
            "Do not confuse 上 (up/on) and 下 (down/off) directions",
            "上車 = get on a vehicle, 下車 = get off a vehicle"
        ],
        "In Taiwan, 上 and 下 are used for vehicles too: 上車 (get on), 下車 (get off), 上樓 (go upstairs), 下樓 (go downstairs).",
        "Verb + 上 + 來/去 / Verb + 下 + 來/去.",
        "English: 'Come up' vs 'Go down.' Chinese: 上來 vs 下去.",
        "Korean: '올라와' vs '내려가'. Chinese 上來/下去 corresponds to Korean '올라오다/내려가다'.",
        get_sentence_ids_for_day(sentences, 68, 4)[:4],
        [
            {"text": "請你上來。", "pinyin": "Qǐng nǐ shànglái.", "translation_en": "Please come up."},
            {"text": "他下去了。", "pinyin": "Tā xiàqù le.", "translation_en": "He went down."},
        ]
    ))
    
    # ========== DAY 69: Bring/Take Direction ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D69_DAI_LAI_DAI_QU",
        "帶 + 來 / 帶 + 去",
        ["帶", "來/去"],
        "Use 帶 (dài) with direction complements: 帶來 (bring here) and 帶去 (take there). 帶 means 'to bring/carry/take along'. The direction complement indicates movement relative to the speaker.",
        "Bring/Take with 帶來/帶去",
        "bring (toward speaker) / take (away from speaker)",
        [
            "When asking someone to bring something to you",
            "When taking something somewhere",
            "When talking about carrying items"
        ],
        [
            "Do not confuse 帶 (bring/take/carry) with 拿 (hold/grab)",
            "帶來 = bring to me/us, 帶去 = take to them/there"
        ],
        "In Taiwan, 你帶什麼來？(What did you bring?) is a common question when someone visits. 我帶你去 (I'll take you there) is a friendly offer.",
        "帶 + Object + 來/去.",
        "English: 'Bring your friend.' Chinese: 帶你的朋友來。(Bring your friend come).",
        "Korean: '친구를 데려와.' Chinese 帶來 corresponds to Korean '데려오다/가져오다'.",
        get_sentence_ids_for_day(sentences, 69, 6),
        [
            {"text": "請你帶護照來。", "pinyin": "Qǐng nǐ dài hùzhào lái.", "translation_en": "Please bring your passport."},
            {"text": "我帶你去醫院。", "pinyin": "Wǒ dài nǐ qù yīyuàn.", "translation_en": "I'll take you to the hospital."},
            {"text": "他帶了禮物來。", "pinyin": "Tā dài le lǐwù lái.", "translation_en": "He brought a gift."},
            {"text": "你可以幫我帶這個去嗎？", "pinyin": "Nǐ kěyǐ bāng wǒ dài zhège qù ma?", "translation_en": "Can you take this there for me?"}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D69_HUI_LAI_HUI_QU",
        "回 + 來 / 回 + 去",
        ["回", "來/去"],
        "Use 回 (huí) with direction complements: 回來 (come back) and 回去 (go back). 回 means 'to return'. Combined with 來/去, it indicates returning toward or away from the speaker.",
        "Return with 回來/回去",
        "come back (toward speaker) / go back (away from speaker)",
        [
            "When talking about returning home",
            "When asking when someone will come back",
            "When discussing travel and returns"
        ],
        [
            "Do not confuse 回來 (come back) with 回家 (go home)",
            "回來 = come back HERE, 回去 = go back THERE"
        ],
        "In Taiwan, 你什麼時候回來？(When are you coming back?) is a common question. 我要回去了 (I'm going back now) signals departure.",
        "回 + 來/去.",
        "English: 'Come back soon.' Chinese: 快點回來。(Quick come back).",
        "Korean: '빨리 돌아와.' Chinese 回來 corresponds to Korean '돌아오다'.",
        get_sentence_ids_for_day(sentences, 69, 4)[:4],
        [
            {"text": "他什麼時候回來？", "pinyin": "Tā shénme shíhou huílái?", "translation_en": "When is he coming back?"},
            {"text": "我要回去了。", "pinyin": "Wǒ yào huíqù le.", "translation_en": "I'm going back now."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D69_NA_LAI_NA_QU",
        "拿 + 來 / 拿 + 去",
        ["拿", "來/去"],
        "Use 拿 (ná) with direction complements: 拿來 (bring here by holding) and 拿去 (take there by holding). 拿 specifically means 'to hold and carry' — it involves physically picking something up.",
        "Fetch/Bring with 拿來/拿去",
        "bring (holding) / take (holding)",
        [
            "When asking someone to physically bring you something",
            "When moving objects between locations",
            "In daily household and office situations"
        ],
        [
            "Do not confuse 拿 (hold/carry) with 帶 (bring along/accompany)",
            "拿來/拿去 implies physically holding the object"
        ],
        "In Taiwan, 幫我拿一下 (Hold this for me a moment) is common. 拿來給我 (Bring it to me) is a direct request.",
        "拿 + Object + 來/去.",
        "English: 'Bring me that book.' Chinese: 把那本書拿來。(BA that book bring here).",
        "Korean: '그 책을 가져와.' Chinese 拿來 corresponds to Korean '가져오다'.",
        get_sentence_ids_for_day(sentences, 69, 4)[:4],
        [
            {"text": "把那個拿來給我。", "pinyin": "Bǎ nà ge ná lái gěi wǒ.", "translation_en": "Bring that over to me."},
            {"text": "把垃圾拿去丟。", "pinyin": "Bǎ lèsè ná qù diū.", "translation_en": "Take the trash out (to throw away)."},
        ]
    ))
    
    # ========== DAY 70: Problem Solving Review ==========
    grammar_entries.append(make_review_entry("GR_D70_REVIEW_PROBLEM_SOLVING", "Problem Solving Review (Days 61-69)", "61-69",
        get_sentence_ids_for_day(sentences, 70, 6)))
    
    # ========== DAY 71: Work & Roles ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D71_ZAI_COMPANY_WORK",
        "Subject + 在 + company + 上班 / 工作",
        ["subject", "在", "company", "上班/工作"],
        "Use 在 + place + 上班 (shàngbān) to say 'work at [place]'. 上班 specifically means 'to go to work/be at work'. 工作 (gōngzuò) is the general verb for 'work'. This distinction is important in Taiwan.",
        "Work At with 在...上班",
        "to work at (a place); to be employed at",
        [
            "When saying where you work",
            "When asking about someone's workplace",
            "In professional introductions"
        ],
        [
            "Do not use 工作 without 在 for specifying workplace",
            "上班 = go to work/be at work, 工作 = work (general activity)"
        ],
        "In Taiwan, 你在哪裡上班？(Where do you work?) is a standard getting-to-know-you question. 上班 emphasizes the employment relationship.",
        "Subject + 在 + Place + 上班/工作.",
        "English: 'I work at a tech company.' Chinese: 我在科技公司上班。(I at tech company work).",
        "Korean: '저는 IT 회사에서 일해요.' Chinese 在...上班 corresponds to Korean '~에서 일하다'.",
        get_sentence_ids_for_day(sentences, 71, 6),
        [
            {"text": "我在科技公司上班。", "pinyin": "Wǒ zài kējì gōngsī shàngbān.", "translation_en": "I work at a tech company."},
            {"text": "他在醫院工作。", "pinyin": "Tā zài yīyuàn gōngzuò.", "translation_en": "He works at a hospital."},
            {"text": "你在哪裡上班？", "pinyin": "Nǐ zài nǎlǐ shàngbān?", "translation_en": "Where do you work?"},
            {"text": "我每天九點上班。", "pinyin": "Wǒ měitiān jiǔ diǎn shàngbān.", "translation_en": "I start work at 9 every day."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D71_DANG_ROLE",
        "Subject + 當 + role / Subject + 是 + 當 + role + 的",
        ["subject", "當", "role"],
        "Use 當 (dāng) to mean 'to serve as' or 'to work as'. 當老師 = to be a teacher, 當醫生 = to be a doctor. 當 is the standard verb for describing one's professional role in Taiwan.",
        "Work As with 當",
        "to work as; to serve as; to be (a role)",
        [
            "When describing your profession or role",
            "When asking what someone does for a living",
            "In career-related conversations"
        ],
        [
            "Do not use 是 for professional roles in the same way — 我是老師 and 我當老師 are both correct but 當 emphasizes the role/function",
            "當 can also mean 'when' — context distinguishes"
        ],
        "In Taiwan, 你當什麼？(What do you do?) is a casual way to ask about someone's job. 我當工程師 (I work as an engineer) is a common answer.",
        "Subject + 當 + Role.",
        "English: 'She works as a nurse.' Chinese: 她當護士。(She serve-as nurse).",
        "Korean: '간호사로 일해요.' Chinese 當 corresponds to Korean '~로 일하다'.",
        get_sentence_ids_for_day(sentences, 71, 4)[:4],
        [
            {"text": "他當老師。", "pinyin": "Tā dāng lǎoshī.", "translation_en": "He works as a teacher."},
            {"text": "我姐姐當護士。", "pinyin": "Wǒ jiějie dāng hùshì.", "translation_en": "My older sister works as a nurse."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D71_MANG_BU_MANG",
        "Subject + 忙不忙？/ Subject + 很忙 / Subject + 不太忙",
        ["subject", "忙不忙"],
        "Use 忙 (máng) to describe being busy. 忙不忙 (máng bù máng) is the A-not-A question form: 'Are you busy?' This is a very common small-talk pattern in Taiwan workplaces.",
        "Busy with 忙",
        "busy; occupied",
        [
            "When asking about someone's workload",
            "When explaining why you can't do something",
            "In workplace small talk"
        ],
        [
            "Do not say 你是忙 — adjectives don't need 是",
            "忙不忙 is the standard question form"
        ],
        "In Taiwan, 你最近忙不忙？(Have you been busy lately?) is extremely common small talk. It shows care about the person's wellbeing.",
        "Subject + 忙不忙？/ Subject + 很忙 / Subject + 不忙.",
        "English: 'Are you busy?' Chinese: 你忙不忙？(You busy-not-busy?).",
        "Korean: '바빠요?' Chinese 忙不忙 corresponds to Korean '바쁘다'.",
        get_sentence_ids_for_day(sentences, 71, 4)[:4],
        [
            {"text": "你最近忙不忙？", "pinyin": "Nǐ zuìjìn máng bù máng?", "translation_en": "Have you been busy lately?"},
            {"text": "他工作很忙。", "pinyin": "Tā gōngzuò hěn máng.", "translation_en": "He is very busy with work."},
        ]
    ))
    
    # ========== DAY 72: Work Status ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D72_YAO_FINISH",
        "快要 + verb + 了 / 就要 + verb + 了",
        ["快要/就要", "verb", "了"],
        "Use 快要...了 (kuài yào...le) or 就要...了 (jiù yào...le) to mean 'about to' or 'almost'. 快要 is more colloquial, 就要 is slightly more formal. Both indicate imminence.",
        "About To with 快要...了",
        "about to; almost; soon",
        [
            "When something is about to happen",
            "When you're almost finished with something",
            "When indicating urgency or imminence"
        ],
        [
            "Do not forget 了 at the end — it's essential to the pattern",
            "快要...了 and 就要...了 both need 了"
        ],
        "In Taiwan, 快好了 (almost ready/done) is a very common phrase. 快要下班了 (almost time to get off work) is heard daily.",
        "快要 + Verb + 了 / 就要 + Verb + 了.",
        "English: 'I'm almost done.' Chinese: 我快做好了。(I almost do-finish LE).",
        "Korean: '거의 다 했어요.' Chinese 快要...了 corresponds to Korean '거의 ~했다'.",
        get_sentence_ids_for_day(sentences, 72, 6),
        [
            {"text": "我快做好了。", "pinyin": "Wǒ kuài zuò hǎo le.", "translation_en": "I'm almost done."},
            {"text": "快要下班了。", "pinyin": "Kuài yào xiàbān le.", "translation_en": "It's almost time to get off work."},
            {"text": "會快開完了。", "pinyin": "Huì kuài kāi wán le.", "translation_en": "The meeting is almost over."},
            {"text": "快點，公車要來了。", "pinyin": "Kuài diǎn, gōngchē yào lái le.", "translation_en": "Hurry up, the bus is about to come."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D72_ZAI_KAIHUI",
        "Subject + 在 + 開會 / Subject + 正在 + 開會",
        ["subject", "在", "開會"],
        "Use 在開會 (zài kāihuì) to say 'in a meeting'. 開會 (kāihuì) means 'to have/hold a meeting'. 在 + 開會 indicates the meeting is in progress. This is essential workplace vocabulary.",
        "In a Meeting with 在開會",
        "in a meeting; having a meeting",
        [
            "When you're in a meeting and can't talk",
            "When explaining unavailability at work",
            "When scheduling around meetings"
        ],
        [
            "Do not say 我在會議 — use 我在開會 (I'm in a meeting)",
            "開會 emphasizes the action of having the meeting"
        ],
        "In Taiwan offices, 我在開會 (I'm in a meeting) is the standard way to say you're unavailable. It's direct and clear.",
        "Subject + 在 + 開會.",
        "English: 'I'm in a meeting.' Chinese: 我在開會。(I ZAI open-meeting).",
        "Korean: '회의 중이에요.' Chinese 在開會 corresponds to Korean '회의 중이다'.",
        get_sentence_ids_for_day(sentences, 72, 4)[:4],
        [
            {"text": "他在開會，不方便接電話。", "pinyin": "Tā zài kāihuì, bù fāngbiàn jiē diànhuà.", "translation_en": "He's in a meeting and can't take a call right now."},
            {"text": "我們下午三點要開會。", "pinyin": "Wǒmen xiàwǔ sān diǎn yào kāihuì.", "translation_en": "We have a meeting at 3 PM."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D72_HAI_MEI_FINISH",
        "Subject + 還沒 + verb (+ 呢)",
        ["subject", "還沒", "verb"],
        "Use 還沒 (hái méi) to mean 'not yet'. It indicates that something expected hasn't happened yet. Adding 呢 (ne) at the end makes it more conversational. This is extremely common in Taiwan daily speech.",
        "Not Yet with 還沒",
        "not yet; still haven't",
        [
            "When something expected hasn't happened yet",
            "When you're still working on something",
            "When asking if something is done yet"
        ],
        [
            "Do not confuse 還沒 (not yet) with 沒有 (didn't/haven't)",
            "還沒 implies expectation that it WILL happen"
        ],
        "Taiwan speakers use 還沒 constantly: 還沒好 (not ready yet), 還沒吃完 (haven't finished eating yet), 還沒到 (haven't arrived yet).",
        "Subject + 還沒 + Verb (+ 呢).",
        "English: 'I haven't finished yet.' Chinese: 我還沒做完。(I still not do-finish).",
        "Korean: '아직 안 끝났어요.' Chinese 還沒 corresponds to Korean '아직 안 ~했다'.",
        get_sentence_ids_for_day(sentences, 72, 4)[:4],
        [
            {"text": "我還沒做完。", "pinyin": "Wǒ hái méi zuò wán.", "translation_en": "I haven't finished yet."},
            {"text": "他還沒來。", "pinyin": "Tā hái méi lái.", "translation_en": "He hasn't come yet."},
        ]
    ))
    
    # ========== DAY 73: Opinions ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D73_WO_JUEDE",
        "Subject + 覺得 + statement",
        ["subject", "覺得", "statement"],
        "Use 覺得 (juéde) to express 'think/feel'. This is the most common way to give an opinion in Taiwan Mandarin. 我覺得... (I think/feel...) is softer and more personal than 我認為 (I believe/opine).",
        "I Think/Feel with 覺得",
        "to think; to feel; to be of the opinion that",
        [
            "When giving a personal opinion",
            "When expressing how you feel about something",
            "When softening a statement to be less direct"
        ],
        [
            "Do not use 覺得 for factual knowledge — use 知道 (zhīdào, know)",
            "覺得 is subjective opinion, 知道 is factual knowledge"
        ],
        "Taiwan speakers use 我覺得 constantly. It's a cultural habit to soften opinions by framing them as personal feelings rather than absolute truths. 我覺得不錯 (I think it's not bad) is more polite than 很好 (it's great).",
        "Subject + 覺得 + Statement.",
        "English: 'I think it's good.' Chinese: 我覺得很好。(I feel very good).",
        "Korean: '좋은 것 같아요.' Chinese 覺得 corresponds to Korean '~ㄴ 것 같다'.",
        get_sentence_ids_for_day(sentences, 73, 6),
        [
            {"text": "我覺得這家餐廳不錯。", "pinyin": "Wǒ juéde zhè jiā cāntīng búcuò.", "translation_en": "I think this restaurant is not bad."},
            {"text": "你覺得怎麼樣？", "pinyin": "Nǐ juéde zěnme yàng?", "translation_en": "What do you think?"},
            {"text": "他覺得中文很難。", "pinyin": "Tā juéde Zhōngwén hěn nán.", "translation_en": "He thinks Chinese is difficult."},
            {"text": "我覺得你應該試試看。", "pinyin": "Wǒ juéde nǐ yīnggāi shì shì kàn.", "translation_en": "I think you should give it a try."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D73_WO_RENWEI_INTRO",
        "Subject + 認為 + statement",
        ["subject", "認為", "statement"],
        "Use 認為 (rènwéi) to express 'believe/opine/consider'. It is more formal than 覺得 and is used for considered opinions, beliefs, and positions. In Taiwan, 認為 is common in workplace discussions and more serious conversations.",
        "I Believe/Opine with 認為",
        "to believe; to think; to consider; to opine",
        [
            "When expressing a considered opinion",
            "In workplace or formal discussions",
            "When stating a position or belief"
        ],
        [
            "Do not use 認為 for casual feelings — use 覺得 instead",
            "認為 carries more weight than 覺得"
        ],
        "In Taiwan business settings, 我認為... signals a formal opinion. In casual settings, 我覺得... is more natural. The distinction helps navigate formality levels.",
        "Subject + 認為 + Statement.",
        "English: 'I believe this plan will work.' Chinese: 我認為這個計畫會成功。(I believe this plan will succeed).",
        "Korean: '저는 이 계획이 성공할 거라고 생각합니다.' Chinese 認為 corresponds to formal Korean '~라고 생각합니다'.",
        get_sentence_ids_for_day(sentences, 73, 4)[:4],
        [
            {"text": "我認為這個方法比較好。", "pinyin": "Wǒ rènwéi zhège fāngfǎ bǐjiào hǎo.", "translation_en": "I believe this method is better."},
            {"text": "很多人認為學習中文很重要。", "pinyin": "Hěn duō rén rènwéi xuéxí Zhōngwén hěn zhòngyào.", "translation_en": "Many people believe that learning Chinese is very important."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D73_BU_YIDING",
        "Subject + 不一定 + statement",
        ["subject", "不一定", "statement"],
        "Use 不一定 (bù yīdìng) to mean 'not necessarily' or 'not always'. It expresses that something is not absolute. This is a very useful phrase for nuanced opinions in Taiwan Mandarin.",
        "Not Necessarily with 不一定",
        "not necessarily; not always; not for sure",
        [
            "When something is not always true",
            "When expressing uncertainty or nuance",
            "When politely disagreeing"
        ],
        [
            "Do not confuse 不一定 (not necessarily) with 一定不 (definitely not)",
            "不一定 = maybe not, 一定不 = definitely not — very different meanings"
        ],
        "In Taiwan, 不一定 is a polite way to express doubt or disagreement without being confrontational. '貴的東西不一定好吃' (Expensive things aren't necessarily delicious).",
        "Subject + 不一定 + Statement.",
        "English: 'Expensive doesn't necessarily mean good.' Chinese: 貴的不一定好。(Expensive DE not-necessarily good).",
        "Korean: '비싼 게 꼭 좋은 건 아니에요.' Chinese 不一定 corresponds to Korean '꼭 ~한 것은 아니다'.",
        get_sentence_ids_for_day(sentences, 73, 4)[:4],
        [
            {"text": "貴的東西不一定好吃。", "pinyin": "Guì de dōngxi bù yīdìng hǎochī.", "translation_en": "Expensive things are not necessarily delicious."},
            {"text": "他不一定會來。", "pinyin": "Tā bù yīdìng huì lái.", "translation_en": "He might not come (it's not certain)."},
        ]
    ))
    
    # ========== DAY 74: Argumentation ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D74_BIJING",
        "畢竟 + statement",
        ["畢竟", "statement"],
        "Use 畢竟 (bìjìng) to mean 'after all' or 'in the final analysis'. It introduces a fundamental reason or fact that supports your argument. It's a sophisticated connector for intermediate-level discussion.",
        "After All with 畢竟",
        "after all; in the end; ultimately",
        [
            "When giving a fundamental reason for something",
            "When acknowledging an underlying truth",
            "In discussions and arguments"
        ],
        [
            "Do not use 畢竟 for minor, non-fundamental points",
            "畢竟 introduces the CORE reason, not just any reason"
        ],
        "Taiwan speakers use 畢竟 in discussions to ground their arguments: 畢竟我們是朋友 (After all, we are friends). It adds depth to reasoning.",
        "畢竟 + Statement.",
        "English: 'After all, we're friends.' Chinese: 畢竟我們是朋友。(After-all we are friends).",
        "Korean: '어차피 우리는 친구잖아요.' Chinese 畢竟 corresponds to Korean '어차피/결국'.",
        get_sentence_ids_for_day(sentences, 74, 6),
        [
            {"text": "畢竟我們是朋友，應該互相幫忙。", "pinyin": "Bìjìng wǒmen shì péngyou, yīnggāi hùxiāng bāngmáng.", "translation_en": "After all, we're friends; we should help each other."},
            {"text": "畢竟他剛來，還不太熟悉環境。", "pinyin": "Bìjìng tā gāng lái, hái bú tài shúxī huánjìng.", "translation_en": "After all, he just arrived and isn't very familiar with the environment yet."},
            {"text": "畢竟中文不是我的母語，所以有時候會犯錯。", "pinyin": "Bìjìng Zhōngwén bú shì wǒ de mǔyǔ, suǒyǐ yǒu shíhou huì fàncuò.", "translation_en": "After all, Chinese is not my native language, so sometimes I make mistakes."},
            {"text": "這個決定不容易，畢竟影響很多人。", "pinyin": "Zhège juédìng bù róngyì, bìjìng yǐngxiǎng hěn duō rén.", "translation_en": "This decision isn't easy; after all, it affects many people."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D74_LIRU",
        "例如 + example / 比如 + example",
        ["例如/比如", "example"],
        "Use 例如 (lìrú) or 比如 (bǐrú) to mean 'for example'. 比如 is more common in casual Taiwan speech. Both are essential for giving examples and supporting arguments.",
        "For Example with 例如/比如",
        "for example; for instance; such as",
        [
            "When giving an example to support a point",
            "When clarifying with a specific instance",
            "In both casual and formal discussions"
        ],
        [
            "Do not confuse 例如/比如 (for example) with 如果 (if)",
            "比如 is more casual and common in Taiwan speech"
        ],
        "Taiwan speakers prefer 比如 in daily conversation. 例如 is more common in writing and formal presentations. Both are correct.",
        "例如/比如 + Example.",
        "English: 'For example, in Taiwan...' Chinese: 比如在台灣...(For-example in Taiwan...).",
        "Korean: '예를 들어 대만에서는...' Chinese 例如/比如 corresponds to Korean '예를 들어'.",
        get_sentence_ids_for_day(sentences, 74, 4)[:4],
        [
            {"text": "我喜歡吃臺灣小吃，比如滷肉飯、蚵仔煎。", "pinyin": "Wǒ xǐhuān chī Táiwān xiǎochī, bǐrú lǔròufàn, ézǐjiān.", "translation_en": "I like eating Taiwanese snacks, for example braised pork rice and oyster omelet."},
            {"text": "很多國家都有類似的問題，例如日本和韓國。", "pinyin": "Hěn duō guójiā dōu yǒu lèisì de wèntí, lìrú Rìběn hé Hánguó.", "translation_en": "Many countries have similar problems, for example Japan and Korea."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D74_SUOYI_CONCLUSION",
        "Statement，所以 + conclusion",
        ["statement", "所以", "conclusion"],
        "Use 所以 (suǒyǐ) to mean 'so' or 'therefore'. It introduces a conclusion or result. This is one of the most frequently used connectors in Taiwan Mandarin for reasoning and argumentation.",
        "So/Therefore with 所以",
        "so; therefore; thus",
        [
            "When drawing a conclusion from previous statements",
            "When explaining reasoning",
            "When summarizing an argument"
        ],
        [
            "Do not use 所以 at the beginning of a completely new topic",
            "所以 should logically follow from what was just said"
        ],
        "Taiwan speakers use 所以 constantly. It's one of the most useful connectors. 所以呢？(So?) is a common way to ask someone to get to the point.",
        "Statement，所以 + Conclusion.",
        "English: 'It's raining, so I won't go.' Chinese: 下雨了，所以我不去。(Rain LE, so I not go).",
        "Korean: '비가 와서 안 가요.' Chinese 所以 corresponds to Korean '~서/그래서'.",
        get_sentence_ids_for_day(sentences, 74, 4)[:4],
        [
            {"text": "我覺得太貴了，所以沒買。", "pinyin": "Wǒ juéde tài guì le, suǒyǐ méi mǎi.", "translation_en": "I thought it was too expensive, so I didn't buy it."},
            {"text": "他很努力學習，所以進步很快。", "pinyin": "Tā hěn nǔlì xuéxí, suǒyǐ jìnbù hěn kuài.", "translation_en": "He studies very hard, so he improves quickly."},
        ]
    ))
    
    # ========== DAY 75: Assessment Review ==========
    grammar_entries.append(make_review_entry("GR_D75_ASSESSMENT_REVIEW", "Assessment & Review (Days 61-74)", "61-74",
        get_sentence_ids_for_day(sentences, 75, 6)))
    
    # ========== DAY 76: Storytelling I ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D76_BENLAI_HOULAI",
        "本來 + plan/thought，可是後來 + change，結果 + outcome",
        ["本來", "plan", "可是", "後來", "change", "結果", "outcome"],
        "Use 本來...後來...結果... (běnlái...hòulái...jiéguǒ...) to tell a story with a change of plans. 本來 introduces the original plan, 後來 introduces what changed, and 結果 introduces the final outcome. This is the classic Chinese storytelling framework.",
        "Originally...Later...Result with 本來...後來...結果",
        "originally... later... in the end...",
        [
            "When telling a story with a change of plans",
            "When narrating an unexpected outcome",
            "When explaining why things turned out differently"
        ],
        [
            "Do not use 本來 for future plans — it refers to original intentions that may have changed",
            "The full 本來...後來...結果 pattern is for longer narratives"
        ],
        "Taiwan speakers love this storytelling pattern. It's how you tell engaging stories about what almost happened but didn't. The three-part structure is very natural in Chinese narrative.",
        "本來 + Original Plan，可是後來 + What Changed，結果 + Final Outcome.",
        "English: 'I was going to go, but then it rained, so I ended up staying home.' Chinese: 我本來要去，可是後來下雨了，結果我待在家裡。",
        "Korean: '원래 가려고 했는데 비가 와서 결국 집에 있었어요.' Chinese 本來...後來...結果 corresponds to Korean '원래...는데...결국'.",
        get_sentence_ids_for_day(sentences, 76, 6),
        [
            {"text": "我本來想買那個包包，可是後來覺得太貴了，結果沒買。", "pinyin": "Wǒ běnlái xiǎng mǎi nà ge bāobāo, kěshì hòulái juéde tài guì le, jiéguǒ méi mǎi.", "translation_en": "I originally wanted to buy that bag, but later I thought it was too expensive, so in the end I didn't buy it."},
            {"text": "他本來打算去公園散步，可是後來突然下雨了，結果他待在家裡。", "pinyin": "Tā běnlái dǎsuàn qù gōngyuán sànbù, kěshì hòulái túrán xià yǔ le, jiéguǒ tā dāi zài jiā lǐ.", "translation_en": "He originally planned to go for a walk in the park, but later it suddenly rained, so he ended up staying at home."},
            {"text": "我本來想吃牛肉麵，可是後來發現那家餐廳已經關門了，結果我去吃水餃。", "pinyin": "Wǒ běnlái xiǎng chī niúròu miàn, kěshì hòulái fāxiàn nà jiā cāntīng yǐjīng guān mén le, jiéguǒ wǒ qù chī shuǐjiǎo.", "translation_en": "I originally wanted to eat beef noodles, but later I found out that restaurant was already closed, so I went to eat dumplings instead."},
            {"text": "她本來要跟朋友一起去看電影，可是後來朋友臨時有事，結果她自己去了。", "pinyin": "Tā běnlái yào gēn péngyou yīqǐ qù kàn diànyǐng, kěshì hòulái péngyou línshí yǒu shì, jiéguǒ tā zìjǐ qù le.", "translation_en": "She originally was going to watch a movie with her friend, but later her friend had something come up, so she went by herself."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D76_YINWEI_RESULT",
        "因為 + reason，結果 + unexpected outcome",
        ["因為", "reason", "結果", "outcome"],
        "Use 因為...結果... (yīnwèi...jiéguǒ...) to tell a cause-and-effect story where the result was somewhat unexpected. 因為 introduces the cause, 結果 introduces the surprising or noteworthy outcome.",
        "Because...It Turned Out with 因為...結果",
        "because... it turned out that...",
        [
            "When explaining an unexpected outcome",
            "When the cause seems small but the result was significant",
            "When telling an anecdote with a twist"
        ],
        [
            "Do not use 結果 for expected, logical outcomes — it often implies surprise",
            "因為...結果 can sometimes be shortened to just 結果 in casual speech"
        ],
        "Taiwan speakers use 結果 to add drama to stories. The word carries a slight sense of 'and guess what happened?' which makes narratives more engaging.",
        "因為 + Reason，結果 + Outcome.",
        "English: 'Because I was curious, I ended up trying it.' Chinese: 因為好奇，結果我試了。(Because curious, result I tried).",
        "Korean: '궁금해서 결국 해봤어요.' Chinese 結果 corresponds to Korean '결국'.",
        get_sentence_ids_for_day(sentences, 76, 4)[:4],
        [
            {"text": "我本來覺得今天心情不好，可是後來遇到一個老朋友，結果很開心。", "pinyin": "Wǒ běnlái juéde jīntiān xīnqíng bù hǎo, kěshì hòulái yù dào yī ge lǎo péngyou, jiéguǒ hěn kāixīn.", "translation_en": "I originally felt in a bad mood today, but later I ran into an old friend, and in the end I was very happy."},
            {"text": "他本來想學中文，可是後來覺得太難了，結果他放棄了。", "pinyin": "Tā běnlái xiǎng xué zhōngwén, kěshì hòulái juéde tài nán le, jiéguǒ tā fàngqì le.", "translation_en": "He originally wanted to learn Chinese, but later he thought it was too difficult, so he gave up."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D76_FEELING_AFTER_EVENT",
        "Event，Subject + 覺得 + feeling / Event，Subject + 很 + feeling adjective",
        ["event", "subject", "覺得/很", "feeling"],
        "Use this pattern to express feelings about an event. After narrating what happened, add your emotional response. This makes stories personal and relatable in Taiwan Mandarin.",
        "Expressing Feelings About Events",
        "describing emotional reactions to experiences",
        [
            "When adding emotional depth to a story",
            "When sharing how an experience made you feel",
            "When connecting with listeners through shared feelings"
        ],
        [
            "Do not use 是 before feelings — Chinese emotions use 很 or 覺得",
            "Some emotions use 很 (我很開心), others use 覺得 (我覺得很感動)"
        ],
        "Taiwan culture values emotional authenticity in storytelling. Sharing how you felt makes stories more engaging and builds connection with listeners.",
        "Event，Subject + 覺得 + Feeling / Event，Subject + 很 + Feeling Adjective.",
        "English: 'It made me very happy.' Chinese: 我覺得很開心。(I feel very happy).",
        "Korean: '정말 기뻤어요.' Chinese emotional expressions correspond to Korean emotional adjectives/adverbs.",
        get_sentence_ids_for_day(sentences, 76, 4)[:4],
        [
            {"text": "我本來覺得今天心情不好，可是後來遇到一個老朋友，結果很開心。", "pinyin": "Wǒ běnlái juéde jīntiān xīnqíng bù hǎo, kěshì hòulái yù dào yī ge lǎo péngyou, jiéguǒ hěn kāixīn.", "translation_en": "I originally felt in a bad mood today, but later I ran into an old friend, and in the end I was very happy."},
        ]
    ))
    
    # ========== DAY 77: Storytelling II - Clarification ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D77_RANHOU_NE",
        "Statement，然後呢？/ Clause 1，然後 + clause 2 + 呢",
        ["statement", "然後呢"],
        "Use 然後呢 (ránhòu ne) to ask 'and then?' or 'what happened next?' Adding 呢 makes it a question that prompts the speaker to continue. This is essential for active listening and showing engagement in Taiwan conversations.",
        "And Then? with 然後呢",
        "and then?; what happened next?",
        [
            "When asking someone to continue their story",
            "When showing interest and engagement",
            "When prompting for more details"
        ],
        [
            "Do not overuse 然後呢 — it can sound impatient if repeated too much",
            "呢 adds the questioning tone — without it, 然後 just means 'and then'"
        ],
        "Taiwan listeners use 然後呢？ to show they're actively listening. It's a friendly way to keep someone talking. Combined with nodding, it's the standard active-listening response.",
        "Statement，然後呢？",
        "English: 'And then what happened?' Chinese: 然後呢？(Then NE?). 呢 makes it a question.",
        "Korean: '그리고 나서요?' Chinese 然後呢 corresponds to Korean '그리고요?/그 다음에요?'.",
        get_sentence_ids_for_day(sentences, 77, 6),
        [
            {"text": "我昨天去了一個很有趣的地方。", "pinyin": "Wǒ zuótiān qù le yī ge hěn yǒuqù de dìfāng.", "translation_en": "I went to a very interesting place yesterday."},
            {"text": "然後呢？", "pinyin": "Ránhòu ne?", "translation_en": "And then?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D77_HOU_LAI",
        "後來 + clause / Clause 1，後來 + clause 2",
        ["後來", "clause"],
        "Use 後來 (hòulái) to mean 'later' or 'afterwards'. It introduces what happened next in a narrative sequence. Unlike 然後 (and then, immediate next), 後來 can refer to a later point in time, not necessarily the immediate next action.",
        "Later/Afterwards with 後來",
        "later; afterwards; subsequently",
        [
            "When narrating a sequence of past events",
            "When there is a time gap between events",
            "When the later event is more significant"
        ],
        [
            "Do not confuse 後來 (later, past) with 以後 (after, future)",
            "後來 is specifically for past narratives, 以後 can be future"
        ],
        "Taiwan speakers use 後來 in storytelling to mark a shift in time. '後來呢？' (What happened later?) is another common story-prompting question.",
        "後來 + Clause.",
        "English: 'Later, I found out the truth.' Chinese: 後來我發現了真相。(Later I discovered truth).",
        "Korean: '나중에 진실을 알게 됐어요.' Chinese 後來 corresponds to Korean '나중에/후에'.",
        get_sentence_ids_for_day(sentences, 77, 4)[:4],
        [
            {"text": "後來我才知道他已經離開了。", "pinyin": "Hòulái wǒ cái zhīdào tā yǐjīng líkāi le.", "translation_en": "Only later did I find out that he had already left."},
            {"text": "後來發生了很多事情。", "pinyin": "Hòulái fāshēng le hěn duō shìqing.", "translation_en": "Later, many things happened."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D77_NI_DE_YISI_SHI",
        "你的意思是 + interpretation？/ 你是說 + interpretation？",
        ["你的意思是", "interpretation"],
        "Use 你的意思是... (nǐ de yìsi shì...) to mean 'Do you mean...?' or 'Are you saying...?'. This is the standard way to check understanding in Taiwan conversations. It shows you're listening carefully and want to make sure you understood correctly.",
        "Do You Mean with 你的意思是",
        "Do you mean...?; Are you saying...?",
        [
            "When checking your understanding of what someone said",
            "When clarifying ambiguous statements",
            "When showing active listening"
        ],
        [
            "Do not use this pattern to challenge someone — it's for genuine clarification",
            "你是說... is the shorter, more casual version"
        ],
        "Taiwan speakers use 你的意思是... frequently to ensure clear communication. It's polite and shows you value understanding correctly. 你是說... is more casual.",
        "你的意思是 + Interpretation？",
        "English: 'Do you mean you're not coming?' Chinese: 你的意思是你不來嗎？(Your meaning is you not come MA?).",
        "Korean: '그 말은 안 온다는 뜻이에요?' Chinese 你的意思是 corresponds to Korean '그 말은 ~라는 뜻이에요?'.",
        get_sentence_ids_for_day(sentences, 77, 4)[:4],
        [
            {"text": "你的意思是我們要改時間嗎？", "pinyin": "Nǐ de yìsi shì wǒmen yào gǎi shíjiān ma?", "translation_en": "Do you mean we need to change the time?"},
            {"text": "你是說他不會來了？", "pinyin": "Nǐ shì shuō tā bú huì lái le?", "translation_en": "Are you saying he's not coming?"},
        ]
    ))
    
    # ========== DAY 78: Conversation Fillers ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D78_NAGE_FILLER",
        "那個... + statement (conversation filler)",
        ["那個", "statement"],
        "Use 那個 (nèige/nàge) as a conversation filler, similar to 'um' or 'uh' in English. In Taiwan casual speech, 那個 is extremely common as a hesitation marker while thinking of what to say next. It's an essential part of natural-sounding Chinese.",
        "Conversation Filler 那個",
        "um; uh; you know (conversation filler)",
        [
            "When pausing to think during conversation",
            "When hesitating or searching for the right word",
            "To sound more natural and less rehearsed"
        ],
        [
            "Do not overuse 那個 in formal presentations — it can sound unprofessional",
            "In casual conversation, moderate use is perfectly natural"
        ],
        "Taiwan speakers use 那個 as a filler constantly. Pronounced 'nèige' in casual speech, it's the most common hesitation marker. Using it appropriately makes your Chinese sound much more natural.",
        "那個... + Statement.",
        "English: 'Um, I think...' Chinese: 那個...我覺得...(That-one... I think...).",
        "Korean: '저... 제 생각에는...' Chinese 那個 as filler corresponds to Korean '저.../그...'.",
        get_sentence_ids_for_day(sentences, 78, 6),
        [
            {"text": "那個...我想問你一個問題。", "pinyin": "Nèige... wǒ xiǎng wèn nǐ yī ge wèntí.", "translation_en": "Um... I want to ask you a question."},
            {"text": "那個...我不知道該怎麼說。", "pinyin": "Nèige... wǒ bù zhīdào gāi zěnme shuō.", "translation_en": "Um... I don't know how to say it."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D78_DUI_DUI_DUI",
        "對對對！+ follow-up / 對對對，+ agreement",
        ["對對對", "follow-up"],
        "Use 對對對 (duì duì duì) to enthusiastically agree with someone. Repeating 對 three times is a very Taiwan way to show strong agreement. It's warm, friendly, and shows you're really listening.",
        "Enthusiastic Agreement with 對對對",
        "Yes yes yes!; Exactly!; That's right!",
        [
            "When strongly agreeing with someone",
            "When showing enthusiasm about a shared opinion",
            "When acknowledging someone's point emphatically"
        ],
        [
            "Do not use 對對對 sarcastically — it's genuinely enthusiastic in Taiwan",
            "Two 對對 is calmer, three 對對對 is very enthusiastic"
        ],
        "Taiwan speakers often say 對對對 when they really connect with what someone said. It's a warmth marker in conversation. Combined with nodding, it's a strong positive signal.",
        "對對對 + Follow-up statement.",
        "English: 'Yes, exactly! I think so too.' Chinese: 對對對！我也這麼覺得。(Yes-yes-yes! I also this-way think).",
        "Korean: '맞아맞아! 나도 그렇게 생각해.' Chinese 對對對 corresponds to Korean '맞아맞아!'.",
        get_sentence_ids_for_day(sentences, 78, 4)[:4],
        [
            {"text": "對對對！我也是這樣想。", "pinyin": "Duì duì duì! Wǒ yě shì zhèyàng xiǎng.", "translation_en": "Yes yes yes! I think so too."},
            {"text": "對對對，你說得沒錯。", "pinyin": "Duì duì duì, nǐ shuō de méi cuò.", "translation_en": "Exactly, you're absolutely right."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D78_WO_SHI_SHUO",
        "我是說 + clarification",
        ["我是說", "clarification"],
        "Use 我是說 (wǒ shì shuō) to mean 'I mean...' or 'What I'm saying is...'. This is the standard way to clarify or rephrase what you just said in Taiwan Mandarin. It's used when you realize you weren't clear the first time.",
        "I Mean with 我是說",
        "I mean...; What I'm saying is...",
        [
            "When clarifying or rephrasing what you just said",
            "When you realize the listener didn't understand",
            "When correcting a misunderstanding"
        ],
        [
            "Do not use 我是說 to completely change what you said — it's for clarification, not contradiction",
            "The 是 adds emphasis — it's 'what I MEAN is'"
        ],
        "Taiwan speakers use 我是說 frequently in conversation. It's a natural way to self-correct or clarify without losing face. '我是說...不是...' (I mean... not...) is the full correction pattern.",
        "我是說 + Clarification.",
        "English: 'I mean, it's not that expensive.' Chinese: 我是說，沒有那麼貴。(I SHI say, not that expensive).",
        "Korean: '제 말은, 그렇게 비싸지 않다는 거예요.' Chinese 我是說 corresponds to Korean '제 말은...'.",
        get_sentence_ids_for_day(sentences, 78, 4)[:4],
        [
            {"text": "我是說，我們可以明天再去。", "pinyin": "Wǒ shì shuō, wǒmen kěyǐ míngtiān zài qù.", "translation_en": "I mean, we can go again tomorrow."},
            {"text": "我的意思是，不是現在。", "pinyin": "Wǒ de yìsi shì, bú shì xiànzài.", "translation_en": "What I mean is, not now."},
        ]
    ))
    
    # ========== DAY 79: Repair Strategies ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D79_QING_ZAI_SHUO_YI_CI",
        "請再說一次。/ 可以再說一次嗎？",
        ["請", "再", "說", "一次"],
        "Use 請再說一次 (qǐng zài shuō yī cì) to ask someone to repeat what they said. This is the most essential repair strategy in Chinese — when you don't understand, this is what you say. It's polite and clear.",
        "Please Say It Again with 請再說一次",
        "Please say that again.; Could you repeat that?",
        [
            "When you didn't hear or understand what someone said",
            "When you need someone to repeat something",
            "As a polite communication repair strategy"
        ],
        [
            "Do not just say 什麼？(What?) — it can sound rude",
            "請再說一次 is polite; 不好意思，可以再說一次嗎？ is extra polite"
        ],
        "In Taiwan, 不好意思，可以再說一次嗎？ is the gold standard for asking someone to repeat. It combines the polite opener 不好意思 with the request pattern 可以...嗎.",
        "請 + 再 + 說 + 一次 / 可以 + 再 + 說 + 一次 + 嗎？",
        "English: 'Could you say that again?' Chinese: 可以再說一次嗎？(Can again say one-time MA?).",
        "Korean: '다시 한 번 말씀해 주시겠어요?' Chinese 再說一次 corresponds to Korean '다시 한 번 말하다'.",
        get_sentence_ids_for_day(sentences, 79, 6),
        [
            {"text": "不好意思，可以再說一次嗎？", "pinyin": "Bù hǎo yìsi, kěyǐ zài shuō yī cì ma?", "translation_en": "Excuse me, could you say that again?"},
            {"text": "請再說一次，我沒聽清楚。", "pinyin": "Qǐng zài shuō yī cì, wǒ méi tīng qīngchu.", "translation_en": "Please say it again; I didn't hear clearly."},
            {"text": "可以再說一次嗎？太快了。", "pinyin": "Kěyǐ zài shuō yī cì ma? Tài kuài le.", "translation_en": "Could you say it again? It was too fast."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D79_MAN_YI_DIAN",
        "請 + 慢一點 + 說 / 可以 + 說 + 慢一點 + 嗎？",
        ["請", "慢一點", "說"],
        "Use 慢一點 (màn yīdiǎn) to ask someone to slow down. 請說慢一點 (qǐng shuō màn yīdiǎn) means 'please speak more slowly'. This is another essential repair strategy for language learners in Taiwan.",
        "Speak Slower with 慢一點",
        "more slowly; a bit slower",
        [
            "When someone is speaking too fast for you to understand",
            "When you need more time to process what's being said",
            "As a polite request in any conversation"
        ],
        [
            "Do not just say 太慢了！(Too slow!) — that sounds critical",
            "慢一點 is a polite request; 太快了 (too fast) is a statement of fact"
        ],
        "In Taiwan, 可以說慢一點嗎？(Can you speak a bit slower?) is a very common and perfectly acceptable request. Most Taiwanese speakers are happy to accommodate.",
        "請 + 說 + 慢一點 / 可以 + 說 + 慢一點 + 嗎？",
        "English: 'Can you speak more slowly?' Chinese: 可以說慢一點嗎？(Can speak slow a-bit MA?).",
        "Korean: '좀 천천히 말씀해 주시겠어요?' Chinese 慢一點 corresponds to Korean '좀 천천히'.",
        get_sentence_ids_for_day(sentences, 79, 4)[:4],
        [
            {"text": "不好意思，可以說慢一點嗎？", "pinyin": "Bù hǎo yìsi, kěyǐ shuō màn yīdiǎn ma?", "translation_en": "Excuse me, could you speak a little slower?"},
            {"text": "請你說慢一點，我的中文不太好。", "pinyin": "Qǐng nǐ shuō màn yīdiǎn, wǒ de Zhōngwén bú tài hǎo.", "translation_en": "Please speak a little slower; my Chinese isn't very good."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D79_SHI_BU_SHI_MEAN",
        "是不是 + meaning？/ ...是不是 + 這個意思？",
        ["是不是", "meaning"],
        "Use 是不是 (shì bú shì) to confirm understanding: 'Is it...?' or 'Does it mean...?'. This is the A-not-A confirmation pattern. It's a very natural way to check if you understood correctly in Taiwan Mandarin.",
        "Is It That with 是不是",
        "is it...?; does it mean...? (confirmation pattern)",
        [
            "When checking if your understanding is correct",
            "When confirming an interpretation",
            "When you want a yes/no confirmation"
        ],
        [
            "Do not use 是不是 for open-ended questions — it expects yes/no",
            "是不是 can also be used as a tag: ..., 是不是？(..., right?)"
        ],
        "Taiwan speakers use 是不是 constantly to confirm understanding. '你的意思是...是不是？' (You mean..., right?) is a complete clarification pattern.",
        "是不是 + Interpretation？/ Statement + 是不是？",
        "English: 'You mean it's free, right?' Chinese: 你的意思是免費的，是不是？(Your meaning is free DE, is-not-is?).",
        "Korean: '무료라는 거죠?' Chinese 是不是 corresponds to Korean '~죠?/~는 거죠?'.",
        get_sentence_ids_for_day(sentences, 79, 4)[:4],
        [
            {"text": "你的意思是明天不用來，是不是？", "pinyin": "Nǐ de yìsi shì míngtiān bú yòng lái, shì bú shì?", "translation_en": "You mean we don't need to come tomorrow, right?"},
            {"text": "是不是這個意思？", "pinyin": "Shì bú shì zhège yìsi?", "translation_en": "Is that what it means?"},
        ]
    ))
    
    # ========== DAY 80: Signs & Notices ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D80_QING_DO",
        "請 + verb / 請勿 + verb",
        ["請", "verb"],
        "Use 請 (qǐng) on signs and notices to mean 'please'. 請勿 (qǐng wù) means 'please do not'. This is the standard way polite instructions are written on signs throughout Taiwan.",
        "Please (on signs) with 請",
        "please (formal/written instruction)",
        [
            "When reading signs and notices in Taiwan",
            "When writing formal instructions",
            "When understanding public announcements"
        ],
        [
            "Do not confuse 請勿 (please don't) with 不要 (don't — more direct)",
            "請勿 is formal written style; 不要 is spoken/casual"
        ],
        "Taiwan is full of signs with 請: 請排隊 (Please line up), 請勿吸煙 (Please don't smoke), 請隨手關門 (Please close the door behind you). Understanding these is practical for daily life.",
        "請 + Verb / 請勿 + Verb.",
        "English: 'Please do not smoke.' Chinese: 請勿吸煙。(Please don't smoke).",
        "Korean: '담배를 피우지 마십시오.' Chinese 請勿 corresponds to Korean '~하지 마십시오'.",
        get_sentence_ids_for_day(sentences, 80, 6),
        [
            {"text": "請排隊。", "pinyin": "Qǐng páiduì.", "translation_en": "Please line up."},
            {"text": "請勿吸煙。", "pinyin": "Qǐng wù xīyān.", "translation_en": "Please do not smoke."},
            {"text": "請隨手關門。", "pinyin": "Qǐng suíshǒu guān mén.", "translation_en": "Please close the door behind you."},
            {"text": "請保持安靜。", "pinyin": "Qǐng bǎochí ānjìng.", "translation_en": "Please keep quiet."}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D80_BU_KE",
        "不可 + verb / 禁止 + verb",
        ["不可/禁止", "verb"],
        "Use 不可 (bù kě) or 禁止 (jìnzhǐ) on signs to mean 'prohibited' or 'not allowed'. 禁止 is stronger and more official. Both are common on Taiwan signs and notices.",
        "Prohibited with 不可/禁止",
        "prohibited; not allowed; forbidden",
        [
            "When reading prohibition signs",
            "When understanding rules and regulations",
            "In formal and official contexts"
        ],
        [
            "Do not use 不可 in casual speech — it sounds like a sign",
            "禁止 is very strong — it means strictly forbidden"
        ],
        "Taiwan signs commonly use 禁止: 禁止停車 (No parking), 禁止進入 (No entry), 禁止拍照 (No photography). These are important for daily navigation.",
        "不可 + Verb / 禁止 + Verb.",
        "English: 'No parking.' Chinese: 禁止停車。(Prohibit stop-car).",
        "Korean: '주차 금지.' Chinese 禁止 corresponds to Korean '금지'.",
        get_sentence_ids_for_day(sentences, 80, 4)[:4],
        [
            {"text": "禁止停車。", "pinyin": "Jìnzhǐ tíngchē.", "translation_en": "No parking."},
            {"text": "不可拍照。", "pinyin": "Bù kě pāizhào.", "translation_en": "No photography."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D80_NOTICE_STYLE",
        "Notice style: short imperative / 請 + verb / 禁止 + verb",
        ["notice style patterns"],
        "Understanding Taiwan sign language: Signs use short, direct language. Common patterns include 請 + verb (polite request), 禁止 + verb (prohibition), and direct imperatives. Recognizing these patterns helps navigate daily life in Taiwan.",
        "Taiwan Sign Language Patterns",
        "Understanding written notices and signs in Taiwan",
        [
            "When reading signs in public spaces",
            "When understanding official notices",
            "When navigating Taiwan cities"
        ],
        [
            "Sign language is more concise than spoken Chinese",
            "Don't expect full sentences — signs are telegraphic"
        ],
        "Taiwan has bilingual signs (Chinese and English) in many places. The Chinese is often more detailed than the English. Learning to read common sign patterns is very practical.",
        "請 + Verb (polite) / 禁止 + Verb (prohibition) / Direct verb (instruction).",
        "English signs vs Chinese signs: Chinese often uses 請 (please) where English uses direct imperatives.",
        "Korean signs also use '~주세요' and '금지'. Chinese sign patterns are structurally similar to Korean.",
        get_sentence_ids_for_day(sentences, 80, 4)[:4],
        [
            {"text": "請勿踐踏草地。", "pinyin": "Qǐng wù jiàntà cǎodì.", "translation_en": "Please keep off the grass."},
            {"text": "禁止進入。", "pinyin": "Jìnzhǐ jìnrù.", "translation_en": "No entry."},
        ]
    ))
    
    # ========== DAY 81: Phone Calls ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D81_WEI_PHONE",
        "喂？+ greeting / 喂，你好",
        ["喂", "greeting"],
        "Use 喂 (wéi) to answer the phone in Chinese. It's the standard phone greeting, equivalent to 'Hello?' on the phone. In Taiwan, 喂？with a rising tone is the universal way to start a phone conversation.",
        "Phone Hello with 喂",
        "Hello? (phone greeting)",
        [
            "When answering the phone",
            "When starting a phone conversation",
            "When checking if the other person is still on the line"
        ],
        [
            "Do not use 喂 to greet someone in person — it's for phone calls only",
            "喂 can sound rude in person but is perfectly normal on the phone"
        ],
        "In Taiwan, the standard phone answer is 喂？(rising tone). Followed by 你好 (nǐ hǎo) in more formal situations. 喂，你好 is the complete polite phone greeting.",
        "喂？+ 你好 / 喂，請問...",
        "English: 'Hello?' (on phone). Chinese: 喂？(Wéi?). This is uniquely for phone calls.",
        "Korean: '여보세요?' Chinese 喂 corresponds to Korean '여보세요'.",
        get_sentence_ids_for_day(sentences, 81, 6),
        [
            {"text": "喂？你好。", "pinyin": "Wéi? Nǐ hǎo.", "translation_en": "Hello? Hi."},
            {"text": "喂，請問是王先生嗎？", "pinyin": "Wéi, qǐngwèn shì Wáng xiānsheng ma?", "translation_en": "Hello, is this Mr. Wang?"},
            {"text": "喂？我聽不到。", "pinyin": "Wéi? Wǒ tīng bú dào.", "translation_en": "Hello? I can't hear you."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D81_QING_WEN_CALL",
        "請問 + name/title + 在嗎？",
        ["請問", "name", "在嗎"],
        "Use 請問...在嗎？(qǐngwèn...zài ma?) to ask 'Is [name] there?' on the phone. This is the standard polite way to ask for someone on a phone call in Taiwan.",
        "Is Someone There with 請問...在嗎",
        "Excuse me, is [name] there?",
        [
            "When calling and asking for a specific person",
            "In formal phone calls to offices or businesses",
            "When you don't know if the person is available"
        ],
        [
            "Do not just say 他在嗎？without 請問 — it sounds abrupt",
            "請問 adds the necessary politeness for phone calls"
        ],
        "In Taiwan, 請問 + name + 在嗎？is the gold standard for phone etiquette. It's polite and clear. For businesses, 請問 + title + 在嗎？is appropriate.",
        "請問 + Name/Title + 在嗎？",
        "English: 'Is Mr. Wang there?' Chinese: 請問王先生在嗎？(Please-ask Wang mister at MA?).",
        "Korean: '왕 선생님 계세요?' Chinese 請問...在嗎 corresponds to Korean '~계세요?'.",
        get_sentence_ids_for_day(sentences, 81, 4)[:4],
        [
            {"text": "請問王先生在嗎？", "pinyin": "Qǐngwèn Wáng xiānsheng zài ma?", "translation_en": "Is Mr. Wang there?"},
            {"text": "請問李小姐在嗎？", "pinyin": "Qǐngwèn Lǐ xiǎojiě zài ma?", "translation_en": "Is Miss Li there?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D81_WO_XIANG_YAO_CALL",
        "我想找 + person / 我想要 + verb (on phone)",
        ["我想找", "person"],
        "Use 我想找... (wǒ xiǎng zhǎo...) on the phone to mean 'I'm looking for...' or 'I'd like to speak with...'. This is the standard way to state who you want to talk to. 找 (zhǎo) literally means 'find' but on the phone it means 'speak with'.",
        "I'd Like to Speak With on the Phone",
        "I'd like to speak with...; I'm looking for...",
        [
            "When you want to talk to a specific person",
            "When calling a business and need a department",
            "When stating the purpose of your call"
        ],
        [
            "Do not use 想跟...說話 (want to talk with) — 找 is the idiomatic phone word",
            "找 on the phone = 'looking for / wanting to speak with'"
        ],
        "In Taiwan phone calls, 我想找... is the natural way to say who you want. '我想找王先生' (I'd like to speak with Mr. Wang) is standard and polite.",
        "我想找 + Person.",
        "English: 'I'd like to speak with Mr. Wang.' Chinese: 我想找王先生。(I want find Wang mister).",
        "Korean: '왕 선생님과 통화하고 싶은데요.' Chinese 想找 corresponds to Korean '~와 통화하고 싶다'.",
        get_sentence_ids_for_day(sentences, 81, 4)[:4],
        [
            {"text": "我想找王先生。", "pinyin": "Wǒ xiǎng zhǎo Wáng xiānsheng.", "translation_en": "I'd like to speak with Mr. Wang."},
            {"text": "我想找客服人員。", "pinyin": "Wǒ xiǎng zhǎo kèfú rényuán.", "translation_en": "I'd like to speak with a customer service representative."},
        ]
    ))
    
    # ========== DAY 82: Messages & Texts ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D82_MESSAGE_ELLIPSIS",
        "Message style: Short form / Omitting subject / 知道了 / 收到了",
        ["short message patterns"],
        "Chinese text messages and LINE messages often use shortened forms. Subjects are frequently dropped, particles are omitted, and responses are telegraphic. 知道了 (zhīdào le, 'noted/got it') and 收到了 (shōudào le, 'received') are common message responses.",
        "Message-Style Chinese",
        "Short-form written Chinese for messages and texts",
        [
            "When reading or writing text messages in Chinese",
            "When using LINE or other messaging apps in Taiwan",
            "When understanding informal written communication"
        ],
        [
            "Message style is casual — don't use it in formal emails",
            "Dropping the subject is common and natural in messages"
        ],
        "LINE is the dominant messaging app in Taiwan. Understanding message-style Chinese is essential for daily communication with Taiwanese friends and colleagues.",
        "Short forms: 知道了 (Got it), 收到了 (Received), 好 (OK), 沒問題 (No problem).",
        "English: 'Got it, thanks!' Chinese message: 知道了，謝謝！(Know LE, thanks!). Much shorter than spoken form.",
        "Korean messages also use short forms: '알았어, 고마워!' Chinese message style is similarly abbreviated.",
        get_sentence_ids_for_day(sentences, 82, 6),
        [
            {"text": "知道了，謝謝！", "pinyin": "Zhīdào le, xièxie!", "translation_en": "Got it, thanks!"},
            {"text": "收到了。", "pinyin": "Shōudào le.", "translation_en": "Received."},
            {"text": "好，沒問題。", "pinyin": "Hǎo, méi wèntí.", "translation_en": "OK, no problem."},
            {"text": "明天見！", "pinyin": "Míngtiān jiàn!", "translation_en": "See you tomorrow!"}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D82_SHORT_CONFIRM",
        "Short confirmations: 好 / 可以 / 沒問題 / 了解",
        ["short confirmation"],
        "In messages and quick conversations, short confirmations are the norm. 好 (hǎo, 'OK'), 可以 (kěyǐ, 'can do'), 沒問題 (méi wèntí, 'no problem'), and 了解 (liǎojiě, 'understood') are the most common. These are essential for efficient communication.",
        "Short Confirmations",
        "OK; can do; no problem; understood",
        [
            "When quickly confirming plans or information",
            "In text messages and chat apps",
            "In casual conversation to acknowledge"
        ],
        [
            "Do not use 了解 in very casual settings with close friends — it can sound cold",
            "好 is the most versatile and natural confirmation"
        ],
        "Taiwan LINE messages often consist of single-word confirmations. 好 is the most common, followed by 好的 (hǎo de, slightly more formal) and 沒問題.",
        "Single-word confirmations are complete responses in message contexts.",
        "English: 'OK!' / 'Sounds good!' Chinese: 好！/ 沒問題！",
        "Korean messages: '알겠어!' / '좋아!' Chinese 好 corresponds to Korean '좋아/알겠어'.",
        get_sentence_ids_for_day(sentences, 82, 4)[:4],
        [
            {"text": "好，就這樣。", "pinyin": "Hǎo, jiù zhèyàng.", "translation_en": "OK, that's settled."},
            {"text": "沒問題，交給我。", "pinyin": "Méi wèntí, jiāo gěi wǒ.", "translation_en": "No problem, leave it to me."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D82_BUHAOYISI_MESSAGE",
        "不好意思 + message / 抱歉 + message",
        ["不好意思/抱歉", "message"],
        "Use 不好意思 (bù hǎo yìsi) or 抱歉 (bàoqiàn) at the start of a message to apologize or preface something. In messages, these are used for late replies, declining invitations, or delivering bad news gently.",
        "Apologetic Messages with 不好意思/抱歉",
        "sorry; excuse me (in messages)",
        [
            "When replying late to a message",
            "When declining an invitation via message",
            "When delivering disappointing news gently"
        ],
        [
            "不好意思 is softer than 抱歉 in messages",
            "抱歉 is more formal and carries more weight"
        ],
        "Taiwan messaging culture uses 不好意思 frequently. A late reply often starts with 不好意思，現在才回 (Sorry, just replying now). It's a social lubricant in digital communication.",
        "不好意思 + Message / 抱歉 + Message.",
        "English: 'Sorry for the late reply.' Chinese: 不好意思，現在才回。(Sorry, now just reply).",
        "Korean: '늦게 답장해서 죄송합니다.' Chinese 不好意思/抱歉 corresponds to Korean '죄송합니다/미안합니다'.",
        get_sentence_ids_for_day(sentences, 82, 4)[:4],
        [
            {"text": "不好意思，現在才回你。", "pinyin": "Bù hǎo yìsi, xiànzài cái huí nǐ.", "translation_en": "Sorry, just replying to you now."},
            {"text": "抱歉，明天不能去了。", "pinyin": "Bàoqiàn, míngtiān bù néng qù le.", "translation_en": "Sorry, I can't go tomorrow."},
        ]
    ))
    
    # ========== DAY 83: Decisions & Choices ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D83_BU_RAN",
        "Statement，不然 + alternative suggestion",
        ["statement", "不然", "alternative"],
        "Review and expansion of 不然 (bùrán). In decision contexts, 不然 is used to pivot to an alternative: 'How about this instead?' It's one of the most useful words for collaborative decision-making in Taiwan.",
        "How About Instead with 不然",
        "otherwise; how about instead",
        [
            "When brainstorming alternatives",
            "When the first plan doesn't work",
            "When making suggestions in a group"
        ],
        [
            "Do not use 不然 to completely dismiss someone's idea — it builds on the conversation",
            "不然 + suggestion is collaborative, not confrontational"
        ],
        "Taiwan group decision-making often uses 不然: 不然我們... (How about we...). It's a soft, collaborative way to suggest alternatives without rejecting anyone's idea outright.",
        "Statement，不然 + Alternative.",
        "English: 'That might be too expensive. How about we go somewhere else?' Chinese: 那個可能太貴了，不然我們去別的地方？",
        "Korean: '그거 너무 비쌀 수도 있어요. 그럼 다른 데로 갈까요?' Chinese 不然 corresponds to Korean '그럼/그렇지 않으면'.",
        get_sentence_ids_for_day(sentences, 83, 6),
        [
            {"text": "那家可能很多人，不然我們換一家？", "pinyin": "Nà jiā kěnéng hěn duō rén, bùrán wǒmen huàn yī jiā?", "translation_en": "That place might be crowded; how about we switch to a different one?"},
            {"text": "這個有點貴，不然買那個？", "pinyin": "Zhège yǒudiǎn guì, bùrán mǎi nà ge?", "translation_en": "This is a bit expensive; how about buying that one?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D83_YAOBU",
        "要不 + suggestion？/ 要不要 + verb？",
        ["要不/要不要", "suggestion"],
        "Use 要不 (yàobù) as a shortened form of 要不要, meaning 'how about...?' or 'shall we...?'. 要不 is more casual and common in Taiwan spoken Chinese. It's the go-to word for making spontaneous suggestions.",
        "How About with 要不",
        "how about...?; shall we...? (casual suggestion)",
        [
            "When making a casual suggestion",
            "When proposing an alternative on the spot",
            "In friendly, informal decision-making"
        ],
        [
            "Do not use 要不 in formal situations — use 要不要 or 要不要考慮",
            "要不 is very casual — perfect for friends and family"
        ],
        "Taiwan speakers use 要不 constantly: 要不我們去逛逛？(How about we go browse?), 要不換個時間？(How about we change the time?). It's the sound of spontaneous planning.",
        "要不 + Suggestion？",
        "English: 'How about we go eat?' Chinese: 要不我們去吃飯？(Want-not we go eat?).",
        "Korean: '우리 밥 먹으러 갈까?' Chinese 要不 corresponds to Korean '~을까?'.",
        get_sentence_ids_for_day(sentences, 83, 4)[:4],
        [
            {"text": "要不我們去吃飯？", "pinyin": "Yàobù wǒmen qù chī fàn?", "translation_en": "How about we go eat?"},
            {"text": "要不明天再說？", "pinyin": "Yàobù míngtiān zài shuō?", "translation_en": "How about we talk about it tomorrow?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D83_JIU_ZHE_YANG",
        "就這樣 + 吧 / 那就這樣 + 了",
        ["就這樣", "吧/了"],
        "Use 就這樣吧 (jiù zhèyàng ba) to conclude a discussion or decision, meaning 'let's go with that' or 'that's settled then'. 就這樣 means 'just like this' and 吧 softens it into a suggestion. This is how decisions get finalized in Taiwan.",
        "Let's Go With That with 就這樣吧",
        "let's go with that; that's settled; so be it",
        [
            "When finalizing a decision after discussion",
            "When wrapping up a planning conversation",
            "When accepting a situation and moving on"
        ],
        [
            "Do not use 就這樣吧 to dismiss someone — it should follow actual discussion",
            "The 吧 is important — without it, 就這樣 sounds abrupt"
        ],
        "Taiwan speakers use 就這樣吧 to wrap up discussions and move forward. It signals 'we've talked enough, let's decide.' 那就這樣了 is the version for past decisions.",
        "那就這樣 + 吧/了.",
        "English: 'Let's go with that, then.' Chinese: 那就這樣吧。(Then just this-way BA).",
        "Korean: '그럼 그렇게 하죠.' Chinese 就這樣吧 corresponds to Korean '그럼 그렇게 하죠/합시다'.",
        get_sentence_ids_for_day(sentences, 83, 4)[:4],
        [
            {"text": "好，那就這樣吧。", "pinyin": "Hǎo, nà jiù zhèyàng ba.", "translation_en": "OK, let's go with that then."},
            {"text": "我們就這樣決定了。", "pinyin": "Wǒmen jiù zhèyàng juédìng le.", "translation_en": "We've decided on this then."},
        ]
    ))
    
    # ========== DAY 84: Goals & Motivations ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D84_LAI_TAIWAN_DUOJIU",
        "Subject + 來台灣 + 多久了？/ Subject + 來 + place + duration + 了",
        ["subject", "來", "place", "多久", "了"],
        "Use 來 + place + 多久了 (lái...duō jiǔ le) to ask 'How long have you been in [place]?' 來 means 'come' and 多久了 asks about duration. This is one of the most common questions foreigners get in Taiwan.",
        "How Long Have You Been with 來...多久了",
        "How long have you been in...?; How long has it been since you came?",
        [
            "When asking how long someone has been somewhere",
            "When answering the common question about your time in Taiwan",
            "When talking about duration of stay"
        ],
        [
            "Do not confuse 多久 (how long) with 什麼時候 (when)",
            "多久 asks about duration, 什麼時候 asks about a point in time"
        ],
        "In Taiwan, 你來台灣多久了？is probably the #1 question foreigners hear. Having a natural answer ready is essential for daily conversation.",
        "Subject + 來 + Place + 多久了？",
        "English: 'How long have you been in Taiwan?' Chinese: 你來台灣多久了？(You come Taiwan how-long LE?).",
        "Korean: '대만에 온 지 얼마나 됐어요?' Chinese 來...多久了 corresponds to Korean '~에 온 지 얼마나 됐다'.",
        get_sentence_ids_for_day(sentences, 84, 6),
        [
            {"text": "你來台灣多久了？", "pinyin": "Nǐ lái Táiwān duō jiǔ le?", "translation_en": "How long have you been in Taiwan?"},
            {"text": "我來台灣三年了。", "pinyin": "Wǒ lái Táiwān sān nián le.", "translation_en": "I've been in Taiwan for three years."},
            {"text": "他來台北半年了。", "pinyin": "Tā lái Táiběi bàn nián le.", "translation_en": "He's been in Taipei for half a year."},
            {"text": "你來這裡多久了？", "pinyin": "Nǐ lái zhèlǐ duō jiǔ le?", "translation_en": "How long have you been here?"}
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D84_WEILE",
        "為了 + goal，+ action / Action + 是為了 + goal",
        ["為了", "goal", "action"],
        "Use 為了 (wèile) to express 'for the sake of' or 'in order to'. It introduces the purpose or goal of an action. This is the standard way to explain motivations and life goals in Taiwan Mandarin.",
        "For the Sake Of with 為了",
        "for; for the sake of; in order to",
        [
            "When explaining why you do something",
            "When talking about life goals and motivations",
            "When expressing purpose or intention formally"
        ],
        [
            "Do not confuse 為了 (for the sake of) with 因為 (because)",
            "為了 = purpose/goal, 因為 = cause/reason"
        ],
        "Taiwan speakers use 為了 to express meaningful motivations: 為了學中文，我來到台灣 (I came to Taiwan to learn Chinese). It adds weight and purpose to statements.",
        "為了 + Goal，+ Action / Action + 是為了 + Goal.",
        "English: 'I came to Taiwan to learn Chinese.' Chinese: 為了學中文，我來台灣。(For learn Chinese, I come Taiwan).",
        "Korean: '중국어를 배우기 위해 대만에 왔어요.' Chinese 為了 corresponds to Korean '~를 위해'.",
        get_sentence_ids_for_day(sentences, 84, 4)[:4],
        [
            {"text": "為了學中文，我來到台灣。", "pinyin": "Wèile xué Zhōngwén, wǒ lái dào Táiwān.", "translation_en": "I came to Taiwan to learn Chinese."},
            {"text": "為了家人，他決定換工作。", "pinyin": "Wèile jiārén, tā juédìng huàn gōngzuò.", "translation_en": "For the sake of his family, he decided to change jobs."},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D84_XUE_ZHONGWEN_GOAL",
        "Subject + 學 + language / Subject + 在學 + language / Subject + 想 + 學好 + language",
        ["subject", "學/在學/想學好", "language"],
        "Discussing Chinese learning goals is a universal topic for foreigners in Taiwan. 學中文 (xué Zhōngwén) means 'learn Chinese', 在學 means 'currently learning', and 想學好 means 'want to learn well'. These patterns are essential for daily conversation.",
        "Learning Chinese Goals",
        "learning Chinese; studying Chinese; wanting to master Chinese",
        [
            "When Taiwanese people ask about your Chinese learning",
            "When discussing your language goals",
            "When explaining your motivation for being in Taiwan"
        ],
        [
            "Do not say 我在學習中文 — 在學中文 is more natural",
            "學中文 is the standard phrase, 學習中文 is more formal"
        ],
        "Every foreigner in Taiwan gets asked about their Chinese learning journey. 你在學中文嗎？(Are you learning Chinese?) and 你的中文很好！(Your Chinese is great!) are daily occurrences.",
        "Subject + 在學 + Language / Subject + 想 + 學好 + Language.",
        "English: 'I'm learning Chinese.' Chinese: 我在學中文。(I ZAI learn Chinese).",
        "Korean: '중국어를 배우고 있어요.' Chinese 在學 corresponds to Korean '배우고 있다'.",
        get_sentence_ids_for_day(sentences, 84, 4)[:4],
        [
            {"text": "我在學中文。", "pinyin": "Wǒ zài xué Zhōngwén.", "translation_en": "I'm learning Chinese."},
            {"text": "我想學好中文。", "pinyin": "Wǒ xiǎng xué hǎo Zhōngwén.", "translation_en": "I want to learn Chinese well."},
        ]
    ))
    
    # ========== DAY 85: Topic Shifts ==========
    grammar_entries.append(make_grammar_entry(
        "GR_D85_TOPIC_SHIFT",
        "對了，+ new topic / 說到了 + topic，+ comment",
        ["對了/說到了", "new topic"],
        "Use 對了 (duì le) to smoothly shift to a new topic, meaning 'by the way' or 'oh, I just remembered'. This is the most natural conversation transition in Taiwan Mandarin. It signals that something just occurred to you.",
        "By the Way with 對了",
        "by the way; oh, I just remembered; speaking of which",
        [
            "When you want to introduce a new topic naturally",
            "When something reminds you of something else",
            "When making a smooth conversation transition"
        ],
        [
            "Do not overuse 對了 — it should introduce genuinely new or remembered topics",
            "對了 is casual — in formal settings, use 另外 (lìngwài, 'additionally')"
        ],
        "Taiwan speakers use 對了 constantly as a conversation pivot. It's the verbal equivalent of 'oh, by the way...'. Using it naturally makes conversations flow much better.",
        "對了，+ New Topic.",
        "English: 'By the way, have you eaten yet?' Chinese: 對了，你吃飯了嗎？(Right LE, you eat rice LE MA?).",
        "Korean: '아 맞다, 밥 먹었어요?' Chinese 對了 corresponds to Korean '아 맞다/그런데'.",
        get_sentence_ids_for_day(sentences, 85, 6),
        [
            {"text": "對了，你明天有空嗎？", "pinyin": "Duì le, nǐ míngtiān yǒu kòng ma?", "translation_en": "By the way, are you free tomorrow?"},
            {"text": "對了，我差點忘了跟你說。", "pinyin": "Duì le, wǒ chàdiǎn wàng le gēn nǐ shuō.", "translation_en": "Oh, I almost forgot to tell you."},
            {"text": "對了，你知道那家新開的餐廳嗎？", "pinyin": "Duì le, nǐ zhīdào nà jiā xīn kāi de cāntīng ma?", "translation_en": "By the way, do you know about that newly opened restaurant?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D85_NI_NE",
        "Statement about self，你呢？",
        ["statement about self", "你呢"],
        "Use 你呢 (nǐ ne) to bounce a question back to the other person, meaning 'and you?' or 'what about you?'. This is the single most useful two-character phrase for keeping conversations going in Chinese.",
        "And You with 你呢",
        "And you?; What about you?; How about you?",
        [
            "When returning a question to keep the conversation balanced",
            "When you've answered and want to hear the other person's response",
            "In almost every getting-to-know-you conversation"
        ],
        [
            "Do not use 你呢 after every single statement — alternate with other follow-up questions",
            "你呢 is casual and friendly — use 您呢 (nín ne) for formal situations"
        ],
        "Taiwan conversations are a constant ping-pong of 你呢. It's how people show mutual interest. Mastering 你呢 is essential for natural back-and-forth conversation.",
        "Statement about self，你呢？",
        "English: 'I'm from Korea. And you?' Chinese: 我是韓國人，你呢？(I am Korean person, you NE?).",
        "Korean: '저는 한국 사람이에요. ____ 씨는요?' Chinese 你呢 corresponds to Korean '~씨는요?'.",
        get_sentence_ids_for_day(sentences, 85, 4)[:4],
        [
            {"text": "我喜歡看電影，你呢？", "pinyin": "Wǒ xǐhuān kàn diànyǐng, nǐ ne?", "translation_en": "I like watching movies. And you?"},
            {"text": "我吃飽了，你呢？", "pinyin": "Wǒ chī bǎo le, nǐ ne?", "translation_en": "I'm full. And you?"},
        ]
    ))
    
    grammar_entries.append(make_grammar_entry(
        "GR_D85_SHUNBIAN_WEN",
        "順便問一下 + question / 順便 + verb",
        ["順便", "question/verb"],
        "Use 順便 (shùnbiàn) to mean 'while we're at it' or 'incidentally'. 順便問一下 (shùnbiàn wèn yīxià) means 'while I'm asking' or 'just a quick question while we're on the topic'. This is a natural way to add a related question.",
        "While We're At It with 順便",
        "while we're at it; incidentally; conveniently",
        [
            "When adding a related question to the current topic",
            "When doing something convenient while already there",
            "When transitioning to a related subtopic"
        ],
        [
            "Do not use 順便 for completely unrelated topic changes",
            "順便 implies the new topic is connected to what you were just discussing"
        ],
        "Taiwan speakers use 順便 frequently in daily life: 順便幫我買 (While you're there, buy it for me), 順便問一下 (Just a quick question while we're on the topic). It's efficient and natural.",
        "順便 + Verb / 順便問一下 + Question.",
        "English: 'While I'm here, let me ask...' Chinese: 順便問一下...(Conveniently ask YIXIA...).",
        "Korean: '가는 김에 물어볼게요.' Chinese 順便 corresponds to Korean '~는 김에'.",
        get_sentence_ids_for_day(sentences, 85, 4)[:4],
        [
            {"text": "順便問一下，你知道捷運站怎麼走嗎？", "pinyin": "Shùnbiàn wèn yīxià, nǐ zhīdào jiéyùn zhàn zěnme zǒu ma?", "translation_en": "While I'm asking, do you know how to get to the MRT station?"},
            {"text": "你去超市的話，順便幫我買一瓶牛奶。", "pinyin": "Nǐ qù chāoshì dehuà, shùnbiàn bāng wǒ mǎi yī píng niúnǎi.", "translation_en": "If you're going to the supermarket, pick up a bottle of milk for me while you're there."},
        ]
    ))
    
    # ========== DAYS 86-90: Integration Reviews ==========
    grammar_entries.append(make_review_entry("GR_D86_INTEGRATION_REVIEW", "Integration Review I (Days 71-85)", "71-85",
        get_sentence_ids_for_day(sentences, 86, 6)))
    
    grammar_entries.append(make_review_entry("GR_D87_INTEGRATION_REVIEW", "Integration Review II (Days 46-85)", "46-85",
        get_sentence_ids_for_day(sentences, 87, 6)))
    
    grammar_entries.append(make_review_entry("GR_D88_INTEGRATION_REVIEW", "Integration Review III (Full Course)", "1-88",
        get_sentence_ids_for_day(sentences, 88, 6)))
    
    grammar_entries.append(make_review_entry("GR_D89_MOCK_REVIEW", "Mock Assessment Prep", "46-88",
        get_sentence_ids_for_day(sentences, 89, 6)))
    
    grammar_entries.append(make_review_entry("GR_D90_FINAL_REVIEW", "Final Review & Celebration", "1-90",
        get_sentence_ids_for_day(sentences, 90, 6)))
    
    # ========== WRITE OUTPUT ==========
    output_path = r'c:\Users\riper\Downloads\Learning Mandarin\mandarin_course\data\grammar_days46_90.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(grammar_entries, f, ensure_ascii=False, indent=2)
    
    print(f"SUCCESS: Wrote {len(grammar_entries)} grammar entries to {output_path}")
    print(f"Grammar entries breakdown:")
    real_count = sum(1 for g in grammar_entries if not g['id'].endswith('_REVIEW'))
    review_count = sum(1 for g in grammar_entries if g['id'].endswith('_REVIEW'))
    print(f"  Real grammar entries: {real_count}")
    print(f"  Review entries: {review_count}")
    
    # Print all entry IDs for verification
    print("\nAll grammar IDs:")
    for i, g in enumerate(grammar_entries):
        print(f"  {i+1}. {g['id']}: {g['pattern'][:80]}")

if __name__ == "__main__":
    main()
