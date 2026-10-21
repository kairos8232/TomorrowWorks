# Trend signals and role matching

**Status:** decision proposed on 21 Oct 2026. DOSM Q1 and Q2 2026 imported (`data/sources/`). ILO Table A1 imported (`data/sources/ilo-genai-exposure-2025.json`, 427 occupations). ESCO skills embedded on RunPod (`data/derived/esco/`). Role set built (`data/roles.json`, 9 roles). Scoring implemented in `src/scoring.ts` with tests (`npm test`). Day-by-day plan: [BUILD_STAGES.md](BUILD_STAGES.md#next-selection-updated-21-oct-2026). This document chooses the minimum source set for the preliminary demo and defines a scoring rule a teammate can check by hand. It replaces the open source choice in [API_PLAN.md](API_PLAN.md) Stage 1. Check items in [CHECKLIST.md](CHECKLIST.md) only after the work is verified.

## Demo user (sharp slice for the rubric)

The product can serve many users, but the preliminary pitch follows **one person at one moment**:

> A junior accounting assistant in the Klang Valley, 1–5 years in, whose routine tasks (data entry, billing, reconciliation, reports) are increasingly done by AI tools, deciding what to learn next.

Why this person: the clerical accounting work around this job (ISCO 4311, *accounting and bookkeeping clerks*) is in the ILO's **highest generative-AI exposure gradient**, and "Accountants and Auditors" is one of DOSM's top advertised occupations. That gives a real tension between AI exposure and demand, and the existing synthetic sample profile already fits it. Profiles remain synthetic.

## Sources (both public, dated, attributable)

| Signal | Source | Measure | Update cadence | Role in the app |
| --- | --- | --- | --- | --- |
| **Demand now** (the required updatable source) | DOSM *Big Data Analytics: Job Market Insights* (JMI), quarterly. **Imported.** Latest: [Q2 2026](https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-job-market-insights-q22026), released 18 Aug 2026; previous: [Q1 2026](https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-job-market-insights-q12026). | Job offerings advertised online on private recruitment sites. The data file breaks this down by **occupation major group (1-digit MASCO)** and economic activity, not by individual job. Not all vacancies in Malaysia. | Quarterly; Q3 2026 is expected after the hackathon, so a refresh is a real future event. | Quarter-on-quarter change per major group gives "rising/declining demand" for every role in that group. |
| **AI exposure** | ILO Working Paper 140, *Generative AI and Jobs: A Refined Global Index of Occupational Exposure* (2025), [paper](https://webapps.ilo.org/static/english/intserv/working-papers/wp140/index.html) Annex Table A1 and [task scores](https://pgmyrek.github.io/2025_GenAI_scores_ISCO08/). | Mean task-level GenAI exposure score (0–1) and exposure gradient per ISCO-08 4-digit occupation. MASCO 2020 follows ISCO-08, so codes align without a US crosswalk. | Periodic research updates. | Feeds the AI-exposure part of the score and the two scenarios. Exposure means tasks could change, not that the job disappears. |
| Role → skills | Curated from [ESCO](https://esco.ec.europa.eu/) occupation pages (each linked to ISCO-08). | Essential skills listed for an occupation, adapted for Malaysia where noted. | Static for the demo. | Skill gap and pathway. Every role keeps its ESCO URI. |

**Stretch (Phase 2, if shortlisted):** the [Anthropic Economic Index](https://huggingface.co/datasets/Anthropic/EconomicIndex) (CC-BY data, releases every few months since Feb 2025) maps real AI usage to O*NET tasks with automation vs augmentation. It shows "AI advancement over time" better than the ILO index, but needs an O*NET-SOC ↔ ISCO crosswalk, so it is not in the preliminary build.

## Planned additions (21 Oct 2026)

News (GDELT) and the monthly Labour Force Survey (OpenDOSM `lfs_month`) will make the public views more current, and NOSS/SKM will add the Malaysian certification route to pathways. **None of them changes the scoring rule:** news is reported context, the LFS is a different measure from job ads, and NOSS is a learning route. Details and boundaries: [API_PLAN.md](API_PLAN.md#next-sources-decided-21-oct-2026-0224).

## DOSM import (done)

`python3 scripts/import_dosm_jmi.py data/raw/Data_JMI_Q2_2026.xlsx <release date> <download date>` writes `data/sources/dosm-jmi-2026-q2.json` (needs `pip install openpyxl`). Raw files live in `data/raw/` and are gitignored; the JSON records where to download them. Each data file holds the **full quarterly series from 2019 Q3**, so one file is enough for trend history; the Q1 and Q2 releases are kept separately to demonstrate a refresh.

Checked against the Q2 2026 release page: total 555,509; Professionals 285,907 (Q1: 315,768). The importer stops with an error if DOSM changes the table layout or adds an unknown occupation group.

| Major group | Q1 2026 (QoQ) | Q2 2026 (QoQ) |
| --- | --- | --- |
| Managers | 99,447 (+12.9%) | 87,950 (−11.6%) |
| Professionals | 315,768 (+15.8%) | 285,907 (−9.5%) |
| Technicians and associate professionals | 93,987 (+0.7%) | 86,512 (−8.0%) |
| Clerical support workers | 48,784 (−1.8%) | 40,408 (−17.2%) |
| Service and sales workers | 42,094 (−15.7%) | 32,511 (−22.8%) |

**Industry table caveat (found 21 Oct 2026):** in the Q2 2026 file, 273,024 ads (49%) are *Unclassified* by economic activity, against 49,549 (8%) in Q1. Industry-level Q1 → Q2 changes are therefore distorted and are **not shown**. The occupation-group table has no unclassified ads in Q2 and is the one used.

**Use quarter-on-quarter change only.** Year-on-year changes are above +80% for almost every group, which most likely reflects DOSM widening the set of job sites it collects from, not real demand doubling. Say this in the PRD as a known limitation.

## ILO import (done)

`python3 scripts/import_ilo_exposure.py "data/raw/Generative AI and Jobs: A Refined Global Index of Occupational Exposure.pdf" <download date>` (needs `pdftotext`: `brew install poppler`) writes `data/sources/ilo-genai-exposure-2025.json`.

- **427 occupations**; **112 exposed** (Gradients 1–4) and **13 in Gradient 4** — both match the counts stated in the paper.
- Gradient = the label printed in Table A1; where it cannot be read from the PDF layout (91 rows), the paper's threshold rule is used. Where both are readable they agree, except 4 rows whose rounded mean + SD sits exactly on 0.40; the printed label is kept.
- Some names break in PDF extraction (e.g. "Tra"c" for "Traffic"); the app shows the ESCO ISCO label instead.

## Source files obtained by hand

1. **Done** (`data/raw/Generative AI and Jobs: A Refined Global Index of Occupational Exposure.pdf`, 53 pages; Table A1 extracts cleanly with `pdftotext -layout`). ILO WP140 PDF (Annex **Table A1**, page 48: ISCO-08 4-digit occupations by exposure gradient, with mean and SD). The paper's web page does not include the table rows, and the linked task-score site offers no download.
2. **Done.** ESCO classification download from the [ESCO download page](https://esco.ec.europa.eu/en/use-esco/download). Needed for both role skills and the RunPod step. Unzip into `data/raw/esco/` (gitignored).

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

## Role set (built: `data/roles.json`)

Built on 21 Oct 2026 by `scripts/build_roles.py` from ESCO v1.2.1. **Each role is one ESCO occupation**, selected by its URI; title, ISCO group, description, essential and optional skills are copied from ESCO unchanged. Skills carry `green` and `digital` flags from ESCO's own green-skills and digital-skills collections. The file is labelled as an adapted ESCO selection. ILO mean = average GenAI exposure of the occupation's tasks (0–1).

| ESCO occupation (code) | ISCO / DOSM group | ILO mean, gradient | Essential / optional skills | Why it is in the set |
| --- | --- | --- | --- | --- |
| billing clerk (4311.1) | 4311 / Clerical | 0.64, Gradient 4 | 12 / 12 | Clerical end of the path; highest exposure. |
| **accounting assistant** (3313.1) | 3313 / Technicians & associates | 0.49, Gradient 2 | 20 / 20 | **The demo user's current job.** |
| bookkeeper (3313.2) | 3313 / Technicians & associates | 0.49, Gradient 2 | 18 / 18 | Sibling role. |
| accountant (2411.1) | 2411 / Professionals | 0.51, Gradient 3 | 26 / 31 | Promotion path; top-five advertised job in DOSM Q2 2026. |
| financial analyst (2413.1) | 2413 / Professionals | 0.62, Gradient 4 | 23 / 24 | Analytics move with high exposure. |
| business analyst (2421.1) | 2421 / Professionals | 0.46, Gradient 2 | 26 / 27 | Process and transformation move. |
| data analyst (2511.3) | 2511 / Professionals | 0.49, Gradient 2 | 36 / 31 | Data move (28 essential skills are ESCO digital skills). |
| software developer (2512.4) | 2512 / Professionals | 0.53, Gradient 3 | 24 / 84 | Top-five advertised job in DOSM Q2 2026; long path. |
| sustainability manager (1213.8) | 1213 / Managers | 0.36, Not exposed | 48 / 40 | ESG move; 39 essential skills are ESCO green skills. |

**Changes from the first candidate list, and why:**
- ESCO places *bookkeeper* and *accounting assistant* under ISCO **3313**, not 4311; 4311 holds only *billing clerk* and *sales support assistant*. The demo user's current job is therefore *accounting assistant* (3313, Gradient 2), and *billing clerk* (4311, Gradient 4) shows the most-exposed clerical work next to it. The pitch should say "the clerical tasks around this job are the most exposed", not "this job is the most exposed".
- *Statistician* (2120) replaced by *data analyst* (2511): ESCO lists 50 essential skills for statistician, and data analyst is the realistic move from accounting.
- *Environmental protection professional* (2133) replaced by *sustainability manager* (1213): the ESG path an accountant can take, with 39 ESCO green skills that support a sourced SDG link.
- The set now spans four DOSM major groups (Managers, Professionals, Technicians and associates, Clerical), so the Q1 ↔ Q2 snapshot switch moves roles by different amounts.

ESCO occupation codes follow ISCO-08; checking them against the MASCO 2020 list is still open.

## Scoring rule (hand-checkable)

For a profile *p* and role *r*:

- **Skill fit** `F = (exact + 0.5 × transferable) / essential skills of r` (0–1). *Exact* = the person confirmed that ESCO skill. *Transferable* = the person holds a different ESCO skill whose RunPod embedding is **≥ 0.85** cosine-similar (precomputed in `data/derived/transferable-skills.json` by `scripts/build_transferable_skills.py`); the screen shows the pair and its similarity.
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

### Why transferable skills, and why 0.85 (decided 21 Oct 2026)

With exact matching only, the demo user's current job scored F = 1.00 and every move F ≈ 0, because ESCO occupations rarely share skill records; moves were then ranked only by D and R. Transferable skills use the RunPod ESCO embeddings so related experience counts, while staying explainable.

The threshold was chosen from real pairs for the demo user (needed ← held):

| Similarity | Pair | Sensible? |
| --- | --- | --- |
| 0.87 | perform business analysis ← perform business research | yes |
| 0.86 | accounting ← accounting techniques | yes |
| 0.84 | explain accounting records ← check accounting records | yes, but below the line |
| 0.81 | use databases ← use accounting systems | partly |
| 0.80 | perform scientific research ← perform business research | **no** |

At ≥ 0.85 every inspected pair was sensible, so 0.85 is used, at half credit. Result: 185 needed skills, 61 with at least one transferable ESCO skill, 99 pairs. Data analyst and software developer get no transferable credit from accounting skills — an honest "new skills needed".

**The current job is shown separately** (`recommendMoves` in `src/scoring.ts`): it always wins on skill fit, so it is displayed as "where you are" and only the other roles are ranked.

### Demo result with real data (accounting assistant's 20 ESCO skills)

| Move | F (exact, transferable / needed) | Q2 moderate | Q2 fast |
| --- | --- | --- | --- |
| bookkeeper | 0.67 (12, 0 / 18) | 58 | 57 |
| accountant | 0.46 (11, 2 / 26) | 45 | 46 |
| billing clerk | 0.38 (4, 1 / 12) | 36 | 36 |
| financial analyst | 0.09 (1, 2 / 23) | 21 | 24 |
| business analyst | 0.02 (0, 1 / 26) | 19 | 25 |
| sustainability manager | 0.00 (0, 0 / 48) | 19 | **27** |
| data analyst | 0.00 (0, 0 / 36) | 18 | 23 |
| software developer | 0.00 (0, 0 / 24) | 17 | 22 |

Switching to the fast scenario moves sustainability manager from 6th to 4th (resilience weighs more); switching DOSM Q1 → Q2 lowers the accountant from 51 to 45 (Professionals +15.8% → −9.5%). Scores are estimates.

## Proving "trend data changes the result"

The app has a **Data snapshot** switch: *DOSM Q1 2026* vs *DOSM Q2 2026*. Same profile, same scenario; switching the snapshot changes `D`, which changes scores and possibly order. With the real data: Professionals go from +15.8% to −9.5% (D 0.66 → 0.41) and Clerical support workers from −1.8% to −17.2% (D 0.48 → 0.33). The screen states which signal moved. When DOSM publishes Q3 2026, running `scripts/import-dosm.mjs` on the new file adds a third snapshot with no code change — that is the refresh story for judges.

## Learning plan rule (stage 10, added 21 Oct 2026)

Code: `src/pathway.ts`, tests in `src/pathway.test.ts`. Data: `data/pathway/resources.json` (courses) and `data/pathway/noss.json` (Malaysian certification route).

1. **Gaps** are the chosen role's essential ESCO skills the person does not hold, plus the transferable ones (they only get half credit, so they are still worth learning; shown with ≈ and the related skill).
2. **Courses** are opened by hand on the provider's own page (checked 21 Oct 2026): free ones (OpenLearn, CS50x, UN CC:Learn) and Coursera courses, which are paid but reachable free for three months through Rakyat Digital's Global Learning Pass (Ministry of Digital, 100,000 licences for eligible Malaysians with MyDigital ID, from 16 Sep 2026). Each lists the ESCO skills its *stated learning outcomes* address, using exact labels from `data/roles.json`; a test fails if a label does not exist. This mapping is the team's reading and is an adapted use of ESCO.
3. **Order (greedy):** step 1 is the course that closes the most remaining gaps; repeat with what is left. Ties: more fully missing skills first, then free before paid, then fewer stated hours (no stated hours counts as longest), then file order. Stop when no course closes another gap.
4. **Time** is the study time the provider states (e.g. "8 hours study" on OpenLearn). We never estimate it. A course with no stated hours shows the provider's own wording (CS50x: "eleven weeks of material").
5. **Leftover gaps** get **AI suggestions** from the RunPod Coursera matches (`suggestedSteps` in `src/pathway.ts`): the same greedy rule over each gap's top-3 matched courses, so one course that matches several gaps becomes one step. They appear in the same numbered list as checked courses, labelled "AI suggestion · match n%" and never counted in stated hours. Gaps with no match at or above 0.66 are listed as "No course found yet". No course is invented.

Why greedy: it is the simplest rule a person can check by hand ("this course builds 4 of your 6 gaps, so it comes first"), and it keeps the plan short.

Current coverage with Aina's skills (21 courses): bookkeeper 4 of 6 gaps, billing clerk 1 of 8, accountant 6 of 15, financial analyst 6 of 22, business analyst 8 of 26, data analyst 11 of 36, software developer 5 of 24, sustainability manager 10 of 48. Low coverage is shown honestly; more courses can be added to the JSON after checking their pages.

## Interest fit (optional fourth part, added 21 Oct 2026)

The brief's intake asks for "skills, experience and interests". Interests use Holland's RIASEC types (Realistic, Investigative, Artistic, Social, Enterprising, Conventional), which Malaysian career guidance and research also use (e.g. Hamzah, *Jurnal Psikologi Malaysia* 40(1), 2026: RIASEC inventory with 338 Malaysian undergraduates).

- **Person:** picks up to two types on *Your skills* ("What kind of work do you enjoy?"). Self-reported, optional, not a personality test.
- **Role profiles:** `data/interests/role-interests.json`, matched by hand by job content. Main source **job tag** (Japan, Ministry of Health, Labour and Welfare; data from JILPT's survey of Japanese workers, 1–5 scores; cite 「出典：job tag（厚生労働省職業情報提供サイト）」). Fallback **O\*NET** (US DOL, top-three letters) for sustainability manager, which has no job tag match. No Malaysian per-occupation interest data exists; this is a stated limit.
- **Rule** (`src/interests.ts`): per pick, 1 if it is one of the role's two highest types (ties count), 0.5 if third, else 0; interest fit = average over picks.
- **Score:** only when the person turns on *Include in ranking* on Your moves. Then `I` joins F, D, R with weight 0.2 before rescaling (so 1/6 of the score). Off by default, so the main score stays skills + market data. Tests: `src/interests.test.ts`.

## SDG links (stage 11, added 21 Oct 2026)

Data: `data/sdg/sdg-links.json`; rule: `src/sdg.ts`; tests: `src/sdg.test.ts`. Brief targets: 4.4, 4.3, 8.2, 8.5.

- **Skills (changed 21 Oct, evening):** RunPod Job B (BAAI/bge-m3) embeds the official text of the 126 numbered UN targets (UNSD SDG API; lettered means-of-implementation targets left out) and compares it with the Job A vector of each of the 185 role skills (`scripts/match_sdg_runpod.py` → `data/derived/sdg-skill-matches.json`, top 3 per skill). A match is *strong* if its similarity is **≥ 0.60** and the review in `data/sdg/sdg-review.json` neither rejected it nor marked it uncertain. **0.60 is provisional**: chosen by exploratory inspection (`data/derived/sdg-spotcheck.md`), not a validated standard; the team validates all 73 matches ≥ 0.60 in `data/derived/sdg-validation.csv`, which will give the acceptance rate. **Review (draft, Claude, 21 Oct; Carson's feedback):** target-wide rejection only for targets clearly outside the nine roles (2.4 food, 6.3/6.4 water, 14.2 marine, 17.4 developing-country debt: 15 matches); per-match rejection otherwise (all 17.16 matches, "too broad"; 10.3; data migration → 10.7; confidentiality → 16.10: 19 matches); *uncertain* for context-dependent or indirect links (offer financial services → 9.3/8.3; environmental awareness → 12.6; 4.7 for three skills: 7 matches), shown with the possible links; 32 kept. ESCO **digital** skills also link to 4.4 (indicator 4.4.1). The earlier hand-written word patterns were removed.
- **Measured check on human-labelled data (prepared 21 Oct, run by Carson):** `scripts/calibrate_sdg_osdg.py` runs the same matcher (bge-m3 on RunPod Job B, closest of the 126 UN targets) on the [OSDG Community Dataset](https://zenodo.org/records/5550238) (UNDP/OSDG, CC BY 4.0; 32,120 texts in v2021.09, each labelled with an SDG and checked by volunteers). Sample: up to 200 texts per SDG with more positive than negative votes and agreement ≥ 0.6, seed 7. Reports the share of texts whose closest target is in the volunteers' SDG (chance 1/16), the share with the right SDG among the 3 closest goals, and accuracy per similarity band and per threshold (0.50–0.65). Output: `data/derived/sdg-osdg-calibration.md`. **Limits:** goal-level labels (not targets) and document paragraphs (not short skill names), so similarity values are not on exactly the same scale; it tests the matcher, it does not confirm our 73 skill links or fix the skill threshold. Results: *pending the run*.
- **Levels (Carson, 21 Oct, hybrid):** *Strong* = similarity ≥ 0.60 and kept by the human check: tags, role links and the optional Goals ranking. *Possible* = 0.55–0.59 (a display choice, not a validated boundary) or marked uncertain, labelled "not confirmed", collapsed, never used for ranking or tags (it holds some fair links just under the line, e.g. carbon emissions reduction → 13.3, calculate tax → 17.1, alongside noise). Below 0.55: not shown (0.40–0.55 would put a "potential" link on 167 of 185 skills, mostly noise). **4.4 is the baseline**, shown separately: every skill counts towards it. The thresholds are design choices, stated on screen.
- **Roles:** the two targets matched strongly by most of the role's essential skills (sustainability manager: 12.6 by 13 of 48 skills, 9.4 by 11), with the matching skills listed. No forced links: roles without strong matches show "No strong match to a specific SDG target yet" plus the 4.4 baseline and any possible links. The team-written role links were removed (21 Oct) because they were not backed by data.
- **Goal picker:** goals 7, 8, 9, 12, 13, 16, 17 stay visible; a goal no role matches strongly is disabled with "Only possible matches so far" (13, 16) or "No strong match yet" (7).
- **Where the user sees it:** reasons on each role in Your moves; *Highlight roles linked to a goal* (highlights only, never changes scores); *How this move connects to the SDGs* in Your plan (targets of the skills to build, with counts); the same summed for a team or class in Team view.
- **Goal fit (optional score part G):** the person picks goals on Your moves; they highlight linked roles. With *Count in ranking* on, G = 1 if the role itself links to a picked goal, 0.5 if only some of its essential skills do, else 0; weight 0.2 before rescaling like interests (one optional part on = 1/6 of the score; both = 2/7). Example: Aina picking 12 moves sustainability manager up (test in `src/sdg.test.ts`). Tests in `src/sdg.test.ts`.
- **Honesty:** links show a connection, not a measured impact; the screen states the method and how many AI matches people removed. Rejections drafted with Claude on 21 Oct; team confirmation pending before submission.

## Future Skills Radar (built 21 Oct 2026)

Code: `src/radar.ts`, `src/RadarView.tsx`; tests: `src/radar.test.ts`. Screen: *Future skills radar* (was "Skills in demand · Soon").

- **Per skill** (every essential skill of the nine roles, 185): `D` = average job-ad trend of the roles that list it (DOSM, quarter on quarter), `R` = average AI resilience of those roles (1 − ILO exposure). **Outlook** = (wD·D + wR·R) / (wD + wR) with the scenario weights (Gradually 0.25/0.15, Quickly 0.2/0.3); missing signals share their weight.
- **Groups, not single-skill ranks:** most skills belong to one role and so share its signals exactly (all 45 sustainability-manager-only skills tie). Ranking them 1–45 would be false precision, so skills needed by the same roles form one group (24 groups); groups are ranked. Skills shared by several roles show "shared by n roles".
- **Rising / falling:** every occupation group's job ads fell in 2026 Q2, so absolute change is uninformative; the arrow is the group's rank change from the Q1 to the Q2 snapshot under the same scenario.
- **Bands:** top third green, bottom third red. The person's own skills are ticked, and a summary counts how many fall in the top and bottom thirds (Aina: 14 and 5 of 20).
- **Honesty:** an estimate derived from roles, not a measured demand for each skill; labelled on screen. ESCO green/digital flags shown on skills.

## Where AI is used: RunPod skill search over a real taxonomy

**Decision (21 Oct): RunPod is required and stays in scope.** The GPU work runs on a real, official dataset, so the model only ever *retrieves* existing records and never writes them. Step-by-step jobs, evidence and fallback: [RUNPOD_SETUP.md](RUNPOD_SETUP.md#part-2-project-gpu-work-required). Script: `runpod/embed_esco_skills.py`.

- **Dataset:** ESCO v1.2 (European Commission; about 13,900 skills and 3,000 occupations, each occupation linked to an ISCO-08 code). Official, free, and documented.
- **Model:** an open-weights multilingual embedding model such as `BAAI/bge-m3` (handles English, Bahasa Malaysia and Chinese, which also covers the brief's multi-language good-to-have). Confirm the exact model and record it in the Tools Declaration.
- **Batch job on a RunPod GPU Pod:** embed all 13,960 released ESCO skills (label, up to 8 alternative labels, description) once; save `data/derived/esco/esco-skill-vectors.f16.npy` (≈ 28.6 MB) + `esco-skill-index.json`. About 100,000 label strings in the source make this a real GPU job. Record Pod ID, GPU type and runtime for the declaration screenshot.
- **Runtime on RunPod Serverless:** embed the user's free-text description ("I reconcile bank statements and prepare monthly reports in Excel"), return the nearest ESCO skills with similarity scores. The user ticks which ones are true before matching.
- **Also usable:** map each DOSM/MASCO role title to its nearest ESCO occupation as a check on the hand-made role list.
- **Never:** the model does not create roles, courses, statistics or scores. Every suggested skill is an ESCO record with its URI; scores come only from the rule above.
- **Fallback:** if the Serverless endpoint is down, the user picks skills from a searchable ESCO list; the demo still works, and the batch Pod run already shows RunPod's role.

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
