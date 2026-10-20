# Runpod setup and GPU work

**RunPod is a required part of TomorrowWorks (team decision, 21 Oct 2026).** It runs the project's only GPU work: embedding the official ESCO skill taxonomy and serving skill search. It is not on the list of things to cut if time runs short. The handbook (9.4) requires GPU work to run on RunPod, and 10.7 requires dashboard evidence.

## Part 1: Codex agent tooling (optional helper)

This records the **Codex-to-Runpod tooling setup**, separate from Stage 2's GPU inference proof. The official instructions are [Runpod's agent setup guide](https://docs.runpod.io/agent-setup.md). No API key, Pod, Serverless endpoint, or GPU job was created by this setup.

### Status on 21 October 2026

| Item | Verified state |
| --- | --- |
| Node.js | `v24.21.0`, above the guide's `v22.20.0` minimum |
| Agent skills | 16 Runpod skills installed globally for Codex; verified with `npx -y skills list --global` |
| Codex plugin | `runpod@runpod` version `1.8.0` installed and enabled from the official Runpod marketplace |
| Hosted MCP server | `runpod` registered at `https://mcp.getrunpod.io/`; `codex mcp list` reports **enabled, Not logged in** |
| Account access | Awaiting Codex Desktop restart and Runpod OAuth sign-in; Pods have not been listed yet |

The agent skills and plugin live in local Codex directories, not in this repository. Do not copy tokens or account settings into Git. The guide says the Runpod CLI, Flash SDK, and API keys are only needed later for specific work; none was installed or created for this step.

### Finish account connection

1. Fully quit and reopen Codex Desktop so it loads the new plugin and MCP tools.
2. Open `/mcp` in Codex, choose **runpod**, and select **Sign in with Runpod**. Approve the OAuth flow in the browser. Use the Runpod account intended for this project.
3. After sign-in, list Pods through the Runpod MCP tools. An empty list still verifies the connection; if the account should have Pods, check that the correct account was used.
4. Only then mark MCP authentication complete in [CHECKLIST.md](CHECKLIST.md).

### Separate project work

Stage 2 still needs a defined GPU inference task that changes a visible Domain 1 result, followed by a minimal Pod or Serverless request, measured runtime and cost, and submission evidence. Stage 3 later connects that result from the Replit backend using a service secret. Agent setup alone does not satisfy either stage.

## Part 2: Project GPU work (required)

The Codex MCP sign-in above is a convenience. The steps below can be done directly in the [RunPod console](https://console.runpod.io/) with the team account that received the US$25 sponsor credit.

### What runs on RunPod and why it needs a GPU

| Job | RunPod product | Input | Output | Used by the app for |
| --- | --- | --- | --- | --- |
| **A. Embed ESCO skills** (once, and again on each ESCO update) | GPU **Pod** (PyTorch template, any 16–24 GB card) | `skills_en.csv` from ESCO v1.2.1: 13,960 released skills with up to 8 alternative labels and a description each | `esco-skill-vectors.f16.npy` (13,960 × 1024, ≈ 28.6 MB), `esco-skill-index.json`, `run-info.json` | The searchable skill index |
| **B. Embed the user's description** (each search) | **Serverless** endpoint running the same model (`BAAI/bge-m3`), e.g. RunPod's Infinity embedding worker | The person's own words, in English, Bahasa Malaysia or Chinese | One 1024-dim vector | The Replit backend compares it with the index and returns the 10 nearest real ESCO skills; the user ticks the true ones |

Both jobs use one open-weights model, `BAAI/bge-m3`. It only turns text into vectors; it cannot write skills, roles, courses or scores. Every result shown is an ESCO record with its URI.

### Job A steps (batch Pod)

1. In RunPod, deploy a GPU Pod with the PyTorch template. Note the **Pod ID** and **GPU type**.
2. Upload `runpod/embed_esco_skills.py` and `skills_en.csv` (Jupyter upload or `runpodctl send`).
3. On the Pod: `pip install sentence-transformers`, then `python embed_esco_skills.py skills_en.csv out/`.
4. Download `out/` into `data/derived/esco/` in this repo. `run-info.json` records the model, GPU, skill count and runtime.
5. **Take the dashboard screenshot** showing Pod ID, GPU type and runtime (handbook 10.7), then **stop and terminate the Pod** so credit is not wasted.

Check locally first, without a GPU: `python3 runpod/embed_esco_skills.py "data/raw/ESCO dataset - v1.2.1 - classification - en - csv/skills_en.csv" out/ --dry-run` (verified 21 Oct: 13,960 skills).

### Job B steps (Serverless endpoint) — code ready 21 Oct, endpoint to create

**Code (done):** `server/index.mjs` sends the person's text to `https://api.runpod.ai/v2/<ENDPOINT_ID>/openai/v1/embeddings` (the Infinity worker's OpenAI-compatible route, body `{"model": "BAAI/bge-m3", "input": [text]}`), normalises the vector and ranks it against the Job A vectors (`server/search.mjs`). Max 500 characters, 20 searches per minute per visitor, 90 s timeout for cold starts. Tested end to end with a local fake endpoint in the same response format; **multilingual quality is untested until the live endpoint exists.**

**Carson, tomorrow (about 10 min):**
1. RunPod → **Serverless → New Endpoint** → **Infinity Vector Embeddings** (official embedding worker). If not listed, screenshot the page for Claude.
2. Environment variable **`MODEL_NAMES` = `BAAI/bge-m3`** (must match Job A).
3. GPU: a 24 GB card (RTX A5000 / L4 / 4090). Workers: **Active 0, Max 1**. Idle timeout **5 s**. Deploy, copy the **Endpoint ID**.
4. RunPod → **Settings → API Keys → Create** (Serverless access only if offered).
5. Replit → **Tools → Secrets**: `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID`. **Never paste the key in chat, GitHub or a file.**
6. Replit → **Git → Pull**, then **Run**; open `/api/health` and check `"runpod": true`. Try a search in English, Bahasa Malaysia and Chinese; send Claude the results.
7. **Publish** (Autoscale). Record the endpoint URL for the Tools Declaration.

### Fallback (the demo never depends on a live call)

If the endpoint is down, the profile screen offers a searchable list of ESCO skill labels instead. Job A's vectors are already in the repo, so RunPod's role in the project is shown even when Job B is unavailable.

### Evidence checklist for the Technical & Tools Declaration

- [ ] Job A dashboard screenshot: Pod ID, GPU type, runtime, from the team's own account. *Run done 21 Oct on Pod `rear_amethyst_gull` (`40jrr8aulh76tb`), RTX A5000; screenshots kept outside the repo.*
- [x] `data/derived/esco/run-info.json` committed (model `BAAI/bge-m3`, NVIDIA RTX A5000, 13,960 skills, 1024 dims, 92.5 s).
- [ ] Job B Serverless endpoint URL, from the team's own account.
- [x] Model named: `BAAI/bge-m3` (open weights), purpose: retrieve ESCO skills; generates no content.
- [ ] Approximate credit used, out of US$25.
