"""Score the SDG matching methods against the two blind reviews.

Usage (stdlib only):
    python3 scripts/evaluate_sdg_review.py
        reads data/sdg/review/review-A.csv, review-B.csv and key.csv; writes
        data/sdg/review/disagreements.csv (pairs the reviewers labelled differently)
    python3 scripts/evaluate_sdg_review.py --final data/sdg/review/disagreements.csv
        after the team has filled the 'final' column of disagreements.csv: uses those
        agreed labels and writes the results to data/sdg/review/results.md

Labels: relevant / not relevant / uncertain (definitions in data/sdg/review/GUIDE.md).
A pair's label = the two reviewers' label when they agree, else the 'final' label
from the discussion (without --final, disagreements are left out and counted).

Reported, with counts (the sample is small, so percentages alone mislead):
  - agreement: share of pairs both reviewers labelled the same, and Cohen's kappa
    (agreement corrected for chance; 1 = perfect, 0 = chance level);
  - per method (A embedding only, B embedding + review rules, C keyword baseline):
    links proposed, how many are relevant / not relevant / uncertain, precision
    (relevant / proposed); and how many of all relevant pairs in the sheet it proposed;
  - relevant links below 0.60 by similarity band (are we missing good links?).
B is in-sample: its rules were written after looking at the same 73 matches.
"""
import argparse
import csv
from collections import Counter
from pathlib import Path

DIR = Path("data/sdg/review")
LABELS = ("relevant", "not relevant", "uncertain")


def read_sheet(path):
    out = {}
    with open(path, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            v = (r.get("verdict (relevant / not relevant / uncertain)") or "").strip().lower()
            if v:
                if v not in LABELS:
                    raise SystemExit(f"{path.name} {r['id']}: '{v}' is not one of {LABELS}")
                out[r["id"]] = v
    return out


def kappa(a, b):
    n = len(a)
    if n == 0:
        return None
    po = sum(x == y for x, y in zip(a, b)) / n
    ca, cb = Counter(a), Counter(b)
    pe = sum(ca[l] * cb[l] for l in LABELS) / (n * n)
    return None if pe == 1 else (po - pe) / (1 - pe)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--final", help="disagreements.csv with the 'final' column filled after discussion")
    args = ap.parse_args()
    key = {r["id"]: r for r in csv.DictReader(open(DIR / "key.csv", encoding="utf-8"))}
    a, b = read_sheet(DIR / "review-A.csv"), read_sheet(DIR / "review-B.csv")
    both = sorted(set(a) & set(b))
    print(f"Labelled by both reviewers: {len(both)} of {len(key)} pairs")
    if not both:
        raise SystemExit("Fill the 'verdict' column in review-A.csv and review-B.csv first.")

    agree = [i for i in both if a[i] == b[i]]
    k = kappa([a[i] for i in both], [b[i] for i in both])
    bin_k = kappa([("relevant" if a[i] == "relevant" else "uncertain") for i in both], [("relevant" if b[i] == "relevant" else "uncertain") for i in both])
    disagree = [i for i in both if a[i] != b[i]]
    if not args.final:
        with open(DIR / "disagreements.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["id", "skill", "target", "reviewer A", "reviewer B", "final (relevant / not relevant / uncertain)", "reason"])
            for i in disagree:
                w.writerow([i, key[i]["skill"], key[i]["target"], a[i], b[i], "", ""])
    final = {}
    if args.final:
        for r in csv.DictReader(open(args.final, encoding="utf-8")):
            v = (r.get("final (relevant / not relevant / uncertain)") or "").strip().lower()
            if v:
                final[r["id"]] = v
    label = {i: a[i] for i in agree}
    label.update({i: v for i, v in final.items() if i in disagree})
    open_cases = [i for i in disagree if i not in final]

    lines = ["# SDG matching: results of the blind review", "",
             f"Pairs labelled by both reviewers: **{len(both)}** of {len(key)}. "
             f"Same label: **{len(agree)}** ({len(agree) / len(both):.0%}); Cohen's kappa **{k:.2f}** (three labels), "
             f"{bin_k:.2f} (relevant vs not). Disagreements: {len(disagree)}, of which settled by discussion: {len(disagree) - len(open_cases)}"
             + (f"; {len(open_cases)} still open and left out below." if open_cases else "."), "",
             "| Method | Links proposed (labelled) | Relevant | Not relevant | Uncertain | Precision (relevant / proposed) |", "|---|---|---|---|---|---|"]
    total_rel = sum(1 for v in label.values() if v == "relevant")
    rows = []
    for col, name in (("A_embedding", "A · embedding only (≥ 0.60)"), ("B_embedding_rules", "B · embedding + review rules (in-sample)"), ("C_keyword", "C · keyword baseline (TF-IDF, top 40)")):
        ids = [i for i in label if key[i][col] == "1"]
        c = Counter(label[i] for i in ids)
        prec = c["relevant"] / len(ids) if ids else 0
        rows.append((name, len(ids), c["relevant"], c["not relevant"], c["uncertain"], prec))
        lines.append(f"| {name} | {len(ids)} | {c['relevant']} | {c['not relevant']} | {c['uncertain']} | {prec:.0%} |")
    lines += ["", f"Relevant pairs in the whole sheet: **{total_rel}**. Share of them each method proposed: "
              + "; ".join(f"{n.split(' ·')[0]} {r}/{total_rel}" for n, _, r, *_ in rows) + " (within this sheet only, not a true recall).", "",
              "Embedding pairs below 0.60 (fresh, not used to write the rules):", "", "| Band | Labelled | Relevant |", "|---|---|---|"]
    for band in ("embedding 0.55-0.60 (fresh)", "embedding 0.50-0.55 (fresh)", "embedding 0.00-0.50 (fresh)", "random negative"):
        ids = [i for i in label if key[i]["source"] == band]
        lines.append(f"| {band} | {len(ids)} | {sum(1 for i in ids if label[i] == 'relevant')} |")
    lines += ["", "Notes: B's rules were drafted after looking at the same 73 matches, so its numbers are in-sample, not an independent test. "
              "Thresholds (0.60, 0.55) are design choices. Labels follow data/sdg/review/GUIDE.md.", ""]
    report = "\n".join(lines)
    print(report)
    if args.final or not disagree:
        (DIR / "results.md").write_text(report, encoding="utf-8")
        print(f"Wrote {DIR / 'results.md'}")
    else:
        print(f"Wrote {DIR / 'disagreements.csv'}: discuss each, fill 'final', then run with --final {DIR / 'disagreements.csv'}")


if __name__ == "__main__":
    main()
