import fs from "node:fs";

const s = JSON.parse(fs.readFileSync("mandarin_course/data/sentences_days46_90.json", "utf8"));

const issues = [];

for (const sent of s) {
  const en = sent.translation_en;
  // Modal doubling: Can you will/can/must/should?
  if (/Can (you|I|he|she|we|they) (will|can|must|should|may|would|could)\b/i.test(en))
    issues.push({ id: sent.id, en, issue: "modal-double" });
  // Did you + modal
  if (/Did you (will|can|must|should|may|would|could)\b/i.test(en))
    issues.push({ id: sent.id, en, issue: "modal-double" });
  // Negative in question
  if (/(Did|Can|Do|Does|Is|Are|Will|Would) (you|I|he|she|we|they) (don|do not|cannot|not|no|never)\b/i.test(en))
    issues.push({ id: sent.id, en, issue: "neg-in-q" });
  // Adverb as verb: I alsoed, I alreadyed, etc.
  if (/\b(alsoed|alreadyed|justed|stilled|againned|onlyed|almosted|veryed|tooed)\b/i.test(en))
    issues.push({ id: sent.id, en, issue: "adv-as-verb" });
  // "He alsos" etc
  if (/\b(alsos|alreadys|justs|stills|agains|onlys|almosts)\b/i.test(en))
    issues.push({ id: sent.id, en, issue: "adv-as-verb" });
}

console.log("Issues found:", issues.length);
if (issues.length > 0) {
  const byType = {};
  issues.forEach(i => { byType[i.issue] = (byType[i.issue] || 0) + 1; });
  console.log("By type:", JSON.stringify(byType));
  issues.slice(0, 20).forEach(i => console.log(" ", i.id, "[" + i.issue + "]:", i.en));
} else {
  console.log("CLEAN! No unnatural patterns.");
}

// Random 15
console.log("\n--- Random 15 ---");
for (let i = 0; i < 15; i++) {
  const r = s[Math.floor(Math.random() * s.length)];
  console.log(r.id + ":", r.translation_en);
}
