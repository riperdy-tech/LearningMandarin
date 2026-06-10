"""Retokenize day 31-90 sentence files into compound tokens.

Current state: `tokens` is split per CJK character, breaking the chip-render +
findVocabForToken lookup in components/course-app.tsx. Day 1-30 files use
compound tokens (e.g. ["你好","我","是"]). This script re-runs greedy
longest-match tokenization against the union vocab pool, emits compound
`tokens` matching day 1-30 style, and keeps `token_ids` aligned to matched
spans (only entries with a vocab hit).

Skips punctuation/non-CJK (mirrors day 1-30). Idempotent.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "mandarin_course" / "data"

VOCAB_FILES = [
    DATA / "vocab_month1.json",
    DATA / "vocab_days31_45.json",
    DATA / "vocab_days46_90.json",
]
SENTENCE_TARGETS = [
    DATA / "sentences_month1.json",
    DATA / "sentences_days31_45.json",
    DATA / "sentences_days46_90.json",
]


# Multi-word chunks (verb phrases, tag questions, fillers) must not become
# single chips: lessons teach their parts as separate vocab, and a merged chip
# blocks per-word lookup/audio. Match only real words.
PHRASE_POS = ("phrase", "tag question", "filler")


def load_vocab() -> dict[str, str]:
    out: dict[str, str] = {}
    for f in VOCAB_FILES:
        for v in json.loads(f.read_text(encoding="utf-8")):
            char = v.get("char")
            vid = v.get("id")
            pos = (v.get("pos") or "").lower()
            if any(p in pos for p in PHRASE_POS):
                continue
            if char and vid and char not in out:
                out[char] = vid
    return out


def _is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return 0x4E00 <= cp <= 0x9FFF or 0x3400 <= cp <= 0x4DBF


def tokenize(
    text: str, vocab_by_char: dict[str, str], max_len: int
) -> tuple[list[str], list[str]]:
    tokens: list[str] = []
    ids: list[str] = []
    i = 0
    n = len(text)
    while i < n:
        ch = text[i]
        if not _is_cjk(ch):
            i += 1
            continue
        best_span: str | None = None
        best_id: str | None = None
        for L in range(min(max_len, n - i), 0, -1):
            span = text[i : i + L]
            vid = vocab_by_char.get(span)
            if vid is not None:
                best_span = span
                best_id = vid
                break
        if best_span is not None:
            tokens.append(best_span)
            ids.append(best_id)  # type: ignore[arg-type]
            i += len(best_span)
        else:
            tokens.append(ch)
            i += 1
    return tokens, ids


def main() -> None:
    vocab_by_char = load_vocab()
    max_len = max((len(c) for c in vocab_by_char), default=1)
    print(f"Loaded {len(vocab_by_char)} vocab entries, max char-span {max_len}")

    for path in SENTENCE_TARGETS:
        sentences = json.loads(path.read_text(encoding="utf-8"))
        changed = 0
        for s in sentences:
            text = s.get("text") or ""
            tokens, ids = tokenize(text, vocab_by_char, max_len)
            if s.get("tokens") != tokens or s.get("token_ids") != ids:
                changed += 1
            s["tokens"] = tokens
            s["token_ids"] = ids
        path.write_text(
            json.dumps(sentences, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"  {path.name}: retokenized {changed}/{len(sentences)} sentences")


if __name__ == "__main__":
    main()
