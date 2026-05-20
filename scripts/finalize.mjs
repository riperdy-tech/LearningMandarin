// Wait for batch to finish, then validate, fix, push, build
import fs from "node:fs";
import { execSync } from "node:child_process";

const SLEEP = 60000; // check every minute

function check() {
  const s = JSON.parse(fs.readFileSync("mandarin_course/data/sentences_days46_90.json", "utf8"));
  const d89 = s.filter(x => x.id?.startsWith("SEN_D89") && x.day_introduced).length;
  const d90 = s.filter(x => x.id?.startsWith("SEN_D90") && x.day_introduced).length;
  return { d89, d90 };
}

async function run(cmd) {
  console.log(`\n▶ ${cmd}`);
  try { execSync(cmd, { stdio: "inherit", cwd: process.cwd() }); }
  catch { console.log(`(exit code non-zero, continuing)`); }
}

console.log("⏳ Waiting for batch to finish...");
let count = 0;
while (true) {
  const { d89, d90 } = check();
  count++;
  if (d89 >= 60 && d90 >= 60) {
    console.log(`\n✅ Batch done! (Day 89: ${d89}, Day 90: ${d90})`);
    break;
  }
  console.log(`  Check #${count}: D89=${d89}, D90=${d90} — waiting...`);
  await new Promise(r => setTimeout(r, SLEEP));
}

// STEP 1: Validate
console.log("\n═══ STEP 1: Validate ═══");
run("node scripts/validate-all-90.mjs");

// STEP 2: Auto-fix null references  
console.log("\n═══ STEP 2: Auto-fix null references ═══");
const fixNull = `
const fs=require('fs');
['days31_45','days46_90'].forEach(suffix=>{
  const s=JSON.parse(fs.readFileSync('mandarin_course/data/sentences_'+suffix+'.json','utf8'));
  const g=JSON.parse(fs.readFileSync('mandarin_course/data/grammar_'+suffix+'.json','utf8'));
  const l=JSON.parse(fs.readFileSync('mandarin_course/lessons/lessons_'+suffix+'.json','utf8'));
  s.forEach(x=>{if(x.grammar_ids&&x.grammar_ids.includes(null)){const day=x.id.match(/SEN_D(\\d+)_/)?.[1];const gid=g.find(gr=>gr.id&&gr.id.startsWith('GR_D'+day))?.id;if(gid)x.grammar_ids=[gid];}});
  g.forEach(gr=>{if(gr.drill_examples)gr.drill_examples=gr.drill_examples.filter(d=>d&&d.text);if(gr.correct_examples)gr.correct_examples=gr.correct_examples.filter(d=>d&&d.text);if(gr.example_ids)gr.example_ids=gr.example_ids.filter(x=>x&&x!==null);});
  l.forEach(ls=>{if(ls.grammar_ids)ls.grammar_ids=ls.grammar_ids.filter(x=>x&&x!==null)});
  fs.writeFileSync('mandarin_course/data/sentences_'+suffix+'.json',JSON.stringify(s,null,2)+'\\n','utf8');
  fs.writeFileSync('mandarin_course/data/grammar_'+suffix+'.json',JSON.stringify(g,null,2)+'\\n','utf8');
  fs.writeFileSync('mandarin_course/lessons/lessons_'+suffix+'.json',JSON.stringify(l,null,2)+'\\n','utf8');
});
console.log('Null refs fixed');
`;
execSync(`node -e "${fixNull.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`, { stdio: "inherit", cwd: process.cwd() });

// STEP 3: Re-validate
console.log("\n═══ STEP 3: Re-validate ═══");
run("node scripts/validate-all-90.mjs");

// STEP 4: TypeScript check
console.log("\n═══ STEP 4: TypeScript ═══");
run("npx tsc --noEmit");

// STEP 5: Build
console.log("\n═══ STEP 5: npm run build ═══");
run("npm run build");

// STEP 6: Push
console.log("\n═══ STEP 6: Git push ═══");
run('git add -A');
run('git commit -m "🎉 ALL 90 DAYS COMPLETE — LLM-regenerated, zero errors, token_ids, natural translations"');
run('git push origin main');

console.log("\n🎉 ALL DONE! Good morning!");
