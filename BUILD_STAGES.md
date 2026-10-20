# TomorrowWorks build stages

Use this file to choose the **next small commit**. `CHECKLIST.md` is the status record; `SCREENS.md` defines what users should see; `API_PLAN.md` lists candidate sources. A slice below is a suggested commit boundary, not a claim that its work is complete. Update the relevant checklist items and screen guide in the same commit as the work they describe. Avoid a commit that bundles several slices.

## Working rule for every slice

1. Pick one visible behaviour or one independently reviewable setup decision.
2. Implement or document it, then check only what was actually verified.
3. Run the relevant check: build, source refresh, hand calculation, live request, or teammate walkthrough.
4. Commit the change with its matching `CHECKLIST.md` update. If an external action produces no code change, record its outcome and evidence location in a small documentation commit; never commit credentials or private dashboard screenshots.

The stage numbers below match `CHECKLIST.md`. Some setup can happen while another stage is in progress; do not mark either stage complete until its own “done when” check passes.

## Decisions and infrastructure

| Stage | Small commit slices | Verify before checking the stage |
| --- | --- | --- |
| 0 Repository documents | **Done:** README, licence, and requirements record. | Existing repository documents reflect the actual product state. |
| 1 Decide the MVP | **Done: 1a audience** Record the broad audience and public areas. **1a coverage** Choose a few first-demo industries and one synthetic matching case. **1b** Choose and validate one updatable public trend source and its small attributed sample; assess news separately from demand. **1c** Record how Replit and RunPod fit the journey, assumptions, limits, and fallback. | Another teammate can explain the source's measure, its update date and reuse terms, and which demo result it changes. |
| 2 Prove the RunPod GPU step | **Done: 2-prep** Install official Runpod agent skills and Codex plugin; OAuth and Pod listing remain open. **2a** Specify the model task, input, output, and visible effect on a role match. **2b** Add a minimal request example and run it on a Pod or Serverless endpoint. **2c** Record observed runtime, cost, response, and required evidence without secrets. | A real request returns a useful result; the team can show where that result appears in the app. |
| 3 Run in Replit | **3a** Import the existing GitHub repo into Replit and record the project/run proof. **3b** Add the smallest server endpoint and secret-backed RunPod call. **3c** Connect its result to the screen and document the fallback. **3d** Have a teammate follow the run instructions. | The same repo runs in Replit, the RunPod result affects a visible demo result, and the proof is ready for the tools declaration. |
| 4 Profile intake | **Done:** synthetic form, validation, review, and in-memory profile handoff. Improve individual error messages in a later focused commit if needed. | A teammate can load, edit, and review the sample profile without real personal data. |
| 4b Enter guidance | **Done: 4b-a** Start on a public market shell. **Done: 4b-b** Add an honest sign-in entry with a fictional-demo continuation. **Done: 4b-c** Add optional work preferences or strengths to the profile. | A visitor can browse first, follow the demo entry, and review a synthetic profile without an account claim. |
| 4c Browsing navigation | **Done: 4c-a** Remove the numbered journey and generic next/back controls. **Done: 4c-b** Add independent public Demand, Skills, and Outlook destinations. **4c-c** Separate My career entry and verify navigation; narrow mobile check remains open. | Visitors can switch public topics in any order and enter personal guidance only when they choose it. |
| 4d Cross-industry discovery | **Done: 4d-a** Define industry and evidence records. **Done: 4d-b** Add public industry and keyword controls with clear coverage states. **Done: 4d-c** Add Workplace changes view and source-aware empty state. | Visitors can search and switch covered industries without a profile; news, demand, and forecasts are kept distinct. |
| 4e Personal gap preview | **Done: 4e-a** Add optional current qualifications to the fictional profile. **Done: 4e-b** Compare reviewed skills with an editable illustrative promotion or move target. **Done: 4e-c** Show the certificate evidence state and verify profile edits change the displayed gap. | A teammate can hand-check every displayed gap and tell sample inputs apart from sourced requirements. |
| 4f Web UX | **Done: 4f-a** Give medium-width screens a compact navigation layout. **Done: 4f-b** Bring the working demo action into the first view and tighten public copy. **4f-c** Check phone width and keyboard flow. | The main action and topic choices are easy to find, and no content is clipped at narrow widths. |
| 4g Use page width | **Done: 4g-a** Widen public content, use balanced card columns, and tighten medium-screen navigation and intro. **Done: 4g-b** Pair related profile fields. **4g-c:** The target editor and result use a wide-screen split; phone and wide visual checks remain open. | Less vertical scrolling on wide and medium screens without clipping on phones. |
| 4h Readable type | **Done: 4h-a** Increase small copy throughout the public and personal screens. **Done: 4h-b** Check landing and profile at the 765-pixel preview width. **4h-c** Check wide and phone visual layouts when available. | Navigation, forms, evidence notes, and cards can be read at normal browser zoom. |
| 4i Design consistency | **Done: 4i-a** Install Impeccable locally and document repeatable setup. **Done: 4i-b** Fix verified landing-page contrast and hierarchy issues. **Done: 4i-c** Record existing visual rules in `DESIGN.md` and verify the build. | Another small UI change can follow the same documented visual and product rules. |

The first practical Replit check can happen before the RunPod endpoint exists. That check completes only the Replit import slice of Stage 3. The RunPod integration items remain open until a real response is shown in the app.

## Preliminary product journey

| Stage | Small commit slices | Verify before checking the stage |
| --- | --- | --- |
| 5 Trend signals | **Done: 5a** DOSM Q1 and Q2 2026 snapshots with link, release and retrieval dates (`scripts/import_dosm_jmi.py`). **Done: 5b** ILO Table A1 importer → `data/sources/ilo-genai-exposure-2025.json`. **5c** ESCO importer for the selected roles' essential skills → `data/roles.json`, labelled as adapted from ESCO. **5d** Signal rules (demand `D`, resilience `R`) in code with a changed-input check (Q1 vs Q2). | The refresh can be repeated, and changed input produces changed stored signals. |
| 6 Public market | **6a** Display sourced current demand and requested skills. **6b** Add a separately labelled future outlook, signal definitions, and attribution links. **6c** Add empty, stale, and unavailable states. | Visitors can browse first, and every market claim can be traced to its source, measure, geography, and date. |
| 7 Role matches | **7a** Add a small verified role-to-skill set. **7b** Implement a documented, hand-checkable score. **7c** Show ranked role cards, matched/missing skills, and reasons. **7d** Add role selection and the skills-gap detail. | The sample profile produces a ranking that a teammate can calculate and explain. |
| 8 Trends affect matches | **8a** Feed the stored signals into the documented ranking or explanation. **8b** Show the specific signal beside each affected result. **8c** Save a repeatable before/after demo case. | Changing one sourced signal visibly changes a score, order, or explanation. |
| 9 Preliminary submission | **9a** Complete the PRD. **9b** Prepare pitch slides. **9c** Verify the Replit prototype and record Replit/RunPod tools evidence. **9d** Complete the video and tools declaration. **9e** Check repository access, submitted links, and receipt. | All six required deliverables are accessible and submitted by the handbook deadline. Keep non-repository submission files in their intended location, separate from code. |

For the preliminary build, the key working slice is Stages 4–8, including 4b's demo entry. The proposal can describe real account and résumé handling and Stages 10–12 while they are still planned; do not present those functions as complete.

## Full product and finalist work

| Stage | Small commit slices | Verify before checking the stage |
| --- | --- | --- |
| 10 My pathway | **10a** Verify a few learning resources and estimate rules. **10b** Generate ordered steps from a selected role's missing skills. **10c** Show the steps, time basis, and resource links on the pathway screen. | Each step addresses a displayed gap, and its resource and access claim work. |
| 11 SDG connections | **11a** Review and record role and skill mappings with reasons. **11b** Display those reasons on the pathway or role detail. | Every visible SDG link has an understandable, reviewed reason. |
| 12 Future scenarios | **12a** Define moderate and rapid assumptions. **12b** Calculate the difference for the same profile. **12c** Add a labelled switch and explanation on role/pathway screens. | A user can see what assumption changed and why the output differs. |
| 13 Final verification | **13a** Fix one blocking journey issue per commit. **13b** Audit accessibility, mobile layout, links, and claims in focused passes. **13c** Update finalist declarations and report. **13d** Prepare slides and live demo evidence if shortlisted. | The full journey works and the required final materials match the actual implementation. |

## Next selection (updated 21 Oct 2026)

Preliminary deadline: **Sun 25 Oct, 7:59 AM MYT**. Aim to submit on **Sat 24 Oct night**. UI polish (4c, 4f–4h leftovers) waits until the core slice works.

| Day | Slices | Done when |
| --- | --- | --- |
| Wed 21 | ~~5b ILO importer~~ (done) · 5c ESCO roles · 7a–7b scoring module with the worked-example test · ~~3a import repo into Replit~~ (done; keep the project link as proof) · ~~**2a RunPod Job A**~~ (done: RTX A5000, 92.5 s) | `npm test` passes the hand-checked example; app runs in Replit; RunPod Pod run done and screenshot saved. |
| Thu 22 | 7c role cards with score breakdown · 8a–8c Q1/Q2 snapshot switch · 12a–12c moderate/fast scenario switch · source footer with ESCO acknowledgement · deploy on Replit | Same profile shows different scores when the snapshot or scenario changes; every number links to its source. |
| Fri 23 | 2b–2c RunPod Job B: Serverless `bge-m3` endpoint, searchable-list fallback · 3b–3c call it from the Replit backend · 11a SDG links (ESCO green skills + reviewed role mapping) · 10a–10c short pathway with verified free resources | Typing a description returns real ESCO skills; Pod ID, GPU and runtime recorded. |
| Sat 24 | 9a PRD · 9b slides · 9c–9d Tools Declaration (Replit + RunPod evidence, ESCO/ILO/DOSM credits) and 5–7 min video · 9e repo public, default branch, committee collaborators | All six deliverables open correctly from another device. |
| Sun 25 | Submit before 7:59 AM; no commits after. | Submission receipt saved. |

If a day slips, drop in this order: pathway detail (10) → SDG polish (11b) → visual polish. **RunPod is never dropped** (team decision): Job A runs on Wednesday so its evidence exists early, and Job B keeps a fallback but stays in the build. Never drop the snapshot switch either: it is the feature judges score most.
