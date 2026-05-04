"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  Check,
  Circle,
  ExternalLink,
  Flame,
  Gauge,
  HelpCircle,
  LibraryBig,
  PenLine,
  Printer,
  RotateCcw,
  Search,
  Target,
  Volume2,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  AudioItem,
  CourseData,
  GrammarItem,
  LessonItem,
  LocalProgress,
  SentenceItem,
  VocabularyItem,
  WritingItem
} from "@/lib/types";
import { cn } from "@/lib/utils";

type SpeechMode = "word" | "sentence";
type AudioSpeed = "slow" | "normal";
type SpeakFn = (text: string, mode?: SpeechMode, audioId?: string) => void;
type TrainerStepKind =
  | "pattern_review"
  | "new_words"
  | "substitution"
  | "listen_shadow"
  | "memory_speaking"
  | "reverse_translation"
  | "review_summary";

type TrainerStep = {
  id: string;
  title: string;
  kind: TrainerStepKind;
  target_count?: number;
  duration_minutes?: number;
};

type LessonPack = ReturnType<typeof buildLessonPack>;
type PrintableSheet = {
  body: string;
  meta: string;
  note: string;
  title: string;
};

const PROGRESS_KEY = "taiwan-mandarin-progress-v1";
const PRINT_SHEET_KEY = "taiwan-mandarin-print-sheet-v1";
const SHOW_WRITING_EVENT = "mandarin-show-writing";

const DEFAULT_DAILY_FLOW: TrainerStep[] = [
  { id: "pattern_review", title: "Grammar & examples", kind: "pattern_review", target_count: 1, duration_minutes: 10 },
  { id: "new_words", title: "Vocabulary in sentences", kind: "new_words", target_count: 7, duration_minutes: 10 },
  { id: "substitution", title: "Sentence generation", kind: "substitution", target_count: 10, duration_minutes: 20 },
  { id: "listen_shadow", title: "Listening and shadowing", kind: "listen_shadow", target_count: 4, duration_minutes: 10 },
  { id: "memory_speaking", title: "Speak from memory", kind: "memory_speaking", target_count: 3, duration_minutes: 5 },
  { id: "reverse_translation", title: "Reverse sentence builder", kind: "reverse_translation", target_count: 5, duration_minutes: 5 }
];

const STEP_GUIDES: Record<TrainerStepKind, string> = {
  pattern_review: "Read the pattern once, click every Chinese word you do not know, then shadow two example sentences aloud.",
  new_words: "Study these words inside sentence context. Play the word, then play the full sentence and say it back.",
  substitution: "Say the sentence aloud, swap one part, then say the new version without looking at the English.",
  listen_shadow: "Listen once, repeat slowly, then repeat naturally at full phrase level. Do not chop it into word pieces.",
  memory_speaking: "Look only at the English prompt first. Produce the Chinese from memory, reveal, then correct your output.",
  reverse_translation: "Use the English prompt only. Write or say the Chinese sentence first, then reveal the model answer.",
  review_summary: "Use the English prompt only. Write or say the Chinese sentence first, then reveal the model answer."
};

const AUDIO_SPEEDS: Record<
  AudioSpeed,
  { label: string; wordRate: number; sentenceRate: number; longSentenceRate: number; playbackRate: number }
> = {
  slow: { label: "Slow", wordRate: 0.52, sentenceRate: 0.48, longSentenceRate: 0.42, playbackRate: 0.65 },
  normal: { label: "Normal", wordRate: 0.86, sentenceRate: 0.8, longSentenceRate: 0.72, playbackRate: 1 }
};

const SUPPLEMENTAL_VISIBLE_VOCAB: VocabularyItem[] = [
  supplementalVocab("KOREAN_PERSON", "韓國人", "Hánguó rén", "hanguo2 ren2", "noun", "Korean person; Korean", "한국 사람", ["SEN_M1_D01_08"]),
  supplementalVocab("KOREA", "韓國", "Hánguó", "hanguo2", "place", "Korea", "한국", ["SEN_M1_D01_08"]),
  supplementalVocab("STUDENT", "學生", "xuéshēng", "xue2 sheng1", "noun", "student", "학생", ["SEN_M1_D01_03"]),
  supplementalVocab("TEACHER", "老師", "lǎoshī", "lao3 shi1", "noun", "teacher", "선생님", ["SEN_M1_D01_04"]),
  supplementalVocab("LI_MING", "李明", "Lǐ Míng", "li3 ming2", "name", "Li Ming", "리밍", ["SEN_M1_D01_01"]),
  supplementalVocab("WANG_FANG", "王芳", "Wáng Fāng", "wang2 fang1", "name", "Wang Fang", "왕팡", ["SEN_M1_D01_02"]),
  supplementalVocab("LI_QIANG", "李強", "Lǐ Qiáng", "li3 qiang2", "name", "Li Qiang", "리창", ["SEN_M1_D07_03"]),
  supplementalVocab("THIS", "這", "zhè", "zhe4", "pronoun", "this", "이것", []),
  supplementalVocab("THAT", "那", "nà", "na4", "pronoun", "that", "저것", []),
  supplementalVocab("HERE", "這裡", "zhèlǐ", "zhe4 li3", "place", "here", "여기", []),
  supplementalVocab("THERE", "那裡", "nàlǐ", "na4 li3", "place", "there", "저기", []),
  supplementalVocab("TODAY", "今天", "jīntiān", "jin1 tian1", "time", "today", "오늘", []),
  supplementalVocab("THIS_YEAR", "今年", "jīnnián", "jin1 nian2", "time", "this year", "올해", []),
  supplementalVocab("TOMORROW", "明天", "míngtiān", "ming2 tian1", "time", "tomorrow", "내일", []),
  supplementalVocab("ONE_DAY", "一天", "yì tiān", "yi4 tian1", "time", "one day", "하루", ["SEN_M1_D29_08"]),
  supplementalVocab("EVENING", "晚上", "wǎnshang", "wan3 shang0", "time", "evening; night", "저녁", ["SEN_M1_D29_05"]),
  supplementalVocab("BECAUSE", "因為", "yīnwèi", "yin1 wei4", "conjunction", "because", "왜냐하면", ["SEN_M1_D29_04"]),
  supplementalVocab("BUT", "但是", "dànshì", "dan4 shi4", "conjunction", "but", "하지만", ["SEN_M1_D29_08"]),
  supplementalVocab("AND", "和", "hé", "he2", "conjunction", "and; with", "그리고", []),
  supplementalVocab("WE", "我們", "wǒmen", "wo3 men0", "pronoun", "we; us", "우리", []),
  supplementalVocab("THEY", "他們", "tāmen", "ta1 men0", "pronoun", "they; them", "그들", []),
  supplementalVocab("PLUS", "加", "jiā", "jia1", "verb", "to add; plus", "더하다", ["SEN_M1_D02_05"]),
  supplementalVocab("COMPLETION", "了", "le", "le0", "particle", "completed-action particle", "완료 조사", []),
  supplementalVocab("STILL", "還", "hái", "hai2", "adverb", "still; also", "아직; 또한", []),
  supplementalVocab("PORTION", "份", "fèn", "fen4", "measure word", "portion; serving", "인분", []),
  supplementalVocab("ASK", "問", "wèn", "wen4", "verb", "to ask", "묻다", []),
  supplementalVocab("BUY", "買", "mǎi", "mai3", "verb", "to buy", "사다", []),
  supplementalVocab("RETURN", "回", "huí", "hui2", "verb", "to return", "돌아가다", []),
  supplementalVocab("GIVE", "給", "gěi", "gei3", "verb", "to give", "주다", []),
  supplementalVocab("TAKE", "取", "qǔ", "qu3", "verb", "to pick up; take", "찾다; 취하다", []),
  supplementalVocab("SHEET", "張", "zhāng", "zhang1", "measure word", "sheet; flat-object measure word", "장", []),
  supplementalVocab("FAST", "快", "kuài", "kuai4", "adjective", "fast", "빠르다", []),
  supplementalVocab("STRIP_ROAD", "條", "tiáo", "tiao2", "measure word", "measure word for long thin things", "줄; 길 단위", []),
  supplementalVocab("RICE_MEAL", "飯", "fàn", "fan4", "noun", "rice; meal", "밥; 식사", []),
  supplementalVocab("EAT_MEAL", "吃飯", "chī fàn", "chi1 fan4", "verb phrase", "to eat a meal", "밥을 먹다", []),
  supplementalVocab("CHINESE_CHARS", "漢字", "Hànzì", "han4 zi4", "noun", "Chinese characters", "한자", []),
  supplementalVocab("CHARACTER", "字", "zì", "zi4", "noun", "character; word", "글자", []),
  supplementalVocab("MUSIC", "音樂", "yīnyuè", "yin1 yue4", "noun", "music", "음악", []),
  supplementalVocab("LIKE", "喜歡", "xǐhuan", "xi3 huan0", "verb", "to like", "좋아하다", []),
  supplementalVocab("HAPPY", "高興", "gāoxìng", "gao1 xing4", "adjective", "happy", "기쁘다", []),
  supplementalVocab("SCHOOL", "學校", "xuéxiào", "xue2 xiao4", "place", "school", "학교", []),
  supplementalVocab("HOSPITAL", "醫院", "yīyuàn", "yi1 yuan4", "place", "hospital", "병원", []),
  supplementalVocab("SUPERMARKET", "超市", "chāoshì", "chao1 shi4", "place", "supermarket", "슈퍼마켓", []),
  supplementalVocab("PARK", "公園", "gōngyuán", "gong1 yuan2", "place", "park", "공원", []),
  supplementalVocab("SHOP", "店", "diàn", "dian4", "noun", "shop; store", "가게", []),
  supplementalVocab("TAICHUNG", "台中", "Táizhōng", "tai2 zhong1", "place", "Taichung", "타이중", []),
  supplementalVocab("TAIPEI", "台北", "Táiběi", "tai2 bei3", "place", "Taipei", "타이베이", []),
  supplementalVocab("MEET", "見面", "jiànmiàn", "jian4 mian4", "verb", "to meet", "만나다", []),
  supplementalVocab("PLAN", "計畫", "jìhuà", "ji4 hua4", "noun", "plan", "계획", []),
  supplementalVocab("WALK", "散步", "sànbù", "san4 bu4", "verb", "to take a walk", "산책하다", []),
  supplementalVocab("TABLE", "桌子", "zhuōzi", "zhuo1 zi0", "noun", "table", "책상", []),
  supplementalVocab("CHAIR", "椅子", "yǐzi", "yi3 zi0", "noun", "chair", "의자", []),
  supplementalVocab("BAG", "包包", "bāobāo", "bao1 bao1", "noun", "bag", "가방", []),
  supplementalVocab("SIDE", "邊", "biān", "bian1", "noun", "side", "쪽; 변", []),
  supplementalVocab("FACE_SIDE", "面", "miàn", "mian4", "noun", "side; surface", "면; 쪽", []),
  supplementalVocab("BUSY", "忙", "máng", "mang2", "adjective", "busy", "바쁘다", []),
  supplementalVocab("CLASS", "課", "kè", "ke4", "noun", "class; lesson", "수업", [])
];

const emptyProgress: LocalProgress = {
  version: 1,
  completed_lessons: {},
  lesson_steps: {},
  weak_words: [],
  weak_patterns: [],
  due_review_ids: [],
  streak: {
    count: 0,
    last_study_date: null
  }
};

function supplementalVocab(
  id: string,
  char: string,
  pinyin: string,
  pinyinNumeric: string,
  pos: string,
  meaningEn: string,
  meaningKo: string,
  exampleIds: string[]
): VocabularyItem {
  return {
    id: `VOC_SUP_M1_${id}`,
    char,
    pinyin,
    pinyin_numeric: pinyinNumeric,
    phonemes: pinyinNumeric.split(/\s+/).filter(Boolean),
    pos,
    meaning_en: meaningEn,
    meaning_ko: meaningKo,
    frequency: "medium",
    cefr: "A1",
    hsk_level: 1,
    example_ids: exampleIds,
    audio_id: `AUD_SUP_M1_${id}`
  };
}

export function CourseApp({ data }: { data: CourseData }) {
  const [selectedLessonId, setSelectedLessonId] = useState(data.lessons[0]?.id ?? "");
  const [activeStepId, setActiveStepId] = useState(DEFAULT_DAILY_FLOW[0].id);
  const [selectedVocab, setSelectedVocab] = useState<VocabularyItem | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<GrammarItem | null>(null);
  const [lessonPickerOpen, setLessonPickerOpen] = useState(false);
  const [pickerWeek, setPickerWeek] = useState(data.lessons[0]?.week ?? 1);
  const [helpOpen, setHelpOpen] = useState(false);
  const [repositoryOpen, setRepositoryOpen] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<AudioSpeed>("normal");
  const [selectedWritingChar, setSelectedWritingChar] = useState<string | null>(null);
  const writingSupportRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useLocalProgress();
  const speech = useMandarinAudio(data.audio, audioSpeed);

  const selectedLesson = useMemo(
    () => data.lessons.find((lesson) => lesson.id === selectedLessonId) ?? data.lessons[0],
    [data.lessons, selectedLessonId]
  );
  const displayVocab = useMemo(() => mergeVocab(data.vocab, SUPPLEMENTAL_VISIBLE_VOCAB), [data.vocab]);
  const lessonPack = useMemo(() => buildLessonPack(data, selectedLesson), [data, selectedLesson]);
  const dailyFlow = getDailyFlow(selectedLesson);
  const completedSteps = progress.lesson_steps[selectedLesson.id] ?? [];
  const lessonCompleted = Boolean(progress.completed_lessons[selectedLesson.id]);
  const lessonMastery = lessonCompleted
    ? Math.round((progress.completed_lessons[selectedLesson.id]?.mastery ?? 0) * 100)
    : 0;
  const completedLessonCount = Object.keys(progress.completed_lessons).length;
  const weakItemCount = progress.weak_words.length + progress.weak_patterns.length;
  const pickerWeeks = Array.from(new Set(data.lessons.map((lesson) => lesson.week))).sort((a, b) => a - b);
  const pickerLessons = data.lessons.filter((lesson) => lesson.week === pickerWeek);
  const activeStep = dailyFlow.find((step) => step.id === activeStepId) ?? dailyFlow[0];
  const allStepsDone = dailyFlow.every((step) => completedSteps.includes(step.id));
  const generatedSentences = buildGeneratedSentences(data, selectedLesson, lessonPack, displayVocab);
  const totalMinutes = dailyFlow.reduce((sum, step) => sum + (step.duration_minutes ?? 0), 0);

  useEffect(() => {
    setPickerWeek(selectedLesson.week);
  }, [selectedLesson.week]);

  useEffect(() => {
    function handleShowWriting(event: Event) {
      const char = (event as CustomEvent<string>).detail;
      if (!char) return;
      setSelectedWritingChar(char);
      requestAnimationFrame(() => writingSupportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }

    window.addEventListener(SHOW_WRITING_EVENT, handleShowWriting);
    return () => window.removeEventListener(SHOW_WRITING_EVENT, handleShowWriting);
  }, []);

  function toggleStep(stepId: string) {
    setProgress((current) => {
      const currentSteps = current.lesson_steps[selectedLesson.id] ?? [];
      const nextSteps = currentSteps.includes(stepId)
        ? currentSteps.filter((item) => item !== stepId)
        : [...currentSteps, stepId];
      return {
        ...current,
        lesson_steps: {
          ...current.lesson_steps,
          [selectedLesson.id]: Array.from(new Set(nextSteps))
        }
      };
    });
  }

  function completeLesson() {
    if (!allStepsDone || lessonCompleted) return;
    setProgress((current) => {
      const today = getTodayKey();
      return {
        ...current,
        completed_lessons: {
          ...current.completed_lessons,
          [selectedLesson.id]: {
            completed_at: new Date().toISOString(),
            mastery: 1,
            attempts: (current.completed_lessons[selectedLesson.id]?.attempts ?? 0) + 1
          }
        },
        streak: {
          count:
            current.streak.last_study_date === today
              ? current.streak.count
              : current.streak.count + 1,
          last_study_date: today
        }
      };
    });
  }

  function resetProgress() {
    setProgress(emptyProgress);
  }

  function toggleWeakWord(id: string) {
    setProgress((current) => toggleWeakItem(current, "weak_words", id));
  }

  function toggleWeakPattern(id: string) {
    setProgress((current) => toggleWeakItem(current, "weak_patterns", id));
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="space-y-5 lg:self-start">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-white">
                  <span className="han text-2xl">台</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-jade-700">
                    Taiwan Mandarin
                  </p>
                  <h1 className="text-xl font-black text-ink">Daily Trainer</h1>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <MetricCard label="Completed days" value={`${completedLessonCount}/${data.lessons.length}`} icon={Target} />
                <MetricCard label="Streak" value={`${progress.streak.count} days`} icon={Flame} />
                <MetricCard label="Marked weak" value={`${weakItemCount}`} icon={RotateCcw} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <p className="text-sm font-bold text-jade-700">Today's loop</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {dailyFlow.map((step, index) => {
                const done = completedSteps.includes(step.id);
                return (
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm font-bold transition",
                      activeStep.id === step.id ? "bg-jade-600 text-white" : "hover:bg-black/5"
                    )}
                    key={step.id}
                    onClick={() => setActiveStepId(step.id)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs",
                        done ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-black/10"
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span>{step.title}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-jade-700">Change day</p>
                <Button onClick={() => setLessonPickerOpen((current) => !current)} size="sm" variant="ghost">
                  <ChevronDown className={cn("h-4 w-4 transition", lessonPickerOpen && "rotate-180")} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <button
                className="w-full rounded-lg bg-black/[0.035] p-3 text-left transition hover:bg-black/10"
                onClick={() => setLessonPickerOpen((current) => !current)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black">Day {selectedLesson.order}</span>
                  {lessonCompleted ? <Check className="h-4 w-4 text-jade-700" /> : <Circle className="h-4 w-4 text-ink/45" />}
                </div>
                <p className="mt-1 text-sm font-semibold">{selectedLesson.title}</p>
              </button>
              {lessonPickerOpen && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {pickerWeeks.map((week) => (
                      <button
                        className={cn(
                          "rounded-lg px-3 py-2 text-xs font-black transition",
                          pickerWeek === week ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-black/10 hover:bg-jade-50"
                        )}
                        key={week}
                        onClick={() => setPickerWeek(week)}
                        type="button"
                      >
                        Week {week}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-2">
                  {pickerLessons.map((lesson) => {
                    const isActive = lesson.id === selectedLesson.id;
                    const done = Boolean(progress.completed_lessons[lesson.id]);
                    return (
                      <button
                        aria-label={`Day ${lesson.order}: ${lesson.title}`}
                        className={cn(
                          "w-full rounded-lg p-3 text-left transition",
                          isActive ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-black/10 hover:bg-jade-50"
                        )}
                        key={lesson.id}
                        onClick={() => {
                          setSelectedLessonId(lesson.id);
                          setActiveStepId(getDailyFlow(lesson)[0].id);
                          setLessonPickerOpen(false);
                        }}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase opacity-70">Day {lesson.order}</p>
                            <p className="mt-0.5 text-sm font-black leading-snug">{lesson.title}</p>
                          </div>
                          {done ? <Check className="h-4 w-4 shrink-0 text-jade-500" /> : <Circle className="h-4 w-4 shrink-0 opacity-50" />}
                        </div>
                      </button>
                    );
                  })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-jade-700" />
                <p className="text-sm font-bold text-jade-700">Audio speed</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(AUDIO_SPEEDS) as AudioSpeed[]).map((speed) => (
                  <button
                    className={cn(
                      "rounded-lg px-2 py-2 text-xs font-black transition",
                      audioSpeed === speed ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-black/10 hover:bg-jade-50"
                    )}
                    key={speed}
                    onClick={() => setAudioSpeed(speed)}
                    type="button"
                  >
                    {AUDIO_SPEEDS[speed].label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold text-ink/50">
                Slow mode lowers both MP3 and browser Mandarin TTS speed for sentence shadowing.
              </p>
            </CardContent>
          </Card>
        </aside>
        <section className="space-y-5">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="flex flex-col gap-5 p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Month 1 · Week {selectedLesson.week}</Badge>
                  <Badge>{totalMinutes} min plan</Badge>
                  {lessonCompleted && <Badge>Completed</Badge>}
                </div>
                <h2 className="mt-3 text-2xl font-black text-ink sm:text-3xl">
                  {selectedLesson.title}
                </h2>
                <p className="mt-2 max-w-3xl font-semibold text-ink/65">
                  Learn words through reusable patterns, generate usable sentences, then speak them out loud.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => setHelpOpen(true)} size="sm" variant="secondary">
                    <HelpCircle className="h-4 w-4" />
                    How to use this page
                  </Button>
                  <Button onClick={() => setRepositoryOpen(true)} size="sm" variant="secondary">
                    <LibraryBig className="h-4 w-4" />
                    Repository
                  </Button>
                  <Button
                    onClick={() =>
                      navigateToPrintSheet(createPrintableWordSheet(
                        selectedLesson,
                        lessonPack.contextVocab.length > 0 ? lessonPack.contextVocab : lessonPack.vocab
                      ))
                    }
                    size="sm"
                    variant="secondary"
                  >
                    <Printer className="h-4 w-4" />
                    Print word sheet
                  </Button>
                </div>
              </div>
              <div className="min-w-56">
                <div className="flex items-center justify-between text-sm font-black">
                  <span>Lesson mastery</span>
                  <span>{lessonMastery}%</span>
                </div>
                <Progress value={lessonMastery} className="mt-2" />
                <p className="mt-2 text-xs font-semibold text-ink/45">
                  Recorded only after you complete the daily loop.
                </p>
              </div>
            </CardContent>
          </Card>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 8 }}
            key={`${selectedLesson.id}-${activeStep.id}`}
            transition={{ duration: 0.2 }}
          >
            <TrainerStepPanel
              activeStep={activeStep}
              allStepsDone={allStepsDone}
              completed={completedSteps.includes(activeStep.id)}
              generatedSentences={generatedSentences}
              lessonCompleted={lessonCompleted}
              lessonPack={lessonPack}
              lookupVocab={displayVocab}
              markStep={toggleStep}
              onCompleteLesson={completeLesson}
              onSelectPattern={setSelectedPattern}
              onSelectVocab={setSelectedVocab}
              progress={progress}
              resetProgress={resetProgress}
              speak={speech.speak}
              audioSpeed={audioSpeed}
              setAudioSpeed={setAudioSpeed}
              toggleWeakPattern={toggleWeakPattern}
              toggleWeakWord={toggleWeakWord}
            />
          </motion.div>

          <ReferenceStrip
            grammar={lessonPack.grammar}
            onSelectPattern={setSelectedPattern}
            onSelectVocab={setSelectedVocab}
            selectedWritingChar={selectedWritingChar}
            setSelectedWritingChar={setSelectedWritingChar}
            speak={speech.speak}
            vocab={lessonPack.contextVocab}
            writingRef={writingSupportRef}
            writing={lessonPack.writing}
          />
        </section>
      </div>

      {selectedVocab && (
        <DetailDrawer title="Word detail" onClose={() => setSelectedVocab(null)}>
          <VocabInfoBox
            afterShowWriting={() => setSelectedVocab(null)}
            item={selectedVocab}
            speak={speech.speak}
          />
        </DetailDrawer>
      )}

      {selectedPattern && (
        <DetailDrawer title="Pattern detail" onClose={() => setSelectedPattern(null)}>
          <PatternDetail grammar={selectedPattern} sentences={data.sentences} speak={speech.speak} vocab={displayVocab} />
        </DetailDrawer>
      )}

      {helpOpen && <HelpDrawer onClose={() => setHelpOpen(false)} />}

      {repositoryOpen && (
        <RepositoryDrawer
          data={data}
          onClose={() => setRepositoryOpen(false)}
          onOpenPrintSheet={navigateToPrintSheet}
          speak={speech.speak}
        />
      )}
    </main>
  );
}

function TrainerStepPanel({
  activeStep,
  allStepsDone,
  completed,
  generatedSentences,
  lessonCompleted,
  lessonPack,
  lookupVocab,
  markStep,
  onCompleteLesson,
  onSelectPattern,
  onSelectVocab,
  progress,
  resetProgress,
  speak,
  audioSpeed,
  setAudioSpeed,
  toggleWeakPattern,
  toggleWeakWord
}: {
  activeStep: TrainerStep;
  allStepsDone: boolean;
  completed: boolean;
  generatedSentences: GeneratedSentence[];
  lessonCompleted: boolean;
  lessonPack: LessonPack;
  lookupVocab: VocabularyItem[];
  markStep: (stepId: string) => void;
  onCompleteLesson: () => void;
  onSelectPattern: (grammar: GrammarItem) => void;
  onSelectVocab: (vocab: VocabularyItem) => void;
  progress: LocalProgress;
  resetProgress: () => void;
  speak: SpeakFn;
  audioSpeed: AudioSpeed;
  setAudioSpeed: (speed: AudioSpeed) => void;
  toggleWeakPattern: (id: string) => void;
  toggleWeakWord: (id: string) => void;
}) {
  return (
    <Card className="bg-white/92 backdrop-blur">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-jade-700">Daily step</p>
            <h3 className="text-2xl font-black text-ink">{activeStep.title}</h3>
            {activeStep.duration_minutes && (
              <p className="mt-1 text-sm font-bold text-ink/50">{activeStep.duration_minutes} minutes</p>
            )}
            <p className="mt-2 max-w-2xl text-sm font-semibold text-ink/60">
              {STEP_GUIDES[activeStep.kind]}
            </p>
          </div>
          <StepDoneButton completed={completed} onClick={() => markStep(activeStep.id)} />
        </div>
      </CardHeader>
      <CardContent>
        {activeStep.kind === "pattern_review" && (
          <PatternReview
            extraExamples={generatedSentences}
            grammar={lessonPack.grammar}
            onSelectPattern={onSelectPattern}
            sentences={lessonPack.sentences}
            speak={speak}
            toggleWeakPattern={toggleWeakPattern}
            vocab={lookupVocab}
            weakPatterns={progress.weak_patterns}
          />
        )}

        {activeStep.kind === "new_words" && (
          <NewWordsInSentences
            extraExamples={generatedSentences}
            lookupVocab={lookupVocab}
            onSelectVocab={onSelectVocab}
            sentences={lessonPack.sentences}
            speak={speak}
            toggleWeakWord={toggleWeakWord}
            vocab={lessonPack.vocab}
            weakWords={progress.weak_words}
          />
        )}

        {activeStep.kind === "substitution" && (
          <SubstitutionDrill generatedSentences={generatedSentences} speak={speak} vocab={lookupVocab} />
        )}

        {activeStep.kind === "listen_shadow" && (
          <ListenShadow
            audioSpeed={audioSpeed}
            sentences={generatedSentences}
            setAudioSpeed={setAudioSpeed}
            speak={speak}
            vocab={lookupVocab}
          />
        )}

        {activeStep.kind === "memory_speaking" && (
          <MemorySpeaking generatedSentences={generatedSentences} speak={speak} vocab={lookupVocab} />
        )}

        {(activeStep.kind === "reverse_translation" || activeStep.kind === "review_summary") && (
          <ReverseTranslationPractice
            allStepsDone={allStepsDone}
            lessonCompleted={lessonCompleted}
            onCompleteLesson={onCompleteLesson}
            progress={progress}
            resetProgress={resetProgress}
            sentences={generatedSentences}
            speak={speak}
            vocab={lookupVocab}
          />
        )}
      </CardContent>
    </Card>
  );
}

function PatternReview({
  extraExamples,
  grammar,
  onSelectPattern,
  sentences,
  speak,
  toggleWeakPattern,
  vocab,
  weakPatterns
}: {
  extraExamples: GeneratedSentence[];
  grammar: GrammarItem[];
  onSelectPattern: (grammar: GrammarItem) => void;
  sentences: SentenceItem[];
  speak: SpeakFn;
  toggleWeakPattern: (id: string) => void;
  vocab: VocabularyItem[];
  weakPatterns: string[];
}) {
  return (
    <div className="grid gap-4">
      {grammar.map((item) => (
        <div className="rounded-lg bg-paper p-5 ring-1 ring-black/10" key={item.id}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge>Reusable pattern</Badge>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {tokenizePattern(item.pattern).map((token, index) =>
                  token === "+" ? (
                    <span className="text-xl font-black text-ink/40" key={`${token}-${index}`}>
                      +
                    </span>
                  ) : (
                    <button
                      className={cn(
                        "rounded-lg px-3 py-2 text-xl font-black ring-1 ring-black/10",
                        isLikelyChinese(token) ? "han bg-white hover:bg-jade-50" : "bg-jade-50 text-jade-900"
                      )}
                      key={`${token}-${index}`}
                      onClick={() => onSelectPattern(item)}
                      type="button"
                    >
                      {token}
                    </button>
                  )
                )}
              </div>
              <p className="mt-3 max-w-2xl font-semibold text-ink/70">{item.explanation_en}</p>
            </div>
            <Button onClick={() => toggleWeakPattern(item.id)} size="sm" variant="secondary">
              {weakPatterns.includes(item.id) ? "Remove weak mark" : "Mark weak"}
            </Button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[...getPatternExamples(item, sentences), ...getFreshMixedExamples(extraExamples, item, 3)].map((example) => (
              <SentenceCard
                audioId={example.audio_id}
                key={example.text}
                pinyin={example.pinyin}
                speak={speak}
                text={example.text}
                translationEn={example.translation_en}
                translationKo={example.translation_ko}
                vocab={vocab}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NewWordsInSentences({
  extraExamples,
  lookupVocab,
  onSelectVocab,
  sentences,
  speak,
  toggleWeakWord,
  vocab,
  weakWords
}: {
  extraExamples: GeneratedSentence[];
  lookupVocab: VocabularyItem[];
  onSelectVocab: (vocab: VocabularyItem) => void;
  sentences: SentenceItem[];
  speak: SpeakFn;
  toggleWeakWord: (id: string) => void;
  vocab: VocabularyItem[];
  weakWords: string[];
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {vocab.map((item) => (
          <button
            className="rounded-lg bg-jade-50 p-4 text-left ring-1 ring-jade-500/20 transition hover:bg-jade-100"
            key={item.id}
            onClick={() => onSelectVocab(item)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="han text-4xl font-black text-ink">{item.char}</div>
                <p className="mt-1 text-lg font-black text-jade-700">{item.pinyin}</p>
              </div>
              <button
                aria-label={`Play ${item.char}`}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink shadow-sm ring-1 ring-black/10"
                onClick={(event) => {
                  event.stopPropagation();
                  speak(item.char, "word", item.audio_id);
                }}
                type="button"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 font-bold text-ink">{item.meaning_en}</p>
            <p className="text-sm font-semibold text-ink/50">{item.meaning_ko}</p>
            <Button
              className="mt-3"
              onClick={(event) => {
                event.stopPropagation();
                toggleWeakWord(item.id);
              }}
              size="sm"
              type="button"
              variant="secondary"
            >
              {weakWords.includes(item.id) ? "Remove weak mark" : "Mark weak"}
            </Button>
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {sentences.map((sentence) => (
          <SentenceWithTokens
            key={sentence.id}
            onSelectVocab={onSelectVocab}
            sentence={sentence}
            speak={speak}
            vocab={lookupVocab}
          />
        ))}
      </div>

      {extraExamples.some((sentence) => sentence.source === "mixed") && (
        <div className="rounded-lg bg-paper p-4 ring-1 ring-black/10">
          <p className="text-xs font-black uppercase text-ink/45">Mixed review with learned words</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {extraExamples
              .filter((sentence) => sentence.source === "mixed")
              .slice(0, 4)
              .map((sentence) => (
                <SentenceCard
                  key={sentence.text}
                  pinyin={sentence.pinyin}
                  speak={speak}
                  text={sentence.text}
                  translationEn={sentence.translation_en}
                  translationKo={sentence.translation_ko}
                  vocab={lookupVocab}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SubstitutionDrill({
  generatedSentences,
  speak,
  vocab
}: {
  generatedSentences: GeneratedSentence[];
  speak: SpeakFn;
  vocab: VocabularyItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(false);
  const active = generatedSentences[activeIndex] ?? generatedSentences[0];

  if (!active) {
    return <EmptyState text="No substitution examples yet. Add slot values to this pattern when you feed the next data batch." />;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-lg bg-skyglass p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-ink/55">Say it, then swap one part</p>
            <p className="mt-1 text-xs font-black uppercase text-jade-700">
              Variation {activeIndex + 1} of {generatedSentences.length}
              {active.source === "mixed" ? " · mixed from learned words" : ""}
            </p>
          </div>
          <Button onClick={() => setShowEnglish((current) => !current)} size="sm" variant="secondary">
            {showEnglish ? "Hide English" : "Show English"}
          </Button>
        </div>
        <ClickableChineseLine
          className="mt-4 text-5xl font-black text-ink"
          speak={speak}
          text={active.text}
          vocab={vocab}
        />
        <p className="mt-3 text-xl font-black text-jade-700">{active.pinyin}</p>
        {showEnglish ? (
          <>
            <p className="mt-2 text-lg font-bold text-ink">{active.translation_en}</p>
            {active.translation_ko && <p className="text-sm font-semibold text-ink/50">{active.translation_ko}</p>}
          </>
        ) : (
          <p className="mt-2 text-sm font-bold text-ink/45">
            English is hidden by default. Say the new Chinese version first, then reveal to check yourself.
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => speak(active.text, "sentence", active.audio_id)} variant="warm">
            <Volume2 className="h-4 w-4" />
            Play sentence
          </Button>
          <Button
            onClick={() => setActiveIndex((current) => (current + 1) % generatedSentences.length)}
            variant="secondary"
          >
            <RotateCcw className="h-4 w-4" />
            Next variation
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-black uppercase text-ink/45">Available variations</p>
        {generatedSentences.map((sentence, index) => (
          <button
            className={cn(
              "w-full rounded-lg p-3 text-left font-bold transition",
              index === activeIndex ? "bg-ink text-white" : "bg-black/[0.035] hover:bg-black/10"
            )}
            key={`${sentence.text}-${index}`}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <span className="han block text-lg">{sentence.text}</span>
            {showEnglish ? (
              <span className="text-sm opacity-70">{sentence.translation_en}</span>
            ) : (
              <span className="text-xs font-black uppercase opacity-55">Variation {index + 1}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ListenShadow({
  audioSpeed,
  sentences,
  setAudioSpeed,
  speak,
  vocab
}: {
  audioSpeed: AudioSpeed;
  sentences: GeneratedSentence[];
  setAudioSpeed: (speed: AudioSpeed) => void;
  speak: SpeakFn;
  vocab: VocabularyItem[];
}) {
  const [showPinyin, setShowPinyin] = useState(false);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl font-semibold text-ink/65">
          Listen once, repeat slowly, then repeat naturally. Use full sentences, not isolated words.
        </p>
        <Button onClick={() => setShowPinyin((current) => !current)} size="sm" variant="secondary">
          {showPinyin ? "Hide pinyin" : "Show pinyin"}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-black/[0.035] p-3">
        <span className="text-xs font-black uppercase text-ink/45">Sound speed</span>
        {(Object.keys(AUDIO_SPEEDS) as AudioSpeed[]).map((speed) => (
          <button
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-black transition",
              audioSpeed === speed ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-black/10 hover:bg-jade-50"
            )}
            key={speed}
            onClick={() => setAudioSpeed(speed)}
            type="button"
          >
            {AUDIO_SPEEDS[speed].label}
          </button>
        ))}
      </div>
      {sentences.map((sentence) => (
        <div className="rounded-lg bg-paper p-4 ring-1 ring-black/10" key={sentence.text}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <ClickableChineseLine
                className="text-2xl font-black text-ink"
                speak={speak}
                text={sentence.text}
                vocab={vocab}
              />
              {showPinyin ? (
                <p className="mt-1 font-black text-jade-700">{sentence.pinyin}</p>
              ) : (
                <p className="mt-1 text-xs font-black uppercase text-ink/35">Pinyin hidden</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white px-3 py-2 text-xs font-black text-ink ring-1 ring-black/10">
                {AUDIO_SPEEDS[audioSpeed].label}
              </span>
              <AudioButton label={`Play ${sentence.text}`} onClick={() => speak(sentence.text, "sentence", sentence.audio_id)} />
            </div>
          </div>
          {sentence.source === "mixed" && (
            <p className="mt-3 text-xs font-black uppercase text-jade-700">Mixed from earlier words</p>
          )}
          <p className={cn("font-bold text-ink", sentence.source !== "mixed" && "mt-3")}>{sentence.translation_en}</p>
          {sentence.translation_ko && <p className="text-sm font-semibold text-ink/50">{sentence.translation_ko}</p>}
        </div>
      ))}
    </div>
  );
}

function MemorySpeaking({
  generatedSentences,
  speak,
  vocab
}: {
  generatedSentences: GeneratedSentence[];
  speak: SpeakFn;
  vocab: VocabularyItem[];
}) {
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const prompts = generatedSentences.slice(0, Math.max(6, Math.min(generatedSentences.length, 10)));

  if (prompts.length === 0) {
    return <EmptyState text="No memory prompt is available for this lesson yet." />;
  }

  function toggleReveal(text: string) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-paper p-5">
        <p className="text-sm font-black text-ink/55">Speak from memory</p>
        <p className="mt-2 font-semibold text-ink/65">
          Work through each prompt: say the Chinese before revealing, then play the model and correct your rhythm.
        </p>
      </div>
      {prompts.map((prompt, index) => {
        const isRevealed = revealed.has(prompt.text);
        return (
          <div className="rounded-lg bg-paper p-5 ring-1 ring-black/10" key={`${prompt.text}-${index}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-jade-700">Prompt {index + 1}</p>
                <p className="mt-2 text-xl font-black text-ink">{prompt.translation_en}</p>
                {prompt.translation_ko && <p className="text-sm font-semibold text-ink/50">{prompt.translation_ko}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => toggleReveal(prompt.text)} size="sm" variant="secondary">
                  {isRevealed ? "Hide answer" : "Reveal answer"}
                </Button>
                <Button onClick={() => speak(prompt.text, "sentence", prompt.audio_id)} size="sm" variant="warm">
                  <Volume2 className="h-4 w-4" />
                  Play model
                </Button>
              </div>
            </div>
            <div className="mt-4 min-h-24 rounded-lg border border-dashed border-ink/25 bg-white p-4">
              {isRevealed ? (
                <>
                  <ClickableChineseLine
                    className="text-3xl font-black text-ink"
                    speak={speak}
                    text={prompt.text}
                    vocab={vocab}
                  />
                  <p className="mt-2 text-lg font-black text-jade-700">{prompt.pinyin}</p>
                </>
              ) : (
                <p className="text-sm font-bold text-ink/45">
                  Answer hidden. Produce the Chinese sentence out loud before revealing.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReverseTranslationPractice({
  allStepsDone,
  lessonCompleted,
  onCompleteLesson,
  progress,
  resetProgress,
  sentences,
  speak,
  vocab
}: {
  allStepsDone: boolean;
  lessonCompleted: boolean;
  onCompleteLesson: () => void;
  progress: LocalProgress;
  resetProgress: () => void;
  sentences: GeneratedSentence[];
  speak: SpeakFn;
  vocab: VocabularyItem[];
}) {
  const dueCount = progress.due_review_ids.length + progress.weak_words.length + progress.weak_patterns.length;
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const prompts = sentences.slice(0, Math.max(5, Math.min(sentences.length, 10)));

  function toggleReveal(text: string) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-lg bg-jade-50 p-5 ring-1 ring-jade-500/20">
        <p className="text-sm font-black text-jade-700">Reverse sentence builder</p>
        <h3 className="mt-2 text-2xl font-black text-ink">Create Chinese from English</h3>
        <p className="mt-2 font-semibold text-ink/65">
          This is the output test: read the English, write or say the Chinese from memory, then reveal the model.
        </p>
        <div className="mt-4 grid gap-3">
          {prompts.map((sentence, index) => {
            const isRevealed = revealed.has(sentence.text);
            return (
            <div className="rounded-lg bg-white p-4 ring-1 ring-black/10" key={`${sentence.text}-${index}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-jade-700">Prompt {index + 1}</p>
                  <p className="mt-1 text-lg font-black text-ink">{sentence.translation_en}</p>
                  {sentence.translation_ko && <p className="text-sm font-semibold text-ink/50">{sentence.translation_ko}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => toggleReveal(sentence.text)} size="sm" variant="secondary">
                    {isRevealed ? "Hide model" : "Reveal model"}
                  </Button>
                  <Button onClick={() => speak(sentence.text, "sentence", sentence.audio_id)} size="sm" variant="warm">
                    <Volume2 className="h-4 w-4" />
                    Play
                  </Button>
                </div>
              </div>
              <textarea
                className="mt-3 min-h-20 w-full rounded-lg border border-ink/15 bg-paper p-3 han text-xl font-bold outline-none focus:border-jade-600"
                onChange={(event) => setAnswers((current) => ({ ...current, [sentence.text]: event.target.value }))}
                placeholder="Write the Chinese sentence here before revealing."
                value={answers[sentence.text] ?? ""}
              />
              {isRevealed && (
                <div className="mt-3 rounded-lg bg-jade-50 p-3">
                  <ClickableChineseLine
                    className="text-2xl font-black text-ink"
                    speak={speak}
                    text={sentence.text}
                    vocab={vocab}
                  />
                  <p className="mt-1 font-black text-jade-700">{sentence.pinyin}</p>
                </div>
              )}
            </div>
          )})}
        </div>
      </div>
      <div className="space-y-3">
        <MetricCard label="Weak items" value={`${dueCount}`} icon={RotateCcw} />
        <MetricCard label="Streak" value={`${progress.streak.count} days`} icon={Flame} />
        <Button
          className="w-full"
          disabled={lessonCompleted || !allStepsDone}
          onClick={onCompleteLesson}
          variant={lessonCompleted ? "secondary" : "default"}
        >
          <Check className="h-4 w-4" />
          {lessonCompleted ? "Lesson recorded" : allStepsDone ? "Complete daily lesson" : "Finish all steps first"}
        </Button>
        <Button className="w-full" onClick={resetProgress} variant="ghost">
          Reset local progress
        </Button>
      </div>
    </div>
  );
}

function ReferenceStrip({
  grammar,
  onSelectPattern,
  onSelectVocab,
  selectedWritingChar,
  setSelectedWritingChar,
  speak,
  vocab,
  writingRef,
  writing
}: {
  grammar: GrammarItem[];
  onSelectPattern: (grammar: GrammarItem) => void;
  onSelectVocab: (vocab: VocabularyItem) => void;
  selectedWritingChar: string | null;
  setSelectedWritingChar: (char: string) => void;
  speak: SpeakFn;
  vocab: VocabularyItem[];
  writingRef: React.RefObject<HTMLDivElement | null>;
  writing: WritingItem[];
}) {
  const activeWriting = selectedWritingChar && writing.some((item) => item.char === selectedWritingChar)
    ? selectedWritingChar
    : writing[0]?.char ?? "";
  const writingItem = writing.find((item) => item.char === activeWriting) ?? writing[0];
  const relatedWords = writingItem
    ? vocab.filter((item) => item.char.includes(writingItem.char))
    : [];

  useEffect(() => {
    if (writing.length === 0) return;
    if (!activeWriting || !writing.some((item) => item.char === activeWriting)) {
      setSelectedWritingChar(writing[0].char);
    }
  }, [activeWriting, setSelectedWritingChar, writing]);

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div ref={writingRef}>
      <Card className="bg-white/90">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-jade-700" />
            <p className="text-sm font-black text-jade-700">Words and patterns used today</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase text-ink/45">Words used today</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {vocab.map((item) => (
                <button
                  className="rounded-full bg-jade-50 px-3 py-2 han text-base font-black text-jade-900 ring-1 ring-jade-500/20"
                  key={item.id}
                  onClick={() => onSelectVocab(item)}
                  type="button"
                >
                  {item.char}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase text-ink/45">Patterns</p>
            <div className="mt-2 grid gap-2">
              {grammar.map((item) => (
                <button
                  className="rounded-lg bg-black/[0.035] p-3 text-left font-black transition hover:bg-black/10"
                  key={item.id}
                  onClick={() => onSelectPattern(item)}
                  type="button"
                >
                  {item.pattern}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      <Card className="bg-white/90">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-jade-700" />
            <p className="text-sm font-black text-jade-700">Writing support</p>
          </div>
        </CardHeader>
        <CardContent>
          {writing.length === 0 || !writingItem ? (
            <EmptyState text="No writing items are attached to this lesson yet." />
          ) : (
            <div className="grid gap-4 md:grid-cols-[9rem_minmax(0,1fr)]">
              <div className="grid grid-cols-3 gap-2 md:grid-cols-2">
                {writing.map((item) => (
                  <button
                    className={cn(
                      "aspect-square rounded-lg han text-3xl font-black transition",
                      item.char === writingItem.char ? "bg-ink text-white" : "bg-black/[0.035] hover:bg-black/10"
                    )}
                    key={item.char}
                    onClick={() => setSelectedWritingChar(item.char)}
                    type="button"
                  >
                    {item.char}
                  </button>
                ))}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="grid h-24 w-24 place-items-center rounded-lg bg-paper ring-1 ring-black/10">
                    <span className="han text-6xl font-black text-ink">{writingItem.char}</span>
                  </div>
                  <div>
                    <Badge>Radical {writingItem.radical}</Badge>
                    <p className="mt-2 text-xl font-black text-ink">{writingItem.stroke_count} strokes</p>
                    <Button className="mt-2" onClick={() => speak(writingItem.char, "word")} size="sm" variant="secondary">
                      <Volume2 className="h-4 w-4" />
                      Play
                    </Button>
                  </div>
                </div>
                <StrokeAnimation char={writingItem.char} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {writingItem.strokes.map((stroke, index) => (
                    <span
                      className="rounded-lg bg-jade-50 px-3 py-2 text-sm font-bold text-jade-900 ring-1 ring-jade-500/20"
                      key={`${stroke}-${index}`}
                    >
                      {index + 1}. {stroke}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ReferenceLink href={`https://www.strokeorder.com/chinese/${encodeURIComponent(writingItem.char)}`}>
                    StrokeOrder
                  </ReferenceLink>
                  <ReferenceLink
                    href={`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${encodeURIComponent(writingItem.char)}`}
                  >
                    MDBG
                  </ReferenceLink>
                </div>
                <div className="mt-5">
                  <p className="text-xs font-black uppercase text-ink/45">Words with this character</p>
                  {relatedWords.length === 0 ? (
                    <p className="mt-2 text-sm font-semibold text-ink/50">No related word is visible in today's lesson.</p>
                  ) : (
                    <div className="mt-2 grid gap-2">
                      {relatedWords.map((item) => (
                        <div className="rounded-lg bg-white p-3 ring-1 ring-black/10" key={item.id}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <button
                              className="text-left"
                              onClick={() => onSelectVocab(item)}
                              type="button"
                            >
                              <span className="han block text-2xl font-black text-ink">{item.char}</span>
                              <span className="block text-sm font-black text-jade-700">{item.pinyin}</span>
                              <span className="block text-sm font-semibold text-ink">{item.meaning_en}</span>
                              {item.meaning_ko && <span className="block text-xs font-semibold text-ink/50">{item.meaning_ko}</span>}
                            </button>
                            <AudioButton label={`Play ${item.char}`} onClick={() => speak(item.char, "word", item.audio_id)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type HanziWriterInstance = {
  animateCharacter: () => void;
  hideCharacter: (options?: { duration?: number }) => void;
};

type HanziWriterApi = {
  create: (
    target: string,
    character: string,
    options: {
      charDataLoader?: (
        character: string,
        onComplete: (data: unknown) => void,
        onError: (reason?: unknown) => void
      ) => void;
      delayBetweenStrokes?: number;
      height: number;
      padding?: number;
      showCharacter?: boolean;
      showOutline?: boolean;
      strokeAnimationSpeed?: number;
      width: number;
    }
  ) => HanziWriterInstance;
};

function StrokeAnimation({ char }: { char: string }) {
  const reactId = useId();
  const targetId = useMemo(() => `hanzi-writer-${reactId.replace(/:/g, "")}`, [reactId]);
  const writerRef = useRef<HanziWriterInstance | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const strokeOrderHref = `https://www.strokeorder.com/chinese/${encodeURIComponent(char)}`;

  useEffect(() => {
    let cancelled = false;
    const target = document.getElementById(targetId);
    if (target) target.innerHTML = "";
    setStatus("loading");

    loadHanziWriter()
      .then((HanziWriter) => {
        if (cancelled) return;
        writerRef.current = HanziWriter.create(targetId, char, {
          width: 154,
          height: 154,
          padding: 8,
          charDataLoader: (character, onComplete, onError) => {
            fetch(getHanziWriterDataUrl(character))
              .then((response) => {
                if (!response.ok) throw new Error(`Stroke data returned ${response.status}`);
                return response.json();
              })
              .then(onComplete)
              .catch((error) => {
                if (!cancelled) setStatus("error");
                onError(error);
              });
          },
          showOutline: true,
          showCharacter: false,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 500
        });
        writerRef.current.animateCharacter();
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [char, targetId]);

  function replay() {
    writerRef.current?.hideCharacter({ duration: 0 });
    writerRef.current?.animateCharacter();
  }

  return (
    <div className="mt-4 rounded-lg bg-paper p-4 ring-1 ring-black/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-ink/45">Stroke animation</p>
          <p className="mt-1 text-sm font-semibold text-ink/55">
            Real stroke-order data loads online for the selected character.
          </p>
        </div>
        <Button disabled={status !== "ready"} onClick={replay} size="sm" variant="secondary">
          Replay
        </Button>
      </div>
      <div className="mt-3 grid min-h-40 place-items-center rounded-lg bg-white">
        <div id={targetId} />
        {status === "loading" && <p className="text-sm font-bold text-ink/45">Loading stroke data...</p>}
        {status === "error" && (
          <div className="px-4 text-center">
            <p className="text-sm font-bold text-ink/45">
              Stroke animation data could not load. The external character-data request may be blocked or missing.
            </p>
            <a
              className="mt-2 inline-flex rounded-lg bg-white px-3 py-2 text-sm font-black text-jade-700 ring-1 ring-black/10 hover:bg-jade-50"
              href={strokeOrderHref}
              rel="noreferrer"
              target="_blank"
            >
              Open StrokeOrder fallback
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function getHanziWriterDataUrl(char: string) {
  return `https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${encodeURIComponent(char)}.json`;
}

function loadHanziWriter(): Promise<HanziWriterApi> {
  if (typeof window === "undefined") return Promise.reject(new Error("No browser"));
  const existing = (window as typeof window & { HanziWriter?: HanziWriterApi }).HanziWriter;
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const current = document.querySelector<HTMLScriptElement>("script[data-hanzi-writer]");
    if (current) {
      current.addEventListener("load", () => {
        const loaded = (window as typeof window & { HanziWriter?: HanziWriterApi }).HanziWriter;
        if (loaded) resolve(loaded);
        else reject(new Error("Hanzi Writer did not initialize"));
      });
      current.addEventListener("error", () => reject(new Error("Hanzi Writer failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js";
    script.async = true;
    script.dataset.hanziWriter = "true";
    script.onload = () => {
      const loaded = (window as typeof window & { HanziWriter?: HanziWriterApi }).HanziWriter;
      if (loaded) resolve(loaded);
      else reject(new Error("Hanzi Writer did not initialize"));
    };
    script.onerror = () => reject(new Error("Hanzi Writer failed to load"));
    document.head.appendChild(script);
  });
}

function SentenceWithTokens({
  onSelectVocab,
  sentence,
  speak,
  vocab
}: {
  onSelectVocab: (vocab: VocabularyItem) => void;
  sentence: SentenceItem;
  speak: SpeakFn;
  vocab: VocabularyItem[];
}) {
  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-black/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ClickableChineseLine
            className="text-3xl font-black text-ink"
            speak={speak}
            text={sentence.text}
            vocab={vocab}
          />
          <p className="mt-1 text-lg font-black text-jade-700">{sentence.pinyin}</p>
          <p className="mt-1 font-bold text-ink">{sentence.translation_en}</p>
          <p className="text-sm font-semibold text-ink/50">{sentence.translation_ko}</p>
        </div>
        <AudioButton label={`Play ${sentence.text}`} onClick={() => speak(sentence.text, "sentence", sentence.audio_id)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {sentence.tokens.map((token) => {
          const item = findVocabForToken(vocab, token);
          return (
            <button
              className="rounded-full bg-jade-50 px-3 py-2 han text-base font-black text-jade-900 ring-1 ring-jade-500/20 transition hover:bg-jade-100"
              disabled={!item}
              key={token}
              onClick={() => item && onSelectVocab(item)}
              type="button"
            >
              {token}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SentenceCard({
  pinyin,
  speak,
  text,
  translationEn,
  translationKo,
  vocab,
  audioId
}: {
  audioId?: string;
  pinyin: string;
  speak: SpeakFn;
  text: string;
  translationEn: string;
  translationKo?: string;
  vocab?: VocabularyItem[];
}) {
  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-black/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          {vocab ? (
            <ClickableChineseLine
              className="text-2xl font-black text-ink"
              speak={speak}
              text={text}
              vocab={vocab}
            />
          ) : (
            <p className="han text-2xl font-black text-ink">{text}</p>
          )}
          <p className="mt-1 font-black text-jade-700">{pinyin}</p>
        </div>
        <AudioButton label={`Play ${text}`} onClick={() => speak(text, "sentence", audioId)} />
      </div>
      <p className="mt-3 font-bold text-ink">{translationEn}</p>
      {translationKo && <p className="text-sm font-semibold text-ink/50">{translationKo}</p>}
    </div>
  );
}

function ClickableChineseLine({
  className,
  speak,
  text,
  vocab
}: {
  className?: string;
  speak: SpeakFn;
  text: string;
  vocab: VocabularyItem[];
}) {
  const [selected, setSelected] = useState<VocabularyItem | null>(null);
  const segments = useMemo(() => segmentChineseText(text, vocab), [text, vocab]);

  useEffect(() => setSelected(null), [text]);

  return (
    <div>
      <div className={cn("han leading-tight", className)}>
        {segments.map((segment, index) =>
          segment.item ? (
            <button
              className="inline rounded-md px-1 text-left align-baseline transition hover:bg-jade-100 hover:text-jade-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-jade-500"
              key={`${segment.text}-${index}`}
              onClick={() =>
                setSelected((current) => (current?.id === segment.item?.id ? null : segment.item ?? null))
              }
              title={`${segment.item.pinyin} - ${segment.item.meaning_en}`}
              type="button"
            >
              {segment.text}
            </button>
          ) : (
            <span key={`${segment.text}-${index}`}>{segment.text}</span>
          )
        )}
      </div>
      {selected && (
        <div className="mt-3 rounded-lg bg-jade-50 p-4 ring-1 ring-jade-500/20">
          <div className="mb-3 flex items-center justify-between gap-3">
            <AudioButton label={`Play ${selected.char}`} onClick={() => speak(selected.char, "word", selected.audio_id)} />
            <Button aria-label="Close word detail" onClick={() => setSelected(null)} size="icon" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <VocabInfoBox hideAudio item={selected} speak={speak} />
        </div>
      )}
    </div>
  );
}

function PatternDetail({
  grammar,
  sentences,
  speak,
  vocab
}: {
  grammar: GrammarItem;
  sentences: SentenceItem[];
  speak: SpeakFn;
  vocab: VocabularyItem[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {tokenizePattern(grammar.pattern).map((token, index) => (
          <span
            className={cn(
              "rounded-lg px-3 py-2 text-lg font-black",
              token === "+" ? "bg-transparent px-0 text-ink/40" : "bg-jade-50 text-jade-900"
            )}
            key={`${token}-${index}`}
          >
            {token}
          </span>
        ))}
      </div>
      <p className="font-semibold text-ink/70">{grammar.explanation_en}</p>
      {grammar.slots && grammar.slots.length > 0 && (
        <div className="grid gap-3">
          {grammar.slots.map((slot) => (
            <div className="rounded-lg bg-black/[0.035] p-3" key={slot.name}>
              <p className="text-xs font-black uppercase text-ink/45">{slot.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {slot.values.map((value) => (
                  <button
                    className="rounded-lg bg-white px-3 py-2 text-left shadow-sm ring-1 ring-black/10"
                    key={value.text}
                    onClick={() => speak(value.text, "word")}
                    type="button"
                  >
                    <span className="han block text-lg font-black">{value.text}</span>
                    <span className="block text-sm font-bold text-jade-700">{value.pinyin}</span>
                    <span className="block text-sm font-semibold text-ink/50">{value.meaning_en}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {getPatternExamples(grammar, sentences).map((example) => (
        <SentenceCard
          audioId={example.audio_id}
          key={example.text}
          pinyin={example.pinyin}
          speak={speak}
          text={example.text}
          translationEn={example.translation_en}
          translationKo={example.translation_ko}
          vocab={vocab}
        />
      ))}
    </div>
  );
}

function VocabInfoBox({
  afterShowWriting,
  hideAudio = false,
  item,
  speak
}: {
  afterShowWriting?: () => void;
  hideAudio?: boolean;
  item: VocabularyItem;
  speak: SpeakFn;
}) {
  const writingChars = Array.from(item.char).filter(isLikelyChinese);
  function showWriting(char: string) {
    requestWritingFocus(char);
    afterShowWriting?.();
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="han text-5xl font-black text-ink">{item.char}</div>
          <p className="mt-1 text-xl font-black text-jade-700">{item.pinyin}</p>
          <p className="mt-3 text-lg font-bold text-ink">{item.meaning_en}</p>
          <p className="text-sm font-semibold text-ink/50">{item.meaning_ko}</p>
        </div>
        {!hideAudio && <AudioButton label={`Play ${item.char}`} onClick={() => speak(item.char, "word", item.audio_id)} />}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoTile label="Role" value={item.pos} />
        <InfoTile label="Use" value={`${item.frequency} frequency`} />
      </div>
      {writingChars.length > 0 && (
        <div className="mt-5 rounded-lg bg-white/70 p-3 ring-1 ring-black/10">
          <p className="text-xs font-black uppercase text-ink/45">Writing</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button onClick={() => showWriting(writingChars[0])} size="sm" variant="secondary">
              <PenLine className="h-4 w-4" />
              Show writing
            </Button>
            {writingChars.map((char) => (
              <button
                className="grid h-9 w-9 place-items-center rounded-lg bg-jade-50 han text-lg font-black text-jade-900 ring-1 ring-jade-500/20 hover:bg-jade-100"
                key={char}
                onClick={() => showWriting(char)}
                type="button"
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailDrawer({
  children,
  onClose,
  title
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/25 p-4 sm:place-items-center">
      <div className="w-full max-w-xl rounded-lg bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-black text-ink">{title}</h3>
          <Button onClick={onClose} size="sm" variant="ghost">
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HelpDrawer({ onClose }: { onClose: () => void }) {
  return (
    <AppDrawer onClose={onClose} title="How to use this page">
      <div className="grid gap-4">
        <GuideBlock
          title="Daily loop"
          text="Start at Grammar & examples, move down the loop, and mark each step practiced only after you have spoken out loud."
        />
        <GuideBlock
          title="Clickable Chinese"
          text="Click Chinese words inside examples to see meaning, pinyin, audio, and writing shortcuts without leaving the lesson."
        />
        <GuideBlock
          title="Audio"
          text="Use Slow for new sentences, Shadow for repeating after the model, and Normal when the sentence feels familiar."
        />
        <GuideBlock
          title="Writing"
          text="Use Show writing from any word detail, then trace the selected character and review related words that contain it."
        />
        <GuideBlock
          title="Repository"
          text="Open Repository when you want to search everything in Month 1 instead of only today's lesson."
        />
      </div>
    </AppDrawer>
  );
}

function GuideBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg bg-jade-50 p-4 ring-1 ring-jade-500/20">
      <p className="font-black text-ink">{title}</p>
      <p className="mt-1 text-sm font-semibold text-ink/65">{text}</p>
    </div>
  );
}

function RepositoryDrawer({
  data,
  onClose,
  onOpenPrintSheet,
  speak
}: {
  data: CourseData;
  onClose: () => void;
  onOpenPrintSheet: (sheet: PrintableSheet) => void;
  speak: SpeakFn;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"words" | "sentences" | "grammar">("words");
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const repositoryVocab = useMemo(() => mergeVocab(data.vocab, SUPPLEMENTAL_VISIBLE_VOCAB), [data.vocab]);
  const normalizedQuery = query.trim().toLowerCase();
  const wordEntries = useMemo(() => buildWordRepositoryEntries(data, repositoryVocab), [data, repositoryVocab]);
  const sentenceEntries = useMemo(() => buildSentenceRepositoryEntries(data), [data]);
  const grammarEntries = useMemo(() => buildGrammarRepositoryEntries(data), [data]);
  const words = wordEntries.filter((entry) => matchesVocab(entry.item, normalizedQuery));
  const sentences = sentenceEntries.filter((entry) => matchesSentence(entry.item, normalizedQuery));
  const grammar = grammarEntries.filter((entry) => matchesGrammar(entry.item, normalizedQuery));
  const selectedWord = selectedWordId ? repositoryVocab.find((item) => item.id === selectedWordId) : null;

  useEffect(() => {
    if (tab !== "words") setSelectedWordId(null);
  }, [tab]);

  useEffect(() => {
    if (selectedWordId && !words.some((entry) => entry.item.id === selectedWordId)) setSelectedWordId(null);
  }, [selectedWordId, words]);

  return (
    <AppDrawer onClose={onClose} title="Repository" wide>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-h-11 flex-1 items-center gap-2 rounded-lg bg-white px-3 ring-1 ring-black/10">
            <Search className="h-4 w-4 text-ink/45" />
            <input
              className="w-full bg-transparent text-sm font-semibold outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Chinese, pinyin, English, Korean, or ID"
              value={query}
            />
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["words", "sentences", "grammar"] as const).map((item) => (
              <button
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-black capitalize transition",
                  tab === item ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-black/10 hover:bg-jade-50"
                )}
                key={item}
                onClick={() => setTab(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <Button onClick={() => onOpenPrintSheet(createPrintableVocabRepository(wordEntries))} size="sm" variant="secondary">
            <Printer className="h-4 w-4" />
            Print full vocab
          </Button>
        </div>

        {tab === "words" && (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="grid gap-2">
              {words.map(({ item, lesson }) => (
              <div
                className={cn(
                  "rounded-lg bg-white p-3 ring-1 ring-black/10 transition",
                  selectedWordId === item.id && "bg-jade-50 ring-jade-500/30"
                )}
                key={item.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setSelectedWordId((current) => (current === item.id ? null : item.id))}
                    type="button"
                  >
                    <p className="han text-3xl font-black text-ink">{item.char}</p>
                    <p className="font-black text-jade-700">{item.pinyin}</p>
                    <p className="font-semibold text-ink">{item.meaning_en}</p>
                    {item.meaning_ko && <p className="text-sm font-semibold text-ink/50">{item.meaning_ko}</p>}
                    <p className="mt-1 text-xs font-bold text-ink/40">
                      Day {lesson.order}: {lesson.title} · {item.example_ids.length} related sentences
                    </p>
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <AudioButton label={`Play ${item.char}`} onClick={() => speak(item.char, "word", item.audio_id)} />
                    <Button
                      onClick={() => setSelectedWordId((current) => (current === item.id ? null : item.id))}
                      size="sm"
                      variant="secondary"
                    >
                      {selectedWordId === item.id ? "Hide details" : "Details"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            </div>
            <div className="lg:sticky lg:top-4 lg:self-start">
              {selectedWord ? (
                <div className="rounded-lg bg-white p-4 ring-1 ring-jade-500/25">
                  <p className="mb-3 text-sm font-black uppercase text-jade-700">Word detail</p>
                  <VocabInfoBox
                    afterShowWriting={onClose}
                    item={selectedWord}
                    speak={speak}
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-ink/20 bg-white/70 p-4 text-sm font-bold text-ink/50">
                  Click any word to open its detail box here.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "sentences" && (
          <div className="grid gap-2">
            {sentences.map(({ item, lesson }) => (
              <div className="rounded-lg bg-white p-3 ring-1 ring-black/10" key={item.id}>
                <p className="mb-2 text-xs font-black uppercase text-jade-700">Day {lesson.order}: {lesson.title}</p>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <ClickableChineseLine
                      className="text-2xl font-black text-ink"
                      speak={speak}
                      text={item.text}
                      vocab={repositoryVocab}
                    />
                    <p className="mt-1 font-black text-jade-700">{item.pinyin}</p>
                    <p className="font-semibold text-ink">{item.translation_en}</p>
                    {item.translation_ko && <p className="text-sm font-semibold text-ink/50">{item.translation_ko}</p>}
                  </div>
                  <AudioButton label={`Play ${item.text}`} onClick={() => speak(item.text, "sentence", item.audio_id)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "grammar" && (
          <div className="grid gap-2">
            {grammar.map(({ item, lesson }) => (
              <div className="rounded-lg bg-white p-3 ring-1 ring-black/10" key={item.id}>
                <p className="mb-2 text-xs font-black uppercase text-jade-700">Day {lesson.order}: {lesson.title}</p>
                <p className="font-black text-ink">{item.pattern}</p>
                <p className="mt-1 text-sm font-semibold text-ink/65">{item.explanation_en}</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {getPatternExamples(item, data.sentences).slice(0, 2).map((example) => (
                    <SentenceCard
                      audioId={example.audio_id}
                      key={example.text}
                      pinyin={example.pinyin}
                      speak={speak}
                      text={example.text}
                      translationEn={example.translation_en}
                      translationKo={example.translation_ko}
                      vocab={repositoryVocab}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppDrawer>
  );
}

function AppDrawer({
  children,
  onClose,
  title,
  wide = false
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/25 p-4 sm:place-items-center">
      <div className={cn("max-h-[90vh] w-full overflow-auto rounded-lg bg-paper p-5 shadow-soft", wide ? "max-w-5xl" : "max-w-2xl")}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-black text-ink">{title}</h3>
          <Button aria-label={`Close ${title}`} onClick={onClose} size="icon" variant="ghost">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StepDoneButton({
  completed,
  onClick
}: {
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick} variant={completed ? "secondary" : "default"}>
      <Check className="h-4 w-4" />
      {completed ? "Undo practiced" : "Mark step practiced"}
    </Button>
  );
}

function AudioButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button aria-label={label} onClick={onClick} size="icon" title={label} type="button" variant="secondary">
      <Volume2 className="h-4 w-4" />
    </Button>
  );
}

function ReferenceLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-black/10 transition hover:bg-jade-50"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <ExternalLink className="h-4 w-4" />
      {children}
    </a>
  );
}

function createPrintableWordSheet(lesson: LessonItem, words: VocabularyItem[]): PrintableSheet {
  const uniqueWords = words.filter(uniqueVocab);
  const cards = uniqueWords.map((word, index) => renderPracticeWordCard(word, index)).join("");

  return {
    title: `Day ${lesson.order}: ${lesson.title}`,
    meta: `Printable Mandarin word practice sheet · ${uniqueWords.length} words from today's lesson context`,
    body: `<section class="word-sheet">${cards}</section>`,
    note: "Study routine: say the word, write each character inside the dotted Tian Zi Ge guides, then create one sentence aloud before moving to the next row."
  };
}

function createPrintableVocabRepository(entries: RepositoryEntry<VocabularyItem>[]): PrintableSheet {
  const grouped = entries.reduce<Array<{ lesson: LessonItem; words: VocabularyItem[] }>>((groups, entry) => {
    const current = groups[groups.length - 1];
    if (current?.lesson.id === entry.lesson.id) {
      current.words.push(entry.item);
    } else {
      groups.push({ lesson: entry.lesson, words: [entry.item] });
    }
    return groups;
  }, []);
  const body = grouped
    .map(
      (group) => `
        <section class="repo-day">
          <h2>Day ${group.lesson.order}: ${escapeHtml(group.lesson.title)}</h2>
          <div class="repo-grid">
            ${group.words.map((word) => renderRepositoryWordCard(word)).join("")}
          </div>
        </section>`
    )
    .join("");

  return {
    title: "Full Month 1 Vocabulary Repository",
    meta: `${entries.length} words ordered by first lesson appearance`,
    body,
    note: "Use this repository sheet for review. For handwriting-heavy practice, print an individual day sheet from the lesson header."
  };
}

function navigateToPrintSheet(sheet: PrintableSheet) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRINT_SHEET_KEY, JSON.stringify(sheet));
  window.location.href = resolveAppPath("/print/");
}

function renderPracticeWordCard(word: VocabularyItem, index: number) {
  const characters = Array.from(word.char).filter(isLikelyChinese);
  const characterPractice = characters
    .map((char) => {
      const practiceCells = Array.from({ length: 18 }, () => `<span class="practice-cell tian-cell"></span>`).join("");
      return `
        <div class="character-practice">
          <span class="model-cell tian-cell"><span>${escapeHtml(char)}</span></span>
          ${practiceCells}
        </div>`;
    })
    .join("");

  return `
    <article class="practice-card">
      <div class="word-info">
        <div class="number">${index + 1}</div>
        <div class="word-main">
          <div class="word">${escapeHtml(word.char)}</div>
          <div class="pinyin">${escapeHtml(word.pinyin)}</div>
          <div class="meaning">${escapeHtml(word.meaning_en)}</div>
          ${word.meaning_ko ? `<div class="ko">${escapeHtml(word.meaning_ko)}</div>` : ""}
        </div>
      </div>
      <div class="practice-lines">${characterPractice}</div>
    </article>`;
}

function renderRepositoryWordCard(word: VocabularyItem) {
  return `
    <article class="repo-card">
      <div class="repo-word">${escapeHtml(word.char)}</div>
      <div>
        <div class="pinyin">${escapeHtml(word.pinyin)}</div>
        <div class="meaning">${escapeHtml(word.meaning_en)}</div>
        ${word.meaning_ko ? `<div class="ko">${escapeHtml(word.meaning_ko)}</div>` : ""}
      </div>
    </article>`;
}

function PrintableSheetOverlay({ onClose, sheet }: { onClose: () => void; sheet: PrintableSheet }) {
  return (
    <div className="printable-sheet-overlay fixed inset-0 z-[60] bg-paper">
      <div className="print:hidden flex items-center justify-between gap-4 border-b border-black/10 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase text-jade-700">Printable sheet preview</p>
          <h3 className="text-lg font-black text-ink">{sheet.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => window.print()} variant="default">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
      <PrintableSheetStyles />
      <div className="printable-page h-[calc(100vh-69px)] overflow-auto p-5 print:h-auto print:overflow-visible print:p-0">
        <header>
          <div>
            <h1>{sheet.title}</h1>
            <p className="meta">{sheet.meta}</p>
          </div>
        </header>
        <div dangerouslySetInnerHTML={{ __html: sheet.body }} />
        <p className="note">{sheet.note}</p>
      </div>
    </div>
  );
}

function PrintableSheetStyles() {
  return (
    <style>{`
      @page { margin: 10mm; size: letter landscape; }
      .printable-page { --cell: 48px; background: #fff; color: #17211c; font-family: Arial, "Noto Sans TC", "Microsoft JhengHei", sans-serif; }
      .printable-page * { box-sizing: border-box; }
      .printable-page header { align-items: center; border-bottom: 2px solid #17211c; display: flex; justify-content: space-between; gap: 16px; padding-bottom: 10px; }
      .printable-page h1 { font-size: 22px; margin: 0 0 4px; }
      .printable-page h2 { break-after: avoid; border-bottom: 1px solid #b8c7bf; font-size: 15px; margin: 12px 0 6px; padding-bottom: 4px; }
      .printable-page p { margin: 0; }
      .printable-page .meta { color: #496157; font-size: 13px; font-weight: 700; }
      .printable-page .word-sheet { display: grid; gap: 8px; margin-top: 14px; }
      .printable-page .practice-card { break-inside: avoid; border: 1.5px solid #9fb0a8; border-radius: 8px; display: grid; gap: 10px; grid-template-columns: 140px minmax(0, 1fr); padding: 7px; }
      .printable-page .word-info { align-items: start; display: grid; gap: 7px; grid-template-columns: 22px minmax(0, 1fr); }
      .printable-page .number { color: #62756d; font-size: 12px; font-weight: 900; text-align: center; }
      .printable-page .word { font-family: "Noto Serif TC", "Microsoft JhengHei", serif; font-size: 28px; font-weight: 900; line-height: 1.05; }
      .printable-page .pinyin { color: #0f766e; font-size: 15px; font-weight: 900; line-height: 1.15; }
      .printable-page .meaning { font-size: 12px; font-weight: 800; line-height: 1.25; margin-top: 3px; }
      .printable-page .ko { color: #68766f; font-size: 11px; font-weight: 700; line-height: 1.2; margin-top: 2px; }
      .printable-page .practice-lines { display: grid; gap: 4px; min-width: 0; }
      .printable-page .character-practice { align-items: start; display: grid; gap: 5px; grid-template-columns: repeat(auto-fit, minmax(var(--cell), var(--cell))); min-width: 0; }
      .printable-page .tian-cell { background: #fff; border: 1.35px solid #54655d; display: inline-flex; height: var(--cell); justify-content: center; position: relative; width: var(--cell); }
      .printable-page .tian-cell::before, .printable-page .tian-cell::after { content: ""; left: 0; pointer-events: none; position: absolute; top: 0; }
      .printable-page .tian-cell::before { border-top: 1px dotted #9baaa3; top: 50%; width: 100%; }
      .printable-page .tian-cell::after { border-left: 1px dotted #9baaa3; height: 100%; left: 50%; }
      .printable-page .model-cell { align-items: center; background: #f7fbf9; color: #25342d; font-family: "Noto Serif TC", "Microsoft JhengHei", serif; font-size: 32px; font-weight: 900; }
      .printable-page .model-cell span { position: relative; z-index: 1; }
      .printable-page .repo-day { break-inside: avoid; }
      .printable-page .repo-grid { display: grid; gap: 5px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
      .printable-page .repo-card { align-items: center; border: 1px solid #b8c7bf; border-radius: 6px; display: grid; gap: 7px; grid-template-columns: 52px minmax(0, 1fr); min-height: 48px; padding: 5px; }
      .printable-page .repo-word { font-family: "Noto Serif TC", "Microsoft JhengHei", serif; font-size: 26px; font-weight: 900; line-height: 1; }
      .printable-page .note { border-top: 1px solid #b8c7bf; color: #62756d; font-size: 12px; font-weight: 700; margin-top: 14px; padding-top: 8px; }
      @media print {
        html, body { background: #fff !important; height: auto !important; overflow: visible !important; }
        main > :not(.printable-sheet-overlay) { display: none !important; }
        .printable-sheet-overlay { background: #fff !important; inset: auto !important; position: static !important; z-index: auto !important; }
        .printable-page { height: auto !important; overflow: visible !important; padding: 0 !important; }
      }
    `}</style>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-black/[0.035] p-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase text-ink/45">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-xl font-black text-ink">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/[0.035] p-3">
      <p className="text-xs font-black uppercase text-ink/45">{label}</p>
      <p className="mt-1 break-words font-bold text-ink">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-ink/20 bg-black/[0.02] p-5 text-sm font-bold text-ink/50">
      {text}
    </div>
  );
}

function useLocalProgress() {
  const [progress, setProgressState] = useState<LocalProgress>(emptyProgress);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LocalProgress;
      if (parsed?.version === 1) setProgressState(normalizeProgress(parsed));
    } catch {
      setProgressState(emptyProgress);
    }
  }, []);

  function setProgress(updater: LocalProgress | ((current: LocalProgress) => LocalProgress)) {
    setProgressState((current) => {
      const next = normalizeProgress(typeof updater === "function" ? updater(current) : updater);
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      return next;
    });
  }

  return [progress, setProgress] as const;
}

function useMandarinAudio(audioManifest: AudioItem[], speed: AudioSpeed) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const ttsTimer = useRef<number | null>(null);
  const speedRef = useRef(speed);
  const activeAudio = useRef<HTMLAudioElement | null>(null);
  const audioById = useMemo(
    () => new Map(audioManifest.map((item) => [item.id, item])),
    [audioManifest]
  );

  useEffect(() => {
    speedRef.current = speed;
    if (activeAudio.current) {
      activeAudio.current.playbackRate = AUDIO_SPEEDS[speed].playbackRate;
    }
  }, [speed]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      if (ttsTimer.current !== null) window.clearTimeout(ttsTimer.current);
      activeAudio.current?.pause();
    };
  }, []);

  const voice = useMemo(() => chooseMandarinVoice(voices), [voices]);

  function speak(text: string, mode: SpeechMode = "word", audioId?: string) {
    if (typeof window === "undefined" || !text.trim()) return;

    const playTts = () => {
      if (ttsTimer.current !== null) window.clearTimeout(ttsTimer.current);
      activeAudio.current?.pause();
      ttsTimer.current = speakWithTts(
        text,
        mode,
        speedRef.current,
        voice ?? chooseMandarinVoice(window.speechSynthesis?.getVoices?.() ?? [])
      );
    };
    const entry = audioId ? audioById.get(audioId) : undefined;
    if (entry && (entry.status === "recorded" || entry.status === "generated") && entry.path) {
      if (ttsTimer.current !== null) window.clearTimeout(ttsTimer.current);
      window.speechSynthesis?.cancel();
      activeAudio.current?.pause();
      const audio = new Audio(resolveAudioPath(entry.path));
      activeAudio.current = audio;
      audio.preload = "auto";
      audio.playbackRate = AUDIO_SPEEDS[speedRef.current].playbackRate;
      audio.onerror = playTts;
      void audio.play().catch(playTts);
      return;
    }

    playTts();
  }

  return { speak };
}

function speakWithTts(
  text: string,
  mode: SpeechMode,
  speed: AudioSpeed,
  voice: SpeechSynthesisVoice | null
): number | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return null;

  const profile = AUDIO_SPEEDS[speed];
  const createUtterance = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang ?? "zh-TW";
    utterance.rate =
      mode === "sentence"
        ? text.length > 12
          ? profile.longSentenceRate
          : profile.sentenceRate
        : profile.wordRate;
    utterance.pitch = 1;
    if (voice) utterance.voice = voice;
    return utterance;
  };

  const synth = window.speechSynthesis;
  synth.cancel();
  synth.resume();
  synth.speak(createUtterance());

  return window.setTimeout(() => {
    if (synth.speaking || synth.pending) return;
    synth.resume();
    synth.speak(createUtterance());
  }, 120);
}

function resolveAudioPath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return normalized;
  const basePath = window.location.pathname.startsWith("/LearningMandarin") ? "/LearningMandarin" : "";
  return `${basePath}${normalized}`;
}

function resolveAppPath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return normalized;
  const basePath = window.location.pathname.startsWith("/LearningMandarin") ? "/LearningMandarin" : "";
  return `${basePath}${normalized}`;
}

function chooseMandarinVoice(voices: SpeechSynthesisVoice[]) {
  const chineseVoices = voices.filter((voice) => /^zh/i.test(voice.lang));
  const preferred = ["hanhan", "ting-ting", "xiaoxiao", "xiaoyi", "yunjian", "mandarin", "chinese"];

  return (
    chineseVoices.find((voice) => preferred.some((name) => voice.name.toLowerCase().includes(name))) ??
    chineseVoices.find((voice) => voice.lang.toLowerCase().startsWith("zh-tw")) ??
    chineseVoices.find((voice) => voice.lang.toLowerCase().startsWith("zh-cn")) ??
    chineseVoices[0] ??
    null
  );
}

function buildLessonPack(data: CourseData, lesson: LessonItem) {
  const lookupVocab = mergeVocab(data.vocab, SUPPLEMENTAL_VISIBLE_VOCAB);
  const vocab = lookupVocab.filter((item) => lesson.vocab_ids.includes(item.id));
  const sentences = data.sentences.filter((item) => lesson.sentence_ids.includes(item.id));
  const grammar = data.grammar.filter((item) => lesson.grammar_ids.includes(item.id));
  const pronunciation = data.pronunciation.filter((item) => lesson.pronunciation_ids.includes(item.id));
  const contextVocab = collectContextVocab(lookupVocab, sentences, grammar);
  const writingChars = new Set<string>();
  sentences.forEach((sentence) => {
    Array.from(sentence.text).forEach((char) => {
      if (isLikelyChinese(char)) writingChars.add(char);
    });
  });
  contextVocab.forEach((item) => {
    Array.from(item.char).forEach((char) => {
      if (isLikelyChinese(char)) writingChars.add(char);
    });
  });
  const writing = data.writing.filter((item) => writingChars.has(item.char));

  return { vocab, contextVocab, sentences, grammar, pronunciation, writing };
}

type GeneratedSentence = {
  audio_id?: string;
  text: string;
  pinyin: string;
  translation_en: string;
  translation_ko?: string;
  source: "authored" | "generated" | "mixed";
};

function buildGeneratedSentences(
  data: CourseData,
  lesson: LessonItem,
  pack: LessonPack,
  allVocab: VocabularyItem[]
): GeneratedSentence[] {
  const authored = pack.sentences.map((sentence) => ({
    audio_id: sentence.audio_id,
    text: sentence.text,
    pinyin: sentence.pinyin,
    translation_en: sentence.translation_en,
    translation_ko: sentence.translation_ko,
    source: "authored" as const
  }));
  const drills = pack.grammar.flatMap((grammar) =>
    (grammar.drill_examples ?? []).map((example) => ({
      text: example.text,
      pinyin: example.pinyin,
      translation_en: example.translation_en,
      translation_ko: example.translation_ko,
      source: "generated" as const
    }))
  );
  const mixed = buildMixedSentences(data, lesson, allVocab);

  const seen = new Set<string>();
  return [...authored, ...drills, ...mixed].filter((sentence) => {
    if (seen.has(sentence.text)) return false;
    seen.add(sentence.text);
    return true;
  });
}

function getPatternExamples(grammar: GrammarItem, sentenceBank: SentenceItem[] = []): GeneratedSentence[] {
  const authored = grammar.example_ids
    .map((id) => sentenceBank.find((sentence) => sentence.id === id))
    .filter((sentence): sentence is SentenceItem => Boolean(sentence))
    .map((sentence) => ({
      audio_id: sentence.audio_id,
      text: sentence.text,
      pinyin: sentence.pinyin,
      translation_en: sentence.translation_en,
      translation_ko: sentence.translation_ko,
      source: "authored" as const
    }));
  const drills = (grammar.drill_examples ?? []).map((example) => ({
    text: example.text,
    pinyin: example.pinyin,
    translation_en: example.translation_en,
    translation_ko: example.translation_ko,
    source: "generated" as const
  }));
  const seen = new Set<string>();

  return [...authored, ...drills]
    .filter((example) => isAlignedPatternExample(grammar.pattern, example.text))
    .filter((example) => {
      if (seen.has(example.text)) return false;
      seen.add(example.text);
      return true;
    });
}

function buildMixedSentences(data: CourseData, lesson: LessonItem, allVocab: VocabularyItem[]): GeneratedSentence[] {
  const learnedIds = new Set<string>();
  const learnedSentences = data.lessons
    .filter((item) => item.order <= lesson.order)
    .flatMap((item) => {
      item.vocab_ids.forEach((id) => learnedIds.add(id));
      return item.sentence_ids;
    });

  data.sentences
    .filter((sentence) => learnedSentences.includes(sentence.id))
    .forEach((sentence) => {
      segmentChineseText(sentence.text, allVocab).forEach((segment) => {
        if (segment.item) learnedIds.add(segment.item.id);
      });
    });

  const vocab = allVocab.filter((item) => learnedIds.has(item.id));
  const exact = (char: string) => vocab.find((item) => item.char === char);
  const has = (char: string) => Boolean(exact(char));
  const findOne = (...chars: string[]) => chars.map(exact).find(Boolean);
  const byMeaning = (needles: string[]) =>
    vocab.filter((item) => needles.some((needle) => item.meaning_en.toLowerCase().includes(needle)));
  const take = (items: VocabularyItem[], offset = 0) => items[(lesson.order + offset) % Math.max(items.length, 1)];

  const pronouns = ["我", "你", "他", "她", "我們", "他們"].map(exact).filter(Boolean) as VocabularyItem[];
  const numbers = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "兩"].map(exact).filter(Boolean) as VocabularyItem[];
  const identities = [
    ...byMeaning(["student", "teacher", "person", "korean"]),
    ...["學生", "老師", "韓國人"].map(exact).filter(Boolean) as VocabularyItem[]
  ].filter(uniqueVocab);
  const foods = byMeaning(["water", "tea", "coffee", "rice", "noodle", "milk", "dish", "meat", "egg", "fish", "fruit", "apple"]);
  const objects = [
    ...foods,
    ...byMeaning(["book", "phone", "computer", "music", "character", "chinese", "bag", "table", "chair"])
  ].filter(uniqueVocab);
  const locations = [
    ...byMeaning(["home", "school", "hospital", "supermarket", "park", "shop", "taipei", "taichung", "here", "there"]),
    ...["家", "學校", "醫院", "超市", "公園", "台北", "台中", "這裡", "那裡"].map(exact).filter(Boolean) as VocabularyItem[]
  ].filter(uniqueVocab);
  const adjectives = byMeaning(["big", "small", "good", "many", "few", "hot", "cold", "happy", "busy", "fast"]);
  const timeWords = ["今天", "明天", "早上", "晚上", "今年"].map(exact).filter(Boolean) as VocabularyItem[];
  const verbs = ["喝", "吃", "看", "聽", "說", "寫", "學", "做", "去", "買", "喜歡"].map(exact).filter(Boolean) as VocabularyItem[];

  const mixed: GeneratedSentence[] = [];
  const add = (text: string, translation: string, translationKo?: string) => {
    if (!isSentenceBuildable(text, vocab)) return;
    mixed.push({
      text,
      pinyin: pinyinForText(text, vocab),
      translation_en: translation,
      translation_ko: translationKo,
      source: "mixed"
    });
  };

  const subject = take(pronouns, 0);
  const subject2 = take(pronouns, 2);
  const identity = take(identities, 1);
  const object = take(objects, 2);
  const object2 = take(objects, 5);
  const location = take(locations, 3);
  const adjective = take(adjectives, 4);
  const time = take(timeWords, 5);
  const number = take(numbers, 6);
  const verb = take(verbs, 7);

  if (subject && identity && has("是")) add(`${subject.char}是${identity.char}。`, `${cleanMeaning(subject)} is ${cleanMeaning(identity)}.`);
  if (identity && has("是") && has("嗎")) add(`你是${identity.char}嗎？`, `Are you ${cleanMeaning(identity)}?`);
  if (subject && object && has("的") && has("這") && has("是")) add(`這是${subject.char}的${object.char}。`, `This is ${cleanMeaning(subject)}'s ${cleanMeaning(object)}.`);
  if (subject && object && number && has("有")) add(`${subject.char}有${number.char}個${object.char}。`, `${cleanMeaning(subject)} has ${cleanMeaning(number)} ${cleanMeaning(object)}.`);
  if (subject && object && has("想") && has("喝")) add(`${subject.char}想喝${object.char}。`, `${cleanMeaning(subject)} wants to drink ${cleanMeaning(object)}.`);
  if (subject && object && has("要")) add(`${subject.char}要${object.char}。`, `${cleanMeaning(subject)} wants ${cleanMeaning(object)}.`);
  if (subject && object && has("喜歡")) add(`${subject.char}喜歡${object.char}。`, `${cleanMeaning(subject)} likes ${cleanMeaning(object)}.`);
  if (subject && object && verb) add(`${subject.char}${verb.char}${object.char}。`, `${cleanMeaning(subject)} ${cleanMeaning(verb)} ${cleanMeaning(object)}.`);
  if (subject2 && location && has("在")) add(`${subject2.char}在${location.char}。`, `${cleanMeaning(subject2)} is at ${cleanMeaning(location)}.`);
  if (subject && location && has("想") && has("去")) add(`${subject.char}想去${location.char}。`, `${cleanMeaning(subject)} wants to go to ${cleanMeaning(location)}.`);
  if (time && subject && object && has("喝")) add(`${time.char}${subject.char}喝${object.char}。`, `${cleanMeaning(time)}, ${cleanMeaning(subject)} drinks ${cleanMeaning(object)}.`);
  if (object && adjective && has("很")) add(`${object.char}很${adjective.char}。`, `${cleanMeaning(object)} is very ${cleanMeaning(adjective)}.`);
  if (subject && has("想") && has("什麼") && has("喝")) add(`${subject.char}想喝什麼？`, `What does ${cleanMeaning(subject)} want to drink?`);
  if (subject && location && has("哪裡") && has("在")) add(`${location.char}在哪裡？`, `Where is ${cleanMeaning(location)}?`);

  return mixed.slice(0, 16);
}

function getFreshMixedExamples(examples: GeneratedSentence[], grammar: GrammarItem, count: number) {
  const currentPatternExamples = new Set(getPatternExamples(grammar).map((example) => example.text));
  return examples
    .filter((example) => example.source === "mixed" && !currentPatternExamples.has(example.text))
    .slice(0, count);
}

function getDailyFlow(lesson: LessonItem): TrainerStep[] {
  const flow = (lesson.daily_flow as TrainerStep[] | undefined) ?? DEFAULT_DAILY_FLOW;
  return flow.map((step) =>
    step.kind === "review_summary" || step.id === "review_summary"
      ? { ...step, id: "reverse_translation", title: "Reverse sentence builder", kind: "reverse_translation" }
      : step
  );
}

function normalizeProgress(progress: LocalProgress): LocalProgress {
  return {
    version: 1,
    completed_lessons: progress.completed_lessons ?? {},
    lesson_steps: progress.lesson_steps ?? {},
    weak_words: Array.from(new Set(progress.weak_words ?? [])),
    weak_patterns: Array.from(new Set(progress.weak_patterns ?? [])),
    due_review_ids: Array.from(new Set(progress.due_review_ids ?? [])),
    streak: {
      count: progress.streak?.count ?? 0,
      last_study_date: progress.streak?.last_study_date ?? null
    }
  };
}

function toggleWeakItem(
  progress: LocalProgress,
  key: "weak_words" | "weak_patterns",
  id: string
): LocalProgress {
  const current = new Set(progress[key]);
  if (current.has(id)) current.delete(id);
  else current.add(id);

  const due = new Set(progress.due_review_ids);
  if (current.has(id)) due.add(id);
  else due.delete(id);

  return {
    ...progress,
    [key]: Array.from(current),
    due_review_ids: Array.from(due)
  };
}

function findVocabForToken(vocab: VocabularyItem[], token: string) {
  return (
    vocab.find((item) => item.char === token) ??
    vocab.find((item) => token.includes(item.char))
  );
}

function uniqueVocab(item: VocabularyItem, index: number, items: VocabularyItem[]) {
  return items.findIndex((candidate) => candidate.id === item.id) === index;
}

function cleanMeaning(item: VocabularyItem) {
  return item.meaning_en
    .split(";")[0]
    .replace(/^to /, "")
    .replace(/^a /, "")
    .replace(/^an /, "")
    .trim()
    .toLowerCase();
}

function isSentenceBuildable(text: string, vocab: VocabularyItem[]) {
  return segmentChineseText(text, vocab)
    .filter((segment) => isLikelyChinese(segment.text))
    .every((segment) => Boolean(segment.item));
}

function pinyinForText(text: string, vocab: VocabularyItem[]) {
  return segmentChineseText(text, vocab)
    .map((segment) => {
      if (segment.item) return segment.item.pinyin;
      if (/。/.test(segment.text)) return ".";
      if (/？/.test(segment.text)) return "?";
      if (/，/.test(segment.text)) return ",";
      return segment.text;
    })
    .join(" ")
    .replace(/\s+([,.?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function requestWritingFocus(char: string) {
  if (typeof window === "undefined" || !char) return;
  window.dispatchEvent(new CustomEvent(SHOW_WRITING_EVENT, { detail: char }));
}

function firstChineseChar(text: string) {
  return Array.from(text).find(isLikelyChinese) ?? "";
}

type RepositoryEntry<T> = {
  item: T;
  lesson: LessonItem;
};

function buildWordRepositoryEntries(data: CourseData, repositoryVocab: VocabularyItem[]): RepositoryEntry<VocabularyItem>[] {
  const entries: RepositoryEntry<VocabularyItem>[] = [];
  const seen = new Set<string>();
  const lessons = [...data.lessons].sort((a, b) => a.order - b.order);

  lessons.forEach((lesson) => {
    buildLessonPack(data, lesson).contextVocab.forEach((item) => {
      if (seen.has(item.id)) return;
      seen.add(item.id);
      entries.push({ item, lesson });
    });
  });

  const fallbackLesson = lessons[lessons.length - 1] ?? data.lessons[0];
  repositoryVocab.forEach((item) => {
    if (seen.has(item.id) || !fallbackLesson) return;
    seen.add(item.id);
    entries.push({ item, lesson: fallbackLesson });
  });

  return entries;
}

function buildSentenceRepositoryEntries(data: CourseData): RepositoryEntry<SentenceItem>[] {
  const sentenceById = new Map(data.sentences.map((item) => [item.id, item]));
  return [...data.lessons]
    .sort((a, b) => a.order - b.order)
    .flatMap((lesson) =>
      lesson.sentence_ids
        .map((id) => sentenceById.get(id))
        .filter((item): item is SentenceItem => Boolean(item))
        .map((item) => ({ item, lesson }))
    );
}

function buildGrammarRepositoryEntries(data: CourseData): RepositoryEntry<GrammarItem>[] {
  const grammarById = new Map(data.grammar.map((item) => [item.id, item]));
  const seen = new Set<string>();
  return [...data.lessons]
    .sort((a, b) => a.order - b.order)
    .flatMap((lesson) =>
      lesson.grammar_ids
        .map((id) => grammarById.get(id))
        .filter((item): item is GrammarItem => Boolean(item))
        .filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        })
        .map((item) => ({ item, lesson }))
    );
}

function matchesVocab(item: VocabularyItem, query: string) {
  if (!query) return true;
  return [item.id, item.char, item.pinyin, item.pinyin_numeric, item.meaning_en, item.meaning_ko, item.pos]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function matchesSentence(item: SentenceItem, query: string) {
  if (!query) return true;
  return [
    item.id,
    item.text,
    item.pinyin,
    item.pinyin_numeric,
    item.translation_en,
    item.translation_ko,
    item.tokens.join(" ")
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function matchesGrammar(item: GrammarItem, query: string) {
  if (!query) return true;
  return [
    item.id,
    item.pattern,
    item.explanation_en,
    item.structure.join(" "),
    item.drill_examples?.map((example) => `${example.text} ${example.pinyin} ${example.translation_en}`).join(" ") ?? ""
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function isAlignedPatternExample(pattern: string, sentenceText: string) {
  const markers = extractPatternMarkers(pattern);
  if (markers.length === 0) return true;
  return markers.some((marker) => sentenceText.includes(marker));
}

function extractPatternMarkers(pattern: string) {
  return Array.from(new Set(pattern.match(/[\u3400-\u9fff]+/g) ?? []));
}

function mergeVocab(primary: VocabularyItem[], supplemental: VocabularyItem[]) {
  const seen = new Set(primary.map((item) => item.id));
  return [...primary, ...supplemental.filter((item) => !seen.has(item.id))];
}

function collectContextVocab(allVocab: VocabularyItem[], sentences: SentenceItem[], grammar: GrammarItem[]) {
  const ordered: VocabularyItem[] = [];
  const seen = new Set<string>();

  function add(item?: VocabularyItem) {
    if (!item || seen.has(item.id)) return;
    seen.add(item.id);
    ordered.push(item);
  }

  sentences.forEach((sentence) => {
    segmentChineseText(sentence.text, allVocab).forEach((segment) => add(segment.item));
  });
  grammar.forEach((item) => {
    (item.drill_examples ?? []).forEach((example) => {
      segmentChineseText(example.text, allVocab).forEach((segment) => add(segment.item));
    });
  });

  return ordered;
}

function segmentChineseText(text: string, vocab: VocabularyItem[]) {
  const entries = vocab
    .filter((item) => item.char && isLikelyChinese(item.char))
    .sort((a, b) => b.char.length - a.char.length);
  const segments: Array<{ text: string; item?: VocabularyItem }> = [];
  let index = 0;

  while (index < text.length) {
    const item = entries.find((entry) => text.startsWith(entry.char, index));
    if (item) {
      segments.push({ text: item.char, item });
      index += item.char.length;
      continue;
    }

    segments.push({ text: text[index] });
    index += 1;
  }

  return segments;
}

function tokenizePattern(pattern: string) {
  return pattern
    .split(/(\+)/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isLikelyChinese(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}
