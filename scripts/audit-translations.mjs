import fs from "node:fs";

const v = JSON.parse(fs.readFileSync("mandarin_course/data/vocab_days46_90.json", "utf8"));
const s = JSON.parse(fs.readFileSync("mandarin_course/data/sentences_days46_90.json", "utf8"));

// English "to " prefix
const toEn = v.filter(x => /^to\s/.test(x.meaning_en));
console.log("=== VOCAB ENGLISH 'to' prefix ===");
console.log("Count:", toEn.length, "/", v.length);
console.log("Samples:", toEn.slice(0, 15).map(x => x.meaning_en));

// Korean dictionary form (ends with 다, not 요/니다/까/세요)
const dictKo = v.filter(x => /다$/.test(x.meaning_ko) && !/[요니다까세요]/.test(x.meaning_ko.slice(-2)));
console.log("\n=== VOCAB KOREAN dict-form ===");
console.log("Count:", dictKo.length, "/", v.length);
console.log("Samples:", dictKo.slice(0, 15).map(x => x.meaning_ko));

// English "to " in sentences
const toSentEn = s.filter(x => /\bto\s+\w/.test(x.translation_en));
console.log("\n=== SENTENCE ENGLISH with 'to' ===");
console.log("Count:", toSentEn.length, "/", s.length);
console.log("Samples:", toSentEn.slice(0, 10).map(x => x.translation_en));

// Korean dict-form in sentences
const dictSentKo = s.filter(x => /다$/.test(x.translation_ko) && !/[요니다까세요]/.test(x.translation_ko.slice(-2)));
console.log("\n=== SENTENCE KOREAN dict-form ===");
console.log("Count:", dictSentKo.length, "/", s.length);
console.log("Samples:", dictSentKo.slice(0, 10).map(x => x.translation_ko));

// Check if Korean sentences are just placeholder
const placeholder = s.filter(x => x.translation_ko === "문맥에 맞게 중국어 문장을 말해 보세요.");
console.log("\n=== SENTENCE KOREAN placeholder ===");
console.log("Count:", placeholder.length, "/", s.length);
