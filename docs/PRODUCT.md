# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

TomorrowWorks primarily serves individuals in Malaysia who want to understand how their existing skills can lead to a realistic next career direction. This includes working adults whose jobs are changing, graduates, people changing careers, and people returning to work.

Employers and learning teams, universities, and career advisers are secondary audiences. They enter through a dedicated **For organisations** route for team skills, shared gaps, and training-planning use cases rather than switching the individual experience into a different mode.

## Product Purpose

TomorrowWorks helps a person understand what career directions fit the skills they already have, what is changing in relevant work, and what they can learn next. A successful visit gives the person one or more understandable career directions and a practical next step grounded in dated evidence.

Public job-market discovery remains available without a profile. Personal guidance starts only when a visitor chooses to describe or select their skills.

## Positioning

TomorrowWorks connects confirmed personal skills to sourced Malaysian job-market signals, research on how AI may change work, explainable role requirements, and checked learning routes. Its recommendations come from a documented scoring rule and known occupational records rather than generated career advice.

## Operating Context

- A visitor can explore Malaysian job-market evidence before entering personal information.
- An individual can describe their work in English, Bahasa Malaysia, or Chinese, confirm suggested ESCO skills, compare career directions, inspect why a direction fits, and build a learning plan.
- Employers and educators can inspect fictional group examples, shared skill gaps, and training priorities through the organisation area.
- Fictional people demonstrate use cases; they are examples rather than accounts or authentication.
- The prototype runs as a React and TypeScript website published through Replit Autoscale. Its Node server protects service credentials and supplies live API routes.
- RunPod performs the required GPU embedding work. The visible product describes the user outcome first; model and infrastructure details remain available in evidence and methodology explanations.

## Capabilities and Constraints

- The individual journey covers skills, career directions, role evidence, learning plans, SDG connections, and alternative future scenarios.
- Public market evidence includes DOSM job-ad snapshots, ILO research, OpenDOSM labour context, GDELT workplace news, Microsoft AI-applicability data, and an optional Anthropic import.
- ESCO supplies occupations and skills. `BAAI/bge-m3` on RunPod retrieves existing records and precomputes related-skill, course, news, and SDG comparisons; it does not generate roles, statistics, courses, or scores.
- Role scoring must stay hand-checkable and keep its source dates, assumptions, uncertainty, and missing-data behavior visible.
- Live RunPod skill search, news refresh, and labour-force refresh depend on the published Node server. Saved snapshots and manual skill selection keep the demo usable when a live service is unavailable.
- The prototype stores the working profile, learning choices, and fictional evidence links only in the browser session. It has no accounts, CV upload, provider verification, reviewer queue, or persistent personal-data storage.
- Course evidence links are fictional prototype inputs and are never treated as verified completion or skill mastery.
- Recommendations support a person's decision; they do not make hiring, education, or employment decisions.
- The interface supports English, Bahasa Malaysia, and Chinese. ESCO names and provider course titles may remain in their source language.

## Brand Commitments

- The product name is **TomorrowWorks**.
- The public experience should speak in plain, encouraging language and feel like a trustworthy career service rather than an AI product demonstration.
- Individuals are the primary homepage audience. **For organisations** is a clear secondary route in the public navigation.
- Technical disclosures remain accessible, but AI terminology does not lead the main visitor journey.
- The existing sidebar, numbered app journey, career-ledger styling, and global fictional-person switch are not part of the replacement design.

## Evidence on Hand

- Nine ESCO occupations and their required skills in `data/roles.json`.
- DOSM Q1 and Q2 2026 job-ad snapshots and ILO occupation exposure data in `data/sources/`.
- A RunPod-generated index of 13,960 ESCO skills in `data/derived/esco/`, with the recorded model, GPU, runtime, and dimensions.
- Checked learning resources and Malaysian NOSS/SKM routes in `data/pathway/`.
- RunPod-matched Coursera suggestions and team-reviewed SDG links in `data/derived/` and `data/sdg/`.
- Fictional individual and group examples in `src/data.ts`; no real profiles, testimonials, customer logos, or measured user outcomes are available and none should be invented.
- Source, matching, deployment, and limitation details in `SIGNALS_AND_MATCHING.md`, `RUNPOD_SETUP.md`, and `SCREENS.md`.

## Product Principles

1. Start with the visitor's career question and next action before explaining the technology.
2. Keep public exploration open, then ask for personal information only when it improves guidance.
3. Make every recommendation understandable through skills, current evidence, assumptions, and visible limits.
4. Turn analysis into a practical next step instead of leaving the visitor with a dashboard of signals.
5. Preserve human choice: people confirm their skills, choose their direction, and decide whether to follow a learning route.

## Accessibility & Inclusion

The website must work with keyboard navigation, visible focus, readable contrast, clear labels, and layouts without horizontal page overflow at phone widths. Language switching must remain available throughout the public and personal experiences. Age and other protected personal attributes are not required for career matching.
