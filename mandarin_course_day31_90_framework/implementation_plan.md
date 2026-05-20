# Implementation Plan: Revamp Mandarin Course Expansion (Days 31–90) (Revised)

The goal is to revamp the generated curriculum data for Days 31 to 90. The current generated data suffers from:
- Robotic, short, and repetitive sentence structures that do not scale in complexity.
- No new vocabulary defined for Days 52–90 (which leads to recycling old words with duplicate IDs and fake "introduced" days).
- Broken Korean translations due to literal concatenation of dictionary-form verbs with tense/politeness endings.
- Robotic, repetitive dialogues and generic grammar explanations.

We will replace the existing template-based generator scripts with an **LLM-assisted generation pipeline** using the **DeepSeek API** to produce natural, contextual, and grammatically correct sentences, dialogues, translations, and grammar guides that strictly obey the closed-vocabulary constraint and scale progressively in complexity.

## Proposed Changes

### 1. Comprehensive Vocabulary Revamp (Days 31–90)

Instead of reusing baseline vocabulary or relying on partial lists, we will review and define a rich, thematic vocabulary list of **35–45 Traditional Mandarin words for every day from Day 31 to Day 90** (Month 2, 3, and 4) matching the framework scenarios (Taiwan usage preferred, e.g., 捷運, 部落格, 垃圾, 泡麵, 刷卡, 載具).
- All vocab items will have correct Pinyin, Part of Speech, English meaning, and natural Korean meaning.
- Cumulative vocabulary lists will be tracked dynamically to ensure strict adherence to the closed-vocabulary constraint.

### 2. Deepening Linguistic Complexity & Sentence Diversity

As the learner progresses, the generated material must scale in grammatical complexity:
- **Days 31–45 (Survival Fluency)**: Transition from single-clause requests to natural multi-turn service interactions with proper measure words, location anchoring, and polite softeners.
- **Days 46–60 (Social & Narrative)**: Introduce compound sentences, past/present/future aspect markers (`了`, `過`, `正在`), and description/degree complements (`的`, `得`).
- **Days 61–75 (Problem Solving & Transactions)**: Focus on multi-clause problem statements, conditionals (`如果...就...`), concessions (`雖然...但是...`), obligation (`應該`, `必須`), and advanced grammar structures (`把` / `被`).
- **Days 76–90 (Independent Communication)**: Incorporate relative clauses, opinions (`對我來說`), ongoing changes (`越來越...`), and narrative descriptions.
- **Dialogue Scaling**: Dialogue turns will vary naturally in length, containing realistic conversational repairs, follow-up questions, and natural Taiwan conversational particles (啦, 吧, 喔).

### 3. Smart Hybrid Generator Script

We will build a Node.js script `scripts/generate-llm-course.mjs` supporting two modes of operation:

- **Mode A: Automated DeepSeek API Mode**
  - Connects to the DeepSeek API (`https://api.deepseek.com/v1`) using the provided API Key (`sk-cadadb97e8cc4e39b3af03bcd903906f`) and flagship model (e.g., `deepseek-chat`).
  - Automatically handles the prompt generation, API call, parsing, closed-vocabulary validation, and saving.
- **Mode B: Interactive Prompt Export Mode**
  - Generates the exact, highly specific system and user prompt for a given day and writes it to `scratch/prompt_day_XX.txt`.
  - The user can run this prompt on their own LLM interface and save the JSON response to `scratch/response_day_XX.json`.
  - The script will read, validate against the closed-vocabulary policy, and compile the JSON into the course database.

- **Files Updated/Created**:
  - `vocab_days31_45.json` / `vocab_days46_90.json`
  - `sentences_days31_45.json` / `sentences_days46_90.json`
  - `grammar_days31_45.json` / `grammar_days46_90.json`
  - `dialogues_days31_45.json` / `dialogues_days46_90.json`
  - `listening_days31_45.json` / `listening_days46_90.json`
  - `speaking_days31_45.json` / `speaking_days46_90.json`
  - `lessons_days31_45.json` / `lessons_days46_90.json`

## Verification Plan

### Automated Tests
- Run `node scripts/validate-course.mjs` to check Days 31–45.
- Run `node scripts/validate-all-90.mjs` to check the entire Days 1–90 corpus.
- Verify 0 validation errors.

### Manual Verification
- Run `npm run build` to verify the Next.js app builds successfully.
- Verify page routing and data rendering in the browser.
