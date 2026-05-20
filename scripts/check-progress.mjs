import fs from "node:fs";
const s = JSON.parse(fs.readFileSync("mandarin_course/data/sentences_days31_45.json", "utf8"));
for (let d = 33; d <= 45; d++) {
  const c = s.filter(x => x.id && x.id.startsWith("SEN_D" + d));
  const sample = c[0]?.text?.slice(0, 50) || "NONE";
  const hasTokens = c[0]?.token_ids?.length > 0;
  console.log(`Day ${d}: ${c.length} sentences, token_ids=${hasTokens}, sample="${sample}"`);
}
