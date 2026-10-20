# TomorrowWorks screen guide

This guide describes the intended user journey. **Current** says what works today; **Planned** says what still needs building. `CHECKLIST.md` tracks verified progress, and `BUILD_STAGES.md` keeps changes in small commits. Update this guide with any screen change.

## Places in the app

| Area | User's question | Access | Build stages |
| --- | --- | --- | --- |
| Explore | What can I find in the market? | Public landing page | 4c, 6 |
| Workplace changes | Which reported issues could affect work? | Public browsing; news or announcements | 4d, 5–6 |
| Demand | Which roles have supported demand signals now? | Public browsing | 5–6 |
| Skills | Which skills are requested now? | Public browsing | 5–6 |
| Outlook | What could change under stated assumptions? | Public browsing; estimates | 6, 12 |
| My profile | What skills, experience, interests, and work preferences describe me? | Personal area | 4, 4b |
| Skill gaps | Which skills or qualifications am I missing for a chosen promotion or move? | Personal demo after profile review; sourced version later | 4e, 7 |
| Role matches | Which roles fit me, and why? | Personal area after profile review | 7–8, 12 |
| My pathway | What should I learn next? | Personal area after role selection | 10–12 |
| Demo entry | How do I try personal guidance? | Action from personal area; real sign-in planned | 4b, 4c |

The product behaves like a browseable market app. **Explore, Workplace changes, Demand, Skills, and Outlook are destinations**, not numbered steps. Visitors can switch industries or search within available evidence without an account. A separate **My career** action opens the personal area. The preliminary demo uses a clearly labelled fictional profile in place of real sign-in and résumé upload. It must not pretend to create an account or parse a résumé.

The preliminary working slice should prove **public, dated signal → changed role recommendation or explanation**. The final product adds the full pathway, SDG connections, and scenario comparison. A screen with missing data explains the gap instead of inventing a result. Do not show a journey counter, progress bar, or generic Next/Back controls; use navigation and task-specific actions instead.

## Explore

**Purpose:** Help a visitor discover the labour market before sharing personal details.

**Current:** The app opens on a public market shell with a fictional skill-gap demo action near the introduction, followed by cards for independent Workplace changes, Demand, Skills, and Outlook destinations. Overview industry and keyword controls follow the cards; topic views place controls before results. Controls report the selected scope. The sourced evidence list is intentionally empty, so no demand figures or trends are shown yet.

**Planned:**

- Separate **current demand** (for example, relevant vacancy or labour-market measures), **skills requested now**, and **future outlook**. A future outlook is a scenario or estimate, never a present-day fact.
- Show a small set of roles or skills with useful filters only when the selected source supports the claim. State the geography, period, measure, source link, publication date, and snapshot retrieval date.
- Define what “rising” or “declining” means for that source. Do not turn research activity into a Malaysian hiring claim.
- Show a dated snapshot label, its refresh method, and useful empty, stale, and unavailable states.
- Make current demand, skills, and future outlook browsable destinations. Offer a separate action for personalised guidance.
- Show the selected industry, search term, and coverage status without implying every industry has data.

**Ready when:** A visitor can understand what is needed now, what might change, and the evidence and uncertainty behind each claim. Stages 5–6 supply the public view; Stage 12 adds scenario comparison.

## Workplace changes, Demand, Skills, and Outlook

**Purpose:** Let a visitor choose what to explore and switch topics freely.

**Current:** Workplace changes, Demand, Skills, and Outlook each have a dedicated view with an honest empty state. Visitors can switch topics and filter by industry or keyword without entering the demo. The selected scope remains in place across views. Sourced content remains future work.

**Planned:** Workplace changes shows attributed news or official announcements, tagged by industry and issue type; a report is not proof of the issue's scale. Demand describes the exact present-day measure and geography. Skills shows requested skills supported by the source. Outlook shows dated scenarios and assumptions, never current job counts. Each view links back to evidence once connected.

## Demo entry

**Purpose:** Mark the transition from public browsing to a saved personal profile.

**Current:** The My career action opens a demo entry that states sign-in is unavailable and offers a fictional sample profile. No account or personal-data storage exists. Personal navigation appears after the visitor enters the demo.

**Planned:**

- Decide the account provider, session and deletion behaviour, and where any profile data is stored before implementing sign-in.
- Only show a real sign-in button when authentication works end to end. Clearly distinguish a demo continuation from account creation.
- Ask for profile details only after sign-in in the real product. Keep the preliminary demo limited to synthetic information.
- Treat résumé upload as a later, optional intake method with explicit consent, safe storage, deletion, and a review step before matching.

**Ready when:** The demo route is honest and functional; actual sign-in remains unchecked until real account and session behaviour is verified.

## My profile

**Purpose:** Capture the person's starting skills and relevant preferences for matching.

**Current:** A fictional Junior Accountant example, form for role, skills, experience, interests, optional work preferences or strengths, and optional current qualifications; validation, review, and in-memory handoff. Refreshing clears the profile. The optional fields are displayed in the review and do not affect matching yet.

**Planned:**

- Keep **work preferences or strengths** editable and job-relevant; do not infer personality or sensitive traits.
- In the real account flow, allow a résumé as an optional starting point. Show extracted skills for correction before using them.
- Keep match inputs limited to job-relevant information and explain how each affects results. Avoid protected traits and unsupported personality scores.
- Require review before personalised matching, and preserve the reviewed profile while navigating or switching scenarios.

**Ready when:** A teammate can load, edit, review, and carry the fictional profile into matching. Real account storage and résumé parsing are separate future work.

## Role matches

**Purpose:** Explain which candidate roles fit the reviewed profile and which skills are missing.

**Current:** Placeholder only; no roles or scores are generated.

**Planned:**

- Prompt for a reviewed profile if one is missing. State whether a dated evidence snapshot is being used.
- Rank a small verified role set. Show the score, matched and missing skills, the reason for the ranking, and any trend influence with source and date.
- Explain the scoring formula and limits; do not present fabricated job counts, percentages, or model confidence as facts.
- Let the user inspect a role's full skills gap and select it for a learning pathway.
- In Stage 12, compare moderate and rapid AI-change assumptions using the same profile. Label all future results as estimates.

**Ready when:** A teammate can hand-check the ranking and change a sourced signal to produce a visible difference. Recommendations support a career decision; they do not make a hiring decision.

## Skill gaps

**Purpose:** Let a person compare their reviewed skills with a target they choose, including a promotion target, without treating public market evidence as a personal verdict.

**Current:** After reviewing the fictional profile, the person can choose a promotion or career move, edit an illustrative role and target-skill list, and compare exact skill names. The view separates skills already listed from missing names, shows any entered current qualifications, and says that no applicable certificate requirement is verified. Editing the profile or target clears the old comparison. No score or employer requirement is claimed.

**Next:** Link the comparison to sourced role requirements and role selection, then produce a learning pathway and SDG explanations. Keep the certificate section in its unverified state until applicable sources are checked.

**Sourced version:** Distinguish required from preferred skills and credentials. Show source, jurisdiction, date, and coverage for each target requirement; use trend evidence in the recommendation or its explanation. [PERSONAL_GUIDANCE.md](PERSONAL_GUIDANCE.md) defines the evidence contract.

## My pathway

**Purpose:** Turn a selected role's missing skills into practical learning steps.

**Current:** Placeholder only; no role, steps, resources, or SDG mappings are available.

**Planned:**

- Guide the user back to Role Matches if no role has been selected.
- Order learning steps by missing skill. Give a time estimate and its basis for each step.
- Link to checked free or low-cost resources, showing the provider and access condition.
- Explain reviewed SDG connections for the role and recommended skills; omit unsupported mappings.
- Show how a scenario changes the plan, with its assumptions and uncertainty visible.

**Ready when:** Each step addresses a displayed gap, its resource works, and its SDG reason can be explained.

## Shared rules

- Use consistent names for roles, skills, signals, sources, and scenarios across screens.
- Put source and date near public-data claims. Label synthetic examples, snapshots, and estimates.
- At 980 CSS pixels and below, navigation moves above the content in compact, scrollable rows; form columns stack at 620 pixels and below. The public overview uses two balanced card columns from 621–1379 pixels and four from 1380 pixels upward, within a wider content area. Buttons and links have visible keyboard focus. Keep navigation usable by keyboard and express errors and status in text.
- In My profile, current role/skills, experience/interests, and work preferences/qualifications share rows above 620 pixels. Keep the fictional-profile explanation and helper text visible beside their fields.
- Replit serves the app. A RunPod GPU result must affect a visible feature when integrated, with its model, input, output, and fallback documented.
- Keep service credentials and real personal data out of the browser bundle and repository.
