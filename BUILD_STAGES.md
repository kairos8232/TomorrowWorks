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
| 2 Prove the RunPod GPU step | **2a** Specify the model task, input, output, and visible effect on a role match. **2b** Add a minimal request example and run it on a Pod or Serverless endpoint. **2c** Record observed runtime, cost, response, and required evidence without secrets. | A real request returns a useful result; the team can show where that result appears in the app. |
| 3 Run in Replit | **3a** Import the existing GitHub repo into Replit and record the project/run proof. **3b** Add the smallest server endpoint and secret-backed RunPod call. **3c** Connect its result to the screen and document the fallback. **3d** Have a teammate follow the run instructions. | The same repo runs in Replit, the RunPod result affects a visible demo result, and the proof is ready for the tools declaration. |
| 4 Profile intake | **Done:** synthetic form, validation, review, and in-memory profile handoff. Improve individual error messages in a later focused commit if needed. | A teammate can load, edit, and review the sample profile without real personal data. |
| 4b Enter guidance | **Done: 4b-a** Start on a public market shell. **Done: 4b-b** Add an honest sign-in entry with a fictional-demo continuation. **Done: 4b-c** Add optional work preferences or strengths to the profile. | A visitor can browse first, follow the demo entry, and review a synthetic profile without an account claim. |
| 4c Browsing navigation | **Done: 4c-a** Remove the numbered journey and generic next/back controls. **Done: 4c-b** Add independent public Demand, Skills, and Outlook destinations. **4c-c** Separate My career entry and verify navigation; narrow mobile check remains open. | Visitors can switch public topics in any order and enter personal guidance only when they choose it. |
| 4d Cross-industry discovery | **Done: 4d-a** Define industry and evidence records. **Done: 4d-b** Add public industry and keyword controls with clear coverage states. **Done: 4d-c** Add Workplace changes view and source-aware empty state. | Visitors can search and switch covered industries without a profile; news, demand, and forecasts are kept distinct. |
| 4e Personal gap preview | **Done: 4e-a** Add optional current qualifications to the fictional profile. **Done: 4e-b** Compare reviewed skills with an editable illustrative promotion or move target. **Done: 4e-c** Show the certificate evidence state and verify profile edits change the displayed gap. | A teammate can hand-check every displayed gap and tell sample inputs apart from sourced requirements. |
| 4f Web UX | **Done: 4f-a** Give medium-width screens a compact navigation layout. **Done: 4f-b** Bring the working demo action into the first view and tighten public copy. **4f-c** Check phone width and keyboard flow. | The main action and topic choices are easy to find, and no content is clipped at narrow widths. |
| 4g Use page width | **Done: 4g-a** Widen public content, use balanced card columns, and tighten medium-screen navigation and intro. **Done: 4g-b** Pair related profile fields. **4g-c:** The target editor and result use a wide-screen split; phone and wide visual checks remain open. | Less vertical scrolling on wide and medium screens without clipping on phones. |
| 4h Readable type | **Done: 4h-a** Increase small copy throughout the public and personal screens. **Done: 4h-b** Check landing and profile at the 765-pixel preview width. **4h-c** Check wide and phone visual layouts when available. | Navigation, forms, evidence notes, and cards can be read at normal browser zoom. |

The first practical Replit check can happen before the RunPod endpoint exists. That check completes only the Replit import slice of Stage 3. The RunPod integration items remain open until a real response is shown in the app.

## Preliminary product journey

| Stage | Small commit slices | Verify before checking the stage |
| --- | --- | --- |
| 5 Trend signals | **5a** Store one permitted, dated source sample with original link and retrieval date. **5b** Implement and document the rule converting source fields to signals. **5c** Add a repeatable refresh command and a changed-input check. | The refresh can be repeated, and changed input produces changed stored signals. |
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

## Next selection

Improve the narrow layout and public action hierarchy in **4f**, then validate sources in **1b** before showing employer requirements or news claims. Finish the narrow mobile check in **4c**. Replit import **3a** can be done as soon as the repo is ready, while the RunPod request and backend connection remain separate slices.
