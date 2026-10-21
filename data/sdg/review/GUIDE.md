# SDG match review: guide for reviewers

TomorrowWorks links ESCO work skills to UN SDG targets. We want to know whether those links are
right, and whether our AI matching does better than simple keyword matching. Two people label the
same pairs **independently**; their answers are compared afterwards.

## What you do

1. Take your own sheet: reviewer 1 uses `review-A.csv`, reviewer 2 uses `review-B.csv`. Open it in
   Excel, Numbers or Google Sheets. (The pairs are the same; the order is different.)
2. **Do not open `key.csv`**, do not look at the app's SDG panels while reviewing, and do not discuss
   pairs with the other reviewer until both sheets are done.
3. For each row, read the skill and the official UN target text, then write one verdict:
   `relevant`, `not relevant` or `uncertain` (exactly these words). Use `note` for anything unclear.
4. About 145 rows, about 45–60 minutes. Save the file as CSV with the same name.
5. When both sheets are done, run `python3 scripts/evaluate_sdg_review.py`. Discuss each pair in
   `disagreements.csv`, write the agreed label in `final` with a short reason, then run
   `python3 scripts/evaluate_sdg_review.py --final data/sdg/review/disagreements.csv`.

## Definitions

- **relevant**: the skill directly supports an activity that the target explicitly describes.
  Example: *global standards for sustainability reporting* → 12.6 (companies adopt sustainable
  practices and integrate sustainability information into their reporting).
- **not relevant**: the connection rests only on shared words, a broad "sustainability" theme, or an
  assumption the target does not state. Example: *build business relationships* → 17.16 (the global
  partnership between countries); *develop automated migration methods* (moving data) → 10.7
  (migration of people).
- **uncertain**: the link could be real, but it depends on the specific job or on how the skill is
  used. Example: *offer financial services* → 9.3 (access of small enterprises to financial services)
  holds only if the services reach small enterprises.

Judge the **target**, not just the goal: *advise on carbon emissions reduction* is about climate, but
13.3 is specifically about climate education, awareness and capacity. Climate relevance alone does
not make it relevant to 13.3.

## What the results are used for

`results.md` reports reviewer agreement (Cohen's kappa), and for each method how many proposed links
are relevant: A (AI embedding, similarity ≥ 0.60), B (A plus our review rules, which is what the app
shows) and C (keyword baseline). The numbers go into the PRD and pitch as measured, including if the
keyword baseline does as well. B is in-sample: its rules were written after looking at the same 73
matches. When the review is done, set `"status"` in `data/sdg/sdg-review.json` to `"team-reviewed"`
and update the rejections and uncertain marks to match the agreed labels.

This publication uses the ESCO classification of the European Commission.
