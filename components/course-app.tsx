"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Check,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Headphones,
  Mic,
  PenLine,
  Play,
  RefreshCw,
  Sparkles,
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
  PronunciationItem,
  SentenceItem,
  VocabularyItem
} from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewKey = "lesson" | "vocab" | "sentences" | "grammar" | "pronunciation" | "writing";

const navItems: Array<{ key: ViewKey; label: string; icon: React.ElementType }> = [
  { key: "lesson", label: "Lesson", icon: GraduationCap },
  { key: "vocab", label: "Vocabulary", icon: BookOpen },
  { key: "sentences", label: "Sentences", icon: Headphones },
  { key: "grammar", label: "Grammar", icon: Sparkles },
  { key: "pronunciation", label: "Pronunciation", icon: Mic },
  { key: "writing", label: "Writing", icon: PenLine }
];

export function CourseApp({ data }: { data: CourseData }) {
  const [selectedLessonId, setSelectedLessonId] = useState(data.lessons[0]?.id ?? "");
  const [view, setView] = useState<ViewKey>("lesson");
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const speech = useMandarinSpeech();

  const selectedLesson = useMemo(
    () => data.lessons.find((lesson) => lesson.id === selectedLessonId) ?? data.lessons[0],
    [data.lessons, selectedLessonId]
  );

  const lessonPack = useMemo(
    () => buildLessonPack(data, selectedLesson),
    [data, selectedLesson]
  );

  const currentMastery = mastery[selectedLesson.id] ?? 0;
  const averageMastery =
    data.lessons.reduce((sum, lesson) => sum + (mastery[lesson.id] ?? 0), 0) /
    Math.max(data.lessons.length, 1);

  function handlePracticeComplete() {
    setMastery((current) => ({
      ...current,
      [selectedLesson.id]: 100
    }));
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-lg border border-black/10 bg-white/88 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-white">
                <span className="han text-2xl">中</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-jade-700">
                  {data.ui.app.month_label}
                </p>
                <h1 className="text-xl font-black text-ink">{data.ui.app.name}</h1>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-jade-50 p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Week 1 progress</span>
                <span>{Math.round(averageMastery)}%</span>
              </div>
              <Progress value={averageMastery} className="mt-3" />
            </div>
          </section>

          <section className="rounded-lg border border-black/10 bg-white/88 p-3 shadow-soft backdrop-blur">
            <div className="grid gap-2">
              {data.lessons.map((lesson) => {
                const isActive = lesson.id === selectedLesson.id;
                return (
                  <button
                    className={cn(
                      "rounded-lg p-3 text-left transition",
                      isActive ? "bg-ink text-white shadow-lift" : "hover:bg-black/5"
                    )}
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      setView("lesson");
                    }}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold">L{lesson.order}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    <p className="mt-1 text-sm font-semibold">{lesson.title}</p>
                    <div className="mt-3">
                      <Progress
                        value={mastery[lesson.id] ?? 0}
                        className={cn(isActive ? "bg-white/20" : "bg-black/10")}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <div className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white/88 p-4 shadow-soft backdrop-blur xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Week {selectedLesson.week}</Badge>
                <Badge className="bg-persimmon-100 text-persimmon-600 ring-persimmon-500/20">
                  {selectedLesson.xp} XP
                </Badge>
                <Badge>Complete lesson to record mastery</Badge>
              </div>
              <h2 className="mt-3 text-2xl font-black text-ink sm:text-3xl">
                {selectedLesson.title}
              </h2>
            </div>

            <div className="min-w-48">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Lesson mastery</span>
                <span>{currentMastery}%</span>
              </div>
              <Progress value={currentMastery} className="mt-2" />
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 rounded-lg border border-black/10 bg-white/88 p-2 shadow-soft backdrop-blur md:grid-cols-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.key;
              return (
                <button
                  className={cn(
                    "flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition",
                    active ? "bg-jade-600 text-white shadow-lift" : "hover:bg-black/5"
                  )}
                  key={item.key}
                  onClick={() => setView(item.key)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 8 }}
            key={`${selectedLesson.id}-${view}`}
            transition={{ duration: 0.22 }}
          >
            {view === "lesson" && (
              <LessonPractice
                lesson={selectedLesson}
                pack={lessonPack}
                onComplete={handlePracticeComplete}
                speak={speech.speak}
              />
            )}
            {view === "vocab" && <VocabularyGrid speak={speech.speak} vocab={lessonPack.vocab} />}
            {view === "sentences" && (
              <SentencePanel
                sentences={lessonPack.sentences}
                speak={speech.speak}
                vocab={data.vocab}
              />
            )}
            {view === "grammar" && (
              <GrammarPanel grammar={lessonPack.grammar} speak={speech.speak} vocab={data.vocab} />
            )}
            {view === "pronunciation" && (
              <PronunciationPanel
                items={lessonPack.pronunciation}
                speak={speech.speak}
                vocab={data.vocab}
              />
            )}
            {view === "writing" && <WritingPanel speak={speech.speak} writing={lessonPack.writing} />}
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function LessonPractice({
  lesson,
  pack,
  onComplete,
  speak
}: {
  lesson: LessonItem;
  pack: LessonPack;
  onComplete: () => void;
  speak: (text: string, mode?: SpeechMode) => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [orderedTokens, setOrderedTokens] = useState<string[]>([]);
  const sentence = pack.sentences[0];
  const promptVocab = pack.vocab[0];
  const options = useMemo(
    () => [...pack.vocab].sort((a, b) => a.char.localeCompare(b.char)).slice(0, 4),
    [pack.vocab]
  );

  const isMcqCorrect = selectedAnswer === promptVocab?.id;
  const isReorderCorrect = sentence ? orderedTokens.join("") === sentence.tokens.join("") : false;
  const hasMcqAnswer = selectedAnswer.length > 0;
  const hasFullSequence = sentence ? orderedTokens.length === sentence.tokens.length : false;
  const lessonReady = isMcqCorrect && isReorderCorrect;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-jade-700">Exercise flow</p>
              <h3 className="text-xl font-black text-ink">{lesson.exercise_flow.join(" -> ")}</h3>
            </div>
            <Button onClick={() => speak(sentence?.text ?? promptVocab?.char ?? "", "sentence")} variant="warm">
              <Volume2 className="h-4 w-4" />
              Listen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <section className="rounded-lg bg-paper p-5">
            <p className="text-sm font-bold text-ink/60">Translate this</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="han text-5xl font-black text-ink">{promptVocab?.char}</div>
              {promptVocab && <AudioButton label={`Play ${promptVocab.char}`} onClick={() => speak(promptVocab.char, "word")} />}
            </div>
            <p className="mt-2 text-lg font-semibold text-jade-700">{promptVocab?.pinyin}</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {options.map((option) => (
                <button
                  className={cn(
                    "min-h-14 rounded-lg border px-4 text-left font-bold transition",
                    selectedAnswer === option.id
                      ? "border-jade-600 bg-jade-50 text-jade-900"
                      : "border-black/10 bg-white hover:border-jade-600"
                  )}
                  key={option.id}
                  onClick={() => {
                    setSelectedAnswer(option.id);
                    setChecked(false);
                    setCompleted(false);
                  }}
                  type="button"
                >
                  {option.meaning_en}
                  <span className="ml-2 text-sm font-semibold text-ink/50">{option.meaning_ko}</span>
                </button>
              ))}
            </div>
          </section>

          {sentence && (
            <section className="rounded-lg bg-skyglass p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink/60">Build the sentence</p>
                  <p className="mt-1 font-semibold">{sentence.translation_en}</p>
                </div>
                <Button
                  onClick={() => {
                    setOrderedTokens([]);
                    setChecked(false);
                    setCompleted(false);
                  }}
                  size="sm"
                  variant="secondary"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </div>

              <div className="mt-4 min-h-16 rounded-lg border border-dashed border-ink/30 bg-white/70 p-3">
                <div className="flex flex-wrap gap-2">
                  {orderedTokens.length === 0 && (
                    <span className="text-sm font-semibold text-ink/45">Tap tokens below</span>
                  )}
                  {orderedTokens.map((token, index) => (
                    <button
                      className="rounded-lg bg-ink px-4 py-2 han text-lg font-bold text-white"
                      key={`${token}-${index}`}
                      onClick={() => {
                        setOrderedTokens((current) => current.filter((_, i) => i !== index));
                        setChecked(false);
                        setCompleted(false);
                      }}
                      type="button"
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {sentence.tokens.map((token, index) => (
                  <button
                    className="rounded-lg bg-white px-4 py-2 han text-lg font-bold shadow-sm ring-1 ring-black/10 transition hover:bg-jade-50"
                    key={`${token}-${index}`}
                    onClick={() => {
                      setOrderedTokens((current) => [...current, token]);
                      setChecked(false);
                      setCompleted(false);
                    }}
                    type="button"
                  >
                    {token}
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-bold">
              {checked && lessonReady && (
                <span className="text-jade-700">Lesson complete. Mastery recorded.</span>
              )}
              {checked && !lessonReady && (
                <span className="text-persimmon-600">
                  {getLessonFeedback({
                    hasFullSequence,
                    hasMcqAnswer,
                    isMcqCorrect,
                    isReorderCorrect
                  })}
                </span>
              )}
            </div>
            <Button
              disabled={completed}
              onClick={() => {
                setChecked(true);
                if (lessonReady) {
                  setCompleted(true);
                  onComplete();
                }
              }}
            >
              <Check className="h-4 w-4" />
              {completed ? "Completed" : "Check"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-bold text-jade-700">Today’s pack</p>
          <h3 className="text-xl font-black text-ink">{lesson.title}</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {pack.vocab.map((item) => (
            <div className="flex items-center justify-between rounded-lg bg-black/[0.035] p-3" key={item.id}>
              <div>
                <div className="han text-2xl font-black">{item.char}</div>
                <p className="text-sm font-semibold text-ink/55">{item.pinyin}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{item.pos}</Badge>
                <AudioButton label={`Play ${item.char}`} onClick={() => speak(item.char, "word")} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function VocabularyGrid({
  vocab,
  speak
}: {
  vocab: VocabularyItem[];
  speak: (text: string, mode?: SpeechMode) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {vocab.map((item) => (
        <Card className="overflow-hidden" key={item.id}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="han text-5xl font-black text-ink">{item.char}</div>
                <p className="mt-2 text-lg font-bold text-jade-700">{item.pinyin}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{item.frequency} frequency</Badge>
                <AudioButton label={`Play ${item.char}`} onClick={() => speak(item.char, "word")} />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <InfoTile label="English" value={item.meaning_en} />
              <InfoTile label="Korean" value={item.meaning_ko} />
              <InfoTile label="Part of speech" value={item.pos} />
              <InfoTile label="Frequency" value={item.frequency} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SentencePanel({
  sentences,
  speak,
  vocab
}: {
  sentences: SentenceItem[];
  speak: (text: string, mode?: SpeechMode) => void;
  vocab: VocabularyItem[];
}) {
  const [selectedToken, setSelectedToken] = useState<VocabularyItem | null>(null);

  return (
    <div className="grid gap-4">
      {sentences.map((sentence) => (
        <Card key={sentence.id}>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="han text-3xl font-black text-ink">{sentence.text}</div>
                  <AudioButton
                    label={`Play sentence ${sentence.text}`}
                    onClick={() => speak(sentence.text, "sentence")}
                  />
                </div>
                <p className="mt-2 text-lg font-bold text-jade-700">{sentence.pinyin}</p>
                <p className="mt-1 font-semibold text-ink/70">{sentence.translation_en}</p>
                <p className="font-semibold text-ink/50">{sentence.translation_ko}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sentence.tokens.map((token) => {
                  const vocabItem = findVocabForToken(vocab, token);
                  return (
                    <TokenChip
                      item={vocabItem}
                      key={token}
                      onClick={() => vocabItem && setSelectedToken(vocabItem)}
                      speak={speak}
                      token={token}
                    />
                  );
                })}
              </div>
            </div>
            {selectedToken && sentence.tokens.includes(selectedToken.char) && (
              <VocabInfoBox item={selectedToken} onClose={() => setSelectedToken(null)} speak={speak} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GrammarPanel({
  grammar,
  speak,
  vocab
}: {
  grammar: GrammarItem[];
  speak: (text: string, mode?: SpeechMode) => void;
  vocab: VocabularyItem[];
}) {
  const [selectedToken, setSelectedToken] = useState<VocabularyItem | null>(null);

  return (
    <div className="grid gap-4">
      {grammar.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-5">
            <Badge>{item.id}</Badge>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {tokenizeGrammarPattern(item.pattern).map((token, index) => {
                const vocabItem = findVocabForToken(vocab, token);
                const isOperator = token === "+";
                return isOperator ? (
                  <span className="px-1 text-xl font-black text-ink/45" key={`${token}-${index}`}>
                    +
                  </span>
                ) : (
                  <button
                    className={cn(
                      "rounded-lg px-3 py-2 text-xl font-black transition",
                      vocabItem
                        ? "han bg-jade-50 text-jade-900 ring-1 ring-jade-500/20 hover:bg-jade-100"
                        : "bg-black/[0.035] text-ink"
                    )}
                    disabled={!vocabItem}
                    key={`${token}-${index}`}
                    onClick={() => vocabItem && setSelectedToken(vocabItem)}
                    type="button"
                  >
                    {token}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 font-semibold text-ink/70">{item.explanation_en}</p>
            {selectedToken && patternHasToken(item.pattern, selectedToken.char) && (
              <VocabInfoBox item={selectedToken} onClose={() => setSelectedToken(null)} speak={speak} />
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {item.structure.map((part) => (
                <Badge className="bg-skyglass text-ink ring-black/10" key={part}>
                  {part}
                </Badge>
              ))}
            </div>
            {item.negative_examples[0] && (
              <div className="mt-5 rounded-lg bg-persimmon-100 p-4">
                <p className="text-sm font-black uppercase text-persimmon-600">Common learner mix-up</p>
                <p className="mt-2 han text-xl font-black text-ink">
                  {item.negative_examples[0].text}
                </p>
                <p className="mt-1 text-sm font-bold text-ink/60">
                  {item.negative_examples[0].error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PronunciationPanel({
  items,
  speak,
  vocab
}: {
  items: PronunciationItem[];
  speak: (text: string, mode?: SpeechMode) => void;
  vocab: VocabularyItem[];
}) {
  const [attempted, setAttempted] = useState(false);
  const [active, setActive] = useState(items[0]?.id ?? "");
  const activeItem = items.find((item) => item.id === active) ?? items[0];
  const [phoneme, setPhoneme] = useState(78);
  const [tone, setTone] = useState(72);
  const [fluency, setFluency] = useState(82);
  const [complete, setComplete] = useState(90);
  const score = Math.round(0.5 * phoneme + 0.3 * tone + 0.1 * fluency + 0.1 * complete);
  const passed = score >= Math.round((activeItem?.scoring.pass_threshold ?? 0.75) * 100);

  return (
    <Card>
      <CardContent className="grid gap-5 p-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="space-y-2">
          {items.map((item) => (
            <button
              className={cn(
                "w-full rounded-lg p-4 text-left font-bold transition",
                active === item.id ? "bg-ink text-white" : "bg-black/[0.035] hover:bg-black/10"
              )}
              key={item.id}
              onClick={() => setActive(item.id)}
              type="button"
            >
              {item.description}
              <span className="mt-1 block text-sm opacity-70">{item.pair.join(" / ")}</span>
            </button>
          ))}
        </div>

        {activeItem && (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge>{activeItem.type}</Badge>
                <h3 className="mt-3 text-2xl font-black text-ink">{activeItem.description}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {activeItem.test_words.map((word, index) => {
                    const info = getPronunciationWordInfo(word, vocab);
                    return (
                      <div className="rounded-lg bg-black/[0.035] p-4" key={word}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="han text-5xl font-black text-ink">{word}</div>
                            <p className="mt-1 text-lg font-bold text-jade-700">
                              {activeItem.pair[index] ?? info?.pinyin ?? ""}
                            </p>
                          </div>
                          <AudioButton label={`Play ${word}`} onClick={() => speak(word, "word")} />
                        </div>
                        <p className="mt-3 text-sm font-bold text-ink/60">
                          {info?.meaning ?? "Contrast-only practice word"}
                        </p>
                        {!info?.inVocabulary && (
                          <Badge className="mt-3 bg-persimmon-100 text-persimmon-600 ring-persimmon-500/20">
                            pronunciation contrast
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="grid h-28 w-28 place-items-center rounded-full bg-jade-50 ring-8 ring-white">
                <div className="text-center">
                  <div className="text-3xl font-black text-jade-700">{score}</div>
                  <div className="text-xs font-bold uppercase text-ink/45">score</div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <MetricSlider label="Phoneme" value={phoneme} onChange={setPhoneme} />
              <MetricSlider label="Tone" value={tone} onChange={setTone} />
              <MetricSlider label="Fluency" value={fluency} onChange={setFluency} />
              <MetricSlider label="Completeness" value={complete} onChange={setComplete} />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-paper p-4">
              <p className="font-bold">
                {passed ? "Pronunciation passed" : "Practice the tone contour and try again"}
              </p>
              <Button onClick={() => setAttempted(true)} variant={passed ? "default" : "secondary"}>
                <Mic className="h-4 w-4" />
                Record attempt
              </Button>
            </div>
            {attempted && (
              <p className="mt-3 text-sm font-bold text-ink/55">
                Attempt saved for this practice screen. Lesson mastery is only recorded from the Lesson tab.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WritingPanel({
  writing,
  speak
}: {
  writing: CourseData["writing"];
  speak: (text: string, mode?: SpeechMode) => void;
}) {
  const [selectedChar, setSelectedChar] = useState(writing[0]?.char ?? "");
  const active = writing.find((item) => item.char === selectedChar) ?? writing[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <Card>
        <CardContent className="grid grid-cols-3 gap-2 p-4 lg:grid-cols-2">
          {writing.map((item) => (
            <button
              className={cn(
                "aspect-square rounded-lg han text-3xl font-black transition",
                item.char === active.char ? "bg-ink text-white" : "bg-black/[0.035] hover:bg-black/10"
              )}
              key={item.char}
              onClick={() => setSelectedChar(item.char)}
              type="button"
            >
              {item.char}
            </button>
          ))}
        </CardContent>
      </Card>

      {active && (
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="grid aspect-square w-full max-w-60 place-items-center rounded-lg bg-paper ring-1 ring-black/10">
                <span className="han text-8xl font-black text-ink">{active.char}</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Radical {active.radical}</Badge>
                  <AudioButton label={`Play ${active.char}`} onClick={() => speak(active.char, "word")} />
                </div>
                <h3 className="mt-3 text-2xl font-black text-ink">{active.stroke_count} strokes</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {active.strokes.map((stroke, index) => (
                    <span
                      className="rounded-lg bg-jade-50 px-3 py-2 text-sm font-bold text-jade-900 ring-1 ring-jade-500/20"
                      key={`${stroke}-${index}`}
                    >
                      {index + 1}. {stroke}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-black/10 transition hover:bg-jade-50"
                    href={`https://www.strokeorder.com/chinese/${encodeURIComponent(active.char)}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    StrokeOrder
                  </a>
                  <a
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-black/10 transition hover:bg-jade-50"
                    href={`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${encodeURIComponent(active.char)}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    MDBG
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-skyglass p-5">
              <p className="text-sm font-bold text-ink/60">Beginner writing path</p>
              <h4 className="mt-1 text-xl font-black text-ink">Write one stroke at a time</h4>
              <p className="mt-2 max-w-3xl text-sm font-semibold text-ink/65">
                These cards show the ordered stroke names for this character. For the exact animated hand path, open the stroke-order reference above; exact animation requires real vector stroke data, which we should add as the next writing-data layer.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {active.strokes.map((stroke, index) => (
                  <div className="rounded-lg bg-black/[0.035] p-3" key={`${stroke}-visual-${index}`}>
                    <div className="relative grid aspect-square place-items-center rounded-lg bg-white ring-1 ring-black/10">
                      <span className="han text-6xl font-black text-ink/10">{active.char}</span>
                      <span className="absolute left-2 top-2 rounded-full bg-jade-600 px-2 py-1 text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <span className="absolute bottom-2 left-2 right-2 rounded bg-paper px-2 py-1 text-center text-sm font-black text-ink">
                        Add stroke {index + 1}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-ink">{stroke}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type SpeechMode = "word" | "sentence";

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
    utterance.lang = voice?.lang ?? "zh-CN";
    utterance.rate = mode === "sentence" ? 0.78 : 0.72;
    utterance.pitch = 1;
    if (voice) utterance.voice = voice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return {
    speak,
    voiceName: voice?.name ?? "browser default"
  };
}

function chooseMandarinVoice(voices: SpeechSynthesisVoice[]) {
  const chineseVoices = voices.filter((voice) => /^zh/i.test(voice.lang));
  const preferred = [
    "xiaoxiao",
    "xiaoyi",
    "yunjian",
    "hanhan",
    "ting-ting",
    "mandarin",
    "chinese"
  ];

  return (
    chineseVoices.find((voice) =>
      preferred.some((name) => voice.name.toLowerCase().includes(name))
    ) ??
    chineseVoices.find((voice) => voice.lang.toLowerCase().startsWith("zh-cn")) ??
    chineseVoices.find((voice) => voice.lang.toLowerCase().startsWith("zh-tw")) ??
    chineseVoices[0] ??
    null
  );
}

function AudioButton({
  label,
  onClick,
  size = "icon"
}: {
  label: string;
  onClick: () => void;
  size?: "icon" | "sm";
}) {
  return (
    <Button aria-label={label} onClick={onClick} size={size} title={label} type="button" variant="secondary">
      {size === "icon" ? <Volume2 className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      {size === "sm" && <span>Play</span>}
    </Button>
  );
}

function TokenChip({
  item,
  onClick,
  speak,
  token
}: {
  item?: VocabularyItem;
  onClick: () => void;
  speak: (text: string, mode?: SpeechMode) => void;
  token: string;
}) {
  return (
    <span className="inline-flex items-center overflow-hidden rounded-full bg-jade-50 text-jade-900 ring-1 ring-jade-500/20">
      <button
        className={cn(
          "han min-h-9 px-3 text-base font-black",
          item ? "hover:bg-jade-100" : "cursor-default"
        )}
        disabled={!item}
        onClick={onClick}
        type="button"
      >
        {token}
      </button>
      <button
        aria-label={`Play ${token}`}
        className="grid min-h-9 w-9 place-items-center border-l border-jade-500/20 hover:bg-jade-100"
        onClick={() => speak(token, "word")}
        title={`Play ${token}`}
        type="button"
      >
        <Volume2 className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

function VocabInfoBox({
  item,
  onClose,
  speak
}: {
  item: VocabularyItem;
  onClose: () => void;
  speak: (text: string, mode?: SpeechMode) => void;
}) {
  return (
    <div className="mt-4 rounded-lg border border-jade-500/20 bg-jade-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="han text-4xl font-black text-ink">{item.char}</div>
          <p className="mt-1 text-lg font-bold text-jade-700">{item.pinyin}</p>
          <p className="font-semibold text-ink/70">
            {item.meaning_en} · {item.meaning_ko}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink/50">{item.pos}</p>
        </div>
        <div className="flex items-center gap-2">
          <AudioButton label={`Play ${item.char}`} onClick={() => speak(item.char, "word")} size="sm" />
          <Button onClick={onClose} size="sm" type="button" variant="ghost">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function findVocabForToken(vocab: VocabularyItem[], token: string) {
  return (
    vocab.find((item) => item.char === token) ??
    vocab.find((item) => token.includes(item.char) || item.char.includes(token))
  );
}

function tokenizeGrammarPattern(pattern: string) {
  return pattern
    .split(/(\+)/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function patternHasToken(pattern: string, token: string) {
  return tokenizeGrammarPattern(pattern).includes(token);
}

function getPronunciationWordInfo(word: string, vocab: VocabularyItem[]) {
  const vocabItem = findVocabForToken(vocab, word);
  if (vocabItem) {
    return {
      inVocabulary: true,
      meaning: `${vocabItem.meaning_en} · ${vocabItem.meaning_ko}`,
      pinyin: vocabItem.pinyin
    };
  }

  const contrastWords: Record<string, { meaning: string; pinyin: string }> = {
    泥: { meaning: "mud; used here only to contrast with 你", pinyin: "ní" },
    知: { meaning: "to know; used here for zh initial practice", pinyin: "zhī" },
    资: { meaning: "resource/capital; used here for z initial practice", pinyin: "zī" }
  };

  const info = contrastWords[word];
  return info ? { ...info, inVocabulary: false } : null;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/[0.035] p-3">
      <p className="text-xs font-bold uppercase text-ink/45">{label}</p>
      <p className="mt-1 break-words font-bold text-ink">{value}</p>
    </div>
  );
}

function getLessonFeedback({
  hasFullSequence,
  hasMcqAnswer,
  isMcqCorrect,
  isReorderCorrect
}: {
  hasFullSequence: boolean;
  hasMcqAnswer: boolean;
  isMcqCorrect: boolean;
  isReorderCorrect: boolean;
}) {
  if (!hasMcqAnswer && isReorderCorrect) {
    return "Sentence order is correct. Choose the word meaning above to complete the lesson.";
  }

  if (!hasMcqAnswer) {
    return "Choose the word meaning above, then check again.";
  }

  if (!isMcqCorrect && isReorderCorrect) {
    return "Sentence order is correct. The word meaning choice needs another look.";
  }

  if (!hasFullSequence) {
    return "Finish building the sentence before checking.";
  }

  if (!isReorderCorrect) {
    return "The sentence order needs another look.";
  }

  return "One answer needs another look.";
}

function MetricSlider({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-lg bg-black/[0.035] p-4">
      <div className="flex items-center justify-between text-sm font-bold">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <input
        className="mt-3 w-full accent-jade-600"
        max={100}
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
    </label>
  );
}

type LessonPack = ReturnType<typeof buildLessonPack>;

function buildLessonPack(data: CourseData, lesson: LessonItem) {
  const vocab = data.vocab.filter((item) => lesson.vocab_ids.includes(item.id));
  const sentences = data.sentences.filter((item) => lesson.sentence_ids.includes(item.id));
  const grammar = data.grammar.filter((item) => lesson.grammar_ids.includes(item.id));
  const pronunciation = data.pronunciation.filter((item) =>
    lesson.pronunciation_ids.includes(item.id)
  );
  const writingChars = new Set(vocab.flatMap((item) => item.char.split("")));
  const writing = data.writing.filter((item) => writingChars.has(item.char));

  return {
    vocab,
    sentences,
    grammar,
    pronunciation,
    writing
  };
}
