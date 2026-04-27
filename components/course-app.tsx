"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Circle,
  ExternalLink,
  Flame,
  Headphones,
  Mic,
  PenLine,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Volume2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
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
type TrainerStepKind =
  | "pattern_review"
  | "new_words"
  | "substitution"
  | "listen_shadow"
  | "memory_speaking"
  | "review_summary";

type TrainerStep = {
  id: string;
  title: string;
  kind: TrainerStepKind;
  target_count?: number;
};

type LessonPack = ReturnType<typeof buildLessonPack>;

const PROGRESS_KEY = "taiwan-mandarin-progress-v1";

const DEFAULT_DAILY_FLOW: TrainerStep[] = [
  { id: "pattern_review", title: "Pattern review", kind: "pattern_review", target_count: 1 },
  { id: "new_words", title: "New words inside sentences", kind: "new_words", target_count: 3 },
  { id: "substitution", title: "Sentence substitution drill", kind: "substitution", target_count: 3 },
  { id: "listen_shadow", title: "Listen and shadow", kind: "listen_shadow", target_count: 1 },
  { id: "memory_speaking", title: "Speak from memory", kind: "memory_speaking", target_count: 1 },
  { id: "review_summary", title: "Quick review summary", kind: "review_summary", target_count: 1 }
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

export function CourseApp({ data }: { data: CourseData }) {
  const [selectedLessonId, setSelectedLessonId] = useState(data.lessons[0]?.id ?? "");
  const [activeStepId, setActiveStepId] = useState(DEFAULT_DAILY_FLOW[0].id);
  const [selectedVocab, setSelectedVocab] = useState<VocabularyItem | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<GrammarItem | null>(null);
  const [progress, setProgress] = useLocalProgress();
  const speech = useMandarinSpeech();

  const selectedLesson = useMemo(
    () => data.lessons.find((lesson) => lesson.id === selectedLessonId) ?? data.lessons[0],
    [data.lessons, selectedLessonId]
  );
  const lessonPack = useMemo(() => buildLessonPack(data, selectedLesson), [data, selectedLesson]);
  const dailyFlow = getDailyFlow(selectedLesson);
  const completedSteps = progress.lesson_steps[selectedLesson.id] ?? [];
  const lessonCompleted = Boolean(progress.completed_lessons[selectedLesson.id]);
  const lessonMastery = lessonCompleted
    ? Math.round((progress.completed_lessons[selectedLesson.id]?.mastery ?? 0) * 100)
    : 0;
  const completedLessonCount = Object.keys(progress.completed_lessons).length;
  const weekMastery = Math.round((completedLessonCount / Math.max(data.lessons.length, 1)) * 100);
  const activeStep = dailyFlow.find((step) => step.id === activeStepId) ?? dailyFlow[0];
  const allStepsDone = dailyFlow.every((step) => completedSteps.includes(step.id));
  const generatedSentences = buildGeneratedSentences(lessonPack);

  function markStep(stepId: string) {
    setProgress((current) => {
      const currentSteps = current.lesson_steps[selectedLesson.id] ?? [];
      return {
        ...current,
        lesson_steps: {
          ...current.lesson_steps,
          [selectedLesson.id]: Array.from(new Set([...currentSteps, stepId]))
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
        <aside className="space-y-5">
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
                <MetricCard label="Week mastery" value={`${weekMastery}%`} icon={Target} />
                <MetricCard label="Streak" value={`${progress.streak.count} days`} icon={Flame} />
                <MetricCard label="Due review" value={`${progress.due_review_ids.length}`} icon={RotateCcw} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <p className="text-sm font-bold text-jade-700">Daily lessons</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.lessons.map((lesson) => {
                const isActive = lesson.id === selectedLesson.id;
                const done = Boolean(progress.completed_lessons[lesson.id]);
                return (
                  <button
                    className={cn(
                      "w-full rounded-lg p-3 text-left transition",
                      isActive ? "bg-ink text-white shadow-lift" : "hover:bg-black/5"
                    )}
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      setActiveStepId(getDailyFlow(lesson)[0].id);
                    }}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black">Day {lesson.order}</span>
                      {done ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </div>
                    <p className="mt-1 text-sm font-semibold">{lesson.title}</p>
                    <Progress value={done ? 100 : 0} className="mt-3" />
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <p className="text-sm font-bold text-jade-700">Today’s loop</p>
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
        </aside>

        <section className="space-y-5">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="flex flex-col gap-5 p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Month 1 · Week {selectedLesson.week}</Badge>
                  <Badge className="bg-persimmon-100 text-persimmon-600 ring-persimmon-500/20">
                    {selectedLesson.xp} XP
                  </Badge>
                  <Badge>{lessonCompleted ? "Completed" : "Progress records after full loop"}</Badge>
                </div>
                <h2 className="mt-3 text-2xl font-black text-ink sm:text-3xl">
                  {selectedLesson.title}
                </h2>
                <p className="mt-2 max-w-3xl font-semibold text-ink/65">
                  Learn words through reusable patterns, generate usable sentences, then speak them out loud.
                </p>
              </div>
              <div className="min-w-56">
                <div className="flex items-center justify-between text-sm font-black">
                  <span>Lesson mastery</span>
                  <span>{lessonMastery}%</span>
                </div>
                <Progress value={lessonMastery} className="mt-2" />
                <p className="mt-2 text-xs font-semibold text-ink/45">
                  Step practice is saved, but mastery stays 0 until the loop is complete.
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
              markStep={markStep}
              onCompleteLesson={completeLesson}
              onSelectPattern={setSelectedPattern}
              onSelectVocab={setSelectedVocab}
              progress={progress}
              resetProgress={resetProgress}
              speak={speech.speak}
              toggleWeakPattern={toggleWeakPattern}
              toggleWeakWord={toggleWeakWord}
            />
          </motion.div>

          <ReferenceStrip
            grammar={lessonPack.grammar}
            onSelectPattern={setSelectedPattern}
            onSelectVocab={setSelectedVocab}
            speak={speech.speak}
            vocab={lessonPack.vocab}
            writing={lessonPack.writing}
          />
        </section>
      </div>

      {selectedVocab && (
        <DetailDrawer title="Word detail" onClose={() => setSelectedVocab(null)}>
          <VocabInfoBox item={selectedVocab} speak={speech.speak} />
        </DetailDrawer>
      )}

      {selectedPattern && (
        <DetailDrawer title="Pattern detail" onClose={() => setSelectedPattern(null)}>
          <PatternDetail grammar={selectedPattern} speak={speech.speak} />
        </DetailDrawer>
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
  markStep,
  onCompleteLesson,
  onSelectPattern,
  onSelectVocab,
  progress,
  resetProgress,
  speak,
  toggleWeakPattern,
  toggleWeakWord
}: {
  activeStep: TrainerStep;
  allStepsDone: boolean;
  completed: boolean;
  generatedSentences: GeneratedSentence[];
  lessonCompleted: boolean;
  lessonPack: LessonPack;
  markStep: (stepId: string) => void;
  onCompleteLesson: () => void;
  onSelectPattern: (grammar: GrammarItem) => void;
  onSelectVocab: (vocab: VocabularyItem) => void;
  progress: LocalProgress;
  resetProgress: () => void;
  speak: (text: string, mode?: SpeechMode) => void;
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
          </div>
          <StepDoneButton completed={completed} onClick={() => markStep(activeStep.id)} />
        </div>
      </CardHeader>
      <CardContent>
        {activeStep.kind === "pattern_review" && (
          <PatternReview
            grammar={lessonPack.grammar}
            onSelectPattern={onSelectPattern}
            speak={speak}
            toggleWeakPattern={toggleWeakPattern}
            weakPatterns={progress.weak_patterns}
          />
        )}

        {activeStep.kind === "new_words" && (
          <NewWordsInSentences
            onSelectVocab={onSelectVocab}
            sentences={lessonPack.sentences}
            speak={speak}
            toggleWeakWord={toggleWeakWord}
            vocab={lessonPack.vocab}
            weakWords={progress.weak_words}
          />
        )}

        {activeStep.kind === "substitution" && (
          <SubstitutionDrill generatedSentences={generatedSentences} speak={speak} />
        )}

        {activeStep.kind === "listen_shadow" && (
          <ListenShadow sentences={lessonPack.sentences} speak={speak} />
        )}

        {activeStep.kind === "memory_speaking" && (
          <MemorySpeaking generatedSentences={generatedSentences} speak={speak} />
        )}

        {activeStep.kind === "review_summary" && (
          <ReviewSummary
            allStepsDone={allStepsDone}
            lessonCompleted={lessonCompleted}
            onCompleteLesson={onCompleteLesson}
            progress={progress}
            resetProgress={resetProgress}
            sentences={generatedSentences}
          />
        )}
      </CardContent>
    </Card>
  );
}

function PatternReview({
  grammar,
  onSelectPattern,
  speak,
  toggleWeakPattern,
  weakPatterns
}: {
  grammar: GrammarItem[];
  onSelectPattern: (grammar: GrammarItem) => void;
  speak: (text: string, mode?: SpeechMode) => void;
  toggleWeakPattern: (id: string) => void;
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
            {getPatternExamples(item).map((example) => (
              <SentenceCard
                key={example.text}
                pinyin={example.pinyin}
                speak={speak}
                text={example.text}
                translationEn={example.translation_en}
                translationKo={example.translation_ko}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NewWordsInSentences({
  onSelectVocab,
  sentences,
  speak,
  toggleWeakWord,
  vocab,
  weakWords
}: {
  onSelectVocab: (vocab: VocabularyItem) => void;
  sentences: SentenceItem[];
  speak: (text: string, mode?: SpeechMode) => void;
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
                  speak(item.char, "word");
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
            vocab={vocab}
          />
        ))}
      </div>
    </div>
  );
}

function SubstitutionDrill({
  generatedSentences,
  speak
}: {
  generatedSentences: GeneratedSentence[];
  speak: (text: string, mode?: SpeechMode) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = generatedSentences[activeIndex] ?? generatedSentences[0];

  if (!active) {
    return <EmptyState text="No substitution examples yet. Add slot values to this pattern when you feed the next data batch." />;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-lg bg-skyglass p-5">
        <p className="text-sm font-black text-ink/55">Say it, then swap one part</p>
        <div className="mt-4 han text-5xl font-black text-ink">{active.text}</div>
        <p className="mt-3 text-xl font-black text-jade-700">{active.pinyin}</p>
        <p className="mt-2 text-lg font-bold text-ink">{active.translation_en}</p>
        {active.translation_ko && <p className="text-sm font-semibold text-ink/50">{active.translation_ko}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => speak(active.text, "sentence")} variant="warm">
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
            <span className="text-sm opacity-70">{sentence.translation_en}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ListenShadow({
  sentences,
  speak
}: {
  sentences: SentenceItem[];
  speak: (text: string, mode?: SpeechMode) => void;
}) {
  return (
    <div className="grid gap-3">
      <p className="font-semibold text-ink/65">
        Listen once, repeat slowly, then repeat naturally. Use full sentences, not isolated words.
      </p>
      {sentences.map((sentence) => (
        <SentenceCard
          key={sentence.id}
          pinyin={sentence.pinyin}
          speak={speak}
          text={sentence.text}
          translationEn={sentence.translation_en}
          translationKo={sentence.translation_ko}
        />
      ))}
    </div>
  );
}

function MemorySpeaking({
  generatedSentences,
  speak
}: {
  generatedSentences: GeneratedSentence[];
  speak: (text: string, mode?: SpeechMode) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const active = generatedSentences[0];

  if (!active) {
    return <EmptyState text="No memory prompt is available for this lesson yet." />;
  }

  return (
    <div className="rounded-lg bg-paper p-5">
      <p className="text-sm font-black text-ink/55">Speak from memory</p>
      <p className="mt-2 text-xl font-black text-ink">{active.translation_en}</p>
      {active.translation_ko && <p className="text-sm font-semibold text-ink/50">{active.translation_ko}</p>}
      <div className="mt-5 min-h-32 rounded-lg border border-dashed border-ink/25 bg-white p-5">
        {revealed ? (
          <>
            <div className="han text-5xl font-black text-ink">{active.text}</div>
            <p className="mt-2 text-xl font-black text-jade-700">{active.pinyin}</p>
          </>
        ) : (
          <p className="text-sm font-bold text-ink/45">
            Try saying the Chinese sentence before revealing the answer.
          </p>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => setRevealed((current) => !current)} variant="secondary">
          {revealed ? "Hide answer" : "Reveal answer"}
        </Button>
        <Button onClick={() => speak(active.text, "sentence")} variant="warm">
          <Volume2 className="h-4 w-4" />
          Play model
        </Button>
      </div>
    </div>
  );
}

function ReviewSummary({
  allStepsDone,
  lessonCompleted,
  onCompleteLesson,
  progress,
  resetProgress,
  sentences
}: {
  allStepsDone: boolean;
  lessonCompleted: boolean;
  onCompleteLesson: () => void;
  progress: LocalProgress;
  resetProgress: () => void;
  sentences: GeneratedSentence[];
}) {
  const dueCount = progress.due_review_ids.length + progress.weak_words.length + progress.weak_patterns.length;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-lg bg-jade-50 p-5 ring-1 ring-jade-500/20">
        <p className="text-sm font-black text-jade-700">Quick review summary</p>
        <h3 className="mt-2 text-2xl font-black text-ink">Useful sentence output</h3>
        <p className="mt-2 font-semibold text-ink/65">
          Today’s win is not memorizing labels. It is producing these sentences quickly and naturally.
        </p>
        <div className="mt-4 grid gap-2">
          {sentences.slice(0, 4).map((sentence) => (
            <div className="rounded-lg bg-white p-3" key={sentence.text}>
              <p className="han text-xl font-black text-ink">{sentence.text}</p>
              <p className="text-sm font-bold text-jade-700">{sentence.pinyin}</p>
            </div>
          ))}
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
  speak,
  vocab,
  writing
}: {
  grammar: GrammarItem[];
  onSelectPattern: (grammar: GrammarItem) => void;
  onSelectVocab: (vocab: VocabularyItem) => void;
  speak: (text: string, mode?: SpeechMode) => void;
  vocab: VocabularyItem[];
  writing: WritingItem[];
}) {
  const [activeWriting, setActiveWriting] = useState(writing[0]?.char ?? "");
  const writingItem = writing.find((item) => item.char === activeWriting) ?? writing[0];

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="bg-white/90">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-jade-700" />
            <p className="text-sm font-black text-jade-700">Reference, not the main lesson</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase text-ink/45">Words</p>
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
                    onClick={() => setActiveWriting(item.char)}
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SentenceWithTokens({
  onSelectVocab,
  sentence,
  speak,
  vocab
}: {
  onSelectVocab: (vocab: VocabularyItem) => void;
  sentence: SentenceItem;
  speak: (text: string, mode?: SpeechMode) => void;
  vocab: VocabularyItem[];
}) {
  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-black/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="han text-3xl font-black text-ink">{sentence.text}</div>
          <p className="mt-1 text-lg font-black text-jade-700">{sentence.pinyin}</p>
          <p className="mt-1 font-bold text-ink">{sentence.translation_en}</p>
          <p className="text-sm font-semibold text-ink/50">{sentence.translation_ko}</p>
        </div>
        <AudioButton label={`Play ${sentence.text}`} onClick={() => speak(sentence.text, "sentence")} />
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
  translationKo
}: {
  pinyin: string;
  speak: (text: string, mode?: SpeechMode) => void;
  text: string;
  translationEn: string;
  translationKo?: string;
}) {
  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-black/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="han text-2xl font-black text-ink">{text}</p>
          <p className="mt-1 font-black text-jade-700">{pinyin}</p>
        </div>
        <AudioButton label={`Play ${text}`} onClick={() => speak(text, "sentence")} />
      </div>
      <p className="mt-3 font-bold text-ink">{translationEn}</p>
      {translationKo && <p className="text-sm font-semibold text-ink/50">{translationKo}</p>}
    </div>
  );
}

function PatternDetail({
  grammar,
  speak
}: {
  grammar: GrammarItem;
  speak: (text: string, mode?: SpeechMode) => void;
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
      {getPatternExamples(grammar).map((example) => (
        <SentenceCard
          key={example.text}
          pinyin={example.pinyin}
          speak={speak}
          text={example.text}
          translationEn={example.translation_en}
          translationKo={example.translation_ko}
        />
      ))}
    </div>
  );
}

function VocabInfoBox({
  item,
  speak
}: {
  item: VocabularyItem;
  speak: (text: string, mode?: SpeechMode) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="han text-5xl font-black text-ink">{item.char}</div>
          <p className="mt-1 text-xl font-black text-jade-700">{item.pinyin}</p>
          <p className="mt-3 text-lg font-bold text-ink">{item.meaning_en}</p>
          <p className="text-sm font-semibold text-ink/50">{item.meaning_ko}</p>
        </div>
        <AudioButton label={`Play ${item.char}`} onClick={() => speak(item.char, "word")} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoTile label="Role" value={item.pos} />
        <InfoTile label="Use" value={`${item.frequency} frequency`} />
      </div>
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
      {completed ? "Step practiced" : "Mark step practiced"}
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

function useMandarinSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const voice = useMemo(() => chooseMandarinVoice(voices), [voices]);

  function speak(text: string, mode: SpeechMode = "word") {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang ?? "zh-TW";
    utterance.rate = mode === "sentence" ? 0.78 : 0.72;
    utterance.pitch = 1;
    if (voice) utterance.voice = voice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return { speak };
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
  const vocab = data.vocab.filter((item) => lesson.vocab_ids.includes(item.id));
  const sentences = data.sentences.filter((item) => lesson.sentence_ids.includes(item.id));
  const grammar = data.grammar.filter((item) => lesson.grammar_ids.includes(item.id));
  const pronunciation = data.pronunciation.filter((item) => lesson.pronunciation_ids.includes(item.id));
  const writingChars = new Set(vocab.flatMap((item) => item.char.split("")));
  const writing = data.writing.filter((item) => writingChars.has(item.char));

  return { vocab, sentences, grammar, pronunciation, writing };
}

type GeneratedSentence = {
  text: string;
  pinyin: string;
  translation_en: string;
  translation_ko?: string;
  source: "authored" | "generated";
};

function buildGeneratedSentences(pack: LessonPack): GeneratedSentence[] {
  const authored = pack.sentences.map((sentence) => ({
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

  const seen = new Set<string>();
  return [...authored, ...drills].filter((sentence) => {
    if (seen.has(sentence.text)) return false;
    seen.add(sentence.text);
    return true;
  });
}

function getPatternExamples(grammar: GrammarItem): GeneratedSentence[] {
  return (grammar.drill_examples ?? []).map((example) => ({
    text: example.text,
    pinyin: example.pinyin,
    translation_en: example.translation_en,
    translation_ko: example.translation_ko,
    source: "generated"
  }));
}

function getDailyFlow(lesson: LessonItem): TrainerStep[] {
  return (lesson.daily_flow as TrainerStep[] | undefined) ?? DEFAULT_DAILY_FLOW;
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
    vocab.find((item) => token.includes(item.char) || item.char.includes(token))
  );
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
