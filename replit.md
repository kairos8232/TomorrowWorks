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

## Run and publish (server)

The app has a small Node server (`server/index.mjs`, no extra packages). It
serves the built site from `dist/` and one API route, `POST /api/skill-search`,
which calls the RunPod Serverless endpoint (Job B). Because the RunPod API key
must stay on a server, publishing uses **Autoscale**, not static hosting.

- **Run button:** `npm run build && npm run serve` on port 5000.
- **Publish:** `.replit` `[deployment]` builds with `npm ci && npm run build` and
  runs `node server/index.mjs`.
- **Secrets (Tools → Secrets):** `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID`. Without
  them the app still works; the search box says it is not connected and the
  skill list remains. Check `/api/health` → `"runpod": true`.
- Never put the key in front-end code, a file, or a commit.

## Scope and services

The current application is a browser-only prototype. No secrets, database,
or external services are required to run it. Sign-in is explicitly a demo,
profiles are synthetic, and market views show no-source states.

RunPod embedding/search integration and sourced role matching are planned
features, not requirements for starting this imported app. Do not introduce
fake credentials or fabricate market evidence to fill those states.

Keep the existing repository structure and stack. Read `CLAUDE.md` for project
rules and `PROGRESS_LOG.md` for the team's development context.
