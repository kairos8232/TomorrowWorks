# TomorrowWorks build checklist

This checklist tracks the hackathon prototype. Complete one stage at a time. Check an item only after the work is present and verified. Commit the stage's implementation and its checklist updates together; split a stage into smaller commits if needed. [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md) defines the broad audience and evidence rules, [SCREENS.md](SCREENS.md) explains each screen, and [BUILD_STAGES.md](BUILD_STAGES.md) lists small commit slices. The ChatGPT reference PDFs stay outside this repository.

## Stage 0 — Repository documents

- [x] Write a README that identifies the project as a planned prototype.
- [x] Record the six Domain 1 features and preliminary submission requirements.
- [x] Add the Apache License 2.0 `LICENSE` file.

Completed in local commit `e4d623a`.

## App functions to build

The product serves people across ages, industries, and career stages. Its public area offers Explore, Workplace changes, Demand, Skills, and Outlook in any order, with industry and search controls. A separate My career action enters the personal area: profile, skill gaps for a chosen promotion or move, role matches, and pathway. The preliminary demo uses a fictional profile after a clearly labelled sign-in placeholder. [PERSONAL_GUIDANCE.md](PERSONAL_GUIDANCE.md) separates public claims from individual advice and records credential evidence rules. The trend signal must affect a recommendation or its explanation. The final product must cover all six required functions below.

| Required function | User action and visible result | Data and behaviour to implement | Stage |
| --- | --- | --- | --- |
| Public market explorer | Browse reported workplace changes, current role demand, skills requested now, and a separately labelled future outlook before entering personal information. | Import at least one updatable public source; show its measure, coverage, geography, original link, publication date, retrieval date, and an honest definition of each trend. News coverage cannot stand in for demand. | 4d, 5–6, 12 |
| Skills profile | After the sign-in entry, enter or edit skills, experience, interests, optional qualifications and work preferences; load a synthetic example and review it before matching. | Validate required input; keep the preliminary demo free of real CVs or personal records. Résumé upload is a later optional intake method. | 4–4e |
| Future-role matching | Ask for suitable roles; see a ranked role list, an explainable score, existing skills, missing skills, and evidence behind each recommendation. | Compare the profile against verified role requirements and let sourced trend signals affect the ranking or explanation. | 7–8 |
| Reskilling pathway | Select a recommended role; see ordered learning steps, time estimates, and verified free or low-cost resources. | Build steps from the displayed skills gap and explain the basis for each estimate. | 10 |
| SDG connection | Open a role or skill and see its linked SDG and a short reason the connection matters. | Review each role and skill mapping; avoid decorative claims. | 11 |
| Future scenarios | Switch between at least two AI-change assumptions and see what changes in roles or pathways. | State each assumption and label the results as estimates. | 12 |

**Supporting functions:** Replit serves the app, RunPod supplies one visible GPU result, and a documented refresh process updates the sourced trend sample. Show a dated snapshot label when the demo is using saved data. If the app calls a live API, keep a clearly labelled snapshot fallback for the demo.

## Stage 1 — Decide the MVP

- [x] Define the intended audience across ages, industries, and career stages; keep Malaysia-first source coverage explicit in [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md).
- [ ] Choose a few industries for the first sourced demo and one synthetic profile case to test matching; do not frame them as the only intended users.
- [ ] Keep the development repository private during the hacking period and plan judge access before submission.
- [x] Decide what runs in Replit and what GPU task runs in RunPod. Replit hosts the app; RunPod embeds the ESCO skill taxonomy and serves skill search ([SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md)).
- [ ] Choose one public, updatable trend source and verify its data, date, and reuse terms. *Chosen: DOSM Job Market Insights; data and release dates verified (Q2 2026 matches the release page). DOSM reuse terms still to check.*
- [ ] Evaluate a news or official-announcement source for workplace issues separately from job-demand evidence.
- [x] Import a small attributed sample and define a repeatable way to refresh it; a live API call is optional. `scripts/import_dosm_jmi.py` → `data/sources/dosm-jmi-2026-q1.json`, `-q2.json`.
- [ ] Review the optional Jooble Malaysia, OpenDOSM, and ESCO uses in [API_PLAN.md](API_PLAN.md) only if they improve the demo.
- [x] Check whether the source measures research activity, actual job demand, or another signal; label it accurately. It measures job offerings advertised online, by occupation major group only; year-on-year change is unreliable, so use quarter-on-quarter.
- [ ] Draw the exact preliminary demo journey and identify which of the six functions are working now versus described in the proposal.
- [ ] Decide whether real sign-in and résumé upload belong after the preliminary demo; document account, consent, storage, and deletion requirements before implementing them.
- [x] Record prototype assumptions, limits, the hardest technical risk, and a demo fallback (risk table in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md)).

**Done when:** A teammate can explain who the demo serves, what it shows, and which source supports it.  
**Commit focus:** MVP scope and source decision.

The minimum source path and optional API roles are in [API_PLAN.md](API_PLAN.md). A sourced, refreshable sample can drive the preliminary demo; the app need not depend on live API access during judging.

## Stage 2 — Prove the RunPod GPU step

- [x] Install the official Runpod Codex skills and plugin; record the local tool status in [RUNPOD_SETUP.md](RUNPOD_SETUP.md).
- [ ] Complete Runpod OAuth in Codex Desktop and verify the connection by listing Pods.
- [x] Choose one small GPU inference task that affects a visible demo result: embed ESCO skills with a multilingual model and return the nearest real skills for a user's own description.
- [x] Create a RunPod Pod or Serverless endpoint and run a minimal request. Job A ran on Pod `40jrr8aulh76tb` (RTX A5000, 92.5 s); output in `data/derived/esco/`. Job B (Serverless) is next.
- [x] Record the model, input, output, runtime, and approximate cost: `BAAI/bge-m3`; ESCO v1.2.1 `skills_en.csv`; 13,960 × 1024 float16 vectors; 92.5 s embedding; Pod at US$0.27/hr for a few minutes, well under US$1.
- [ ] Keep credentials in service secrets; add no keys to the repository.
- [ ] Save the required RunPod evidence for the tools declaration.

**Done when:** The GPU service returns a usable result for the demo and the team can explain its role.
**Commit focus:** RunPod request example, configuration notes, and evidence checklist; no credentials.

## Stage 3 — Set up a runnable Replit app

- [x] Create the smallest runnable app and project structure.
- [x] Add a basic page and navigation for the demo journey.
- [ ] Run the project in Replit and retain proof of its use for the tools declaration. *Runs in Replit Preview from branch `dev` (21 Oct); keep the Replit project link or a later deployment URL as proof.*
- [ ] Call the RunPod GPU step from the Replit backend using a service secret.
- [x] Add exact local run commands to the README.
- [ ] Have another team member follow the run instructions successfully.

**Done when:** The app starts in Replit and can use the RunPod result in a visible demo flow.
**Commit focus:** App scaffold, backend integration, and run instructions.

## Stage 4 — Build profile intake

- [x] Create one synthetic sample profile; use no real CV or personal data.
- [x] Add fields for current skills, experience, and interests.
- [x] Let the user load the synthetic sample profile.
- [x] Let the user edit the profile before asking for recommendations.
- [x] Validate required fields and show useful input errors.
- [x] Display the completed profile for review.
- [x] Carry the reviewed profile into the matching flow without re-entering it.

**Done when:** The sample user can create a profile and continue through the app.  
**Commit focus:** Profile form and synthetic data.

## Stage 4b — Enter personalised guidance

- [x] Start the app on the public market screen and offer an action to begin personalised guidance.
- [x] Add a clearly labelled sign-in entry screen; the preliminary demo continues with a fictional profile and creates no account.
- [x] Add an optional work-preferences or strengths field; do not infer personality or request protected traits.
- [x] Record real accounts and résumé upload as future work requiring decisions on consent, storage, review, and deletion.
- [x] Verify that the visitor can browse first, continue through the demo entry, review the profile, and reach matches without a misleading sign-in claim.

**Done when:** The public-first demo flow works and states plainly that sign-in and résumé upload are not implemented.
**Commit focus:** Split the market-first navigation, demo sign-in entry, and optional profile field into separate commits.

## Stage 4c — Replace the guided journey with browsing

- [x] Remove screen numbers, the journey counter, progress bar, and generic Next/Back controls.
- [x] Give Explore, Demand, Skills, and Outlook independent public destinations reachable in any order.
- [x] Put My career and the demo sign-in entry apart from public browsing; do not make sign-in a numbered destination.
- [x] Keep profile, skill gaps, role matches, and pathway available as personal destinations after demo entry, with task-specific links where helpful.
- [x] Check browser navigation: switch public topics in any order, enter the fictional profile, and return to public browsing.
- [ ] Check the navigation and market cards at a narrow mobile viewport.

**Done when:** The app feels like a market dashboard with optional personal guidance rather than a five-step form.
**Commit focus:** Navigation structure and public destinations; keep sourced content for Stages 5–6.

## Stage 4d — Support cross-industry discovery

- [x] Add Workplace changes as a public destination, with an honest empty state until a source is validated.
- [x] Add industry and keyword controls across public views without requiring a profile or age input.
- [x] Define a reusable evidence record carrying type, industry, title, source link, dates, geography, measure, and coverage.
- [x] Show the selected scope and a useful no-results or no-source state; keep news coverage separate from job demand.
- [x] Verify public navigation and filters, then update the screen guide with actual behaviour.

**Done when:** Anyone can explore the public areas by industry and search term, and unsupported claims remain visibly unavailable.
**Commit focus:** Separate evidence model, browsing controls, and Workplace changes view into small commits.

## Stage 4e — Preview personal skill and credential gaps

- [x] Add optional current certificates or qualifications to the fictional profile and its review.
- [x] Let the person choose a promotion or career-move target and edit an illustrative target-skill list.
- [x] Compare the reviewed profile with that list using a documented, hand-checkable rule; show matched and missing skills without a fabricated readiness percentage.
- [x] Show a separate certificate/qualification section that says when no applicable requirement is verified.
- [x] Keep the preview inside My career and label it as a synthetic, in-memory exercise; verify profile changes update the comparison.

**Done when:** A teammate can review a fictional profile, choose a target, and explain every displayed personal gap without mistaking sample inputs for employer requirements. Source-backed matching, verified credentials, pathway resources, and trend influence remain in Stages 5–12.
**Commit focus:** Profile qualifications and target comparison in separate small commits.

## Stage 4f — Improve the web experience

- [x] At medium and narrow widths, use compact navigation and give the page enough space for its content.
- [x] Put the working personal-demo action near the public introduction; keep source status visible and shorten repetitive card copy.
- [ ] Verify the public landing and personal comparison at phone width, with no horizontal page overflow.
- [x] Verify keyboard navigation, visible focus, form labels, and the fictional profile-to-gap flow.
- [ ] Update [UI_UX.md](UI_UX.md) and [SCREENS.md](SCREENS.md) with actual behaviour after each slice.

**Done when:** The first screen has a clear action and readable topic choices, and the public and personal flows work at narrow widths and by keyboard.
**Commit focus:** Navigation layout, public action hierarchy, and accessibility checks in separate commits.

## Stage 4g — Use available width and reduce scrolling

- [x] Widen desktop content and arrange the four public overview cards across the available width without leaving a single orphan card.
- [x] Shorten medium-screen navigation and intro spacing so the public choices appear sooner.
- [x] Pair related profile fields across the page while keeping labels and helper text readable.
- [x] Show the target editor beside its comparison at wide widths; stack it cleanly on smaller screens.
- [ ] Check the landing page, profile, and comparison for clipping, horizontal page overflow, and keyboard access at narrow and wide widths.
- [ ] Record the actual responsive layout in [UI_UX.md](UI_UX.md) and [SCREENS.md](SCREENS.md).

**Done when:** Wide screens make use of their horizontal space, medium screens show useful content sooner, and phone layouts still fit without sideways page scrolling.
**Commit focus:** Public layout, profile form, and comparison layout in separate small commits.

## Stage 4h — Make text readable at full-screen size

- [x] Increase body copy, navigation, action, label, input, helper, and evidence text sizes; keep a clear heading hierarchy.
- [x] Check the public landing page and personal form at the current medium preview width for readability and sideways overflow.
- [ ] Check the larger-screen typography and phone layout when those viewport previews are available; update [UI_UX.md](UI_UX.md) and [SCREENS.md](SCREENS.md) with verified behaviour.

**Done when:** Important text is comfortable to read at normal browser zoom, and larger type does not clip controls or hide their meaning.
**Commit focus:** Typography change and its verified documentation in one focused commit.

## Stage 4i — Record and apply UI design consistency

- [x] Install Impeccable for Codex in the project and document how to repeat the local install without committing generated tool files.
- [x] Run its rendered design scan at desktop and phone widths; fix verified, focused issues without inventing market evidence.
- [x] Record the observed palette, type hierarchy, layout breakpoints, component states, and content rules in [DESIGN.md](DESIGN.md), with links to the product and screen guides.
- [x] Build the app and verify the public landing page after the change; keep a separate list of untested screens or improvements.

**Done when:** The installed skill can be used locally, the design rules are clear enough to guide another small UI commit, and the documented checks match the rendered site.
**Commit focus:** Tool setup, focused UI fix, and design reference in separate small commits.

## Stage 5 — Add trend signals

- [x] Fetch or import the chosen public source through a repeatable process (DOSM done; ILO and ESCO importers next).
- [x] Store its name, link, publication date, and refresh date (DOSM: `publishedAt` 2026-06-25 for Q1 and 2026-08-18 for Q2, `retrievedAt` 2026-10-21).
- [ ] Convert the source into a small set of skill or role signals using documented rules. *ILO exposure imported (`scripts/import_ilo_exposure.py`, 427 occupations, counts match the paper); rules for D and R are documented, code pending.*
- [ ] Use only public, open, or synthetic data; keep real CVs and personal records out of the demo.
- [x] Add a refresh command or workflow: download the new DOSM data file, then run `python3 scripts/import_dosm_jmi.py <file> <release date> <download date>`.
- [ ] Verify that changed source data changes the stored signals.

**Done when:** The source can be refreshed and the app can trace each signal to it.  
**Commit focus:** Source ingestion, metadata, and refresh process.

## Stage 6 — Build the public market explorer

- [ ] Show supported current demand and skills-needed signals, with future outlook in a separate labelled section.
- [ ] Display the measure, geography, source, publication date, and snapshot date beside each signal.
- [ ] Let the visitor open the original source or its attribution.
- [ ] Explain what “rising” and “declining” mean for the chosen source; label future claims as estimates.
- [ ] Show a clear state for missing or stale data.

**Done when:** A visitor can browse before profiling and see the evidence behind each displayed claim.
**Commit focus:** Public market display and source context.

## Stage 7 — Add explainable role matching

- [x] Define a small, verified set of roles and required skills: 9 ESCO occupations with essential and optional skills in `data/roles.json`, built by `scripts/build_roles.py`.
- [ ] Document the scoring formula and its assumptions.
- [ ] Rank roles for the sample profile.
- [ ] Show existing skills, missing skills, and the reason for each score.
- [ ] Let the user select a role to inspect its skills gap and later open its learning pathway.
- [ ] Link every recommendation to its supporting source and date; do not invent jobs, courses, or statistics.
- [ ] Verify any role-specific certificate or qualification requirement, including jurisdiction, source date, and required/preferred status; keep unknowns visible.
- [ ] Explain that recommendations support a person's career decision and do not make a final hiring decision.
- [ ] Check the results against hand-calculated examples.

**Done when:** A user can understand why roles were ranked in that order.  
**Commit focus:** Matching logic and skills-gap display.

## Stage 8 — Connect trends to recommendations

- [ ] Feed trend signals into the matching logic.
- [ ] Show which signal influenced each recommendation.
- [ ] Change one signal and verify that a score, rank, or explanation changes.
- [ ] Prepare a repeatable before-and-after demo case.

**Done when:** Judges can see that changing trend evidence changes the recommendation or its explanation.  
**Commit focus:** Trend-driven matching and demo case.

## Stage 9 — Submit the preliminary round

- [ ] Confirm the current instructions on the official event channels and submit before **25 October 2026, 7:59:59 AM MYT** through [sdchack.my](https://sdchack.my/).
- [ ] Complete the product requirements document in the official submission template, including the target user, problem, scope, SDG alignment, and a plan for all six required features.
- [ ] Prepare pitch slides covering the problem, solution, technical approach, expected impact, and working demo.
- [ ] Provide an accessible, functional prototype link or build that shows the key feature working; verify it from another device or account.
- [ ] Complete the Technical & Tools Declaration: APIs, datasets, models, cloud services, AI development tools, sponsor resources, and any pre-existing materials actually used.
- [ ] Include Replit proof tied to the team's account and project; include RunPod dashboard evidence with Pod ID, GPU type, and runtime, or the Serverless endpoint URL, tied to the team's account.
- [ ] Provide an accessible GitHub repository with `LICENSE`, small truthful commits, and no exposed secrets; add the committee's designated accounts as collaborators and set the submitted repository public as instructed.
- [ ] Upload a **5–7 minute YouTube pitch video** that demonstrates the working prototype and submit its link.
- [ ] Open every submitted file and link, check the required format and content, and keep the submission receipt or confirmation.
- [ ] Stop changes to submitted materials and repository after the deadline unless the organisers instruct otherwise.

**Done when:** All six preliminary deliverables are submitted on time and accessible to judges.
**Commit focus:** Small documentation and demo fixes before the deadline; never bundle the whole prototype into one late commit.

## Stage 10 — Add a reskilling pathway

- [ ] Order missing skills into learning steps for a selected role.
- [ ] Estimate the time for each step and explain the basis for the estimate.
- [ ] Check each learning-resource link and its price or free-access claim.
- [ ] Display the ordered pathway in the app.
- [ ] Link each learning step back to the missing skill it addresses.

**Done when:** The sample user can follow a practical plan with working resources.  
**Commit focus:** Learning-plan logic and display.

## Stage 11 — Explain SDG connections

- [ ] Map each recommended role to at least one relevant SDG.
- [ ] Map each recommended skill to at least one relevant SDG.
- [ ] Explain each connection in plain language.
- [ ] Remove decorative or unsupported mappings.

**Done when:** The user can understand how the chosen pathway relates to the SDGs.  
**Commit focus:** SDG mappings and explanations.

## Stage 12 — Compare future scenarios

- [ ] Define assumptions for moderate and rapid AI-change scenarios.
- [ ] Let the user switch between scenarios.
- [ ] Show how the recommendations or pathways change.
- [ ] Keep the same profile when switching scenarios so the comparison is understandable.
- [ ] Label forecasts as estimates and explain the uncertainty.

**Done when:** A user can compare at least two plausible outcomes.  
**Commit focus:** Scenario logic and comparison interface.

## Stage 13 — Verify the final product and prepare finalist materials

- [ ] Run the complete profile-to-pathway demo and fix blocking issues.
- [ ] Check mobile layout, accessibility basics, errors, and broken links.
- [ ] Verify every trend, role, course, statistic, and SDG claim shown in the demo.
- [ ] If shortlisted, confirm participation within the announced window and use the upgrading round for permitted refinements.
- [ ] Update the PRD and Technical & Tools Declaration; prepare the Final Solution Report and backup YouTube demo video.
- [ ] Prepare final presentation slides as a `.pptx` file, plus a working demo link, test account, and any needed demo files.
- [ ] Recheck Replit and RunPod evidence, third-party licences, attributions, API keys, and accessibility of all submitted links.
- [ ] Test the live pitch on the team's laptop with the needed display adapter and a backup plan.
- [ ] If shortlisted, prepare for the **31 October** physical hackathon and the **1 November** live pitch: 10 minutes presenting plus 5 minutes for questions; prepare large models and datasets before arriving.
- [ ] If shortlisted, confirm current final instructions and submit the required materials through [sdchack.my](https://sdchack.my/) before **1 November 2026, 7:59:59 AM MYT**.

**Done when:** All six features work, and, if shortlisted, the final materials and demo are ready for judges.
**Commit focus:** Separate small fixes and documentation commits; update checked items with the work they describe.

## Optional improvements after the required functions

These are ideas from the Domain 1 brief, not submission blockers. Pick them only after the required journey works and there is time to verify them.

- [ ] Employer view with a team skills-gap heatmap and group learning plan.
- [ ] Automatic re-planning when a refreshed trend signal changes a recommendation.
- [ ] Additional language support and a low-bandwidth mode.
- [ ] Learner progress tracking or skill badges.
- [ ] Fairness checks for differences related to age, gender, or background.
- [ ] Aggregated SDG contribution view for a person, organisation, or region.

Additional APIs in [API_PLAN.md](API_PLAN.md) are also optional unless Stage 1 selects one as the required updatable source.
