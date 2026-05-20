import fs from "node:fs";

const files = fs.readdirSync("scratch").filter(f => f.endsWith(".json")).sort();
console.log("Total files:", files.length);

for (const f of files.slice(-3)) {
  const d = JSON.parse(fs.readFileSync("scratch/" + f, "utf8"));
  const c = d.content || "";
  console.log("\n=== " + f + " ===");
  console.log("Content length:", c.length);
  console.log("Has ```:", c.includes("```"));
  
  // Check for garbled characters (non-printable, non-Unicode CJK/Korean)
  const garbled = [];
  for (let i = 0; i < c.length; i++) {
    const cp = c.codePointAt(i);
    if (cp > 0xFFFF) { i++; continue; } // skip surrogate pairs
    // Check if it's a valid printable character or common Unicode
    if (cp < 0x20 && cp !== 0x0A && cp !== 0x0D) {
      garbled.push({pos: i, cp: cp.toString(16)});
    }
  }
  console.log("Control chars (non-newline):", garbled.length);
  if (garbled.length > 0) console.log("First few:", garbled.slice(0, 5));
  
  // Try to parse as JSON
  try {
    JSON.parse(c);
    console.log("JSON: VALID");
  } catch(e) {
    console.log("JSON: INVALID -", e.message.slice(0, 100));
    console.log("Around error position:", c.slice(Math.max(0, e.message.match(/position (\d+)/)?.[1] - 50), 50 + Number(e.message.match(/position (\d+)/)?.[1] || 0)));
  }
  
  console.log("First 200:", c.slice(0, 200));
  console.log("Last 200:", c.slice(-200));
}
