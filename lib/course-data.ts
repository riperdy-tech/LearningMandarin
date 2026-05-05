import vocab from "@/mandarin_course/data/vocab_month1.json";
import vocabDays31To45 from "@/mandarin_course/data/vocab_days31_45.json";
import vocabDays46To90 from "@/mandarin_course/data/vocab_days46_90.json";
import sentences from "@/mandarin_course/data/sentences_month1.json";
import sentencesDays31To45 from "@/mandarin_course/data/sentences_days31_45.json";
import sentencesDays46To90 from "@/mandarin_course/data/sentences_days46_90.json";
import grammar from "@/mandarin_course/data/grammar_month1.json";
import grammarDays31To45 from "@/mandarin_course/data/grammar_days31_45.json";
import grammarDays46To90 from "@/mandarin_course/data/grammar_days46_90.json";
import pronunciation from "@/mandarin_course/data/pronunciation_month1.json";
import writing from "@/mandarin_course/data/writing_month1.json";
import writingDays31To45 from "@/mandarin_course/data/writing_days31_45.json";
import writingDays46To90 from "@/mandarin_course/data/writing_days46_90.json";
import dialoguesDays31To45 from "@/mandarin_course/data/dialogues_days31_45.json";
import dialoguesDays46To90 from "@/mandarin_course/data/dialogues_days46_90.json";
import listeningDays31To45 from "@/mandarin_course/data/listening_days31_45.json";
import listeningDays46To90 from "@/mandarin_course/data/listening_days46_90.json";
import speakingDays31To45 from "@/mandarin_course/data/speaking_days31_45.json";
import speakingDays46To90 from "@/mandarin_course/data/speaking_days46_90.json";
import reviewDays31To45 from "@/mandarin_course/data/review_days31_45.json";
import reviewDays46To90 from "@/mandarin_course/data/review_days46_90.json";
import assessmentDays31To45 from "@/mandarin_course/data/assessment_days31_45.json";
import assessmentDays46To90 from "@/mandarin_course/data/assessment_days46_90.json";
import lessons from "@/mandarin_course/lessons/lessons_month1.json";
import lessonsDays31To45 from "@/mandarin_course/lessons/lessons_days31_45.json";
import lessonsDays46To90 from "@/mandarin_course/lessons/lessons_days46_90.json";
import audio from "@/mandarin_course/audio/manifest_month1.json";
import audioDays31To45 from "@/mandarin_course/audio/manifest_days31_45.json";
import audioDays46To90 from "@/mandarin_course/audio/manifest_days46_90.json";
import ui from "@/mandarin_course/ui/ui_text.json";
import type {
  AssessmentItem,
  AudioItem,
  CourseData,
  DialogueItem,
  GrammarItem,
  LessonItem,
  ListeningItem,
  PronunciationItem,
  ReviewItem,
  SentenceItem,
  SpeakingItem,
  UiText,
  VocabularyItem,
  WritingItem
} from "@/lib/types";

export const courseData: CourseData = {
  vocab: [...(vocab as VocabularyItem[]), ...(vocabDays31To45 as VocabularyItem[]), ...(vocabDays46To90 as VocabularyItem[])],
  sentences: [...(sentences as SentenceItem[]), ...(sentencesDays31To45 as SentenceItem[]), ...(sentencesDays46To90 as SentenceItem[])],
  grammar: [...(grammar as GrammarItem[]), ...(grammarDays31To45 as GrammarItem[]), ...(grammarDays46To90 as GrammarItem[])],
  pronunciation: pronunciation as PronunciationItem[],
  writing: [...(writing as WritingItem[]), ...(writingDays31To45 as WritingItem[]), ...(writingDays46To90 as WritingItem[])],
  dialogues: [...(dialoguesDays31To45 as DialogueItem[]), ...(dialoguesDays46To90 as DialogueItem[])],
  listening: [...(listeningDays31To45 as ListeningItem[]), ...(listeningDays46To90 as ListeningItem[])],
  speaking: [...(speakingDays31To45 as SpeakingItem[]), ...(speakingDays46To90 as SpeakingItem[])],
  review: [...(reviewDays31To45 as ReviewItem[]), ...(reviewDays46To90 as ReviewItem[])],
  assessment: [...(assessmentDays31To45 as AssessmentItem[]), ...(assessmentDays46To90 as AssessmentItem[])],
  lessons: [...(lessons as LessonItem[]), ...(lessonsDays31To45 as LessonItem[]), ...(lessonsDays46To90 as LessonItem[])],
  locked_lessons: [],
  audio: [...(audio as AudioItem[]), ...(audioDays31To45 as AudioItem[]), ...(audioDays46To90 as AudioItem[])],
  ui: ui as UiText
};
