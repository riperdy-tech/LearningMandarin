#!/usr/bin/env node
/**
 * Batch runner — generates multiple days using the DeepSeek LLM pipeline.
 * Usage: node scripts/batch-generate.mjs 32 45
 *        node scripts/batch-generate.mjs 32 90
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCRIPT = path.join(ROOT, "scripts", "generate-llm-course.mjs");

const args = process.argv.slice(2);
const startDay = parseInt(args[0]) || 32;
const endDay = parseInt(args[1]) || 45;

console.log(`🚀 Batch generating Days ${startDay}–${endDay}`);
console.log(`   Script: ${SCRIPT}`);
console.log(`   Total: ${endDay - startDay + 1} days\n`);

let completed = 0;
let failed = 0;

async function runDay(day) {
  return new Promise((resolve) => {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`📅 Day ${day} — STARTING`);
    console.log(`${"=".repeat(50)}`);

    const child = spawn("node", [SCRIPT, "--day", String(day)], {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env },
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ Day ${day} — COMPLETED`);
        completed++;
      } else {
        console.log(`❌ Day ${day} — FAILED (exit ${code})`);
        failed++;
      }
      resolve();
    });

    child.on("error", (err) => {
      console.error(`❌ Day ${day} — ERROR: ${err.message}`);
      failed++;
      resolve();
    });
  });
}

async function main() {
  for (let day = startDay; day <= endDay; day++) {
    await runDay(day);
    // Rate limit: wait 5s between days
    if (day < endDay) {
      console.log(`\n⏳ Cooling down 5s before Day ${day + 1}...`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`🏁 BATCH COMPLETE`);
  console.log(`   Completed: ${completed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`${"=".repeat(50)}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
