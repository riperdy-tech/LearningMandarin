import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const frameworkDays = readJson("mandarin_course_day31_90_framework/curriculum/day_31_90_framework.json").days
  .filter((day) => day.day >= 31 && day.day <= 45);

const base = {
  vocab: readJson("mandarin_course/data/vocab_month1.json"),
  sentences: readJson("mandarin_course/data/sentences_month1.json"),
  grammar: readJson("mandarin_course/data/grammar_month1.json"),
  lessons: readJson("mandarin_course/lessons/lessons_month1.json"),
  audio: readJson("mandarin_course/audio/manifest_month1.json")
};

const next = {
  vocab: readJson("mandarin_course/data/vocab_days31_45.json"),
  sentences: readJson("mandarin_course/data/sentences_days31_45.json"),
  grammar: readJson("mandarin_course/data/grammar_days31_45.json"),
  lessons: readJson("mandarin_course/lessons/lessons_days31_45.json"),
  audio: readJson("mandarin_course/audio/manifest_days31_45.json"),
  dialogues: readJson("mandarin_course/data/dialogues_days31_45.json"),
  listening: readJson("mandarin_course/data/listening_days31_45.json"),
  speaking: readJson("mandarin_course/data/speaking_days31_45.json"),
  review: readJson("mandarin_course/data/review_days31_45.json"),
  assessment: readJson("mandarin_course/data/assessment_days31_45.json")
};

const errors = [];
const warnings = [];

const allVocab = [...base.vocab, ...next.vocab];
const allSentences = [...base.sentences, ...next.sentences];
const allGrammar = [...base.grammar, ...next.grammar];
const allLessons = [...base.lessons, ...next.lessons];
const allAudio = [...base.audio, ...next.audio];

const vocabById = mapById(allVocab, "vocab");
const sentenceById = mapById(allSentences, "sentence");
const grammarById = mapById(allGrammar, "grammar");
const lessonById = mapById(allLessons, "lesson");
const audioById = mapById(allAudio, "audio");
const dialogueById = mapById(next.dialogues, "dialogue");
const listeningById = mapById(next.listening, "listening");
const speakingById = mapById(next.speaking, "speaking");
const reviewById = mapById(next.review, "review");
const assessmentById = mapById(next.assessment, "assessment");

const introDayByVocabId = new Map();
for (const lesson of base.lessons) {
  for (const id of lesson.vocab_ids ?? []) if (!introDayByVocabId.has(id)) introDayByVocabId.set(id, lesson.order);
}
for (const item of next.vocab) introDayByVocabId.set(item.id, item.day_introduced);

const vocabEntries = allVocab
  .filter((item) => item.char && /[\u3400-\u9fff]/.test(item.char))
  .sort((a, b) => b.char.length - a.char.length);

for (const day of frameworkDays) validateLesson(day);
validateFrameworkTargets();
validateNoFutureVocab();
validateNoFillerContent();

if (warnings.length) {
  console.warn(warnings.map((warning) => `WARNING: ${warning}`).join("\n"));
}

if (errors.length) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Course validation passed: ${next.lessons.length} lessons, ${next.vocab.length} vocab, ${next.sentences.length} sentences, ${next.grammar.length} grammar, ${next.dialogues.length} dialogues.`
);

function validateLesson(day) {
  const lesson = lessonById.get(`LESSON_D${day.day}`);
  if (!lesson) return fail(`Missing lesson for Day ${day.day}`);

  expectEqual(lesson.title, day.unit, `Day ${day.day} title`);
  expectEqual(lesson.scenario, day.scenario, `Day ${day.day} scenario`);
  expectEqual(lesson.vocab_ids.length, day.new_vocab_target, `Day ${day.day} vocab count`);
  expectEqual(lesson.grammar_ids.length, day.grammar_ids_to_create.length, `Day ${day.day} grammar count`);
  expectEqual(lesson.dialogue_ids.length, day.required_dialogues.length, `Day ${day.day} dialogue count`);

  for (const id of day.grammar_ids_to_create) {
    if (!lesson.grammar_ids.includes(id)) fail(`Day ${day.day} lesson does not include framework grammar ${id}`);
  }

  for (const id of lesson.vocab_ids) {
    const item = requireRef(vocabById, id, `Day ${day.day} vocab`);
    if (!item) continue;
    expectEqual(item.day_introduced, day.day, `${id} day_introduced`);
    requireRef(audioById, item.audio_id, `${id} audio`);
  }

  for (const id of lesson.sentence_ids) {
    const sentence = requireRef(sentenceById, id, `Day ${day.day} sentence`);
    if (!sentence) continue;
    requireRef(audioById, sentence.audio_id, `${id} audio`);
    validateTokenIds(sentence.token_ids ?? [], day.day, id);
    validateText(sentence.text, day.day, id);
    for (const grammarId of sentence.grammar_ids) requireRef(grammarById, grammarId, `${id} grammar`);
  }

  for (const id of lesson.grammar_ids) {
    const grammar = requireRef(grammarById, id, `Day ${day.day} grammar`);
    if (!grammar) continue;
    for (const example of grammar.correct_examples ?? []) validateText(example.text, day.day, `${id} correct example`);
    for (const example of grammar.drill_examples ?? []) validateText(example.text, day.day, `${id} drill example`);
    for (const example of grammar.incorrect_examples ?? []) validateText(example.text, day.day, `${id} incorrect example`);
  }

  for (const id of lesson.dialogue_ids ?? []) {
    const dialogue = requireRef(dialogueById, id, `Day ${day.day} dialogue`);
    if (!dialogue) continue;
    for (const turn of dialogue.turns) {
      requireRef(audioById, turn.audio_id, `${turn.id} audio`);
      validateTokenIds(turn.token_ids ?? [], day.day, turn.id);
      validateText(turn.text, day.day, turn.id);
    }
  }

  for (const id of lesson.listening_ids ?? []) {
    const item = requireRef(listeningById, id, `Day ${day.day} listening`);
    if (!item) continue;
    requireRef(audioById, item.audio_id, `${id} audio`);
    validateText(item.text, day.day, id);
  }

  for (const id of lesson.speaking_ids ?? []) {
    const item = requireRef(speakingById, id, `Day ${day.day} speaking`);
    if (!item) continue;
    validateText(item.model_answer, day.day, id);
  }

  for (const id of lesson.review_ids ?? []) requireRef(reviewById, id, `Day ${day.day} review`);
  if (lesson.assessment_id) requireRef(assessmentById, lesson.assessment_id, `Day ${day.day} assessment`);
}

function validateFrameworkTargets() {
  const expectedVocab = frameworkDays.reduce((sum, day) => sum + day.new_vocab_target, 0);
  const expectedGrammar = frameworkDays.reduce((sum, day) => sum + day.grammar_ids_to_create.length, 0);
  const expectedDialogues = frameworkDays.reduce((sum, day) => sum + day.required_dialogues.length, 0);

  expectEqual(next.lessons.length, frameworkDays.length, "Days 31-45 lesson count");
  expectEqual(next.vocab.length, expectedVocab, "Days 31-45 total vocab");
  expectEqual(next.grammar.length, expectedGrammar, "Days 31-45 total grammar");
  expectEqual(next.dialogues.length, expectedDialogues, "Days 31-45 total dialogues");
}

function validateNoFutureVocab() {
  for (const sentence of next.sentences) {
    const day = Number(sentence.id.match(/^SEN_D(\d+)_/)?.[1]);
    validateTokenIds(sentence.token_ids ?? [], day, sentence.id);
  }
  for (const dialogue of next.dialogues) {
    const day = Number(dialogue.id.match(/^DLG_D(\d+)_/)?.[1]);
    for (const turn of dialogue.turns) validateTokenIds(turn.token_ids ?? [], day, turn.id);
  }
}

function validateNoFillerContent() {
  const checks = [];
  for (const item of next.vocab) {
    checks.push([`${item.id} char`, item.char]);
    checks.push([`${item.id} pinyin`, item.pinyin]);
    checks.push([`${item.id} pinyin_numeric`, item.pinyin_numeric]);
    checks.push([`${item.id} meaning_en`, item.meaning_en]);
    checks.push([`${item.id} meaning_ko`, item.meaning_ko]);
  }
  for (const item of next.sentences) {
    checks.push([`${item.id} text`, item.text]);
    checks.push([`${item.id} pinyin`, item.pinyin]);
    checks.push([`${item.id} pinyin_numeric`, item.pinyin_numeric]);
    checks.push([`${item.id} translation_en`, item.translation_en]);
  }
  for (const dialogue of next.dialogues) {
    for (const turn of dialogue.turns) {
      checks.push([`${turn.id} text`, turn.text]);
      checks.push([`${turn.id} pinyin`, turn.pinyin]);
      checks.push([`${turn.id} translation_en`, turn.translation_en]);
    }
  }
  for (const item of next.listening) {
    checks.push([`${item.id} text`, item.text]);
    checks.push([`${item.id} prompt`, item.prompt_en]);
    checks.push([`${item.id} translation_en`, item.translation_en]);
  }
  for (const item of next.speaking) {
    checks.push([`${item.id} prompt`, item.prompt_en]);
    checks.push([`${item.id} model_answer`, item.model_answer]);
    checks.push([`${item.id} model_translation_en`, item.model_translation_en]);
  }

  for (const [context, value] of checks) {
    const text = String(value ?? "");
    if (
      text.includes("練習") ||
      /practice item/i.test(text) ||
      /practice practice/i.test(text) ||
      /Day \d+/i.test(text)
    ) {
      fail(`${context} contains generated filler content: "${text.slice(0, 80)}"`);
    }
  }
}

function validateTokenIds(tokenIds, day, context) {
  for (const id of tokenIds) {
    requireRef(vocabById, id, `${context} token`);
    const introDay = introDayByVocabId.get(id);
    if (introDay && introDay > day) fail(`${context} uses future vocab ${id} introduced on Day ${introDay}`);
  }
}

function validateText(text, day, context) {
  if (!text) return fail(`${context} has empty Chinese text`);
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    if (!/[\u3400-\u9fff]/.test(char)) {
      index += 1;
      continue;
    }
    const match = vocabEntries.find((item) => {
      const introDay = introDayByVocabId.get(item.id);
      return (!introDay || introDay <= day) && text.startsWith(item.char, index);
    });
    if (!match) {
      return fail(`${context} has unknown or future token near "${text.slice(index, index + 6)}" in "${text}"`);
    }
    index += match.char.length;
  }
}

function mapById(items, label) {
  const map = new Map();
  for (const item of items) {
    if (!item.id) {
      fail(`Missing id in ${label}`);
      continue;
    }
    if (map.has(item.id)) fail(`Duplicate ${label} id ${item.id}`);
    map.set(item.id, item);
  }
  return map;
}

function requireRef(map, id, context) {
  const item = map.get(id);
  if (!item) fail(`${context} references missing id ${id}`);
  return item;
}

function expectEqual(actual, expected, label) {
  if (actual !== expected) fail(`${label}: expected ${expected}, got ${actual}`);
}

function fail(message) {
  errors.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}
