# TomorrowWorks UI and UX guide

> **21 Oct 2026:** the app now uses a guided flow (Home → 1. Your skills → 2. Your moves → 3. Your plan) with Aina as a fictional sample; the old *My profile* form, *My skill gaps* and *Sign in* screens were removed. [SCREENS.md](SCREENS.md) is the current reference; older screen names below are historical.

This guide records interface decisions for the React prototype. [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md) defines the product, [PERSONAL_GUIDANCE.md](PERSONAL_GUIDANCE.md) defines private-area questions, [SCREENS.md](SCREENS.md) records each screen's actual behaviour, and [DESIGN.md](DESIGN.md) records visual consistency rules. The reusable project skill is [tomorrowworks-web-ux](skills/tomorrowworks-web-ux/SKILL.md).

## Visitor priorities

1. **Public:** Understand what can be explored, pick an industry or topic, and see whether a dated source actually covers it. A visitor can browse without a profile.
2. **Personal demo:** Recognise that My career uses a fictional, unsaved profile. Review it, choose a target, and see a hand-checkable skill comparison.
3. **Later Domain 1 work:** Compare sourced future roles, see why they match, follow a reskilling pathway, inspect SDG reasons, and compare scenarios. Empty or planned states must not imply those features already work.

## Your plan usability update — 22 Oct 2026

Put the next learning action directly after compact course progress; courses come before badges. Optional evidence forms use native details, with submitted/unverified status visible in the summary and fictional-only privacy instructions visible before entering a link. Keep the verification-unavailable notice visible once in progress; expand count/privacy detail, funding, method and exact badge earning rules on demand. Badge artwork stays recognisable at a smaller size. This preserves requirements while reducing repeated text and unnecessary scrolling. Build, tests and desktop/phone interaction checks passed; see PROGRESS_LOG.md.

## Screen design rules

- Put the main question and useful action in the first view. Avoid large empty hero space that pushes content below the fold.
- Keep public navigation and My career visibly separate. On narrower screens, use a compact horizontal navigation and full-width content rather than squeezing a desktop sidebar beside the page.
- Use the width a visitor has: balance overview cards across columns, pair related form fields where readable, and place a target editor beside its result on wide screens. Stack these groups before text or controls become cramped.
- Use plain labels: **Workplace changes** for reports, **Demand** for supported present measures, **Skills** for public role-skill evidence, and **My skill gaps** for an individual's comparison.
- Explain an empty state with **what is missing** and **what the visitor can do now**. Do not show fake cards or numbers to fill space.
- Show evidence, dates, and uncertainty near any sourced claim. Mark the current role target as illustrative and credentials as unverified until a relevant source is checked.
- Forms have visible labels, helpful error text, keyboard focus, and sensible mobile stacking. Buttons state their action; navigation remains available without a forced sequence.
- Keep reading and control text at a comfortable size at normal browser zoom. Scale it with wider screens without shrinking key explanations, form fields, or evidence notes into fine print.
- Let the screen heading carry the page hierarchy; avoid a repeated small label above each heading. Keep supporting text at readable contrast on the canvas and use calmer line wrapping for public summaries.
- On Your moves, keep the ranking scannable and open a focused view for each role. Put the plan action beside the role decision, keep full skill lists in that view, and state DOSM and ILO sources as links next to their figures. Put scoring method, fairness and source explanations in one separate view rather than repeating them around the ledger.
- Keep optional interests and goals visible with the job-ad and AI controls so people can see what changes a ranking. Use compact sidebar destinations with recognizable icons and a soft current-page state; keep the profile switcher distinct from navigation.
- On Your skills, group current job and direct skill search beside work description on wide screens, then stack them on phones. Keep the language choice in one compact row and shorten the closed self-profile label to “Me”.
- In Team view, show each linked SDG target once, with the role reason and the number of linked gap skills. For SDG 4.4, distinguish the broad link shared by every gap skill from specific ICT links derived from ESCO digital flags. Keep skill names in Shared gaps, where people can review the training need without reading the same list twice.

## Current UX debt and first slices

| Slice | Visible problem | Change | Check |
| --- | --- | --- | --- |
| 4f-a — Done | The fixed sidebar squeezes content in medium-width windows. | Switch to a compact, scrollable top navigation at 980 CSS pixels and below; stack form columns at 620 pixels and below. | At a 765-pixel window, the page has full width and no horizontal page overflow. |
| 4f-b — Done | The public landing page spends too much space on introduction while the working personal demo action sits below empty topic cards. | Tighten the introduction, place the fictional-demo action near it, show topic cards before overview filters, and shorten card copy. | The action and topic choices are visible before the source-status controls; the no-source message remains explicit. |
| 4f-c — In progress | Keyboard and small-screen behaviour need a focused pass. | Visible focus and keyboard submission were checked through the fictional profile-to-gap flow. The phone-width layout check remains open. | A keyboard user can complete the fictional profile-to-gap flow; no control is clipped at phone width. |
| 4g-a — Done | Content width was capped and the medium-screen header pushed cards below the first view. | Content now spans up to 1600 pixels; cards use two columns from 621–1379 pixels and four from 1380 pixels. Medium navigation and intro spacing are shorter. | At the 765-pixel preview, the cards start at 444 pixels instead of about 583, and the page height fell from 1230 to 1078 pixels without horizontal page overflow. |
| 4g-b — Done | Profile fields all stacked after the first pair. | Current role/skills, experience/interests, and work preferences/qualifications now sit in three field pairs above 620 pixels. | At 765 pixels, each field column is about 312 pixels wide and the form fits without horizontal page overflow. |
| 4g-c — In progress | The skill-gap result appeared below its editor. | At 1380 pixels and above, a saved comparison places the target editor beside its result; below that width, they stack. | The 765-pixel comparison still works without horizontal page overflow. A wide-window and phone-width visual check remain open. |
| 4h-a/b — Done | Much of the interface used 11–13 pixel text, making it hard to read at full-screen size. | Public card copy and personal paragraphs now start at 16 pixels and grow on wider screens; navigation is 15–16 pixels, inputs 16, and helper/evidence text at least 14. | At 765 pixels, landing and profile have no horizontal page overflow; cards, labels, and fields remain readable. Larger type increases page height, so wide and phone visual checks remain open. |
| 4i-b — Done | The public hero repeated a tracked label above its heading, and supporting text had measured low contrast. | Removed the repeated hero labels, increased hero and card-link contrast, and softened heading tracking. | Impeccable rendered scans at 1440×900 and 390×844 returned no findings for the public landing page; the 765-pixel preview has no horizontal page overflow. |

Keep these as separate small commits. Update this file if the design choice changes, and mark checklist items only after the interface is verified.
