# TomorrowWorks build checklist

This checklist tracks the hackathon prototype. Complete one stage at a time. Check an item only after the work is present and verified. Commit the stage's implementation and its checklist updates together; split a stage into smaller commits if needed. The ChatGPT reference PDFs stay outside this repository.

## Stage 0 — Repository documents

- [x] Write a README that identifies the project as a planned prototype.
- [x] Record the six Domain 1 features and preliminary submission requirements.
- [x] Add the Apache License 2.0 `LICENSE` file.

Completed in local commit `e4d623a`.

## Stage 1 — Decide the MVP

- [ ] Choose one primary user and one example career transition.
- [ ] Decide what runs in Replit and what GPU task runs in RunPod.
- [ ] Choose one public, updatable trend source and verify its data, date, and reuse terms.
- [ ] Import a small attributed sample and define a repeatable way to refresh it; a live API call is optional.
- [ ] Review the optional Jooble Malaysia, OpenDOSM, and ESCO uses in [API_PLAN.md](API_PLAN.md) only if they improve the demo.
- [ ] Check whether the source measures research activity, actual job demand, or another signal; label it accurately.
- [ ] Write the exact demo journey: profile → trend → role → pathway.
- [ ] Record prototype assumptions, limits, and the hardest technical risk.

**Done when:** A teammate can explain who the demo serves, what it shows, and which source supports it.  
**Commit focus:** MVP scope and source decision.

The minimum source path and optional API roles are in [API_PLAN.md](API_PLAN.md). A sourced, refreshable sample can drive the preliminary demo; the app need not depend on live API access during judging.

## Stage 2 — Prove the RunPod GPU step

- [ ] Choose one small GPU inference task that affects a visible demo result.
- [ ] Create a RunPod Pod or Serverless endpoint and run a minimal request.
- [ ] Record the model, input, output, runtime, and approximate cost.
- [ ] Keep credentials in service secrets; add no keys to the repository.
- [ ] Save the required RunPod evidence for the tools declaration.

**Done when:** The GPU service returns a usable result for the demo and the team can explain its role.
**Commit focus:** RunPod request example, configuration notes, and evidence checklist; no credentials.

## Stage 3 — Set up a runnable Replit app

- [ ] Create the smallest runnable app and project structure.
- [ ] Add a basic page and navigation for the demo journey.
- [ ] Run the project in Replit and retain proof of its use for the tools declaration.
- [ ] Call the RunPod GPU step from the Replit backend using a service secret.
- [ ] Add exact local run commands to the README.
- [ ] Have another team member follow the run instructions successfully.

**Done when:** The app starts in Replit and can use the RunPod result in a visible demo flow.
**Commit focus:** App scaffold, backend integration, and run instructions.

## Stage 4 — Build profile intake

- [ ] Create one synthetic sample profile; use no real CV or personal data.
- [ ] Add fields for current skills, experience, and interests.
- [ ] Let the user load the synthetic sample profile.
- [ ] Validate required fields and show useful input errors.
- [ ] Display the completed profile for review.

**Done when:** The sample user can create a profile and continue through the app.  
**Commit focus:** Profile form and synthetic data.

## Stage 5 — Add trend signals

- [ ] Fetch or import the chosen public source through a repeatable process.
- [ ] Store its name, link, publication date, and refresh date.
- [ ] Convert the source into a small set of skill or role signals using documented rules.
- [ ] Add a refresh command or workflow.
- [ ] Verify that changed source data changes the stored signals.

**Done when:** The source can be refreshed and the app can trace each signal to it.  
**Commit focus:** Source ingestion, metadata, and refresh process.

## Stage 6 — Build the Future Skills Radar

- [ ] Show rising and declining skills or roles from the stored signals.
- [ ] Display the source and date beside each signal.
- [ ] Explain what “rising” and “declining” mean in this prototype.
- [ ] Show a clear state for missing or stale data.

**Done when:** A user can see the evidence behind each displayed trend.  
**Commit focus:** Radar display and source context.

## Stage 7 — Add explainable role matching

- [ ] Define a small, verified set of roles and required skills.
- [ ] Document the scoring formula and its assumptions.
- [ ] Rank roles for the sample profile.
- [ ] Show existing skills, missing skills, and the reason for each score.
- [ ] Check the results against hand-calculated examples.

**Done when:** A user can understand why roles were ranked in that order.  
**Commit focus:** Matching logic and skills-gap display.

## Stage 8 — Connect trends to recommendations

- [ ] Feed trend signals into the matching logic.
- [ ] Show which signal influenced each recommendation.
- [ ] Change one signal and verify that a score, rank, or explanation changes.
- [ ] Prepare a repeatable before-and-after demo case.

**Done when:** Judges can see that changing trend evidence changes the recommendation or its explanation.  
**Commit focus:** Trend-driven matching and demo case.

## Stage 9 — Add a reskilling pathway

- [ ] Order missing skills into learning steps for a selected role.
- [ ] Estimate the time for each step and explain the basis for the estimate.
- [ ] Check each learning-resource link and its price or free-access claim.
- [ ] Display the ordered pathway in the app.

**Done when:** The sample user can follow a practical plan with working resources.  
**Commit focus:** Learning-plan logic and display.

## Stage 10 — Explain SDG connections

- [ ] Map each recommended role to at least one relevant SDG.
- [ ] Map each recommended skill to at least one relevant SDG.
- [ ] Explain each connection in plain language.
- [ ] Remove decorative or unsupported mappings.

**Done when:** The user can understand how the chosen pathway relates to the SDGs.  
**Commit focus:** SDG mappings and explanations.

## Stage 11 — Compare future scenarios

- [ ] Define assumptions for moderate and rapid AI-change scenarios.
- [ ] Let the user switch between scenarios.
- [ ] Show how the recommendations or pathways change.
- [ ] Label forecasts as estimates and explain the uncertainty.

**Done when:** A user can compare at least two plausible outcomes.  
**Commit focus:** Scenario logic and comparison interface.

## Stage 12 — Verify and prepare the submission

- [ ] Run the complete profile-to-pathway demo and fix blocking issues.
- [ ] Check mobile layout, accessibility basics, errors, and broken links.
- [ ] Verify every trend, role, course, statistic, and SDG claim shown in the demo.
- [ ] Prepare the official product requirements document and pitch slides.
- [ ] Prepare the 5–7 minute preliminary pitch video with a working prototype demonstration.
- [ ] Complete the Technical & Tools Declaration, including AI tools, Replit proof, datasets, and RunPod GPU evidence.
- [ ] Check that the demo link and GitHub repository are accessible to judges, the repository contains `LICENSE`, and no secrets or personal data are exposed.
- [ ] Check the final submission instructions and deadline on the official event channels before submitting.

**Done when:** A judge can open, run, and understand the prototype and all required preliminary materials are ready.  
**Commit focus:** Separate small fixes and documentation commits; update checked items with the work they describe.
