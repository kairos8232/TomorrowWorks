# TomorrowWorks

> From your CV to a career path for the AI era: a web app that shows a fresh graduate which skills a job ad asks for, whether their CV shows them, and what to learn next, using dated public labour-market and AI-exposure data.

---

## Team Information

| Field                  | Details                                     |
| ---------------------- | ------------------------------------------- |
| **Team Name**          | NoMoreTokens |
| **Team Domain**        | Domain 1: Aiversecity Future-Ready Workforce |
| **SDG Track (1–17)**   | SDG 4 (Quality Education, target 4.4) and SDG 8 (Decent Work and Economic Growth, targets 8.2 and 8.5) |
| **Team Leader**        | Lee Yun Loong |
| **University**         | Multimedia University (MMU) |
| **Number of Members**  | TO FILL |

## Links

| Resource          | Link                                           |
| ----------------- | ---------------------------------------------- |
| GitHub Repository | https://github.com/kairos8232/TomorrowWorks |
| Live Demo         | https://tomorrow-works.replit.app |
| RunPod Endpoint   | https://api.runpod.ai/v2/j6ssjfy9z074hp |
| Slide Deck        | TO FILL (PDF in [`submission/`](submission/)) |
| Demo Video        | TO FILL (YouTube) |

---

## Overview

### Problem

AI is changing tasks faster than career advice keeps up. In Malaysia, DOSM counted 555,509 online job offers in Q2 2026, and the ILO rates 112 of 427 occupations as exposed to generative AI. A fresh graduate holding a job ad cannot easily tell which skills it asks for, whether their CV shows them, or which role to aim for and what to learn first.

### Solution

TomorrowWorks turns a CV and a job ad into a clear gap list and a learning plan. An open embedding model (`BAAI/bge-m3` on RunPod) only maps text onto real ESCO skills, and the person confirms every skill. Roles are then ranked by a visible rule (skill fit, DOSM demand trend, ILO AI exposure), so changing the trend data visibly changes the result. AI never generates roles, courses or scores.

### Key Features

- **Your CV → a job ad → your plan** — paste a CV, paste an ad, see which of the ad's skills the CV shows, which are held but not shown, and which are still to learn, then get ordered, checked courses and a Malaysian NOSS/SKM route where one exists.
- **Check my CV** — plain, source-cited CV checks that need no job ad and run in the browser; nothing is stored.
- **Trend data feeds the ranking** — nine ESCO roles scored with visible skill fit, DOSM demand and ILO AI resilience; switch the DOSM quarter or the AI speed and the ranking changes; 1,000 seeded simulated futures show how stable the top choice is.
- **An updatable source** — DOSM Job Market Insights is quarterly; the server checks once a day for a newer quarter and one import command updates every score.
- **Team and Region views** — fictional groups for HR, career centres and regional skills centres, with SDG contribution shown in totals and no names.
- **Fairness and honesty** — a published fairness audit of the text intake, team-reviewed SDG links, and every signal shown with source, date and geography.

### Tech Stack

| Layer         | Technology                   |
| ------------- | ---------------------------- |
| Frontend      | React 19, TypeScript, Vite 6 |
| Backend       | Node 20 server with no dependencies (`server/index.mjs`) |
| Database      | None: nothing about a person is stored; public data ships as JSON files |
| AI / Compute  | RunPod: GPU Pod (Job A) and Serverless (Job B), `BAAI/bge-m3` |
| Hosting / Dev | Replit (Autoscale deployment) |

---

## Project Structure

```
.
├── data/                    # Dated source snapshots, derived data, SDG review
├── docs/                    # Product, scoring, screens and progress notes
├── runpod/                  # RunPod Job A script (embeds ESCO skills on a GPU Pod)
├── scripts/                 # Importers and audits (DOSM, ILO, ESCO, SDG, fairness)
├── server/                  # Node server: static site and API routes (+ tests)
├── src/                     # React app, scoring rule, CV checks, futures simulator (+ tests)
├── submission/              # Required submission documents (PDFs)
├── .env.example             # Environment variables to set
├── .replit                  # Replit run configuration
├── LICENSE                  # Apache 2.0
└── package.json
```

### Architecture

```
Browser (React) ──► Replit (Node server) ──► RunPod Serverless (bge-m3, Job B)
      │                    │
      │                    └──► ranks the ESCO skill vectors that Job A embedded once on a RunPod GPU Pod
      └──► scoring, CV checks and plan run in the browser on committed data snapshots
```

---

## How to Run

### Option 1: Run on Replit (recommended)

1. Open the Replit project, or import this repository with **Create Repl → Import from GitHub**.
2. Open the **Secrets** tab and add the variables listed in `.env.example`: `RUNPOD_API_KEY` and `RUNPOD_ENDPOINT_ID`.
3. Click **Run**. The app works without the keys, but the CV and skill search then falls back to a searchable list.

### Option 2: Run locally

```bash
git clone https://github.com/kairos8232/TomorrowWorks.git
cd TomorrowWorks
npm install
cp .env.example .env          # fill in your values (optional)
npm start                     # http://127.0.0.1:5173
# production build and server: npm run build && npm run serve   (port 5000)
```

### Run Tests

```bash
npm test
```

---

## How We Use Replit *(Required)*

- **Development and hosting:** the app is developed in Replit and published with Replit Deployments (Autoscale) at the Live Demo link above.
- **Secrets:** the RunPod API key and endpoint ID are stored in Replit Secrets and read by the server only. They are never in the code.
- **Why Autoscale:** the server holds the API key, so static hosting would not work.

📄 Proof of use: [`submission/SDC2026_NoMoreTokens_Replit_POU.pdf`](submission/SDC2026_NoMoreTokens_Replit_POU.pdf)

## How We Use RunPod *(Required)*

- **Job A (GPU Pod, run once):** `runpod/embed_esco_skills.py` embedded 13,960 ESCO v1.2.1 skills with `BAAI/bge-m3` on an NVIDIA RTX A5000 in 92.5 seconds. The vectors are saved in `data/derived/esco/`.
- **Job B (Serverless endpoint, live):** the Replit server sends a person's text to the endpoint, gets a query vector back, and ranks the closest real ESCO skills. The person then confirms which are true.
- **Integration:** the server reads `RUNPOD_API_KEY` and `RUNPOD_ENDPOINT_ID` from the environment.

Example request (an OpenAI-compatible embeddings route; use your own key and endpoint):

```bash
curl -X POST https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/openai/v1/embeddings \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "BAAI/bge-m3", "input": ["maintain financial records"]}'
```

📄 Proof of use: [`submission/SDC2026_NoMoreTokens_Runpod_POU.pdf`](submission/SDC2026_NoMoreTokens_Runpod_POU.pdf)

---

## Challenges & Learnings

- **Public data is coarse:** DOSM gives demand by occupation group only, so roles in one group share a demand signal. We use quarter-on-quarter change and say so on screen.
- **AI needs checking:** AI matching alone proposed 73 SDG links and our two reviewers judged 21 relevant, so only team-reviewed links are used.
- **Bias in text matching:** our audit found ethnicity words pulled in language skills (63 suggestions across 12 descriptions, against 0 for neutral phrases). We strip common identity phrases first; this is reduced, not solved.
- **Cold starts:** the first RunPod search can be slow; a searchable list is the fallback.

## Future Improvements

- [ ] More roles that graduates apply for
- [ ] A finer Malaysian demand source and a quarterly DOSM import that a person approves
- [ ] Compare several job ads at once
- [ ] Interviews with real graduates, career centres and HR teams
- [ ] More hand-checked courses and reviewed Malay and Chinese skill names
- [ ] Optional accounts, with consent, to link a plan to a career centre or employer's Team view

## Team

| Name        | Role                | GitHub                                   |
| ----------- | ------------------- | ---------------------------------------- |
| Lee Yun Loong | Team Leader | [@kairos8232](https://github.com/kairos8232) |
| TO FILL | TO FILL | TO FILL |

---

## Submission Checklist

- [x] Team name, domain (Domain 1) and SDG track filled in
- [ ] Slide deck link added
- [ ] Demo video link added
- [ ] Replit used, with proof of use in `submission/`
- [ ] RunPod used, with proof of use in `submission/`
- [ ] Preliminary submission completed (`SDC2026_NoMoreTokens_Preliminary.pdf`)
- [ ] Technology declaration completed (`SDC2026_NoMoreTokens_TechDeclaration.pdf`)
- [ ] Submission files renamed with the team name
- [ ] "How to Run" steps verified
- [x] No API keys or secrets committed to the repository (scanned 24 Oct 2026)

This service uses the ESCO classification of the European Commission.

## License

This project is licensed under the [Apache License 2.0](LICENSE).

---

## Detailed Project Notes

### How people use the app

A **fresh graduate** follows three steps: *Your CV* (paste or upload a CV; it is read in the browser, contact details are removed, and the app suggests ESCO skills for the person to tick), *A job ad* (paste an ad; its skills are sorted into on the CV, held but not shown, and still to build), and *Your plan* (ordered, checked courses and a Malaysian NOSS/SKM route where one exists). **Check my CV** works on its own, with no job ad. **Your moves** ranks nine ESCO roles with visible skill-fit, demand and AI-resilience parts, so a graduate can try another role. **Job market** holds the public tables (DOSM job ads, ILO AI exposure, AI impact by role, Signal sources).

Someone **already working** picks their skills and a current role, then follows the same ranking and plan. **Team view** (HR and career centres) and **Region view** (a regional skills centre) use fictional groups only; the Region view shows SDG contribution in totals with no names. The interface supports English, Bahasa Malaysia and Chinese; ESCO names and provider course titles stay in English. There are no accounts and nothing is saved. Screen-by-screen behaviour is in [docs/SCREENS.md](docs/SCREENS.md).

### Required features

| Feature | Working in the prototype |
| --- | --- |
| Skills profile intake | Paste or upload a CV, or pick skills by a RunPod-assisted ESCO search or a searchable list; fictional profiles can be loaded |
| AI-trend signal layer | Dated DOSM Q1 and Q2 2026 job-ad snapshots and ILO occupation exposure feed the role score; a daily check shows whether DOSM has published a newer quarter |
| Future-role matching | Nine ESCO roles ranked with visible skill fit, demand and AI-resilience parts; exact, transferable and missing skills shown |
| Personalised reskilling | Selected move produces ordered steps from hand-checked course records with provider-stated times, uncovered gaps and a sourced NOSS/SKM route where found |
| SDG mapping | Skill and role links come from the team's blind review of two reviewers; chosen goals show in moves, plans and the Team and Region views |
| Handling uncertainty | DOSM quarter and AI-speed switches show score and rank changes; 1,000 seeded simulated futures show how stable the top move is |

**What makes it different:** public market evidence → demand and AI exposure → personal fit → skill gap → learning plan, with proof on screen that **changing the trend data changes the result**.

### Data sources (all public, dated, attributed)

| Signal | Source | In the repo |
| --- | --- | --- |
| Demand now (the updatable source) | DOSM *Big Data Analytics: Job Market Insights*, quarterly online job offers by occupation major group (Q2 2026 total: 555,509) | `data/sources/dosm-jmi-2026-q1.json`, `-q2.json` (`scripts/import_dosm_jmi.py`; `scripts/check_dosm_jmi.py` and `server/dosm.mjs` check for a new quarter) |
| AI exposure | ILO Working Paper 140, *Generative AI and Jobs: A Refined Global Index of Occupational Exposure* (2025), Table A1: 427 occupations, 112 exposed | `data/sources/ilo-genai-exposure-2025.json` (`scripts/import_ilo_exposure.py`) |
| Other AI-impact views | Microsoft *Working with AI* applicability; Anthropic Economic Index (shown beside ILO, not in the score) | `data/sources/ms-ai-applicability.json`, `anthropic-economic-index.json` |
| Roles and skills | ESCO v1.2.1 (European Commission), nine adapted occupations | `data/roles.json` (`scripts/build_roles.py`) |
| Skill search index | ESCO skills embedded with `BAAI/bge-m3` on a RunPod GPU: 13,960 skills in 92.5 s on an NVIDIA RTX A5000 | `data/derived/esco/` (`runpod/embed_esco_skills.py`) |
| Labour and news context | OpenDOSM monthly labour force survey; GDELT headline metadata. Shown separately, never in a score | `data/sources/opendosm-lfs-month.json`, `gdelt-news.json` |
| SDG targets | UN SDG target list (UNSD SDG API), reviewed by the team | `data/sources/un-sdg-targets.json`, `data/sdg/` |

Every number on screen carries its source, date and geography. The *Signal sources* page lists them with dates read from the files.

**Known limits:** DOSM gives vacancies by occupation major group only, so roles in one group share a demand signal, and only quarter-on-quarter change is used. ILO exposure means tasks *could* change, not that jobs disappear. Scores are estimates from stated weights, not forecasts of job loss.

### Scoring

The default score is `wF·F + wD·D + wR·R`, with every part shown on screen:

- **F, skill fit:** `(exact + 0.5 × transferable) / essential skills`. *Transferable* means the person holds a different ESCO skill whose embedding is at least 0.85 similar; the pair is shown.
- **D, demand trend:** `clamp(0.5 + quarter-on-quarter change, 0, 1)` for the role's DOSM major group.
- **R, AI resilience:** `1 − ILO mean exposure`.

| Scenario | wF | wD | wR |
| --- | --- | --- | --- |
| Gradually (moderate AI change) | 0.60 | 0.25 | 0.15 |
| Quickly (fast AI change) | 0.50 | 0.20 | 0.30 |

Two optional, off-by-default switches can add work-interest fit and chosen-SDG fit. The full rule, data shapes and worked example are in [docs/SIGNALS_AND_MATCHING.md](docs/SIGNALS_AND_MATCHING.md).

**Proof that trends matter** (measured on the live app, 24 Oct 2026, with the fictional graduate's skills): switching the DOSM quarter from Q2 to Q1 moves Accountant from 3rd to 2nd and Financial analyst from 5th to 3rd; switching the AI speed from Gradually to Quickly moves Sustainability manager from 6th to 2nd. The best-move shares from the 1,000 simulated futures stay the same, because those futures already cover every AI speed and both quarters. The DOSM data itself changes between quarters: for example Professionals −9.5% and Clerical support −17.2% from Q1 to Q2 2026.

### Where AI is used: RunPod

RunPod is a required part of the build ([docs/RUNPOD_SETUP.md](docs/RUNPOD_SETUP.md)). One open-weights multilingual model, `BAAI/bge-m3`, is used only to match text to existing records:

1. **Job A (GPU Pod, run once):** embedded every ESCO skill (RTX A5000, 92.5 s).
2. **Job B (Serverless endpoint, live):** embeds the person's CV lines, job-ad lines or own description (English, Bahasa Malaysia or Chinese); the server returns the nearest real ESCO skills and the person confirms which are true. It also picks key news headlines and matches Coursera courses and SDG targets to skills offline.

The model never creates roles, courses, statistics or scores. If the endpoint is unavailable, the person picks skills from a searchable list. A published fairness audit of the text intake is in [data/derived/fairness-audit.md](data/derived/fairness-audit.md).

### Data, evidence and AI guardrails

- **Public, open or synthetic data only;** no real CVs or personal records anywhere.
- **Every signal shows** name, date, geography and link; scoring rules and limits are documented.
- **No invented data:** job titles, courses, statistics and SDG links are checked or reviewed, never generated.
- **AI forecasts** are shown as scenarios and estimates, and human career decisions stay with the person; the app does not automate hiring decisions.
- **Disclosure:** `BAAI/bge-m3` and its retrieval-only purpose, and the AI development tools used, are declared in the Technical & Tools Declaration.

### Repository map

```text
├── src/            # React app: screens, scoring, CV checks, learning plan, futures simulator (+ tests)
├── server/         # Node server: static site and API routes (skills, news, labour force, DOSM check) (+ tests)
├── data/           # Source snapshots, ESCO roles and vectors, courses, SDG review, fairness audit
├── scripts/        # Importers, RunPod matchers, SDG review kit, fairness audit
├── runpod/         # Job A: embed ESCO skills on a GPU Pod
├── docs/           # Product scope, screens, scoring rules, checklist and progress log
├── submission/     # Required submission PDFs
├── skills/         # Project UX notes for coding agents
├── CLAUDE.md       # Context and rules for coding agents
└── replit.md       # Replit run and publish notes
```

### Running locally and rebuilding data

Use Node.js 20 or newer: `npm ci`, then `npm start` (development, port 5173), `npm test`, `npm run build`, and `npm run serve` (production server on port 5000). Live skill search needs `RUNPOD_API_KEY` and `RUNPOD_ENDPOINT_ID` in the server environment; without them the person picks skills from the list. On Replit, press **Pull** and then **Run**; do not commit lockfile changes that point to Replit's internal package mirror.

Raw source files go in `data/raw/` (gitignored); each snapshot's `source` block has the download link. Importer commands are listed at the top of each script, for example `python3 scripts/import_dosm_jmi.py <xlsx> <release date> <download date>`.

### Hackathon deliverables

The preliminary round (due **25 October 2026, 7:59:59 AM MYT** via sdchack.my) asks for the product requirement document, pitch slides, a working prototype link, the Technical & Tools Declaration, this public repository with an Apache 2.0 `LICENSE`, and a 5–7 minute YouTube video. The documents are in [`submission/`](submission/). No API keys, passwords or personal data are in the repository.

## Acknowledgements

**This publication uses the ESCO classification of the European Commission.** `data/roles.json` is an adapted selection of ESCO v1.2.1; the Commission does not guarantee ESCO's accuracy or completeness.

Data source: Department of Statistics Malaysia (DOSM), *Big Data Analytics: Job Market Insights*, Q1 and Q2 2026; International Labour Organization, Working Paper 140, *Generative AI and Jobs: A Refined Global Index of Occupational Exposure* (2025); European Commission, ESCO v1.2.1. Model: `BAAI/bge-m3` (open weights), run on RunPod.

Built for the **Aiversecity Future-Ready Workforce Domain (Domain 1)** at SDC Hackathon 2026.
