# Progress log

What was done, why, and what is still open. Newest entry first. Add an entry whenever a decision or finding changes the plan; keep the *how* in the linked documents.

---

## 21 Oct 2026 — Imported app running on Replit

- Installed the existing React, TypeScript and Vite dependencies, preserving their pinned versions and the repository structure.
- Added a Replit Run workflow: `npm run dev -- --port 5000 --strictPort`.
- Allowed proxied development hosts in `vite.config.ts`; documented setup and current service limitations in `replit.md`.
- Verified `npm run build` (type check and production bundle), HTTP 200 through the Replit development URL, and a rendered home-page screenshot. The browser reported one resource 404; no JavaScript exception was reported.
- No sign-in, market-data or RunPod integration was added. The combined Stage 3 evidence item remains unchecked because declaration evidence has not been retained by the team.

---

## 21 Oct 2026 (01:00–) — RunPod Job A in progress

- **Credit:** US$25.00 sponsor credit on the team RunPod account.
- **Attempt 1 failed (RunPod host fault):** Pod `embarrassed_rose_loon` (`adddib7tt6cxi9`), RTX 4000 Ada, template Runpod PyTorch 2.8 (`runpod/pytorch:1.0.2-cu1281-torch280-ubuntu2404`). The container never started: the host could not resolve `registry-1.docker.io` (DNS i/o timeout). None of our code ran. Pod terminated; no credit used.
- **Attempt 2 running:** Pod `rear_amethyst_gull` (`40jrr8aulh76tb`), **RTX A5000**, US$0.27/hr, same template. Next: Jupyter → run `embed_esco_skills.py` → download `out/` to `data/derived/esco/` → dashboard screenshot → terminate.
- **Job A done (01:11):** on the RTX A5000, `embed_esco_skills.py` embedded **13,960 ESCO skills in 92.5 s** (`Device: cuda NVIDIA RTX A5000`). Output unzipped into `data/derived/esco/`: `esco-skill-vectors.f16.npy` (13,960 × 1024, 28.6 MB), `esco-skill-index.json`, `run-info.json`.
- **Checked:** row count matches the index; all vectors unit length; no NaN. Nearest neighbours make sense, e.g. *manage budgets* → *budget for financial needs* (0.87); *use spreadsheets software* → *use word processing software* (0.81). ESCO's CSV repeats 21 skills (13,939 unique URIs); the app must de-duplicate by URI when loading.
- **Evidence:** terminal screenshot (GPU name, "Done in 92.5s") and Pods-page screenshot (name, ID, GPU, runtime) kept outside the repo for the Tools Declaration. Pod to be terminated after download.
- **Repo safety:** `.gitignore` now also excludes `*.pem`, `*.key`, `secrets*`, `.runpod/`, `evidence/` (dashboard screenshots belong in the Tools Declaration, not the repo) and `*.zip`. Pod IDs and GPU types are not secrets; API keys are, and live only in Replit Secrets.

---

## 21 Oct 2026 (00:44–01:00 MYT) — ILO import; RunPod made a required part of the build

**Decision (Carson):** RunPod must be used and stays in scope, with trustworthy data only. Docs updated so RunPod is never on the drop list.

**ILO importer — `scripts/import_ilo_exposure.py`:**
- Reads Annex Table A1 from the downloaded PDF with `pdftotext -layout` and writes `data/sources/ilo-genai-exposure-2025.json` with full source metadata.
- Result: **427 occupations, 112 exposed, 13 in Gradient 4**, matching the paper's own counts.
- First attempts were wrong and fixed: (1) rows with a label prefix or an SD of exactly 0 were skipped; (2) carrying labels over from the previous row mislabelled 187 rows, because each label is stacked around its own row. Final method reads the label from the row's own three lines and uses the paper's threshold rule only where the label cannot be read (91 rows). Where both exist they agree except 4 boundary rows (rounded mean + SD = 0.40); the printed label is kept.
- Our eight roles: 4311 Gradient 4 (0.64), 2413 Gradient 4 (0.62), 2120 Gradient 3 (0.56), 2512 Gradient 3 (0.53), 2411 Gradient 3 (0.51), 3313 Gradient 2 (0.49), 2421 Gradient 2 (0.46), 2133 Minimal exposure (0.38).

**RunPod — `runpod/embed_esco_skills.py` and [RUNPOD_SETUP.md](RUNPOD_SETUP.md#part-2-project-gpu-work-required) Part 2:**
- ESCO `skills_en.csv`: 13,960 released skills, 86,690 alternative labels; `occupationSkillRelations_en.csv`: 67,600 essential and 58,451 optional links.
- **Job A (GPU Pod):** embed each skill (label, up to 8 alternative labels, description) with `BAAI/bge-m3`; output ≈ 28.6 MB of vectors plus an index and `run-info.json` (model, GPU, runtime). Dry run verified locally; GPU run not done yet.
- **Job B (Serverless):** same model embeds the user's description; the Replit backend returns the nearest real ESCO skills for the user to confirm.
- Evidence checklist (Pod ID, GPU type, runtime screenshot; endpoint URL) and a searchable-list fallback are written down.
- Plan moved Job A to **Wednesday** so RunPod evidence exists early.

**Files:** new `scripts/import_ilo_exposure.py`, `data/sources/ilo-genai-exposure-2025.json`, `runpod/embed_esco_skills.py`; updated `RUNPOD_SETUP.md`, `SIGNALS_AND_MATCHING.md`, `BUILD_STAGES.md`, `CHECKLIST.md`, `CLAUDE.md`, `README.md`.

**Next:** run Job A on a RunPod Pod (Carson, needs the team account) · ESCO role importer → `data/roles.json` · scoring module + unit test · Replit import.

---

## 21 Oct 2026 (00:42–00:50 MYT) — Inputs complete, plan to the deadline

**Status:** all three source files are in `data/raw/` (DOSM Q1/Q2 2026 xlsx, ILO WP140 PDF, ESCO v1.2.1 CSV). Next work is code, not research.

**Done in this entry:**
- **Verified the eight candidate role codes** against ESCO `ISCOGroups_en.csv` and ILO Table A1; all present. ILO scores added to the role table in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#candidate-roles). The demo user's current job (4311, 0.64) is the most exposed; Environmental protection professionals (2133, 0.38) the least. MASCO 2020 check still open.
- **Fixed the DOSM importer** to store the release date (`publishedAt`), which the brief requires on every source. It now takes three arguments: file, release date, download date. Regenerated both snapshots: Q1 published 2026-06-25 (date of DOSM's Q1 release file and press coverage; confirm on the release page), Q2 2026-08-18 (release page).
- **Ticked verified checklist items** in [CHECKLIST.md](CHECKLIST.md): Stage 1 (Replit/RunPod split, sample import, measure label, risks), Stage 2 (GPU task chosen), Stage 5 (repeatable import, metadata, refresh command). DOSM reuse terms remain unchecked.
- **Wrote the day-by-day plan** in [BUILD_STAGES.md](BUILD_STAGES.md#next-selection-updated-21-oct-2026), with a drop order if time runs short.

**Next step (Wed 21):** ILO importer → ESCO roles importer → scoring module with the worked-example unit test → import the repo into Replit.

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
