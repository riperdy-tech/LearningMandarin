import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8")); }
  catch { return []; }
}

// Load prior vocab (simulate full script)
const v1 = readJson("mandarin_course/data/vocab_month1.json");
const v2 = readJson("mandarin_course/data/vocab_days31_45.json");
const priorChars = [...new Set([...v1, ...v2.filter(x => x.day_introduced < 31)].map(v => v.char))];
console.log("Prior chars count:", priorChars.length);

async function main() {
  console.log("Fetching with full prior vocab...");
  
  const systemPrompt = `You are a Chinese teacher. Reply ONLY with a JSON object: {"sentences":[{"text":"Chinese","pinyin":"pinyin","pinyin_numeric":"num","translation_en":"English","translation_ko":"Korean"}]}. Use ONLY these characters: ${priorChars.join(" ")}`;
  
  console.log("System prompt length:", systemPrompt.length);
  
  const r = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer sk-cadadb97e8cc4e39b3af03bcd903906f" },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate 3 simple cafe sentences." }
      ],
      max_tokens: 2000,
      thinking: { type: "disabled" },
      stream: false,
      temperature: 0
    }),
    signal: AbortSignal.timeout(60000)
  });
  
  const rawText = await r.text();
  console.log("Raw length:", rawText.length);
  fs.writeFileSync("scratch/medium_test_raw.txt", rawText, "utf8");
  
  const result = JSON.parse(rawText);
  const content = result.choices[0].message.content;
  
  console.log("\nContent first 200:", content.slice(0, 200));
  console.log("Content last 200:", content.slice(-200));
  
  // Check for corruption
  if (content.includes("\uFFFD")) {
    console.log("WARNING: Content has replacement chars!");
  }
  
  const parsed = JSON.parse(content);
  console.log("\nParsed:", parsed.sentences?.length, "sentences");
  
  for (const s of parsed.sentences || []) {
    console.log(`  ${s.text} → ${s.translation_en}`);
  }
}

main().catch(e => console.error("FAIL:", e.message));
