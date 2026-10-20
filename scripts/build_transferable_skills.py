"""Precompute transferable skills from the RunPod ESCO embeddings.

Usage:
    python3 scripts/build_transferable_skills.py

Reads  data/roles.json and data/derived/esco/ (vectors from the RunPod GPU run)
Writes data/derived/transferable-skills.json

For every essential skill of every role, lists the other ESCO skills whose
embedding is at least THRESHOLD similar (cosine). If a person holds one of
those skills, the app counts the needed skill as *transferable* (half credit)
and shows the pair. Only existing ESCO records are compared; nothing is
generated. The app never needs the 28 MB vector file in the browser.

THRESHOLD was chosen on 21 Oct 2026 by inspecting real pairs for the demo
user: at >= 0.85 every pair was sensible (e.g. "perform business analysis" <-
"perform business research", 0.87); at 0.80 wrong pairs appear (e.g.
"perform scientific research" <- "perform business research"). Details in
SIGNALS_AND_MATCHING.md.
"""
import json
from pathlib import Path

import numpy as np

THRESHOLD = 0.85
MAX_NEIGHBOURS = 50  # per needed skill; keeps the file small

DERIVED = Path("data/derived/esco")


def main():
    vectors = np.load(DERIVED / "esco-skill-vectors.f16.npy").astype("float32")
    index = json.loads((DERIVED / "esco-skill-index.json").read_text(encoding="utf-8"))
    run = json.loads((DERIVED / "run-info.json").read_text(encoding="utf-8"))

    # ESCO's CSV repeats a few skills; keep the first row for each URI.
    first_row = {}
    for i, rec in enumerate(index):
        first_row.setdefault(rec["uri"], i)
    keep = sorted(first_row.values())
    vectors, index = vectors[keep], [index[i] for i in keep]
    row_of = {rec["uri"]: i for i, rec in enumerate(index)}

    roles = json.loads(Path("data/roles.json").read_text(encoding="utf-8"))["roles"]
    needed = {s["uri"]: s["label"] for r in roles for s in r["essentialSkills"]}

    neighbours = {}
    for uri, label in sorted(needed.items(), key=lambda kv: kv[1]):
        if uri not in row_of:
            raise SystemExit(f"Skill {label} ({uri}) has no embedding")
        sims = vectors @ vectors[row_of[uri]]
        order = np.argsort(-sims)
        close = []
        for j in order[: MAX_NEIGHBOURS + 1]:
            if index[j]["uri"] == uri:
                continue
            if sims[j] < THRESHOLD:
                break
            close.append({"uri": index[j]["uri"], "label": index[j]["label"], "similarity": round(float(sims[j]), 3)})
        neighbours[uri] = {"label": label, "transferableFrom": close[:MAX_NEIGHBOURS]}

    out = {
        "method": {
            "description": "Cosine similarity between ESCO skill embeddings; a held skill at or above the threshold makes a needed skill transferable (half credit).",
            "threshold": THRESHOLD,
            "credit": 0.5,
            "model": run["model"],
            "embeddingRun": {k: run[k] for k in ("gpu", "skills", "seconds")},
            "source": "ESCO v1.2.1 (European Commission); adapted.",
        },
        "neededSkills": neighbours,
    }
    path = Path("data/derived/transferable-skills.json")
    path.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    counts = [len(v["transferableFrom"]) for v in neighbours.values()]
    print(f"Wrote {path}: {len(neighbours)} needed skills, "
          f"{sum(c > 0 for c in counts)} with at least one transferable skill, "
          f"{sum(counts)} pairs, threshold {THRESHOLD}")


if __name__ == "__main__":
    main()
