"""Build the blind review kit for the SDG matches (validation plan from Carson's team, 21 Oct 2026).

Usage (needs numpy; the ESCO folder only the first time):
    python3 scripts/build_sdg_review.py "data/raw/ESCO dataset - v1.2.1 - classification - en - csv"
    python3 scripts/build_sdg_review.py          # reuses data/sdg/review/skill-texts.json

What it writes, in data/sdg/review/:
  skill-texts.json   The text RunPod embedded for each of the 185 role skills (ESCO
                     preferred label, up to 8 alternative labels, description), so the
                     keyword baseline reads exactly the same text. ESCO content.
  key.csv            The answer key: for every pair, its similarity, where it came from
                     and which methods propose it. Reviewers must NOT open this file.
  review-A.csv,      Two copies of the same pairs, shuffled differently, with only the
  review-B.csv       skill, its role(s) and the official UN target text. No scores, no
                     AI decisions. Each reviewer fills in 'verdict' alone.

Pairs in the sheets (about 140):
  - all 73 embedding matches at or above 0.60 (what method A proposes);
  - 30 fresh embedding pairs below 0.60, spread over the bands 0.55-0.60, 0.50-0.55
    and below 0.50, so we can see whether relevant links are being missed;
  - 8 random pairs (a skill with a target outside its 3 closest), as obvious negatives;
  - the keyword baseline's top 40 pairs that are not already in the sheet, so the
    baseline is judged on its own proposals, not only on the embedding's.

Methods compared later by scripts/evaluate_sdg_review.py:
  A  embedding only: one of a skill's 3 closest targets (bge-m3 on RunPod) with similarity >= 0.60
  B  embedding + review rules: A minus the rejections and 'uncertain' marks in data/sdg/sdg-review.json
     (what the app shows as strong; in-sample, because the rules were written after looking at these 73)
  C  keyword baseline: TF-IDF cosine between the same skill text and the UN target text, top 40 pairs
"""
import csv
import json
import math
import random
import re
import sys
from collections import Counter
from pathlib import Path

import numpy as np

OUT = Path("data/sdg/review")
TEXTS = OUT / "skill-texts.json"
MATCHES = Path("data/derived/sdg-skill-matches.json")
TARGETS = Path("data/sources/un-sdg-targets.json")
REVIEW = Path("data/sdg/sdg-review.json")
ROLES = Path("data/roles.json")
THRESHOLD = 0.60
BASELINE_TOP = 40
MAX_ALT = 8  # same as runpod/embed_esco_skills.py
STOP = set("a an and the of to in for on by with or at as from into its their this that be is are all any other including such through use using ensure".split())


def skill_texts_from_esco(folder, uris):
    """Same text as runpod/embed_esco_skills.py: label. alt labels. description."""
    out = {}
    with open(Path(folder) / "skills_en.csv", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["conceptUri"] in uris:
                parts = [r["preferredLabel"].strip()]
                alts = [a.strip() for a in r["altLabels"].split("\n") if a.strip()][:MAX_ALT]
                if alts:
                    parts.append(", ".join(alts))
                if r["description"].strip():
                    parts.append(r["description"].strip())
                out[r["conceptUri"]] = ". ".join(parts)
    return out


def tokens(text):
    return [w for w in re.findall(r"[a-z]+", text.lower()) if w not in STOP and len(w) > 2]


def tfidf(docs):
    """Plain TF-IDF: term count x log(N / documents containing the term), rows normalised."""
    toks = [tokens(d) for d in docs]
    vocab = sorted({w for t in toks for w in t})
    col = {w: i for i, w in enumerate(vocab)}
    df = Counter(w for t in toks for w in set(t))
    idf = np.array([math.log(len(docs) / df[w]) for w in vocab])
    m = np.zeros((len(docs), len(vocab)))
    for i, t in enumerate(toks):
        for w, c in Counter(t).items():
            m[i, col[w]] = c * idf[col[w]]
    return m / np.clip(np.linalg.norm(m, axis=1, keepdims=True), 1e-12, None)


def main():
    roles = json.loads(ROLES.read_text(encoding="utf-8"))["roles"]
    skills = {s["uri"]: s["label"] for r in roles for s in r["essentialSkills"]}
    role_of = {u: sorted({r["title"] for r in roles if any(s["uri"] == u for s in r["essentialSkills"])}) for u in skills}
    OUT.mkdir(parents=True, exist_ok=True)
    if len(sys.argv) > 1:
        texts = skill_texts_from_esco(sys.argv[1], set(skills))
        TEXTS.write_text(json.dumps({"source": "ESCO v1.2.1 skills_en.csv (European Commission); same text as embedded on RunPod Job A. This publication uses the ESCO classification of the European Commission.", "texts": texts}, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    texts = json.loads(TEXTS.read_text(encoding="utf-8"))["texts"]
    targets = json.loads(TARGETS.read_text(encoding="utf-8"))["targets"]
    title = {t["code"]: t["title"] for t in targets}
    matches = json.loads(MATCHES.read_text(encoding="utf-8"))["skills"]
    review = json.loads(REVIEW.read_text(encoding="utf-8"))
    rej_t = {r["target"] for r in review["rejectTargets"]}
    dec = {(d["skill"], d["target"]): d["status"] for d in review["decisions"]}

    # Embedding pairs (each skill's 3 closest targets, from RunPod).
    emb = {(u, t["code"]): t["similarity"] for u, m in matches.items() for t in m["targets"]}

    # Keyword baseline: TF-IDF fitted on all skill texts and target texts together.
    uris = sorted(skills)
    m = tfidf([texts[u] for u in uris] + [t["title"] for t in targets])
    kw = m[:len(uris)] @ m[len(uris):].T
    kw_pairs = sorted(((kw[i, j], uris[i], targets[j]["code"]) for i in range(len(uris)) for j in range(len(targets))), reverse=True)
    kw_score = {(u, c): s for s, u, c in kw_pairs}
    baseline = [(u, c) for _, u, c in kw_pairs[:BASELINE_TOP]]

    random.seed(7)
    sheet = {}  # (uri, code) -> source
    for (u, c), s in emb.items():
        if s >= THRESHOLD:
            sheet[(u, c)] = "embedding >= 0.60"
    for lo, hi, n in [(0.55, 0.60, 12), (0.50, 0.55, 10), (0.0, 0.50, 8)]:
        band = sorted(p for p, s in emb.items() if lo <= s < hi and p not in sheet)
        for p in random.sample(band, min(n, len(band))):
            sheet[p] = f"embedding {lo:.2f}-{hi:.2f} (fresh)"
    while sum(1 for v in sheet.values() if v == "random negative") < 8:
        u, t = random.choice(uris), random.choice(targets)["code"]
        if (u, t) not in emb and (u, t) not in sheet:
            sheet[(u, t)] = "random negative"
    for p in baseline:
        sheet.setdefault(p, "keyword baseline top 40")

    def methods(u, c):
        s = emb.get((u, c))
        a = s is not None and s >= THRESHOLD
        b = a and c not in rej_t and dec.get((skills[u], c)) not in ("rejected", "uncertain")
        return a, b, (u, c) in baseline

    pairs = sorted(sheet)
    ids = {p: f"P{i + 1:03d}" for i, p in enumerate(pairs)}
    with open(OUT / "key.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "skill", "target", "source", "embedding_similarity", "keyword_score", "A_embedding", "B_embedding_rules", "C_keyword", "draft_decision"])
        for p in pairs:
            u, c = p
            a, b, kc = methods(u, c)
            d = "rejected (whole target)" if c in rej_t else dec.get((skills[u], c), "kept" if a else "")
            w.writerow([ids[p], skills[u], c, sheet[p], f"{emb[p]:.3f}" if p in emb else "", f"{kw_score[p]:.3f}", int(a), int(b), int(kc), d])
    for name, seed in (("A", 1), ("B", 2)):
        order = pairs[:]
        random.Random(seed).shuffle(order)
        with open(OUT / f"review-{name}.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["id", "skill", "used by role(s)", "SDG target", "official UN target text", "verdict (relevant / not relevant / uncertain)", "note"])
            for p in order:
                u, c = p
                w.writerow([ids[p], skills[u], ", ".join(role_of[u]), c, title[c], "", ""])
    src = Counter(sheet.values())
    print(f"{len(pairs)} pairs: " + ", ".join(f"{k}: {v}" for k, v in sorted(src.items())))
    print(f"Keyword baseline top {BASELINE_TOP}: {sum(1 for p in baseline if emb.get(p, 0) >= THRESHOLD)} also proposed by the embedding")
    print(f"Wrote {OUT}/review-A.csv, review-B.csv (for reviewers) and key.csv (answer key, do not share)")


if __name__ == "__main__":
    main()
