---
name: TomorrowWorks
description: Current visual and interaction rules for the workforce discovery website
colors:
  action: "#0e8176"
  action-hover: "#08695f"
  action-link: "#087568"
  sidebar: "#0d1728"
  canvas: "#f3f6f9"
  surface: "#ffffff"
  text: "#14233a"
  supporting-text: "#526b7c"
  border: "#e2eaf0"
  focus: "#4ac9ba"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(36px, 4.2vw, 56px)"
    fontWeight: 800
    lineHeight: 1.13
    letterSpacing: "-0.03em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(16px, 1.05vw, 18px)"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "10px"
  button: "11px"
  panel: "16px"
  card: "20px"
spacing:
  card-gap: "16px"
  field-gap: "18px"
  card-padding: "24px"
---

# TomorrowWorks design system

This file records the **current website design**, not a rebrand. [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md) owns the audience and evidence rules; [PERSONAL_GUIDANCE.md](PERSONAL_GUIDANCE.md) owns personal-data boundaries; [SCREENS.md](SCREENS.md) owns screen behaviour; [UI_UX.md](UI_UX.md) records UX decisions. Check the rendered site and `src/styles.css` when changing a value here.

## Overview

TomorrowWorks is a task-focused market explorer. The visual system uses a deep navy navigation area, calm light surfaces, and teal for actions and selected states. Hierarchy should help visitors move among public topics and optional personal guidance without making an unfinished feature look complete.

Consistency means the same action color, typography, spacing rhythm, and state treatment across Explore, market topics, and My career. Source status and fictional-demo limits stay readable; they are part of the interface, not fine print.

## Colors

| Role | Current value | Use |
| --- | --- | --- |
| Main action | `#0e8176` | Primary buttons and selected action surfaces |
| Action hover | `#08695f` | Hover state of primary buttons |
| Action link | `#087568` | Links and card actions on white |
| Sidebar | `#0d1728` | Navigation background |
| Canvas | `#f3f6f9` | Page background |
| Surface | `#ffffff` | Cards, panels, fields, top bar |
| Main text | `#14233a` | Headings and form input text |
| Supporting text | `#526b7c` | Body support, status, and helper text on light surfaces |
| Border | `#e2eaf0` | Card and panel outlines |
| Focus | `#4ac9ba` | Visible keyboard outline |

Use dark enough text for small copy on light surfaces. Do not reuse the brighter decorative teal `#0f9c8d` for important small text on the canvas. Status and evidence notes need the same contrast care as body copy.

## Typography

- **Heading face:** Manrope. The screen title uses `clamp(36px, 4.2vw, 56px)`, line height `1.13`, and tracking `-0.03em`.
- **Reading face:** DM Sans. Public card and personal explanation text starts at 16px and grows to 18px on wider screens, with about `1.6` line height.
- **Controls:** Navigation is 15–16px; inputs are 16px; labels, helper text, and evidence notes are at least 14px at normal browser zoom.
- **Hierarchy:** One clear `h1` names the screen. A small uppercase kicker does not repeat the heading. Card titles and panel headings provide the next level; source metadata stays secondary but readable.
- **Wrapping:** Public summaries use balanced last lines where supported; never truncate the source or limitation text to make a card shorter.

## Layout

- Above 980 CSS pixels, keep the 292px navigation rail. At 980px and below, move navigation to compact horizontal rows above the content.
- The main content can expand to 1600px, with fluid outer padding. Do not cap it at a narrow article width on a large display.
- Explore cards use two balanced columns from 621–1379px and four columns from 1380px. At 620px and below, cards and form pairs stack in one column.
- Related profile fields share rows when each remains readable. From 1380px, a saved target editor and its skill-gap result sit side by side; narrower screens stack them.
- Keep the primary action and first useful topic choice near the first viewport. Use horizontal space when it improves scanning, while preserving readable text width.

## Elevation & Depth

The interface combines light borders with subtle, low-opacity shadows on main cards and personal panels. Shadows provide separation from the pale canvas; they should not draw more attention than the content. Keep nested panels flatter so the page does not become a stack of floating boxes.

## Shapes

Inputs use roughly 10px corners, buttons 11px, evidence and control panels 16px, and primary cards 20px. Preserve this small-to-large hierarchy. Skill tags use compact 7px corners. Avoid turning regular controls into pills or adding decorative icon tiles to every card.

## Components

| Component | Consistent treatment | Important state |
| --- | --- | --- |
| Navigation | Public browse and My career remain visibly separate; selected item has a filled navy-teal treatment. | Show current page and visible keyboard focus. |
| Primary button | Teal fill, white text, 15px bold label, 11px radius. | Darker teal on hover; focus outline remains visible. |
| Text action | Dark teal on light backgrounds; name the destination or task. | Underline on hover; visible keyboard focus. |
| Market card | White surface, light border, 20px radius, 24px padding, readable heading and summary. | Whole card is a button with hover and focus treatment. |
| Form field | Visible label, light field fill, 16px input text, readable helper copy. | Teal focus treatment and text error; no silent failure. |
| Empty/evidence state | State what is missing and what is available to do next. | Never substitute sample demand numbers or unsupported claims. |
| Skill comparison | Match and gap groups use restrained green/warm tint while preserving text contrast. | Mark target inputs as illustrative and credential requirements as unverified. |

## Do's and Don'ts

**Do** keep public market discovery available without a profile. **Do** keep personal skill gaps and promotion questions in My career. **Do** put source, date, geography, and measure close to any real market claim. **Do** label fictional inputs, future scenarios, and missing evidence in visible text. **Do** check wide, medium, and phone layouts, keyboard focus, and text contrast after each visual change.

**Don't** introduce decorative statistics, invented scores, compulsory certificates, or fake source cards to fill space. **Don't** reduce essential text to 11–13px to save height. **Don't** add a repeated kicker above every screen title or collapse public navigation into a forced step sequence.

### Open checks

- Colors and spacing are currently repeated as literal CSS values. A later focused refactor can centralize them as code tokens; until then, verify this file and `src/styles.css` together.
- The Impeccable rendered scan of **Explore** passed at 1440×900 and 390×844 on 20 October 2026. It does not prove every personal or public destination at those sizes. The wider and phone personal-flow visual checks remain on the checklist.
- No dark theme is implemented or promised. Do not add one without checking readability across the complete flow.
