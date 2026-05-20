import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// Load existing vocab (same as script does)
function readJson(relPath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
  } catch (e) {
    return [];
  }
}

const vocabMonth1 = readJson("mandarin_course/data/vocab_month1.json");
const vocab31_45 = readJson("mandarin_course/data/vocab_days31_45.json");
const vocab46_90 = readJson("mandarin_course/data/vocab_days46_90.json");

const allPriorVocab = [];
const seenChars = new Set();
for (const item of vocabMonth1) {
  if (!seenChars.has(item.char)) { seenChars.add(item.char); allPriorVocab.push(item); }
}
for (const item of vocab31_45) {
  if (item.day_introduced < 31 && !seenChars.has(item.char)) { seenChars.add(item.char); allPriorVocab.push(item); }
}
const todayVocab = vocab31_45.filter(item => item.day_introduced === 31);
const cumulativeVocab = [...allPriorVocab, ...todayVocab];
const vocabEntries = [...cumulativeVocab].sort((a, b) => b.char.length - a.char.length);

function tokenizeText(text) {
  let index = 0;
  const tokenIds = [];
  const unknownChars = [];
  while (index < text.length) {
    const char = text[index];
    if (!/[\u3400-\u9fff]/.test(char)) {
      index += 1;
      continue;
    }
    const match = vocabEntries.find(item => text.startsWith(item.char, index));
    if (match) {
      tokenIds.push(match.id);
      index += match.char.length;
    } else {
      unknownChars.push(char);
      index += 1;
    }
  }
  return { tokenIds, unknownChars };
}

// Load latest sentence response from scratch
const files = fs.readdirSync("scratch").filter(f => f.endsWith(".json") && f.includes("raw_response")).sort();
const lastFile = files[files.length - 1];
console.log("Testing:", lastFile);
const raw = JSON.parse(fs.readFileSync("scratch/" + lastFile, "utf8"));
const content = raw.content;

// Parse JSON
let parsed;
try {
  parsed = JSON.parse(content);
} catch(e) {
  console.error("JSON parse failed:", e.message);
  console.error("Content around error:", content.slice(0, 500));
  process.exit(1);
}

if (!parsed.sentences) {
  console.log("No sentences in response. Keys:", Object.keys(parsed));
  process.exit(1);
}

console.log(`Parsed ${parsed.sentences.length} sentences.`);
console.log("First sentence:", parsed.sentences[0].text);

// Tokenize each
let allOk = true;
for (let i = 0; i < parsed.sentences.length; i++) {
  const s = parsed.sentences[i];
  const { unknownChars } = tokenizeText(s.text);
  if (unknownChars.length > 0) {
    console.log(`  Sentence ${i}: "${s.text}" has unknown chars:`, unknownChars);
    allOk = false;
  }
}

if (allOk) {
  console.log("All sentences pass tokenizer!");
} else {
  console.log("SOME FAILED - but raw JSON was clean, so tokenizer has issues with vocab matching");
  // Show which chars in first sentence failed
  const s = parsed.sentences[0];
  console.log("First sentence chars:", [...s.text].map(c => `${c}(${c.codePointAt(0).toString(16)})`).join(" "));
}
