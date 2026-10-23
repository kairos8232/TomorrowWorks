# TomorrowWorks build checklist

This checklist tracks the hackathon prototype. Complete one stage at a time. Check an item only after the work is present and verified. Commit the stage's implementation and its checklist updates together; split a stage into smaller commits if needed. [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md) defines the broad audience and evidence rules, [SCREENS.md](SCREENS.md) explains each screen, and [BUILD_STAGES.md](BUILD_STAGES.md) lists small commit slices. The ChatGPT reference PDFs stay outside this repository.

## UI refinement — 21 Oct 2026

- [x] Put the viewer's Career path or For organisations section before Job market in desktop and mobile workspace navigation, and add the workspace-style bottom divider to the Home header. Check Home, Aina, and Puan Rosnah in the live browser; production build passes.
- [x] Simplify Region view's purpose section: remove connector arrows and repeated audience copy, tighten the three cards, and let the main question use the full panel width. Review the desktop reference and responsive CSS; production build passes.
- [x] Show Career path only for individual viewers and For organisations only for team/region viewers in desktop and mobile workspace navigation. Check Aina, Puan Rosnah, Encik Lim, and Encik Faizal in the live desktop view, including returning from Job market without changing the viewer; production build passes.
- [x] Show the selected viewer's name above a small Individual, Team, or Region label in the View as switcher. Verify Puan Rosnah and Encik Lim in the live desktop Team view, check the responsive switcher rules, and run the production build.
- [x] Group Your plan's skill gaps in one panel so checked courses and uncovered skills read as one learning task. Check Aina's Bookkeeper plan at desktop and 390 px; build passes.
- [x] Give the first checked course a clear View course action, and number course steps only when there is more than one. Check Aina's plan at desktop and 390 px; build passes.
- [x] Trim Your plan: combine uncovered skills and unverified AI suggestions, show four rows initially with all gaps available, shorten checked-course details and method, use the compact SDG summary, and condense certification titles and copy. Check Hakim's plan at desktop and 390 px, verify *Show all 13*, build and all 62 tests.
- [x] Clarify SDG 4.4 in Team view: show the count of all gap skills separately from the ESCO digital subset, and let the method note use the full panel width. Check Puan Rosnah and Encik Lim at desktop plus Encik Lim at 390 px; build and tests pass.
- [x] Condense Team view's SDG section: merge repeated targets, show linked gap counts, and keep full skill names in Shared gaps. Check the Accountant target at desktop and 390 px; build, tests and CSS scan pass.
- [x] Keep empty Your moves and Your plan states focused on adding the visitor's skills; remove the Aina detour while leaving sample profiles in View as. Check both pages and the Add skills destination in the live browser, including the 390 px Malay layout; build and all 62 tests pass.
- [x] Replace repeated Your moves disclosures and row expanders with focused role, comparison and method views; keep source explanations in one method view and direct links beside role facts. Check desktop and 390 px layouts, then run build and tests.
- [x] Show personalisation alongside the job-ad and AI controls; refresh the navigation rail with shorter labels and a soft active state. Build, tests and static CSS scan passed; the later browser pass checked the rail at 1440 and 390 px.
- [x] Separate empty-state actions, arrange job/manual search beside work description on wide screens, shorten the Me switcher, and make language a compact icon control. Check the live 1440 and 390 px layouts plus the Malay header at 320 px; build and all 62 tests pass.
- [x] Use the sidebar as the career step navigation; remove the repeated step strip above the page.
- [x] Shorten first-visit and skill-entry copy, bring the selected-skill action and expanded-role plan action next to their context, and collapse optional explanations and ranking preferences.
- [x] Use wide Home columns and compact phone move rows; inspect Home and Your plan at 1440 px, Home, Your skills, Your moves and Your plan at 390 px, and the Malay Home header at 320 px. Check Malay and Chinese phone navigation.
- [x] Run `npm run build` and `npm test` after the refinement (60 tests passed); run Impeccable layout detection (no findings).

## Learner motivation — evidence-link preview (22 Oct 2026)

- [x] Replace reflection/activity controls with fictional public credential-link submission on individual courses. Support format validation, edit/cancel/remove, and explicit unverified status.
- [x] Show accessible evidence-submission bar; keep it separate from verified completion and skills. Preserve memory-only privacy and viewer separation; no files or reviewer integration.
- [x] Build and 84 tests pass. Desktop/phone Edge checks cover invalid URLs, checked/AI submissions, editing/removal, counts, navigation, role/learner separation, refresh, translated fit and Team/NOSS exclusions.
- [x] Step 2: clear verified-course completion count and accessible progress bar, separate from submitted evidence; explain course completion versus skill mastery. Build and 84 tests pass; Edge desktop/phone, translated fit, evidence changes and unchanged completion bar checked.
- [x] Step 3: next-course Start/Continue action using existing plan order, visible provider, AI provenance and session-only visited-link tracking. Completion verification remains disconnected; clicks give no completion credit. Build, 84 tests and desktop/phone browser checks pass.
- [x] Add Change course with warning and explicit confirmation; preserve evidence and link history. Choices are learner/role-specific, in-memory only. Build, 84 tests and desktop/mobile browser interaction checks pass.
- [x] Step 4 corrected: remove self-report controls/state; badges unlock only from authoritative verified completion. Verification is not connected, so both remain locked. Distinct medal/trophy illustrations, richer green/gold cards and lock-status chips added; desktop/phone preview checked.
- [x] Build, 88 tests and Edge desktop/phone checks pass; evidence cannot unlock badges, no self-report UI, role changes and translated fit checked.
- [ ] User review of revised step 4 badge preview; team translation review; provider/reviewer integration before live unlocking.
- [ ] Team review of new translations.
- [ ] Decide real evidence storage, consent, access and deletion before file uploads or real credentials.
- [ ] Provider/authorised-reviewer verification before completion claims or badges.

## Your plan usability — 22 Oct 2026

- [x] Rebuild Your plan around one featured course and a list of other courses, with no duplicate listing. Move the completion limitation below the courses, group milestones/certification/funding as supporting information, and place SDG links below the learning route. Check Aina's Bookkeeper route in English and Malay at wide and medium widths, including switching the featured course; build and 114 tests pass.
- [x] Put the next course before progress, keep courses together, then show two milestone cards with small award icons and a separate optional SKM certification card. Check Aina's Bookkeeper plan and unlock details in the live desktop browser; build and all 114 tests pass.
- [x] Prioritise course progress and learning action; move compact badges after courses; shorten repeated copy. Collapse optional evidence, funding, method and exact badge rules while preserving visible unverified status and demo limitations.
- [x] Build and 88 tests pass. Edge desktop/phone screenshots and keyboard evidence interaction, URL validation/submission/removal, course modal, disclosures, role changes and translated fit checked. Verification behaviour unchanged.
- [ ] User review of the simplified whole-page preview; team review of new translations.

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
- [ ] Call the RunPod GPU step from the Replit backend using a service secret. *Server code done and tested with a local fake endpoint (`server/index.mjs`); live endpoint and Replit Secrets pending.*
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

**Done when:** The public-first demo flow works and states plainly that sign-in and saved accounts are not implemented.

- [x] CV upload or paste on *Your skills* (22 Oct): read in the browser, contact lines removed, lines shown before sending, matched on RunPod via `/api/cv-skills`, user ticks skills; nothing stored. Tested with a fictional PDF against a local stand-in for RunPod (`src/cv.test.ts`, `server/search.test.mjs`).
- [ ] Check CV matching quality on the live app with real RunPod (fictional sample CV and one fictional PDF); adjust the 0.55 minimum if location or company lines produce nonsense matches.
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

## Stage 4j — First-visit clarity (21 Oct 2026)

- [x] Home says who the app is for, what it does and how it works (3 steps), with two clear starts: *Try it as Aina* (fictional sample) and *Start with my own skills*.
- [x] One guided flow: 1. Your skills (RunPod search + list, current job) → 2. Your moves → 3. Your plan (soon), with a step bar; the old free-text profile, skill-gap and sign-in screens removed.
- [x] Plain-language "How ranking works" view on Your moves; DOSM, ILO and ESCO linked once.
- [x] Empty views marked "Soon" with a short note.
- [x] Checked at 1440 px and 390 px in a browser; no horizontal scroll; no page errors.

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

- [x] Anthropic Economic Index imported in Replit (22 Oct, commit 02d000f): all 8 SOC codes have tasks (2010 O*NET codes for software developer and data analyst); AI impact page values and futures checked in code. Still to look at on the live page after republishing.
- [ ] Show supported current demand and skills-needed signals, with future outlook in a separate labelled section. *Demand (DOSM, 9 occupation groups) and Outlook (ILO exposure for the 9 roles) are live; Skills view still empty.*
- [x] Display the measure, geography, source, publication date, and snapshot date beside each signal.
- [x] Let the visitor open the original source or its attribution. *(22 Oct: Signal sources page links every source with its date.)*
- [ ] Explain what “rising” and “declining” mean for the chosen source; label future claims as estimates.
- [ ] Show a clear state for missing or stale data.

- [x] **6d** *(imported 21 Oct: 97 headlines from Malaysian outlets, seen 18–21 Oct 2026; tagged in English, Malay and Chinese; Carson runs the script on his Mac)* Import a dated snapshot of Malaysian workplace news from the GDELT DOC API (headline, outlet, date, link, topic tag) with a refresh script; show it on Workplace changes, labelled as reported issues that do not affect scores.
- [x] **6e** *(snapshot imported by Carson 21 Oct: 13 months to Aug 2026, 2.9% unemployment)* Show the latest OpenDOSM monthly Labour Force Survey figures (`lfs_month`) as context on Demand, with the month and source.

**Done when:** A visitor can browse before profiling and see the evidence behind each displayed claim.
**Commit focus:** Public market display and source context.

## Stage 7 — Add explainable role matching

- [x] Define a small, verified set of roles and required skills: 9 ESCO occupations with essential and optional skills in `data/roles.json`, built by `scripts/build_roles.py`.
- [x] Document the scoring formula and its assumptions (SIGNALS_AND_MATCHING.md; implemented in `src/scoring.ts`).
- [x] Rank roles for the sample profile (`recommendMoves`: current job shown separately; moves ranked with exact and transferable skills).
- [x] Show existing skills, missing skills, and the reason for each score (Role matches screen: breakdown bars, held / transferable / missing skills, DOSM and ILO reasons).
- [x] Let the user select a role to inspect its skills gap and later open its learning pathway. (*Plan this move*.)
- [ ] Link every recommendation to its supporting source and date; do not invent jobs, courses, or statistics.
- [ ] Verify any role-specific certificate or qualification requirement, including jurisdiction, source date, and required/preferred status; keep unknowns visible.
- [ ] Explain that recommendations support a person's career decision and do not make a final hiring decision.
- [x] Check the results against hand-calculated examples (`npm test`: worked example 0.5275 / 0.531, weight redistribution, real DOSM D values).

**Done when:** A user can understand why roles were ranked in that order.  
**Commit focus:** Matching logic and skills-gap display.

## Stage 8 — Connect trends to recommendations

- [x] Feed trend signals into the matching logic.
- [x] Show which signal influenced each recommendation (DOSM group counts and change, ILO score on every card).
- [x] Change one signal and verify that a score, rank, or explanation changes (Q1 ↔ Q2 switch: accountant 51 → 45 fast; verified in a browser).
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

- [x] Order missing skills into learning steps for a selected role. (`src/pathway.ts`: greedy, most gaps closed first; tested)
- [x] Estimate the time for each step and explain the basis for the estimate. (Provider-stated study time only; no stated hours is shown as such.)
- [x] Check each learning-resource link and its price or free-access claim. (11 free courses opened on the provider page, 21 Oct 2026.)
- [x] Display the ordered pathway in the app. (3. Your plan; checked at 1280 px and 390 px.)
- [x] Link each learning step back to the missing skill it addresses. (*Builds* tags on each step.)

- [x] **10d** For each role, look up a matching NOSS (JPK) by hand and record code, title, SKM level and link, or "no matching NOSS found"; show it as the Malaysian certification route without claiming it is required.
  - Done 21 Oct 2026 in `data/pathway/noss.json` from the current JPK register (Daftar Standard, 22 Jan 2025, supplied by Carson; page numbers recorded). Close: billing clerk, accounting assistant, bookkeeper → FB-100-3/4:2012 Perakaunan; data analyst → IT-082-4/5:2016 Data Mining; software developer → J620-002-4/5:2020 Front-End / Full Stack, IT-010-3:2016. Related: accountant → FB-100-5:2012; financial analyst → K661-004-4/5:2025 Financial Paraplanning; sustainability manager → M711-005-5:2019 Energy Audit Management. None: business analyst.

**Done when:** The sample user can follow a practical plan with working resources.  
**Commit focus:** Learning-plan logic and display.

## Stage 11 — Explain SDG connections

- [x] Map each recommended role to at least one relevant SDG. (`data/sdg/sdg-links.json`: 1–2 targets per role, reason tied to its ESCO essential skills.)
- [x] Map each recommended skill to at least one relevant SDG. (Rules in `src/sdg.ts`: wording + ESCO green/digital flags; every skill also counts towards 4.4.)
- [x] Explain each connection in plain language. (Reason shown with every role link and every skill rule.)
- [x] Remove decorative or unsupported mappings. *(22 Oct: only links two reviewers labelled relevant are shown as strong.)* *Skill links now from RunPod matches ≥ 0.60 with 34 of 73 rejected in `data/sdg/sdg-review.json` (drafted with Claude 21 Oct); team-written role links removed; strong/possible/baseline levels; per-match rejected/uncertain decisions; validation via the blind review kit in `data/sdg/review/` (item below).*
- [x] Blind SDG review *(done 22 Oct by two teammates: `data/sdg/review/results.md`, kappa 0.48 / 0.69; labels applied in `sdg-review.json`, status team-reviewed)*. Quote the numbers in the PRD (see PRD item).
- [ ] (Optional) Run `scripts/calibrate_sdg_osdg.py` (OSDG Community Dataset) for goal-level accuracy on independent text; can run in Replit Shell (key in Secrets) instead of the Mac.

**Done when:** The user can understand how the chosen pathway relates to the SDGs.  
**Commit focus:** SDG mappings and explanations.

## Stage 12 — Compare future scenarios

- [x] Define assumptions for moderate and rapid AI-change scenarios. *(22 Oct: scenario assumptions on screen; 1,000-futures simulator with ILO SD, score ranges, tipping point and 'estimates, not predictions' note; `src/futures.test.ts`.)*
- [x] Let the user switch between scenarios (moderate / fast; fast lifts sustainability manager from 6th to 4th).
- [x] Show how the recommendations or pathways change. (Your moves: arrows after a switch, and *What changed* comparing the Q1 and Q2 snapshots with the job-ad reason.)
- [x] Keep the same profile when switching scenarios so the comparison is understandable.
- [x] Label forecasts as estimates and explain the uncertainty. *(22 Oct: scenario assumptions on screen; 1,000-futures simulator with ILO SD, score ranges, tipping point and 'estimates, not predictions' note; `src/futures.test.ts`.)*

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

- [x] Simplify Your plan to a single course choice and action, short skill list, and compact certification, goal, and milestone facts. Remove the repeated course cards and long on-page explanations; check desktop and phone layouts (22 Oct 2026).
- [x] Draw the homepage route progressively as one line from beyond the left screen edge to beyond the right, then clear and choose a different route for the next trace. Keep it within the hero and check wide and phone layouts, reduced motion, and offscreen pause.

These are ideas from the Domain 1 brief, not submission blockers. Pick them only after the required journey works and there is time to verify them.

- [ ] Employer view with a team skills-gap heatmap and group learning plan.
- [ ] Automatic re-planning when a refreshed trend signal changes a recommendation.
- [x] Additional language support and a low-bandwidth mode. (EN/BM/中文 on every screen, translations still to be reviewed; 22 Oct: screens after the first steps load on demand, server sends gzip and caches built files for a year, first visit measured at 229 KB through `server/index.mjs` (was about 1.1 MB uncompressed); *Low-data mode* switch in the account menu (starts on when the device asks to save data) skips the web font and live news/labour-force requests.)
- [ ] Learner progress tracking or skill badges.
- [x] Fairness checks for differences related to age, gender, or background. (No such inputs exist; `src/fairness.test.ts` proves same skills → same scores; the focused "How ranking works" view states the limits.) 22 Oct: identity filter `server/identity.mjs` removes common name/age/identity phrases in the browser before the skill search and CV matcher (tests in `server/identity.test.mjs`); *How ranking works* cites Wilson & Caliskan 2024 and MOSTI AIGE 2024.
- [x] First fairness audit run on RunPod (22 Oct, `c5cf6ae`): identity cues kept 6.13 of the top 10 skills on average (first suggestion unchanged 46%); ethnicity cues pulled language skills in ("Chinese" → *understand written Malay*, *write Malay*). No neutral control yet, so the shift cannot be attributed to identity.
- [x] Fairness audit re-run with control (22 Oct, `3d9da3a`): identity cues kept 6.13 of 10, neutral control 6.2 (so the overall shift is from added words, not identity); but ethnicity cues pulled 63 language skills into the top 10 over 36 queries (3 cues × 12 descriptions) versus 0 for the control. Gender pair overlap 8.5 of 10 vs 5.8 between neutral pairs: no gender disparity seen.
- [ ] Decide whether to widen `server/identity.mjs` (two of six held-out ethnicity/gender phrasings still pass through) and write a fresh held-out set if so.
- [x] Aggregated SDG contribution view for a person, organisation, or region. (Your plan: per person; Team view: per team or class; Region view (22 Oct, for a regional skills centre; managers see only their own group, the centre sees totals with no names): three fictional groups, 12 people, added up person by person with the Your plan rule, plus second/third moves that would add targets. No state statistics: open state-by-occupation data is not published.)

Additional APIs in [API_PLAN.md](API_PLAN.md) are also optional unless Stage 1 selects one as the required updatable source.
