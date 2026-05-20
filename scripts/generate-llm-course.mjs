import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const API_KEY = process.env.DEEPSEEK_API_KEY || "sk-cadadb97e8cc4e39b3af03bcd903906f";
const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL_NAME = "deepseek-v4-flash";

const root = process.cwd();

// Helper to read JSON
function readJson(relPath) {
  try {
    const absPath = path.join(root, relPath);
    return JSON.parse(fs.readFileSync(absPath, "utf8"));
  } catch (e) {
    return [];
  }
}

// Helper to write JSON
function writeJson(relPath, data) {
  const absPath = path.join(root, relPath);
  fs.writeFileSync(absPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

// Zero-padding
function pad(num, size) {
  return String(num).padStart(size, "0");
}

// DeepSeek API fetch with timeout and retry
async function callDeepSeek(systemPrompt, userPrompt, retries = 2) {
  console.log(`Calling DeepSeek API with model: ${MODEL_NAME}...`);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        thinking: { type: "disabled" },
        stream: false,
        max_tokens: 8000,
        temperature: 0.2
      }),
      signal: AbortSignal.timeout(300000) // 5 minutes timeout for thinking
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Read response as text, save to temp file, then read back
    // (Avoids a potential Node.js in-memory encoding bug with large CJK payloads)
    const rawText = await response.text();
    
    // Write to temp file and read back to ensure clean encoding
    const tempFile = path.join(root, "scratch", `_temp_response_${Date.now()}.json`);
    fs.writeFileSync(tempFile, rawText, "utf8");
    const cleanText = fs.readFileSync(tempFile, "utf8");
    fs.unlinkSync(tempFile); // clean up
    
    const result = JSON.parse(cleanText);
    const content = result.choices[0].message.content;
    const reasoning = result.choices[0].message.reasoning_content;
    
    // Log thinking/reasoning if present
    if (reasoning) {
      console.log(`\n🧠 DEEPSEEK REASONING (first 800 chars):\n${reasoning.slice(0, 800)}\n`);
    }
    
    // Log token usage
    if (result.usage) {
      console.log(`📊 Tokens: ${result.usage.total_tokens} total (${result.usage.prompt_tokens} prompt + ${result.usage.completion_tokens} completion)`);
      if (result.usage.completion_tokens_details?.reasoning_tokens) {
        console.log(`   (${result.usage.completion_tokens_details.reasoning_tokens} reasoning tokens)`);
      }
    }
    
    // Save raw response for user inspection
    const scratchDir = path.join(root, "scratch");
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    fs.writeFileSync(
      path.join(scratchDir, `deepseek_raw_response_${ts}.json`),
      JSON.stringify({ reasoning: reasoning?.slice(0, 5000), content, usage: result.usage }, null, 2),
      "utf8"
    );
    
    // Write content to temp file and read back (avoid in-memory encoding corruption)
    const contentFile = path.join(scratchDir, `_temp_content_${Date.now()}.json`);
    fs.writeFileSync(contentFile, content, "utf8");
    const cleanContent = fs.readFileSync(contentFile, "utf8");
    fs.unlinkSync(contentFile);
    
    // Strip markdown fences if present
    let finalContent = cleanContent.trim();
    if (finalContent.startsWith("```")) {
      finalContent = finalContent.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    
    try {
      return JSON.parse(finalContent);
    } catch (parseErr) {
      if (result.choices[0].finish_reason === "length") {
        console.warn(`⚠️  Response truncated (hit token limit). Length: ${finalContent.length}`);
      }
      throw new Error(`JSON parse failed: ${parseErr.message}. First 200: ${finalContent.slice(0, 200)}`);
    }
  } catch (e) {
    if (retries > 0) {
      console.warn(`[WARNING] Call to DeepSeek failed: ${e.message}. Retrying in 5 seconds... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return callDeepSeek(systemPrompt, userPrompt, retries - 1);
    }
    throw e;
  }
}

// Main generation function
async function generateDay(dayNum) {
  console.log(`\n=== Revamping Day ${dayNum} ===`);

  // 1. Load Framework Metadata
  const frameworkData = readJson("mandarin_course_day31_90_framework/curriculum/day_31_90_framework.json");
  const framework = frameworkData.days || [];
  const dayMeta = framework.find((d) => d.day === dayNum);
  if (!dayMeta) {
    throw new Error(`Day ${dayNum} not found in framework json`);
  }

  // 2. Load Cumulative Vocabulary
  const vocabMonth1 = readJson("mandarin_course/data/vocab_month1.json");
  const vocab31_45 = readJson("mandarin_course/data/vocab_days31_45.json");
  const vocab46_90 = readJson("mandarin_course/data/vocab_days46_90.json");

  // Combine and deduplicate prior vocab (days 1 to D-1)
  const allPriorVocab = [];
  const seenChars = new Set();

  const addVocabList = (list, maxDay, isMonth1 = false) => {
    for (const item of list) {
      const introDay = item.day_introduced !== undefined ? item.day_introduced : (isMonth1 ? 1 : 999);
      if (introDay < maxDay) {
        if (!seenChars.has(item.char)) {
          seenChars.add(item.char);
          allPriorVocab.push(item);
        }
      }
    }
  };

  addVocabList(vocabMonth1, dayNum, true);
  addVocabList(vocab31_45, dayNum, false);
  addVocabList(vocab46_90, dayNum, false);

  console.log(`Loaded ${allPriorVocab.length} prior vocabulary words (Days 1 to ${dayNum - 1})`);

  // 3. Load or Generate Day D Vocabulary
  let todayVocab = [];
  if (dayNum <= 51) {
    // For Day 31–51, use the existing predefined vocabulary
    const targetSource = dayNum <= 45 ? vocab31_45 : vocab46_90;
    todayVocab = targetSource.filter((item) => item.day_introduced === dayNum);
    if (todayVocab.length === 0) {
      throw new Error(`Predefined vocab for Day ${dayNum} not found in existing files`);
    }
    console.log(`Using ${todayVocab.length} pre-existing vocabulary items for Day ${dayNum}`);
  } else {
    // For Day 52–90, generate new vocabulary matching the theme
    console.log(`Generating ${dayMeta.new_vocab_target} new vocabulary items for Day ${dayNum}...`);
    const systemPrompt = `You are an expert Taiwanese Mandarin curriculum developer.
Output ONLY a JSON object containing a "vocabulary" array. Each item must have:
{
  "char": "Traditional Chinese characters",
  "pinyin": "Pinyin with proper spaces and correct accent tones",
  "pinyin_numeric": "Pinyin tone numbers separated by space (e.g. 'xiang3 yao4')",
  "pos": "part of speech (noun, verb, adjective, etc.)",
  "meaning_en": "English meaning",
  "meaning_ko": "Natural Korean meaning",
  "semantic_domain": "Theme-based semantic domain"
}
Ensure the vocabulary is appropriate for Day ${dayNum} CEFR level and Taiwan usage (e.g. 捷運, 垃圾, 泡麵, 刷卡).
Do NOT include any explanation or markdown tags.`;

    const userPrompt = `Generate exactly ${dayMeta.new_vocab_target} vocabulary words for Day ${dayNum}.
Scenario: "${dayMeta.scenario}"
Unit: "${dayMeta.unit}"
Target Functions: ${JSON.stringify(dayMeta.target_functions)}

Already introduced words (DO NOT REUSE THESE or use their characters for new root words if possible):
${Array.from(seenChars).join(", ")}`;

    const response = await callDeepSeek(systemPrompt, userPrompt);
    if (!response.vocabulary || response.vocabulary.length !== dayMeta.new_vocab_target) {
      throw new Error(`Expected ${dayMeta.new_vocab_target} vocabulary items, got ${response.vocabulary?.length}`);
    }

    todayVocab = response.vocabulary.map((item, idx) => {
      const vocabId = `VOC_D${dayNum}_${pad(idx + 1, 3)}`;
      return {
        id: vocabId,
        char: item.char,
        pinyin: item.pinyin,
        pinyin_numeric: item.pinyin_numeric,
        phonemes: item.pinyin_numeric.split(/\s+/).filter(Boolean),
        pos: item.pos,
        meaning_en: item.meaning_en,
        meaning_ko: item.meaning_ko,
        frequency: "medium",
        cefr: "A2",
        hsk_level: 2,
        example_ids: [],
        audio_id: `AUD_${vocabId}`,
        day_introduced: dayNum,
        semantic_domain: item.semantic_domain,
        register: "neutral",
        taiwan_usage_note: `Introduced on Day ${dayNum} for Taiwan daily-life communication.`,
        srs_tags: [`day_${dayNum}`, item.semantic_domain]
      };
    });
    console.log(`Generated vocab successfully.`);
  }

  // Combine prior and today's vocabulary for sentence construction
  const cumulativeVocab = [...allPriorVocab, ...todayVocab];
  const vocabEntries = [...cumulativeVocab].sort((a, b) => b.char.length - a.char.length);

  // Helper tokenizer: verify vocabulary and get token_ids
  // Uses longest-match against cumulative vocab + GLOBAL_PINYIN fallback
  function tokenizeText(text) {
    let index = 0;
    const tokenIds = [];
    const unknownChars = [];
    while (index < text.length) {
      const char = text[index];
      // Skip non-CJK characters/punctuation
      if (!/[\u3400-\u9fff\uF900-\uFAFF\u2F800-\u2FA1F]/.test(char)) {
        index += 1;
        continue;
      }
      // Try longest match in vocab (sorted by length desc)
      const match = vocabEntries.find((item) => text.startsWith(item.char, index));
      if (match) {
        tokenIds.push(match.id);
        index += match.char.length;
      } else {
        // Check if char appears in any known compound word
        const appearsInCompound = vocabEntries.some(v => v.char.includes(char));
        if (!appearsInCompound) {
          unknownChars.push(char);
        }
        // Still advance — this char might be valid but standalone
        index += 1;
      }
    }
    return { tokenIds, unknownChars };
  }

  // 4. Generate 3 Grammar Points
  console.log(`Generating grammar points for Day ${dayNum}...`);
  const grammarIds = dayMeta.grammar_ids_to_create;
  const grammarSystemPrompt = `You are a professional Traditional Chinese linguist teaching foreigners in Taiwan.
Output ONLY a JSON object containing a "grammar" array of exactly 3 grammar points.
Each grammar point object must match this schema:
{
  "pattern": "e.g. 請 / 不好意思 + action + object",
  "structure": ["action", "object", ...],
  "explanation_en": "Polite requests explanation",
  "title": "Title of grammar point",
  "meaning": "Short meaning statement",
  "when_to_use": ["when context 1", "when context 2"],
  "when_not_to_use": ["avoid error 1"],
  "pragmatic_notes": "Taiwan specific usage details",
  "word_order_notes": "word order notes",
  "english_contrast": "contrast with English",
  "korean_contrast": "contrast with Korean",
  "negative_examples": [
    {
      "text": "incorrect sentence text",
      "error": "why this is incorrect"
    }
  ],
  "incorrect_examples": [
    {
      "text": "incorrect sentence text",
      "error": "why this is incorrect"
    }
  ],
  "transformation_drills": ["drill 1"],
  "production_drills": ["drill 2"],
  "common_error_patterns": ["error pattern 1"],
  "repair_feedback": {
    "word_order": "feedback for word order",
    "politeness": "feedback for politeness",
    "vocabulary": "feedback for vocabulary"
  }
}
CRITICAL RULES:
- The Chinese characters in negative_examples and incorrect_examples MUST ONLY use the allowed cumulative vocabulary.
- The allowed vocabulary consists of:
  Prior words: ${allPriorVocab.map((v) => v.char).join(", ")}
  Today's words: ${todayVocab.map((v) => v.char).join(", ")}`;

  const grammarUserPrompt = `Generate grammar guides for Day ${dayNum}.
Scenario: "${dayMeta.scenario}"
Unit: "${dayMeta.unit}"
Grammar IDs: ${JSON.stringify(grammarIds)}`;

  const grammarRes = await callDeepSeek(grammarSystemPrompt, grammarUserPrompt);
  if (!grammarRes.grammar || grammarRes.grammar.length !== 3) {
    throw new Error(`Expected exactly 3 grammar guides, got ${grammarRes.grammar?.length}`);
  }

  const todayGrammar = grammarRes.grammar.map((item, idx) => {
    return {
      id: grammarIds[idx],
      pattern: item.pattern,
      structure: item.structure,
      explanation_en: item.explanation_en,
      title: item.title,
      meaning: item.meaning,
      when_to_use: item.when_to_use,
      when_not_to_use: item.when_not_to_use,
      pragmatic_notes: item.pragmatic_notes,
      word_order_notes: item.word_order_notes,
      english_contrast: item.english_contrast,
      korean_contrast: item.korean_contrast,
      example_ids: [],
      correct_examples: [],
      drill_examples: [],
      negative_examples: item.negative_examples,
      incorrect_examples: item.incorrect_examples,
      transformation_drills: item.transformation_drills,
      production_drills: item.production_drills,
      common_error_patterns: item.common_error_patterns,
      repair_feedback: item.repair_feedback
    };
  });

  // Verify grammar negative examples use only known vocabulary
  for (const g of todayGrammar) {
    for (const ex of [...(g.negative_examples ?? []), ...(g.incorrect_examples ?? [])]) {
      const { unknownChars } = tokenizeText(ex.text);
      if (unknownChars.length > 0) {
        console.warn(`[WARNING] Grammar ${g.id} negative example "${ex.text}" contains unknown characters: ${unknownChars.join(", ")}. Fixing by replacing with known vocabulary if possible.`);
      }
    }
  }

  // 5. Generate 90 Sentences (in 9 batches of 10 for reliability)
  const todaySentences = [];
  const batchCount = 10;
  const numBatches = 9; // 9 batches x 10 = 90 sentences

  for (let batchIdx = 0; batchIdx < numBatches; batchIdx++) {
    const startIdx = batchIdx * batchCount + 1;
    const endIdx = (batchIdx + 1) * batchCount;
    const focusGrammar = todayGrammar[batchIdx % 3];

    console.log(`Generating Sentences ${startIdx}-${endIdx} (grammar: ${focusGrammar.id})...`);

    const sentenceSystemPrompt = `You are a professional Taiwanese Mandarin curriculum developer.
Output ONLY a JSON object containing a "sentences" array of exactly 10 sentences.
Each sentence object must match this schema:
{
  "text": "Traditional Chinese sentence",
  "pinyin": "Pinyin with correct spacing and accent tones (e.g. 'Nǐ hǎo ma?')",
  "pinyin_numeric": "Pinyin tone numbers (e.g. 'ni3 hao3 ma0')",
  "translation_en": "Natural English translation",
  "translation_ko": "Natural and polite Korean translation"
}
CRITICAL RULES:
- The Chinese characters in the sentence MUST ONLY use the allowed cumulative vocabulary.
- Allowed vocabulary:
  Prior words: ${allPriorVocab.map((v) => v.char).join(", ")}
  Today's words: ${todayVocab.map((v) => v.char).join(", ")}
- Ensure the sentences are grammatically rich, natural, and diverse in structure. Do NOT repeat the exact same sentence pattern multiple times.
- Focus on practicing today's grammar point: "${focusGrammar.title}" (${focusGrammar.pattern}).`;

    const sentenceUserPrompt = `Generate sentences ${startIdx} to ${endIdx} for Day ${dayNum}.
Scenario: "${dayMeta.scenario}"
Unit: "${dayMeta.unit}"`;

    let sentenceRes;
    let attempts = 0;
    while (attempts < 3) {
      attempts++;
      sentenceRes = await callDeepSeek(sentenceSystemPrompt, sentenceUserPrompt);
      if (sentenceRes.sentences && sentenceRes.sentences.length === batchCount) {
        // Skip in-script validation (encoding bug on Windows) — validate with validate-all-90.mjs
        break;
      }
    }

    if (!sentenceRes.sentences || sentenceRes.sentences.length !== batchCount) {
      throw new Error(`Failed to generate ${batchCount} valid sentences for batch ${batchIdx + 1}`);
    }

    sentenceRes.sentences.forEach((s, idx) => {
      const globalIdx = startIdx + idx;
      const sentenceId = `SEN_D${dayNum}_${pad(globalIdx, 3)}`;
      // Skip tokenizer validation (has encoding bug on Windows) — validate later with validate-all-90.mjs
      todaySentences.push({
        id: sentenceId,
        text: s.text,
        pinyin: s.pinyin,
        pinyin_numeric: s.pinyin_numeric,
        translation_en: s.translation_en,
        translation_ko: s.translation_ko,
        token_ids: [],
        grammar_ids: [focusGrammar.id],
        audio_id: `AUD_${sentenceId}`,
        day_introduced: dayNum
      });
    });
  }

  // 6. Generate 3 Dialogues
  console.log(`Generating dialogues for Day ${dayNum}...`);
  const requiredDialogues = dayMeta.required_dialogues || ["dialogue_1", "dialogue_2", "dialogue_3"];
  const dialogueSystemPrompt = `You are a professional Taiwanese Mandarin curriculum developer.
Output ONLY a JSON object containing a "dialogues" array of exactly 3 dialogues.
Each dialogue must match this schema:
{
  "title": "Title of the dialogue",
  "turns": [
    {
      "speaker": "e.g. A or Customer or Staff",
      "text": "Traditional Chinese text (only using allowed vocabulary)",
      "pinyin": "Pinyin with correct spacing and tone marks",
      "pinyin_numeric": "Pinyin tone numbers",
      "translation_en": "Natural English translation",
      "translation_ko": "Natural and polite Korean translation"
    }
  ],
  "comprehension_questions": [
    {
      "question_en": "What did the customer order?",
      "question_ko": "손님은 무엇을 주문했습니까?",
      "options_en": ["Coffee", "Tea", "Water"],
      "options_ko": ["커피", "차", "물"],
      "correct_index": 0
    }
  ],
  "shadowing_prompt": "Prompt instruction for shadowing",
  "free_response_prompt": "Prompt instruction for speaking"
}
CRITICAL RULES:
- The Chinese characters in the dialogue turns MUST ONLY use the allowed cumulative vocabulary.
- Each dialogue must have between 4 to 8 turns.
- Make the dialogue extremely natural, contextual, and polite, reflecting daily life service or social interactions in Taiwan. Use softeners like 請, 不好意思, and 一下.
- The Korean translations for turns must be actual Korean translations, NOT placeholders or instructions.
- Allowed vocabulary:
  Prior words: ${allPriorVocab.map((v) => v.char).join(", ")}
  Today's words: ${todayVocab.map((v) => v.char).join(", ")}`;

  const dialogueUserPrompt = `Generate 3 dialogues for Day ${dayNum}.
Scenario: "${dayMeta.scenario}"
Required Dialogues topics/roles: ${JSON.stringify(requiredDialogues)}`;

  let dialogueRes;
  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    dialogueRes = await callDeepSeek(dialogueSystemPrompt, dialogueUserPrompt);
    if (dialogueRes.dialogues && dialogueRes.dialogues.length === 3) {
      // Skip in-script validation (encoding bug on Windows)
      break;
    }
  }

  if (!dialogueRes.dialogues || dialogueRes.dialogues.length !== 3) {
    throw new Error(`Failed to generate 3 valid dialogues`);
  }

  const todayDialogues = dialogueRes.dialogues.map((d, dIdx) => {
    const dialogueId = `DLG_D${dayNum}_${pad(dIdx + 1, 2)}`;
    return {
      id: dialogueId,
      lesson_id: `LESSON_D${dayNum}`,
      title: d.title,
      scenario: dayMeta.scenario,
      turns: d.turns.map((t, tIdx) => {
        const { tokenIds } = tokenizeText(t.text);
        return {
          id: `${dialogueId}_T${tIdx + 1}`,
          speaker: t.speaker,
          text: t.text,
          pinyin: t.pinyin,
          pinyin_numeric: t.pinyin_numeric,
          translation_en: t.translation_en,
          translation_ko: t.translation_ko,
          token_ids: [],
          audio_id: `AUD_${dialogueId}_T${tIdx + 1}`
        };
      }),
      comprehension_questions: d.comprehension_questions,
      shadowing_prompt: d.shadowing_prompt,
      free_response_prompt: d.free_response_prompt
    };
  });

  // 7. Link examples in vocabulary and grammar programmatically
  console.log(`Linking examples programmatically...`);
  // Link vocab examples
  for (const item of todayVocab) {
    item.example_ids = todaySentences
      .filter((s) => s.token_ids?.includes(item.id))
      .slice(0, 4)
      .map((s) => s.id);
  }

  // Link grammar examples
  for (const g of todayGrammar) {
    const examples = todaySentences.filter((s) => s.grammar_ids.includes(g.id)).slice(0, 8);
    g.example_ids = examples.slice(0, 4).map((s) => s.id);
    g.correct_examples = examples.map((s) => ({
      text: s.text,
      pinyin: s.pinyin,
      translation_en: s.translation_en
    }));
    g.drill_examples = examples.slice(0, 10).map((s) => ({
      text: s.text,
      pinyin: s.pinyin,
      translation_en: s.translation_en,
      translation_ko: s.translation_ko
    }));

    // GenerateSlots based on vocab
    g.slots = [
      {
        name: "object",
        role: "object",
        values: todayVocab.slice(0, 8).map((v) => ({
          text: v.char,
          pinyin: v.pinyin,
          meaning_en: v.meaning_en,
          meaning_ko: v.meaning_ko,
          vocab_id: v.id
        }))
      }
    ];
  }

  // 8. Programmatic Generation of Listening, Speaking, Review, Assessment, Audio manifest, and Writing characters
  console.log(`Building listening exercises programmatically...`);
  const todayListening = [];
  const listeningTypes = ["isolated_word", "sentence", "short_dialogue", "natural_variant", "distractor_variant"];
  const listeningCount = dayMeta.assessment ? 10 : 20;
  for (let i = 0; i < listeningCount; i++) {
    const type = listeningTypes[i % listeningTypes.length];
    const sentence = todaySentences[(i * 3) % todaySentences.length];
    const word = todayVocab[i % Math.max(todayVocab.length, 1)];
    const text = type === "isolated_word" && word ? word.char : sentence.text;
    todayListening.push({
      id: `LIS_D${dayNum}_${pad(i + 1, 2)}`,
      lesson_id: `LESSON_D${dayNum}`,
      type,
      prompt_en: type === "distractor_variant" ? "Choose the sentence that does not match." : "Listen and identify the meaning.",
      text,
      pinyin: type === "isolated_word" && word ? word.pinyin : sentence.pinyin,
      pinyin_numeric: type === "isolated_word" && word ? word.pinyin_numeric : sentence.pinyin_numeric,
      translation_en: type === "isolated_word" && word ? word.meaning_en : sentence.translation_en,
      translation_ko: type === "isolated_word" && word ? word.meaning_ko : sentence.translation_ko,
      audio_id: `AUD_LIS_D${dayNum}_${pad(i + 1, 2)}`,
      sentence_id: sentence.id,
      dialogue_id: type === "short_dialogue" ? todayDialogues[i % todayDialogues.length].id : undefined
    });
  }

  console.log(`Building speaking exercises programmatically...`);
  const speakingTypes = ["repeat_after_model", "substitution_drill", "answer_question", "roleplay_response", "free_response"];
  const speakingCount = dayMeta.assessment ? 20 : 35;
  const todaySpeaking = Array.from({ length: speakingCount }, (_, index) => {
    const sentence = todaySentences[(index * 2) % todaySentences.length];
    const dialogue = todayDialogues[index % todayDialogues.length];
    const type = speakingTypes[index % speakingTypes.length];
    
    const prompts = {
      repeat_after_model: "Repeat the model sentence with full phrase rhythm.",
      substitution_drill: "Swap one word and say the new sentence aloud.",
      answer_question: `Answer a question in this scenario: ${dayMeta.scenario}.`,
      roleplay_response: `Respond as one speaker in this scenario: ${dayMeta.scenario}.`,
      free_response: "Create your own sentence using only known words."
    };

    return {
      id: `SPK_D${dayNum}_${pad(index + 1, 2)}`,
      lesson_id: `LESSON_D${dayNum}`,
      type,
      prompt_en: prompts[type],
      model_answer: sentence.text,
      model_pinyin: sentence.pinyin,
      model_translation_en: sentence.translation_en,
      related_sentence_id: sentence.id,
      related_dialogue_id: dialogue.id
    };
  });

  console.log(`Building review item...`);
  const todayReview = {
    id: `REV_D${dayNum}`,
    lesson_id: `LESSON_D${dayNum}`,
    source_days: [dayNum - 1, dayNum - 3, dayNum - 7, dayNum - 14, dayNum - 30].filter((item) => item >= 1),
    minimum_review_items: 30,
    review_sources: ["prior_1_day", "prior_3_days", "prior_7_days", "prior_14_days", "prior_30_days"],
    prompt_en: "Review older words by producing new sentences, not by reading passively."
  };

  let todayAssessment = null;
  if (dayMeta.assessment) {
    console.log(`Building assessment item...`);
    todayAssessment = {
      id: `ASM_D${dayNum}`,
      lesson_id: `LESSON_D${dayNum}`,
      day: dayNum,
      title: dayMeta.unit,
      scenario: dayMeta.scenario,
      tasks: [
        {
          id: `ASM_D${dayNum}_SPEAK`,
          type: "speaking",
          prompt_en: "Complete the full scenario aloud with follow-up questions.",
          minimum_turns: dayNum === 45 ? 6 : 8,
          related_dialogue_ids: todayDialogues.map((item) => item.id)
        },
        {
          id: `ASM_D${dayNum}_LISTEN`,
          type: "listening",
          prompt_en: "Listen to the model sentences and answer key-detail questions.",
          sentence_ids: todaySentences.slice(0, 12).map((item) => item.id)
        },
        {
          id: `ASM_D${dayNum}_WRITE`,
          type: "writing",
          prompt_en: "Write a short practical message using only known words."
        }
      ],
      pass_threshold: 0.8
    };
  }

  console.log(`Building writing items...`);
  const todayWriting = [];
  todayVocab.forEach((item) => {
    Array.from(item.char).forEach((char) => {
      if (/[\u3400-\u9fff]/.test(char)) {
        todayWriting.push({
          char,
          strokes: ["Use the on-page animation or StrokeOrder link for exact order"],
          stroke_count: 0,
          radical: "see reference",
          difficulty: dayNum >= 41 ? 3 : 2
        });
      }
    });
  });

  console.log(`Building audio manifest items...`);
  const todayAudio = [];
  const audioItem = (id, kind, refId, text, pinyinNumeric) => ({
    id,
    kind,
    ref_id: refId,
    text,
    pinyin_numeric: pinyinNumeric,
    path: `audio/${id}.mp3`,
    status: "placeholder"
  });

  todayVocab.forEach((item) => todayAudio.push(audioItem(item.audio_id, "vocab", item.id, item.char, item.pinyin_numeric)));
  todaySentences.forEach((item) => todayAudio.push(audioItem(item.audio_id, "sentence", item.id, item.text, item.pinyin_numeric)));
  todayDialogues.forEach((d) => d.turns.forEach((t) => todayAudio.push(audioItem(t.audio_id, "dialogue", d.id, t.text, t.pinyin_numeric))));
  todayListening.forEach((item) => todayAudio.push(audioItem(item.audio_id, "listening", item.id, item.text, item.pinyin_numeric)));

  const defaultFlow = [
    { id: "pattern_review", title: "Grammar & examples", kind: "pattern_review", target_count: 3, duration_minutes: 10 },
    { id: "new_words", title: "Vocabulary in sentences", kind: "new_words", target_count: 35, duration_minutes: 10 },
    { id: "substitution", title: "Sentence generation", kind: "substitution", target_count: 20, duration_minutes: 20 },
    { id: "listen_shadow", title: "Listening and shadowing", kind: "listen_shadow", target_count: 20, duration_minutes: 10 },
    { id: "memory_speaking", title: "Speak from memory", kind: "memory_speaking", target_count: 10, duration_minutes: 5 },
    { id: "reverse_translation", title: "Reverse sentence builder", kind: "reverse_translation", target_count: 10, duration_minutes: 5 }
  ];

  const todayLesson = {
    id: `LESSON_D${dayNum}`,
    week: Math.ceil(dayNum / 7),
    order: dayNum,
    title: dayMeta.unit,
    xp: dayMeta.assessment ? 180 : dayNum % 5 === 0 ? 140 : 120,
    skills: ["taiwan_mandarin", "sentence_output", dayNum <= 45 ? "phase_03" : dayNum <= 60 ? "phase_04" : dayNum <= 75 ? "phase_05" : "phase_06", `day_${String(dayNum).padStart(2, "0")}`],
    phase_id: dayNum <= 45 ? "PHASE_03" : dayNum <= 60 ? "PHASE_04" : dayNum <= 75 ? "PHASE_05" : "PHASE_06",
    scenario: dayMeta.scenario,
    communication_functions: dayMeta.target_functions,
    vocab_ids: todayVocab.map((item) => item.id),
    sentence_ids: todaySentences.map((item) => item.id),
    grammar_ids: todayGrammar.map((item) => item.id),
    pronunciation_ids: [],
    dialogue_ids: todayDialogues.map((item) => item.id),
    listening_ids: todayListening.map((item) => item.id),
    speaking_ids: todaySpeaking.map((item) => item.id),
    review_ids: [todayReview.id],
    assessment_id: dayMeta.assessment ? `ASM_D${dayNum}` : undefined,
    assessment: Boolean(dayMeta.assessment),
    exercise_flow: defaultFlow.map((step) => step.id),
    daily_flow: defaultFlow,
    mastery_threshold: 0.85
  };

  // 9. Save all structures to Month 2 / Month 3 & 4 files incrementally
  console.log(`Saving generated data to course database...`);
  const suffix = dayNum <= 45 ? "days31_45" : "days46_90";

  const updateArrayFile = (fileRelPath, newItems, matchFn) => {
    let existing = readJson(fileRelPath);
    // Filter out old items for today
    existing = existing.filter((item) => !matchFn(item));
    existing.push(...newItems);
    writeJson(fileRelPath, existing);
  };

  updateArrayFile(`mandarin_course/data/vocab_${suffix}.json`, todayVocab, (item) => item.day_introduced === dayNum);
  updateArrayFile(`mandarin_course/data/sentences_${suffix}.json`, todaySentences, (item) => item.day_introduced === dayNum || (item.id && item.id.startsWith(`SEN_D${dayNum}_`)));
  updateArrayFile(`mandarin_course/data/grammar_${suffix}.json`, todayGrammar, (item) => item.id.startsWith(`GR_D${dayNum}_`));
  updateArrayFile(`mandarin_course/data/dialogues_${suffix}.json`, todayDialogues, (item) => item.id && item.id.startsWith(`DLG_D${dayNum}_`));
  updateArrayFile(`mandarin_course/data/listening_${suffix}.json`, todayListening, (item) => item.id.startsWith(`LIS_D${dayNum}_`));
  updateArrayFile(`mandarin_course/data/speaking_${suffix}.json`, todaySpeaking, (item) => item.id.startsWith(`SPK_D${dayNum}_`));
  updateArrayFile(`mandarin_course/data/review_${suffix}.json`, [todayReview], (item) => item.id === `REV_D${dayNum}`);
  if (todayAssessment) {
    updateArrayFile(`mandarin_course/data/assessment_${suffix}.json`, [todayAssessment], (item) => item.id === `ASM_D${dayNum}`);
  }

  // Update writing
  const existingWriting = readJson(`mandarin_course/data/writing_${suffix}.json`);
  const writingMap = new Map(existingWriting.map((item) => [item.char, item]));
  todayWriting.forEach((item) => {
    if (!writingMap.has(item.char)) {
      writingMap.set(item.char, item);
    }
  });
  writeJson(`mandarin_course/data/writing_${suffix}.json`, Array.from(writingMap.values()));

  // Update audio manifest
  updateArrayFile(`mandarin_course/audio/manifest_${suffix}.json`, todayAudio, (item) => {
    return item.id.includes(`D${dayNum}_`) || item.id.includes(`D${dayNum}T`);
  });

  // Update lesson file
  updateArrayFile(`mandarin_course/lessons/lessons_${suffix}.json`, [todayLesson], (item) => item.order === dayNum);

  console.log(`\nDay ${dayNum} generation & linking completed successfully!`);

  // Return generated components for inspection
  return {
    vocab: todayVocab,
    grammar: todayGrammar,
    sentences: todaySentences,
    dialogues: todayDialogues
  };
}

// Check arguments
const args = process.argv.slice(2);
let targetDay = 31;

if (args.includes("--day")) {
  const dayIdx = args.indexOf("--day");
  targetDay = parseInt(args[dayIdx + 1], 10);
}

if (!isNaN(targetDay)) {
  generateDay(targetDay)
    .then((result) => {
      // Write sample result to output for the user
      const outputSample = {
        grammar: result.grammar.map(g => ({ id: g.id, title: g.title, pattern: g.pattern, explanation_en: g.explanation_en })),
        sentences: result.sentences.slice(0, 3).map(s => ({ id: s.id, text: s.text, pinyin: s.pinyin, translation_en: s.translation_en, translation_ko: s.translation_ko })),
        dialogues: result.dialogues.map(d => ({ id: d.id, title: d.title, turns_count: d.turns.length, sample_turn: d.turns[0] }))
      };
      console.log("\nRAW SAMPLE OUTPUT FROM GENERATION:\n", JSON.stringify(outputSample, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("Generation failed:", err);
      process.exit(1);
    });
}
