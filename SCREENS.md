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

- **Current:** *Your current job* (ESCO role or "Not in this list"; shown as "Now" outside the ranking); *Describe your work* → RunPod skill search (shows "match n%", user adds what is true; clear message if search is not connected); *Or search the skill list* (fallback); optional work interests; *Your skills* (removable chips, first eight shown until expanded); *See my moves* beside the selected skills (disabled until one skill is added).
- Editing Aina's skills turns the profile into the visitor's own (the "Viewing as Aina" banner disappears).
- Nothing is stored; the profile lives in the browser tab only.

## Language (sidebar)

- English / Bahasa Malaysia / 中文 select under the brand, remembered in the browser (localStorage, with fallback). Covers navigation, page titles, Home, step headings, buttons, controls and table headers (`src/i18n.tsx`; drafted with Claude, **team must review the Malay and Chinese**). ESCO skill labels and role titles stay in English (ESCO has no Malay or Chinese version). All screen text is translated except provider course titles, ESCO skill and role names, data-source names and the ESCO licence sentence (required in English); the footer says so in BM and Chinese.

## View as (sidebar) and Home: one tool, four kinds of user

- No sign-in. A **View as** chip under the language select works like an account menu but only swaps fictional demo data: **Aina** (working adult whose job AI is changing), **Hakim** (fresh graduate), **Puan Rosnah** (HR and learning manager → Team view, finance team), **Encik Lim** (university career adviser → Team view, graduating class), **Me (my own skills)**. Label: "Demo people are fictional. No sign-in in this prototype."
- The sidebar follows the viewer: individuals see *My career* (Your skills / moves / plan); HR and the adviser see *My team* (Team view). Everyone sees *The job market*.
- Home: hero (*Start with my own skills*, *Try a sample person*) and *One tool, four kinds of user*: one card per demo viewer with the brief's group, a story, live top 3 moves (people) or team size (teams), and *View as …*.
- *Edit skills* while viewing a sample person switches the viewer to Me.

## 1. Your skills: interests

- Optional panel *What kind of work do you enjoy?*: six RIASEC choices in plain words, up to two. Sample people have picks (Aina: data and details, helping people; Hakim: solving problems, data and details).

## 2. Your moves

- **Personalise with interests and goals** is an optional disclosure below the data and scenario controls. Its interest switch is disabled until the person picks interests. When on, the note says interests count for one sixth, and arrows show the change. Each expanded row shows the role's top three work interests, the person's interest fit, and the job tag or O\*NET source with a link; rows with fit ≥ 75% show "fits your interests".
- **What changed with <latest quarter> job-ad data** is a collapsed summary near the top; open it for the same skills and scenario scored with the previous and latest DOSM snapshots, the top three changes (rank, score, and occupation group), and *Show all*. Logic: `src/changes.ts`.
- **Is this fair?** is a disclosure below the ledger: Used / Never asked / Checked / Limits. The "Checked" claim is backed by `src/fairness.test.ts`.
- **Current:** banner "Viewing as Aina…" or "Your n skills…", with *Use my own skills* / *Edit skills*; **How to read this** disclosure; controls *Job-ad data* (2026 Q1 / Q2) and *If AI changes work* (Gradually / Quickly); ranked ledger with the current job pinned as "Now"; ▲▼ after a switch; expandable rows with facts and *Plan this move* before the longer skill lists. On phones, each row puts the three score parts in one compact line.
- If there are no skills: a short prompt to add skills or try Aina.

## SDG links (all career screens)

- Your moves: each expanded row shows the role's SDG target badges (goal colour stripe, links to sdgs.un.org) with the reason; *Goals you care about* chips (7, 8, 9, 12, 13, 16, 17, several allowed) sit in **Personalise with interests and goals** and mark rows "linked to SDG n" (through the role) or "skills linked to SDG n"; the *Count in ranking* switch (off by default) adds goal fit to the score, and the arrows show the change.
- Your plan: *How this move connects to the SDGs* panel: role targets with reasons, then *Skills you would build* grouped by target with counts and names; note on 4.4 and that links are connections, not measured impact.
- Team view: the same panel for the selected role's shared gaps.

## 3. Your plan

- **Entry:** *Plan this move* in an expanded row of Your moves, or the sidebar career step (defaults to the top move). A select at the top switches between the person's ranked moves; *Back to your moves*.
- **Summary line:** n essential skills to build (m partly there); k free courses cover x of them, about h hours as the providers state it.
- **Numbered steps:** course title (link to the provider page), provider · level · cost, the provider's stated time, and *Builds* with the gap skills it closes (≈ marks a skill the person partly has).
- **No checked course yet:** leftover gaps, with a line saying courses are only listed after their page was checked.
- **How this plan is made:** Skills, Order, Time, Courses in plain words. Rule: `SIGNALS_AND_MATCHING.md` → "Learning plan rule".
- **Malaysian certification route:** SKM level, NOSS title and code, which official list it comes from (link), "closest standard by title" or "related standard, not the same job", and that an SKM is one route, not a requirement. Roles without one say "No matching NOSS found in the registers we checked".
- If there are no skills: a short prompt to add skills or try Aina. If nothing is missing: "Nothing to build".

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
