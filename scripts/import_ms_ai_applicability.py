"""Import Microsoft's AI applicability scores per US occupation (Working with AI, v1.1).

Usage (needs internet to GitHub; standard library only; works in Claude's workspace, Replit or a Mac):
    python3 scripts/import_ms_ai_applicability.py

Source: Tomlinson et al., "Working with AI: Measuring the Applicability of Generative AI to
Occupations" (Microsoft Research, arXiv 2507.07935), data repo github.com/microsoft/working-with-ai,
CC BY 4.0. Score per SOC 2018 occupation from Bing Copilot conversations (Jan-Sep 2024):
average of how often AI helps with the user's goals and performs the activity itself, scaled
by completion and scope. 0 = no measured applicability; the highest occupations are near 0.5.

Writes data/sources/ms-ai-applicability.json: every occupation (needed to compare our nine
roles with the whole distribution) plus the source, licence and retrieval date.
"""
import csv
import io
import json
import urllib.request
from datetime import date
from pathlib import Path

URL = "https://raw.githubusercontent.com/microsoft/working-with-ai/main/ai_applicability_scores.csv"
OUT = Path("data/sources/ms-ai-applicability.json")


def main():
    req = urllib.request.Request(URL, headers={"User-Agent": "TomorrowWorks hackathon prototype"})
    with urllib.request.urlopen(req, timeout=60) as res:
        text = res.read().decode("utf-8")
    rows = list(csv.DictReader(io.StringIO(text)))
    occ = [{"soc": r["SOC Code"].strip(), "title": r["title"].strip(), "score": round(float(r["ai_applicability_score"]), 4)} for r in rows]
    OUT.write_text(json.dumps({
        "source": {
            "name": "Microsoft Research, Working with AI: AI applicability scores (v1.1)",
            "url": "https://github.com/microsoft/working-with-ai",
            "paper": "https://arxiv.org/abs/2507.07935",
            "publisher": "Microsoft Research",
            "licence": "CC BY 4.0",
            "geography": "United States (Bing Copilot conversations, Jan-Sep 2024)",
            "measure": "AI applicability score per SOC 2018 occupation (0 = none measured)",
            "retrievedAt": date.today().isoformat(),
        },
        "occupations": occ,
    }, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}: {len(occ)} occupations")


if __name__ == "__main__":
    main()
