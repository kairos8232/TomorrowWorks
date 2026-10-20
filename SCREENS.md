# TomorrowWorks screen guide

This is the product contract for the four screens in `src/main.tsx`. It describes the intended behaviour; **Current** and **Planned** distinguish what works today. `CHECKLIST.md` tracks completed work, and `BUILD_STAGES.md` splits the remaining work into small commits. Update this guide in the same commit whenever a screen's behaviour changes.

## Journey at a glance

| Screen | User's question | Result | Build stages |
| --- | --- | --- | --- |
| 01 My profile | What can I do now, and what interests me? | Reviewed skills profile | 4 |
| 02 Skills radar | What is changing, according to which source? | Dated, attributed skill or role signals | 5–6 |
| 03 Role matches | Which roles fit me, and why? | Ranked roles with skill gaps and trend evidence | 7–8, 12 |
| 04 My pathway | What should I learn next, and why? | Ordered learning steps, resources, and SDG reasons | 10–12 |

The preliminary demo should prove the chain **profile → sourced signal → changed recommendation or explanation**. Later stages complete the pathway, SDG, and scenario features. Navigation may expose a screen before its data is ready; that screen must explain what is missing instead of showing a fabricated result.

## 01 My profile

**Purpose:** Let a person describe their starting point without uploading a real CV.

**Current:** The form accepts current role, comma-separated skills, experience, and interests. It can load a fictional Junior Accountant example, validates that every field has content, displays a review, and keeps the reviewed profile in memory while navigating the app. Editing a field clears the reviewed profile. Refreshing the browser clears it.

**Planned screen behaviour:**

- Show clear labels and a fictional example. Keep CV upload outside the preliminary scope.
- Explain that entries are used to compare skills with candidate roles, not to decide hiring outcomes.
- Require a reviewed profile before offering personalised matches. Preserve it when moving among screens or switching scenarios during the session.
- If the form is incomplete, show a field-specific correction without losing entered content.

**Ready when:** A teammate can load, edit, review, and carry the synthetic profile into a role match. Stage 4 covers the current implementation; later matching work will verify the handoff.

## 02 Skills radar

**Purpose:** Show the evidence the app uses to discuss changing skills or roles.

**Current:** Navigation and an honest “no trend data” placeholder only.

**Planned screen behaviour:**

- Show a small set of rising or declining signals supported by the chosen public source. State what that source actually measures; research activity, vacancies, and labour statistics must not be treated as interchangeable.
- For each signal, show its name, direction, plain-language meaning, source name and link, source publication date, and snapshot retrieval date.
- Label saved data as a snapshot and explain how it is refreshed. Define how a changed source value becomes a changed signal.
- Show a useful empty, stale, or unavailable state. Never imply that a saved snapshot is live data.
- Let the user open the original source and continue to role matches with the same profile.

**Ready when:** A teammate can identify the evidence behind every visible signal and demonstrate a repeatable source refresh. Stages 5–6 build this; Stage 8 proves its effect on matching.

## 03 Role matches

**Purpose:** Explain which candidate roles fit the reviewed profile and what the person would need to learn.

**Current:** Placeholder only. A reviewed profile is indicated, but no roles or scores are generated.

**Planned screen behaviour:**

- If no profile has been reviewed, prompt the user to finish Profile. If source evidence is unavailable, explain whether matches can be shown with a dated snapshot or must wait.
- Rank a small, verified role set. Each role card shows its match score, matched skills, missing skills, the reason for its position, and the source and date behind any trend influence.
- Explain the scoring formula and its limits in plain language. Do not display made-up job counts, percentages, or model confidence as facts.
- Let the user select a role to inspect its full skills gap and continue to its pathway.
- Add a clearly labelled moderate/rapid AI-change switch in Stage 12. Keep the same profile and explain which assumptions changed the result.
- Explain that these are decision aids, not hiring decisions or guaranteed forecasts.

**Ready when:** A teammate can hand-check the ranking, trace each explanation to profile skills and evidence, and change a source signal to produce a visible difference. Stages 7–8 build the preliminary version; Stage 12 adds scenarios.

## 04 My pathway

**Purpose:** Turn a selected role's missing skills into an actionable plan.

**Current:** Placeholder only. No selected role, learning steps, resources, or SDG mappings exist.

**Planned screen behaviour:**

- If no role is selected, guide the user back to Role Matches.
- Show the selected role and ordered learning steps tied to its displayed missing skills. Give an estimated time and the basis for each estimate.
- Link to checked free or low-cost resources; show the provider and access or price condition rather than assuming every resource is free.
- Explain the reviewed SDG connection for the role and each recommended skill; omit unsupported mappings.
- When scenarios are available, make clear which assumptions affect the plan and keep the selected profile visible in context.

**Ready when:** A teammate can follow each step to a working resource, see which gap it addresses, and explain the SDG reasoning. Stages 10–12 build this after the preliminary submission.

## Shared screen rules

- Use the same terms for a skill, role, signal, and source across screens.
- Show source and date near claims based on public data. Label synthetic examples and estimates.
- Keep the app usable on a phone and by keyboard; give status and error messages text, not colour alone.
- Replit serves the app. A RunPod GPU result must affect a visible feature after integration; document its model, input, output, and fallback before calling it complete.
- Keep service credentials on the server and out of the browser and repository.
