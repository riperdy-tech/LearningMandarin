import fs from "node:fs";

// Minimal test
async function main() {
  console.log("Fetching sentences from DeepSeek...");
  
  const r = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer sk-cadadb97e8cc4e39b3af03bcd903906f" },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: "You are a Chinese teacher. Reply ONLY with a JSON object: {\"sentences\":[{\"text\":\"traditional Chinese\",\"pinyin\":\"pinyin\",\"pinyin_numeric\":\"tone numbers\",\"translation_en\":\"English\",\"translation_ko\":\"Korean\"}]}. Use ONLY these characters: 你我他想在可以要喝吃去來好大小杯水茶咖啡謝謝嗎" },
        { role: "user", content: "Generate 3 simple cafe sentences." }
      ],
      max_tokens: 1000,
      thinking: { type: "disabled" },
      stream: false,
      temperature: 0
    }),
    signal: AbortSignal.timeout(60000)
  });
  
  const rawText = await r.text();
  console.log("Raw response length:", rawText.length);
  console.log("Raw first 300:", rawText.slice(0, 300));
  
  // Save raw
  fs.writeFileSync("scratch/minimal_test_raw.txt", rawText, "utf8");
  
  const result = JSON.parse(rawText);
  const content = result.choices[0].message.content;
  console.log("\nContent:");
  console.log(content);
  
  // Parse JSON
  const parsed = JSON.parse(content);
  console.log("\nParsed sentences:", parsed.sentences?.length);
  
  if (parsed.sentences) {
    for (const s of parsed.sentences) {
      console.log(`\n  Text: ${s.text}`);
      console.log(`  Pinyin: ${s.pinyin}`);
      console.log(`  EN: ${s.translation_en}`);
      console.log(`  KO: ${s.translation_ko}`);
      
      // Check each char
      const chars = [...s.text];
      console.log(`  Chars:`, chars.map(c => `${c}(U+${c.codePointAt(0).toString(16).toUpperCase()})`).join(" "));
    }
  }
}

main().catch(e => console.error("FAIL:", e.message, e.stack));
