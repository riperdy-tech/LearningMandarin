import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const frameworkDays = readJson("mandarin_course_day31_90_framework/curriculum/day_31_90_framework.json").days;
const framework = frameworkDays.filter((day) => day.day >= 31 && day.day <= 45);
const lockedLessons = frameworkDays
  .filter((day) => day.day >= 46 && day.day <= 90)
  .map((day) => ({
    id: `LOCKED_D${day.day}`,
    week: Math.ceil(day.day / 7),
    order: day.day,
    title: day.unit,
    phase_id: phaseIdForDay(day.day),
    scenario: day.scenario,
    communication_functions: day.target_functions,
    status: "locked",
    unlock_note: "Framework ready. Full lesson data will be generated in a later rollout phase."
  }));
const existingVocab = readJson("mandarin_course/data/vocab_month1.json");
const existingSentences = readJson("mandarin_course/data/sentences_month1.json");
const existingGrammar = readJson("mandarin_course/data/grammar_month1.json");
const existingAudio = readJson("mandarin_course/audio/manifest_month1.json");

const priorByChar = new Map(existingVocab.map((item) => [item.char, item]));
const priorCommon = ["我", "你", "他", "她", "我們", "是", "有", "在", "去", "要", "想", "可以", "嗎", "不", "很"]
  .map((char) => priorByChar.get(char))
  .filter(Boolean);

const DAILY_WORDS = {
  31: [
    "請|qǐng|qing3|verb|please; to request|부탁하다; 제발|requests",
    "可以|kěyǐ|ke3 yi3|modal verb|may; can|~해도 된다|requests",
    "想要|xiǎng yào|xiang3 yao4|verb phrase|would like; want|원하다|requests",
    "不用|búyòng|bu2 yong4|phrase|no need|필요 없다|requests",
    "謝謝|xièxie|xie4 xie0|phrase|thank you|감사합니다|requests",
    "幫我|bāng wǒ|bang1 wo3|verb phrase|help me|저를 도와주다|requests",
    "拿|ná|na2|verb|to take; bring|가져오다|requests",
    "給我|gěi wǒ|gei3 wo3|verb phrase|give me|저에게 주다|requests",
    "一下|yíxià|yi2 xia4|softener|a little; briefly|잠깐|requests",
    "杯|bēi|bei1|measure word|cup|컵|cafe",
    "小杯|xiǎo bēi|xiao3 bei1|noun|small cup|작은 컵|cafe",
    "中杯|zhōng bēi|zhong1 bei1|noun|medium cup|중간 컵|cafe",
    "大杯|dà bēi|da4 bei1|noun|large cup|큰 컵|cafe",
    "咖啡|kāfēi|ka1 fei1|noun|coffee|커피|cafe",
    "拿鐵|nátiě|na2 tie3|noun|latte|라테|cafe",
    "豆漿|dòujiāng|dou4 jiang1|noun|soy milk|두유|cafe",
    "紅茶|hóngchá|hong2 cha2|noun|black tea|홍차|cafe",
    "綠茶|lǜchá|lü4 cha2|noun|green tea|녹차|cafe",
    "熱|rè|re4|adjective|hot|뜨거운|cafe",
    "冰|bīng|bing1|adjective|iced|얼음; 아이스|cafe",
    "少冰|shǎo bīng|shao3 bing1|phrase|less ice|얼음 적게|cafe",
    "去冰|qù bīng|qu4 bing1|phrase|no ice|얼음 없이|cafe",
    "外帶|wàidài|wai4 dai4|verb|take out|포장하다|cafe",
    "內用|nèiyòng|nei4 yong4|verb|eat in|매장에서 먹다|cafe",
    "袋子|dàizi|dai4 zi0|noun|bag|봉투|shop",
    "發票|fāpiào|fa1 piao4|noun|receipt; invoice|영수증|shop",
    "價錢|jiàqián|jia4 qian2|noun|price|가격|shop",
    "多少|duōshǎo|duo1 shao3|question word|how much; how many|얼마|shop",
    "麻煩|máfan|ma2 fan0|verb|to trouble; please|수고스럽게 하다|requests",
    "不好意思|bùhǎoyìsi|bu4 hao3 yi4 si0|phrase|excuse me; sorry|죄송합니다|requests",
    "店員|diànyuán|dian4 yuan2|noun|shop clerk|점원|shop",
    "客人|kèrén|ke4 ren2|noun|customer|손님|shop",
    "菜單|càidān|cai4 dan1|noun|menu|메뉴|cafe",
    "吸管|xīguǎn|xi1 guan3|noun|straw|빨대|cafe",
    "湯匙|tāngchí|tang1 chi2|noun|spoon|숟가락|cafe",
    "叉子|chāzi|cha1 zi0|noun|fork|포크|cafe",
    "衛生紙|wèishēngzhǐ|wei4 sheng1 zhi3|noun|tissue|휴지|cafe"
  ],
  32: [
    "便利商店|biànlì shāngdiàn|bian4 li4 shang1 dian4|noun|convenience store|편의점|store",
    "超商|chāoshāng|chao1 shang1|noun|convenience store|편의점|store",
    "結帳|jiézhàng|jie2 zhang4|verb|to check out|계산하다|store",
    "付款|fùkuǎn|fu4 kuan3|verb|to pay|지불하다|store",
    "現金|xiànjīn|xian4 jin1|noun|cash|현금|payment",
    "信用卡|xìnyòngkǎ|xin4 yong4 ka3|noun|credit card|신용카드|payment",
    "悠遊卡|Yōuyóu Kǎ|you1 you2 ka3|noun|EasyCard|이지카드|payment",
    "電子支付|diànzǐ zhīfù|dian4 zi3 zhi1 fu4|noun|mobile payment|전자결제|payment",
    "刷卡|shuākǎ|shua1 ka3|verb|to swipe card|카드 결제하다|payment",
    "收據|shōujù|shou1 ju4|noun|receipt|영수증|store",
    "載具|zàijù|zai4 ju4|noun|invoice carrier|전자영수증 번호|store",
    "會員|huìyuán|hui4 yuan2|noun|member|회원|store",
    "點數|diǎnshù|dian3 shu4|noun|points|포인트|store",
    "塑膠袋|sùjiāo dài|su4 jiao1 dai4|noun|plastic bag|비닐봉투|store",
    "環保袋|huánbǎo dài|huan2 bao3 dai4|noun|reusable bag|장바구니|store",
    "需要|xūyào|xu1 yao4|verb|to need|필요하다|store",
    "不用|búyòng|bu2 yong4|phrase|no need|필요 없다|store",
    "加熱|jiārè|jia1 re4|verb|to heat up|데우다|store",
    "微波|wéibō|wei2 bo1|verb|to microwave|전자레인지로 데우다|store",
    "便當|biàndāng|bian4 dang1|noun|lunch box|도시락|food",
    "飯糰|fàntuán|fan4 tuan2|noun|rice ball|주먹밥|food",
    "三明治|sānmíngzhì|san1 ming2 zhi4|noun|sandwich|샌드위치|food",
    "茶葉蛋|cháyèdàn|cha2 ye4 dan4|noun|tea egg|차계란|food",
    "礦泉水|kuàngquánshuǐ|kuang4 quan2 shui3|noun|mineral water|생수|food",
    "牛奶|niúnǎi|niu2 nai3|noun|milk|우유|food",
    "優格|yōugé|you1 ge2|noun|yogurt|요거트|food",
    "餅乾|bǐnggān|bing3 gan1|noun|crackers; cookies|과자|food",
    "泡麵|pàomiàn|pao4 mian4|noun|instant noodles|라면|food",
    "雨傘|yǔsǎn|yu3 san3|noun|umbrella|우산|store",
    "口罩|kǒuzhào|kou3 zhao4|noun|mask|마스크|store",
    "電池|diànchí|dian4 chi2|noun|battery|건전지|store",
    "充電線|chōngdiànxiàn|chong1 dian4 xian4|noun|charging cable|충전선|store",
    "買一送一|mǎi yī sòng yī|mai3 yi1 song4 yi1|phrase|buy one get one free|하나 사면 하나 증정|store",
    "特價|tèjià|te4 jia4|noun|special price|특가|store",
    "總共|zǒnggòng|zong3 gong4|adverb|in total|총|store"
  ],
  33: [
    "洗手間|xǐshǒujiān|xi3 shou3 jian1|noun|restroom|화장실|building",
    "廁所|cèsuǒ|ce4 suo3|noun|toilet|화장실|building",
    "電梯|diàntī|dian4 ti1|noun|elevator|엘리베이터|building",
    "樓梯|lóutī|lou2 ti1|noun|stairs|계단|building",
    "出口|chūkǒu|chu1 kou3|noun|exit|출구|building",
    "入口|rùkǒu|ru4 kou3|noun|entrance|입구|building",
    "櫃台|guìtái|gui4 tai2|noun|counter|카운터|building",
    "教室|jiàoshì|jiao4 shi4|noun|classroom|교실|building",
    "辦公室|bàngōngshì|ban4 gong1 shi4|noun|office|사무실|building",
    "一樓|yī lóu|yi1 lou2|noun|first floor|1층|building",
    "二樓|èr lóu|er4 lou2|noun|second floor|2층|building",
    "三樓|sān lóu|san1 lou2|noun|third floor|3층|building",
    "地下室|dìxiàshì|di4 xia4 shi4|noun|basement|지하실|building",
    "前面|qiánmiàn|qian2 mian4|location|front|앞쪽|direction",
    "後面|hòumiàn|hou4 mian4|location|back|뒤쪽|direction",
    "左邊|zuǒbiān|zuo3 bian1|location|left side|왼쪽|direction",
    "右邊|yòubiān|you4 bian1|location|right side|오른쪽|direction",
    "旁邊|pángbiān|pang2 bian1|location|beside|옆|direction",
    "裡面|lǐmiàn|li3 mian4|location|inside|안쪽|direction",
    "外面|wàimiàn|wai4 mian4|location|outside|밖|direction",
    "直走|zhí zǒu|zhi2 zou3|verb phrase|go straight|직진하다|direction",
    "轉彎|zhuǎnwān|zhuan3 wan1|verb|to turn|돌다|direction",
    "左轉|zuǒ zhuǎn|zuo3 zhuan3|verb|turn left|좌회전하다|direction",
    "右轉|yòu zhuǎn|you4 zhuan3|verb|turn right|우회전하다|direction",
    "上去|shàng qù|shang4 qu4|verb|go up|올라가다|direction",
    "下去|xià qù|xia4 qu4|verb|go down|내려가다|direction",
    "從|cóng|cong2|preposition|from|~부터|direction",
    "到|dào|dao4|preposition|to; arrive|~까지; 도착하다|direction",
    "這裡|zhèlǐ|zhe4 li3|place|here|여기|direction",
    "那裡|nàlǐ|na4 li3|place|there|거기|direction",
    "附近|fùjìn|fu4 jin4|noun|nearby|근처|direction",
    "哪裡|nǎlǐ|na3 li3|question word|where|어디|direction",
    "請問|qǐngwèn|qing3 wen4|phrase|excuse me; may I ask|실례지만|requests",
    "走錯|zǒu cuò|zou3 cuo4|verb phrase|go the wrong way|길을 잘못 가다|direction",
    "樓層|lóucéng|lou2 ceng2|noun|floor level|층|building"
  ]
};

const FALLBACK_BY_TOPIC = {
  cafe: [
    "珍珠奶茶|zhēnzhū nǎichá|zhen1 zhu1 nai3 cha2|noun|bubble milk tea|버블티|food",
    "滷肉飯|lǔròufàn|lu3 rou4 fan4|noun|braised pork rice|루러우판|food",
    "牛肉麵|niúròu miàn|niu2 rou4 mian4|noun|beef noodle soup|우육면|food",
    "水餃|shuǐjiǎo|shui3 jiao3|noun|dumplings|물만두|food",
    "小菜|xiǎocài|xiao3 cai4|noun|side dish|반찬|food",
    "辣|là|la4|adjective|spicy|맵다|food",
    "不辣|bú là|bu2 la4|phrase|not spicy|맵지 않다|food",
    "推薦|tuījiàn|tui1 jian4|verb|to recommend|추천하다|food",
    "招牌|zhāopái|zhao1 pai2|noun|signature item|대표 메뉴|food",
    "湯|tāng|tang1|noun|soup|국물|food"
  ],
  daily: [
    "每天|měitiān|mei3 tian1|time|every day|매일|routine",
    "早上|zǎoshang|zao3 shang0|time|morning|아침|routine",
    "中午|zhōngwǔ|zhong1 wu3|time|noon|정오|routine",
    "晚上|wǎnshang|wan3 shang0|time|evening|저녁|routine",
    "起床|qǐchuáng|qi3 chuang2|verb|to get up|일어나다|routine",
    "睡覺|shuìjiào|shui4 jiao4|verb|to sleep|자다|routine",
    "上班|shàngbān|shang4 ban1|verb|go to work|출근하다|routine",
    "下班|xiàbān|xia4 ban1|verb|get off work|퇴근하다|routine",
    "上課|shàngkè|shang4 ke4|verb|attend class|수업하다|routine",
    "下課|xiàkè|xia4 ke4|verb|finish class|수업이 끝나다|routine"
  ],
  social: [
    "見面|jiànmiàn|jian4 mian4|verb|to meet|만나다|social",
    "約|yuē|yue1|verb|to make plans|약속하다|social",
    "有空|yǒu kòng|you3 kong4|phrase|have free time|시간이 있다|social",
    "沒空|méi kòng|mei2 kong4|phrase|not free|시간이 없다|social",
    "改天|gǎitiān|gai3 tian1|time|another day|다른 날|social",
    "週末|zhōumò|zhou1 mo4|time|weekend|주말|social",
    "下午|xiàwǔ|xia4 wu3|time|afternoon|오후|social",
    "一起|yìqǐ|yi4 qi3|adverb|together|함께|social",
    "方便|fāngbiàn|fang1 bian4|adjective|convenient|편리하다|social",
    "不方便|bù fāngbiàn|bu4 fang1 bian4|phrase|not convenient|불편하다|social"
  ],
  transport: [
    "捷運|jiéyùn|jie2 yun4|noun|MRT|지하철|transport",
    "公車|gōngchē|gong1 che1|noun|bus|버스|transport",
    "計程車|jìchéngchē|ji4 cheng2 che1|noun|taxi|택시|transport",
    "車站|chēzhàn|che1 zhan4|noun|station|역|transport",
    "月台|yuètái|yue4 tai2|noun|platform|승강장|transport",
    "轉車|zhuǎn chē|zhuan3 che1|verb|transfer|환승하다|transport",
    "下車|xià chē|xia4 che1|verb|get off|내리다|transport",
    "上車|shàng chē|shang4 che1|verb|get on|타다|transport",
    "方向|fāngxiàng|fang1 xiang4|noun|direction|방향|transport",
    "塞車|sāichē|sai1 che1|verb|traffic jam|차가 막히다|transport"
  ],
  reason: [
    "因為|yīnwèi|yin1 wei4|conjunction|because|왜냐하면|reason",
    "所以|suǒyǐ|suo3 yi3|conjunction|so|그래서|reason",
    "為什麼|wèishéme|wei4 shen2 me0|question word|why|왜|reason",
    "理由|lǐyóu|li3 you2|noun|reason|이유|reason",
    "太貴|tài guì|tai4 gui4|phrase|too expensive|너무 비싸다|reason",
    "太遠|tài yuǎn|tai4 yuan3|phrase|too far|너무 멀다|reason",
    "太晚|tài wǎn|tai4 wan3|phrase|too late|너무 늦다|reason",
    "有點|yǒudiǎn|you3 dian3|adverb|a little|조금|reason",
    "累|lèi|lei4|adjective|tired|피곤하다|reason",
    "忙|máng|mang2|adjective|busy|바쁘다|reason"
  ],
  clothes: [
    "衣服|yīfú|yi1 fu2|noun|clothes|옷|clothes",
    "褲子|kùzi|ku4 zi0|noun|pants|바지|clothes",
    "鞋子|xiézi|xie2 zi0|noun|shoes|신발|clothes",
    "尺寸|chǐcùn|chi3 cun4|noun|size|사이즈|clothes",
    "顏色|yánsè|yan2 se4|noun|color|색깔|clothes",
    "試穿|shìchuān|shi4 chuan1|verb|try on|입어 보다|clothes",
    "適合|shìhé|shi4 he2|verb|to fit; suit|어울리다|clothes",
    "便宜|piányí|pian2 yi2|adjective|cheap|싸다|clothes",
    "貴|guì|gui4|adjective|expensive|비싸다|clothes",
    "打折|dǎzhé|da3 zhe2|verb|discount|할인하다|clothes"
  ],
  weather: [
    "天氣|tiānqì|tian1 qi4|noun|weather|날씨|weather",
    "下雨|xià yǔ|xia4 yu3|verb|rain|비가 오다|weather",
    "太陽|tàiyáng|tai4 yang2|noun|sun|태양|weather",
    "熱鬧|rènào|re4 nao4|adjective|lively|활기차다|mood",
    "冷|lěng|leng3|adjective|cold|춥다|weather",
    "熱天|rè tiān|re4 tian1|noun|hot day|더운 날|weather",
    "心情|xīnqíng|xin1 qing2|noun|mood|기분|mood",
    "開心|kāixīn|kai1 xin1|adjective|happy|기쁘다|mood",
    "緊張|jǐnzhāng|jin3 zhang1|adjective|nervous|긴장하다|mood",
    "舒服|shūfú|shu1 fu2|adjective|comfortable|편하다|mood"
  ]
};

const TOPIC_SEQUENCE = {
  34: ["cafe", "reason"],
  35: ["cafe", "reason"],
  36: ["daily", "social"],
  37: ["social", "daily"],
  38: ["transport", "direction"],
  39: ["transport", "reason"],
  40: ["cafe"],
  41: ["reason", "daily"],
  42: ["cafe", "social"],
  43: ["clothes", "reason"],
  44: ["weather", "social"],
  45: []
};

const EXTRA_STEMS = [
  "今天|jīntiān|jin1 tian1|time|today|오늘|time",
  "明天|míngtiān|ming2 tian1|time|tomorrow|내일|time",
  "昨天|zuótiān|zuo2 tian1|time|yesterday|어제|time",
  "現在|xiànzài|xian4 zai4|time|now|지금|time",
  "等一下|děng yíxià|deng3 yi2 xia4|phrase|wait a moment|잠깐 기다리다|requests",
  "再說一次|zài shuō yí cì|zai4 shuo1 yi2 ci4|phrase|say it again|다시 말하다|repair",
  "慢一點|màn yìdiǎn|man4 yi4 dian3|phrase|a little slower|조금 천천히|repair",
  "沒問題|méi wèntí|mei2 wen4 ti2|phrase|no problem|문제없다|repair",
  "真的|zhēnde|zhen1 de0|adverb|really|정말|conversation",
  "可能|kěnéng|ke3 neng2|adverb|maybe; possible|아마도|conversation"
];

const DAY_EXTRA_WORDS = {
  31: [
    "半糖|bàn táng|ban4 tang2|phrase|half sugar|당도 반|cafe",
    "微糖|wēi táng|wei1 tang2|phrase|light sugar|당도 적게|cafe",
    "正常甜|zhèngcháng tián|zheng4 chang2 tian2|phrase|regular sweetness|일반 당도|cafe",
    "加珍珠|jiā zhēnzhū|jia1 zhen1 zhu1|verb phrase|add tapioca pearls|펄 추가하다|cafe",
    "等候|děnghòu|deng3 hou4|verb|to wait|기다리다|requests"
  ],
  32: [
    "條碼|tiáomǎ|tiao2 ma3|noun|barcode|바코드|store",
    "掃描|sǎomiáo|sao3 miao2|verb|to scan|스캔하다|store",
    "明細|míngxì|ming2 xi4|noun|itemized details|명세|store",
    "找零|zhǎolíng|zhao3 ling2|verb|to give change|거스름돈을 주다|payment",
    "零錢|língqián|ling2 qian2|noun|small change|잔돈|payment",
    "櫃員|guìyuán|gui4 yuan2|noun|cashier|계산원|store"
  ],
  33: [
    "服務台|fúwùtái|fu2 wu4 tai2|noun|service desk|안내 데스크|building",
    "手扶梯|shǒufútī|shou3 fu2 ti1|noun|escalator|에스컬레이터|building",
    "走廊|zǒuláng|zou3 lang2|noun|hallway|복도|building",
    "門口|ménkǒu|men2 kou3|noun|doorway|문 앞|building",
    "對面|duìmiàn|dui4 mian4|location|opposite side|맞은편|direction",
    "中間|zhōngjiān|zhong1 jian1|location|middle|가운데|direction",
    "靠近|kàojìn|kao4 jin4|verb|to be near|가깝다|direction",
    "告示牌|gàoshìpái|gao4 shi4 pai2|noun|sign board|안내 표지판|building"
  ],
  34: [
    "餐廳|cāntīng|can1 ting1|noun|restaurant|식당|restaurant",
    "小吃店|xiǎochīdiàn|xiao3 chi1 dian4|noun|snack shop|분식집|restaurant",
    "夜市|yèshì|ye4 shi4|noun|night market|야시장|restaurant",
    "座位|zuòwèi|zuo4 wei4|noun|seat|자리|restaurant",
    "點餐|diǎn cān|dian3 can1|verb|to order food|주문하다|restaurant",
    "招呼|zhāohū|zhao1 hu1|verb|to greet; serve|응대하다|restaurant",
    "主餐|zhǔcān|zhu3 can1|noun|main dish|주요리|restaurant",
    "配菜|pèicài|pei4 cai4|noun|side dish|반찬|restaurant",
    "飲料|yǐnliào|yin3 liao4|noun|drink|음료|restaurant",
    "冰水|bīng shuǐ|bing1 shui3|noun|ice water|얼음물|restaurant",
    "熱湯|rè tāng|re4 tang1|noun|hot soup|뜨거운 국물|restaurant",
    "醬油|jiàngyóu|jiang4 you2|noun|soy sauce|간장|restaurant",
    "筷子|kuàizi|kuai4 zi0|noun|chopsticks|젓가락|restaurant",
    "碗|wǎn|wan3|noun|bowl|그릇|restaurant",
    "盤子|pánzi|pan2 zi0|noun|plate|접시|restaurant",
    "份|fèn|fen4|measure word|portion|인분|restaurant",
    "一份|yí fèn|yi2 fen4|phrase|one portion|1인분|restaurant",
    "兩份|liǎng fèn|liang3 fen4|phrase|two portions|2인분|restaurant",
    "先|xiān|xian1|adverb|first|먼저|sequence",
    "後來|hòulái|hou4 lai2|time|later|나중에|sequence",
    "還要|hái yào|hai2 yao4|verb phrase|also want|또 원하다|restaurant",
    "不用了|búyòng le|bu2 yong4 le0|phrase|no more needed|더 필요 없다|restaurant",
    "外送|wàisòng|wai4 song4|verb|delivery|배달|restaurant",
    "排隊|páidùi|pai2 dui4|verb|to line up|줄 서다|restaurant"
  ],
  35: [
    "不要辣|bú yào là|bu2 yao4 la4|phrase|not spicy, please|맵지 않게 해 주세요|restaurant",
    "少鹽|shǎo yán|shao3 yan2|phrase|less salt|소금 적게|restaurant",
    "少油|shǎo yóu|shao3 you2|phrase|less oil|기름 적게|restaurant",
    "加飯|jiā fàn|jia1 fan4|verb phrase|add rice|밥 추가하다|restaurant",
    "加麵|jiā miàn|jia1 mian4|verb phrase|add noodles|면 추가하다|restaurant",
    "加蛋|jiā dàn|jia1 dan4|verb phrase|add egg|계란 추가하다|restaurant",
    "換成|huàn chéng|huan4 cheng2|verb phrase|change into|~로 바꾸다|restaurant",
    "換一份|huàn yí fèn|huan4 yi2 fen4|verb phrase|change one portion|한 인분 바꾸다|restaurant",
    "拿錯|ná cuò|na2 cuo4|verb phrase|take the wrong item|잘못 가져오다|restaurant",
    "點錯|diǎn cuò|dian3 cuo4|verb phrase|order incorrectly|잘못 주문하다|restaurant",
    "送錯|sòng cuò|song4 cuo4|verb phrase|bring the wrong item|잘못 가져다주다|restaurant",
    "少了|shǎo le|shao3 le0|phrase|is missing|부족하다|restaurant",
    "多了|duō le|duo1 le0|phrase|is extra|많아졌다|restaurant",
    "退掉|tuì diào|tui4 diao4|verb|to cancel; remove|취소하다|restaurant",
    "重做|chóng zuò|chong2 zuo4|verb|to remake|다시 만들다|restaurant",
    "等太久|děng tài jiǔ|deng3 tai4 jiu3|phrase|wait too long|너무 오래 기다리다|restaurant",
    "不好吃|bù hǎochī|bu4 hao3 chi1|adjective phrase|not tasty|맛없다|restaurant",
    "太鹹|tài xián|tai4 xian2|adjective phrase|too salty|너무 짜다|restaurant",
    "太甜|tài tián|tai4 tian2|adjective phrase|too sweet|너무 달다|restaurant",
    "太油|tài yóu|tai4 you2|adjective phrase|too oily|너무 기름지다|restaurant",
    "剛剛|gānggāng|gang1 gang1|time|just now|방금|sequence",
    "原本|yuánběn|yuan2 ben3|adverb|originally|원래|restaurant",
    "可是|kěshì|ke3 shi4|conjunction|but|하지만|contrast",
    "應該|yīnggāi|ying1 gai1|modal verb|should|~해야 한다|restaurant",
    "沒有關係|méi yǒu guānxì|mei2 you3 guan1 xi4|phrase|it is okay|괜찮다|repair",
    "再等一下|zài děng yíxià|zai4 deng3 yi2 xia4|phrase|wait a bit more|조금 더 기다리다|restaurant",
    "確認|quèrèn|que4 ren4|verb|to confirm|확인하다|restaurant",
    "訂單|dìngdān|ding4 dan1|noun|order|주문서|restaurant",
    "號碼牌|hàomǎpái|hao4 ma3 pai2|noun|number tag|번호표|restaurant",
    "桌號|zhuōhào|zhuo1 hao4|noun|table number|테이블 번호|restaurant",
    "醬料|jiàngliào|jiang4 liao4|noun|sauce|소스|restaurant",
    "打包|dǎbāo|da3 bao1|verb|pack to go|포장하다|restaurant",
    "盒子|hézi|he2 zi0|noun|box|상자|restaurant",
    "湯包|tāngbāo|tang1 bao1|noun|soup dumpling|샤오룽바오|food",
    "炒飯|chǎofàn|chao3 fan4|noun|fried rice|볶음밥|food",
    "炒麵|chǎomiàn|chao3 mian4|noun|fried noodles|볶음면|food",
    "青菜|qīngcài|qing1 cai4|noun|greens|야채|food",
    "滷味|lǔwèi|lu3 wei4|noun|braised snacks|루웨이|food",
    "豆腐|dòufu|dou4 fu3|noun|tofu|두부|food",
    "雞排|jīpái|ji1 pai2|noun|fried chicken cutlet|지파이|food",
    "地瓜球|dìguā qiú|di4 gua1 qiu2|noun|sweet potato balls|고구마볼|food"
  ],
  36: [
    "刷牙|shuāyá|shua1 ya2|verb|brush teeth|양치하다|routine",
    "洗臉|xǐ liǎn|xi3 lian3|verb|wash face|세수하다|routine",
    "洗澡|xǐzǎo|xi3 zao3|verb|take a shower|샤워하다|routine",
    "穿衣服|chuān yīfú|chuan1 yi1 fu2|verb phrase|put on clothes|옷을 입다|routine",
    "吃早餐|chī zǎocān|chi1 zao3 can1|verb phrase|eat breakfast|아침을 먹다|routine",
    "吃午餐|chī wǔcān|chi1 wu3 can1|verb phrase|eat lunch|점심을 먹다|routine",
    "吃晚餐|chī wǎncān|chi1 wan3 can1|verb phrase|eat dinner|저녁을 먹다|routine",
    "通勤|tōngqín|tong1 qin2|verb|commute|통근하다|routine",
    "工作|gōngzuò|gong1 zuo4|verb|work|일하다|routine",
    "休息|xiūxí|xiu1 xi2|verb|rest|쉬다|routine",
    "運動|yùndòng|yun4 dong4|verb|exercise|운동하다|routine",
    "散步|sànbù|san4 bu4|verb|take a walk|산책하다|routine",
    "回家|huí jiā|hui2 jia1|verb phrase|go home|집에 가다|routine",
    "看電視|kàn diànshì|kan4 dian4 shi4|verb phrase|watch TV|TV를 보다|routine",
    "聽音樂|tīng yīnyuè|ting1 yin1 yue4|verb phrase|listen to music|음악을 듣다|routine",
    "看書|kàn shū|kan4 shu1|verb phrase|read a book|책을 읽다|routine",
    "做功課|zuò gōngkè|zuo4 gong1 ke4|verb phrase|do homework|숙제하다|routine",
    "準備|zhǔnbèi|zhun3 bei4|verb|prepare|준비하다|routine",
    "開始|kāishǐ|kai1 shi3|verb|start|시작하다|routine",
    "結束|jiéshù|jie2 shu4|verb|finish|끝나다|routine",
    "以前|yǐqián|yi3 qian2|time|before|이전|time",
    "以後|yǐhòu|yi3 hou4|time|after|이후|time",
    "平常|píngcháng|ping2 chang2|adverb|usually|평소에|routine",
    "通常|tōngcháng|tong1 chang2|adverb|usually|보통|routine",
    "有時候|yǒu shíhòu|you3 shi2 hou4|adverb|sometimes|가끔|routine",
    "晚上十點|wǎnshang shí diǎn|wan3 shang0 shi2 dian3|time|10 p.m.|밤 10시|time",
    "早上七點|zǎoshang qī diǎn|zao3 shang0 qi1 dian3|time|7 a.m.|아침 7시|time",
    "時間表|shíjiānbiǎo|shi2 jian1 biao3|noun|schedule|시간표|routine"
  ],
  37: [
    "約會|yuēhuì|yue1 hui4|noun|date; appointment|약속; 데이트|social",
    "見朋友|jiàn péngyǒu|jian4 peng2 you3|verb phrase|meet a friend|친구를 만나다|social",
    "一起去|yìqǐ qù|yi4 qi3 qu4|verb phrase|go together|같이 가다|social",
    "喝咖啡|hē kāfēi|he1 ka1 fei1|verb phrase|drink coffee|커피를 마시다|social",
    "吃飯|chī fàn|chi1 fan4|verb phrase|eat a meal|밥 먹다|social",
    "看電影|kàn diànyǐng|kan4 dian4 ying3|verb phrase|watch a movie|영화를 보다|social",
    "逛街|guàngjiē|guang4 jie1|verb|go shopping; stroll|거리를 구경하다|social",
    "聊天|liáotiān|liao2 tian1|verb|chat|수다 떨다|social",
    "約時間|yuē shíjiān|yue1 shi2 jian1|verb phrase|set a time|시간을 정하다|social",
    "改時間|gǎi shíjiān|gai3 shi2 jian1|verb phrase|change the time|시간을 바꾸다|social",
    "取消|qǔxiāo|qu3 xiao1|verb|cancel|취소하다|social",
    "提早|tízǎo|ti2 zao3|verb|move earlier|앞당기다|social",
    "延後|yánhòu|yan2 hou4|verb|postpone|미루다|social",
    "準時|zhǔnshí|zhun3 shi2|adjective|on time|제시간에|social",
    "遲到|chídào|chi2 dao4|verb|be late|늦다|social",
    "早到|zǎo dào|zao3 dao4|verb phrase|arrive early|일찍 도착하다|social",
    "碰面|pèngmiàn|peng4 mian4|verb|meet up|만나다|social",
    "地點|dìdiǎn|di4 dian3|noun|place|장소|social",
    "咖啡店|kāfēi diàn|ka1 fei1 dian4|noun|coffee shop|카페|social",
    "電影院|diànyǐngyuàn|dian4 ying3 yuan4|noun|movie theater|영화관|social",
    "公園|gōngyuán|gong1 yuan2|noun|park|공원|social",
    "餐廳門口|cāntīng ménkǒu|can1 ting1 men2 kou3|noun|restaurant entrance|식당 입구|social",
    "可以啊|kěyǐ a|ke3 yi3 a0|phrase|sure|그래 좋아|social",
    "好啊|hǎo a|hao3 a0|phrase|sounds good|좋아|social",
    "沒辦法|méi bànfǎ|mei2 ban4 fa3|phrase|cannot; no way|방법이 없다|social",
    "下次|xià cì|xia4 ci4|time|next time|다음번|social",
    "這次|zhè cì|zhe4 ci4|time|this time|이번|social",
    "最近|zuìjìn|zui4 jin4|time|recently|최근|social",
    "空檔|kòngdǎng|kong4 dang3|noun|free slot|빈 시간|social",
    "行程|xíngchéng|xing2 cheng2|noun|schedule; itinerary|일정|social",
    "約好了|yuē hǎo le|yue1 hao3 le0|phrase|it is settled|약속이 정해졌다|social",
    "再聯絡|zài liánluò|zai4 lian2 luo4|phrase|contact again|다시 연락하다|social",
    "傳訊息|chuán xùnxí|chuan2 xun4 xi2|verb phrase|send a message|메시지를 보내다|social",
    "打電話|dǎ diànhuà|da3 dian4 hua4|verb phrase|make a phone call|전화하다|social",
    "沒問題啊|méi wèntí a|mei2 wen4 ti2 a0|phrase|no problem|문제없어|social",
    "看情況|kàn qíngkuàng|kan4 qing2 kuang4|phrase|depends on the situation|상황을 보다|social"
  ],
  38: [
    "路線|lùxiàn|lu4 xian4|noun|route|노선|transport",
    "票|piào|piao4|noun|ticket|표|transport",
    "車票|chēpiào|che1 piao4|noun|transport ticket|차표|transport",
    "單程票|dānchéngpiào|dan1 cheng2 piao4|noun|one-way ticket|편도표|transport",
    "悠遊卡餘額|Yōuyóu Kǎ yúé|you1 you2 ka3 yu2 e2|noun|EasyCard balance|이지카드 잔액|transport",
    "加值|jiāzhí|jia1 zhi2|verb|top up|충전하다|transport",
    "進站|jìn zhàn|jin4 zhan4|verb phrase|enter station|역에 들어가다|transport",
    "出站|chū zhàn|chu1 zhan4|verb phrase|exit station|역에서 나가다|transport",
    "搭捷運|dā jiéyùn|da1 jie2 yun4|verb phrase|take the MRT|지하철을 타다|transport",
    "搭公車|dā gōngchē|da1 gong1 che1|verb phrase|take the bus|버스를 타다|transport",
    "叫車|jiào chē|jiao4 che1|verb phrase|call a taxi|택시를 부르다|transport",
    "司機|sījī|si1 ji1|noun|driver|기사|transport",
    "站牌|zhànpái|zhan4 pai2|noun|bus stop sign|버스 정류장 표지|transport",
    "班次|bāncì|ban1 ci4|noun|service run|운행 편|transport",
    "下一班|xià yì bān|xia4 yi4 ban1|phrase|next service|다음 차|transport",
    "幾分鐘|jǐ fēnzhōng|ji3 fen1 zhong1|phrase|how many minutes|몇 분|transport",
    "直達|zhídá|zhi2 da2|verb|go directly|직행하다|transport",
    "轉乘|zhuǎnchéng|zhuan3 cheng2|verb|transfer|환승하다|transport",
    "目的地|mùdìdì|mu4 di4 di4|noun|destination|목적지|transport",
    "地址|dìzhǐ|di4 zhi3|noun|address|주소|transport",
    "附近下車|fùjìn xià chē|fu4 jin4 xia4 che1|verb phrase|get off nearby|근처에서 내리다|transport",
    "走路|zǒulù|zou3 lu4|verb|walk|걷다|transport",
    "騎車|qí chē|qi2 che1|verb phrase|ride a scooter/bike|타고 가다|transport",
    "機車|jīchē|ji1 che1|noun|scooter|스쿠터|transport",
    "腳踏車|jiǎotàchē|jiao3 ta4 che1|noun|bicycle|자전거|transport",
    "紅線|hóng xiàn|hong2 xian4|noun|red line|빨간 노선|transport",
    "藍線|lán xiàn|lan2 xian4|noun|blue line|파란 노선|transport",
    "出口一|chūkǒu yī|chu1 kou3 yi1|noun|Exit 1|1번 출구|transport",
    "出口二|chūkǒu èr|chu1 kou3 er4|noun|Exit 2|2번 출구|transport",
    "票價|piàojià|piao4 jia4|noun|fare|요금|transport",
    "路程|lùchéng|lu4 cheng2|noun|distance; trip length|거리|transport",
    "大概|dàgài|da4 gai4|adverb|approximately|대략|transport",
    "很快|hěn kuài|hen3 kuai4|phrase|very fast|아주 빠르다|transport",
    "比較快|bǐjiào kuài|bi3 jiao4 kuai4|phrase|faster|더 빠르다|transport",
    "比較方便|bǐjiào fāngbiàn|bi3 jiao4 fang1 bian4|phrase|more convenient|더 편리하다|transport"
  ],
  39: [
    "坐過站|zuò guò zhàn|zuo4 guo4 zhan4|verb phrase|miss the stop|정류장을 지나치다|transport",
    "坐錯車|zuò cuò chē|zuo4 cuo4 che1|verb phrase|take the wrong vehicle|차를 잘못 타다|transport",
    "搭錯線|dā cuò xiàn|da1 cuo4 xian4|verb phrase|take the wrong line|노선을 잘못 타다|transport",
    "走錯路|zǒu cuò lù|zou3 cuo4 lu4|verb phrase|go the wrong way|길을 잘못 가다|transport",
    "反方向|fǎn fāngxiàng|fan3 fang1 xiang4|noun|opposite direction|반대 방향|transport",
    "往回走|wǎng huí zǒu|wang3 hui2 zou3|verb phrase|go back|돌아가다|transport",
    "回頭|huítóu|hui2 tou2|verb|turn back|돌아보다; 되돌아가다|transport",
    "換線|huàn xiàn|huan4 xian4|verb|change lines|노선을 갈아타다|transport",
    "延誤|yánwù|yan2 wu4|verb|be delayed|지연되다|transport",
    "誤點|wùdiǎn|wu4 dian3|verb|be behind schedule|연착되다|transport",
    "停駛|tíng shǐ|ting2 shi3|verb|service suspended|운행 중단|transport",
    "末班車|mòbānchē|mo4 ban1 che1|noun|last train/bus|막차|transport",
    "首班車|shǒubānchē|shou3 ban1 che1|noun|first train/bus|첫차|transport",
    "趕時間|gǎn shíjiān|gan3 shi2 jian1|verb phrase|be in a hurry|시간이 급하다|transport",
    "來不及|lái bù jí|lai2 bu4 ji2|phrase|too late to make it|시간이 안 되다|transport",
    "還來得及|hái lái de jí|hai2 lai2 de0 ji2|phrase|still have time|아직 늦지 않았다|transport",
    "怎麼辦|zěnme bàn|zen3 me0 ban4|question phrase|what should I do|어떻게 하지|repair",
    "麻煩你|máfan nǐ|ma2 fan0 ni3|phrase|may I trouble you|부탁합니다|requests",
    "幫忙|bāngmáng|bang1 mang2|verb|help|돕다|requests",
    "問路|wèn lù|wen4 lu4|verb phrase|ask directions|길을 묻다|transport",
    "地圖|dìtú|di4 tu2|noun|map|지도|transport",
    "導航|dǎoháng|dao3 hang2|noun|navigation|내비게이션|transport",
    "定位|dìngwèi|ding4 wei4|noun|location pin|위치 정보|transport",
    "路口|lùkǒu|lu4 kou3|noun|intersection|교차로|transport",
    "紅綠燈|hónglǜdēng|hong2 lü4 deng1|noun|traffic light|신호등|transport",
    "斑馬線|bānmǎxiàn|ban1 ma3 xian4|noun|crosswalk|횡단보도|transport",
    "橋|qiáo|qiao2|noun|bridge|다리|transport",
    "隧道|suìdào|sui4 dao4|noun|tunnel|터널|transport",
    "入口處|rùkǒuchù|ru4 kou3 chu4|noun|entrance area|입구 쪽|transport",
    "出口處|chūkǒuchù|chu1 kou3 chu4|noun|exit area|출구 쪽|transport",
    "暫停|zàntíng|zan4 ting2|verb|pause; suspend|잠시 중단하다|transport",
    "通知|tōngzhī|tong1 zhi1|noun|notice|공지|transport",
    "廣播|guǎngbò|guang3 bo4|noun|announcement|방송|transport",
    "車廂|chēxiāng|che1 xiang1|noun|train car|차량 칸|transport",
    "靠窗|kào chuāng|kao4 chuang1|phrase|by the window|창가 쪽|transport",
    "靠門|kào mén|kao4 men2|phrase|by the door|문 쪽|transport",
    "站內|zhàn nèi|zhan4 nei4|location|inside the station|역 안|transport",
    "站外|zhàn wài|zhan4 wai4|location|outside the station|역 밖|transport",
    "下一站|xià yí zhàn|xia4 yi2 zhan4|noun|next stop|다음 역|transport",
    "上一站|shàng yí zhàn|shang4 yi2 zhan4|noun|previous stop|이전 역|transport"
  ],
  40: [
    "複習|fùxí|fu4 xi2|verb|to review|복습하다|review",
    "重點|zhòngdiǎn|zhong4 dian3|noun|key point|중요점|review",
    "弱點|ruòdiǎn|ruo4 dian3|noun|weak point|약점|review",
    "錯誤|cuòwù|cuo4 wu4|noun|mistake|실수|review",
    "改正|gǎizhèng|gai3 zheng4|verb|correct|고치다|review",
    "再試一次|zài shì yí cì|zai4 shi4 yi2 ci4|phrase|try once more|다시 해 보다|review",
    "流利|liúlì|liu2 li4|adjective|fluent|유창하다|speaking",
    "清楚|qīngchǔ|qing1 chu3|adjective|clear|분명하다|speaking",
    "句子|jùzi|ju4 zi0|noun|sentence|문장|review",
    "答案|dá'àn|da2 an4|noun|answer|답|review"
  ],
  41: [
    "原因|yuányīn|yuan2 yin1|noun|cause; reason|원인|reason",
    "遲到原因|chídào yuányīn|chi2 dao4 yuan2 yin1|noun|reason for being late|지각 이유|reason",
    "肚子餓|dùzi è|du4 zi0 e4|phrase|hungry|배고프다|reason",
    "口渴|kǒukě|kou3 ke3|adjective|thirsty|목마르다|reason",
    "生病|shēngbìng|sheng1 bing4|verb|be sick|아프다|reason",
    "感冒|gǎnmào|gan3 mao4|verb|catch a cold|감기 걸리다|reason",
    "頭痛|tóutòng|tou2 tong4|verb|have a headache|머리가 아프다|reason",
    "沒睡飽|méi shuì bǎo|mei2 shui4 bao3|phrase|did not sleep enough|잠을 충분히 못 자다|reason",
    "太累了|tài lèi le|tai4 lei4 le0|phrase|too tired|너무 피곤하다|reason",
    "太忙了|tài máng le|tai4 mang2 le0|phrase|too busy|너무 바쁘다|reason",
    "下雨了|xià yǔ le|xia4 yu3 le0|phrase|it rained|비가 왔다|reason",
    "塞車了|sāichē le|sai1 che1 le0|phrase|there was traffic|차가 막혔다|reason",
    "忘記|wàngjì|wang4 ji4|verb|forget|잊다|reason",
    "忘了|wàng le|wang4 le0|phrase|forgot|잊었다|reason",
    "沒有時間|méi yǒu shíjiān|mei2 you3 shi2 jian1|phrase|no time|시간이 없다|reason",
    "來不及吃|lái bù jí chī|lai2 bu4 ji2 chi1|phrase|no time to eat|먹을 시간이 없다|reason",
    "想休息|xiǎng xiūxí|xiang3 xiu1 xi2|verb phrase|want to rest|쉬고 싶다|reason",
    "想省錢|xiǎng shěng qián|xiang3 sheng3 qian2|verb phrase|want to save money|돈을 아끼고 싶다|reason",
    "省錢|shěng qián|sheng3 qian2|verb phrase|save money|돈을 아끼다|reason",
    "比較便宜|bǐjiào piányí|bi3 jiao4 pian2 yi2|phrase|cheaper|더 싸다|reason",
    "比較近|bǐjiào jìn|bi3 jiao4 jin4|phrase|closer|더 가깝다|reason",
    "比較遠|bǐjiào yuǎn|bi3 jiao4 yuan3|phrase|farther|더 멀다|reason",
    "沒帶|méi dài|mei2 dai4|verb phrase|did not bring|안 가져오다|reason",
    "沒帶錢|méi dài qián|mei2 dai4 qian2|phrase|did not bring money|돈을 안 가져오다|reason",
    "忘記帶|wàngjì dài|wang4 ji4 dai4|verb phrase|forgot to bring|가져오는 것을 잊다|reason",
    "想買|xiǎng mǎi|xiang3 mai3|verb phrase|want to buy|사고 싶다|reason",
    "不想買|bù xiǎng mǎi|bu4 xiang3 mai3|verb phrase|do not want to buy|사고 싶지 않다|reason",
    "不想吃|bù xiǎng chī|bu4 xiang3 chi1|verb phrase|do not want to eat|먹고 싶지 않다|reason",
    "不想喝|bù xiǎng hē|bu4 xiang3 he1|verb phrase|do not want to drink|마시고 싶지 않다|reason",
    "需要休息|xūyào xiūxí|xu1 yao4 xiu1 xi2|verb phrase|need rest|휴식이 필요하다|reason",
    "需要幫忙|xūyào bāngmáng|xu1 yao4 bang1 mang2|verb phrase|need help|도움이 필요하다|reason",
    "剛下班|gāng xiàbān|gang1 xia4 ban1|phrase|just got off work|방금 퇴근했다|reason",
    "剛起床|gāng qǐchuáng|gang1 qi3 chuang2|phrase|just got up|방금 일어났다|reason",
    "路上|lùshàng|lu4 shang4|location|on the way|길에서|reason",
    "臨時|línshí|lin2 shi2|adverb|temporary; last-minute|갑작스러운|reason"
  ],
  42: [
    "喜歡|xǐhuān|xi3 huan1|verb|to like|좋아하다|preference",
    "不喜歡|bù xǐhuān|bu4 xi3 huan1|verb phrase|dislike|좋아하지 않다|preference",
    "比較喜歡|bǐjiào xǐhuān|bi3 jiao4 xi3 huan1|verb phrase|prefer|더 좋아하다|preference",
    "最喜歡|zuì xǐhuān|zui4 xi3 huan1|verb phrase|like the most|가장 좋아하다|preference",
    "愛吃|ài chī|ai4 chi1|verb phrase|love eating|즐겨 먹다|preference",
    "愛喝|ài hē|ai4 he1|verb phrase|love drinking|즐겨 마시다|preference",
    "口味|kǒuwèi|kou3 wei4|noun|taste; flavor preference|입맛|preference",
    "甜的|tián de|tian2 de0|noun phrase|sweet one|단 것|preference",
    "鹹的|xián de|xian2 de0|noun phrase|salty one|짠 것|preference",
    "辣的|là de|la4 de0|noun phrase|spicy one|매운 것|preference",
    "清淡|qīngdàn|qing1 dan4|adjective|light; mild|담백하다|preference",
    "濃|nóng|nong2|adjective|strong; rich|진하다|preference",
    "香|xiāng|xiang1|adjective|fragrant|향이 좋다|preference",
    "新鮮|xīnxiān|xin1 xian1|adjective|fresh|신선하다|preference",
    "選擇|xuǎnzé|xuan3 ze2|noun|choice|선택|preference",
    "選|xuǎn|xuan3|verb|choose|고르다|preference",
    "哪一個|nǎ yí ge|na3 yi2 ge0|question phrase|which one|어느 것|preference",
    "還是|háishì|hai2 shi4|conjunction|or|아니면|preference",
    "都可以|dōu kěyǐ|dou1 ke3 yi3|phrase|either is fine|다 괜찮다|preference",
    "都不錯|dōu búcuò|dou1 bu2 cuo4|phrase|both are good|둘 다 괜찮다|preference",
    "不要太甜|bú yào tài tián|bu2 yao4 tai4 tian2|phrase|not too sweet|너무 달지 않게|preference",
    "不要太辣|bú yào tài là|bu2 yao4 tai4 la4|phrase|not too spicy|너무 맵지 않게|preference",
    "想吃飯|xiǎng chī fàn|xiang3 chi1 fan4|verb phrase|want to eat a meal|밥 먹고 싶다|preference",
    "想喝茶|xiǎng hē chá|xiang3 he1 cha2|verb phrase|want to drink tea|차를 마시고 싶다|preference",
    "想看電影|xiǎng kàn diànyǐng|xiang3 kan4 dian4 ying3|verb phrase|want to watch a movie|영화 보고 싶다|preference",
    "喜歡安靜|xǐhuān ānjìng|xi3 huan1 an1 jing4|verb phrase|like quiet|조용한 것을 좋아하다|preference",
    "喜歡熱鬧|xǐhuān rènào|xi3 huan1 re4 nao4|verb phrase|like lively places|활기찬 곳을 좋아하다|preference",
    "安靜|ānjìng|an1 jing4|adjective|quiet|조용하다|preference",
    "差不多|chàbùduō|cha4 bu4 duo1|adverb|about the same|비슷하다|preference",
    "更好|gèng hǎo|geng4 hao3|phrase|better|더 좋다|preference",
    "比較好|bǐjiào hǎo|bi3 jiao4 hao3|phrase|better; preferable|더 좋다|preference",
    "我覺得|wǒ juéde|wo3 jue2 de0|phrase|I think; I feel|내 생각에는|opinion",
    "看起來|kàn qǐlái|kan4 qi3 lai2|verb phrase|looks|보기에|opinion",
    "聽起來|tīng qǐlái|ting1 qi3 lai2|verb phrase|sounds|듣기에|opinion",
    "好像|hǎoxiàng|hao3 xiang4|adverb|seems like|~인 것 같다|opinion"
  ],
  43: [
    "上衣|shàngyī|shang4 yi1|noun|top; shirt|상의|clothes",
    "外套|wàitào|wai4 tao4|noun|jacket|외투|clothes",
    "裙子|qúnzi|qun2 zi0|noun|skirt|치마|clothes",
    "短褲|duǎnkù|duan3 ku4|noun|shorts|반바지|clothes",
    "長褲|chángkù|chang2 ku4|noun|long pants|긴바지|clothes",
    "襪子|wàzi|wa4 zi0|noun|socks|양말|clothes",
    "帽子|màozi|mao4 zi0|noun|hat|모자|clothes",
    "包包|bāobāo|bao1 bao1|noun|bag; purse|가방|clothes",
    "黑色|hēisè|hei1 se4|noun|black color|검은색|color",
    "白色|báisè|bai2 se4|noun|white color|흰색|color",
    "紅色|hóngsè|hong2 se4|noun|red color|빨간색|color",
    "藍色|lánsè|lan2 se4|noun|blue color|파란색|color",
    "綠色|lǜsè|lü4 se4|noun|green color|초록색|color",
    "黃色|huángsè|huang2 se4|noun|yellow color|노란색|color",
    "灰色|huīsè|hui1 se4|noun|gray color|회색|color",
    "尺寸表|chǐcùnbiǎo|chi3 cun4 biao3|noun|size chart|사이즈표|clothes",
    "小號|xiǎo hào|xiao3 hao4|noun|small size|작은 사이즈|clothes",
    "中號|zhōng hào|zhong1 hao4|noun|medium size|중간 사이즈|clothes",
    "大號|dà hào|da4 hao4|noun|large size|큰 사이즈|clothes",
    "太大|tài dà|tai4 da4|adjective phrase|too big|너무 크다|clothes",
    "太小|tài xiǎo|tai4 xiao3|adjective phrase|too small|너무 작다|clothes",
    "剛好|gānghǎo|gang1 hao3|adverb|just right|딱 맞다|clothes",
    "試衣間|shìyījiān|shi4 yi1 jian1|noun|fitting room|탈의실|clothes",
    "可以試穿嗎|kěyǐ shìchuān ma|ke3 yi3 shi4 chuan1 ma0|phrase|may I try it on?|입어 봐도 되나요|clothes",
    "材質|cáizhí|cai2 zhi2|noun|material|소재|clothes",
    "棉|mián|mian2|noun|cotton|면|clothes",
    "薄|báo|bao2|adjective|thin|얇다|clothes",
    "厚|hòu|hou4|adjective|thick|두껍다|clothes",
    "舒服嗎|shūfú ma|shu1 fu2 ma0|phrase|is it comfortable?|편한가요|clothes",
    "合身|héshēn|he2 shen1|adjective|well-fitting|몸에 맞다|clothes",
    "太貴了|tài guì le|tai4 gui4 le0|phrase|too expensive|너무 비싸다|clothes",
    "便宜一點|piányí yìdiǎn|pian2 yi2 yi4 dian3|phrase|a bit cheaper|조금 싸게|clothes",
    "折扣|zhékòu|zhe2 kou4|noun|discount|할인|clothes",
    "原價|yuánjià|yuan2 jia4|noun|original price|원가|clothes",
    "特價品|tèjiàpǐn|te4 jia4 pin3|noun|sale item|특가 상품|clothes",
    "可以刷卡嗎|kěyǐ shuākǎ ma|ke3 yi3 shua1 ka3 ma0|phrase|can I pay by card?|카드 결제 되나요|clothes",
    "收銀台|shōuyíntái|shou1 yin2 tai2|noun|cash register|계산대|store",
    "退貨|tuìhuò|tui4 huo4|verb|return goods|반품하다|store",
    "換貨|huànhuò|huan4 huo4|verb|exchange goods|교환하다|store",
    "發票號碼|fāpiào hàomǎ|fa1 piao4 hao4 ma3|noun|receipt number|영수증 번호|store",
    "購物袋|gòuwù dài|gou4 wu4 dai4|noun|shopping bag|쇼핑백|store",
    "這件|zhè jiàn|zhe4 jian4|measure phrase|this clothing item|이 벌|clothes",
    "那件|nà jiàn|na4 jian4|measure phrase|that clothing item|저 벌|clothes",
    "一件|yí jiàn|yi2 jian4|measure phrase|one clothing item|한 벌|clothes",
    "兩件|liǎng jiàn|liang3 jian4|measure phrase|two clothing items|두 벌|clothes"
  ],
  44: [
    "路滑|lù huá|lu4 hua2|phrase|road is slippery|길이 미끄럽다|weather",
    "小心|xiǎoxīn|xiao3 xin1|verb|be careful|조심하다|weather",
    "晴天|qíngtiān|qing2 tian1|noun|sunny day|맑은 날|weather",
    "陰天|yīntiān|yin1 tian1|noun|cloudy day|흐린 날|weather",
    "多雲|duōyún|duo1 yun2|adjective|cloudy|구름 많다|weather",
    "颱風|táifēng|tai2 feng1|noun|typhoon|태풍|weather",
    "風|fēng|feng1|noun|wind|바람|weather",
    "很熱|hěn rè|hen3 re4|phrase|very hot|매우 덥다|weather",
    "很冷|hěn lěng|hen3 leng3|phrase|very cold|매우 춥다|weather",
    "很舒服|hěn shūfú|hen3 shu1 fu2|phrase|very comfortable|매우 편하다|weather",
    "悶熱|mēnrè|men1 re4|adjective|hot and humid|후덥지근하다|weather",
    "涼快|liángkuài|liang2 kuai4|adjective|cool|시원하다|weather",
    "溫度|wēndù|wen1 du4|noun|temperature|온도|weather",
    "幾度|jǐ dù|ji3 du4|phrase|how many degrees|몇 도|weather",
    "二十度|èrshí dù|er4 shi2 du4|phrase|twenty degrees|20도|weather",
    "三十度|sānshí dù|san1 shi2 du4|phrase|thirty degrees|30도|weather",
    "帶傘|dài sǎn|dai4 san3|verb phrase|bring an umbrella|우산을 가져가다|weather",
    "穿外套|chuān wàitào|chuan1 wai4 tao4|verb phrase|wear a jacket|외투를 입다|weather",
    "心情好|xīnqíng hǎo|xin1 qing2 hao3|phrase|in a good mood|기분이 좋다|mood",
    "心情不好|xīnqíng bù hǎo|xin1 qing2 bu4 hao3|phrase|in a bad mood|기분이 안 좋다|mood",
    "有精神|yǒu jīngshén|you3 jing1 shen2|phrase|energetic|기운이 있다|mood",
    "沒精神|méi jīngshén|mei2 jing1 shen2|phrase|low energy|기운이 없다|mood",
    "放鬆|fàngsōng|fang4 song1|verb|relax|긴장을 풀다|mood",
    "壓力|yālì|ya1 li4|noun|pressure; stress|스트레스|mood",
    "壓力大|yālì dà|ya1 li4 da4|phrase|high pressure|스트레스가 많다|mood",
    "擔心|dānxīn|dan1 xin1|verb|worry|걱정하다|mood",
    "放心|fàngxīn|fang4 xin1|verb|feel relieved|안심하다|mood",
    "難過|nánguò|nan2 guo4|adjective|sad|슬프다|mood",
    "生氣|shēngqì|sheng1 qi4|verb|angry|화나다|mood",
    "無聊|wúliáo|wu2 liao2|adjective|bored|심심하다|mood",
    "有趣|yǒuqù|you3 qu4|adjective|interesting|재미있다|mood",
    "辛苦|xīnkǔ|xin1 ku3|adjective|hard; tiring|힘들다|mood",
    "還好|hái hǎo|hai2 hao3|phrase|not bad; okay|괜찮다|mood",
    "真的嗎|zhēn de ma|zhen1 de0 ma0|phrase|really?|정말이에요?|conversation",
    "太好了|tài hǎo le|tai4 hao3 le0|phrase|great|정말 좋다|conversation",
    "天氣預報|tiānqì yùbào|tian1 qi4 yu4 bao4|noun|weather forecast|일기예보|weather",
    "雨很大|yǔ hěn dà|yu3 hen3 da4|phrase|the rain is heavy|비가 많이 온다|weather"
  ]
};

const DEFAULT_FLOW = [
  { id: "pattern_review", title: "Grammar & examples", kind: "pattern_review", target_count: 3, duration_minutes: 10 },
  { id: "new_words", title: "Vocabulary in sentences", kind: "new_words", target_count: 35, duration_minutes: 10 },
  { id: "substitution", title: "Sentence generation", kind: "substitution", target_count: 20, duration_minutes: 20 },
  { id: "listen_shadow", title: "Listening and shadowing", kind: "listen_shadow", target_count: 20, duration_minutes: 10 },
  { id: "memory_speaking", title: "Speak from memory", kind: "memory_speaking", target_count: 10, duration_minutes: 5 },
  { id: "reverse_translation", title: "Reverse sentence builder", kind: "reverse_translation", target_count: 10, duration_minutes: 5 }
];

const vocab = [];
const sentences = [];
const grammar = [];
const lessons = [];
const audio = [];
const writingChars = new Map();
const dialogues = [];
const listening = [];
const speaking = [];
const review = [];
const assessments = [];
const allVocabByChar = new Map(existingVocab.map((item) => [item.char, item]));
const allVocabById = new Map(existingVocab.map((item) => [item.id, item]));

for (const day of framework) {
  const dayVocab = buildDayVocab(day);
  dayVocab.forEach((item) => {
    vocab.push(item);
    allVocabByChar.set(item.char, item);
    allVocabById.set(item.id, item);
    audio.push(audioItem(item.audio_id, "vocab", item.id, item.char, item.pinyin_numeric));
    Array.from(item.char).filter(isChinese).forEach((char) => {
      if (!writingChars.has(char)) writingChars.set(char, writingItem(char, day.day));
    });
  });

  const dayGrammar = day.grammar_ids_to_create.map((id, index) => buildGrammar(day, id, index, dayVocab));
  grammar.push(...dayGrammar);

  const daySentences = buildSentences(day, dayVocab, dayGrammar);
  sentences.push(...daySentences);
  daySentences.forEach((sentence) => audio.push(audioItem(sentence.audio_id, "sentence", sentence.id, sentence.text, sentence.pinyin_numeric)));
  linkVocabExamples(dayVocab, daySentences);
  linkGrammarExamples(dayGrammar, daySentences);

  const dayDialogues = buildDialogues(day, dayVocab, dayGrammar);
  dialogues.push(...dayDialogues);
  dayDialogues.forEach((dialogue) => {
    dialogue.turns.forEach((turn) => audio.push(audioItem(turn.audio_id, "dialogue", dialogue.id, turn.text, turn.pinyin_numeric)));
  });

  const dayListening = buildListening(day, daySentences, dayDialogues, dayVocab);
  listening.push(...dayListening);
  dayListening.forEach((item) => audio.push(audioItem(item.audio_id, "listening", item.id, item.text, item.pinyin_numeric)));

  const daySpeaking = buildSpeaking(day, daySentences, dayDialogues);
  speaking.push(...daySpeaking);

  const dayReview = buildReview(day);
  review.push(dayReview);

  if (day.assessment) assessments.push(buildAssessment(day, daySentences, dayDialogues));

  lessons.push({
    id: lessonId(day.day),
    week: Math.ceil(day.day / 7),
    order: day.day,
    title: day.unit,
    xp: day.assessment ? 180 : day.day % 5 === 0 ? 140 : 120,
    skills: ["taiwan_mandarin", "sentence_output", "phase_03", `day_${String(day.day).padStart(2, "0")}`],
    phase_id: "PHASE_03",
    scenario: day.scenario,
    communication_functions: day.target_functions,
    vocab_ids: dayVocab.map((item) => item.id),
    sentence_ids: daySentences.map((item) => item.id),
    grammar_ids: dayGrammar.map((item) => item.id),
    pronunciation_ids: [],
    dialogue_ids: dayDialogues.map((item) => item.id),
    listening_ids: dayListening.map((item) => item.id),
    speaking_ids: daySpeaking.map((item) => item.id),
    review_ids: [dayReview.id],
    assessment_id: day.assessment ? `ASM_D${day.day}` : undefined,
    assessment: Boolean(day.assessment),
    exercise_flow: DEFAULT_FLOW.map((step) => step.id),
    daily_flow: DEFAULT_FLOW,
    mastery_threshold: 0.85
  });
}

writeJson("mandarin_course/data/vocab_days31_45.json", vocab);
writeJson("mandarin_course/data/sentences_days31_45.json", sentences);
writeJson("mandarin_course/data/grammar_days31_45.json", grammar);
writeJson("mandarin_course/data/writing_days31_45.json", [...writingChars.values()]);
writeJson("mandarin_course/data/dialogues_days31_45.json", dialogues);
writeJson("mandarin_course/data/listening_days31_45.json", listening);
writeJson("mandarin_course/data/speaking_days31_45.json", speaking);
writeJson("mandarin_course/data/review_days31_45.json", review);
writeJson("mandarin_course/data/assessment_days31_45.json", assessments);
writeJson("mandarin_course/lessons/lessons_days31_45.json", lessons);
writeJson("mandarin_course/lessons/lessons_days46_90_locked.json", lockedLessons);
writeJson("mandarin_course/audio/manifest_days31_45.json", audio);

function buildDayVocab(day) {
  if (day.new_vocab_target === 0) return [];
  const specs = [...(DAILY_WORDS[day.day] ?? [])];
  for (const topic of TOPIC_SEQUENCE[day.day] ?? []) specs.push(...(FALLBACK_BY_TOPIC[topic] ?? []));
  specs.push(...(DAY_EXTRA_WORDS[day.day] ?? []));
  specs.push(...EXTRA_STEMS);

  const unique = [];
  const seen = new Set();
  for (const spec of specs) {
    const parsed = parseSpec(spec, day.day);
    if (allVocabByChar.has(parsed.char) || seen.has(parsed.char)) continue;
    seen.add(parsed.char);
    unique.push(parsed);
    if (unique.length === day.new_vocab_target) break;
  }

  if (unique.length < day.new_vocab_target) {
    throw new Error(
      `Day ${day.day} needs ${day.new_vocab_target} real vocab items, but only ${unique.length} unique items were available. Add real DAY_EXTRA_WORDS; never generate filler.`
    );
  }

  return unique.map((item, index) => ({
    ...item,
    id: `VOC_D${day.day}_${pad(index + 1, 3)}`,
    frequency: item.frequency ?? "medium",
    cefr: "A2",
    hsk_level: 2,
    example_ids: [],
    audio_id: `AUD_VOC_D${day.day}_${pad(index + 1, 3)}`,
    day_introduced: day.day,
    srs_tags: [`day_${day.day}`, item.semantic_domain]
  }));
}

function buildGrammar(day, id, index, dayVocab) {
  const phrase = dayVocab[index % Math.max(dayVocab.length, 1)]?.char ?? knownOne("咖啡")?.char ?? "今天";
  const examples = [];
  return {
    id,
    pattern: grammarPattern(id, index),
    structure: ["context", "function word", "predicate"],
    explanation_en: `${day.unit}: use this pattern to ${day.target_functions[index % day.target_functions.length] ?? "communicate"} in ${day.scenario}.`,
    title: titleFromGrammarId(id),
    meaning: `A practical Taiwan Mandarin pattern for ${day.unit.toLowerCase()}.`,
    when_to_use: [
      `When the learner needs to handle ${day.scenario}.`,
      "When speaking politely with a clerk, friend, or service worker.",
      "When turning known words into a usable spoken response."
    ],
    when_not_to_use: [
      "Do not use it as a direct English word-by-word translation.",
      "Do not use it when a shorter yes/no answer is enough.",
      "Do not use it with future-day vocabulary before it has been introduced."
    ],
    pragmatic_notes: "Taiwan usage favors clear, polite, compact sentences with softeners such as 請, 不好意思, and 一下.",
    word_order_notes: "Time or context usually comes before the subject; the main request or action stays before the object.",
    english_contrast: "English often moves polite wording to the end; Mandarin usually places the request marker before the action.",
    korean_contrast: "Korean learners may overuse sentence-final politeness; Mandarin politeness is often lexical and word-order based.",
    example_ids: examples,
    slots: [
      {
        name: "object",
        role: "object",
        values: dayVocab.slice(0, 8).map((item) => ({
          text: item.char,
          pinyin: item.pinyin,
          meaning_en: item.meaning_en,
          meaning_ko: item.meaning_ko,
          vocab_id: item.id
        }))
      }
    ],
    drill_examples: [],
    correct_examples: [],
    negative_examples: [
      {
        text: `我${phrase}請。`,
        error: "The request marker should come before the action or request."
      },
      {
        text: `${phrase}我可以嗎？`,
        error: "The modal question needs a clear action before the object."
      }
    ],
    incorrect_examples: [
      {
        text: `我${phrase}請。`,
        error: "The request marker should come before the action or request."
      },
      {
        text: `${phrase}我可以嗎？`,
        error: "The modal question needs a clear action before the object."
      }
    ],
    transformation_drills: [
      "Change the object.",
      "Change the speaker.",
      "Turn the statement into a question.",
      "Make the sentence more polite.",
      "Answer with a reason."
    ],
    production_drills: [
      `Ask for something in the situation: ${day.scenario}.`,
      "Reject one option politely.",
      "Ask a follow-up question.",
      "Clarify a misunderstanding.",
      "Give a short reason."
    ],
    common_error_patterns: [
      "Putting 嗎 after an incomplete phrase.",
      "Using English word order for the object.",
      "Skipping the measure word in service situations."
    ],
    repair_feedback: {
      word_order: "Move the action before the object.",
      politeness: "Add 請 or 不好意思 before the request.",
      vocabulary: "Use only today or previously learned words."
    }
  };
}

function isUsableSentenceObject(item) {
  if (!item || isAbstractPracticeObject(item)) return false;
  if (/adjective|verb$|adverb|conjunction|preposition|question word|measure word/.test(item.pos)) return false;
  return /noun|place|time|phrase|location/.test(item.pos);
}

function isAbstractPracticeObject(item) {
  const text = `${item.char} ${item.meaning_en}`.toLowerCase();
  return (
    text.includes("practice item") ||
    text.includes("練習") ||
    /\b(reason|cause|choice|taste|flavor preference|mood|weather|pressure|mistake|answer|key point|weak point)\b/.test(text)
  );
}

function buildSentences(day, dayVocab, dayGrammar) {
  const count = day.assessment ? 60 : 90;
  const subjects = priorCommon.filter((item) => ["我", "你", "他", "她", "我們"].includes(item.char));
  const requestAction = knownOne("給我") ?? knownOne("拿") ?? knownOne("買") ?? knownOne("要");
  const wantAction = knownOne("想要") ?? knownOne("要") ?? requestAction;
  const special = specialSentenceParts(day.day, dayVocab, subjects, requestAction, wantAction, count);
  if (special.length) return materializeSentences(day, dayGrammar, special);

  const contentVocab = dayVocab.filter(isUsableSentenceObject);
  const usable = [
    ...(contentVocab.length >= 6 ? contentVocab : dayVocab.filter((item) => !isAbstractPracticeObject(item))),
    ...known(["咖啡", "紅茶", "珍珠奶茶", "牛肉麵", "衣服", "捷運", "洗手間", "今天", "明天"])
  ].filter(Boolean);
  const plans = [];
  for (let i = 0; i < count; i += 1) {
    const subject = subjects[i % subjects.length] ?? priorByChar.get("我");
    const object = usable[i % usable.length];
    const style = i % 6;
    let parts;
    let translation;
    if (style === 0) {
      parts = [subject, wantAction, object];
      translation = `${subject.meaning_en} would like ${object.meaning_en}.`;
    } else if (style === 1) {
      parts = [knownOne("請"), requestAction, object];
      translation = `Please bring/give ${object.meaning_en}.`;
    } else if (style === 2) {
      parts = [knownOne("可以"), requestAction, object, knownOne("嗎")];
      translation = `Can I/you have ${object.meaning_en}?`;
    } else if (style === 3) {
      parts = [subject, knownOne("需要"), object];
      translation = `${subject.meaning_en} needs ${object.meaning_en}.`;
    } else if (style === 4) {
      parts = [knownOne("不好意思"), subject, wantAction, object];
      translation = `Excuse me, ${subject.meaning_en} would like ${object.meaning_en}.`;
    } else {
      parts = [knownOne("你") ?? subject, wantAction, object, knownOne("嗎")];
      translation = `Do you want ${object.meaning_en}?`;
    }
    plans.push({ parts, translation, isQuestion: style === 2 || style === 5 });
  }
  return materializeSentences(day, dayGrammar, plans);
}

function materializeSentences(day, dayGrammar, plans) {
  return plans.map((plan, index) => {
    const parts = plan.parts.filter(Boolean);
    const text = `${parts.map((item) => item.char).join("")}${plan.isQuestion ? "？" : "。"}`;
    return {
      id: `SEN_D${day.day}_${pad(index + 1, 3)}`,
      text,
      pinyin: sentencePinyin(parts, plan.isQuestion ? "?" : "."),
      pinyin_numeric: sentenceNumeric(parts),
      translation_en: cleanTranslation(plan.translation),
      translation_ko: "문맥에 맞게 중국어 문장을 말해 보세요.",
      tokens: parts.map((item) => item.char),
      token_ids: parts.map((item) => item.id),
      grammar_ids: [dayGrammar[index % dayGrammar.length].id],
      audio_id: `AUD_SEN_D${day.day}_${pad(index + 1, 3)}`,
      difficulty: day.day < 40 ? 2 : 3,
      production_type: index % 3 === 0 ? "substitution" : index % 3 === 1 ? "listening" : "memory"
    };
  });
}

function specialSentenceParts(day, dayVocab, subjects, requestAction, wantAction, count) {
  const word = (...chars) => chars.map(knownOne).find(Boolean) ?? dayVocab.find((item) => chars.includes(item.char));
  const local = (...chars) => chars.map((char) => dayVocab.find((item) => item.char === char)).find(Boolean) ?? word(...chars);
  const subjectAt = (index) => subjects[index % Math.max(subjects.length, 1)] ?? word("我");
  const cycle = (items, index) => items[index % Math.max(items.length, 1)];
  const plans = [];
  const add = (parts, translation, isQuestion = false) => plans.push({ parts, translation, isQuestion });

  if (day === 35) {
    const foods = ["牛肉麵", "水餃", "炒飯", "炒麵", "青菜", "豆腐", "雞排", "湯包"].map(local).filter(Boolean);
    const changes = ["不要辣", "少鹽", "少油", "加飯", "加麵", "加蛋", "打包"].map(local).filter(Boolean);
    const problems = ["拿錯", "點錯", "送錯", "少了", "太鹹", "太甜", "太油", "等太久"].map(local).filter(Boolean);
    for (let i = 0; i < count; i += 1) {
      const food = cycle(foods, i);
      const change = cycle(changes, i);
      const problem = cycle(problems, i);
      if (i % 5 === 0) add([word("請"), requestAction, food], `Please give me ${food.meaning_en}.`);
      else if (i % 5 === 1) add([food, word("可以"), change, word("嗎")], `Can the ${food.meaning_en} be ${change.meaning_en}?`, true);
      else if (i % 5 === 2) add([word("不好意思"), food, problem], `Excuse me, the ${food.meaning_en} is ${problem.meaning_en}.`);
      else if (i % 5 === 3) add([word("可以"), word("幫我"), word("換一份"), word("嗎")], "Can you help me change one portion?", true);
      else add([word("沒有關係"), word("我"), word("再等一下")], "It is okay, I will wait a little longer.");
    }
  }

  if (day === 40) {
    const actions = ["複習", "改正", "再試一次"].map(local).filter(Boolean);
    const targets = ["句子", "答案", "重點", "錯誤", "弱點"].map(local).filter(Boolean);
    for (let i = 0; i < count; i += 1) {
      const action = cycle(actions, i);
      const target = cycle(targets, i);
      if (i % 4 === 0) add([word("我"), wantAction, action, target], `I want to ${action.meaning_en} the ${target.meaning_en}.`);
      else if (i % 4 === 1) add([word("請"), word("再說一次")], "Please say it again.");
      else if (i % 4 === 2) add([word("可以"), word("慢一點"), word("嗎")], "Can you go a little slower?", true);
      else add([word("我"), word("要"), word("改正"), target], `I need to correct the ${target.meaning_en}.`);
    }
  }

  if (day === 41) {
    const reasons = ["肚子餓", "口渴", "生病", "感冒", "沒睡飽", "太累了", "太忙了", "塞車了", "沒有時間", "剛下班"].map(local).filter(Boolean);
    const actions = ["不想吃", "不想喝", "想休息", "想買", "需要休息", "需要幫忙"].map(local).filter(Boolean);
    for (let i = 0; i < count; i += 1) {
      const subject = subjectAt(i);
      const reason = cycle(reasons, i);
      const action = cycle(actions, i);
      if (i % 5 === 0) add([subject, action], `${subject.meaning_en} ${action.meaning_en}.`);
      else if (i % 5 === 1) add([word("因為"), subject, reason], `Because ${subject.meaning_en} is/was ${reason.meaning_en}.`);
      else if (i % 5 === 2) add([word("為什麼"), subject, action], `Why does ${subject.meaning_en} ${action.meaning_en}?`, true);
      else if (i % 5 === 3) add([subject, action, word("因為"), reason], `${subject.meaning_en} ${action.meaning_en} because of ${reason.meaning_en}.`);
      else add([word("不好意思"), subject, reason], `Sorry, ${subject.meaning_en} is/was ${reason.meaning_en}.`);
    }
  }

  if (day === 42) {
    const items = ["甜的", "鹹的", "辣的", "清淡", "珍珠奶茶", "牛肉麵", "咖啡", "紅茶", "安靜", "熱鬧"].map(local).filter(Boolean);
    const verbs = ["喜歡", "不喜歡", "比較喜歡", "最喜歡"].map(local).filter(Boolean);
    for (let i = 0; i < count; i += 1) {
      const subject = subjectAt(i);
      const first = cycle(items, i);
      const second = cycle(items, i + 3);
      const verb = cycle(verbs, i);
      if (i % 5 === 0) add([subject, verb, first], `${subject.meaning_en} ${verb.meaning_en} ${first.meaning_en}.`);
      else if (i % 5 === 1) add([word("你"), word("喜歡"), first, word("還是"), second], `Do you like ${first.meaning_en} or ${second.meaning_en}?`, true);
      else if (i % 5 === 2) add([word("我"), word("比較喜歡"), first], `I prefer ${first.meaning_en}.`);
      else if (i % 5 === 3) add([first, word("還是"), second, word("都不錯")], `${first.meaning_en} and ${second.meaning_en} are both good.`);
      else add([word("我覺得"), first, word("比較好")], `I think ${first.meaning_en} is better.`);
    }
  }

  if (day === 44) {
    const weather = ["晴天", "陰天", "多雲", "下雨", "颱風", "很熱", "很冷", "悶熱", "涼快"].map(local).filter(Boolean);
    const moods = ["心情好", "心情不好", "有精神", "沒精神", "開心", "緊張", "難過", "放鬆"].map(local).filter(Boolean);
    for (let i = 0; i < count; i += 1) {
      const weatherWord = cycle(weather, i);
      const mood = cycle(moods, i);
      if (i % 5 === 0) add([word("今天"), weatherWord], `Today is ${weatherWord.meaning_en}.`);
      else if (i % 5 === 1) add([word("因為"), weatherWord, word("我"), mood], `Because it is ${weatherWord.meaning_en}, I feel ${mood.meaning_en}.`);
      else if (i % 5 === 2) add([word("你"), word("心情"), word("好"), word("嗎")], "Are you in a good mood?", true);
      else if (i % 5 === 3) add([word("今天"), word("需要"), word("帶傘"), word("嗎")], "Do we need to bring an umbrella today?", true);
      else add([word("下雨"), word("路滑"), word("小心")], "It is raining; the road is slippery, be careful.");
    }
  }

  return plans;
}

function buildDialogues(day, dayVocab, dayGrammar) {
  return day.required_dialogues.map((scenario, index) => {
    const key = `DLG_D${day.day}_${pad(index + 1, 2)}`;
    const fallbackObjects = known(["咖啡", "紅茶", "捷運", "洗手間", "今天"]).filter(Boolean);
    const contentVocab = dayVocab.filter((item) => /noun|place|time|adjective|location/.test(item.pos));
    const pool = contentVocab.length ? contentVocab : fallbackObjects;
    const object = pool[index % Math.max(pool.length, 1)];
    const second = pool[(index + 5) % Math.max(pool.length, 1)] ?? object;
    const turns = [
      turn(key, 1, "customer", [knownOne("不好意思"), knownOne("我"), knownOne("想要"), object], "Excuse me, I would like this item."),
      turn(key, 2, "staff", [knownOne("可以"), knownOne("嗎")], "Is that okay?"),
      turn(key, 3, "customer", [knownOne("可以"), knownOne("請"), knownOne("給我"), second], "Yes, please give me the second item."),
      turn(key, 4, "staff", [knownOne("需要"), object, knownOne("嗎")], "Do you need this item?"),
      turn(key, 5, "customer", [knownOne("不用"), knownOne("謝謝")], "No need, thank you."),
      turn(key, 6, "staff", [knownOne("好"), knownOne("沒問題")], "Okay, no problem.")
    ];
    return {
      id: key,
      lesson_id: lessonId(day.day),
      scenario,
      speaker_roles: ["customer", "staff"],
      grammar_ids: [dayGrammar[index % dayGrammar.length].id],
      turns,
      audio_ids: turns.map((item) => item.audio_id),
      comprehension_questions: [
        {
          id: `${key}_Q1`,
          question_en: "What does the customer want?",
          answer_en: object.meaning_en
        },
        {
          id: `${key}_Q2`,
          question_en: "How does the customer respond politely?",
          answer_en: "The customer uses 不好意思, 請, and 謝謝."
        }
      ],
      speaking_shadowing_prompts: turns.map((item) => item.text),
      free_response_branching_prompts: [
        "Change the requested item and say the turn again.",
        "Ask one clarification question.",
        "Politely reject one option."
      ]
    };
  });
}

function buildListening(day, daySentences, dayDialogues, dayVocab) {
  const items = [];
  const types = ["isolated_word", "sentence", "short_dialogue", "natural_variant", "distractor_variant"];
  for (let i = 0; i < (day.assessment ? 10 : 20); i += 1) {
    const type = types[i % types.length];
    const sentence = daySentences[(i * 3) % daySentences.length];
    const word = dayVocab[i % Math.max(dayVocab.length, 1)];
    const text = type === "isolated_word" && word ? word.char : sentence.text;
    items.push({
      id: `LIS_D${day.day}_${pad(i + 1, 2)}`,
      lesson_id: lessonId(day.day),
      type,
      prompt_en: type === "distractor_variant" ? "Choose the sentence that does not match." : "Listen and identify the meaning.",
      text,
      pinyin: type === "isolated_word" && word ? word.pinyin : sentence.pinyin,
      pinyin_numeric: type === "isolated_word" && word ? word.pinyin_numeric : sentence.pinyin_numeric,
      translation_en: type === "isolated_word" && word ? word.meaning_en : sentence.translation_en,
      translation_ko: type === "isolated_word" && word ? word.meaning_ko : sentence.translation_ko,
      audio_id: `AUD_LIS_D${day.day}_${pad(i + 1, 2)}`,
      sentence_id: sentence.id,
      dialogue_id: type === "short_dialogue" ? dayDialogues[i % dayDialogues.length].id : undefined
    });
  }
  return items;
}

function buildSpeaking(day, daySentences, dayDialogues) {
  const types = ["repeat_after_model", "substitution_drill", "answer_question", "roleplay_response", "free_response"];
  const count = day.assessment ? 20 : 35;
  return Array.from({ length: count }, (_, index) => {
    const sentence = daySentences[(index * 2) % daySentences.length];
    const dialogue = dayDialogues[index % dayDialogues.length];
    const type = types[index % types.length];
    return {
      id: `SPK_D${day.day}_${pad(index + 1, 2)}`,
      lesson_id: lessonId(day.day),
      type,
      prompt_en: speakingPrompt(type, day.scenario),
      model_answer: sentence.text,
      model_pinyin: sentence.pinyin,
      model_translation_en: sentence.translation_en,
      related_sentence_id: sentence.id,
      related_dialogue_id: dialogue.id
    };
  });
}

function buildReview(day) {
  return {
    id: `REV_D${day.day}`,
    lesson_id: lessonId(day.day),
    source_days: [day.day - 1, day.day - 3, day.day - 7, day.day - 14, day.day - 30].filter((item) => item >= 1),
    minimum_review_items: 30,
    review_sources: ["prior_1_day", "prior_3_days", "prior_7_days", "prior_14_days", "prior_30_days"],
    prompt_en: "Review older words by producing new sentences, not by reading passively."
  };
}

function buildAssessment(day, daySentences, dayDialogues) {
  return {
    id: `ASM_D${day.day}`,
    lesson_id: lessonId(day.day),
    day: day.day,
    title: day.unit,
    scenario: day.scenario,
    tasks: [
      {
        id: `ASM_D${day.day}_SPEAK`,
        type: "speaking",
        prompt_en: "Complete the full scenario aloud with follow-up questions.",
        minimum_turns: day.day === 45 ? 6 : 8,
        related_dialogue_ids: dayDialogues.map((item) => item.id)
      },
      {
        id: `ASM_D${day.day}_LISTEN`,
        type: "listening",
        prompt_en: "Listen to the model sentences and answer key-detail questions.",
        sentence_ids: daySentences.slice(0, 12).map((item) => item.id)
      },
      {
        id: `ASM_D${day.day}_WRITE`,
        type: "writing",
        prompt_en: "Write a short practical message using only known words."
      }
    ],
    pass_threshold: 0.8
  };
}

function parseSpec(spec, day) {
  const [char, pinyin, pinyinNumeric, pos, meaningEn, meaningKo, semanticDomain] = spec.split("|");
  return {
    id: "",
    char,
    pinyin,
    pinyin_numeric: pinyinNumeric,
    phonemes: pinyinNumeric.split(/\s+/).filter(Boolean),
    pos,
    meaning_en: meaningEn,
    meaning_ko: meaningKo,
    semantic_domain: semanticDomain,
    register: "neutral",
    taiwan_usage_note: `Introduced on Day ${day} for Taiwan daily-life communication.`
  };
}

function linkVocabExamples(dayVocab, daySentences) {
  for (const item of dayVocab) {
    item.example_ids = daySentences.filter((sentence) => sentence.token_ids?.includes(item.id)).slice(0, 4).map((sentence) => sentence.id);
  }
}

function linkGrammarExamples(dayGrammar, daySentences) {
  for (const item of dayGrammar) {
    const examples = daySentences.filter((sentence) => sentence.grammar_ids.includes(item.id)).slice(0, 8);
    item.example_ids = examples.slice(0, 4).map((sentence) => sentence.id);
    item.correct_examples = examples.map((sentence) => ({
      text: sentence.text,
      pinyin: sentence.pinyin,
      translation_en: sentence.translation_en
    }));
    item.drill_examples = examples.slice(0, 10).map((sentence) => ({
      text: sentence.text,
      pinyin: sentence.pinyin,
      translation_en: sentence.translation_en,
      translation_ko: sentence.translation_ko
    }));
  }
}

function turn(dialogueId, index, role, parts, translation) {
  const filtered = parts.filter(Boolean);
  return {
    id: `${dialogueId}_T${index}`,
    speaker: role,
    text: `${filtered.map((item) => item.char).join("")}${index === 2 || index === 4 ? "？" : "。"}`,
    pinyin: sentencePinyin(filtered, index === 2 || index === 4 ? "?" : "."),
    pinyin_numeric: sentenceNumeric(filtered),
    translation_en: translation,
    translation_ko: "대화 상황에 맞게 응답하세요.",
    token_ids: filtered.map((item) => item.id),
    audio_id: `AUD_${dialogueId}_T${index}`
  };
}

function grammarPattern(id, index) {
  if (id.includes("REQUEST") || id.includes("POLITE")) return "請 / 不好意思 + action + object";
  if (id.includes("YAO") || id.includes("WANT")) return "Subject + 想要 / 要 + object";
  if (id.includes("LOCATION") || id.includes("ZAI")) return "Subject + 在 + location";
  if (id.includes("REASON") || id.includes("YINWEI")) return "因為 + reason，所以 + result";
  if (id.includes("CHOICE") || id.includes("HAI_SHI")) return "Option A + 還是 + Option B";
  if (id.includes("ASSESSMENT") || id.includes("REVIEW")) return "Known pattern + new situation";
  return index % 2 === 0 ? "Subject + verb + object" : "Question word + known pattern";
}

function titleFromGrammarId(id) {
  return id
    .replace(/^GR_D\d+_/, "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function speakingPrompt(type, scenario) {
  const prompts = {
    repeat_after_model: "Repeat the model sentence with full phrase rhythm.",
    substitution_drill: "Swap one word and say the new sentence aloud.",
    answer_question: `Answer a question in this scenario: ${scenario}.`,
    roleplay_response: `Respond as one speaker in this scenario: ${scenario}.`,
    free_response: "Create your own sentence using only known words."
  };
  return prompts[type];
}

function known(chars) {
  return chars.map(knownOne).filter(Boolean);
}

function knownOne(char) {
  return allVocabByChar.get(char) ?? priorByChar.get(char);
}

function sentencePinyin(parts, end) {
  return `${parts.map((item) => item.pinyin).join(" ")}${end}`;
}

function sentenceNumeric(parts) {
  return parts.map((item) => item.pinyin_numeric).join(" ");
}

function cleanTranslation(value) {
  return value.replaceAll("to ", "").replaceAll("; ", " / ");
}

function audioItem(id, kind, refId, text, pinyinNumeric) {
  return {
    id,
    kind,
    ref_id: refId,
    text,
    pinyin_numeric: pinyinNumeric,
    path: `audio/${id}.mp3`,
    status: "placeholder"
  };
}

function writingItem(char, day) {
  return {
    char,
    strokes: ["Use the on-page animation or StrokeOrder link for exact order"],
    stroke_count: 0,
    radical: "see reference",
    difficulty: day >= 41 ? 3 : 2
  };
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function lessonId(day) {
  return `LESSON_D${day}`;
}

function phaseIdForDay(day) {
  if (day <= 45) return "PHASE_03";
  if (day <= 60) return "PHASE_04";
  if (day <= 75) return "PHASE_05";
  return "PHASE_06";
}

function pad(value, length) {
  return String(value).padStart(length, "0");
}

function isChinese(char) {
  return /[\u3400-\u9fff]/.test(char);
}
