import fs from "node:fs";

const v = JSON.parse(fs.readFileSync("mandarin_course/data/vocab_days46_90.json", "utf8"));

// Unique Korean words ending in 다
const daWords = [...new Set(v.map(x => x.meaning_ko).filter(k => k.endsWith("다") && !/(요|니다|니까|세요|ㅂ시다)$/.test(k)))];

console.log("Unique dict-form Korean words:", daWords.length);

// 하다 verbs
const hada = daWords.filter(k => k.endsWith("하다"));
console.log("하다 verbs:", hada.length);

// Other patterns
const other = daWords.filter(k => !k.endsWith("하다"));
console.log("Other patterns:", other.length);
console.log("Other samples:", other.slice(0, 60));

// Check multi-word Korean
const multiword = daWords.filter(k => k.includes(" "));
console.log("\nMulti-word:", multiword.length);
console.log("Multi-word samples:", multiword.slice(0, 20));
