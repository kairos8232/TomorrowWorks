---
name: tomorrowworks-web-ux
description: Improve UI and UX in the TomorrowWorks React website, including navigation, page hierarchy, forms, empty states, and responsive layouts. Use for TomorrowWorks interface work, not unrelated websites or Flutter apps.
---

# TomorrowWorks web UX

Read `PRODUCT_SCOPE.md`, `PERSONAL_GUIDANCE.md`, `SCREENS.md`, and `UI_UX.md` before changing a screen. Use `CHECKLIST.md` and `BUILD_STAGES.md` to keep each change in a small, verifiable commit.

For each UI task:

1. Inspect the current screen at a wide and narrow viewport. Identify the user's main task and the most visible friction before changing layout or copy.
2. Keep public market discovery freely browsable. Keep individual skill gaps, promotion targets, and qualifications inside My career. The fictional demo entry is not authentication.
3. Prioritise a clear heading, the primary action, readable controls, and an honest next step. If a source or Domain 1 feature is unfinished, show its status without presenting sample data as evidence.
4. Use existing React/CSS patterns and make focused changes. Avoid a numbered journey, decorative dashboards, invented scores, mandatory certificates without a checked source, or a new dependency just for appearance.
5. Check keyboard access, labels, visible focus, text contrast, overflow at narrow widths, and a complete real screen interaction. Run the build and update the screen guide and checklist with what was verified.

The interface should help someone answer a concrete work question before showing implementation details. Preserve the user's product choices and the Domain 1 requirements recorded in the project docs.
