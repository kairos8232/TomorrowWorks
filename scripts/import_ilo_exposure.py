"""Convert ILO Working Paper 140, Annex Table A1, into a JSON snapshot.

Usage:
    python3 scripts/import_ilo_exposure.py "data/raw/Generative AI and Jobs: A Refined Global Index of Occupational Exposure.pdf" 2026-10-21

Needs the `pdftotext` command (poppler: `brew install poppler` on macOS).
Output: data/sources/ilo-genai-exposure-2025.json

Table A1 lists ISCO-08 4-digit occupations with the mean and standard
deviation (SD) of their task-level GenAI exposure scores. Each row has
the code, mean and SD on one line; long names wrap onto other lines, so
the name is taken from the row line when present, otherwise left for the
app to fill from the ESCO ISCO group label. Some PDF ligatures break in
extraction (e.g. "Tra"c" for "Traffic"), so the app should display the
ESCO label and keep the ILO name only for reference.

The gradient is the label printed in the table's left column. Each label
is stacked around its own row ("Gradient" above and the digit below, or
"Minimal"/"Exposure", "Not"/"Exposed"), so it is read from the left
column of the row line and the lines directly above and below it. The
ILO's published threshold rule is applied as a cross-check and used only
when no printed label can be read. Rows sitting exactly on a threshold
can disagree with the rule because the table shows 2-decimal values; the
printed label wins.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

NUM = r"(0(?:\.\d+)?|1(?:\.0+)?)"
ROW = re.compile(r"^\s*(?:(?:Gradient|Minimal|Not|Exposed|[1-4])\s+)?(\d{4})\s+(.*?)\s*" + NUM + r"\s+" + NUM + r"\s*$")
LEFT_WIDTH = 12  # characters of the left label column in pdftotext -layout output


def left_tokens(line):
    """Words in the left label column, ignoring an occupation code."""
    return [w for w in line[:LEFT_WIDTH].split() if not re.fullmatch(r"\d{4}", w)]


def printed_label(lines, i):
    """Gradient label printed for the row on line i, or None if unreadable."""
    tokens = []
    for k in (i - 1, i, i + 1):
        if 0 <= k < len(lines) and (k == i or not ROW.match(lines[k])):
            tokens += left_tokens(lines[k])
    digits = [t for t in tokens if t in {"1", "2", "3", "4"}]
    if "Minimal" in tokens:
        return "Minimal exposure"
    if "Not" in tokens:
        return "Not exposed"
    if len(digits) == 1:
        return f"Gradient {digits[0]}"
    return None


def gradient(mean, sd):
    """ILO WP140 threshold rule for the exposure gradient (cross-check)."""
    if mean >= 0.6 and mean - sd >= 0.5:
        return "Gradient 4"
    if 0.5 <= mean < 0.6 and mean + sd >= 0.5:
        return "Gradient 3"
    if 0.4 <= mean < 0.5 and mean + sd >= 0.5:
        return "Gradient 2"
    if mean < 0.4 and mean + sd >= 0.5:
        return "Gradient 1"
    if mean < 0.5 and mean + sd > 0.4:
        return "Minimal exposure"
    return "Not exposed"


def main(pdf_path, retrieved_at):
    text = subprocess.run(["pdftotext", "-layout", pdf_path, "-"],
                          capture_output=True, text=True, check=True).stdout
    lines = text.splitlines()
    start = next(i for i, l in enumerate(lines) if "Table A1. ISCO-08 occupations by exposure gradient" in l)

    rows = {}
    for i in range(start, len(lines)):
        m = ROW.match(lines[i])
        if not m:
            continue
        code, name, mean, sd = m.group(1), m.group(2).strip(), float(m.group(3)), float(m.group(4))
        if code in rows:
            sys.exit(f"Duplicate ISCO code {code} in Table A1")
        printed, rule = printed_label(lines, i), gradient(mean, sd)
        rows[code] = {"isco": code, "name": name or None, "mean": mean, "sd": sd,
                      "gradient": printed or rule, "printedGradient": printed, "ruleGradient": rule}

    if not rows:
        sys.exit("No rows found: the PDF layout may have changed.")

    mismatches = [(c, r["printedGradient"], r["ruleGradient"]) for c, r in rows.items()
                  if r["printedGradient"] and r["printedGradient"] != r["ruleGradient"]]
    unread = [c for c, r in rows.items() if not r["printedGradient"]]
    counts = {}
    for r in rows.values():
        counts[r["gradient"]] = counts.get(r["gradient"], 0) + 1

    snapshot = {
        "source": {
            "name": "ILO Working Paper 140: Generative AI and Jobs: A Refined Global Index of Occupational Exposure (Annex Table A1)",
            "publisher": "International Labour Organization (ILO)",
            "authors": "Gmyrek, P.; Berg, J.; Kamiński, K.; Konopczyński, F.; Ładna, A.; Nafradi, B.; Rosłaniec, K.; Troszyński, M.",
            "url": "https://webapps.ilo.org/static/english/intserv/working-papers/wp140/index.html",
            "file": Path(pdf_path).name,
            "publishedAt": "2025-05",
            "retrievedAt": retrieved_at,
            "geography": "Global (ISCO-08 occupations)",
            "measure": "Mean and SD of task-level generative-AI exposure scores (0-1) per ISCO-08 4-digit occupation",
            "coverage": "Occupations listed in Table A1 only. Exposure means tasks could be changed by GenAI; "
                        "it is not a forecast of job loss.",
            "gradientRule": "gradient = printedGradient (label read from Table A1) or, if unreadable, ruleGradient = the paper's threshold rule applied to the 2-decimal mean and SD (cross-check only)",
        },
        "gradientCounts": counts,
        "occupations": sorted(rows.values(), key=lambda r: r["isco"]),
    }
    out = Path("data/sources/ilo-genai-exposure-2025.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {out}: {len(rows)} occupations, {counts}")
    if mismatches:
        print(f"Note: {len(mismatches)} rows where the threshold rule on rounded values differs from the printed label (printed label kept):")
        for c, p, g in mismatches:
            print(f"  {c}: printed {p}, rule {g}")
    if unread:
        print(f"Note: {len(unread)} rows had no readable printed label; the threshold rule was used: {', '.join(unread)}")
    exposed = sum(v for k, v in counts.items() if k.startswith("Gradient"))
    print(f"Exposed occupations (Gradients 1-4): {exposed}  (paper reports 112)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
