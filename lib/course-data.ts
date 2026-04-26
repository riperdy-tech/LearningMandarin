import vocab from "@/mandarin_course/data/vocab_month1.json";
import sentences from "@/mandarin_course/data/sentences_month1.json";
import grammar from "@/mandarin_course/data/grammar_month1.json";
import pronunciation from "@/mandarin_course/data/pronunciation_month1.json";
import writing from "@/mandarin_course/data/writing_month1.json";
import lessons from "@/mandarin_course/lessons/lessons_month1.json";
import ui from "@/mandarin_course/ui/ui_text.json";
import type {
  CourseData,
  GrammarItem,
  LessonItem,
  PronunciationItem,
  SentenceItem,
  UiText,
  VocabularyItem,
  WritingItem
} from "@/lib/types";

export const courseData: CourseData = {
  vocab: vocab as VocabularyItem[],
  sentences: sentences as SentenceItem[],
  grammar: grammar as GrammarItem[],
  pronunciation: pronunciation as PronunciationItem[],
  writing: writing as WritingItem[],
  lessons: lessons as LessonItem[],
  ui: ui as UiText
};
