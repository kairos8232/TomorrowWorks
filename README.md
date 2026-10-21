<div align="center">

# 🌅 TomorrowWorks

### Navigate the future of work, one skill at a time.

**A public, evidence-driven guide to changing work and skills, with optional personal career guidance.**

![Status](https://img.shields.io/badge/status-working%20prototype-blue)
![Domain](https://img.shields.io/badge/domain-Aiversecity%20Future--Ready%20Workforce-green)
![SDGs](https://img.shields.io/badge/impact-UN%20SDGs-orange)

</div>

## Overview

AI and other industry changes affect people across ages, occupations, and career stages. **TomorrowWorks** aims to help anyone explore what is happening at work, which skills and roles have supported demand signals, and what might change. The first source coverage is Malaysia-first; visitors can browse without an account.

Instead of offering generic chatbot career advice, TomorrowWorks is designed to connect **dated, identifiable labour-market and AI-trend signals** to **explainable role recommendations**, **personalised skills-gap analysis**, and **actionable reskilling pathways**. Recommendations also explain their relationship to the **17 United Nations Sustainable Development Goals (SDGs)**.

> **Project stage (21 Oct 2026):** A working React, TypeScript and Vite prototype runs on Replit. It has sourced role rankings, DOSM snapshot and AI-scenario switches, a RunPod-backed ESCO skill search, learning plans with checked courses and Malaysian certification routes, and explained SDG links. Fictional individual and team views cover the four target groups in the brief. The GDELT news page is built but its snapshot is still empty; the public *Skills in demand* page is still planned. Team review of translations and SDG mappings, live-demo checks, and submission materials remain open. See [SCREENS.md](SCREENS.md), [CHECKLIST.md](CHECKLIST.md) and [PROGRESS_LOG.md](PROGRESS_LOG.md) for current behaviour and status.

## The Problem

- Workers may not know which AI-related skills to learn next.
- Graduates and career switchers struggle to identify resilient career pathways.
- Employers and educators need clearer evidence for reskilling decisions.
- Static career advice becomes outdated as AI capabilities and hiring needs evolve.

**Our question:** How can we turn changing AI and job-market signals into understandable, personalised, and human-centred career guidance?

## Who It Is For

Anyone interested in work and skills, including students, employed or unemployed people, people returning to work, career switchers, advisers, and employers. The product does not ask for age to browse. Initial source coverage may be limited; the app must show those limits clearly. See [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md) for the full product promise and evidence rules.

## How People Use the App

```mermaid
flowchart LR
    H[Home] -->|Try a sample person| M[2. Your moves]
    H -->|Start with my own skills| S[1. Your skills]
    S --> M
    M --> P[3. Your plan]
    H --> T[Team view for sample groups]
    H --- J[Job ads]
    H --- A[AI exposure]
```

New visitors start on **Home** and can enter their own skills or use **View as** to explore fictional examples: Aina (working adult), Hakim (fresh graduate), Puan Rosnah (HR manager) and Encik Lim (career adviser). Individuals follow **1. Your skills** (confirm ESCO skills from a RunPod search or the searchable list), **2. Your moves** (a compact ranking with focused role, quarter-comparison, method and preference views) and **3. Your plan** (ordered courses, uncovered gaps and NOSS/SKM routes). Role details keep skills and evidence links together; the method view holds the longer source and fairness explanations. The two team examples show a score heatmap and shared gaps. Everyone can browse Job ads, AI exposure and the currently empty Workplace news page. The interface supports English, Bahasa Malaysia and Chinese; ESCO names and provider course titles remain in English. These are demo views, not accounts; no profile is saved. See [SCREENS.md](SCREENS.md).

## Required Features

| Feature | Working in the prototype | Remaining check |
| --- | --- | --- |
| Skills profile intake | Confirm skills from RunPod-assisted ESCO search or the list, choose a current role and up to two optional work interests; fictional profiles can be loaded | Real accounts and résumé upload need separate privacy decisions |
| AI-trend signal layer | Dated DOSM Q1/Q2 2026 job-ad snapshots and ILO occupation exposure feed the role score; OpenDOSM monthly unemployment appears as separate context | Check DOSM reuse terms and refresh workflow before submission |
| Future-role matching | Nine ESCO roles ranked with visible skill fit, demand and AI-resilience parts; current job shown separately; exact, transferable and missing skills shown | Verify the complete live demo and source claims |
| Personalised reskilling | Selected move produces ordered steps from 21 checked course records, provider-stated times, uncovered gaps and a sourced NOSS/SKM route where found | Course coverage remains partial; a certification route is not a job requirement |
| SDG mapping | Role and skill links with reasons appear in moves, plans and team views; a person's chosen goals may optionally count in ranking | Team review of the drafted mappings is pending |
| Handling uncertainty | Q1/Q2 data switch and gradual/fast AI-change scenario switch show score and rank changes | Results are estimates based on stated weights, not forecasts of job loss |

### Suggested differentiator: Future Signal Engine

**Public market evidence → Current skills demand and future outlook → Personal fit → Skill gap → Learning plan**

The key prototype goal is to show that **changing trend evidence changes a career recommendation or its explanation**. This distinguishes TomorrowWorks from a static list of jobs or a generic CV chatbot.

## Chosen Signals and Matching (Preliminary Build)

Details, data shapes, findings and the worked example are in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md).

**Demo user:** a junior accounting assistant in the Klang Valley, 1–5 years in, whose routine tasks (data entry, billing, reconciliation, reports) are increasingly done by AI tools, deciding what to learn next. The clerical accounting work around this job (ISCO 4311) is in the ILO's highest GenAI-exposure gradient, while accountants are among DOSM's top advertised jobs.

### Data sources (all public, dated, attributed)

| Signal | Source | In the repo | Status |
| --- | --- | --- | --- |
| **Demand now** (the required updatable source) | DOSM *Big Data Analytics: Job Market Insights*, quarterly online job offerings by occupation major group | `data/sources/dosm-jmi-2026-q1.json`, `-q2.json` (`scripts/import_dosm_jmi.py`) | Imported; totals match DOSM's release (Q2 2026: 555,509) |
| **AI exposure** | ILO Working Paper 140, *Generative AI and Jobs: A Refined Global Index of Occupational Exposure* (2025), Table A1 | `data/sources/ilo-genai-exposure-2025.json` (`scripts/import_ilo_exposure.py`) | Imported; 427 occupations, 112 exposed, 13 in Gradient 4 (match the paper) |
| **Roles and skills** | ESCO v1.2.1 (European Commission) | `data/roles.json` (`scripts/build_roles.py`) | Built; 9 ESCO occupations with essential/optional skills and green/digital flags |
| **Skill search index** | ESCO v1.2.1 skills embedded with `BAAI/bge-m3` on a **RunPod GPU** | `data/derived/esco/` (`runpod/embed_esco_skills.py`) | Done: 13,960 skills in 92.5 s on an NVIDIA RTX A5000 |
| **Labour context** | OpenDOSM monthly Labour Force Survey | `data/sources/opendosm-lfs-month.json` (`scripts/import_lfs_month.py`) | Imported through Aug 2026; shown separately from job-ad scoring |
| **Workplace news** | GDELT metadata for Malaysian outlets | `data/sources/gdelt-news.json` (`scripts/import_gdelt_news.py`) | Page and importer built; no headlines imported yet; news never affects scores |

**Known limits:** DOSM's data file gives vacancies by major group only (not per job), so roles in one group share a demand signal; year-on-year DOSM changes are distorted by wider source coverage, so only quarter-on-quarter change is used. ILO exposure means tasks *could* change, not that jobs disappear.

### Role set

| Role (ESCO) | ISCO | ILO exposure | Essential skills |
| --- | --- | --- | --- |
| billing clerk | 4311 | 0.64 (Gradient 4) | 12 |
| **accounting assistant** (demo user's job) | 3313 | 0.49 (Gradient 2) | 20 |
| bookkeeper | 3313 | 0.49 (Gradient 2) | 18 |
| accountant | 2411 | 0.51 (Gradient 3) | 26 |
| financial analyst | 2413 | 0.62 (Gradient 4) | 23 |
| business analyst | 2421 | 0.46 (Gradient 2) | 26 |
| data analyst | 2511 | 0.49 (Gradient 2) | 36 |
| software developer | 2512 | 0.53 (Gradient 3) | 24 |
| sustainability manager | 1213 | 0.36 (Not exposed) | 48 |

### Scoring

The default score is `wF·F + wD·D + wR·R`, with every part shown on screen:

- **F, skill fit:** `(exact + 0.5 × transferable) / essential skills`. *Transferable* means the person holds a different ESCO skill whose RunPod embedding is ≥ 0.85 similar; the pair is shown. The person's current job is listed separately and only other roles are ranked.
- **D, demand trend:** `clamp(0.5 + quarter-on-quarter change, 0, 1)` for the role's DOSM major group.
- **R, AI resilience:** `1 − ILO mean exposure`.

| Scenario (estimate) | wF | wD | wR |
| --- | --- | --- | --- |
| Moderate AI change | 0.60 | 0.25 | 0.15 |
| Fast AI change | 0.50 | 0.20 | 0.30 |

Two **optional, off-by-default** switches can add work-interest fit and chosen-SDG fit to the ranking. Interest profiles use job tag for eight roles and O*NET for one; SDG links use documented role reasons and skill rules. Each optional part has weight 0.20 before all weights are rescaled. The user can inspect the resulting change in rank. See [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#interest-fit-optional-fourth-part-added-21-oct-2026) for the rules and source limits.

**Real result for the demo user (Q2 2026):** bookkeeper 58, accountant 45, billing clerk 36, financial analyst 21 under moderate change; under fast change sustainability manager rises from 6th to 4th. Details in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#demo-result-with-real-data-accounting-assistants-20-esco-skills).

**Proof that trends matter:** a *Job-ad data* switch (DOSM Q1 ↔ Q2 2026) changes D for the same profile. Real example: Professionals +15.8% → −9.5% (D 0.66 → 0.41); Clerical support −1.8% → −17.2% (D 0.48 → 0.33). The importer can convert a future DOSM release; exposing a new snapshot in the current two-option interface also requires a small code update.

### Where AI is used: RunPod

RunPod is a required part of the build ([RUNPOD_SETUP.md](RUNPOD_SETUP.md)). One open-weights multilingual model, `BAAI/bge-m3`:

1. **Job A (GPU Pod, done):** embedded every ESCO skill once (Pod `40jrr8aulh76tb`, RTX A5000, 92.5 s).
2. **Job B (Serverless, live):** embeds the person's own description (English, Bahasa Malaysia or Chinese); the backend returns the nearest real ESCO skills and the person confirms which are true. A Chinese search was verified on the published Replit app on 21 Oct 2026; English and Malay live checks remain to be recorded.

The model only retrieves existing ESCO records. It never creates roles, courses, statistics or scores. If the endpoint is unavailable, the person picks skills from a searchable list.

## Example Demo (Synthetic Profile)

**Sample profile (fictional):** accounting assistant; confirms ESCO skills such as *accounting entries*, *maintain financial records*, *use accounting systems*, *issue sales invoices*; interested in analytics.

**How a match is explained:** for *data analyst*, the app lists which of its 36 ESCO essential skills the profile already holds and which are missing (for example *query languages*, *data visualisation software*, *perform data cleansing*), shows D from the DOSM Professionals group and R from ILO code 2511, and shows the scenario weights. The learning plan orders checked courses against the gaps, shows provider-stated time and leaves uncovered skills visible. A related NOSS/SKM route appears when sourced, without claiming it is required for employment.

> The profile is **synthetic**. Match scores are estimates calculated from the documented rule and sources; course links and study times come from checked provider pages. SDG links describe connections, not measured impact.

## Data, Evidence and AI Guardrails

Candidate news, vacancy, official-statistics, and skills sources are documented in [API_PLAN.md](API_PLAN.md). These sources must pass the Stage 1 access and suitability checks before the app presents their data.

- Use **public, open or synthetic data only**; no real CVs or personal records in demos.
- Show the **name, date and link/reference** for each underlying trend source.
- Document the scoring methodology, assumptions and limitations.
- Verify job titles, courses, and statistics rather than allowing a language model to invent them.
- Disclose `BAAI/bge-m3` and its retrieval-only purpose, plus the AI development tools actually used, in the Technical & Tools Declaration.
- Present AI forecasts as scenarios/estimates, not guaranteed outcomes.
- Support human career decisions; do not automate final hiring decisions.
- Avoid making recommendations based on protected or irrelevant personal attributes.
- Disclose development assistance from AI tools, including Codex, in the required Technical & Tools Declaration. The team must review and be able to explain all submitted work.

## Current App Structure

```text
TomorrowWorks/
├── index.html              # Browser entry point
├── src/
│   ├── main.tsx            # App shell, navigation and fictional View as options
│   ├── data.ts             # Source data and fictional people and teams
│   ├── SkillsStep.tsx      # 1. Your skills: RunPod search and skill list
│   ├── MovesStep.tsx       # 2. Your moves: ranked ledger and switches
│   ├── PlanStep.tsx        # 3. Your plan: courses, gaps and NOSS/SKM route
│   ├── TeamView.tsx        # Fictional team and class heatmaps
│   ├── PublicTables.tsx    # DOSM job ads and ILO exposure
│   ├── NewsView.tsx        # GDELT headlines or honest empty state
│   ├── i18n.tsx            # English, Bahasa Malaysia and Chinese interface text
│   ├── scoring.ts          # Explainable skill, demand and resilience score
│   ├── pathway.ts          # Course selection and order
│   ├── interests.ts, sdg.ts # Optional interest and SDG fit
│   └── styles.css          # Responsive styles
├── package.json            # Scripts and pinned dependencies
├── CHECKLIST.md            # Staged build and submission tasks
├── BUILD_STAGES.md         # Small commit slices for each stage
├── SCREENS.md              # Purpose and behaviour of each screen
├── PRODUCT_SCOPE.md        # Audience, public areas, and evidence rules
├── PERSONAL_GUIDANCE.md    # Personal gaps, promotion targets, and credentials
├── UI_UX.md                # Screen layout and usability decisions
├── DESIGN.md               # Visual and component consistency rules
├── RUNPOD_SETUP.md         # RunPod GPU jobs, evidence, and agent tooling status
├── runpod/
│   └── embed_esco_skills.py # RunPod GPU job: embed ESCO skills
├── SIGNALS_AND_MATCHING.md # Chosen sources, scoring rule, and demo proof
├── CLAUDE.md               # Context and rules for coding agents
├── PROGRESS_LOG.md         # What was done, findings, and open items
├── scripts/
│   ├── import_dosm_jmi.py      # DOSM xlsx → data/sources/dosm-jmi-<quarter>.json
│   ├── import_ilo_exposure.py  # ILO WP140 PDF → data/sources/ilo-genai-exposure-2025.json
│   ├── build_roles.py          # ESCO CSV → data/roles.json
│   ├── build_transferable_skills.py # RunPod vectors → transferable skills
│   ├── import_lfs_month.py     # OpenDOSM monthly labour context
│   ├── import_gdelt_news.py    # Malaysian workplace news metadata
│   └── import_coursera_catalog.py, match_courses_runpod.py # Course matching preparation
├── data/
│   ├── sources/            # Attributed DOSM, ILO, OpenDOSM and empty GDELT snapshots
│   ├── roles.json          # Nine ESCO roles with skills (adapted ESCO selection)
│   ├── derived/esco/       # ESCO skill vectors from the RunPod GPU run
│   ├── pathway/            # Checked courses and sourced NOSS/SKM routes
│   ├── interests/          # Role interest profiles and sources
│   ├── sdg/                # Reviewed-role draft and skill-link rules
│   └── raw/                # Original downloads (gitignored)
├── .replit, replit.md      # Replit run workflow and notes
├── vite.config.ts          # Allows Replit's preview proxy; proxies /api in development
├── server/                 # Node server: built app + RunPod skill search (Job B)
├── skills/                 # Project-specific Codex UX skill
└── API_PLAN.md             # Proposed sources and validation steps
```

**Current stack:** React, TypeScript and Vite on Replit, with a Node backend for skill search. RunPod is a required part of the build: a GPU Pod embedded the ESCO skill taxonomy with `BAAI/bge-m3`, and a Serverless endpoint serves query embeddings ([RUNPOD_SETUP.md](RUNPOD_SETUP.md)).

## Current Status and Next Work

- **Working:** fictional individual and team views; ESCO skill intake; RunPod skill search; nine-role ranking with DOSM Q1/Q2 and gradual/fast switches; visible gaps and reasons; learning plans from 21 checked course records; NOSS/SKM routes; role and skill SDG explanations; optional interests and SDG ranking switches; English, Bahasa Malaysia and Chinese interface text.
- **Data pending:** the GDELT news snapshot is empty, so Workplace news shows an honest no-news state. The public Skills in demand page and a skill-level Future Skills Radar are not implemented. AI-matched Coursera catalogue suggestions are being prepared and require a spot-check before display.
- **Review pending:** team review of SDG mappings and Malay/Chinese translations; DOSM reuse terms; complete live, mobile, accessibility and link checks; Replit and RunPod evidence for the Technical & Tools Declaration.
- **Submission pending:** PRD in the official template, pitch slides, declaration, 5–7 minute video, public repository and judge access. Follow [CHECKLIST.md](CHECKLIST.md) for verified status and [PROGRESS_LOG.md](PROGRESS_LOG.md) for recent decisions.

## Running Locally

Use Node.js 20 or newer. From this repository:

```bash
npm ci
npm start
npm test       # scoring, pathway, interests, SDG, team, i18n and search checks
npm run build  # type-check and build dist/
npm run serve  # Node server on :5000, serving dist/ and /api/skill-search
```

For Vite development, run `npm start` and open [http://127.0.0.1:5173/](http://127.0.0.1:5173/). For the production-style server, run `npm run build` followed by `npm run serve` and open [http://127.0.0.1:5000/](http://127.0.0.1:5000/). Live skill search needs `RUNPOD_API_KEY` and `RUNPOD_ENDPOINT_ID` in the server environment; without them, visitors can still pick ESCO skills from the list. The demo keeps skills in the browser tab and does not offer accounts or résumé upload. NOSS/SKM entries show possible certification routes, not verified job requirements.

**On Replit:** the project is imported from branch `dev`; press **Pull** in Replit's Git tool, then **Run** (port 5000, see `replit.md`). Do not commit lockfile changes that point to Replit's internal package mirror.

**Rebuilding the data** (raw files go in `data/raw/`, which is gitignored; download links are in each JSON's `source` block):

```bash
pip install openpyxl                       # DOSM importer
brew install poppler                       # pdftotext, for the ILO importer (macOS)
python3 scripts/import_dosm_jmi.py data/raw/Data_JMI_Q2_2026.xlsx 2026-08-18 <download date>
python3 scripts/import_ilo_exposure.py "data/raw/Generative AI and Jobs: A Refined Global Index of Occupational Exposure.pdf" <download date>
python3 scripts/build_roles.py "data/raw/ESCO dataset - v1.2.1 - classification - en - csv"
python3 scripts/build_transferable_skills.py   # needs numpy; uses data/derived/esco/
python3 scripts/import_lfs_month.py            # OpenDOSM monthly labour force (internet; standard library)
python3 scripts/import_gdelt_news.py           # GDELT Malaysian workplace headlines (internet; standard library)
```

The ESCO embedding runs on a RunPod GPU Pod; see [RUNPOD_SETUP.md](RUNPOD_SETUP.md#part-2-project-gpu-work-required).

## UI design workflow

[DESIGN.md](DESIGN.md) records visual consistency rules; [UI_UX.md](UI_UX.md) records screen and usability decisions. The optional [Impeccable](https://impeccable.style/docs/) skill can be installed locally for Codex from this repository:

```bash
npx impeccable install -y --providers=codex --scope=project
```

The generated `.agents/skills/impeccable/` skill and `.codex/hooks.json` are local tooling, ignored by Git so design-tool downloads do not become a large project commit. Re-run the command on a new checkout before using the skill. Review its suggestions against Domain 1, the current product scope, and the source rules before editing the website.

## Hackathon Submission Requirements

The **Domain 1: Aiversecity Future-Ready Workforce** brief requires a final product with all six features listed above. For the preliminary round, the proposal must explain how each will be delivered, and the demonstration must show a rough, working version of the most important feature. The trend signal layer feeding role matching is the suggested focus.

The **Participant Handbook** specifies six preliminary deliverables, due **25 October 2026 at 7:59:59 AM MYT (UTC+8)** through [sdchack.my](https://sdchack.my/):

1. Product Requirement Documentation using the official submission template, covering the problem, target users, scope, features and SDG alignment.
2. Pitch deck slides covering the problem, solution, technical approach and expected impact.
3. A working prototype link or accessible build with a functional interface. A video or static mockup alone does not satisfy this requirement.
4. Technical & Tools Declaration listing major APIs, cloud services, AI tools, datasets, models, sponsor resources and pre-existing materials.
5. An accessible GitHub repository and source-code link with a genuine, traceable development history.
6. A 5–7 minute pitching video with a prototype demonstration, submitted as a YouTube link.

The handbook also requires the submitted repository to be **public**, to contain an **Apache License 2.0 `LICENSE` file**, and to be accessible to judges. It says to keep the repository private during development and add the committee's designated GitHub account(s) as collaborators before submission. Check the official Discord for any later operational changes before changing repository visibility or sharing access.

**Required tools:** The Participant Handbook requires use of Replit and proof of that use in the Technical & Tools Declaration. Any work that needs a GPU must use RunPod; teams that use RunPod must include the specified dashboard screenshot or serverless endpoint evidence. Other tools remain available, subject to the declaration rules.

**Development record:** Build the project during the official competition period, commit actual progress as it happens, declare reused materials, and do not modify the submitted repository after the deadline unless the organisers instruct otherwise. Keep API keys, passwords and personal data out of the repository.

The preliminary rubric weights are **Innovation & Creativity (30%)**, **Problem–Solution Fit (25%)**, **Feasibility of Build (25%)**, and **Clarity of Proposal (20%)**. The final-round rubric is separate and will be shared with finalists.

## Scope

**In scope:** Career profiling, trend intelligence, matching, reskilling recommendations, SDG mapping and scenario comparison.

**Out of scope for this challenge:** Building full course content, payment systems and real recruitment integrations.

## Team

Team members and responsibilities: **TBD**.

## License

Licensed under the [Apache License, Version 2.0](LICENSE), as required by the Participant Handbook for the submitted repository. The project team retains ownership of its original work; third-party components retain their own licenses and must be attributed as applicable.

## Acknowledgements

**This publication uses the ESCO classification of the European Commission.** `data/roles.json` is an adapted selection of ESCO v1.2.1; the Commission does not guarantee ESCO's accuracy or completeness.

Data sources: Department of Statistics Malaysia (DOSM), *Big Data Analytics: Job Market Insights*, Q1 and Q2 2026; International Labour Organization, Working Paper 140, *Generative AI and Jobs: A Refined Global Index of Occupational Exposure* (2025); European Commission, ESCO v1.2.1. Model: `BAAI/bge-m3` (open weights), run on RunPod.


Built for the **Aiversecity Future-Ready Workforce Domain (Domain 1)** hackathon challenge. Requirements and judging criteria are adapted from the event's *Domain 1 — Problem Statement & Marking Rubric* document.

---

<div align="center">

**TomorrowWorks — Discover what comes next. Build the skills to get there.**

</div>
