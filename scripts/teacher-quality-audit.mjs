import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const readJsonIfExists = (file) => {
  const fullPath = path.join(root, file);
  return fs.existsSync(fullPath) ? readJson(file) : [];
};

const sentences = [
  ...readJson("mandarin_course/data/sentences_month1.json"),
  ...readJson("mandarin_course/data/sentences_days31_45.json"),
  ...readJson("mandarin_course/data/sentences_days46_90.json")
];
const listening = [
  ...readJson("mandarin_course/data/listening_days31_45.json"),
  ...readJson("mandarin_course/data/listening_days46_90.json")
];
const lessons = [
  ...readJson("mandarin_course/lessons/lessons_month1.json"),
  ...readJson("mandarin_course/lessons/lessons_days31_45.json"),
  ...readJson("mandarin_course/lessons/lessons_days46_90.json")
];
const dialogues = [
  ...readJson("mandarin_course/data/dialogues_days31_45.json"),
  ...readJson("mandarin_course/data/dialogues_days46_90.json")
];
const grammar = [
  ...readJsonIfExists("mandarin_course/data/grammar_month1.json"),
  ...readJson("mandarin_course/data/grammar_days31_45.json"),
  ...readJson("mandarin_course/data/grammar_days46_90.json")
];
const speaking = [
  ...readJsonIfExists("mandarin_course/data/speaking_month1.json"),
  ...readJson("mandarin_course/data/speaking_days31_45.json"),
  ...readJson("mandarin_course/data/speaking_days46_90.json")
];
const vocab = [
  ...readJson("mandarin_course/data/vocab_month1.json"),
  ...readJson("mandarin_course/data/vocab_days31_45.json"),
  ...readJson("mandarin_course/data/vocab_days46_90.json")
];
const audioManifests = [
  ...readJson("mandarin_course/audio/manifest_month1.json"),
  ...readJson("mandarin_course/audio/manifest_days31_45.json"),
  ...readJson("mandarin_course/audio/manifest_days46_90.json")
];

const sentenceById = new Map(sentences.map((item) => [item.id, item]));
const errors = [];
const warnings = [];

function checkPinyinNumeric(item, label) {
  const numeric = item.pinyin_numeric;
  if (typeof numeric !== "string") return;
  if (/[^\x00-\x7F]/.test(numeric)) {
    errors.push(`${label}: non-ASCII pinyin_numeric "${numeric}"`);
  }
  if (/[A-Za-z][?][A-Za-z0-9]/.test(numeric) || /[0-9][?][A-Za-z0-9]/.test(numeric)) {
    errors.push(`${label}: corrupted pinyin_numeric "${numeric}"`);
  }
}

function checkEnglishGloss(item, label) {
  const gloss = item.translation_en ?? item.model_translation_en ?? item.answer_en ?? item.free_response_prompt;
  if (typeof gloss !== "string") return;
  if (/\b(no spicy|one beef noodles|one beef noodle soup|bubble milk tea|less ice|with no spice)\b/i.test(gloss)) {
    errors.push(`${label}: awkward English gloss "${gloss}"`);
  }
  if (/\bvery delicious\b|\bwater leakage situation\b|\bmy nose is allergic\b|\bbody is very hot\b/i.test(gloss)) {
    errors.push(`${label}: literal English gloss "${gloss}"`);
  }
}

function checkNestedEnglish(value, label) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkNestedEnglish(item, `${label}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;

  checkEnglishGloss(value, value.id ? `${label}:${value.id}` : label);
  for (const [key, child] of Object.entries(value)) {
    if (child && typeof child === "object") {
      checkNestedEnglish(child, `${label}.${key}`);
    }
  }
}

const bannedListeningPatterns = [
  "\u6211\u9700\u8981\u4e86", // 我需要了
  "\u4f60\u9700\u8981\u4e86\u55ce", // 你需要了嗎
  "\u4ed6\u6b63\u5728\u9700\u8981", // 他正在需要
  "\u6628\u5929\u6211\u9700\u8981\u4e86", // 昨天我需要了
  "\u6211\u559c\u6b61\u4e86", // 我喜歡了
  "\u4f60\u559c\u6b61\u4e86\u55ce", // 你喜歡了嗎
  "\u4ed6\u6b63\u5728\u559c\u6b61", // 他正在喜歡
  "\u6628\u5929\u6211\u559c\u6b61\u4e86", // 昨天我喜歡了
  "\u4ed6\u6b63\u5728\u53bb", // 他正在去
  "\u4ed6\u6b63\u5728\u60f3", // 他正在想
  "\u4f60\u6703\u6709\u55ce", // 你會有嗎
  "\u53ef\u4ee5\u6709\u55ce", // 可以有嗎
  "\u53ef\u4ee5\u559c\u6b61\u55ce" // 可以喜歡嗎
];

for (const item of listening) {
  checkPinyinNumeric(item, item.id);
  checkEnglishGloss(item, item.id);

  for (const pattern of bannedListeningPatterns) {
    if (item.text?.includes(pattern)) {
      errors.push(`${item.id}: unnatural listening pattern "${pattern}" in "${item.text}"`);
    }
  }

  const sentence = sentenceById.get(item.sentence_id);
  if (sentence && ["sentence", "short_dialogue"].includes(item.type) && item.text !== sentence.text) {
    errors.push(`${item.id}: ${item.type} text does not match referenced ${item.sentence_id}`);
  }
}

const listeningByDay = new Map();
for (const item of listening) {
  const day = Number(item.id?.match(/D(\d+)/)?.[1] ?? 0);
  if (!day) continue;
  if (!listeningByDay.has(day)) listeningByDay.set(day, []);
  listeningByDay.get(day).push(item);
}
for (const [day, dayItems] of [...listeningByDay.entries()].sort((a, b) => a[0] - b[0])) {
  const counts = new Map();
  for (const item of dayItems) {
    const text = item.text?.trim();
    if (!text) continue;
    counts.set(text, (counts.get(text) ?? 0) + 1);
  }
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1);
  if (duplicates.length) {
    errors.push(`Day ${day}: duplicate listening prompts: ${duplicates.map(([text, count]) => `"${text}" x${count}`).join("; ")}`);
  }
}

for (const sentence of sentences) {
  checkPinyinNumeric(sentence, sentence.id);
  checkEnglishGloss(sentence, sentence.id);
}

for (const word of vocab) {
  checkPinyinNumeric(word, word.id);
  checkEnglishGloss(word, word.id);
}

for (const audio of audioManifests) {
  checkPinyinNumeric(audio, `${audio.kind}:${audio.ref_id}`);
  checkEnglishGloss(audio, `${audio.kind}:${audio.ref_id}`);
}

checkNestedEnglish(grammar, "grammar");
checkNestedEnglish(speaking, "speaking");

for (const grammarPoint of grammar) {
  const day = Number(grammarPoint.id?.match(/D(\d+)/)?.[1] ?? 0);
  if (day < 46 || day > 90) continue;
  if ((grammarPoint.common_error_patterns ?? []).length < 3) {
    errors.push(`${grammarPoint.id}: needs at least 3 common_error_patterns`);
  }
  const feedback = grammarPoint.repair_feedback ?? {};
  for (const key of ["word_order", "meaning", "practice"]) {
    if (typeof feedback[key] !== "string" || feedback[key].trim().length < 12) {
      errors.push(`${grammarPoint.id}: missing repair_feedback.${key}`);
    }
  }
}

const sourceOrderJumps = [];
for (let i = 1; i < lessons.length; i++) {
  if (lessons[i].order !== lessons[i - 1].order + 1) {
    sourceOrderJumps.push(`${lessons[i - 1].order}->${lessons[i].order}`);
  }
}
if (sourceOrderJumps.length) {
  errors.push(`lesson source order jumps: ${sourceOrderJumps.join(", ")}`);
}

const sentencesByDay = new Map();
for (const sentence of sentences) {
  const day = Number(sentence.id.match(/D(\d+)_/)?.[1]);
  if (!day) continue;
  if (!sentencesByDay.has(day)) sentencesByDay.set(day, []);
  sentencesByDay.get(day).push(sentence);
}
for (const [day, daySentences] of [...sentencesByDay.entries()].sort((a, b) => a[0] - b[0])) {
  const duplicateCount = daySentences.length - new Set(daySentences.map((item) => item.text)).size;
  if (duplicateCount > 10) {
    warnings.push(`Day ${day}: ${duplicateCount} duplicate sentence records; schedule for dedupe pass`);
  }
}

for (const dialogue of dialogues) {
  for (const turn of dialogue.turns ?? []) {
    checkPinyinNumeric(turn, `${dialogue.id}/${turn.id}`);
    checkEnglishGloss(turn, `${dialogue.id}/${turn.id}`);
    if (
      turn.speaker === "\u5e97\u54e1" && // 店員
      /(\u53ef\u4ee5\u5237\u5361\u55ce|\u6211\u5237\u5361|\u6211\u7528\u4fe1\u7528\u5361)/.test(turn.text ?? "")
    ) {
      errors.push(`${dialogue.id}/${turn.id}: likely clerk/customer role mismatch in "${turn.text}"`);
    }
    if (/one beef noodles|no spicy/i.test(turn.translation_en ?? "")) {
      warnings.push(`${dialogue.id}/${turn.id}: awkward English translation "${turn.translation_en}"`);
    }
  }
}

console.log("TEACHER QUALITY AUDIT");
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (warnings.length) {
  console.log("\nWarnings:");
  for (const warning of warnings) console.log(`  - ${warning}`);
}

if (errors.length) {
  console.log("\nErrors:");
  for (const error of errors) console.log(`  - ${error}`);
  process.exit(1);
}

console.log("\nTeacher-quality hard checks passed.");
