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
| **Number of Members**  | 5 |

## Links

| Resource          | Link                                           |
| ----------------- | ---------------------------------------------- |
| GitHub Repository | https://github.com/kairos8232/TomorrowWorks |
| Live Demo         | https://tomorrow-works.replit.app |
| RunPod Endpoint   | https://api.runpod.ai/v2/j6ssjfy9z074hp |
| Slide Deck        | [`submission/SDC2026_NoMoreTokens_PitchDeck.pdf`](submission/SDC2026_NoMoreTokens_PitchDeck.pdf) |
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
- **Three languages, no accounts** — English, Bahasa Malaysia and Chinese screens; nothing is saved about a person.
- **Fairness and honesty** — a published fairness audit of the text intake, team-reviewed SDG links, and every signal shown with source, date and geography.

### Data Sources

All public, dated and attributed. Every number on screen shows its source, date and geography, and the *Signal sources* page lists them with dates read from the files.

| Signal | Source | Used for |
| --- | --- | --- |
| Demand now (the updatable source) | DOSM *Big Data Analytics: Job Market Insights*, Q1 and Q2 2026, online job offers by occupation major group | Demand part of the score |
| AI exposure | ILO Working Paper 140 (2025), Table A1: 427 occupations, 112 exposed | AI-resilience part of the score |
| Other AI-impact views | Microsoft *Working with AI*; Anthropic Economic Index | Shown beside ILO, not in the score |
| Roles and skills | ESCO v1.2.1 (European Commission), nine adapted occupations | Roles, skills, skill matching |
| Labour and news context | OpenDOSM labour force survey; GDELT headlines | Context only, never in a score |
| SDG targets | UN SDG target list, links reviewed by two team reviewers | SDG tags and the plan |

**Known limits:** DOSM gives job ads by occupation major group only, so roles in one group share a demand signal, and only quarter-on-quarter change is used. ILO exposure means tasks *could* change, not that jobs disappear. Scores are estimates from stated weights, not forecasts of job loss.

### How the Ranking Works

`score = wF·F + wD·D + wR·R`, with each part shown on screen:

- **F, skill fit:** the person's skills against the role's essential ESCO skills (a related skill counts half).
- **D, demand trend:** DOSM quarter-on-quarter change for the role's occupation group.
- **R, AI resilience:** `1 − ILO mean exposure`.

| AI speed | wF | wD | wR |
| --- | --- | --- | --- |
| Gradually | 0.60 | 0.25 | 0.15 |
| Quickly | 0.50 | 0.20 | 0.30 |

Two optional switches (work interests, chosen SDG goals) are off by default. Full rule and worked example: [docs/SIGNALS_AND_MATCHING.md](docs/SIGNALS_AND_MATCHING.md).

**Proof that trend data changes the result** (measured on the live app, 24 Oct 2026, fictional graduate with 20 skills): switching the DOSM quarter from Q2 to Q1 moves Accountant from 3rd to 2nd and Financial analyst from 5th to 3rd; with Q1 data, switching the AI speed from Gradually to Quickly puts Sustainability manager in 2nd place. The DOSM data itself changes between quarters, for example Professionals −9.5% and Clerical support −17.2% from Q1 to Q2 2026.

### Responsible AI

- **No invented data:** roles, courses, statistics and SDG links are checked or reviewed, never generated. No real CVs or personal records anywhere.
- **AI only maps text onto known lists:** `BAAI/bge-m3` matches words to existing ESCO skills and the person confirms every skill. It never creates roles, courses or scores.
- **Fairness audit and SDG review are published:** [data/derived/fairness-audit.md](data/derived/fairness-audit.md), [data/sdg/review/results.md](data/sdg/review/results.md).
- **Decisions stay with the person:** estimates are shown as scenarios; the app does not automate hiring decisions.

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

Every file in this branch and what it is for. Planning notes (build stages, checklist, UI notes) stay on the `dev` branch.

```
.
├── data/
│   ├── derived/
│   │   ├── esco/
│   │   │   ├── esco-skill-index.json            # ESCO skill order for vectors
│   │   │   ├── esco-skill-vectors.f16.npy       # bge-m3 vectors, 13,960 skills
│   │   │   └── run-info.json                    # Job A run details
│   │   ├── coursera-skill-matches.json          # AI-matched Coursera courses
│   │   ├── coursera-spotcheck.md                # Spot-check of the Coursera matches
│   │   ├── fairness-audit.json                  # Fairness audit results
│   │   ├── fairness-audit.md                    # Fairness audit report
│   │   ├── sdg-skill-matches.json               # Top SDG targets per skill
│   │   ├── sdg-spotcheck.md                     # Spot-check of the SDG matches
│   │   └── transferable-skills.json             # Similar-skill pairs
│   ├── interests/
│   │   └── role-interests.json                  # Work-interest profile of each role
│   ├── pathway/
│   │   ├── noss.json                            # Hand-checked Malaysian NOSS/SKM
│   │   └── resources.json                       # Hand-checked course records
│   ├── sdg/
│   │   ├── review/
│   │   │   ├── disagreements.csv                # Pairs the two reviewers labelled
│   │   │   ├── GUIDE.md                         # Reviewer instructions
│   │   │   ├── key.csv                          # Answer key of the review pairs
│   │   │   ├── results.md                       # Review results
│   │   │   ├── review-A.csv                     # Reviewer A labels
│   │   │   ├── review-B.csv                     # Reviewer B labels
│   │   │   └── skill-texts.json                 # ESCO text that was embedded
│   │   ├── sdg-links.json                       # Short goal and target names used
│   │   └── sdg-review.json                      # Team-reviewed SDG links the app
│   ├── sources/
│   │   ├── anthropic-economic-index.json        # Anthropic Economic Index snapshot
│   │   ├── dosm-jmi-2026-q1.json                # DOSM Job Market Insights Q1 2026
│   │   ├── dosm-jmi-2026-q2.json                # DOSM Job Market Insights Q2 2026
│   │   ├── gdelt-news.json                      # GDELT news snapshot
│   │   ├── ilo-genai-exposure-2025.json         # ILO generative AI exposure, Table
│   │   ├── ms-ai-applicability.json             # Microsoft Working with AI
│   │   ├── news-topics.json                     # Topic words for the news page
│   │   ├── opendosm-lfs-month.json              # OpenDOSM monthly labour force
│   │   ├── role-soc.json                        # Roles mapped to US SOC codes
│   │   └── un-sdg-targets.json                  # UN SDG target list
│   └── roles.json                               # Nine adapted ESCO occupations
├── docs/
│   ├── PROGRESS_LOG.md                          # What was built, what is open
│   ├── RUNPOD_SETUP.md                          # RunPod Job A and Job B setup
│   ├── SCREENS.md                               # Screen-by-screen behaviour
│   └── SIGNALS_AND_MATCHING.md                  # Sources and scoring rule
├── runpod/
│   └── embed_esco_skills.py                     # RunPod Job A: embeds ESCO skills
├── scripts/
│   ├── build_roles.py                           # Builds data/roles.json
│   ├── build_sdg_review.py                      # Builds the blind SDG review kit
│   ├── build_transferable_skills.py             # Finds pairs of similar ESCO skills
│   ├── calibrate_sdg_osdg.py                    # Checks SDG matcher on OSDG
│   ├── check_dosm_jmi.py                        # Checks for a new DOSM quarter
│   ├── evaluate_sdg_review.py                   # Scores the SDG review
│   ├── fairness_audit.mjs                       # Fairness audit of the text intake
│   ├── import_anthropic_index.mjs               # Imports Anthropic index
│   ├── import_coursera_catalog.py               # Downloads Coursera catalogue
│   ├── import_dosm_jmi.py                       # Converts DOSM xlsx to JSON
│   ├── import_gdelt_news.py                     # Imports GDELT headlines
│   ├── import_ilo_exposure.py                   # Reads ILO Table A1 from the PDF
│   ├── import_lfs_month.py                      # Imports OpenDOSM labour data
│   ├── import_ms_ai_applicability.py            # Imports Microsoft AI scores
│   ├── match_courses_runpod.py                  # Matches courses to skills
│   └── match_sdg_runpod.py                      # Matches SDG targets to skills
├── server/
│   ├── dosm.mjs                                 # Daily DOSM new-quarter check
│   ├── dosm.test.mjs                            # Tests
│   ├── identity.d.mts                           # TypeScript types for identity.mjs
│   ├── identity.mjs                             # Strips name/age/identity phrases
│   ├── identity.test.mjs                        # Tests
│   ├── index.mjs                                # Dependency-free Node server
│   ├── lfs.mjs                                  # Daily labour-force refresh
│   ├── lfs.test.mjs                             # Tests
│   ├── news.mjs                                 # Daily news per topic
│   ├── news.test.mjs                            # Tests
│   ├── search.mjs                               # Skill search via RunPod Job B
│   └── search.test.mjs                          # Tests
├── src/
│   ├── AdCheck.tsx                              # Check a job ad screen
│   ├── adFit.test.ts                            # Tests
│   ├── adFit.ts                                 # Ad skills: held, related, to build
│   ├── aicourses.test.ts                        # Tests
│   ├── aiviews.test.ts                          # Tests
│   ├── aiviews.ts                               # Three AI-impact views per role
│   ├── ChangeCourse.tsx                         # Lets a person swap the suggested
│   ├── changes.test.ts                          # Tests
│   ├── changes.ts                               # Changes between snapshots
│   ├── CourseProgress.tsx                       # Course status in the plan
│   ├── cv.test.ts                               # Tests
│   ├── cv.ts                                    # CV text intake
│   ├── CvAvoid.tsx                              # List of things to avoid in a CV,
│   ├── CvCheck.tsx                              # The stand-alone Check my CV screen
│   ├── cvChecks.test.ts                         # Tests
│   ├── cvChecks.ts                              # CV check rules, each with a cited
│   ├── CvPanel.tsx                              # CV upload and skill suggestions
│   ├── data.ts                                  # All imported data in one place
│   ├── dataSaver.tsx                            # Low-data mode
│   ├── fairness.test.ts                         # Tests
│   ├── FairnessNote.tsx                         # Shows the fairness audit result
│   ├── futures.test.ts                          # Tests
│   ├── futures.ts                               # 1,000 simulated futures
│   ├── GradSteps.tsx                            # Three-step bar
│   ├── GuidedActionDock.tsx                     # Bottom action bar of the steps
│   ├── i18n.test.ts                             # Tests
│   ├── i18n.tsx                                 # English, Bahasa Malaysia
│   ├── interests.test.ts                        # Tests
│   ├── interests.ts                             # Work-interest fit
│   ├── JobLinks.tsx                             # Shows the Find this role links
│   ├── jobSearch.test.ts                        # Tests
│   ├── jobSearch.ts                             # Job-site search links
│   ├── learningCheck.test.ts                    # Tests
│   ├── learningCheck.ts                         # Demo evidence form
│   ├── LearningMilestones.tsx                   # Milestone badges
│   ├── main.tsx                                 # App shell
│   ├── milestones.test.ts                       # Tests
│   ├── milestones.ts                            # Milestone rules
│   ├── MovesStep.tsx                            # Your moves screen
│   ├── NewsView.tsx                             # Workplace news screen
│   ├── pathway.test.ts                          # Tests
│   ├── pathway.ts                               # Learning-plan rule
│   ├── PlanStep.tsx                             # Your plan screen
│   ├── PublicTables.tsx                         # Job ads and AI exposure tables
│   ├── radar.test.ts                            # Tests
│   ├── radar.ts                                 # Future skills radar rule
│   ├── RadarView.tsx                            # Future skills radar screen
│   ├── region.test.ts                           # Tests
│   ├── region.ts                                # Region view rules
│   ├── RegionView.tsx                           # Region view (skills centre)
│   ├── sampleAd.ts                              # Fictional sample job ad
│   ├── sampleCv.ts                              # Fictional sample CV
│   ├── scoring.test.ts                          # Tests
│   ├── scoring.ts                               # Pure scoring functions
│   ├── sdg.test.ts                              # Tests
│   ├── sdg.ts                                   # SDG link rule from review
│   ├── SdgViews.tsx                             # SDG tags and goal pieces
│   ├── SignalSources.tsx                        # Signal sources page
│   ├── SkillsStep.tsx                           # Your skills / Your CV screen
│   ├── styles.css                               # All styles
│   ├── team.test.ts                             # Tests
│   ├── team.ts                                  # Team view rules
│   ├── TeamView.tsx                             # Team view (HR, career centres)
│   └── vite-env.d.ts                            # Vite type declarations
├── submission/
│   └── README.md                                # Lists the required submission PDFs
├── .env.example                                 # Environment variables to set
├── .gitignore                                   # Files kept out of git
├── .replit                                      # Replit run and deployment
├── CLAUDE.md                                    # Rules for the AI coding agent
├── index.html                                   # Page shell that loads the React
├── LICENSE                                      # Apache License 2.0
├── package-lock.json                            # Pinned dependency versions
├── package.json                                 # Dependencies and npm scripts
├── README.md                                    # This file
├── replit.md                                    # Replit run and publish notes
├── tsconfig.json                                # TypeScript settings
└── vite.config.ts                               # Vite build and dev-server settings
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
| Chiu Shiao Ying | Member | [@smallwinnn](https://github.com/smallwinnn) |
| Khoo Ji Sheng | Member | [@xdevilchild](https://github.com/xdevilchild) |
| Tan Kit Yiu | Member | [@kykityiu](https://github.com/kykityiu) |
| Yeap Wei Hong | Member | [@Nic2018](https://github.com/Nic2018)  |

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

## Acknowledgements

**This publication uses the ESCO classification of the European Commission.** `data/roles.json` is an adapted selection of ESCO v1.2.1; the Commission does not guarantee ESCO's accuracy or completeness.

Data source: Department of Statistics Malaysia (DOSM), *Big Data Analytics: Job Market Insights*, Q1 and Q2 2026; International Labour Organization, Working Paper 140, *Generative AI and Jobs: A Refined Global Index of Occupational Exposure* (2025); European Commission, ESCO v1.2.1. Model: `BAAI/bge-m3` (open weights), run on RunPod.

Built for the **Aiversecity Future-Ready Workforce Domain (Domain 1)** at SDC Hackathon 2026.
