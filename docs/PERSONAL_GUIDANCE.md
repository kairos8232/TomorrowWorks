# Personal guidance contract

> **21 Oct 2026:** the app now uses a guided flow (Home → 1. Your skills → 2. Your moves → 3. Your plan) with Aina as a fictional sample; the old *My profile* form, *My skill gaps* and *Sign in* screens were removed. [SCREENS.md](SCREENS.md) is the current reference; older screen names below are historical.

This file defines the **My career** area. [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md) defines the public product and evidence rules; [SCREENS.md](SCREENS.md) describes navigation; [CHECKLIST.md](CHECKLIST.md) records implementation status. The product follows **Domain 1: Aiversecity Future-Ready Workforce**. Its personal work must connect a reviewed skills profile to future roles, visible skill gaps, a reskilling pathway, SDG explanations, and more than one future scenario.

## Boundary between public and personal

| Question | Area | Input needed | Output |
| --- | --- | --- | --- |
| What is changing in an industry? | Public Workplace changes, Demand, Skills, Outlook | Industry or keyword, optional | Attributed reports, current measures, or labelled estimates; no claim about the visitor. |
| Which skills should **I** improve? | My career → Skill gaps / Role matches | Reviewed profile and a selected target role | Skills already held, possible gaps, and the requirements used for comparison. |
| What am **I** missing for a promotion or career move? | My career → Skill gaps / Role matches | Current skills and an explicit target role or progression | Target-specific gaps and limitations; never assume a promotion from a job title alone. |
| Which certificates or qualifications do **I** need? | My career → Skill gaps / My pathway | Current credentials, target role, and checked requirement sources | Required, preferred, or unverified status per credential, with jurisdiction, source, date, and the person's gap. |
| What should **I** do next? | My career → My pathway | Selected target and reviewed gaps | Ordered learning steps, checked resources, time basis, and explained SDG links. |

The public Skills page means **skills mentioned by a source for covered roles**. It does not know a visitor's skills. Personal gaps appear only after the visitor enters My career and reviews the profile. Public news may explain why a topic matters but cannot itself prove a personal gap, promotion criterion, or certificate requirement.

## Personal flow and data

1. Enter My career. The current prototype clearly offers a **fictional demo profile**; it does not authenticate, save an account, or make the area private from someone using the same browser session.
2. Review current role, skills, experience, interests, work preferences, and optional current certificates/qualifications. A résumé is an optional future intake method, subject to consent, correction, storage, and deletion decisions.
3. Choose an explicit target, including a promotion within the same field or a move to another role. The person can edit the target requirements in the early demo. The app must label these as **user-entered or illustrative**, not employer-verified requirements.
4. Compare normalised skill names with exact matches for the early demo. Show matched and missing entries and the rule used. This is a checklist comparison, **not a hiring or promotion readiness score**. Synonyms, proficiency, experience, and eligibility need later validation.
5. Show certificates/qualifications separately from skills. A credential can be called **required** only if a dated, applicable employer, regulator, or professional-body source supports it. Otherwise show **not verified**; do not turn an example credential into a requirement.
6. Later Domain 1 stages rank sourced future roles, let the person choose one, build a time-estimated learning pathway from displayed gaps, explain SDG links, and compare at least two AI-change scenarios. A dated, updatable trend signal must change a recommendation or its explanation.

## Early demo versus sourced result

The early personal comparison may use a fictional Junior Accountant profile and an editable Senior Accountant promotion target. Its target skills are **illustrative inputs** for demonstrating the comparison. It must not present them as current Malaysian employer requirements. The certificate section says when no requirement has been verified. No numeric match percentage, claimed vacancy count, or mandatory certificate is produced from the example.

A later sourced role record must contain the role name, industry/geography, required and preferred skills, any credential with required/preferred status, issuer or employer, source URL, publication or review date, and coverage limits. The matching method and any AI-trend influence must be visible next to the result. Missing data stays missing; it is not filled by a model guess.

## Privacy and review

The prototype uses synthetic information in memory and clears it on refresh. Do not ask users to enter a real CV or sensitive details into this demo. Before real accounts, decide consent, access control, retention, deletion, and how the person corrects extracted skills. No protected trait is needed for personal matching.
