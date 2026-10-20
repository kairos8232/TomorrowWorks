# TomorrowWorks UI and UX guide

This guide records interface decisions for the React prototype. [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md) defines the product, [PERSONAL_GUIDANCE.md](PERSONAL_GUIDANCE.md) defines private-area questions, and [SCREENS.md](SCREENS.md) records each screen's actual behaviour. The reusable project skill is [tomorrowworks-web-ux](skills/tomorrowworks-web-ux/SKILL.md).

## Visitor priorities

1. **Public:** Understand what can be explored, pick an industry or topic, and see whether a dated source actually covers it. A visitor can browse without a profile.
2. **Personal demo:** Recognise that My career uses a fictional, unsaved profile. Review it, choose a target, and see a hand-checkable skill comparison.
3. **Later Domain 1 work:** Compare sourced future roles, see why they match, follow a reskilling pathway, inspect SDG reasons, and compare scenarios. Empty or planned states must not imply those features already work.

## Screen design rules

- Put the main question and useful action in the first view. Avoid large empty hero space that pushes content below the fold.
- Keep public navigation and My career visibly separate. On narrower screens, use a compact horizontal navigation and full-width content rather than squeezing a desktop sidebar beside the page.
- Use the width a visitor has: balance overview cards across columns, pair related form fields where readable, and place a target editor beside its result on wide screens. Stack these groups before text or controls become cramped.
- Use plain labels: **Workplace changes** for reports, **Demand** for supported present measures, **Skills** for public role-skill evidence, and **My skill gaps** for an individual's comparison.
- Explain an empty state with **what is missing** and **what the visitor can do now**. Do not show fake cards or numbers to fill space.
- Show evidence, dates, and uncertainty near any sourced claim. Mark the current role target as illustrative and credentials as unverified until a relevant source is checked.
- Forms have visible labels, helpful error text, keyboard focus, and sensible mobile stacking. Buttons state their action; navigation remains available without a forced sequence.

## Current UX debt and first slices

| Slice | Visible problem | Change | Check |
| --- | --- | --- | --- |
| 4f-a — Done | The fixed sidebar squeezes content in medium-width windows. | Switch to a compact, scrollable top navigation at 980 CSS pixels and below; stack form columns at 620 pixels and below. | At a 765-pixel window, the page has full width and no horizontal page overflow. |
| 4f-b — Done | The public landing page spends too much space on introduction while the working personal demo action sits below empty topic cards. | Tighten the introduction, place the fictional-demo action near it, show topic cards before overview filters, and shorten card copy. | The action and topic choices are visible before the source-status controls; the no-source message remains explicit. |
| 4f-c — In progress | Keyboard and small-screen behaviour need a focused pass. | Visible focus and keyboard submission were checked through the fictional profile-to-gap flow. The phone-width layout check remains open. | A keyboard user can complete the fictional profile-to-gap flow; no control is clipped at phone width. |
| 4g-a — Done | Content width was capped and the medium-screen header pushed cards below the first view. | Content now spans up to 1600 pixels; cards use two columns from 621–1379 pixels and four from 1380 pixels. Medium navigation and intro spacing are shorter. | At the 765-pixel preview, the cards start at 444 pixels instead of about 583, and the page height fell from 1230 to 1078 pixels without horizontal page overflow. |
| 4g-b — Done | Profile fields all stacked after the first pair. | Current role/skills, experience/interests, and work preferences/qualifications now sit in three field pairs above 620 pixels. | At 765 pixels, each field column is about 312 pixels wide and the form fits without horizontal page overflow. |
| 4g-c — Planned | The skill-gap result appears below its editor. | Place the result beside the target editor when enough width exists. | Both parts stay readable and the narrow layout stacks without page overflow. |

Keep these as separate small commits. Update this file if the design choice changes, and mark checklist items only after the interface is verified.
