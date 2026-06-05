"""Trim daily sentence_ids to <=15 and emit overflow to review_pool.json.

Priority per day:
  1. Sentences referenced by listening.sentence_id or speaking.related_sentence_id
     for the lesson (these drive core practice).
  2. Sentences whose grammar_ids include any of the lesson's NEW grammar_ids.
  3. Remaining slots filled by shortest sentence text (concise > rambly).

Sentences NOT kept move to review_pool.json keyed by `day_introduced` so the
review_block on milestone days can pull from prior days' overflow.

Also scales daily_flow target_counts so they fit the kept sentence count
(matches the month1 ~8-15 pacing).

Idempotent.
"""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "mandarin_course" / "data"
LESSONS = ROOT / "mandarin_course" / "lessons"

LESSON_FILES = [
    LESSONS / "lessons_days31_45.json",
    LESSONS / "lessons_days46_90.json",
]
SENTENCE_FILES = [
    DATA / "sentences_days31_45.json",
    DATA / "sentences_days46_90.json",
]
LISTENING_FILES = [
    DATA / "listening_days31_45.json",
    DATA / "listening_days46_90.json",
]
SPEAKING_FILES = [
    DATA / "speaking_days31_45.json",
    DATA / "speaking_days46_90.json",
]
REVIEW_POOL_OUT = DATA / "review_pool.json"

KEEP_PER_DAY = 15


def load_all(paths) -> list:
    out = []
    for p in paths:
        out.extend(json.loads(p.read_text(encoding="utf-8")))
    return out


def main() -> None:
    sentences = {s["id"]: s for s in load_all(SENTENCE_FILES)}
    listening = load_all(LISTENING_FILES)
    speaking = load_all(SPEAKING_FILES)

    # lesson_id -> set(sentence_ids referenced)
    refs_by_lesson: dict[str, set[str]] = defaultdict(set)
    for l in listening:
        if sid := l.get("sentence_id"):
            refs_by_lesson[l["lesson_id"]].add(sid)
    for s in speaking:
        if sid := s.get("related_sentence_id"):
            refs_by_lesson[s["lesson_id"]].add(sid)

    review_pool: dict[str, list[str]] = defaultdict(list)
    total_dropped = 0
    total_kept = 0

    for lf in LESSON_FILES:
        lessons = json.loads(lf.read_text(encoding="utf-8"))
        for lesson in lessons:
            sid_list = lesson.get("sentence_ids", [])
            if len(sid_list) <= KEEP_PER_DAY:
                total_kept += len(sid_list)
                continue
            lesson_id = lesson["id"]
            new_grammar = set(lesson.get("grammar_ids", []))
            refs = refs_by_lesson.get(lesson_id, set())

            def score(sid: str) -> tuple:
                s = sentences.get(sid, {})
                in_refs = sid in refs
                gram_match = bool(set(s.get("grammar_ids", [])) & new_grammar)
                length = len(s.get("text", ""))
                # lower tuple = higher priority
                return (0 if in_refs else 1, 0 if gram_match else 1, length)

            ordered = sorted(sid_list, key=score)
            kept = ordered[:KEEP_PER_DAY]
            dropped = ordered[KEEP_PER_DAY:]

            # preserve original order among kept for stable rendering
            kept_set = set(kept)
            lesson["sentence_ids"] = [s for s in sid_list if s in kept_set]

            # route dropped to review pool keyed by day_introduced
            for sid in dropped:
                s = sentences.get(sid, {})
                day = s.get("day_introduced")
                if day is None:
                    # fall back to lesson order
                    day = lesson.get("order")
                review_pool[str(day)].append(sid)

            # scale daily_flow target_counts to match the trimmed pool
            kept_n = len(lesson["sentence_ids"])
            for step in lesson.get("daily_flow", []):
                cap = {
                    "new_words": kept_n,
                    "substitution": min(10, kept_n),
                    "listen_shadow": min(8, kept_n),
                    "memory_speaking": min(5, kept_n),
                    "reverse_translation": min(5, kept_n),
                }.get(step.get("kind"))
                if cap is not None and step.get("target_count", 0) > cap:
                    step["target_count"] = cap

            total_kept += kept_n
            total_dropped += len(dropped)
        lf.write_text(
            json.dumps(lessons, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    # write review pool (sorted keys numerically)
    sorted_pool = {k: sorted(set(v)) for k, v in sorted(review_pool.items(), key=lambda kv: int(kv[0]))}
    REVIEW_POOL_OUT.write_text(
        json.dumps(sorted_pool, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Kept: {total_kept} sentences across lessons")
    print(f"Dropped to review_pool: {total_dropped} sentences across {len(sorted_pool)} days")


if __name__ == "__main__":
    main()
