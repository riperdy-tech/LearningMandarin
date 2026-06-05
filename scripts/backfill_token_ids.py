"""Backfill empty token_ids[] in day 31-90 sentence files.

For each sentence with `token_ids: []` (or missing entries vs tokens), perform
greedy longest-match tokenization of the original `text` against the full vocab
pool (all vocab files combined, so cross-day references resolve). Unmapped
spans become null entries so positional alignment with `tokens` is preserved.

Idempotent: re-running yields identical output.
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
    DATA / "sentences_days31_45.json",
    DATA / "sentences_days46_90.json",
]


def load_vocab() -> dict[str, str]:
    """Map char -> vocab_id. On collisions, earlier-day entry wins."""
    out: dict[str, str] = {}
    for f in VOCAB_FILES:
        for v in json.loads(f.read_text(encoding="utf-8")):
            char = v.get("char")
            vid = v.get("id")
            if char and vid and char not in out:
                out[char] = vid
    return out


def tokenize(text: str, vocab_by_char: dict[str, str], max_len: int) -> list[str | None]:
    """Greedy longest-match over `text` (Chinese chars only); skip punctuation/ASCII."""
    ids: list[str | None] = []
    i = 0
    n = len(text)
    while i < n:
        ch = text[i]
        # skip punctuation, ascii, whitespace
        if not _is_cjk(ch):
            i += 1
            continue
        matched = False
        for L in range(min(max_len, n - i), 0, -1):
            span = text[i : i + L]
            vid = vocab_by_char.get(span)
            if vid is not None:
                ids.append(vid)
                i += L
                matched = True
                break
        if not matched:
            ids.append(None)
            i += 1
    return ids


def _is_cjk(ch: str) -> bool:
    cp = ord(ch)
    # CJK Unified Ideographs + Extension A
    return 0x4E00 <= cp <= 0x9FFF or 0x3400 <= cp <= 0x4DBF


def main() -> None:
    vocab_by_char = load_vocab()
    max_len = max((len(c) for c in vocab_by_char), default=1)
    print(f"Loaded {len(vocab_by_char)} vocab entries, max char-span {max_len}")

    for path in SENTENCE_TARGETS:
        sentences = json.loads(path.read_text(encoding="utf-8"))
        filled = 0
        for s in sentences:
            existing = s.get("token_ids")
            # Re-process if empty, missing, or contains any null/falsy entries
            if (
                isinstance(existing, list)
                and existing
                and all(isinstance(x, str) and x for x in existing)
            ):
                continue
            text = s.get("text") or ""
            ids = [tid for tid in tokenize(text, vocab_by_char, max_len) if tid]
            s["token_ids"] = ids
            filled += 1
        path.write_text(
            json.dumps(sentences, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"  {path.name}: backfilled {filled}/{len(sentences)} sentences")


if __name__ == "__main__":
    main()
