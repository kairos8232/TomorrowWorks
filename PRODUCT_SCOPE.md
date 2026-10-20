# TomorrowWorks product scope

This is the reference for **who the product serves and what each public claim means**. `SCREENS.md` defines screen behaviour, `API_PLAN.md` tracks candidate data sources, and `CHECKLIST.md` records verified progress. Update these files together when a product decision changes.

## Product promise

TomorrowWorks is a Malaysia-first, public workforce discovery app for people of **any age, industry, and career stage**. A visitor can browse changes in work without signing in. A person who wants tailored guidance can later add a skills profile. The design must not require an age category or assume everyone is changing from one named job to another.

The first release can cover only a few industries and sources. **“All industries” in a filter means all currently covered industries**, not every employer, job, or worker in Malaysia. Show coverage and missing-data states honestly.

## Public discovery

| Area | Visitor can ask | Evidence needed |
| --- | --- | --- |
| Explore | What is happening across the covered industries? | A mix of dated, attributed signals, each labelled by type. |
| Workplace changes | Which reported issues could affect work in this industry? | News or official announcements with original link and date. Coverage is a report about an issue, not proof of its scale. |
| Demand | What does a job or labour source measure now? | Dated vacancy data or official labour statistics with the exact measure, geography, and coverage. |
| Skills | Which skills are requested for covered roles? | Job-ad skill mentions or a reviewed occupation/skills source; label the source type. |
| Outlook | What might change under stated assumptions? | Explicit scenarios, inputs, uncertainty, and method. Never display a forecast as a current fact. |

Visitors can choose any area, industry, or search term in any order. Search and filters narrow **available evidence**; they do not manufacture results. If a selected industry lacks evidence, say so and show what source coverage is missing. Public claims carry source name, original URL, publication period/date, retrieval date, geography, and measure where applicable.

## Personal guidance

**My career** is optional. The preliminary demo uses a fictional profile and says clearly that sign-in, résumé upload, and saved accounts do not exist yet. Later personal guidance can use reviewed skills, experience, interests, and optional work preferences to explain role matches and learning pathways. An example career transition is a test case, not the product's target audience.

No age, gender, ethnicity, or other protected trait is needed to browse or generate matches. Avoid personality scores inferred from news or a résumé. Any real résumé flow needs consent, review, storage, and deletion decisions before implementation.

## Evidence rules

1. **News signal:** Show what a source reported and which industry/topic it concerns. Label extraction or tagging rules. News volume is media attention, not job demand or severity.
2. **Job-ad signal:** Describe advertised vacancies or skill mentions in the collected sample, with its coverage and date. It is not a count of all hiring.
3. **Official statistic:** Use the measure and time period published by the agency. Employment share, wages, and unemployment are different measures from vacancies.
4. **Future scenario:** State assumptions and uncertainty. Explain which input changed an estimate or recommendation.
5. **Personal match:** Show how reviewed profile skills and sourced role requirements affect a score; do not imply a hiring decision.

All visible evidence needs a link to its origin. Do not copy full article bodies or store real personal information for the demo. If a feed cannot be used under its terms, choose another source or keep a clearly labelled empty state.

## First demo boundaries

- Public browsing should work across several named industries even while some have no verified data.
- The team must choose at least one updatable public trend source, import a small attributed snapshot or live response, and show how a refresh changes a visible signal or recommendation.
- A separate news or official-announcement source is useful for workplace changes, but its access and reuse terms must be checked before any article appears in the app.
- Replit runs the web app; the defined RunPod GPU task must affect a visible result when integrated.
- A fictional profile can demonstrate personal guidance. Real accounts and résumé upload are later work.

## Acceptance for this scope change

- Public navigation includes Workplace changes alongside Demand, Skills, and Outlook.
- Industry and search controls are available without a profile and show honest empty states.
- The UI distinguishes reported workplace issues, current measures, and future estimates.
- The README, screen guide, API plan, and checklist describe the same broad audience and source boundaries.
