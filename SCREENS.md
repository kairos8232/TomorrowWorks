# TomorrowWorks screen guide

Updated 21 Oct 2026 after the layout and copy refinement. **Current** = works today; **Soon** = shown in the menu with a "Soon" label and a short note. `CHECKLIST.md` tracks verified progress; `BUILD_STAGES.md` plans the next small commits. Update this guide with any screen change.

## Structure

```text
Home ─┬─ "Try a sample person" ─────────▶ 2. Your moves (Aina's skills loaded)
      └─ "Start with my own skills" ─────▶ 1. Your skills (empty)

My career (sidebar navigation)           The job market (browse any time)
  1. Your skills   Current                 Job ads           Current
  2. Your moves    Current                 AI exposure       Current
  3. Your plan     Current                 Workplace news    Current (empty until imported)
                                           Skills in demand  Soon
```

- **1,000 possible futures** (panel above the ranking, 22 Oct): the robust best move ("best in n% of futures") or "No single best move" as a large headline on a dark panel (the one dark block on the screen, so it stands out); one dot per future, coloured by its best move (top 3 moves coloured, the rest grey; a move that wins a few futures shows "<1%", not 0%); an AI-speed strip from Gradually to Quickly coloured by the leading move, with the tipping point sentence; *How the futures are made* (collapsed) lists the assumptions. Each ranked row adds *Top 3 in n% of futures · score a–b across futures* and a *close call with #n* tag when the order flips often.

## Home

- **Question it answers:** what is this, who is it for, how does it work, can I trust the numbers?
- **Current:** headline "AI is changing your job. See where you can move next."; one-sentence method; two actions (*Start with my own skills*, *Try a sample person*); privacy line; one **Choose where to start.** section with three paths (Career path, Job market, For organisations; header link *Where to start*); four fictional viewer cards, with live top moves for Aina and Hakim; **Where the numbers come from** (DOSM, ILO, ESCO in plain words, linked).
- On wide screens the introduction and steps sit side by side, followed by four viewer cards. On medium screens the cards form two columns; on phones one column. The repeated source summary is omitted from the Home footer, while the ESCO acknowledgement remains.
- Aina is **fictional**, labelled as such everywhere. Her skills are ESCO's essential skills for *accounting assistant*.

## 1. Your skills

- **Start from your CV** (22 Oct, top of the step, optional): *Choose CV file* (PDF or .txt, read in the browser with pdf.js, max 5 MB, first 10 pages), *Paste text*, or *Try a fictional CV* (Aina). `src/cv.ts` splits the text into lines, removes contact lines (email, links, phone numbers) and headings/names (all capitals, under three words), and caps at 40 lines. The person sees "n lines to match · n contact lines removed" and can open *Check what will be sent* to remove any line. *Find skills in my CV* sends only those lines once to `/api/cv-skills` (RunPod Job B, top 3 ESCO skills per line ≥ 0.55, best per skill, up to 25). Results are tick boxes with "match n%" and *from "line"*; nothing is added until the person ticks skills and presses *Add n selected skills*. Nothing is stored or logged.
- **Current:** *Your current job* (ESCO role or "Not in this list"; shown as "Now" outside the ranking) and *Search the skill list* share the left side of the intake area on wide screens. *Describe your work* sits beside them and uses RunPod skill search (shows "match n%", user adds what is true; clear message if search is not connected). The intake stacks on phones. Below it are optional work interests and *Your skills* (removable chips, first eight shown until expanded), with *See my moves* beside the selected skills (disabled until one skill is added).
- Editing Aina's skills turns the profile into the visitor's own (the "Viewing as Aina" banner disappears).
- Nothing is stored; the profile lives in the browser tab only.

## Region view (22 Oct, made clearer)

- Separate from Team view (Carson, 22 Oct): an HR manager or adviser sees only their own team or class; only the regional viewer sees all groups. Viewer *Encik Faizal* (fictional regional skills centre officer), nav *For organisations → Region view*. The centre funds training for three fictional groups: Finance team, Graduating class, Logistics office (4 people).
- *What this view is for*: the main question uses the panel width, followed by compact Person (Your plan), Group (Team view), and Region (this view, highlighted) cards without connector arrows. The page introduction identifies the regional skills centre audience.
- *Which SDG targets the funded training reaches*: per strong target, "n of m people" and a bar split by group colour with group counts; 4.4 baseline row; possible links collapsed. **Totals only, no names.**
- *Routes that would reach more targets*: table by role of 2nd/3rd moves that add targets the best move does not reach (people count by group, targets added). Rule and tests: `src/region.ts` (`regionSdg`, `routesToFund`), `src/region.test.ts`.

## Low-data mode (account menu, 23 Oct)

- Lives in the account menu (the *View as* menu, now also shown on tablets and phones), in its own row below the demo people: *Low-data mode*, On/Off, "Uses system fonts. News and labour figures show the last saved copy until you load today's." It is not in the header or the language menu. Not switched on by connection speed; it starts on only when the device's own Data Saver is on (`navigator.connection.saveData`). On: no web font (system fonts), news and labour-force panels show the bundled snapshot and fetch live data only on request (*Load today's headlines*). Starts on when the browser reports save-data; the choice is remembered in this browser. Independently, screens other than Home, Your skills and Your moves load on demand, and the server gzips text files and caches `dist/assets/` for a year. First visit measured at 229 KB (Chromium, 390 px, via `server/index.mjs`, font excluded because it is blocked in Claude's workspace).

## Language (sidebar)

- A compact globe-and-language select sits at the bottom of the desktop rail and beside the brand on phones, remembered in the browser (localStorage, with fallback). Covers navigation, page titles, Home, step headings, buttons, controls and table headers (`src/i18n.tsx`; drafted with Claude, **team must review the Malay and Chinese**). ESCO skill labels and role titles stay in English (ESCO has no Malay or Chinese version). All screen text is translated except provider course titles, ESCO skill and role names, data-source names and the ESCO licence sentence (required in English); the footer says so in BM and Chinese.

## View as (sidebar) and Home: one tool, four kinds of user

- No sign-in. A **View as** chip near the top of the rail works like an account menu but only swaps fictional demo data: **Aina** (working adult whose job AI is changing), **Hakim** (fresh graduate), **Puan Rosnah** (HR and learning manager → Team view, finance team), **Encik Lim** (university career adviser → Team view, graduating class), **Me (my own skills)**. The closed chip shows the selected name above a small **Individual**, **Team**, or **Region** label; the full role description remains in the menu. Label: "Demo people are fictional. No sign-in in this prototype."
- The sidebar follows the viewer: individuals see *My career* (Your skills / moves / plan); HR and the adviser see *My team* (Team view). Everyone sees *The job market*.
- The workspace header follows the selected viewer on desktop and in the mobile menu: individuals see *Career path* then *Job market*; team and region viewers see *For organisations* then *Job market*. The selected section is always on the left. Returning from Job market keeps the selected viewer.
- On wide screens a compact navigation rail keeps the viewer switcher near the top and language choice at the bottom. Destinations use icons and short labels; the selected page has a soft green fill. At 980 px and below, the same navigation moves above the content.
- Public Home: the header has the same subtle bottom divider as workspace pages. The role prompt leads into Your skills. One subtle line draws from beyond the left edge to beyond the right edge behind the hero, clears, then draws a newly generated route; it stays within the section, pauses when offscreen or hidden, and remains still with reduced motion. Job market and organisation routes remain in the header.
- *Edit skills* while viewing a sample person switches the viewer to Me.

## 1. Your skills: interests

- Optional panel *What kind of work do you enjoy?*: six RIASEC choices in plain words, up to two. Skills, interests and goals share one panel in three columns (*Your skills* tags | interests | goals), with *See my moves* below; interests and goals are single-column checklists (tick box, name, small subtitle). Below 1100 px the columns stack. Sample people have picks (Aina: data and details, helping people; Hakim: solving problems, data and details).

## 2. Your moves

- **Current:** banner "Viewing as Aina…" or "Your n skills…", with *Use my own skills* / *Edit skills*; a short Q2 update with *Compare quarters* and *How ranking works*; controls *Job-ad data* (2026 Q1 / Q2), *If AI changes work* (Gradually / Quickly), and *Personalise ranking* on the same control line where space allows; ranked ledger with the current job pinned as "Now" and ▲▼ after a switch. Select a row for a focused role view with score facts, the full held and missing skill lists, evidence links, and *Plan this move* near the top. On phones the score parts stack under each role.
- **Compare quarters** shows all ranked moves with Q1 and Q2 rank, score, and occupation-group change, plus one DOSM source link. Logic: `src/changes.ts`.
- **How ranking works** explains the three score parts, fairness and limits, and links DOSM, ILO and ESCO once. The fairness claim is backed by `src/fairness.test.ts`.
- **Personalise ranking** is visible beside the data and scenario controls and wraps on narrower screens. Its interest switch is disabled until the person picks interests. The goal switch works the same way: disabled until goals are picked in Your skills, and it shows the picked goals' colour squares. The note says how optional parts affect the score, and arrows show score changes. A role view shows its leading work interests, interest fit, and a job tag or O\*NET source link; rows with fit ≥ 75% show "fits your interests".
- If there are no skills: a short prompt to add your own skills. Sample profiles remain available in View as.

## Your plan: certification link

- The supporting facts row links to the nearest optional SKM standard in the JPK register, with levels merged on one line. Related routes are labelled. Roles without a match have no certification link.

## SDG links (all career screens)

- Your skills: optional panel *What do you want your work to contribute to?* below the interests: goals 7, 8, 9, 12, 13, 16, 17 as cards (official colour square, number, short name, full name), up to two. Sample people have picks (Aina: 12 Responsible consumption; Hakim: 9 Innovation). Goals with no strong match are disabled with "Only possible matches so far" or "No strong match yet".
- Your moves: one *Goals* switch in **Personalise ranking**, next to *Interests* (off by default; adds goal fit to the score, arrows show the change). A row gets a tag (colour square, number, short name, plus "via skills" when only its skills link) only for a picked goal it links to, so tags set roles apart instead of repeating on every row. Each focused role view shows its strong targets with how many of its skills match ("Strong match · checked"), or "No strong match to a specific SDG target yet"; then the 4.4 baseline and a collapsed *Possible links (n), not checked*.
- Your plan: linked target badges and short goal names sit in the supporting facts row; the badges open the UN goal pages and expose the full target title. They indicate connections, not measured impact. The selected course shows the skills it may build; uncovered skills remain visible separately.
- Team view: one compact row per linked target combines the selected role's reason with a count of linked gap skills. SDG 4.4 shows both the broad link for all gap skills and the smaller count with a specific ESCO digital flag. Full skill names stay in *Shared gaps* above, and the method note still distinguishes connections from measured impact.

## 3. Your plan

- **Entry:** *Plan this move* in a focused role view of Your moves, or the sidebar career step (defaults to the top move). A select at the top switches between the person's ranked moves; *Back to your moves*.
- **Learning route:** one compact panel shows the gap count and *n courses, in order*. Left: **Learning order**, a numbered list (checked courses first, then AI suggestions; first 5, then *Show all n*), each step with provider, stated time and *Checked course* / *AI suggestion*, and *About n hours of checked courses* (provider-stated hours of the checked courses; Coursera workloads are free text and are not added). Selecting a step shows it on the right with its linked skills and provider link. (23 Oct: replaced the course dropdown, because must-have 4 asks for an ordered plan with estimated time.) Optional demo evidence stays with the selected course; completion is not verified here. Rule: `SIGNALS_AND_MATCHING.md` → "Learning plan rule".
- **Supporting facts:** a short row links to the optional SKM/NOSS standard (with related routes labelled), course access when available, and linked SDG targets. Two small milestone markers remain locked until course completion can be verified. Course selection and the course source label replace the long stacked course cards and explanatory sections.
- If there are no skills: a short prompt to add your own skills. If nothing is missing: "Nothing to build".

## Your plan usability refinement (22 Oct 2026)

- Current order is role selector → skill count and ordered course list → selected course and action → compact supporting facts. The plan page omits the redundant large title. On phones, the course selector and action stack in the same panel.
- Course evidence is optional and collapsed behind a keyboard-accessible summary. No evidence: *Finished this course? Try a demo evidence link*; submitted evidence: *Evidence submitted — not verified*, visible even while collapsed. Expanding reveals the fictional-only privacy notice before the form, validation, link and edit/remove controls. No evidence or verification behaviour changed.
- The unavailable-verification notice sits with the selected course. Evidence links do not verify completion or unlock milestones. The course selector labels AI suggestions and the detail identifies whether the course was checked by hand.
- Milestones appear as two tiny locked markers, for the first course and the full plan. The pure eligibility rule remains in `src/milestones.ts`; no verification service is connected.

## Learning milestone badges — step 4 (22 Oct 2026, corrected)

- User removed self-reporting. No completion-report checkbox, report state or self-reported badge text remains in the current UI. First course completed requires at least one authoritative verified course completion. Selected plan’s courses completed requires verification for every unique current-plan course URL, including AI suggestions and excluding NOSS. Empty plans never earn.
- Provider/reviewer verification is not connected, so the current verified-course set is deliberately empty: both badges stay Locked. The app does not detect external course completion. Evidence links and opened pages never unlock badges; verified progress remains zero. Future trusted verification can drive the pure eligibility rule; badges do not establish skill mastery.
- Visuals use two distinct SVG awards: a star medal with ribbons and a trophy. The awards are small icons in separate cards with green/gold tints and readable lock-status chips. Locked milestones remain subdued; earned styling uses stronger gold and ledger green. No invented earned demo state is exposed.
- Build and 88 tests pass. Edge desktop 1440 × 1000 and phone 390 × 844: no self-report controls/text, locked state, evidence not unlocking, unchanged verified bar, role changes and EN/MS/ZH fit pass. No page errors. New translations need team review.

## Changing the highlighted course — step 3 refinement (22 Oct 2026)

- Change course opens a native modal dialog with courses from the selected role's actual plan (including collapsed AI suggestions, identified as suggestions). A warning states the highlighted course and Start/Continue link will change; evidence and visited-link history are retained; switching does not complete a course.
- Selecting a draft does not apply it. Confirm course change updates the highlighted title, provider and action URL; Cancel or Escape preserves the previous course. Same-course confirmation is disabled. Browser modal focus and focus restoration are retained.
- Choices persist in memory per learner and target role across page/role changes, clear on refresh, and are used only while the course remains in the current plan. Explicitly chosen courses can be revisited even with submitted evidence. Default next-course behaviour applies when no valid choice exists. The heading names the selected role to distinguish occupation from course title.
- Build and 84 tests pass. Edge desktop/phone checks cover warning/draft/confirm/cancel/Escape/focus, Start/Continue, evidence preservation, unchanged completion, navigation, learner/role isolation, refresh and EN/MS/ZH dialog fit. No page errors; team translation review pending.

## Next learning action — step 3 (22 Oct 2026)

- A compact Your next learning step panel above the progress summary highlights the first course in the existing plan order without submitted evidence. Checked courses come before AI suggestions; the panel labels suggestions as not hand-checked. No independent claim that a course is unfinished: completion remains unverified.
- Start learning opens the provider in a new tab; Continue learning reopens that same provider URL after a link was clicked this session. It does not restore lesson position. The provider name and each course's existing View course link remain visible; both actions record the visited URL only.
- Visited links are in memory per profile owner, survive navigation/role changes and clear on refresh. They give no evidence or completion credit and do not alter skills, recommendations or SDG claims. Team cards do not get the next-action panel.
- Submitting evidence advances the next-course selection without implying completion; removing it makes the earlier course eligible again. With evidence for every course, show an unverified-completion notice and retain every course link below; with no courses, omit the panel.
- Build and 84 tests pass. Edge desktop 1440 × 1000 / phone 390 × 844 checks cover provider URL and label, Start/Continue, navigation, learner separation, translated fit and action size, AI fallback, all-evidence state, removal, target changes, Team exclusion and refresh. No page errors; team translation review remains pending.

## Completion evidence — credential-link prototype (22 Oct 2026)

- Supersedes reflection/activity tracking and the earlier course quiz. Each individual-plan checked course and AI suggestion accepts a fictional public HTTPS credential link. Real certificates and personal information are prohibited in this demo; file uploads are not enabled.
- A submission shows Evidence submitted — not verified. Only URL syntax is checked: HTTPS, a dotted hostname, no embedded credentials and a maximum of 2,000 characters. The app does not fetch the link or confirm existence, issuer, learner identity or course relevance. It has no reviewer queue or provider integration.
- Links can be edited, cancelled during editing, or removed. Removing evidence reduces the native, labelled bar. Step 2 replaces the submission bar with a labelled verified-completion bar and a separate evidence-submission count. The course total uses unique course URLs in the current plan, including hidden suggestions; NOSS routes are excluded. Completion remains zero because there is no verification integration; submitting a link never advances it. The summary distinguishes course completion from mastery of linked skills. No skills, gaps, scores, badges or SDG claims change.
- Links stay in App memory, separate for Aina, Hakim and Me; navigation and target changes preserve them, refresh clears them. Nothing is uploaded or sent to a reviewer. Team view and NOSS certification routes have no submission controls.
- Build and 84 tests pass. Installed Edge desktop 1440 × 1000 and phone 390 × 844 checks cover malformed/unsafe URLs, submission/edit/cancel/remove, checked/AI course counts, navigation, role/learner separation, refresh and EN/MS/ZH phone fit. No page errors; existing favicon 404 excluded. New translations still need team review.

## Team view (For teams)

For HR / L&D managers (a fictional five-person finance team) and career centres (a fictional class of three graduates); brief target groups 3 and 4.
- **Group** switch; a banner names who the view is for.
- **Who fits which role:** heatmap, one row per person, one column per role; each cell shows that person's score (same rule as Your moves, Q2 2026, gradual AI change). The current job shows "Now". The last row averages the moves only. Shade reinforces the number; the number is always shown. Scrolls sideways on phones.
- **Training plan for <role>** (left) + **Team training and the SDGs** (right, sticky; stacks under 1100 px): selecting a role name groups the gaps the movers share into numbered course cards, using the same rule and cards as Your plan (`planForGaps`: checked courses first, then AI suggestions, first 4 then *Show all*), each with *Needed by n of m: names*. Gaps with no course are listed once. *Who lacks each skill (n gaps)* (collapsed) groups the skills by exactly who lacks them ("All 3 lack", "1 of 3 lack · Siti"; "partly" for transferable), as tags, most people first.
- **People** (22 Oct): a list below the heatmap, one line per person (initial, name, current job and skill count, best move and score) with *Open profile*. Names in the heatmap open the same profile.
- **Profile page** (22 Oct): opens as its own page, like a role in Your moves, with *Back to {team}*. It starts on the person's best move: header (initial, name, job, skills); *Where {name} fits best*: three role cards with score and "Best move in n% of futures" (clicking one switches the role on this page only); *Getting to {role}*: the skill-bridge bar (have / related / to learn); *Skills to learn* (neutral tags, first 6, *Show all*) beside *Start with* ("About n hours", numbered course steps with time chips, step 1 highlighted with *Open course*). A note says each person confirms their own skills and decides their own move.
- Footer: everyone is fictional; in real use each person confirms their own skills and the manager sees the group view, not CVs.

## Check an ad (The job market, 24 Oct)

- Sub-tab between *Job ads* and *AI impact*. A text box for pasting an ad, *Try a fictional ad*, *Check this ad*, *Clear*.
- After matching: *Skills this ad asks for* with one checkbox per matched skill, grouped *To build* / *Close to a skill you have* / *You have* (only when the person has skills; otherwise one list and *Add skills*). One summary line: "You have 9 of the 12 skills ticked from this ad. 3 to build."
- *Closest role we track* card: demand change (DOSM), ILO exposure, ESCO link, and the *Find this role* links. *Checked courses for these gaps* uses the Your plan course rule.
- Optional *Your CV* box under the ad (fictional example fills both). With a CV, a panel *Does your CV show these skills?* groups the ticked ad skills: *You have these, but your CV does not show them* (add a line), *Not on your CV or in your skills yet*, *Your CV already shows* (with the CV line). Exact ESCO match.
- Once a CV is pasted, a panel *Things to avoid in your CV* shows the text rules that fired (with the matched text and a source link) and an 8-item *Check the file yourself* checklist. Works without RunPod.
- Errors and empty states are plain sentences; if the match service is down the screen says so and nothing is invented.

## Your moves: Find this role (24 Oct)

- Role page ends with *Find this role*: JobStreet, LinkedIn, Indeed and MYFutureJobs links built from the role title. The line under it says we do not collect or count the ads.

## Job ads / AI exposure

- **Job ads:** latest monthly unemployment rate from OpenDOSM as a context line (a different measure; hidden until imported), then DOSM online job ads by occupation group, Q1 → Q2 2026, one table, source stated once.
- **AI impact by role** (nav *AI impact*, 22 Oct): one table, three views per role: *Could change* (ILO mean ± SD), *AI applicable* (Microsoft), *Used with AI today* and *How AI is used* (Anthropic: observed exposure; automates vs assists bar), with higher/middle/lower dots on one common scale, each role's SOC code, and one source line per view ("not imported yet" until the Anthropic import runs).
- **Signal sources** (22 Oct): every source with what it measures, where, how often it updates, its date (read from the files), what it is used for, and an *in the score* tag for DOSM, ILO and ESCO.

## Workplace news / Skills in demand — Soon

- **Workplace news (current):** GDELT headlines from Malaysian outlets with outlet, date and topic filter (AI and automation, Layoffs, Hiring, Reskilling, Pay and wages, then AI industry); context only, never changes scores. Topic rule (23 Oct, `data/sources/news-topics.json`, same in `server/news.mjs` and `scripts/import_gdelt_news.py`): an AI headline counts as *AI and automation* only with a work word (jobs, workers, skills, graduates, pekerja, 员工 …), otherwise *AI industry*; *Hiring* is dropped when the headline says arrested, extremist, militant or terror ("extremist recruitment" is not hiring). Titles are cleaned of GDELT's spacing ("RM2 , 000" → "RM2,000"); words are never changed. The server refreshes it once a day until 1 Nov 2026 (memory only) and falls back to the committed snapshot. **In brief:** for each topic, the headline count, number of outlets and languages, plus the 3 key headlines: the real headlines closest to the topic centre in RunPod bge-m3 embeddings (one RunPod batch per daily set, cached). No text is written by AI; the box is hidden when RunPod is not configured.
- **Skills in demand:** not connected; role skills from ESCO appear in *Your moves*.

## Removed on 21 Oct 2026

The free-text *My profile* form, the *My skill gaps* comparison and the *Sign in* demo entry were replaced by **1. Your skills**: the old form did not feed the ranking, and two disconnected profile flows confused first-time visitors. `src/personal.ts` and `src/market.ts` were removed with them.

## Every screen

Footer with sources and the ESCO acknowledgement. Layout checked at 1440 px and 390 px with no horizontal scrolling.

## Future skills radar (The job market)

- Simplified 21 Oct after feedback ("too many tags, users don't know what to do"). Switch: *If AI changes work: Gradually / Quickly*.
- **Your skills:** three cards, **Growing in value · Holding steady · At risk** (top, middle and bottom third of skill groups), listing only the viewer's own skills (first 5, then *+n more*), a one-line reason, and one next step: *Build on these in Your plan*, *See roles that use them*, *See moves that reuse them*. With no skills: a button to add them.
- **The jobs behind these signals:** the nine roles as plain rows, best outlook first: job-ad change, AI exposure, ▲▼ move since the previous quarter, a band label, and *Show its n skills (you have m)*; skill tags appear only when opened. If job ads fell for all nine, a note says the labels compare the jobs with each other.
- *How this is worked out* (collapsed): the method note, the Q1/Q2 data switch and the "estimate, not measured demand" note.

## Home: two starting choices (24 Oct 2026)

Two cards side by side under the headline: *I'm a fresh graduate* (green button *Start here*, opens *Check an ad* with an empty profile) and *I already work* (the existing "I work as" box, outlined button). On a phone they stack, fresh graduate first. The line under them says nothing typed is stored (only language and low-data choice are kept in the browser).

### Fresh-graduate path (24 Oct 2026)

"Start here" on Home sets an in-memory flag and opens *Your skills* with a three-step bar: **1 Your CV** (Your skills), **2 A job ad** (Check an ad), **3 Your plan**. The bar replaces the usual sub-menu on those three screens only, and the header shows *Career path* as active. The flag is cleared by choosing any other start (role box, sample person, organisation view) or by going Home; a refresh or server restart opens Home without it. Job market pages are unchanged.

On the path each step ends with one green **Next** button: *Next: A job ad* (disabled until a skill is added), *Next: Your plan* (shown after an ad is checked; opens the plan for the ad's closest role, or the role picker if none), and after the plan a panel *Want to try another role?* that opens *Your moves*.

The CV read in step 1 (file or pasted text) is kept in memory and fills the *Your CV* box in step 2, so it is pasted once. It is cleared when the person goes Home or starts again, and never stored.

*A job ad* starts with one main text box for duties and requirements and a smaller optional CV text box beside it (stacked on phones). Both fields stay visible; a fictional example fills both. The three-step path is centred with chevrons between the labelled steps. After matching, a count strip and proportional bar show skills held, related, and to build; visitors review and untick AI matches before using the closest-role and course information. CV text checks and the optional file checklist appear with results, where they are relevant. This remains one step: the input and its results need to stay together for reviewing matches.
