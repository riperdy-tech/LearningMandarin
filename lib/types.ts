export type VocabularyItem = {
  id: string;
  char: string;
  pinyin: string;
  pinyin_numeric: string;
  phonemes: string[];
  pos: string;
  meaning_en: string;
  meaning_ko: string;
  frequency: "high" | "medium" | "low";
  cefr: string;
  hsk_level: number;
  example_ids: string[];
  audio_id: string;
  day_introduced?: number;
  semantic_domain?: string;
  register?: string;
  taiwan_usage_note?: string;
  srs_tags?: string[];
};

export type SentenceItem = {
  id: string;
  text: string;
  pinyin: string;
  pinyin_numeric: string;
  translation_en: string;
  translation_ko: string;
  tokens: string[];
  token_ids?: string[];
  grammar_ids: string[];
  audio_id: string;
  difficulty: number;
  production_type?: string;
  source_dialogue_id?: string;
};

export type GrammarItem = {
  id: string;
  pattern: string;
  structure: string[];
  explanation_en: string;
  title?: string;
  meaning?: string;
  when_to_use?: string[];
  when_not_to_use?: string[];
  pragmatic_notes?: string;
  word_order_notes?: string;
  english_contrast?: string;
  korean_contrast?: string;
  example_ids: string[];
  slots?: Array<{
    name: string;
    role: "subject" | "verb" | "noun" | "name" | "statement" | "location" | "adjective" | "object";
    values: Array<{
      text: string;
      pinyin: string;
      meaning_en: string;
      meaning_ko?: string;
      vocab_id?: string;
    }>;
  }>;
  drill_examples?: Array<{
    text: string;
    pinyin: string;
    translation_en: string;
    translation_ko?: string;
    slot_values?: Record<string, string>;
  }>;
  negative_examples: Array<{
    text: string;
    error: string;
  }>;
  correct_examples?: Array<{
    text: string;
    pinyin?: string;
    translation_en?: string;
  }>;
  incorrect_examples?: Array<{
    text: string;
    error: string;
  }>;
  transformation_drills?: string[];
  production_drills?: string[];
  common_error_patterns?: string[];
  repair_feedback?: Record<string, string>;
};

export type DialogueItem = {
  id: string;
  lesson_id: string;
  scenario: string;
  speaker_roles: string[];
  grammar_ids: string[];
  turns: Array<{
    id: string;
    speaker: string;
    text: string;
    pinyin: string;
    pinyin_numeric: string;
    translation_en: string;
    translation_ko?: string;
    token_ids?: string[];
    audio_id: string;
  }>;
  audio_ids: string[];
  comprehension_questions: Array<{
    id: string;
    question_en: string;
    answer_en: string;
  }>;
  speaking_shadowing_prompts: string[];
  free_response_branching_prompts: string[];
};

export type ListeningItem = {
  id: string;
  lesson_id: string;
  type: "isolated_word" | "sentence" | "short_dialogue" | "natural_variant" | "distractor_variant" | string;
  prompt_en: string;
  text: string;
  pinyin: string;
  pinyin_numeric: string;
  translation_en: string;
  translation_ko?: string;
  audio_id: string;
  sentence_id?: string;
  dialogue_id?: string;
};

export type SpeakingItem = {
  id: string;
  lesson_id: string;
  type: "repeat_after_model" | "substitution_drill" | "answer_question" | "roleplay_response" | "free_response" | string;
  prompt_en: string;
  model_answer: string;
  model_pinyin: string;
  model_translation_en: string;
  related_sentence_id?: string;
  related_dialogue_id?: string;
};

export type ReviewItem = {
  id: string;
  lesson_id: string;
  source_days: number[];
  minimum_review_items: number;
  review_sources: string[];
  prompt_en: string;
};

export type AssessmentItem = {
  id: string;
  lesson_id: string;
  day: number;
  title: string;
  scenario: string;
  tasks: Array<{
    id: string;
    type: string;
    prompt_en: string;
    minimum_turns?: number;
    related_dialogue_ids?: string[];
    sentence_ids?: string[];
  }>;
  pass_threshold: number;
};

export type ReviewQueueItemType = "word" | "grammar" | "sentence" | "dialogue";

export type ReviewResult = "easy" | "correct" | "hard" | "forgot";

export type ReviewQueueState = {
  key: string;
  item_id: string;
  item_type: ReviewQueueItemType;
  source_day: number;
  due_date: string;
  interval_stage: number;
  ease_score: number;
  correct_count: number;
  forgot_count: number;
  last_reviewed_date: string | null;
  last_result?: ReviewResult;
  target_days?: number[];
};

export type ReviewAttempt = {
  key: string;
  result: ReviewResult;
  reviewed_at: string;
};

export type PronunciationItem = {
  id: string;
  type: string;
  pair: string[];
  description: string;
  test_words: string[];
  audio_ids: string[];
  scoring: {
    tone_weight: number;
    phoneme_weight: number;
    pass_threshold: number;
  };
};

export type WritingItem = {
  char: string;
  strokes: string[];
  stroke_count: number;
  radical: string;
  difficulty: number;
};

export type AudioItem = {
  id: string;
  kind: "vocab" | "sentence" | "pronunciation" | "dialogue" | "listening";
  ref_id: string;
  text: string;
  pinyin_numeric: string;
  path: string;
  status: "placeholder" | "recorded" | "generated" | "missing";
};

export type LessonItem = {
  id: string;
  week: number;
  order: number;
  title: string;
  xp: number;
  skills: string[];
  phase_id?: string;
  scenario?: string;
  communication_functions?: string[];
  vocab_ids: string[];
  sentence_ids: string[];
  grammar_ids: string[];
  pronunciation_ids: string[];
  dialogue_ids?: string[];
  listening_ids?: string[];
  speaking_ids?: string[];
  review_ids?: string[];
  assessment_id?: string;
  assessment?: boolean;
  exercise_flow: string[];
  daily_flow?: Array<{
    id: string;
    title: string;
    kind:
      | "pattern_review"
      | "new_words"
      | "substitution"
      | "listen_shadow"
      | "memory_speaking"
      | "reverse_translation"
      | "review_summary";
    target_count?: number;
    duration_minutes?: number;
  }>;
  mastery_threshold: number;
};

export type LockedLessonPreview = {
  id: string;
  week: number;
  order: number;
  title: string;
  phase_id?: string;
  scenario?: string;
  communication_functions?: string[];
  status: "locked";
  unlock_note?: string;
};

export type LocalProgress = {
  version: 1;
  completed_lessons: Record<
    string,
    {
      completed_at: string;
      mastery: number;
      attempts: number;
    }
  >;
  lesson_steps: Record<string, string[]>;
  weak_words: string[];
  weak_patterns: string[];
  due_review_ids: string[];
  review_items: Record<string, ReviewQueueState>;
  recent_review_results: ReviewAttempt[];
  streak: {
    count: number;
    last_study_date: string | null;
  };
};

export type UiText = {
  app: {
    name: string;
    month_label: string;
    week_label: string;
  };
  navigation: Record<string, string>;
  lesson: Record<string, string>;
  exercise: Record<string, string>;
  feedback: Record<string, string>;
  languages: Record<string, string>;
};

export type CourseData = {
  vocab: VocabularyItem[];
  sentences: SentenceItem[];
  grammar: GrammarItem[];
  pronunciation: PronunciationItem[];
  writing: WritingItem[];
  dialogues: DialogueItem[];
  listening: ListeningItem[];
  speaking: SpeakingItem[];
  review: ReviewItem[];
  assessment: AssessmentItem[];
  lessons: LessonItem[];
  locked_lessons: LockedLessonPreview[];
  audio: AudioItem[];
  ui: UiText;
};
