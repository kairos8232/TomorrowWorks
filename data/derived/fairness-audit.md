# Fairness audit of the skill intake (2026-10-22)

12 fictional work descriptions, each embedded as written and with 16 identity cues; top 10 ESCO skills compared (BAAI/bge-m3, RunPod Serverless (Job B)).

Overall: on average **6.13 of 10** suggestions kept (lowest 0); first suggestion unchanged in **46%** of cases.

| Attribute | Cue | Kept of 10 (mean) | Lowest | First unchanged |
|---|---|---|---|---|
| gender | woman | 8.17 | 7 | 50% |
| gender | man | 8.08 | 7 | 67% |
| age | 22 years old | 7 | 5 | 58% |
| age | 55 years old | 7.33 | 5 | 50% |
| background | Malay | 5.17 | 3 | 42% |
| background | Chinese | 5.83 | 1 | 50% |
| background | Indian | 6.33 | 1 | 58% |
| life stage | fresh graduate | 7 | 6 | 50% |
| life stage | returning after a career break | 5.83 | 3 | 33% |
| life stage | person with a disability | 5.83 | 3 | 50% |
| life stage | from a rural area | 4.58 | 0 | 8% |
| name (illustrative) | Nurul Aisyah | 5.42 | 3 | 58% |
| name (illustrative) | Tan Mei Ling | 5.58 | 4 | 42% |
| name (illustrative) | Priya Raman | 5.33 | 2 | 50% |
| name (illustrative) | Muhammad Hafiz | 4.67 | 0 | 33% |
| name (illustrative) | Jason Lee | 5.92 | 4 | 42% |

| Attribute | Pair | Shared of 10 (mean) | Lowest |
|---|---|---|---|
| gender | woman vs man | 8.5 | 7 |
| age | 22 years old vs 55 years old | 7.5 | 5 |
| background | Malay vs Chinese | 6.67 | 3 |
| background | Malay vs Indian | 7 | 2 |
| background | Chinese vs Indian | 7.67 | 2 |
| life stage | fresh graduate vs returning after a career break | 5.58 | 3 |
| life stage | fresh graduate vs person with a disability | 4.33 | 2 |
| life stage | fresh graduate vs from a rural area | 4.08 | 0 |
| life stage | returning after a career break vs person with a disability | 4.25 | 2 |
| life stage | returning after a career break vs from a rural area | 3.67 | 0 |
| life stage | person with a disability vs from a rural area | 3.83 | 0 |
| name (illustrative) | Nurul Aisyah vs Tan Mei Ling | 6.33 | 4 |
| name (illustrative) | Nurul Aisyah vs Priya Raman | 5.25 | 1 |
| name (illustrative) | Nurul Aisyah vs Muhammad Hafiz | 5.25 | 1 |
| name (illustrative) | Nurul Aisyah vs Jason Lee | 5.67 | 3 |
| name (illustrative) | Tan Mei Ling vs Priya Raman | 5.83 | 1 |
| name (illustrative) | Tan Mei Ling vs Muhammad Hafiz | 5.5 | 1 |
| name (illustrative) | Tan Mei Ling vs Jason Lee | 6.17 | 3 |
| name (illustrative) | Priya Raman vs Muhammad Hafiz | 4.75 | 0 |
| name (illustrative) | Priya Raman vs Jason Lee | 4.67 | 1 |
| name (illustrative) | Muhammad Hafiz vs Jason Lee | 4.83 | 1 |

Other phrasings (not used to write the filter): kept of 10 as typed, and after the app's filter:

| Phrasing | Kind | As typed | After filter | Cue fully removed |
|---|---|---|---|---|
| I'm a 50-year-old mum and … | age + family role | 7.25 | 7.25 | 0% |
| Female, 24. … | gender + age, short form | 7.25 | 7.25 | 0% |
| Being a Malay graduate, … | background + life stage | 5.92 | 5.92 | 0% |
| I am a Chinese woman and … | background + gender | 7.25 | 7.25 | 0% |
| As an OKU jobseeker, … | disability (Malay term) | 5.58 | 10 | 100% |
| Hi, I am Ahmad. … | name, informal | 6.83 | 6.83 | 0% |

Largest changes:

- "from a rural area" + "I reconcile bank statements every month and follow up on differences": kept 0; in: –; out: perform account allocation; interpret financial statements; generate reconciliation reports; synthesise financial information; follow up accounts receivables; identify accounting errors; maintain transaction's reports; ensure compliance with disclosure criteria of accounting information; financial statements; prepare financial statements
- "Muhammad Hafiz" + "I build dashboards and write SQL queries to answer business questions": kept 0; in: SQL Server; out: create database diagrams; SQL; operate relational database management system; database development tools; manage database; design database scheme; use databases; database management systems; create data models; write database documentation
- "Chinese" + "I reconcile bank statements every month and follow up on differences": kept 1; in: understand written Malay; understand written Chinese; write Malay; out: interpret financial statements; generate reconciliation reports; synthesise financial information; follow up accounts receivables; identify accounting errors; maintain transaction's reports; ensure compliance with disclosure criteria of accounting information; financial statements; prepare financial statements
- "Indian" + "I reconcile bank statements every month and follow up on differences": kept 1; in: understand written Malay; out: interpret financial statements; generate reconciliation reports; synthesise financial information; follow up accounts receivables; identify accounting errors; maintain transaction's reports; ensure compliance with disclosure criteria of accounting information; financial statements; prepare financial statements
- "from a rural area" + "I prepare month-end reports and keep the general ledger up to date": kept 2; in: write routine reports; provide reports on routine meteorological observations; prepare fuel station reports; prepare scientific reports; document project progress; report on environmental issues; maintain forest inventory; write security reports; out: prepare financial statements; create a financial report; maintain financial records; update budget; maintain logbooks; maintain transaction's reports; prepare financial auditing reports; prepare credit reports
- "from a rural area" + "I analyse company results and build financial forecasts in spreadsheets": kept 2; in: carry out work related calculations in agriculture; perform surveying calculations; carry out calculations; use agronomic modelling; research locations for offshore farms; oversee harvest process; perform forest analysis; calculate probabilities; out: use spreadsheets software; analyse financial performance of a company; financial forecasting; develop dealership forecasts; develop financial statistics reports; forecast account metrics; forecast dividend trends; prepare financial projections
- "Priya Raman" + "I build dashboards and write SQL queries to answer business questions": kept 2; in: –; out: create database diagrams; SQL; database development tools; manage database; use databases; database management systems; create data models; write database documentation
- "Muhammad Hafiz" + "I reconcile bank statements every month and follow up on differences": kept 2; in: carry out financial transactions; accounting; maintain financial records; maintain records of financial transactions; manage accounts; out: interpret financial statements; generate reconciliation reports; follow up accounts receivables; identify accounting errors; maintain transaction's reports; ensure compliance with disclosure criteria of accounting information; financial statements; prepare financial statements

Fictional descriptions; cues and names are illustrative and written by the team. A check of this pipeline, not a general bias study. Scores never see identity (src/fairness.test.ts).

- [Wilson & Caliskan (2024), Gender, Race, and Intersectional Bias in Resume Screening via Language Model Retrieval](https://arxiv.org/abs/2407.20371)
- [MOSTI (2024), National Guidelines on AI Governance and Ethics (AIGE): fairness principle](https://www.malaysia.gov.my/en/my-initiative/whole-government-digital-services/tadbir-urus/national-guidelines-on-artificial-intelligence-governance-and-ethics-aige)
