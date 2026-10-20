# Trend signals and role matching

**Status:** decision proposed on 21 Oct 2026. DOSM Q1 and Q2 2026 imported (`data/sources/`); ILO scores and ESCO skills still to import. This document chooses the minimum source set for the preliminary demo and defines a scoring rule a teammate can check by hand. It replaces the open source choice in [API_PLAN.md](API_PLAN.md) Stage 1. Check items in [CHECKLIST.md](CHECKLIST.md) only after the work is verified.

## Demo user (sharp slice for the rubric)

The product can serve many users, but the preliminary pitch follows **one person at one moment**:

> A junior accounting or bookkeeping worker in the Klang Valley, 1–5 years in, whose routine tasks (data entry, reconciliation, reports) are increasingly done by AI tools, deciding what to learn next.

Why this person: accounting and bookkeeping clerks are in the ILO's **highest generative-AI exposure gradient**, and "Accountants and Auditors" is one of DOSM's top advertised occupations. That gives a real tension between AI exposure and demand, and the existing synthetic sample profile already fits it. Profiles remain synthetic.

## Sources (both public, dated, attributable)

| Signal | Source | Measure | Update cadence | Role in the app |
| --- | --- | --- | --- | --- |
| **Demand now** (the required updatable source) | DOSM *Big Data Analytics: Job Market Insights* (JMI), quarterly. **Imported.** Latest: [Q2 2026](https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-job-market-insights-q22026), released 18 Aug 2026; previous: [Q1 2026](https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-job-market-insights-q12026). | Job offerings advertised online on private recruitment sites. The data file breaks this down by **occupation major group (1-digit MASCO)** and economic activity, not by individual job. Not all vacancies in Malaysia. | Quarterly; Q3 2026 is expected after the hackathon, so a refresh is a real future event. | Quarter-on-quarter change per major group gives "rising/declining demand" for every role in that group. |
| **AI exposure** | ILO Working Paper 140, *Generative AI and Jobs: A Refined Global Index of Occupational Exposure* (2025), [paper](https://webapps.ilo.org/static/english/intserv/working-papers/wp140/index.html) Annex Table A1 and [task scores](https://pgmyrek.github.io/2025_GenAI_scores_ISCO08/). | Mean task-level GenAI exposure score (0–1) and exposure gradient per ISCO-08 4-digit occupation. MASCO 2020 follows ISCO-08, so codes align without a US crosswalk. | Periodic research updates. | Feeds the AI-exposure part of the score and the two scenarios. Exposure means tasks could change, not that the job disappears. |
| Role → skills | Curated from [ESCO](https://esco.ec.europa.eu/) occupation pages (each linked to ISCO-08). | Essential skills listed for an occupation, adapted for Malaysia where noted. | Static for the demo. | Skill gap and pathway. Every role keeps its ESCO URI. |

**Stretch (Phase 2, if shortlisted):** the [Anthropic Economic Index](https://huggingface.co/datasets/Anthropic/EconomicIndex) (CC-BY data, releases every few months since Feb 2025) maps real AI usage to O*NET tasks with automation vs augmentation. It shows "AI advancement over time" better than the ILO index, but needs an O*NET-SOC ↔ ISCO crosswalk, so it is not in the preliminary build.

## DOSM import (done)

`python3 scripts/import_dosm_jmi.py data/raw/Data_JMI_Q2_2026.xlsx <download date>` writes `data/sources/dosm-jmi-2026-q2.json` (needs `pip install openpyxl`). Raw files live in `data/raw/` and are gitignored; the JSON records where to download them. Each data file holds the **full quarterly series from 2019 Q3**, so one file is enough for trend history; the Q1 and Q2 releases are kept separately to demonstrate a refresh.

Checked against the Q2 2026 release page: total 555,509; Professionals 285,907 (Q1: 315,768). The importer stops with an error if DOSM changes the table layout or adds an unknown occupation group.

| Major group | Q1 2026 (QoQ) | Q2 2026 (QoQ) |
| --- | --- | --- |
| Managers | 99,447 (+12.9%) | 87,950 (−11.6%) |
| Professionals | 315,768 (+15.8%) | 285,907 (−9.5%) |
| Technicians and associate professionals | 93,987 (+0.7%) | 86,512 (−8.0%) |
| Clerical support workers | 48,784 (−1.8%) | 40,408 (−17.2%) |
| Service and sales workers | 42,094 (−15.7%) | 32,511 (−22.8%) |

**Use quarter-on-quarter change only.** Year-on-year changes are above +80% for almost every group, which most likely reflects DOSM widening the set of job sites it collects from, not real demand doubling. Say this in the PRD as a known limitation.

## Files still to obtain by hand

1. ILO WP140 PDF (Annex **Table A1**, page 48: ISCO-08 4-digit occupations by exposure gradient, with mean and SD). The paper's web page does not include the table rows, and the linked task-score site offers no download.
2. ESCO classification download from the [ESCO download page](https://esco.ec.europa.eu/en/use-esco/download). Needed for both role skills and the RunPod step. Unzip into `data/raw/esco/` (gitignored).

### ESCO download settings and licence (requested 21 Oct 2026)

**Package:** ESCO dataset **v1.2.1** (last update 10 Dec 2025), Content **Classification** (not *Delta*, which holds only changes), Language **en**, File type **csv** (48.95 MB). Ignore the "ESCO datamodel" box; that is the technical schema. The file arrives by e-mail after a request form. Expected files include `skills_en.csv`, `occupations_en.csv`, `occupationSkillRelations_en.csv` and `ISCOGroups_en.csv`. ESCO has no Bahasa Malaysia or Chinese labels; the multilingual embedding model bridges that.

**Licence conditions** (Commission Decision 2011/833/EU; free reuse for any purpose):

1. **Acknowledge ESCO.** The app must show: *"This service uses the ESCO classification of the European Commission."* Reports, the PRD and slides that use ESCO must say: *"This publication uses the ESCO classification of the European Commission."*
2. **Mark adaptations.** Any modified or adapted version of ESCO (e.g. our curated role list with Malaysia-specific skill edits, or a synonym list) must be labelled as adapted, not presented as ESCO itself.
3. **No accuracy guarantee.** The Commission does not guarantee that ESCO is accurate, current or complete, including translations. State this as a limitation; skills suggested from ESCO are still confirmed by the user.

Declare ESCO v1.2.1 and its licence in the Technical & Tools Declaration.

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

Every source JSON carries metadata, then rows. The DOSM snapshot looks like this (abridged):

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
  "occupationMajorGroups": [
    { "label": "Professionals", "iscoMajorGroup": "2",
      "quarterly": { "2026-Q1": 315768, "2026-Q2": 285907 } }
  ],
  "economicActivities": [ ... ]
}
```

Job-level counts (e.g. Accountants and Auditors 22,067 in Q2 2026) appear only in DOSM's press statement, not the data file. They may be shown as a cited fact but do not feed the score.

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
- **Demand trend** `D = clamp(0.5 + Δ, 0, 1)`, where `Δ` is the quarter-on-quarter change for the role's **major group** (first digit of its ISCO code). +10% → 0.60; −20% → 0.30. Roles in the same group share `D`, so `D` mostly separates clerical (group 4), associate (group 3) and professional (group 2) moves. No DOSM row → `D` omitted and its weight redistributed, with a visible note.
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

The app has a **Data snapshot** switch: *DOSM Q1 2026* vs *DOSM Q2 2026*. Same profile, same scenario; switching the snapshot changes `D`, which changes scores and possibly order. With the real data: Professionals go from +15.8% to −9.5% (D 0.66 → 0.41) and Clerical support workers from −1.8% to −17.2% (D 0.48 → 0.33). The screen states which signal moved. When DOSM publishes Q3 2026, running `scripts/import-dosm.mjs` on the new file adds a third snapshot with no code change — that is the refresh story for judges.

## Skills radar (rising / declining skills)

A skill's trend is derived, not invented: average `D` and average `R` across the roles in `roles.json` that list it. A skill shows as **rising** when both averages are above 0.5, **at risk** when both are below. Each skill links to the roles and source rows behind it.

## Where AI is used: RunPod skill search over a real taxonomy

**Decision (21 Oct): use RunPod.** The GPU work runs on a real, official dataset, so the model only ever *retrieves* existing records and never writes them.

- **Dataset:** ESCO v1.2 (European Commission; about 13,900 skills and 3,000 occupations, each occupation linked to an ISCO-08 code). Official, free, and documented.
- **Model:** an open-weights multilingual embedding model such as `BAAI/bge-m3` (handles English, Bahasa Malaysia and Chinese, which also covers the brief's multi-language good-to-have). Confirm the exact model and record it in the Tools Declaration.
- **Batch job on a RunPod GPU Pod:** embed every ESCO skill label and its alternative labels once; save the vectors (e.g. `data/derived/esco-skill-embeddings.npy` + an id list). Record Pod ID, GPU type and runtime for the declaration screenshot.
- **Runtime on RunPod Serverless:** embed the user's free-text description ("I reconcile bank statements and prepare monthly reports in Excel"), return the nearest ESCO skills with similarity scores. The user ticks which ones are true before matching.
- **Also usable:** map each DOSM/MASCO role title to its nearest ESCO occupation as a check on the hand-made role list.
- **Never:** the model does not create roles, courses, statistics or scores. Every suggested skill is an ESCO record with its URI; scores come only from the rule above.
- **Fallback:** if the endpoint is down, the user picks skills from a searchable ESCO list; the demo still works.

**Kaggle and other mirrors:** use a Kaggle dataset only if it names its original source and licence, and prefer downloading from that original publisher (ESCO, O*NET, DOSM). A scraped job-postings dataset with unclear terms or origin is not acceptable evidence under the brief's "no invented statistics" rule.

## Hardest risk and fallback (for the PRD)

| Risk | Fallback |
| --- | --- |
| DOSM file format changes or a role has no row | Import script fails loudly; role shows "no demand data" and the weight is redistributed. |
| ILO exposure read as "job will disappear" | On-screen wording: "share of tasks generative AI could change"; scenarios, not predictions. |
| Model suggests a wrong skill | Retrieval only from ESCO records; similarity shown; user confirms each skill; searchable-list fallback. |
| DOSM detail is only by major group | Roles in a group share the demand signal; say so on screen; add finer data in Phase 2 if DOSM or another source provides it. |
| YoY figures inflated by source coverage changes | Use QoQ only; state the limitation. |
| Live demo network failure | Snapshots are committed JSON; the app runs without live calls. |
