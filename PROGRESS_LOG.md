# Progress log

## 22 Oct 2026 — Whole Your plan page usability pass

- User requested friendlier UI and selected Whole Your plan page. Simplified visible intro/progress copy, kept progress then next Start/Continue action, added Your courses heading, moved compact medal/trophy badges after courses. Optional evidence, funding, selection method and badge earning rules use labelled native disclosures.
- Evidence summary always identifies submission as unverified; expanded form retains fictional-only privacy note before input. Verification-unavailable notice remains visible in progress; deeper count/mastery/privacy limits remain under How progress works. Evidence validation/state, warning modal, provider links, plan data/scoring and locked badges unchanged. New EN/MS/ZH text requires team review.
- Build and 88 tests pass. Existing Edge/puppeteer desktop 1440 × 1000 and phone 390 × 844: order, initially collapsed optional evidence, keyboard opening, bad/good URL, save/remove, completion stays zero, badges locked, change-course modal, badge/funding disclosures, Accountant plan and translated phone fit pass. Screenshot review complete. No page errors; existing favicon 404 excluded. Screenshots outside repo. No new packages; not committed/pushed; await user preview.

---

## 22 Oct 2026 — More attractive milestone artwork

- User requested more attractive badges. Replaced small shared emblems with distinct star-medal/ribbon and trophy SVG artwork, larger centred awards, green/gold card tints and lock chips. Locked status stays explicit; no earned-state data or verification behaviour changed.
- Build and 88 tests pass. Edge desktop/phone screenshots and EN/MS/ZH fit reviewed; locked state, no self-report UI, evidence not unlocking badges and unchanged verified progress checked. No new packages or image assets; not committed/pushed.

---

## 22 Oct 2026 — Remove self-reporting; sharper verified-only badges

- User rejected self-report controls and requested badges light only from course detection/verification. Removed all completion-report state and controls, and active self-report copy. Badges now depend only on a verified-course set. No actual provider/reviewer detector exists: the current set is deliberately empty and UI explicitly says verification is not connected. No fake unlocks from links or clicks.
- Stronger borders, angular medal emblems and textual Locked/Unlocked states; earned styling uses ledger green. Eligibility rule handles first verified course across plans and every unique selected-plan course, excluding empty plans and optional NOSS. Skill mastery remains separate.
- Build passes. An over-broad field rename initially broke three test assertions; corrected their completed field, then all 88 tests pass. Edge desktop/phone checks confirm no self-report UI, both locked, evidence not unlocking/advancing verified progress, role changes and EN/MS/ZH fit; no page errors. Screenshots outside repo. Translation team review pending. Not committed/pushed; await review.

---

## 22 Oct 2026 — Step 4: self-reported learning milestones

- User explicitly requested First course completed and Selected plan’s courses completed as self-reported milestones, with exact earning rules; skill badges require separate assessment and are not added. Added clearly labelled course-report checkboxes separate from evidence submission and the verified bar.
- First badge needs at least one report by the current learner in the session; plan badge needs all unique current-plan course URLs, checked plus AI suggestions including hidden courses, excluding NOSS; empty plans never earn. Reversible reports and role changes recalculate eligibility; no generated claims, assessments, automatic skills, verified completion or ranking changes.
- State stays in App memory per actual profile owner. Shared course URLs carry reports across roles; viewers stay separate; refresh clears reports. New EN/MS/ZH copy has the usual pending team review. Earned/not-earned text carries status as well as colour.
- Production build and 88 tests pass, including four milestone rules. Edge at 1440 × 1000 / 390 × 844: evidence alone earns nothing; first report and all reports earn appropriate badges; removing reports revokes eligibility; verified bar stays zero; keyboard, navigation, learner/role changes, refresh, certification/Team exclusions and translated fit pass. No page errors. Screenshots and tooling outside repo; no new packages. Branch kit-yiu, not committed/pushed; await preview feedback.

---


## 22 Oct 2026 — Course switching with a confirmation warning

- User requested a course-change button and warning before replacing current/next learning. Added native dialog with actual selected-plan courses, a warning, Cancel and Confirm. Draft selection does not change the panel until confirmed. Same-course confirmation is disabled; Escape cancels and browser focus returns to the trigger.
- Confirm updates course title/provider/Start-Continue URL. Choices are per profile owner and role, survive navigation/role switching and clear on refresh. Valid explicit selection takes priority over default first-without-evidence rule, allowing revisit; stale choices fall back to the current plan. Header now names the role. Existing evidence, visits, ranking and completion remain unchanged.
- Build and 84 tests pass. Edge desktop 1440 × 1000 / phone 390 × 844: warning, draft/cancel/Escape/confirm, modal focus restoration, provider URL, Start/Continue, evidence retention, completion zero, navigation, role/viewer separation, refresh, EN/MS/ZH modal fit and no page errors checked. No new packages. Translation team review pending. Screenshots outside repo; not committed/pushed; awaiting preview.

---


## 22 Oct 2026 — Step 3: useful next learning action

- User requested Start/Continue guidance with visible provider links. Panel follows existing checked-first plan order and selects the first course without submitted evidence. This is a transparent proxy, not a claim to know external course completion. Course/provider links remain visible and AI suggestions retain their unverified label.
- Start changes to Continue only after opening a provider link this session (also through a card's View course action). Continue reopens the provider page, not a saved lesson position. Visited URLs stay in memory per learner, survive navigation and role changes, clear on refresh, and never change completion/evidence counts, skills, ranking or SDG claims.
- Evidence for all courses produces a clear unverified-completion notice; removing evidence restores the earlier next course. No next card with zero courses; Team view unchanged. EN/MS/ZH added, team review pending.
- Build and 84 tests pass. Existing Edge via puppeteer-core, desktop 1440 × 1000 / phone 390 × 844: correct URL/label, Start→Continue, no credit from clicks, navigation, learner separation, translated fit and 44px action size, AI fallback, all-evidence state, removal, target changes, Team exclusion and refresh pass. No page errors; screenshots outside repo. Work on kit-yiu, not committed or pushed; await preview feedback.

---


## 22 Oct 2026 — Step 2: clear course-progress summary

- User clarified step 2 is the completed-course count and accessible progress bar, with mastery kept separate. Added Your course progress: 0 of N courses verified complete, plus a distinct evidence-submission count. Completion is explicitly zero until provider/reviewer verification exists; no fabricated completed state or user-set completion. Course total includes checked/AI courses and hidden suggestions, deduplicated by URL; excludes optional certification.
- Native progress has a count label and method description; summary explains verified course completion is distinct from mastery of mapped skills. EN/MS/ZH text added; team translation review pending.
- Build and all 84 tests pass. Existing Edge/puppeteer preview at 1440 × 1000 and 390 × 844: evidence submit/edit/cancel/remove counts update but completed count/bar stays zero; accessible label/description checked; navigation, role/viewer separation, translated phone fit, refresh and Team/NOSS exclusions pass. No page errors; pre-existing favicon excluded. Screenshots outside repo. No commit or push for this step; await user preview.

---


## 22 Oct 2026 — Credential-link evidence prototype replaces reflections

- User proposed certificates/proof after rejecting reflection usefulness, then approved trying a fictional public credential-link submission prototype. File uploads remain disabled; no real certificates or personal data. Previous activity and quiz entries are superseded.
- Every individual checked/AI course supports submit/edit/cancel/remove. HTTPS URL syntax is checked, not existence, issuer, identity, authenticity or relevance. UI says Evidence submitted — not verified and explicitly states there is no reviewer delivery. Progress counts submitted links per unique current-plan course URL; removing reduces it. No completion badge or skill/scoring change.
- Links remain memory-only per profile owner and clear on refresh. No link fetching, API, new dependencies, accounts or storage. Real uploads require separate consent/access/retention/deletion decisions; verification requires provider or authorised review integration.
- Build and 84 tests pass (URL validation, edit/remove, unique-plan counting). Edge desktop 1440 × 1000 and phone 390 × 844: malformed/unsafe link rejection, submit/edit/cancel/remove, checked/AI courses, counts, navigation, role/learner isolation, refresh, EN/MS/ZH fit and Team/NOSS exclusion pass. No page errors; favicon remains a pre-existing 404. Screenshots outside repo. Team translation review pending. Branch kit-yiu; no commit or push; awaiting preview feedback.

---

## 22 Oct 2026 — Shared learning activity flow replaces the one-course quiz

- User rejected bespoke quizzes per course as unscalable and authorised trying a shared guided flow. Replaced quiz/answer logic with three activities on every checked course and AI suggestion: open provider link, review mapped skills, save an ungraded reflection. Provider opening records a click only; reviewing and reflecting are learner-recorded actions, not independent verification.
- Native progress sums activities on unique course URLs in the current plan, including collapsed suggestions; it never labels external courses completed. All cards state completion not verified. No badges, generated questions, automatic skill updates or provider integration.
- Saved reflections can be edited without extra progress. State and notes stay in memory per profile owner and clear on refresh. Form prohibits personal/confidential information and asks for fictional examples; translated EN/MS/ZH UI; team language review pending.
- Verified build and 84 tests, including sequential transitions, blank-note rejection, progress deduplication and edit/reopen handling. Edge browser at 1440 × 1000 / 390 × 844: checked and AI flows, blank rejection, notes, edit, bar, navigation, role changes, Aina/Hakim separation, languages, refresh and Team/NOSS exclusions pass. No page errors. Browser plugin absent; used already-installed Edge/puppeteer-core with screenshots outside the repo.
- Work remains on kit-yiu, uncommitted and unpushed. Await user preview before further features. Prior quiz and manual-selector entries are historical and superseded.

---

## 22 Oct 2026 — User correction: guided assessment instead of manual completion

- Supersedes the self-reported selector in the prior entry. User required guidance and a progress bar rather than choosing completion manually.
- ol-bookkeeping now has three original synthetic practice questions, aligned with the learning outcomes on OpenLearn's course page (https://www.open.edu/openlearn/money-business/introduction-bookkeeping-and-accounting/content-section-0/, checked 22 Oct). Course outcomes cover accounting equations, double entry and trial balances. Question/answer content is drafted, pending team review; not a provider exam, not a validated competency instrument.
- Pure advanceLearning transitions require learning → assessment → all three correct. Wrong/incomplete answers never pass; explanations and retry guide learning. Opening a provider link only starts learning. Native progress counts passed assessments in the selected plan, not completed external courses or resolved skill gaps. Plans with no assessment have an explicit empty state.
- Browser checks: installed Edge via existing puppeteer-core (Browser plugin absent; no tooling download). Desktop 1440 × 1000 and phone 390 × 844; start/gating, incomplete submit, wrong-answer feedback/retry, pass, role changes, zero-assessment state, navigation, Aina/Hakim isolation, refresh reset, Team/NOSS exclusions and EN/MS/ZH phone fit passed. No application exceptions or failed assets except the pre-existing favicon 404. Build and 84 tests pass, including 3 assessment-rule tests. Screenshot review led to clearer vertical learning steps.
- State remains memory-only; confirmed skills, scores and SDG claims unchanged. No manual completion control, generated claims, new dependencies, badges, commit or push. Await user preview feedback before extending.

---

## 22 Oct 2026 — Learner motivation, step 1: course status

- User requested one step at a time, with a preview and check after every step. Work is on kit-yiu. No summary or badge has been added yet.
- Individual courses now offer Not started / In progress / Completed through CourseProgressControl, passed via CourseCard's existing extra slot. State lives in App, separate for each actual profile owner and course URL; navigation and role switching preserve it, refresh clears it. No automatic skill or score changes. Labels and disclosure have Malay and Chinese translations (team language review remains applicable).
- Verification: npm run build and npm test passed (81 tests). Existing Edge and puppeteer-core were used because Browser plugin was absent and downloading Playwright was declined. Checked desktop 1440 × 1000, phone 390 × 844, status changes and undo, keyboard interaction, page navigation, role switching, Aina/Hakim isolation, refresh reset, Team/NOSS exclusion and translated control fit. No page exceptions or application console errors; favicon.ico returns 404.
- Dependencies installed at locked versions; Windows system certificates resolved the registry certificate failure. Screenshots and temporary preview scripts remain outside the TomorrowWorks repository. No commit or push; user review of step 1 comes next.

---


What was done, why, and what is still open. Newest entry first. Add an entry whenever a decision or finding changes the plan; keep the *how* in the linked documents.

---

## 22 Oct 2026 (14:05–15:00 MYT) — More AI-trend signals

- **Three views of AI impact:** Microsoft *Working with AI* applicability (imported here from GitHub, 785 US occupations, CC BY 4.0) and the Anthropic Economic Index (importer ready; huggingface.co is blocked here, so it runs in Replit's Shell) next to ILO, mapped through SOC codes; shown on *AI impact by role* and used in the futures. The views disagree (Microsoft rates analysts more exposed than ILO), which the futures now reflect (Hakim: Financial analyst 80%).
- **Signal sources page:** every source, what it measures, where, update rhythm, date and use.
- **Monthly labour force:** was already imported (to Aug 2026, `d3e82a8`; I misread it earlier). The Replit server now refreshes it daily from OpenDOSM until 1 Nov, like news.

---

## 22 Oct 2026 (14:20 MYT) — Person view inside Team view

- Carson: Team view lacked a per-person view, then asked for it as its own page. Team view now lists the people (best move, score, *Open profile*); each profile opens as a separate page with *Back to team*, starting on the person's best move.
- First version: Each name in the heatmap now opens that person's panel: top moves with futures shares, gaps for the selected role, first courses and estimated time. Same rules as Your moves and Your plan; no new data.

---

## 22 Oct 2026 (13:45–14:20 MYT) — 1,000 possible futures (handling uncertainty)

- Carson asked for a stand-out answer to brief feature 6. Added a seeded futures simulator: same scoring rule, AI speed anywhere between Gradually and Quickly, ILO exposure within its published SD, either DOSM quarter. Your moves now says how often each move is the best (Aina: Bookkeeper 99%, robust; Hakim: 62/26/12%, no single best), shows top-3 share and a 90% score range per row, flags close calls, and states the tipping point.

---

## 22 Oct 2026 (13:30 MYT) — SDG review results applied

- **Team review done** (two reviewers, blind, 145 pairs): agreement 66%, kappa 0.48 (three labels) / 0.69 (relevant vs not); AI alone 21/73 relevant, AI + draft rules 21/32 (in-sample), keyword baseline 14/40; below 0.60 only 4/30 relevant. Keyword matching found 10 relevant links the AI missed.
- **App now uses the reviewed labels:** strong = 35 pairs labelled relevant (AI or keyword), uncertain = possible, not relevant = hidden. Clean energy (7) and Climate action (13) are pickable again; 16 and 17 only possible. On-screen note shortened to one line (Carson).
- The learning-progress work from the `kit-yiu` branch (PR #1) was merged on GitHub before this change.

---

## 21 Oct 2026 (23:30 MYT) — Measured check for the SDG matcher

- **Why:** the 0.60 SDG threshold came from looking at examples; Carson asked whether an existing labelled dataset could help. A dataset cannot replace the team check of our own 73 matches, but it can measure the matcher.
- **Prepared:** `scripts/calibrate_sdg_osdg.py` on the OSDG Community Dataset (Zenodo, CC BY 4.0, volunteer-labelled SDG texts): same model and targets, fixed sample per SDG, accuracy overall, per similarity band and per threshold, with its limits written into the report. Tested offline with `--fake`. Carson runs it on his Mac; results go into SIGNALS_AND_MATCHING.md, RUNPOD_SETUP.md and the PRD.
- **Docs:** README status brought up to date.
- **Then (team feedback, 23:30):** prove our own links rather than the model in general. Built a blind review kit (`data/sdg/review/`, 145 pairs, two independent reviewers, written definitions) and a TF-IDF keyword baseline on the same ESCO text; `scripts/evaluate_sdg_review.py` gives agreement (kappa) and precision for embedding only, embedding + rules (in-sample) and keyword baseline. OSDG becomes optional. No RunPod needed for this step.

---

## 21 Oct 2026 (22:45–23:20 MYT) — Plan time, HRD Corp, SDG links by RunPod

- **Plan:** total stated time of checked courses; HRD Corp note with official sources (Claimable Courses scheme via employers; e-LATiH free courses), none of our courses claimed as claimable.
- **SDG:** skill links now come from RunPod (bge-m3) similarity between ESCO skills and the official UN target texts (UNSD SDG API), threshold 0.60 from the spot-check, 34 of 73 matches rejected by a human check with reasons; role links from those matches plus team-written links, each labelled. Then (Carson's hybrid): team-written links removed; levels strong (≥0.60, checked), possible (0.55–0.59, not checked, display only), 4.4 baseline; goal picker disables goals with no strong match (7, 13, 16); Aina's goal now 12. Then (Carson's review): 0.60 called provisional, 0.55 a display choice; target-wide rejection only for clearly unrelated targets, per-match rejected/uncertain otherwise (32 kept, 34 rejected, 7 uncertain); screen says "draft review" until the team validates the matches (now via the blind review kit in `data/sdg/review/`).

---

## 21 Oct 2026 (22:00–22:40 MYT) — Simpler radar; SDG goals woven into the journey

- **Radar:** your own skills first in three bands with one next step each; the nine jobs as rows, skills behind a button (feedback: "too much pill-bar").
- **SDG goals:** picked in Your skills next to interests (up to two, plain names with official colour squares); one Goals switch in Your moves; a row tag only for a picked goal. Feedback: bare numbers and repeated "linked to SDG 8" tags were confusing. Scoring unchanged.

---

## 21 Oct 2026 (late) — Daily news refresh; key headlines per topic

- **Daily refresh:** `/api/news` fetches GDELT at most once a day until 1 Nov 2026, memory only (no commits after the deadline), committed snapshot as fallback, retry 6 h after a failure.
- **In brief:** per topic, counts plus the 3 most representative real headlines, picked by RunPod bge-m3 (closest to the topic centroid). Chosen over an LLM summary: nothing is generated, it follows the "LLMs never generate" rule, and it costs one small embedding batch per day.

---

## 21 Oct 2026 (21:30–22:15 MYT) — Plan touch-ups; Future Skills Radar

- **Plan:** checked courses and AI suggestions in one numbered list of identical cards (AI suggestions use the same greedy rule over RunPod matches); certification as one compact optional card under the courses.
- **Future Skills Radar:** 24 skill groups ranked by outlook (DOSM trend + ILO resilience of the roles that need them), scenario switch, Q1→Q2 rank arrows, the viewer's skills ticked. Closes the last gap from the brief's journey ("skills rising or declining").
- **Remaining before Sunday:** team review of SDG links and translations; PRD (official template), slides, Tools Declaration (Replit proof, RunPod screenshots), 5–7 min video; repo public + committee collaborators.

---

## 21 Oct 2026 (16:10–20:40 MYT) — Goals switch; Coursera matched on RunPod

- **Goals switch:** *Goals you care about* + *Count in ranking* (G = 1 role link, 0.5 skill link, 0 none). Carson then reworked Your moves on his Mac into focused views (role detail, changes, method; commits 2650b37–eda905c); his uncommitted *Personalise ranking* edit was left untouched.
- **Coursera at scale:** Carson ran the import (25,051 courses) and the RunPod matching (783 requests, 3.7 h). Spot-checked by similarity band; threshold 0.66, English only, top 3 → 159 of 185 skills matched. Your plan shows them as *Found by AI on Coursera, not checked by hand*. RunPod details in RUNPOD_SETUP.md.
- **Spend:** balance US$21.37 before the run; the "1d 6h left" estimate reflected the busy worker, not idle cost.

---

## 21 Oct 2026 (15:00–16:10 MYT) — Requirements re-check; interests; SDG links

- **Re-read the Domain 1 brief and handbooks.** Gaps found: SDG mapping (must-have 5) not started; interests missing from intake; no skill-level "Future Skills Radar"; HRD Corp courses not covered; all submission documents outstanding (PRD in the official template from the organisers' Drive, slides, Tools Declaration with Replit proof and RunPod screenshots, video, public repo + collaborators). Risk noted: handbook §8.5.3–8.5.4, every member must be able to explain the code.
- **Interests (RIASEC):** Carson preferred an Asian source. Role profiles from **job tag** (Japan MHLW / JILPT survey of workers) for eight roles, O\*NET for sustainability manager; no Malaysian per-occupation interest data exists. Optional picks on Your skills; *Include in ranking* switch on Your moves, off by default (1/6 of the score when on). 16Personalities rejected (proprietary, personality not interests).
- **SDG links:** roles by hand with reasons, skills by fixed rules, shown in moves, plan and Team view; highlight-by-goal never changes scores. Team review of `data/sdg/sdg-links.json` pending.
- 58 tests pass. **Next:** Future Skills Radar (skills rising or declining), then PRD, slides, declaration, video.

---

## 21 Oct 2026 (14:50–15:40 MYT) — Full BM / Chinese interface

- Carson saw pages only partly translated and asked whether AI should translate on every visit. Decided: **fixed translations written once** (reviewable, no API cost or delay, cannot change numbers or claims). Now 288 phrases cover every screen. English on purpose: course titles, ESCO skill and role names, source names, and the ESCO licence sentence. Review sheet `translation-review.csv` sent to Carson for teammates.

---

## 21 Oct 2026 (14:40–15:10 MYT) — "View as" instead of a fake login

- Carson asked whether to add fake login accounts per point of view. Decided against passwords (friction for judges, implies accounts and storage that do not exist). Built a **View as** switcher: Aina, Hakim, Puan Rosnah (HR, finance team), Encik Lim (career adviser, graduating class), Me. The sidebar changes per viewer. Pitch line: "Same engine, four users."

---

## 21 Oct 2026 (14:30–15:30 MYT) — Four target groups, what changed, fairness, languages, Coursera at scale

- **Feedback applied** (product should work for all four groups in the brief): **Hakim**, a fictional fresh statistics graduate with no current job (group 2), joins Aina (group 1) on Home; **Team view** for HR / L&D managers (fictional five-person finance team) and career centres (fictional class of three graduates), groups 3 and 4: a score heatmap per person and role, and the gaps shared by most movers for a chosen role with a course for each.
- **What changed** panel on Your moves: same skills scored with the Q1 and Q2 snapshots, with the job-ad reason. Real finding: job ads fell in every occupation group in 2026 Q2; for Hakim, software developer drops #6 → #8 while accounting assistant rises because its group fell less.
- **Is this fair?** panel backed by `src/fairness.test.ts` (no personal attributes exist; same skills → same scores).
- **Language switch** English / Bahasa Malaysia / 中文 for the screen chrome; translations drafted with Claude — **Carson to review the Malay and Chinese**. ESCO labels stay English.
- **Courses:** 10 Coursera courses hand-checked, marked paid with the Rakyat Digital Global Learning Pass free route. Coursera's public catalogue API works from Carson's Mac (25,052 courses); `scripts/import_coursera_catalog.py` and `scripts/match_courses_runpod.py` (RunPod Job B embeddings vs Job A ESCO vectors) are ready for Carson to run; the app section for AI-matched courses comes after the spot-check.
- Brief good-to-haves now covered: team heatmap, re-planning on new data, multi-language, fairness. 46 tests pass.

---

## 21 Oct 2026 (14:10–14:40 MYT) — Current NOSS register; GDELT one request; feedback on target groups

- **NOSS:** Carson supplied the current JPK register (Daftar Standard, 22 Jan 2025, 191 pages; read with `pdftotext`, not committed). `data/pathway/noss.json` now cites it with page numbers. Eight of nine roles have a close or related standard; business analyst has none.
- **GDELT:** still 429 after the first topic with the four-request script. Now one request for all topics; headlines are tagged by the topic terms they contain, else "Other".
- **Feedback (WhatsApp, shared by Carson):** a product that works well for all four target groups in the brief has the edge over one that fits two. Brief §2 groups: working adults at risk of displacement (Aina covers this), fresh graduates and career switchers, HR / L&D managers, TVET and university career centres. Proposal to Carson pending.
- **Courses:** Carson asked to connect Coursera, LinkedIn, OpenLearn or Rakyat Digital. Found: Rakyat Digital's Global Learning Pass gives eligible Malaysians with MyDigital ID three months of free Coursera access (100,000 licences, from 16 Sep 2026; Business Today, 8 Oct 2026). Coursera's catalogue API cannot be fetched from Claude's workspace. Proposal to Carson pending.

---

## 21 Oct 2026 (14:00–14:40 MYT) — 3. Your plan (stages 10a–10d)

- **Rule** (`src/pathway.ts`, documented in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#learning-plan-rule-stage-10-added-21-oct-2026)): gaps = missing + transferable essential skills; steps chosen greedily (the course closing the most remaining gaps first); time = the provider's stated study hours only; uncovered gaps listed as "No checked course yet".
- **Courses:** 11 free courses opened on the provider page today (9 OpenLearn, CS50x, UN CC:Learn). Coverage is partial (e.g. bookkeeper 4 of 6 gaps, software developer 3 of 24) and shown honestly. Kaggle Learn was considered but its pages state no duration we could read, so it is not listed.
- **NOSS/SKM:** the full JPK register PDF is blocked for download here and only its first sections could be read, so codes come from the JPA SKPK list (1 Dec 2024) and the JPK register (Nov 2015). Accounting roles → FB-100-3:2012 Perakaunan L3; software developer → IT-010-3:2016 / IT-010-4:2013; data analyst → IT-121-4:2011 (related only); four roles have none.
- **UI:** *Plan this move* in Your moves; the plan has a move selector, numbered steps with *Builds* tags, leftovers, "How this plan is made" and the certification route. Checked at 1280 px and 390 px. 29 tests pass.
- **Open (Carson):** check pages ~110–153 (and D/E) of the [2025 JPK register](https://www.myspike.my/lampiran/manual/DaftarStandardVersi22Januari2025.pdf) for newer codes; add more courses only after opening their pages. Next build step: 11 SDG links.

---

## 21 Oct 2026 (13:47 MYT) — RunPod Job B live; GDELT rate limit

- **Job B verified live** on the published Replit app with Replit Secrets set: the Chinese description "我负责每月的财务报表" returned real ESCO skills at 58–60% similarity, including *prepare financial statements*, *interpret financial statements*, *maintain financial records*, *monitor financial accounts*. Some matches are sector-specific ESCO skills (e.g. *manage financial transactions of fuel station*); the person only adds what is true. English and Bahasa Malaysia checks to record next.
- **UI fix (reported by Carson):** a new skill search left the previous results on screen while it ran. Results now clear when a search starts, and the message names the text they belong to. Checked with a slow fake endpoint: 0 old results during the second search.
- **GDELT 429 Too Many Requests** on Carson's Mac after two quick runs. `scripts/import_gdelt_news.py` now waits 10 s between topics and retries a 429 after 30, 60 and 120 s, then stops with advice to wait 10 minutes.

---

## 21 Oct 2026 (13:32–13:45 MYT) — RunPod Job B endpoint created

- Endpoint **`j6ssjfy9z074hp`** from the RunPod Hub *Infinity Embedding* 1.1.4 worker, `MODEL_NAMES=BAAI/bge-m3`, 16 GB GPU pool (24 GB suggested as backup), Active 0 / Max 1 workers, idle 5 s, FlashBoot on. Details in [RUNPOD_SETUP.md](RUNPOD_SETUP.md#job-b-endpoint-created-21-oct-2026-1340-myt).
- **Credit:** balance US$21.56. The Job A Pod had been left running ~12 h (≈ US$3.40); stopped at 13:35, idle disk cost US$0.
- **OpenDOSM imported:** Carson ran `scripts/import_lfs_month.py` on his Mac (retrieved 2026-10-21): 13 months to **Aug 2026, unemployment 2.9%** (Aug 2025: 3.0%). Checked against the earlier API read; committed. The Job ads page now shows it.
- **Next (Carson):** create the RunPod API key → Replit Secrets `RUNPOD_API_KEY` and `RUNPOD_ENDPOINT_ID=j6ssjfy9z074hp` → Pull → Run → `/api/health` → test searches in English, Bahasa Malaysia and Chinese.

---

## 21 Oct 2026 (13:27–14:00 MYT) — News page and monthly labour context (data import pending)

- **Network limit:** `api.gdeltproject.org` and `api.data.gov.my` are blocked from Claude's workspace and from the computer link's shell. So the importers are standard-library Python scripts for Carson to run on his Mac.
- **`scripts/import_lfs_month.py`:** OpenDOSM `lfs_month`, latest 13 months → `data/sources/opendosm-lfs-month.json`. Fields and units confirmed from the API and the catalogue page (counts in thousands; rates in %; CC BY 4.0; next update 11 Nov 2026; trend break from 2025 due to the 2020 Census). A read of the API showed August 2026 unemployment at 2.9%; this is not committed until the script runs.
- **`scripts/import_gdelt_news.py`:** four topic queries (AI and automation, Layoffs, Hiring, Reskilling) on Malaysian outlets (`sourcecountry:MY`), last 4 weeks, 25 per topic, 6 s between requests; stores headline, link, outlet, language, date and matched topics only. GDELT's response could not be fetched here, so the field names follow its documentation and the script stops with a clear error if they differ.
- **App:** *Workplace news* page (topic filter, outlet and date, "never changes your scores" note, GDELT credit) replaces the "Soon" page; *Job ads* shows the unemployment rate as a context line above the table. Both files are committed as empty snapshots, so the pages say "not imported yet" instead of showing anything invented.
- **Checked** with temporary test data (removed before commit): both pages render, the topic filter works, no page errors. Build passes; 21 tests pass.
- **Carson to run:** `python3 scripts/import_lfs_month.py` and `python3 scripts/import_gdelt_news.py`, then commit the two JSON files.

---

## 21 Oct 2026 (13:26 MYT) — "Unverified" commit badges explained and fixed going forward

- **Cause:** Claude's workspace signs commits with Claude's SSH key, but commits since 21 Oct 00:50 were made with the *committer* set to Carson. GitHub only verifies a signature against the committer's account, so they show **Unverified**. `03b3640` shows **Verified** because a rebase left Claude as committer.
- **Fix from now on:** author = Carson (`--author`), committer = Claude. Rule added to `CLAUDE.md` → Git. This commit is the first made that way.
- **Not changed:** older commits keep their badge. Re-signing them would mean rewriting and force-pushing `dev` (breaks Replit and the Mac copy, and makes history look rewritten). The badge does not affect judging; the handbook checks for a continuous, truthful history.
- **Optional for Carson:** GitHub "vigilant mode" (Settings → SSH and GPG keys → *Flag unsigned commits as unverified*) also marks every unsigned commit from his Mac as Unverified. Turning it off, or adding a signing key on the Mac, avoids that for his own commits.

---

## 21 Oct 2026 (13:10–13:45 MYT) — First-visit clarity: home, guided flow, Aina

**Feedback (Carson):** new visitors would not understand what the app is for or why it jumps into a table. Agreed choices: replace the old profile/gap screens, use a fictional persona "Aina", show empty pages as "Soon".

- **Problems found on a first-visit walk-through:** generic home; two profile flows that did not feed the ranking; Role matches opened on an unexplained "Accounting Assistant"; jargon (DOSM, ILO, ESCO, ISCO, gradient); empty pages in the menu.
- **Home:** clear headline and audience, two starts (*Try it as Aina* / *Start with my own skills*), privacy line, 3-step *How it works*, *Meet Aina* with her live top three moves, *Where the numbers come from*.
- **Guided flow:** `src/SkillsStep.tsx` (current job, RunPod description search, list search, skill chips) and `src/MovesStep.tsx` (who-banner, *How to read this*, plain switch labels *Gradually / Quickly*, ledger) share one profile in `src/main.tsx`; data and Aina in `src/data.ts`. Step bar on career pages; menu split into *My career* and *The job market* with "Soon" labels.
- **Removed:** free-text *My profile*, *My skill gaps*, *Sign in*, `src/personal.ts`, `src/market.ts` (no longer used).
- **Checked:** build passes, 21 tests pass; browser walk-through at 1440 px and 390 px (Aina path, own-skills path, coming-soon page), no overflow, no page errors.
- **Docs:** `SCREENS.md` rewritten; README flow and file tree, `CLAUDE.md` key code, `CHECKLIST.md` stage 4j; dated notes in `UI_UX.md`, `PERSONAL_GUIDANCE.md`, `PRODUCT_SCOPE.md`.

---

## 21 Oct 2026 (02:22–02:30 MYT) — Plan: news, monthly labour data, NOSS

**Questions (Carson):** DOSM job-ad data lags; can news add the latest? Can a Malaysian product use ESCO (European)?

- **News: yes, as context, not demand.** GDELT DOC API (free, no key, Malaysian sources) on *Workplace changes*: dated headlines with links and topic tags. It never changes scores — news volume is not job demand.
- **Fresher official figure:** OpenDOSM monthly Labour Force Survey (`lfs_month`) as context on *Demand*.
- **ESCO in Malaysia: yes.** ESCO, ILO and DOSM share ISCO-08 codes and MASCO 2020 follows ISCO-08, so codes join directly. ESCO lacks Malaysian qualifications, so **NOSS/SKM** (JPK) is added to the pathway as the local certification route.
- **Plan updated:** [BUILD_STAGES.md](BUILD_STAGES.md#next-selection-updated-21-oct-2026-0230) (Wed: Job B live, 6d news, 6e LFS; Thu: pathway 10a–10d with NOSS, SDG 11; Fri: buffer, PRD and slides drafts; Sat: finalise and submit), [API_PLAN.md](API_PLAN.md#next-sources-decided-21-oct-2026-0224) (roles and boundaries of each source), [CHECKLIST.md](CHECKLIST.md) (6d, 6e, 10d) and [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#planned-additions-21-oct-2026).

---

## 21 Oct 2026 (02:16–02:45 MYT) — RunPod Job B: server and search box built (endpoint tomorrow)

**Decision (Carson):** do Job B for real; Carson creates the RunPod endpoint tomorrow, code finished tonight.

- **`server/search.mjs`:** reads the Job A float16 `.npy` without extra packages, de-duplicates by ESCO URI (13,939 skills), normalises the query and returns the top 10 at similarity ≥ 0.5.
- **`server/index.mjs`:** serves `dist/`; `GET /api/health`; `POST /api/skill-search` → RunPod Infinity worker's OpenAI-compatible route (format checked against the [worker README](https://github.com/runpod-workers/worker-infinity-embedding)). Key and endpoint only from env (Replit Secrets). Limits: 500 characters, 20 searches/min per visitor, 90 s cold-start timeout. Clear messages when not configured or failing; the skill list stays as fallback.
- **App:** "Describe your work in your own words" box in *Edit your skills*; results show similarity and can be added; added skills (even outside the role set) feed transferable-skill scoring.
- **Tests:** 21 passing (6 new: float16 decoding, 13,939 unique skills, a skill's own vector returns itself, scaling-invariance, dimension check). **End to end** with a local fake endpoint in RunPod's response format: not-configured message, 10 results in 73 ms, adding a skill moved the accountant from 45 to 47. The fake returns a fixed vector, so **real multilingual quality is untested** until the live endpoint.
- **Replit:** Run now builds and starts the server; publishing switched to **Autoscale** (`node server/index.mjs`) because the key must stay server-side.
- **Tomorrow (Carson, about 10 min):** steps in [RUNPOD_SETUP.md](RUNPOD_SETUP.md#job-b-steps-serverless-endpoint--code-ready-21-oct-endpoint-to-create).

---

## 21 Oct 2026 (02:14–02:25 MYT) — Expanded role row made focused

**Feedback (Carson):** the expanded row was crowded and wordy.

- The three explanation sentences became one short fact under each column: skill count under *Skill fit*, DOSM group and change under *Demand*, ILO exposure and gradient under *AI resilience*.
- Skills sit side by side: **You have** (transferable skills first, dashed outline, "≈ your skill" underneath) and **To build**. Each list shows 8 skills, then "+N more".
- One small ESCO link at the end. Checked at 1440 px and 390 px.

---

## 21 Oct 2026 (02:12 MYT) — Full-width notes; no tabular figures

- Notes, reasons and empty-state text no longer stop at a fixed width (they left an odd gap inside full-width tables); page intros may run to 960 px.
- Removed tabular figures entirely: Safari still showed widened commas ("99 , 447") in the number columns. Right-aligned numbers stay readable.

---

## 21 Oct 2026 (02:08–02:20 MYT) — Fewer words; tables instead of repeated cards

**Feedback (Carson):** descriptions repeated on every card; too many words; odd spacing ("87 , 950", "0 . 64").

- **Demand** and **Outlook** are now one table each (`src/PublicTables.tsx`) with the source stated once underneath, instead of nine cards each repeating a four-line source block. Filters are hidden on these two views (all data is combined across industries).
- **Spacing bug:** tabular figures had been applied to the whole page; in Schibsted Grotesk they also widen commas, full stops and colons. Now applied only to number columns.
- **Shorter copy:** screen intros cut to one line; Role matches explanation cut to the assumption, the formula and "Estimates only".
- Overview page no longer lists all signals below the cards.
- Checked in a browser at 1440 px and 390 px (no horizontal overflow). Build passes; 15 tests pass.

---

## 21 Oct 2026 (02:10–02:30 MYT) — "Career ledger" restyle to remove the generic AI look

**Request (Carson):** the UI felt AI-generated. Used the `frontend-design` skill (design guidance) rather than installing a new tool; the repo's optional Impeccable setup is unchanged.

- **Direction:** an account-book look grounded in the subject (accounting user, official statistics). Palette: paper #f7f8f6, ink #1c2430, ledger green #1e6b4f, deficit red #a8402b, rule #d9ded9. One typeface, Schibsted Grotesk, with tabular figures.
- **Removed generic tells:** navy sidebar + teal, tracked ALL-CAPS eyebrows ("MOVE #1", "WORKPLACE CHANGES"), → on links, ✦ sparkle icons, card shadows, "A · B · C" strings, single-word colour accent in the logo.
- **Role matches rebuilt as a ranked ledger:** columns Rank, Role, Skill fit, Demand, AI resilience, Score; current job pinned above a double rule; rows expand for reasons, transferable pairs and skills. **After a data or scenario switch, each score shows ▲/▼ and the change** — the visible proof that trend data moves the ranking. Motion only on that user action and respects reduced-motion.
- **Home cards rewritten** to describe what is actually connected (DOSM job ads, ILO exposure; news and skills views not yet connected).
- **Checked in a browser** at 1440 px and 390 px: no horizontal overflow; phone layout stacks each row. Build passes; 15 tests pass. `DESIGN.md` updated with the new tokens and rules.

---

## 21 Oct 2026 (02:00–02:10 MYT) — Home page points to real data

- Home button is now **"See ranked career moves"** and opens Role matches directly; the old "no verified source connected" notice is gone because public views now have sources.
- **Demand view:** 9 DOSM occupation-group cards (Q2 2026 count, Q1 → Q2 change, full source block). **Outlook view:** ILO exposure cards for the 9 roles, labelled as possible task change, not job loss. Cards say "All industries combined" instead of listing every industry.
- **Finding:** DOSM's Q2 2026 *industry* table puts 49% of ads under "Unclassified" (Q1: 8%), so industry-level changes are not shown; the occupation table is unaffected.
- Verified in a browser: 9 Demand cards, 9 Outlook cards, home button lands on Role matches with 9 role cards. `npm test` 15 passing.

---

## 21 Oct 2026 (01:52 MYT) — Replit publish fixed

- Publishing failed with "Could not find run command": `.replit` only described the editor workflow. Added a `[deployment]` section: `deploymentTarget = "static"`, build `npm ci && npm run build`, `publicDir = "dist"`. The exact build command was verified from a clean checkout.
- Static is right for now (no server code). RunPod Job B needs the API key on a server, so publishing will move to Autoscale then; noted in `replit.md`.
- Published URL (once live) is the **prototype link** and the **Replit proof** for the submission.

---

## 21 Oct 2026 (01:46–02:00 MYT) — Role matches screen built

- **New `src/RoleMatches.tsx`**, shown on **My career → Role matches** (after the fictional-profile entry). Controls: current ESCO job, **Data snapshot** (DOSM 2026 Q1 / Q2), **AI-change scenario** (moderate / fast). The scenario's assumption, weights and the DOSM source with its release date are stated under the controls.
- **Cards:** the current job as "Where you are", then the 8 moves ranked. Each shows the estimated score, F/D/R bars with value × weight, the skill counts, the DOSM group counts and quarter-on-quarter change, the ILO score with "not a job-loss forecast", an ESCO link, and on demand the transferable pairs (e.g. *manage accounts ← your maintain financial records, 0.89*), held skills and skills to build (🌱 marks ESCO green skills).
- **Skill editor:** tick or search the ESCO skills used by the role set. This is also the fallback until RunPod Job B (free-text search) is connected; the screen says so.
- **Footer on every screen:** sources (DOSM, ILO, ESCO, bge-m3 on RunPod) and the ESCO acknowledgement.
- **Verified in a headless browser:** Q2 moderate #1 bookkeeper 58; fast order puts sustainability manager 4th; Q1 fast scores 75, 59, 51, 39, 32, 30, 29, 28, 27 (match the tests); no horizontal overflow at 390 px; radio layout fixed. `npm test` 15 passing; `npm run build` passes.
- **Checklist:** Stages 7c, 8a–8c and 12 items ticked. Thursday's UI work is done early; next is RunPod Job B (Serverless skill search).

---

## 21 Oct 2026 (01:43–01:55 MYT) — Transferable skills via RunPod embeddings; current job separated

**Decision (Carson):** go ahead with both fixes from the previous entry.

- **Calibrated the threshold on real pairs** (table in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#why-transferable-skills-and-why-085-decided-21-oct-2026)): ≥ 0.85 all sensible; 0.80 lets in "perform scientific research ← perform business research". Chosen: **0.85, half credit**.
- **New `scripts/build_transferable_skills.py` → `data/derived/transferable-skills.json` (45 KB):** for each of the 185 essential skills in the role set, the ESCO skills at ≥ 0.85 similarity (61 skills have at least one; 99 pairs). The app never loads the 28 MB vectors.
- **`src/scoring.ts`:** `skillFit` now returns exact, transferable (with the pair and similarity) and missing skills; `recommendMoves` shows the current job separately and ranks the rest.
- **Tests:** 15 passing (new: half credit, no double counting, real pair *accounting ← accounting techniques* 0.86, current job excluded from moves).
- **Real result:** Q2 moderate — bookkeeper 58, accountant 45, billing clerk 36, financial analyst 21 …; fast scenario lifts sustainability manager from 6th to 4th; Q1 → Q2 lowers accountant 51 → 45. RunPod now directly drives the skill-fit part of every recommendation.

---

## 21 Oct 2026 (01:39–01:50 MYT) — README refreshed; scoring module built

- **README:** project stage, data-source table with verified counts, role set, scoring formula and scenarios, RunPod section, rebuild commands, Replit notes, and the ESCO acknowledgement plus source citations.
- **`src/scoring.ts`:** pure functions for skill fit (ESCO URIs), demand trend (DOSM quarter-on-quarter by major group), AI resilience (ILO), two scenarios, missing-signal weight sharing, and ranking.
- **`src/scoring.test.ts` (11 tests, `npm test`):** the hand-checked worked example (moderate 0.5275 → 53; fast 0.531), quarter wrap-around, clamping, weight redistribution, URI matching, and real-data checks (every role has DOSM and ILO signals; Professionals D 0.658 → 0.405; switching snapshot lowers the accountant's score).
- **Tooling:** added vitest; 3.2.x had critical advisories in dev-only dependencies, so pinned **vitest 5.0.5** (works with Vite 6.4.3; `npm audit`: 0 vulnerabilities). `tsconfig.json` gains `resolveJsonModule`.
- **Finding — exact skill matching is too strict:** with the demo user's 20 ESCO skills, their current job scores F = 1.00 and every move scores F ≈ 0 (ESCO occupations rarely share skill records), so moves are ranked only by D and R. Proposed fix (awaiting Carson's decision): count *transferable* skills using the RunPod ESCO vectors, and list the current job separately from recommended moves.

---

## 21 Oct 2026 (01:33–01:45 MYT) — Role set built from ESCO

- **New `scripts/build_roles.py` → `data/roles.json`.** Nine ESCO occupations, each chosen by URI; everything else copied from ESCO v1.2.1. Skills carry `green`/`digital` flags from ESCO's own collections. File states the ESCO acknowledgement, licence and that it is an adapted selection.
- **Roles:** billing clerk (4311), accounting assistant (3313, the demo user's current job), bookkeeper (3313), accountant (2411), financial analyst (2413), business analyst (2421), data analyst (2511), software developer (2512), sustainability manager (1213). All ISCO codes have ILO scores.
- **Findings that changed the list** (details in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#role-set-built-datarolesjson)): ESCO puts bookkeeper and accounting assistant under 3313, not 4311, so the pitch line becomes "the clerical tasks around this job are the most exposed"; statistician → data analyst; environmental protection professional → sustainability manager (39 green skills).
- **Checked:** three roles have equal essential and optional counts (12/12, 20/20, 18/18); verified against the raw relations file — different skills, no overlap, so it is ESCO's data, not a bug.
- **Decision for Carson to confirm:** the new demo-user framing (accounting assistant) and the two role swaps.

---

## 21 Oct 2026 (01:25–01:40 MYT) — Replit import reviewed; GitHub linked to Claude

- **Replit:** repo imported from GitHub branch `dev`; Replit Agent configured it and pushed two commits ("Save agent progress", `f3c5e4e`, `205d9f1`). Its own notes are in the entry below. **Replit Agent is an AI tool and must be listed in the Tools Declaration** (purpose: Replit run setup only).
- **Reviewed every file it changed:** `.replit` (run workflow on port 5000), `replit.md` (run notes), `vite.config.ts` (`allowedHosts: true` for Replit's preview proxy), and this log — all fine, no secrets.
- **Fixed one problem:** it rewrote `react` and `react-dom` download URLs in `package-lock.json` to `http://package-firewall.replit.internal/…`, which exists only inside Replit, so `npm ci` would fail anywhere else. Restored the lockfile from `5444784` (same versions). Verified `npm ci` and `npm run build` pass with the restored lockfile and the new `vite.config.ts`. If Replit rewrites the lockfile again, do not commit that change.
- **Workflow from now on:** features are written in the repo and pushed to `dev`; in Replit, press **Pull** and run. Do not ask Replit Agent to build features (keeps code explainable and history clean). Ignore its suggested "smoke checks" task.
- **GitHub access for Claude:** Claude GitHub App installed on `kairos8232`; recommended scope is *Only select repositories → TomorrowWorks*. Claude can now fetch and push `dev` directly. The repo stays private until submission.

## 21 Oct 2026 — Imported app running on Replit

- Installed the existing React, TypeScript and Vite dependencies, preserving their pinned versions and the repository structure.
- Added a Replit Run workflow: `npm run dev -- --port 5000 --strictPort`.
- Allowed proxied development hosts in `vite.config.ts`; documented setup and current service limitations in `replit.md`.
- Verified `npm run build` (type check and production bundle), HTTP 200 through the Replit development URL, and a rendered home-page screenshot. The browser reported one resource 404; no JavaScript exception was reported.
- No sign-in, market-data or RunPod integration was added. The combined Stage 3 evidence item remains unchecked because declaration evidence has not been retained by the team.

---

## 21 Oct 2026 (01:00–) — RunPod Job A in progress

- **Credit:** US$25.00 sponsor credit on the team RunPod account.
- **Attempt 1 failed (RunPod host fault):** Pod `embarrassed_rose_loon` (`adddib7tt6cxi9`), RTX 4000 Ada, template Runpod PyTorch 2.8 (`runpod/pytorch:1.0.2-cu1281-torch280-ubuntu2404`). The container never started: the host could not resolve `registry-1.docker.io` (DNS i/o timeout). None of our code ran. Pod terminated; no credit used.
- **Attempt 2 running:** Pod `rear_amethyst_gull` (`40jrr8aulh76tb`), **RTX A5000**, US$0.27/hr, same template. Next: Jupyter → run `embed_esco_skills.py` → download `out/` to `data/derived/esco/` → dashboard screenshot → terminate.
- **Job A done (01:11):** on the RTX A5000, `embed_esco_skills.py` embedded **13,960 ESCO skills in 92.5 s** (`Device: cuda NVIDIA RTX A5000`). Output unzipped into `data/derived/esco/`: `esco-skill-vectors.f16.npy` (13,960 × 1024, 28.6 MB), `esco-skill-index.json`, `run-info.json`.
- **Checked:** row count matches the index; all vectors unit length; no NaN. Nearest neighbours make sense, e.g. *manage budgets* → *budget for financial needs* (0.87); *use spreadsheets software* → *use word processing software* (0.81). ESCO's CSV repeats 21 skills (13,939 unique URIs); the app must de-duplicate by URI when loading.
- **Evidence:** terminal screenshot (GPU name, "Done in 92.5s") and Pods-page screenshot (name, ID, GPU, runtime) kept outside the repo for the Tools Declaration. Pod to be terminated after download.
- **Repo safety:** `.gitignore` now also excludes `*.pem`, `*.key`, `secrets*`, `.runpod/`, `evidence/` (dashboard screenshots belong in the Tools Declaration, not the repo) and `*.zip`. Pod IDs and GPU types are not secrets; API keys are, and live only in Replit Secrets.

---

## 21 Oct 2026 (00:44–01:00 MYT) — ILO import; RunPod made a required part of the build

**Decision (Carson):** RunPod must be used and stays in scope, with trustworthy data only. Docs updated so RunPod is never on the drop list.

**ILO importer — `scripts/import_ilo_exposure.py`:**
- Reads Annex Table A1 from the downloaded PDF with `pdftotext -layout` and writes `data/sources/ilo-genai-exposure-2025.json` with full source metadata.
- Result: **427 occupations, 112 exposed, 13 in Gradient 4**, matching the paper's own counts.
- First attempts were wrong and fixed: (1) rows with a label prefix or an SD of exactly 0 were skipped; (2) carrying labels over from the previous row mislabelled 187 rows, because each label is stacked around its own row. Final method reads the label from the row's own three lines and uses the paper's threshold rule only where the label cannot be read (91 rows). Where both exist they agree except 4 boundary rows (rounded mean + SD = 0.40); the printed label is kept.
- Our eight roles: 4311 Gradient 4 (0.64), 2413 Gradient 4 (0.62), 2120 Gradient 3 (0.56), 2512 Gradient 3 (0.53), 2411 Gradient 3 (0.51), 3313 Gradient 2 (0.49), 2421 Gradient 2 (0.46), 2133 Minimal exposure (0.38).

**RunPod — `runpod/embed_esco_skills.py` and [RUNPOD_SETUP.md](RUNPOD_SETUP.md#part-2-project-gpu-work-required) Part 2:**
- ESCO `skills_en.csv`: 13,960 released skills, 86,690 alternative labels; `occupationSkillRelations_en.csv`: 67,600 essential and 58,451 optional links.
- **Job A (GPU Pod):** embed each skill (label, up to 8 alternative labels, description) with `BAAI/bge-m3`; output ≈ 28.6 MB of vectors plus an index and `run-info.json` (model, GPU, runtime). Dry run verified locally; GPU run not done yet.
- **Job B (Serverless):** same model embeds the user's description; the Replit backend returns the nearest real ESCO skills for the user to confirm.
- Evidence checklist (Pod ID, GPU type, runtime screenshot; endpoint URL) and a searchable-list fallback are written down.
- Plan moved Job A to **Wednesday** so RunPod evidence exists early.

**Files:** new `scripts/import_ilo_exposure.py`, `data/sources/ilo-genai-exposure-2025.json`, `runpod/embed_esco_skills.py`; updated `RUNPOD_SETUP.md`, `SIGNALS_AND_MATCHING.md`, `BUILD_STAGES.md`, `CHECKLIST.md`, `CLAUDE.md`, `README.md`.

**Next:** run Job A on a RunPod Pod (Carson, needs the team account) · ESCO role importer → `data/roles.json` · scoring module + unit test · Replit import.

---

## 21 Oct 2026 (00:42–00:50 MYT) — Inputs complete, plan to the deadline

**Status:** all three source files are in `data/raw/` (DOSM Q1/Q2 2026 xlsx, ILO WP140 PDF, ESCO v1.2.1 CSV). Next work is code, not research.

**Done in this entry:**
- **Verified the eight candidate role codes** against ESCO `ISCOGroups_en.csv` and ILO Table A1; all present. ILO scores added to the role table in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#candidate-roles). The demo user's current job (4311, 0.64) is the most exposed; Environmental protection professionals (2133, 0.38) the least. MASCO 2020 check still open.
- **Fixed the DOSM importer** to store the release date (`publishedAt`), which the brief requires on every source. It now takes three arguments: file, release date, download date. Regenerated both snapshots: Q1 published 2026-06-25 (date of DOSM's Q1 release file and press coverage; confirm on the release page), Q2 2026-08-18 (release page).
- **Ticked verified checklist items** in [CHECKLIST.md](CHECKLIST.md): Stage 1 (Replit/RunPod split, sample import, measure label, risks), Stage 2 (GPU task chosen), Stage 5 (repeatable import, metadata, refresh command). DOSM reuse terms remain unchecked.
- **Wrote the day-by-day plan** in [BUILD_STAGES.md](BUILD_STAGES.md#next-selection-updated-21-oct-2026), with a drop order if time runs short.

**Next step (Wed 21):** ILO importer → ESCO roles importer → scoring module with the worked-example unit test → import the repo into Replit.

---

## 21 Oct 2026 (00:18–00:35 MYT) — Review, source decision, DOSM import

Work done with Claude. Committed by Carson in `09cd1ce` (docs and source decision) and `977d59c` (DOSM importer and snapshots); this log and its README/CLAUDE.md links are the remaining uncommitted change.

### 1. Reviewed the official PDFs and this repository

Read the four PDFs in the `ChatGPT/TomorrowWorks` folder (read-only, not copied here): Domain 1 brief, Official Handbook, Participant Handbook, Terms & Conditions. Then read `README.md`, `CHECKLIST.md`, `API_PLAN.md`, `PRODUCT_SCOPE.md`, `BUILD_STAGES.md` and the code in `src/`.

**What the README already covered well:** the six must-have features, the six preliminary deliverables and deadline, Apache 2.0 licence, data and AI guardrails, commit-history rules.

**Gaps found:**

| # | Gap | Why it matters | Status |
| --- | --- | --- | --- |
| 1 | Only profile intake works; no trend source, matching, deployment, or Replit yet. | Feasibility (25%) needs a working trend-signal → role-matching demo by **25 Oct 7:59 AM**. | Started: DOSM imported (below). |
| 2 | RunPod was treated as mandatory. | Handbook 9.4 requires RunPod only for GPU work; Replit is the mandatory tool. | Resolved: team chose to use RunPod for a real GPU task (section 4). |
| 3 | Audience framed as "anyone, any age, any industry". | Innovation (30%) rewards "a sharply framed slice … a specific user and moment of need". | Proposed demo user (section 2); product scope docs not changed. |
| 4 | No AI component decided ("model TBD"). | It is an AI hackathon; judges will look for it. | Resolved: ESCO skill search on RunPod (section 4). |
| 5 | Work is on `dev`; `main` was deleted on GitHub. | Judges see the default branch. | Open: set the default branch before submission. |
| 6 | Team section "TBD"; video over 7 min loses 1 point per 30 s; team must be able to explain AI-written code (rule 8.5.4). | Submission risk. | Open. |

### 2. Chose the trend sources and demo user

Recorded in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md); a short summary was added to the README.

- **Demo user:** a junior accounting or bookkeeping worker in the Klang Valley whose routine tasks are being taken over by AI tools. Reason: the ILO places accounting and bookkeeping clerks in its highest GenAI-exposure gradient while DOSM lists accountants among the most-advertised jobs — a real tension to explain.
- **Demand signal (required updatable source):** DOSM *Big Data Analytics: Job Market Insights*, quarterly.
- **AI-exposure signal:** ILO Working Paper 140, *Generative AI and Jobs: A Refined Global Index of Occupational Exposure* (2025), by ISCO-08 occupation (MASCO 2020 follows ISCO-08, so no US crosswalk is needed).
- **Role skills:** a curated set of about eight roles with essential skills from ESCO.
- **Score:** `wF·skill fit + wD·demand trend + wR·(1 − AI exposure)`, every part shown; two weight sets give the moderate and fast AI-change scenarios.
- **Rejected for the preliminary round:** Anthropic Economic Index (good AI-usage tracker, but needs an O*NET ↔ ISCO crosswalk — kept as a Phase 2 idea), Jooble (key and 500-request lifetime limit), news APIs (not demand evidence).

These are proposals. Under handbook rule 8.5.2 the team must own and be able to defend the design choices; change weights or roles if you disagree.

### 3. Imported DOSM Q1 and Q2 2026

Carson downloaded `Data_JMI_Q1_2026.xlsx` and `Data_JMI_Q2_2026.xlsx` from the DOSM release pages.

**What the file actually contains** (one sheet, `e2-Summary Table BI`):
- Table 1: job offerings advertised online by **economic activity**.
- Table 2: job offerings advertised online by **occupation major group** (9 groups, 1-digit MASCO) — *not* individual jobs.
- Each table: annual columns, then **quarterly columns from 2019 Q3**, then monthly columns.

**Added:**
- `scripts/import_dosm_jmi.py` — reads the xlsx, keeps the quarterly series for both tables, tags each occupation row with its ISCO major-group code, and writes JSON with full source metadata (publisher, URL, file, latest quarter, retrieval date, geography, measure, coverage note). It stops with an error if the layout changes or an unknown occupation group appears. Run: `pip install openpyxl`, then `python3 scripts/import_dosm_jmi.py data/raw/Data_JMI_Q2_2026.xlsx 2026-10-21`.
- `data/sources/dosm-jmi-2026-q1.json` and `data/sources/dosm-jmi-2026-q2.json` — the converted snapshots (committed).
- `data/raw/` — the original xlsx files, **gitignored** (`.gitignore` updated); the JSON records where to re-download them.

**Verified:** output matches the Q2 2026 release page — total 555,509 (Q1 626,861); Professionals 285,907 (Q1 315,768).

**Findings that changed the plan:**
1. **Demand is only available per major group.** Job-level counts such as "Accountants and Auditors 22,067" appear only in the press statement. Each role now takes the quarter-on-quarter change of its major group. The Q1 ↔ Q2 switch still moves scores: Professionals +15.8% → −9.5% (D 0.66 → 0.41); Clerical support workers −1.8% → −17.2% (D 0.48 → 0.33).
2. **Year-on-year changes are unreliable.** Almost every group shows +80% to +180% YoY, most likely because DOSM widened its set of job sites rather than demand doubling. The score uses **quarter-on-quarter change only**; state this limitation in the PRD.

### 4. Decided to use RunPod with a real dataset

Carson chose to keep RunPod and wants only trustworthy data (no fake records). Plan, detailed in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#where-ai-is-used-runpod-skill-search-over-a-real-taxonomy):

- **Dataset:** ESCO v1.2 from the European Commission (about 13,900 skills, 3,000 occupations linked to ISCO-08).
- **GPU batch job (RunPod Pod):** embed every ESCO skill label once with a multilingual open-weights model such as `BAAI/bge-m3`; save the vectors. Keep Pod ID, GPU type and runtime for the Tools Declaration screenshot.
- **Runtime (RunPod Serverless):** embed the user's own description (English, Bahasa Malaysia or Chinese) and return the nearest real ESCO skills; the user confirms each one.
- **Guardrail:** retrieval only — the model never creates skills, roles, courses, statistics or scores.
- **Fallback:** searchable ESCO list if the endpoint is down.
- **Kaggle rule:** use a Kaggle dataset only when it names its original source and licence, and prefer the original publisher. Scraped job-post datasets with unclear terms are not acceptable evidence.

### 5. Files created or changed in this session

| File | Change |
| --- | --- |
| `SIGNALS_AND_MATCHING.md` | New. Sources, demo user, data shapes, candidate roles, scoring rule with worked example, snapshot switch, skills radar, RunPod plan, risks and fallbacks. Updated with real DOSM findings. |
| `CLAUDE.md` | New. Project context, deadlines, hard rules, stack and commands, git notes, working preferences — read by Claude at the start of each session. |
| `PROGRESS_LOG.md` | New. This log. |
| `README.md` | Added "Chosen Signals and Matching" section; new files in the structure tree. |
| `API_PLAN.md` | One-line pointer to the decision at the top. |
| `.gitignore` | Ignore `data/raw/`. |
| `scripts/import_dosm_jmi.py` | New DOSM importer. |
| `data/sources/dosm-jmi-2026-q1.json`, `dosm-jmi-2026-q2.json` | New converted snapshots. |

`CHECKLIST.md` was **not** ticked: Stage 1 source items and Stage 5a/5b are partly done but not fully verified by the team yet.

### 5b. Requested the ESCO download (00:36–00:40)

First package selection was wrong (Content *Delta*, Language *independent*): Delta holds only changes between versions, and the language-independent package has no skill or job names. Corrected to **v1.2.1, Classification, English, CSV (48.95 MB)**; ESCO sends the file by e-mail after a request form. The ESCO site announced maintenance on 21 Oct, so the page or e-mail may be delayed.

Licence terms recorded in [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md#esco-download-settings-and-licence-requested-21-oct-2026) and `CLAUDE.md`: show the ESCO acknowledgement in the app and documents, label adapted ESCO content, and note that the Commission does not guarantee accuracy.

### 6. Open items (next)

1. ~~Download the ILO WP140 PDF~~ — done: `data/raw/Generative AI and Jobs: A Refined Global Index of Occupational Exposure.pdf` (53 pages). Table A1 is present and readable as text, e.g. 4311 Accounting and Bookkeeping Clerks mean 0.64 / SD 0.07; 2411 Accountants 0.51 / 0.08.
2. ~~Download ESCO~~ — done: `data/raw/ESCO dataset - v1.2.1 - classification - en - csv/` (19 CSV files). It also includes `greenSkillsCollection_en.csv` and `greenShareOcc_en.csv`, which can support a sourced SDG 7/12/13 link for green skills.
3. Add the ESCO acknowledgement to the app footer and to the PRD, slides and Tools Declaration.
4. Verify the candidate role codes against MASCO 2020.
5. Then build: ILO importer → `data/roles.json` → scoring module + unit test → snapshot/scenario switches in the UI → RunPod embedding job → Replit deployment.
6. Before submission: set the GitHub default branch, fill in Team, complete the PRD, slides, declaration and video.

### Commits

- `09cd1ce` — `CLAUDE.md`, `SIGNALS_AND_MATCHING.md`, README section, `API_PLAN.md` pointer.
- `977d59c` — DOSM importer, Q1/Q2 2026 snapshots, `.gitignore`, updated plan after the DOSM findings.
- Next: `Add progress log` — `PROGRESS_LOG.md` plus its links in `README.md` and `CLAUDE.md`.

- Step 3 placement correction (22 Oct): user requested the next-action panel beneath course progress; moved it below the summary.

## 22 Oct 2026 (afternoon): Anthropic Economic Index imported
- Carson ran the importer in Replit (756 occupations, commit `02d000f`). First run gave 0 tasks for software developer and data analyst (the task file uses 2010 O*NET codes); fixed in `9136c71`, second run fills all eight SOC codes. Automates share: bookkeeping 56%, software developer 58%, data analyst 45%, financial analyst 29%.
- The real file has a `source.files` object, which broke `npm run build` (type of `aeiData.source`); loosened the type. Build and 97 tests pass.
- Effect on futures: Hakim is now Financial analyst 56% / Business analyst 40% / Data analyst 4% (was 80/14/5), because the Anthropic view places Financial analyst as the most exposed role. Aina unchanged (Bookkeeper 100%).
- Open: republish on Replit and look at the AI impact page and the futures panel by eye.

