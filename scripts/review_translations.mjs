#!/usr/bin/env node
/**
 * Batch-review English + Korean translations of Taiwan Mandarin course content.
 *
 * Iterates items from a target dataset, asks DeepSeek to flag awkward/wrong
 * translations and emit fixes. Idempotent + resumable via a cache keyed by
 * item-id + content-hash. Writes corrections back to the source JSON only
 * after a successful batch.
 *
 * Usage:
 *   $env:DEEPSEEK_API_KEY = "sk-..."
 *   node scripts/review_translations.mjs --target sentences --limit 300
 *   node scripts/review_translations.mjs --target all
 *
 * Targets:
 *   sentences | dialogues | listening | speaking | grammar | all
 *
 * Outputs:
 *   - Source JSON files updated in place when fixes are accepted
 *   - scratch/translation_review_cache.json (resume state)
 *   - scratch/translation_review_log.jsonl (every change with before/after)
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const REPO = path.resolve(ROOT, "..");
const DATA = path.join(REPO, "mandarin_course", "data");
const SCRATCH = path.join(REPO, "scratch");
fs.mkdirSync(SCRATCH, { recursive: true });

const CACHE_PATH = path.join(SCRATCH, "translation_review_cache.json");
const LOG_PATH = path.join(SCRATCH, "translation_review_log.jsonl");

const API_KEY = process.env.DEEPSEEK_API_KEY;
if (!API_KEY) {
  console.error("Set DEEPSEEK_API_KEY env var.");
  process.exit(1);
}
const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-v4-flash";
const BATCH = 15;
const MAX_TOKENS = 8000;

const ARGS = parseArgs(process.argv.slice(2));

const SYSTEM_PROMPT = `You review English + Korean translations of Taiwan-Mandarin sentences.

ONLY flag clear problems. Do NOT rewrite acceptable translations to match your style preferences.
A fix is justified when at least one of these is true:
- Outright grammar error (wrong particle, wrong tense, wrong word form, ungrammatical word order).
- Non-standard Korean form (e.g. 바래요 instead of 바라요, 바램 instead of 바람).
- Meaning is wrong, missing, or added compared to the Chinese source.
- English is so literal/calqued that it would confuse a native speaker (e.g. "We rest every noon", "his ability is very good").
- Register clearly mismatches the Chinese source (formal Chinese given casual Korean, etc).

DO NOT change:
- Sentences that are correct but you'd phrase differently.
- Word choice alternatives that are also correct ("seeing patients" vs "open").
- Optional politeness markers that are also acceptable.
- Indicative vs hortative mood (declarative Chinese stays declarative; do not turn "We put X" into "Let's put X").

Preserve the original sentence mood and information. Keep names, places, numbers exact.

Output ONLY a JSON object: {"fixes":[{"id":"<item id>","en":"<corrected English>|null","ko":"<corrected Korean>|null","reason":"<short why>"}]}
- Use null when that language doesn't need a change.
- OMIT items where neither EN nor KO needs change. Do not include "both are fine" entries.
- No prose outside the JSON.`;

async function callLLM(items) {
  const payload = items.map((it) => ({
    id: it.id,
    zh: it.text,
    en: it.translation_en,
    ko: it.translation_ko,
  }));
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ items: payload }) },
    ],
    max_tokens: MAX_TOKENS,
    temperature: 0,
    thinking: { type: "disabled" },
    stream: false,
    response_format: { type: "json_object" },
  };
  const r = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });
  if (!r.ok) {
    throw new Error(`HTTP ${r.status}: ${await r.text()}`);
  }
  const j = await r.json();
  const content = j.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response: " + JSON.stringify(j).slice(0, 300));
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error("Bad JSON: " + content.slice(0, 300));
  }
  return parsed.fixes ?? [];
}

function hashItem(it) {
  return crypto
    .createHash("sha1")
    .update((it.text ?? "") + "|" + (it.translation_en ?? "") + "|" + (it.translation_ko ?? ""))
    .digest("hex")
    .slice(0, 12);
}

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return {};
  return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
}
function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache), "utf8");
}
function appendLog(entry) {
  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + "\n", "utf8");
}

/**
 * Adapters per target: pull a flat array of {id, text, translation_en, translation_ko}
 * from a source JSON, and write back fixes via id.
 */
const TARGETS = {
  sentences: {
    files: ["sentences_month1.json", "sentences_days31_45.json", "sentences_days46_90.json"],
    extract: (arr) => arr.map((s) => ({
      id: s.id, text: s.text,
      translation_en: s.translation_en, translation_ko: s.translation_ko,
    })),
    apply: (arr, fix) => {
      const t = arr.find((s) => s.id === fix.id);
      if (!t) return false;
      if (fix.en) t.translation_en = fix.en;
      if (fix.ko) t.translation_ko = fix.ko;
      return true;
    },
  },
  listening: {
    files: ["listening_days31_45.json", "listening_days46_90.json"],
    extract: (arr) => arr.map((s) => ({
      id: s.id, text: s.text,
      translation_en: s.translation_en, translation_ko: s.translation_ko,
    })),
    apply: (arr, fix) => {
      const t = arr.find((s) => s.id === fix.id);
      if (!t) return false;
      if (fix.en) t.translation_en = fix.en;
      if (fix.ko) t.translation_ko = fix.ko;
      return true;
    },
  },
  speaking: {
    files: ["speaking_days31_45.json", "speaking_days46_90.json"],
    extract: (arr) => arr.map((s) => ({
      id: s.id, text: s.model_answer,
      translation_en: s.model_translation_en, translation_ko: s.model_translation_ko,
    })),
    apply: (arr, fix) => {
      const t = arr.find((s) => s.id === fix.id);
      if (!t) return false;
      if (fix.en) t.model_translation_en = fix.en;
      if (fix.ko) t.model_translation_ko = fix.ko;
      return true;
    },
  },
  dialogues: {
    files: ["dialogues_days31_45.json", "dialogues_days46_90.json"],
    extract: (arr) => {
      const out = [];
      for (const d of arr) {
        for (const t of d.turns) {
          out.push({
            id: `${d.id}::${t.id}`,
            text: t.text,
            translation_en: t.translation_en,
            translation_ko: t.translation_ko,
          });
        }
      }
      return out;
    },
    apply: (arr, fix) => {
      const [did, tid] = fix.id.split("::");
      const d = arr.find((x) => x.id === did);
      if (!d) return false;
      const turn = d.turns.find((x) => x.id === tid);
      if (!turn) return false;
      if (fix.en) turn.translation_en = fix.en;
      if (fix.ko) turn.translation_ko = fix.ko;
      return true;
    },
  },
  grammar: {
    files: ["grammar_month1.json", "grammar_days31_45.json", "grammar_days46_90.json"],
    extract: (arr) => {
      const out = [];
      for (const g of arr) {
        for (let i = 0; i < (g.drill_examples ?? []).length; i++) {
          const ex = g.drill_examples[i];
          out.push({
            id: `${g.id}::drill::${i}`,
            text: ex.text,
            translation_en: ex.translation_en,
            translation_ko: ex.translation_ko,
          });
        }
      }
      return out;
    },
    apply: (arr, fix) => {
      const [gid, , idx] = fix.id.split("::");
      const g = arr.find((x) => x.id === gid);
      if (!g) return false;
      const ex = g.drill_examples?.[Number(idx)];
      if (!ex) return false;
      if (fix.en) ex.translation_en = fix.en;
      if (fix.ko) ex.translation_ko = fix.ko;
      return true;
    },
  },
};

async function runTarget(name, opts) {
  const cfg = TARGETS[name];
  if (!cfg) throw new Error("Unknown target: " + name);
  const cache = loadCache();
  let totalFixed = 0;
  let totalSeen = 0;
  for (const fname of cfg.files) {
    const fp = path.join(DATA, fname);
    const arr = JSON.parse(fs.readFileSync(fp, "utf8"));
    const items = cfg.extract(arr);

    let pool = items;
    if (opts.limit) {
      // deterministic sample across the file
      const step = Math.max(1, Math.floor(items.length / opts.limit));
      pool = [];
      for (let i = 0; i < items.length && pool.length < opts.limit; i += step) pool.push(items[i]);
    }
    // Skip items already reviewed at this content-hash
    const todo = pool.filter((it) => {
      const key = `${name}|${it.id}`;
      return cache[key] !== hashItem(it);
    });
    console.log(`[${name}/${fname}] ${todo.length} todo (of ${pool.length} candidate / ${items.length} total)`);

    let dirty = false;
    for (let i = 0; i < todo.length; i += BATCH) {
      const slice = todo.slice(i, i + BATCH);
      process.stdout.write(`  batch ${i / BATCH + 1}/${Math.ceil(todo.length / BATCH)} ... `);
      let fixes;
      try {
        fixes = await callLLM(slice);
      } catch (e) {
        console.log("ERR " + e.message.slice(0, 120));
        continue;
      }
      let batchFixed = 0;
      for (const fix of fixes) {
        const before = items.find((x) => x.id === fix.id);
        if (!before) continue;
        const beforeEn = before.translation_en;
        const beforeKo = before.translation_ko;
        // skip no-op fixes
        const enChanged = fix.en && fix.en !== beforeEn;
        const koChanged = fix.ko && fix.ko !== beforeKo;
        if (!enChanged && !koChanged) continue;
        if (!enChanged) fix.en = null;
        if (!koChanged) fix.ko = null;
        if (cfg.apply(arr, fix)) {
          appendLog({ target: name, file: fname, id: fix.id, zh: before.text,
            before: { en: beforeEn, ko: beforeKo },
            after: { en: fix.en ?? beforeEn, ko: fix.ko ?? beforeKo },
            reason: fix.reason });
          batchFixed++;
          dirty = true;
        }
      }
      // mark all items in this batch reviewed at this hash (so resume skips them)
      for (const it of slice) {
        cache[`${name}|${it.id}`] = hashItem(it);
      }
      totalFixed += batchFixed;
      totalSeen += slice.length;
      console.log(`fixed ${batchFixed}/${slice.length}`);
      saveCache(cache);
    }
    if (dirty) {
      fs.writeFileSync(fp, JSON.stringify(arr, null, 2) + "\n", "utf8");
    }
  }
  console.log(`[${name}] DONE: ${totalFixed} fixes across ${totalSeen} reviewed items`);
  return { fixed: totalFixed, seen: totalSeen };
}

function parseArgs(argv) {
  const out = { target: "sentences", limit: 0 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--target") out.target = argv[++i];
    else if (argv[i] === "--limit") out.limit = parseInt(argv[++i], 10);
    else if (argv[i] === "--reset") out.reset = true;
  }
  return out;
}

async function main() {
  if (ARGS.reset && fs.existsSync(CACHE_PATH)) fs.unlinkSync(CACHE_PATH);
  const targets = ARGS.target === "all"
    ? ["sentences", "dialogues", "listening", "speaking", "grammar"]
    : [ARGS.target];
  let total = { fixed: 0, seen: 0 };
  for (const t of targets) {
    const r = await runTarget(t, { limit: ARGS.limit });
    total.fixed += r.fixed;
    total.seen += r.seen;
  }
  console.log(`\nGRAND TOTAL: ${total.fixed} fixes across ${total.seen} reviewed items`);
  console.log(`Log: ${LOG_PATH}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
