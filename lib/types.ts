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
};

export type SentenceItem = {
  id: string;
  text: string;
  pinyin: string;
  pinyin_numeric: string;
  translation_en: string;
  translation_ko: string;
  tokens: string[];
  grammar_ids: string[];
  audio_id: string;
  difficulty: number;
};

export type GrammarItem = {
  id: string;
  pattern: string;
  structure: string[];
  explanation_en: string;
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
  kind: "vocab" | "sentence" | "pronunciation";
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
  vocab_ids: string[];
  sentence_ids: string[];
  grammar_ids: string[];
  pronunciation_ids: string[];
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
  lessons: LessonItem[];
  audio: AudioItem[];
  ui: UiText;
};
