import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const R = (p) => { try { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); } catch { return []; } };

const errors = [], warnings = [];

// ── Load ALL data ──────────────────────────────────────────────────────

const ALL = {
  vocab:     [...R("mandarin_course/data/vocab_month1.json"), ...R("mandarin_course/data/vocab_days31_45.json"), ...R("mandarin_course/data/vocab_days46_90.json")],
  sentences: [...R("mandarin_course/data/sentences_month1.json"), ...R("mandarin_course/data/sentences_days31_45.json"), ...R("mandarin_course/data/sentences_days46_90.json")],
  grammar:   [...R("mandarin_course/data/grammar_month1.json"), ...R("mandarin_course/data/grammar_days31_45.json"), ...R("mandarin_course/data/grammar_days46_90.json")],
  lessons:   [...R("mandarin_course/lessons/lessons_month1.json"), ...R("mandarin_course/lessons/lessons_days31_45.json"), ...R("mandarin_course/lessons/lessons_days46_90.json")],
  audio:     [...R("mandarin_course/audio/manifest_month1.json"), ...R("mandarin_course/audio/manifest_days31_45.json"), ...R("mandarin_course/audio/manifest_days46_90.json")],
  dialogues: [...R("mandarin_course/data/dialogues_days31_45.json"), ...R("mandarin_course/data/dialogues_days46_90.json")],
  listening: [...R("mandarin_course/data/listening_days31_45.json"), ...R("mandarin_course/data/listening_days46_90.json")],
  speaking:  [...R("mandarin_course/data/speaking_days31_45.json"), ...R("mandarin_course/data/speaking_days46_90.json")],
  review:    [...R("mandarin_course/data/review_days31_45.json"), ...R("mandarin_course/data/review_days46_90.json")],
  assessment:[...R("mandarin_course/data/assessment_days31_45.json"), ...R("mandarin_course/data/assessment_days46_90.json")],
};

const IDX = {};
for (const key of Object.keys(ALL)) IDX[key] = new Map(ALL[key].map((i) => [i.id, i]));

const introDay = new Map();
for (const v of ALL.vocab) if (v.day_introduced) introDay.set(v.id, v.day_introduced);
for (const l of ALL.lessons) for (const vid of l.vocab_ids) if (!introDay.has(vid)) introDay.set(vid, l.order);

const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);
const chk = (ctx, val, label) => { if (val == null || val === "") err(`${ctx}: ${label} is empty/undefined`); };
const ref = (map, id, ctx) => { if (!map.has(id)) err(`${ctx}: references missing ${id}`); };

// ═══════════════════════════════════════════════════════════════════════
//  CHECK EVERY LESSON (days 1-90)
// ═══════════════════════════════════════════════════════════════════════

const sortedLessons = [...ALL.lessons].sort((a, b) => a.order - b.order);
const maxDay = sortedLessons.length > 0 ? sortedLessons[sortedLessons.length - 1].order : 0;

for (const lesson of sortedLessons) {
  const d = lesson.order;
  const ctx = `Day ${d}`;

  // Basic fields
  chk(ctx, lesson.id, "lesson id");
  chk(ctx, lesson.title, "title");
  if (lesson.week !== Math.ceil(d / 7)) warn(`${ctx}: week is ${lesson.week}, expected ${Math.ceil(d / 7)}`);

  // Vocab
  if (!lesson.assessment && (!lesson.vocab_ids || lesson.vocab_ids.length === 0)) err(`${ctx}: no vocab_ids (non-assessment day)`);
  for (const vid of lesson.vocab_ids) {
    ref(IDX.vocab, vid, `${ctx} vocab`);
    const v = IDX.vocab.get(vid);
    if (v) {
      chk(`${ctx} vocab ${vid}`, v.char, "char");
      chk(`${ctx} vocab ${vid}`, v.pinyin, "pinyin");
      chk(`${ctx} vocab ${vid}`, v.meaning_en, "meaning_en");
      if (v.pinyin === "placeholder" || v.meaning_en === "placeholder") err(`${ctx} vocab ${vid}: placeholder value`);
    }
  }

  // Sentences
  if (!lesson.sentence_ids || lesson.sentence_ids.length === 0) err(`${ctx}: no sentence_ids`);
  for (const sid of lesson.sentence_ids) {
    ref(IDX.sentences, sid, `${ctx} sentence`);
    const s = IDX.sentences.get(sid);
    if (s) {
      chk(`${ctx} sent ${sid}`, s.text, "text");
      chk(`${ctx} sent ${sid}`, s.pinyin, "pinyin");
      chk(`${ctx} sent ${sid}`, s.translation_en, "translation_en");
      if (s.text?.includes("undefined")) err(`${ctx} sent ${sid}: text contains 'undefined'`);
      if (s.pinyin === "placeholder" || s.pinyin === "pinyin placeholder") err(`${ctx} sent ${sid}: pinyin is placeholder`);
      if (s.translation_en?.includes("Practice sentence for day")) warn(`${ctx} sent ${sid}: generic translation`);
      if (s.translation_en?.includes("independent daily communication")) err(`${ctx} sent ${sid}: grammar ID used as translation`);
      // Check tokens reference real vocab
      for (const tid of (s.token_ids || [])) {
        if (tid && !IDX.vocab.has(tid)) warn(`${ctx} sent ${sid}: token ${tid} not found in vocab`);
      }
      // Check grammar refs
      for (const gid of (s.grammar_ids || [])) {
        ref(IDX.grammar, gid, `${ctx} sent ${sid} grammar`);
      }
    }
  }

  // Grammar
  if (!lesson.grammar_ids || lesson.grammar_ids.length === 0) err(`${ctx}: no grammar_ids`);
  for (const gid of lesson.grammar_ids) {
    ref(IDX.grammar, gid, `${ctx} grammar`);
    const g = IDX.grammar.get(gid);
    if (g) {
      chk(`${ctx} gram ${gid}`, g.pattern, "pattern");
      chk(`${ctx} gram ${gid}`, g.explanation_en, "explanation_en");
      if (g.explanation_en?.includes("use this pattern to like in")) warn(`${ctx} gram ${gid}: awkward grammar explanation contains 'to like in'`);
      if (g.explanation_en?.includes("independent daily communication")) err(`${ctx} gram ${gid}: function name used as explanation`);
      // Check drill examples
      for (const de of (g.drill_examples || [])) {
        chk(`${ctx} gram ${gid} drill`, de.text, "text");
        chk(`${ctx} gram ${gid} drill`, de.pinyin, "pinyin");
        if (de.text?.includes("undefined")) err(`${ctx} gram ${gid} drill: text contains 'undefined'`);
        if (de.pinyin === "placeholder") warn(`${ctx} gram ${gid} drill: pinyin is placeholder`);
      }
      for (const ce of (g.correct_examples || [])) {
        if (ce.text?.includes("undefined")) err(`${ctx} gram ${gid} correct: text contains 'undefined'`);
      }
    }
  }

  // Dialogues (days 31+)
  for (const did of (lesson.dialogue_ids || [])) {
    ref(IDX.dialogues, did, `${ctx} dialogue`);
    const dlg = IDX.dialogues.get(did);
    if (dlg) {
      for (const turn of (dlg.turns || [])) {
        chk(`${ctx} dlg ${turn.id}`, turn.text, "text");
        chk(`${ctx} dlg ${turn.id}`, turn.pinyin, "pinyin");
        if (turn.text?.includes("undefined")) err(`${ctx} dlg ${turn.id}: text contains 'undefined'`);
        if (turn.pinyin === "placeholder") warn(`${ctx} dlg ${turn.id}: pinyin is placeholder`);
      }
    }
  }

  // Listening (days 31+)
  for (const lid of (lesson.listening_ids || [])) {
    ref(IDX.listening, lid, `${ctx} listening`);
    const li = IDX.listening.get(lid);
    if (li) {
      chk(`${ctx} lis ${lid}`, li.text, "text");
      chk(`${ctx} lis ${lid}`, li.pinyin, "pinyin");
      if (li.text?.includes("undefined")) err(`${ctx} lis ${lid}: text contains 'undefined'`);
    }
  }

  // Speaking (days 31+)
  for (const spid of (lesson.speaking_ids || [])) {
    ref(IDX.speaking, spid, `${ctx} speaking`);
    const sp = IDX.speaking.get(spid);
    if (sp) {
      chk(`${ctx} spk ${spid}`, sp.model_answer, "model_answer");
      chk(`${ctx} spk ${spid}`, sp.prompt_en, "prompt_en");
      if (sp.model_answer?.includes("undefined")) err(`${ctx} spk ${spid}: model_answer contains 'undefined'`);
    }
  }

  // Review
  for (const rid of (lesson.review_ids || [])) {
    ref(IDX.review, rid, `${ctx} review`);
  }

  // Assessment
  if (lesson.assessment_id) {
    ref(IDX.assessment, lesson.assessment_id, `${ctx} assessment`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  CHECK FOR PLACEHOLDER / UNDEFINED IN ALL DATA
// ═══════════════════════════════════════════════════════════════════════

const BAD_WORDS = ["undefined", "placeholder", "pinyin placeholder", "문맥에 맞게 중국어 문장을 말해 보세요"];

for (const v of ALL.vocab) {
  for (const f of ["char", "pinyin", "pinyin_numeric", "meaning_en", "meaning_ko"]) {
    const val = String(v[f] || "");
    for (const bw of BAD_WORDS) {
      if (val.toLowerCase() === bw.toLowerCase()) err(`vocab ${v.id}: ${f} is "${bw}"`);
    }
  }
}

for (const s of ALL.sentences) {
  for (const f of ["text", "pinyin", "translation_en"]) {
    const val = String(s[f] || "");
    if (val.toLowerCase().includes("undefined")) err(`sentence ${s.id}: ${f} contains "undefined"`);
    if (f === "pinyin" && val === "placeholder") err(`sentence ${s.id}: pinyin is "placeholder"`);
    if (f === "translation_en" && val.includes("independent daily communication")) err(`sentence ${s.id}: translation_en contains grammar function name`);
  }
}

for (const d of ALL.dialogues) {
  for (const t of (d.turns || [])) {
    if (String(t.text || "").toLowerCase().includes("undefined")) err(`dialogue ${t.id}: text contains "undefined"`);
    if (t.pinyin === "placeholder") warn(`dialogue ${t.id}: pinyin is "placeholder"`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  CHECK LESSON CONTINUITY: no gaps in day order
// ═══════════════════════════════════════════════════════════════════════

const seenDays = new Set(sortedLessons.map((l) => l.order));
for (let d = 1; d <= 90; d++) {
  if (!seenDays.has(d)) err(`Missing lesson for Day ${d}`);
}
for (let d = 91; d <= 100; d++) {
  if (seenDays.has(d)) warn(`Unexpected lesson Day ${d} exists`);
}

// ═══════════════════════════════════════════════════════════════════════
//  REPORT
// ═══════════════════════════════════════════════════════════════════════

console.log(`\n=== VALIDATION RESULTS ===`);
console.log(`Days: 1-${maxDay} (${sortedLessons.length} lessons total)`);
console.log(`Vocab: ${ALL.vocab.length} | Sentences: ${ALL.sentences.length} | Grammar: ${ALL.grammar.length}`);
console.log(`Dialogues: ${ALL.dialogues.length} | Listening: ${ALL.listening.length} | Speaking: ${ALL.speaking.length}`);

if (warnings.length) {
  console.log(`\n⚠ WARNINGS (${warnings.length}):`);
  for (const w of warnings) console.log(`  - ${w}`);
} else {
  console.log(`\n✅ Zero warnings`);
}

if (errors.length) {
  console.log(`\n❌ ERRORS (${errors.length}):`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
} else {
  console.log(`\n✅ Zero errors — course data is clean!`);
}
