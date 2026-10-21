# CLAUDE.md — TomorrowWorks

Context for Claude (and any coding agent) working in this repository.

## What this is

Team entry for the **SDC Hackathon 2026** (XMUM AI Club), **Domain 1: Aiversecity Future-Ready Workforce**. A web app that takes a person from "who I am today" to "where I can be in the AI era": skills profile → AI/job-market trend signals → explainable role matches → reskilling pathway, with SDG links and at least two future scenarios.

Read in this order: `README.md` (overview and submission rules) → `SIGNALS_AND_MATCHING.md` (chosen sources and scoring rule) → `CHECKLIST.md` (status) → `BUILD_STAGES.md` (next small commit). `PROGRESS_LOG.md` records what was done and what is open — read it first, and add an entry after each working session. `PRODUCT_SCOPE.md`, `PERSONAL_GUIDANCE.md`, `SCREENS.md`, `UI_UX.md`, `DESIGN.md` hold product and UI rules.

The official PDFs (Domain 1 brief, handbooks, T&C) live **outside this repo** in the owner's `ChatGPT/TomorrowWorks` folder. Treat that folder as read-only; never copy the PDFs into the repo.

## Deadlines (MYT, UTC+8)

- **Preliminary submission: Sun 25 Oct 2026, 7:59:59 AM** via sdchack.my — PRD (official template), pitch slides, live prototype link, Technical & Tools Declaration, public GitHub repo, 5–7 min YouTube video (−1 point per 30 s over).
- Finalists announced 28 Oct 8 PM; physical hackathon 31 Oct at XMUM; pitch 1 Nov (10 min + 5 min Q&A, slides as .pptx).
- No commits to the submitted repo after a deadline.

## Preliminary priority

Judges want a rough, **working** version of the most important feature: **trend signal layer feeding role matching**, and visible proof that changed trend data changes the result. Rubric: Innovation 30, Problem–Solution Fit 25, Feasibility 25, Clarity 20. Build Stages 5 → 7 → 8 before polishing UI. The day-by-day plan to the deadline is in `BUILD_STAGES.md` under "Next selection".

## Hard rules (from the brief and handbook)

- **No invented data.** No fabricated jobs, courses, statistics, vacancy counts, match scores or SDG claims. Every displayed signal carries source name, URL, publication date, retrieval date, geography and measure. Empty or "no data" states are fine; made-up numbers are not.
- **Public, open or synthetic data only.** No real CVs or personal data, ever.
- **LLMs never generate roles, courses or scores.** If used, an LLM only maps text onto known lists, and the model is disclosed.
- **Replit must be used** (proof goes in the Tools Declaration). **RunPod must be used and must not be cut from scope** (team decision): Job A embeds ESCO skills on a GPU Pod, Job B serves query embeddings on Serverless. See `RUNPOD_SETUP.md` Part 2; keep Pod ID, GPU type, runtime and endpoint URL for the declaration. Datasets must come from the original publisher or a mirror with a clear source and licence.
- **ESCO licence:** the app footer must say *"This service uses the ESCO classification of the European Commission."*; documents using ESCO say *"This publication uses the ESCO classification of the European Commission."* Label any adapted ESCO content (curated roles, synonyms) as adapted. Details in `SIGNALS_AND_MATCHING.md`.
- **No secrets in the repo.** Use `.env` locally (gitignored) and Replit Secrets. Never commit API keys (RunPod, Replit, any provider), passwords, `.env` files, or dashboard screenshots (`evidence/` is gitignored; screenshots go in the Tools Declaration). Run `git diff --cached` before every commit and stop if a key-like string appears. Pod IDs, GPU types and endpoint IDs are not secrets.
- `LICENSE` must stay Apache 2.0. The repo must be public at submission with committee accounts as collaborators.
- Commit history must be small and truthful. One visible behaviour per commit, with its `CHECKLIST.md` update. Never bundle a large commit near a deadline.
- The team must be able to explain every line. Keep code simple and readable; prefer a plain function over a clever abstraction. Explain non-obvious decisions in the commit message or the docs.

## Stack and commands

React 19 + TypeScript + Vite 6. Node 20+.

```bash
npm install
npm start          # http://127.0.0.1:5173
npm run build      # tsc --noEmit && vite build
npm test           # vitest: scoring rules, worked example, search, real-data checks
npm run serve      # server/index.mjs on :5000: dist/ + POST /api/skill-search (RunPod Job B)
```

Key code: `src/main.tsx` (home, navigation, step bar, coming-soon pages), `src/data.ts` (imported data, profile type, Aina the fictional sample), `src/SkillsStep.tsx` (1. Your skills), `src/MovesStep.tsx` (2. Your moves ledger), `src/PlanStep.tsx` (3. Your plan; rule in `src/pathway.ts`, courses in `data/pathway/resources.json`, NOSS in `data/pathway/noss.json` — both hand-checked, never generated), `src/PublicTables.tsx` (Job ads, AI exposure). `src/TeamView.tsx` + `src/team.ts` (Team view for HR and career centres), `src/changes.ts` (What changed between snapshots), `src/i18n.tsx` (EN/BM/中文 screen text; English is the key), `src/fairness.test.ts`. Sample people and teams are in `src/data.ts` (all fictional). Screen behaviour: `SCREENS.md`.

Data: raw sources in `data/raw/` (gitignored): DOSM JMI xlsx, ILO WP140 PDF (Table A1 via `pdftotext -layout`), ESCO v1.2.1 CSV folder. `scripts/import_ilo_exposure.py <pdf> <download date>` (needs pdftotext) writes `data/sources/ilo-genai-exposure-2025.json`. `runpod/embed_esco_skills.py` runs on a RunPod GPU Pod (`--dry-run` locally). `scripts/import_dosm_jmi.py <file> <release date> <download date>` (needs openpyxl) converts a DOSM JMI xlsx in `data/raw/` (gitignored) into `data/sources/dosm-jmi-<quarter>.json`. DOSM occupation data is by **major group only**; use quarter-on-quarter change, not year-on-year.

`scripts/import_lfs_month.py` → `data/sources/opendosm-lfs-month.json` and `scripts/import_gdelt_news.py` → `data/sources/gdelt-news.json` need internet that Claude's workspace does not have (both hosts are blocked); Carson runs them on his Mac. The committed files start as empty snapshots, and the UI shows "not imported yet". News never feeds scores.

Courses at scale: `scripts/import_coursera_catalog.py` (Carson's Mac, stdlib) → `data/raw/coursera-catalog.json` (gitignored; ~25,000 courses with Coursera's own text). `scripts/match_courses_runpod.py` (Mac, numpy, RunPod key from env/.env) embeds them on RunPod Job B, compares with the Job A ESCO vectors, and writes `data/derived/coursera-skill-matches.json` (name, link, stated workload, similarity only) plus `coursera-spotcheck.md`. AI-matched courses are labelled as not hand-checked; `--fake N` tests offline.

`scripts/build_roles.py <ESCO folder>` writes `data/roles.json` (9 ESCO occupations; skills with green/digital flags). ESCO skill vectors from RunPod are in `data/derived/esco/`.

Server: `server/index.mjs` (no dependencies) serves `dist/`, `/api/skill-search` and `/api/news` (`server/news.mjs`: GDELT fetched at most once a day until 1 Nov 2026, memory only, snapshot fallback; topic words in `data/sources/news-topics.json`, shared with the Python importer; per-topic key headlines picked by RunPod bge-m3 (centroid nearest, extractive, one batch per daily set)); `server/search.mjs` loads the RunPod vectors and ranks skills (tests in `server/search.test.mjs`). The RunPod key is read from env (Replit Secrets) only. Replit publishes as **Autoscale**.

SDG: links in `data/sdg/sdg-links.json` (role reasons by hand, skill rules in `src/sdg.ts`; goal `short` names for tags). UI rule (Carson, 21 Oct): goals are picked in *Your skills* like interests (`Profile.goals`, up to two), used in *Your moves* through one *Goals* switch, tagged on a row only for a picked goal (colour square + number + short name, never a bare number), and shown again as the contribution in *Your plan* and Team view. Don't add SDG tags that appear on every row or claims a goal applies to all roles.

Scoring: `src/scoring.ts` (pure functions: skill fit with exact and transferable skills, demand trend, AI resilience, scenarios, ranking, `recommendMoves`). Transferable skills come from `data/derived/transferable-skills.json` (`scripts/build_transferable_skills.py`, threshold 0.85, half credit); tests in `src/scoring.test.ts`. Change the rule only together with its tests and `SIGNALS_AND_MATCHING.md`.

## Git

Work happens on `dev`. `main` on GitHub was deleted. Before submission, make sure the repository's default branch shows the code that is demoed.

**Commit identity (so GitHub shows Verified):** Claude's workspace signs commits with Claude's SSH key. Set only the **author** to Carson and leave the **committer** as Claude:

```bash
git commit --author="Yun Loong <wksl.yl36@gmail.com>" -m "..."
```

Do **not** override `user.name`/`user.email` (that makes the committer Carson, whose account does not own Claude's key, so GitHub marks the commit Unverified). Commits made on Carson's Mac follow his own signing setup. Do not rewrite or force-push old commits to change their badges.

## Working with the owner (Carson)

- Year 2 CS student; replies should be direct and concise.
- Ask before changing product scope or rubric strategy; propose, don't silently rewrite.
- Do not check off checklist items that were not actually verified.
