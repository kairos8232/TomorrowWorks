# Progress log

What was done, why, and what is still open. Newest entry first. Add an entry whenever a decision or finding changes the plan; keep the *how* in the linked documents.

---

## 21 Oct 2026 (00:18–00:35 MYT) — Review, source decision, DOSM import

Work done with Claude. Committed by Carson in `09cd1ce` (docs and source decision) and `977d59c` (DOSM importer and snapshots); this log and its README/CLAUDE.md links are the remaining uncommitted change.

### 1. Reviewed the official PDFs and this repository

Read the four PDFs in the `ChatGPT/TomorrowWorks` folder (read-only, not copied here): Domain 1 brief, Official Handbook, Participant Handbook, Terms & Conditions. Then read `README.md`, `CHECKLIST.md`, `API_PLAN.md`, `PRODUCT_SCOPE.md`, `BUILD_STAGES.md` and the code in `src/`.

**What the README already covered well:** the six must-have features, the six preliminary deliverables and deadline, Apache 2.0 licence, data and AI guardrails, commit-history rules.

**Gaps found:**

| # | Gap | Why it matters | Status |
| --- | --- | --- | --- |
| 1 | Only profile intake works; no trend source, matching, deployment, or Replit yet. | Feasibility (25%) needs a working trend-signal → role-matching demo by **25 Oct 7:59 AM**. | Started: DOSM imported (below). |
| 2 | RunPod was treated as mandatory. | Handbook 9.4 requires RunPod only for GPU work; Replit is the mandatory tool. | Resolved: team chose to use RunPod for a real GPU task (section 4). |
| 3 | Audience framed as "anyone, any age, any industry". | Innovation (30%) rewards "a sharply framed slice … a specific user and moment of need". | Proposed demo user (section 2); product scope docs not changed. |
| 4 | No AI component decided ("model TBD"). | It is an AI hackathon; judges will look for it. | Resolved: ESCO skill search on RunPod (section 4). |
| 5 | Work is on `dev`; `main` was deleted on GitHub. | Judges see the default branch. | Open: set the default branch before submission. |
| 6 | Team section "TBD"; video over 7 min loses 1 point per 30 s; team must be able to explain AI-written code (rule 8.5.4). | Submission risk. | Open. |

### 2. Chose the trend sources and demo user

Recorded in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md); a short summary was added to the README.

- **Demo user:** a junior accounting or bookkeeping worker in the Klang Valley whose routine tasks are being taken over by AI tools. Reason: the ILO places accounting and bookkeeping clerks in its highest GenAI-exposure gradient while DOSM lists accountants among the most-advertised jobs — a real tension to explain.
- **Demand signal (required updatable source):** DOSM *Big Data Analytics: Job Market Insights*, quarterly.
- **AI-exposure signal:** ILO Working Paper 140, *Generative AI and Jobs: A Refined Global Index of Occupational Exposure* (2025), by ISCO-08 occupation (MASCO 2020 follows ISCO-08, so no US crosswalk is needed).
- **Role skills:** a curated set of about eight roles with essential skills from ESCO.
- **Score:** `wF·skill fit + wD·demand trend + wR·(1 − AI exposure)`, every part shown; two weight sets give the moderate and fast AI-change scenarios.
- **Rejected for the preliminary round:** Anthropic Economic Index (good AI-usage tracker, but needs an O*NET ↔ ISCO crosswalk — kept as a Phase 2 idea), Jooble (key and 500-request lifetime limit), news APIs (not demand evidence).

These are proposals. Under handbook rule 8.5.2 the team must own and be able to defend the design choices; change weights or roles if you disagree.

### 3. Imported DOSM Q1 and Q2 2026

Carson downloaded `Data_JMI_Q1_2026.xlsx` and `Data_JMI_Q2_2026.xlsx` from the DOSM release pages.

**What the file actually contains** (one sheet, `e2-Summary Table BI`):
- Table 1: job offerings advertised online by **economic activity**.
- Table 2: job offerings advertised online by **occupation major group** (9 groups, 1-digit MASCO) — *not* individual jobs.
- Each table: annual columns, then **quarterly columns from 2019 Q3**, then monthly columns.

**Added:**
- `scripts/import_dosm_jmi.py` — reads the xlsx, keeps the quarterly series for both tables, tags each occupation row with its ISCO major-group code, and writes JSON with full source metadata (publisher, URL, file, latest quarter, retrieval date, geography, measure, coverage note). It stops with an error if the layout changes or an unknown occupation group appears. Run: `pip install openpyxl`, then `python3 scripts/import_dosm_jmi.py data/raw/Data_JMI_Q2_2026.xlsx 2026-10-21`.
- `data/sources/dosm-jmi-2026-q1.json` and `data/sources/dosm-jmi-2026-q2.json` — the converted snapshots (committed).
- `data/raw/` — the original xlsx files, **gitignored** (`.gitignore` updated); the JSON records where to re-download them.

**Verified:** output matches the Q2 2026 release page — total 555,509 (Q1 626,861); Professionals 285,907 (Q1 315,768).

**Findings that changed the plan:**
1. **Demand is only available per major group.** Job-level counts such as "Accountants and Auditors 22,067" appear only in the press statement. Each role now takes the quarter-on-quarter change of its major group. The Q1 ↔ Q2 switch still moves scores: Professionals +15.8% → −9.5% (D 0.66 → 0.41); Clerical support workers −1.8% → −17.2% (D 0.48 → 0.33).
2. **Year-on-year changes are unreliable.** Almost every group shows +80% to +180% YoY, most likely because DOSM widened its set of job sites rather than demand doubling. The score uses **quarter-on-quarter change only**; state this limitation in the PRD.

### 4. Decided to use RunPod with a real dataset

Carson chose to keep RunPod and wants only trustworthy data (no fake records). Plan, detailed in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#where-ai-is-used-runpod-skill-search-over-a-real-taxonomy):

- **Dataset:** ESCO v1.2 from the European Commission (about 13,900 skills, 3,000 occupations linked to ISCO-08).
- **GPU batch job (RunPod Pod):** embed every ESCO skill label once with a multilingual open-weights model such as `BAAI/bge-m3`; save the vectors. Keep Pod ID, GPU type and runtime for the Tools Declaration screenshot.
- **Runtime (RunPod Serverless):** embed the user's own description (English, Bahasa Malaysia or Chinese) and return the nearest real ESCO skills; the user confirms each one.
- **Guardrail:** retrieval only — the model never creates skills, roles, courses, statistics or scores.
- **Fallback:** searchable ESCO list if the endpoint is down.
- **Kaggle rule:** use a Kaggle dataset only when it names its original source and licence, and prefer the original publisher. Scraped job-post datasets with unclear terms are not acceptable evidence.

### 5. Files created or changed in this session

| File | Change |
| --- | --- |
| `SIGNALS_AND_MATCHING.md` | New. Sources, demo user, data shapes, candidate roles, scoring rule with worked example, snapshot switch, skills radar, RunPod plan, risks and fallbacks. Updated with real DOSM findings. |
| `CLAUDE.md` | New. Project context, deadlines, hard rules, stack and commands, git notes, working preferences — read by Claude at the start of each session. |
| `PROGRESS_LOG.md` | New. This log. |
| `README.md` | Added "Chosen Signals and Matching" section; new files in the structure tree. |
| `API_PLAN.md` | One-line pointer to the decision at the top. |
| `.gitignore` | Ignore `data/raw/`. |
| `scripts/import_dosm_jmi.py` | New DOSM importer. |
| `data/sources/dosm-jmi-2026-q1.json`, `dosm-jmi-2026-q2.json` | New converted snapshots. |

`CHECKLIST.md` was **not** ticked: Stage 1 source items and Stage 5a/5b are partly done but not fully verified by the team yet.

### 5b. Requested the ESCO download (00:36–00:40)

First package selection was wrong (Content *Delta*, Language *independent*): Delta holds only changes between versions, and the language-independent package has no skill or job names. Corrected to **v1.2.1, Classification, English, CSV (48.95 MB)**; ESCO sends the file by e-mail after a request form. The ESCO site announced maintenance on 21 Oct, so the page or e-mail may be delayed.

Licence terms recorded in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#esco-download-settings-and-licence-requested-21-oct-2026) and `CLAUDE.md`: show the ESCO acknowledgement in the app and documents, label adapted ESCO content, and note that the Commission does not guarantee accuracy.

### 6. Open items (next)

1. ~~Download the ILO WP140 PDF~~ — done: `data/raw/Generative AI and Jobs: A Refined Global Index of Occupational Exposure.pdf` (53 pages). Table A1 is present and readable as text, e.g. 4311 Accounting and Bookkeeping Clerks mean 0.64 / SD 0.07; 2411 Accountants 0.51 / 0.08.
2. ~~Download ESCO~~ — done: `data/raw/ESCO dataset - v1.2.1 - classification - en - csv/` (19 CSV files). It also includes `greenSkillsCollection_en.csv` and `greenShareOcc_en.csv`, which can support a sourced SDG 7/12/13 link for green skills.
3. Add the ESCO acknowledgement to the app footer and to the PRD, slides and Tools Declaration.
4. Verify the candidate role codes against MASCO 2020.
5. Then build: ILO importer → `data/roles.json` → scoring module + unit test → snapshot/scenario switches in the UI → RunPod embedding job → Replit deployment.
6. Before submission: set the GitHub default branch, fill in Team, complete the PRD, slides, declaration and video.

### Commits

- `09cd1ce` — `CLAUDE.md`, `SIGNALS_AND_MATCHING.md`, README section, `API_PLAN.md` pointer.
- `977d59c` — DOSM importer, Q1/Q2 2026 snapshots, `.gitignore`, updated plan after the DOSM findings.
- Next: `Add progress log` — `PROGRESS_LOG.md` plus its links in `README.md` and `CLAUDE.md`.
