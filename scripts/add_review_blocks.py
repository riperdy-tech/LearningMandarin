"""Populate review_block on milestone days (35, 45, 55, 65, 75, 85).

Pulls vocab introduced in the prior 10 days plus up to 10 sentences from
review_pool.json (overflow from curate_sentences.py) covering those days.

Idempotent.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "mandarin_course" / "data"
LESSONS = ROOT / "mandarin_course" / "lessons"

MILESTONES = [5, 15, 25, 35, 45, 55, 65, 75, 85]
WINDOW = 10  # prior N days

LESSON_FILES = [
    LESSONS / "lessons_month1.json",
    LESSONS / "lessons_days31_45.json",
    LESSONS / "lessons_days46_90.json",
]
VOCAB_FILES = [
    DATA / "vocab_month1.json",
    DATA / "vocab_days31_45.json",
    DATA / "vocab_days46_90.json",
]
REVIEW_POOL = DATA / "review_pool.json"
M1_SENTENCES = DATA / "sentences_month1.json"
M1_ID_RE = re.compile(r"^SEN_M1_D(\d{2})_\d+$")
MAX_VOCAB = 12
MAX_SENT = 10


def main() -> None:
    # Build map: day -> vocab_ids. Prefer vocab.day_introduced; fall back to
    # first lesson.vocab_ids appearance (works for month1 where day_introduced is absent).
    vocab_by_day: dict[int, list[str]] = {}
    seen: set[str] = set()
    for vf in VOCAB_FILES:
        for v in json.loads(vf.read_text(encoding="utf-8")):
            d = v.get("day_introduced")
            if d is not None:
                vocab_by_day.setdefault(int(d), []).append(v["id"])
                seen.add(v["id"])
    for lf in LESSON_FILES:
        for lesson in json.loads(lf.read_text(encoding="utf-8")):
            order = int(lesson["order"])
            for vid in lesson.get("vocab_ids", []):
                if vid in seen:
                    continue
                vocab_by_day.setdefault(order, []).append(vid)
                seen.add(vid)

    pool: dict[str, list[str]] = (
        json.loads(REVIEW_POOL.read_text(encoding="utf-8")) if REVIEW_POOL.exists() else {}
    )

    # Augment with month1 sentences (day parsed from id) since they aren't in overflow pool.
    for s in json.loads(M1_SENTENCES.read_text(encoding="utf-8")):
        m = M1_ID_RE.match(s["id"])
        if not m:
            continue
        day = str(int(m.group(1)))
        pool.setdefault(day, []).append(s["id"])

    for lf in LESSON_FILES:
        lessons = json.loads(lf.read_text(encoding="utf-8"))
        changed = False
        for lesson in lessons:
            order = lesson.get("order")
            if order not in MILESTONES:
                # remove any stale block from earlier runs
                if "review_block" in lesson:
                    del lesson["review_block"]
                    changed = True
                continue
            start = max(1, order - WINDOW)
            end = order - 1
            days = list(range(start, end + 1))

            v_ids: list[str] = []
            for d in days:
                v_ids.extend(vocab_by_day.get(d, []))
            # interleave-trim: take first/middle/last spread
            if len(v_ids) > MAX_VOCAB:
                step = len(v_ids) / MAX_VOCAB
                v_ids = [v_ids[int(i * step)] for i in range(MAX_VOCAB)]

            s_ids: list[str] = []
            for d in days:
                s_ids.extend(pool.get(str(d), []))
            if len(s_ids) > MAX_SENT:
                step = len(s_ids) / MAX_SENT
                s_ids = [s_ids[int(i * step)] for i in range(MAX_SENT)]

            lesson["review_block"] = {
                "title": f"Review days {start}-{end}",
                "source_days": days,
                "vocab_ids": v_ids,
                "sentence_ids": s_ids,
            }
            changed = True
        if changed:
            lf.write_text(
                json.dumps(lessons, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print(f"  updated {lf.name}")


if __name__ == "__main__":
    main()
