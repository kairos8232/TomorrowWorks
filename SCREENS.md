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

## Home

- **Question it answers:** what is this, who is it for, how does it work, can I trust the numbers?
- **Current:** headline "AI is changing your job. See where you can move next."; one-sentence method; two actions (*Start with my own skills*, *Try a sample person*); privacy line; numbered **How it works**; four fictional viewer cards, with live top moves for Aina and Hakim; **Where the numbers come from** (DOSM, ILO, ESCO in plain words, linked).
- On wide screens the introduction and steps sit side by side, followed by four viewer cards. On medium screens the cards form two columns; on phones one column. The repeated source summary is omitted from the Home footer, while the ESCO acknowledgement remains.
- Aina is **fictional**, labelled as such everywhere. Her skills are ESCO's essential skills for *accounting assistant*.

## 1. Your skills

- **Current:** *Your current job* (ESCO role or "Not in this list"; shown as "Now" outside the ranking) and *Search the skill list* share the left side of the intake area on wide screens. *Describe your work* sits beside them and uses RunPod skill search (shows "match n%", user adds what is true; clear message if search is not connected). The intake stacks on phones. Below it are optional work interests and *Your skills* (removable chips, first eight shown until expanded), with *See my moves* beside the selected skills (disabled until one skill is added).
- Editing Aina's skills turns the profile into the visitor's own (the "Viewing as Aina" banner disappears).
- Nothing is stored; the profile lives in the browser tab only.

## Language (sidebar)

- A compact globe-and-language select sits at the bottom of the desktop rail and beside the brand on phones, remembered in the browser (localStorage, with fallback). Covers navigation, page titles, Home, step headings, buttons, controls and table headers (`src/i18n.tsx`; drafted with Claude, **team must review the Malay and Chinese**). ESCO skill labels and role titles stay in English (ESCO has no Malay or Chinese version). All screen text is translated except provider course titles, ESCO skill and role names, data-source names and the ESCO licence sentence (required in English); the footer says so in BM and Chinese.

## View as (sidebar) and Home: one tool, four kinds of user

- No sign-in. A **View as** chip near the top of the rail works like an account menu but only swaps fictional demo data: **Aina** (working adult whose job AI is changing), **Hakim** (fresh graduate), **Puan Rosnah** (HR and learning manager → Team view, finance team), **Encik Lim** (university career adviser → Team view, graduating class), **Me (my own skills)**. The closed chip shows the shorter **Me** label and its initial; the full description remains in the menu. Label: "Demo people are fictional. No sign-in in this prototype."
- The sidebar follows the viewer: individuals see *My career* (Your skills / moves / plan); HR and the adviser see *My team* (Team view). Everyone sees *The job market*.
- On wide screens a compact navigation rail keeps the viewer switcher near the top and language choice at the bottom. Destinations use icons and short labels; the selected page has a soft green fill. At 980 px and below, the same navigation moves above the content.
- Home: hero (*Start with my own skills*, *Try a sample person*) and *One tool, four kinds of user*: one card per demo viewer with the brief's group, a story, live top 3 moves (people) or team size (teams), and *View as …*.
- *Edit skills* while viewing a sample person switches the viewer to Me.

## 1. Your skills: interests

- Optional panel *What kind of work do you enjoy?*: six RIASEC choices in plain words, up to two. Sample people have picks (Aina: data and details, helping people; Hakim: solving problems, data and details).

## 2. Your moves

- **Current:** banner "Viewing as Aina…" or "Your n skills…", with *Use my own skills* / *Edit skills*; a short Q2 update with *Compare quarters* and *How ranking works*; controls *Job-ad data* (2026 Q1 / Q2), *If AI changes work* (Gradually / Quickly), and *Personalise ranking* on the same control line where space allows; ranked ledger with the current job pinned as "Now" and ▲▼ after a switch. Select a row for a focused role view with score facts, the full held and missing skill lists, evidence links, and *Plan this move* near the top. On phones the score parts stack under each role.
- **Compare quarters** shows all ranked moves with Q1 and Q2 rank, score, and occupation-group change, plus one DOSM source link. Logic: `src/changes.ts`.
- **How ranking works** explains the three score parts, fairness and limits, and links DOSM, ILO and ESCO once. The fairness claim is backed by `src/fairness.test.ts`.
- **Personalise ranking** is visible beside the data and scenario controls and wraps on narrower screens. Its interest switch is disabled until the person picks interests. Selected goals highlight linked roles; the separate switch adds them to the ranking. The note says how optional parts affect the score, and arrows show score changes. A role view shows its leading work interests, interest fit, and a job tag or O\*NET source link; rows with fit ≥ 75% show "fits your interests".
- If there are no skills: a short prompt to add your own skills. Sample profiles remain available in View as.

## SDG links (all career screens)

- Your moves: each focused role view shows its SDG target badges (links to sdgs.un.org) with the reason; *Goals you care about* chips (7, 8, 9, 12, 13, 16, 17, several allowed) sit in **Personalise ranking** and mark rows "linked to SDG n" (through the role) or "skills linked to SDG n"; the *Count in ranking* switch (off by default) adds goal fit to the score, and the arrows show the change.
- Your plan: one compact row per linked SDG target combines the selected role's reason with the count of linked gap skills. SDG 4.4 separates the broad link for all gaps from the specific ESCO digital subset; these links indicate connections, not measured impact. Full gap names stay in the course and uncovered-skill sections above.
- Team view: one compact row per linked target combines the selected role's reason with a count of linked gap skills. SDG 4.4 shows both the broad link for all gap skills and the smaller count with a specific ESCO digital flag. Full skill names stay in *Shared gaps* above, and the method note still distinguishes connections from measured impact.

## 3. Your plan

- **Entry:** *Plan this move* in a focused role view of Your moves, or the sidebar career step (defaults to the top move). A select at the top switches between the person's ranked moves; *Back to your moves*.
- **Summary line:** n essential skills to build (m partly there); k free courses cover x of them, about h hours as the providers state it.
- **Numbered steps:** course title (link to the provider page), one compact provider · level · cost · stated-time line, and *Builds* with the gap skills it closes (≈ marks a skill the person partly has).
- **Skills without a checked course:** one row per leftover gap, beside its best AI suggested Coursera match or an explicit no-suggestion state. These matches are unverified text similarities, not quality ratings; the list starts with 6 rows and can show all. The catalogue date and Rakyat Digital note remain below it.
- **Method note:** checked date, course ordering and the basis for skill links appear in one visible line. Rule: `SIGNALS_AND_MATCHING.md` → "Learning plan rule".
- **Malaysian certification route:** SKM level and the NOSS title in the selected language where the source provides both Malay and English (full bilingual title on hover), code and official register link, a brief closest/related distinction, and the optional centre or prior-learning route. Roles without one say no matching NOSS was found in the checked register.
- If there are no skills: a short prompt to add your own skills. If nothing is missing: "Nothing to build".

## Team view (For teams)

For HR / L&D managers (a fictional five-person finance team) and career centres (a fictional class of three graduates); brief target groups 3 and 4.
- **Group** switch; a banner names who the view is for.
- **Who fits which role:** heatmap, one row per person, one column per role; each cell shows that person's score (same rule as Your moves, Q2 2026, gradual AI change). The current job shows "Now". The last row averages the moves only. Shade reinforces the number; the number is always shown. Scrolls sideways on phones.
- **Shared gaps for <role>:** selecting a role name lists its essential skills by how many movers lack them (names shown; "partly" for transferable), with the first checked course for each (free before paid), top 12.
- Footer: everyone is fictional; in real use each person confirms their own skills and the manager sees the group view, not CVs.

## Job ads / AI exposure

- **Job ads:** latest monthly unemployment rate from OpenDOSM as a context line (a different measure; hidden until imported), then DOSM online job ads by occupation group, Q1 → Q2 2026, one table, source stated once.
- **AI exposure:** ILO exposure for the nine roles, one table, with the "not a job-loss forecast" note.

## Workplace news / Skills in demand — Soon

- **Workplace news (current):** GDELT headlines from Malaysian outlets with outlet, date and topic filter (AI and automation, Layoffs, Hiring, Reskilling); context only, never changes scores. Shows "No news imported yet" until `scripts/import_gdelt_news.py` has been run.
- **Skills in demand:** not connected; role skills from ESCO appear in *Your moves*.

## Removed on 21 Oct 2026

The free-text *My profile* form, the *My skill gaps* comparison and the *Sign in* demo entry were replaced by **1. Your skills**: the old form did not feed the ranking, and two disconnected profile flows confused first-time visitors. `src/personal.ts` and `src/market.ts` were removed with them.

## Every screen

Footer with sources and the ESCO acknowledgement. Layout checked at 1440 px and 390 px with no horizontal scrolling.
