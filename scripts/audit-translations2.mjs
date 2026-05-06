import fs from "node:fs";

const v = JSON.parse(fs.readFileSync("mandarin_course/data/vocab_days46_90.json", "utf8"));
const s = JSON.parse(fs.readFileSync("mandarin_course/data/sentences_days46_90.json", "utf8"));

console.log("=== VOCAB KOREAN samples ===");
const samples = [...new Set(v.map(x => x.meaning_ko))].slice(0, 40);
console.log(samples);

const endsInDa = v.filter(x => x.meaning_ko.endsWith("다"));
console.log("\nEnds in 다:", endsInDa.length, "/", v.length);
console.log("Samples:", endsInDa.slice(0, 15).map(x => x.meaning_ko));

const endsInYo = v.filter(x => x.meaning_ko.endsWith("요"));
console.log("\nEnds in 요:", endsInYo.length, "/", v.length);

console.log("\n=== SENTENCE KOREAN samples ===");
const kset = [...new Set(s.map(x => x.translation_ko))].slice(0, 40);
console.log(kset);

console.log("\n=== SENTENCE ENGLISH bad samples ===");
const bad = s.filter(x => /\bto\s+\w+ing\b|is\s+\w+\s+to\s|have\s+\w+\s+to\s/.test(x.translation_en));
console.log("Count:", bad.length);
console.log("Samples:", bad.slice(0, 20).map(x => x.translation_en));
