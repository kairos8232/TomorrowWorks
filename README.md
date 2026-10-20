<div align="center">

# 🌅 TomorrowWorks

### Navigate the future of work, one skill at a time.

**A public, evidence-driven guide to changing work and skills, with optional personal career guidance.**

![Status](https://img.shields.io/badge/status-data%20layer%20built-blue)
![Domain](https://img.shields.io/badge/domain-Aiversecity%20Future--Ready%20Workforce-green)
![SDGs](https://img.shields.io/badge/impact-UN%20SDGs-orange)

</div>

## Overview

AI and other industry changes affect people across ages, occupations, and career stages. **TomorrowWorks** aims to help anyone explore what is happening at work, which skills and roles have supported demand signals, and what might change. The first source coverage is Malaysia-first; visitors can browse without an account.

Instead of offering generic chatbot career advice, TomorrowWorks is designed to connect **dated, identifiable labour-market and AI-trend signals** to **explainable role recommendations**, **personalised skills-gap analysis**, and **actionable reskilling pathways**. Recommendations also explain their relationship to the **17 United Nations Sustainable Development Goals (SDGs)**.

> **Project stage (21 Oct 2026):** The app (React, TypeScript, Vite) runs on Replit with public browsing, honest no-source states, synthetic profile intake, and a skill-gap preview. The **data layer is built from real sources**: DOSM job-vacancy snapshots (Q1 and Q2 2026), ILO GenAI exposure scores, a nine-role set from ESCO, and ESCO skill embeddings computed on a RunPod GPU. Next: the scoring module, then sourced role matches, the snapshot and scenario switches, RunPod skill search, pathway and SDG links. Day-by-day plan: [BUILD_STAGES.md](BUILD_STAGES.md#next-selection-updated-21-oct-2026); log: [PROGRESS_LOG.md](PROGRESS_LOG.md).

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
flowchart TD
    A[Explore market] --- B[Demand now]
    A --- C[Skills needed now]
    A --- D[Future outlook]
    A --- J[Workplace changes and issues]
    B --- C
    C --- D
    A --> E[My career action]
    E --> F[Demo entry or future sign-in]
    F --> G[My profile]
    G --> K[My skill gaps for a chosen target]
    K --> H[Role matches]
    H --> I[My pathway]
```

The public area has independent Explore, Workplace changes, Demand, Skills, and Outlook views, plus industry and search controls. Visitors can move among them freely and see the distinction between reported issues, present-day measures, and future estimates. **My career** is a separate action for personal guidance: review the person's skills and qualifications, compare them with an explicit promotion or career-move target, then explore role matches and a pathway as those Domain 1 features are built. The first demo uses a fictional profile and labels sign-in as planned; résumé upload is a later optional method. [PERSONAL_GUIDANCE.md](PERSONAL_GUIDANCE.md) defines the personal flow and evidence boundary.

## Required Features

| Feature | Planned implementation | Acceptance check |
| --- | --- | --- |
| Skills profile intake | Form/questionnaire for skills, experience, interests, optional qualifications, and work preferences after the sign-in entry | Sample user can review a fictional profile; real sign-in and résumé upload remain planned |
| AI-trend signal layer | Ingest at least one updateable public AI/job-market data source | Display source and date; updated data can change output |
| Future-role matching | Rank sourced roles using documented scoring logic; let a person inspect the gap for a chosen promotion or career move | Each role has an explainable skills gap and any certificate requirement is verified or marked unknown |
| Personalised reskilling | Generate an ordered, time-estimated learning pathway | Link to verifiable free/low-cost resources |
| SDG mapping | Connect each recommended role and skill to at least one SDG | Explain why the SDG connection matters |
| Handling uncertainty | Compare at least two future scenarios | Clearly label forecasts as estimates, not certainties |

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

`score = wF·F + wD·D + wR·R`, every part shown on screen:

- **F, skill fit:** share of the role's ESCO essential skills the person has confirmed.
- **D, demand trend:** `clamp(0.5 + quarter-on-quarter change, 0, 1)` for the role's DOSM major group.
- **R, AI resilience:** `1 − ILO mean exposure`.

| Scenario (estimate) | wF | wD | wR |
| --- | --- | --- | --- |
| Moderate AI change | 0.60 | 0.25 | 0.15 |
| Fast AI change | 0.50 | 0.20 | 0.30 |

**Proof that trends matter:** a *Data snapshot* switch (DOSM Q1 ↔ Q2 2026) changes D for the same profile. Real example: Professionals +15.8% → −9.5% (D 0.66 → 0.41); Clerical support −1.8% → −17.2% (D 0.48 → 0.33). A future DOSM release is added by running the importer on the new file, with no code change.

### Where AI is used: RunPod

RunPod is a required part of the build ([RUNPOD_SETUP.md](RUNPOD_SETUP.md)). One open-weights multilingual model, `BAAI/bge-m3`:

1. **Job A (GPU Pod, done):** embedded every ESCO skill once (Pod `40jrr8aulh76tb`, RTX A5000, 92.5 s).
2. **Job B (Serverless, next):** embeds the person's own description (English, Bahasa Malaysia or Chinese); the app returns the nearest real ESCO skills and the person confirms which are true.

The model only retrieves existing ESCO records. It never creates roles, courses, statistics or scores. If the endpoint is unavailable, the person picks skills from a searchable list.

## Example Demo (Synthetic Profile)

**Sample profile (fictional):** accounting assistant; confirms ESCO skills such as *accounting entries*, *maintain financial records*, *use accounting systems*, *issue sales invoices*; interested in analytics.

**How a match is explained:** for *data analyst*, the app lists which of its 36 ESCO essential skills the profile already holds and which are missing (for example *query languages*, *data visualisation software*, *perform data cleansing*), shows D from the DOSM Professionals group and R from ILO code 2511, and shows the scenario weights. A pathway then orders the missing skills.

> The profile is **synthetic**. No score, percentage or course is shown unless it is calculated from the sources above or verified; the README gives no example scores on purpose.

## Data, Evidence and AI Guardrails

Candidate news, vacancy, official-statistics, and skills sources are documented in [API_PLAN.md](API_PLAN.md). These sources must pass the Stage 1 access and suitability checks before the app presents their data.

- Use **public, open or synthetic data only**; no real CVs or personal records in demos.
- Show the **name, date and link/reference** for each underlying trend source.
- Document the scoring methodology, assumptions and limitations.
- Verify job titles, courses, and statistics rather than allowing a language model to invent them.
- Disclose any language model actually used, including its purpose; **model selection is TBD**.
- Present AI forecasts as scenarios/estimates, not guaranteed outcomes.
- Support human career decisions; do not automate final hiring decisions.
- Avoid making recommendations based on protected or irrelevant personal attributes.
- Disclose development assistance from AI tools, including Codex, in the required Technical & Tools Declaration. The team must review and be able to explain all submitted work.

## Current App Structure

```text
TomorrowWorks/
├── index.html              # Browser entry point
├── src/
│   ├── main.tsx            # Public and personal navigation and app shell
│   ├── market.ts           # Industry and sourced-evidence contract
│   ├── personal.ts         # Illustrative target and exact skill comparison
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
│   └── build_roles.py          # ESCO CSV → data/roles.json
├── data/
│   ├── sources/            # Converted, attributed source snapshots (DOSM, ILO)
│   ├── roles.json          # Nine ESCO roles with skills (adapted ESCO selection)
│   ├── derived/esco/       # ESCO skill vectors from the RunPod GPU run
│   └── raw/                # Original downloads (gitignored)
├── .replit, replit.md      # Replit run workflow and notes
├── vite.config.ts          # Allows Replit's preview proxy
├── skills/                 # Project-specific Codex UX skill
└── API_PLAN.md             # Proposed sources and validation steps
```

**Current stack:** React, TypeScript and Vite. **RunPod is a required part of the build:** a GPU Pod embeds the ESCO skill taxonomy with `BAAI/bge-m3` and a Serverless endpoint serves skill search ([RUNPOD_SETUP.md](RUNPOD_SETUP.md)). Replit hosts the app.

## MVP Priorities

- [x] Create a synthetic sample profile and a working intake form
- [x] Open on a public market view with an honest demo sign-in entry
- [x] Replace the numbered journey with freely browsable market destinations
- [x] Add public industry and search controls and a workplace-changes view
- [x] Add an illustrative personal skill-gap comparison for a chosen target
- [x] Import DOSM (Q1, Q2 2026) and ILO exposure data with source metadata
- [x] Build a nine-role set with skills from ESCO v1.2.1
- [x] Embed ESCO skills on a RunPod GPU (Job A)
- [ ] Connect one updateable trend source and display its date/citation *(DOSM imported with dates; display pending)*
- [ ] Serve skill search from a RunPod Serverless endpoint (Job B)
- [ ] Build a transparent skill-to-role matching function
- [ ] Show ranked roles and missing skills
- [ ] Demonstrate that updated trend data affects matching
- [ ] Generate a time-estimated learning pathway with verified resources
- [ ] Explain SDG links for each suggested role and skill
- [ ] Show moderate and rapid AI-change scenarios
- [ ] Prepare a reproducible live demo and document known limitations

## Running Locally

Use Node.js 20 or newer. From this repository:

```bash
npm install
npm start
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) after the server starts. `npm run dev` works too. To check a production build, run `npm run build`. The app accepts a synthetic profile and compares its listed skills with an editable illustrative target. It does not yet make sourced career recommendations or verify certificate requirements.

**On Replit:** the project is imported from branch `dev`; press **Pull** in Replit's Git tool, then **Run** (port 5000, see `replit.md`). Do not commit lockfile changes that point to Replit's internal package mirror.

**Rebuilding the data** (raw files go in `data/raw/`, which is gitignored; download links are in each JSON's `source` block):

```bash
pip install openpyxl                       # DOSM importer
brew install poppler                       # pdftotext, for the ILO importer (macOS)
python3 scripts/import_dosm_jmi.py data/raw/Data_JMI_Q2_2026.xlsx 2026-08-18 <download date>
python3 scripts/import_ilo_exposure.py "data/raw/Generative AI and Jobs: A Refined Global Index of Occupational Exposure.pdf" <download date>
python3 scripts/build_roles.py "data/raw/ESCO dataset - v1.2.1 - classification - en - csv"
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
