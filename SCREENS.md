# TomorrowWorks screen guide

Updated 21 Oct 2026 after the first-visit clarity pass. **Current** = works today; **Soon** = shown in the menu with a "Soon" label and a short note. `CHECKLIST.md` tracks verified progress; `BUILD_STAGES.md` plans the next small commits. Update this guide with any screen change.

## Structure

```text
Home ─┬─ "Try it as Aina" ───────────────▶ 2. Your moves (Aina's skills loaded)
      └─ "Start with my own skills" ─────▶ 1. Your skills (empty)

My career (guided, step bar on top)      The job market (browse any time)
  1. Your skills   Current                 Job ads           Current
  2. Your moves    Current                 AI exposure       Current
  3. Your plan     Soon                    Workplace news    Soon
                                           Skills in demand  Soon
```

## Home

- **Question it answers:** what is this, who is it for, how does it work, can I trust the numbers?
- **Current:** headline "AI is changing your job. See where you can move next."; one-sentence audience and method; two actions (*Try it as Aina*, *Start with my own skills*); privacy line; numbered **How it works** (a real 3-step sequence); **Meet Aina** with her top three moves computed live from the Q2 2026 data; **Where the numbers come from** (DOSM, ILO, ESCO in plain words, linked).
- Aina is **fictional**, labelled as such everywhere. Her skills are ESCO's essential skills for *accounting assistant*.

## 1. Your skills

- **Current:** *Your current job* (ESCO role or "Not in this list"; shown as "Now", never recommended); *Describe your work* → RunPod skill search (shows "match n%", user adds what is true; clear message if search is not connected); *Or search the skill list* (fallback); *Your skills* (removable chips); *See my moves* (disabled until one skill is added).
- Editing Aina's skills turns the profile into the visitor's own (the "Viewing as Aina" banner disappears).
- Nothing is stored; the profile lives in the browser tab only.

## 2. Your moves

- **Current:** banner "Viewing as Aina…" or "Your n skills…", with *Use my own skills* / *Edit skills*; **How to read this** (Score, Skill fit, Demand, AI resilience, Now — in plain words, DOSM/ILO as abbreviations with full names); controls *Job-ad data* (2026 Q1 / Q2) and *If AI changes work* (Gradually / Quickly); ranked ledger with the current job pinned as "Now"; ▲▼ after a switch; expandable rows (facts under columns, *You have* / *To build*, ESCO link).
- If there are no skills: a short prompt to add skills or try Aina.

## 3. Your plan — Soon

Ordered missing skills for a chosen move, free or low-cost courses, and the Malaysian SKM route where a NOSS exists (stages 10a–10d).

## Job ads / AI exposure

- **Job ads:** DOSM online job ads by occupation group, Q1 → Q2 2026, one table, source stated once.
- **AI exposure:** ILO exposure for the nine roles, one table, with the "not a job-loss forecast" note.

## Workplace news / Skills in demand — Soon

- **Workplace news:** GDELT headlines from Malaysian outlets (stage 6d); context only, never changes scores.
- **Skills in demand:** not connected; role skills from ESCO appear in *Your moves*.

## Removed on 21 Oct 2026

The free-text *My profile* form, the *My skill gaps* comparison and the *Sign in* demo entry were replaced by **1. Your skills**: the old form did not feed the ranking, and two disconnected profile flows confused first-time visitors. `src/personal.ts` and `src/market.ts` were removed with them.

## Every screen

Footer with sources and the ESCO acknowledgement. Layout checked at 1440 px and 390 px with no horizontal scrolling.
