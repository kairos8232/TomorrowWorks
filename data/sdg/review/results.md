# SDG matching: results of the blind review

Pairs labelled by both reviewers: **145** of 145. Same label: **95** (66%); Cohen's kappa **0.48** (three labels), 0.69 (relevant vs not). Disagreements: 50, of which settled by discussion: 50.

| Method | Links proposed (labelled) | Relevant | Not relevant | Uncertain | Precision (relevant / proposed) |
|---|---|---|---|---|---|
| A · embedding only (≥ 0.60) | 73 | 21 | 32 | 20 | 29% |
| B · embedding + review rules (in-sample) | 32 | 21 | 5 | 6 | 66% |
| C · keyword baseline (TF-IDF, top 40) | 40 | 14 | 10 | 16 | 35% |

Relevant pairs in the whole sheet: **35**. Share of them each method proposed: A 21/35; B 21/35; C 14/35 (within this sheet only, not a true recall).

Embedding pairs below 0.60 (fresh, not used to write the rules):

| Band | Labelled | Relevant |
|---|---|---|
| embedding 0.55-0.60 (fresh) | 12 | 3 |
| embedding 0.50-0.55 (fresh) | 10 | 1 |
| embedding 0.00-0.50 (fresh) | 8 | 0 |
| random negative | 8 | 0 |

Notes: B's rules were drafted after looking at the same 73 matches, so its numbers are in-sample, not an independent test. Thresholds (0.60, 0.55) are design choices. Labels follow data/sdg/review/GUIDE.md.
