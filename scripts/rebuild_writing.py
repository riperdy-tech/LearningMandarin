"""Rebuild writing_*.json with full vocab-char coverage and correct stroke data.

Source: Unicode Unihan database (mandarin_course/data/_unihan/Unihan_IRGSources.txt).
Output: one entry per unique char appearing in any vocab file, written into
the matching writing file by day range.

Idempotent.
"""

from __future__ import annotations

import json
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "mandarin_course" / "data"
UNIHAN_DIR = DATA / "_unihan"
UNIHAN = UNIHAN_DIR / "Unihan_IRGSources.txt"
UNIHAN_URL = "https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip"


def ensure_unihan() -> None:
    if UNIHAN.exists():
        return
    UNIHAN_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = UNIHAN_DIR / "Unihan.zip"
    print(f"Downloading {UNIHAN_URL} ...")
    urllib.request.urlretrieve(UNIHAN_URL, zip_path)
    with zipfile.ZipFile(zip_path) as z:
        z.extractall(UNIHAN_DIR)
    print("Unihan extracted")

VOCAB_BY_RANGE = {
    "month1": DATA / "vocab_month1.json",
    "days31_45": DATA / "vocab_days31_45.json",
    "days46_90": DATA / "vocab_days46_90.json",
}
WRITING_OUT = {
    "month1": DATA / "writing_month1.json",
    "days31_45": DATA / "writing_days31_45.json",
    "days46_90": DATA / "writing_days46_90.json",
}

# Kangxi 214 radicals (1-indexed). Standard CJK forms (not the U+2F00 block).
KANGXI = (
    "一丨丶丿乙亅二亠人儿入八冂冖冫几凵刀力勹匕匚匸十卜卩厂厶又"
    "口囗土士夂夊夕大女子宀寸小尢尸屮山巛工己巾干幺广廴廾弋弓彐彡彳"
    "心戈戶手支攴文斗斤方无日曰月木欠止歹殳毋比毛氏气水火爪父爻爿片牙牛犬"
    "玄玉瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禸禾穴立"
    "竹米糸缶网羊羽老而耒耳聿肉臣自至臼舌舛舟艮色艸虍虫血行衣襾"
    "見角言谷豆豕豸貝赤走足身車辛辰辵邑酉釆里"
    "金長門阜隶隹雨青非"
    "面革韋韭音頁風飛食首香"
    "馬骨高髟鬥鬯鬲鬼"
    "魚鳥鹵鹿麥麻"
    "黃黍黑黹"
    "黽鼎鼓鼠"
    "鼻齊"
    "齒"
    "龍龜"
    "龠"
)
assert len(KANGXI) == 214, len(KANGXI)


def _is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return 0x4E00 <= cp <= 0x9FFF or 0x3400 <= cp <= 0x4DBF


def load_unihan() -> dict[str, dict]:
    """char -> {stroke_count, radical_num}."""
    out: dict[str, dict] = defaultdict(dict)
    with UNIHAN.open(encoding="utf-8") as f:
        for line in f:
            if not line or line.startswith("#"):
                continue
            parts = line.rstrip("\n").split("\t")
            if len(parts) != 3:
                continue
            cp_str, key, value = parts
            try:
                ch = chr(int(cp_str[2:], 16))
            except ValueError:
                continue
            if key == "kTotalStrokes":
                # may be space-separated (per source); take first
                first = value.split()[0]
                try:
                    out[ch]["stroke_count"] = int(first)
                except ValueError:
                    pass
            elif key == "kRSUnicode":
                # like "120.6" — radical 120 plus 6 residual strokes.
                # ' marks simplified form variant; strip.
                first = value.split()[0].replace("'", "")
                try:
                    rad = int(first.split(".")[0])
                    out[ch]["radical_num"] = rad
                except ValueError:
                    pass
    return out


def collect_chars() -> dict[str, set[str]]:
    """Range key -> set of unique CJK chars across that range's vocab."""
    by_range: dict[str, set[str]] = {k: set() for k in VOCAB_BY_RANGE}
    for key, path in VOCAB_BY_RANGE.items():
        for v in json.loads(path.read_text(encoding="utf-8")):
            for ch in v.get("char", ""):
                if _is_cjk(ch):
                    by_range[key].add(ch)
    return by_range


def make_entry(ch: str, info: dict) -> dict:
    n = info.get("stroke_count")
    rad_num = info.get("radical_num")
    radical = KANGXI[rad_num - 1] if rad_num and 1 <= rad_num <= 214 else "?"
    if n:
        desc = f"Stroke order: {n} strokes, radical: {radical}. Visit strokeorder.com for animation."
        difficulty = 1 if n <= 5 else 2 if n <= 10 else 3
    else:
        desc = "Visit strokeorder.com for animated stroke order."
        n = 0
        difficulty = 2
    return {
        "char": ch,
        "strokes": [desc],
        "stroke_count": n,
        "radical": radical,
        "difficulty": difficulty,
    }


def main() -> None:
    ensure_unihan()
    unihan = load_unihan()
    print(f"Loaded Unihan: {len(unihan)} chars")
    chars_by_range = collect_chars()
    missing_total = 0
    for key, chars in chars_by_range.items():
        entries = []
        missing = []
        for ch in sorted(chars):
            info = unihan.get(ch, {})
            if not info.get("stroke_count"):
                missing.append(ch)
            entries.append(make_entry(ch, info))
        path = WRITING_OUT[key]
        path.write_text(
            json.dumps(entries, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"  {path.name}: {len(entries)} entries ({len(missing)} missing stroke data: {''.join(missing[:20])}{'...' if len(missing)>20 else ''})")
        missing_total += len(missing)
    print(f"Total missing: {missing_total}")


if __name__ == "__main__":
    main()
