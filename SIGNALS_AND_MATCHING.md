# Trend signals and role matching

**Status:** decision proposed on 21 Oct 2026; no source file imported yet. This document chooses the minimum source set for the preliminary demo and defines a scoring rule a teammate can check by hand. It replaces the open source choice in [API_PLAN.md](API_PLAN.md) Stage 1. Check items in [CHECKLIST.md](CHECKLIST.md) only after the work is verified.

## Demo user (sharp slice for the rubric)

The product can serve many users, but the preliminary pitch follows **one person at one moment**:

> A junior accounting or bookkeeping worker in the Klang Valley, 1–5 years in, whose routine tasks (data entry, reconciliation, reports) are increasingly done by AI tools, deciding what to learn next.

Why this person: accounting and bookkeeping clerks are in the ILO's **highest generative-AI exposure gradient**, and "Accountants and Auditors" is one of DOSM's top advertised occupations. That gives a real tension between AI exposure and demand, and the existing synthetic sample profile already fits it. Profiles remain synthetic.

## Sources (both public, dated, attributable)

| Signal | Source | Measure | Update cadence | Role in the app |
| --- | --- | --- | --- | --- |
| **Demand now** (the required updatable source) | DOSM *Big Data Analytics: Job Market Insights* (JMI), quarterly. Latest: [Q2 2026](https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-job-market-insights-q22026), released 18 Aug 2026; previous: [Q1 2026](https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-job-market-insights-q12026). | Online job vacancies advertised on private recruitment sites, by occupation (MASCO), industry and state. Not all vacancies in Malaysia. | Quarterly; Q3 2026 is expected after the hackathon, so a refresh is a real future event. | Quarter-on-quarter change per occupation gives "rising/declining demand". |
| **AI exposure** | ILO Working Paper 140, *Generative AI and Jobs: A Refined Global Index of Occupational Exposure* (2025), [paper](https://webapps.ilo.org/static/english/intserv/working-papers/wp140/index.html) Annex Table A1 and [task scores](https://pgmyrek.github.io/2025_GenAI_scores_ISCO08/). | Mean task-level GenAI exposure score (0–1) and exposure gradient per ISCO-08 4-digit occupation. MASCO 2020 follows ISCO-08, so codes align without a US crosswalk. | Periodic research updates. | Feeds the AI-exposure part of the score and the two scenarios. Exposure means tasks could change, not that the job disappears. |
| Role → skills | Curated from [ESCO](https://esco.ec.europa.eu/) occupation pages (each linked to ISCO-08). | Essential skills listed for an occupation, adapted for Malaysia where noted. | Static for the demo. | Skill gap and pathway. Every role keeps its ESCO URI. |

**Stretch (Phase 2, if shortlisted):** the [Anthropic Economic Index](https://huggingface.co/datasets/Anthropic/EconomicIndex) (CC-BY data, releases every few months since Feb 2025) maps real AI usage to O*NET tasks with automation vs augmentation. It shows "AI advancement over time" better than the ILO index, but needs an O*NET-SOC ↔ ISCO crosswalk, so it is not in the preliminary build.

## Files to obtain by hand

The shell environment cannot reach these sites; download them in a browser and place them under `data/raw/` (gitignored if large; keep the converted JSON in git):

1. DOSM JMI **Q1 2026** and **Q2 2026** data files (the "Data" link on each release page). Record file name, download date, and the occupation table used.
2. ILO WP140 Annex **Table A1** (PDF) or the task-score file from the GitHub page above.
3. ESCO pages for the roles below (copy essential skills; keep URIs).

## Data shape

```text
data/
  sources/
    dosm-jmi-2026q1.json      # converted snapshot
    dosm-jmi-2026q2.json
    ilo-genai-exposure-2025.json
  roles.json                  # curated role set
scripts/
  import-dosm.mjs             # raw DOSM file -> data/sources/dosm-jmi-<quarter>.json
```

Every source JSON carries metadata, then rows:

```json
{
  "source": {
    "name": "DOSM Job Market Insights, Q2 2026",
    "url": "https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-job-market-insights-q22026",
    "publishedAt": "2026-08-18",
    "retrievedAt": "YYYY-MM-DD",
    "geography": "Malaysia",
    "measure": "Online job vacancies advertised on private recruitment websites",
    "coverage": "Not all vacancies in Malaysia"
  },
  "rows": [{ "code": "2411", "occupation": "Accountants and auditors", "vacancies": 0 }]
}
```

Fill `vacancies` only from the official file. The two numbers below are from the Q2 2026 release page and are useful for checking the import: Accountants and Auditors **22,067**; Software Developers **19,899**.

## Candidate roles (verify every code against MASCO 2020 before use)

| ISCO-08 | Role | Why it is in the set |
| --- | --- | --- |
| 4311 | Accounting and bookkeeping clerk | The demo user's current role (high exposure). |
| 3313 | Accounting associate professional | Adjacent step up. |
| 2411 | Accountant / auditor | Promotion path; high DOSM demand. |
| 2413 | Financial analyst | Analytics move; ILO lists as high exposure — a useful contrast. |
| 2421 | Management and organisation analyst | Process / transformation move. |
| 2120 | Statistician / data analyst | Data move. |
| 2512 | Software developer | High DOSM demand; long reskilling path. |
| 2133 | Environmental protection professional (ESG reporting) | Sustainability move; strong SDG link. |

Eight roles are enough for the preliminary demo. Do not add a role without a code, an ESCO URI and a DOSM row (or a visible "no demand data" note).

## Scoring rule (hand-checkable)

For a profile *p* and role *r*:

- **Skill fit** `F = matched essential skills / all essential skills of r` (0–1). Matching uses normalised exact names plus a small reviewed synonym list.
- **Demand trend** `D = clamp(0.5 + Δ, 0, 1)`, where `Δ = (vacancies this quarter − last quarter) / last quarter`. +10% → 0.60; −20% → 0.30. No DOSM row → `D` omitted and its weight redistributed, with a visible note.
- **AI resilience** `R = 1 − E`, where `E` is the ILO mean exposure score for the occupation.

`score = wF·F + wD·D + wR·R`, shown as 0–100 with each part visible.

| Scenario | wF | wD | wR | Assumption |
| --- | --- | --- | --- | --- |
| Moderate AI change | 0.60 | 0.25 | 0.15 | Exposure changes tasks gradually; current demand matters more. |
| Fast AI change | 0.50 | 0.20 | 0.30 | Highly exposed tasks change sooner; resilience matters more. |

Both scenario results are labelled **estimates**. The weights are assumptions, stated on screen and in the PRD.

### Worked example (illustrative numbers only)

Role has 6 essential skills, profile holds 3 → F = 0.50. Δ = +8% → D = 0.58. E = 0.45 → R = 0.55.
Moderate: 0.6·0.50 + 0.25·0.58 + 0.15·0.55 = 0.300 + 0.145 + 0.0825 = **0.5275 → 53**.
Fast: 0.5·0.50 + 0.2·0.58 + 0.3·0.55 = 0.250 + 0.116 + 0.165 = **0.531 → 53**.

Write a unit test with this case before wiring the UI.

## Proving "trend data changes the result"

The app has a **Data snapshot** switch: *DOSM Q1 2026* vs *DOSM Q2 2026*. Same profile, same scenario; switching the snapshot changes `D`, which changes scores and possibly order. The screen states which signal moved (e.g. "Accountants and auditors: vacancies −x% Q1→Q2"). When DOSM publishes Q3 2026, running `scripts/import-dosm.mjs` on the new file adds a third snapshot with no code change — that is the refresh story for judges.

## Skills radar (rising / declining skills)

A skill's trend is derived, not invented: average `D` and average `R` across the roles in `roles.json` that list it. A skill shows as **rising** when both averages are above 0.5, **at risk** when both are below. Each skill links to the roles and source rows behind it.

## Where AI is used (and where it is not)

- **Recommended:** an open-weights LLM on RunPod (GPU, as the handbook requires) turns a free-text skills description into skills **chosen only from the known ESCO skill list** in `roles.json`. Output outside the list is dropped. The user reviews the extracted skills before matching.
- **Never:** the model does not create roles, courses, statistics or scores. Scores come only from the rule above.
- Fallback: if the endpoint is down, the user picks skills from a checklist; the demo still works.
- Disclose the model name and RunPod evidence in the Technical & Tools Declaration.

If time runs short, skip the LLM step; nothing else depends on it. RunPod is then not needed (handbook 9.4 only requires it for GPU work). Replit is required either way.

## Hardest risk and fallback (for the PRD)

| Risk | Fallback |
| --- | --- |
| DOSM file format changes or a role has no row | Import script fails loudly; role shows "no demand data" and the weight is redistributed. |
| ILO exposure read as "job will disappear" | On-screen wording: "share of tasks generative AI could change"; scenarios, not predictions. |
| LLM invents skills | Constrained to the known list; user review step; checklist fallback. |
| Live demo network failure | Snapshots are committed JSON; the app runs without live calls. |
