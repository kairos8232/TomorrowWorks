# TomorrowWorks on Replit

## Run

- Stack: React 19, TypeScript 5, Vite 6; Node.js 20 or newer.
- Install the pinned dependencies with `npm ci`.
- Use the **Run** button to start the `Start application` workflow.
- The workflow runs `npm run dev -- --port 5000 --strictPort`, listening on
  `0.0.0.0:5000` for Replit Preview.
- `vite.config.ts` allows proxied development hosts. Keep this development
  setting separate from any future production hosting configuration.
- Check types and create the production bundle with `npm run build`.
- Local development remains available with `npm start` on port 5173.

## Publish

`.replit` has a `[deployment]` section: **static** site. Replit runs
`npm ci && npm run build` and serves the `dist/` folder. Press **Publish** in
Replit; the app has no server code, so nothing else is needed.

When RunPod Job B (free-text skill search) is connected, the RunPod API key
must stay on a server, so the deployment will switch to an Autoscale server
with the key in Replit Secrets. Never put the key in front-end code.

## Scope and services

The current application is a browser-only prototype. No secrets, database,
or external services are required to run it. Sign-in is explicitly a demo,
profiles are synthetic, and market views show no-source states.

RunPod embedding/search integration and sourced role matching are planned
features, not requirements for starting this imported app. Do not introduce
fake credentials or fabricate market evidence to fill those states.

Keep the existing repository structure and stack. Read `CLAUDE.md` for project
rules and `PROGRESS_LOG.md` for the team's development context.
