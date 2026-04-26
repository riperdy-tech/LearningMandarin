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
  mastery_threshold: number;
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
  ui: UiText;
};
