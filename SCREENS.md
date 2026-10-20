# TomorrowWorks screen guide

This guide describes the intended user journey. **Current** says what works today; **Planned** says what still needs building. `CHECKLIST.md` tracks verified progress, and `BUILD_STAGES.md` keeps changes in small commits. Update this guide with any screen change.

## Journey at a glance

| Screen | User's question | Access | Build stages |
| --- | --- | --- | --- |
| 01 Explore market | Which roles and skills are in demand now, and what could change? | Public | 5–6, 12 |
| 02 Sign in | How do I save a profile and get personal guidance? | Planned; demo continues without an account | 4b |
| 03 My profile | Which skills, experience, interests, and work preferences describe me? | Personalised flow | 4, 4b |
| 04 Role matches | Which roles fit me, and why? | Reviewed profile | 7–8, 12 |
| 05 My pathway | What should I learn next? | Selected role | 10–12 |

The product starts with a browseable market view, similar in purpose to a job discovery site. Users can explore before creating an account. When they ask for personalised advice, the intended flow is **sign in → fill or upload profile → review → role matches → learning pathway**. The preliminary demo uses a clearly labelled fictional profile in place of real sign-in and résumé upload. It must not pretend to create an account or parse a résumé.

The preliminary working slice should prove **public, dated signal → changed role recommendation or explanation**. The final product adds the full pathway, SDG connections, and scenario comparison. A screen with missing data explains the gap instead of inventing a result.

## 01 Explore market

**Purpose:** Help a visitor discover the labour market before sharing personal details.

**Current:** The app opens on a public market shell with separate current-demand, skills-needed, and future-outlook placeholders. No source, demand figures, or trends are connected yet. Its next action leads to the labelled demo sign-in entry.

**Planned:**

- Separate **current demand** (for example, relevant vacancy or labour-market measures), **skills requested now**, and **future outlook**. A future outlook is a scenario or estimate, never a present-day fact.
- Show a small set of roles or skills with useful filters only when the selected source supports the claim. State the geography, period, measure, source link, publication date, and snapshot retrieval date.
- Define what “rising” or “declining” means for that source. Do not turn research activity into a Malaysian hiring claim.
- Show a dated snapshot label, its refresh method, and useful empty, stale, and unavailable states.
- Offer a clear action to start personalised guidance, leading to Sign in.

**Ready when:** A visitor can understand what is needed now, what might change, and the evidence and uncertainty behind each claim. Stages 5–6 supply the public view; Stage 12 adds scenario comparison.

## 02 Sign in

**Purpose:** Mark the transition from public browsing to a saved personal profile.

**Current:** The sign-in entry states that sign-in is unavailable and offers a fictional sample profile. No account or personal-data storage exists. Navigation to personalised screens leads here until the visitor enters the demo.

**Planned:**

- Decide the account provider, session and deletion behaviour, and where any profile data is stored before implementing sign-in.
- Only show a real sign-in button when authentication works end to end. Clearly distinguish a demo continuation from account creation.
- Ask for profile details only after sign-in in the real product. Keep the preliminary demo limited to synthetic information.
- Treat résumé upload as a later, optional intake method with explicit consent, safe storage, deletion, and a review step before matching.

**Ready when:** The demo route is honest and functional; actual sign-in remains unchecked until real account and session behaviour is verified.

## 03 My profile

**Purpose:** Capture the person's starting skills and relevant preferences for matching.

**Current:** A fictional Junior Accountant example, form for role, skills, experience, interests, and optional work preferences or strengths, validation, review, and in-memory handoff. Refreshing clears the profile. The optional field is displayed in the review and does not affect matching yet.

**Planned:**

- Keep **work preferences or strengths** editable and job-relevant; do not infer personality or sensitive traits.
- In the real account flow, allow a résumé as an optional starting point. Show extracted skills for correction before using them.
- Keep match inputs limited to job-relevant information and explain how each affects results. Avoid protected traits and unsupported personality scores.
- Require review before personalised matching, and preserve the reviewed profile while navigating or switching scenarios.

**Ready when:** A teammate can load, edit, review, and carry the fictional profile into matching. Real account storage and résumé parsing are separate future work.

## 04 Role matches

**Purpose:** Explain which candidate roles fit the reviewed profile and which skills are missing.

**Current:** Placeholder only; no roles or scores are generated.

**Planned:**

- Prompt for a reviewed profile if one is missing. State whether a dated evidence snapshot is being used.
- Rank a small verified role set. Show the score, matched and missing skills, the reason for the ranking, and any trend influence with source and date.
- Explain the scoring formula and limits; do not present fabricated job counts, percentages, or model confidence as facts.
- Let the user inspect a role's full skills gap and select it for a learning pathway.
- In Stage 12, compare moderate and rapid AI-change assumptions using the same profile. Label all future results as estimates.

**Ready when:** A teammate can hand-check the ranking and change a sourced signal to produce a visible difference. Recommendations support a career decision; they do not make a hiring decision.

## 05 My pathway

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
- Make navigation usable on a phone and by keyboard; express errors and status in text.
- Replit serves the app. A RunPod GPU result must affect a visible feature when integrated, with its model, input, output, and fallback documented.
- Keep service credentials and real personal data out of the browser bundle and repository.
