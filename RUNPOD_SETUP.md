# Runpod agent setup

This records the **Codex-to-Runpod tooling setup**, separate from Stage 2's GPU inference proof. The official instructions are [Runpod's agent setup guide](https://docs.runpod.io/agent-setup.md). No API key, Pod, Serverless endpoint, or GPU job was created by this setup.

## Status on 21 October 2026

| Item | Verified state |
| --- | --- |
| Node.js | `v24.21.0`, above the guide's `v22.20.0` minimum |
| Agent skills | 16 Runpod skills installed globally for Codex; verified with `npx -y skills list --global` |
| Codex plugin | `runpod@runpod` version `1.8.0` installed and enabled from the official Runpod marketplace |
| Hosted MCP server | `runpod` registered at `https://mcp.getrunpod.io/`; `codex mcp list` reports **enabled, Not logged in** |
| Account access | Awaiting Codex Desktop restart and Runpod OAuth sign-in; Pods have not been listed yet |

The agent skills and plugin live in local Codex directories, not in this repository. Do not copy tokens or account settings into Git. The guide says the Runpod CLI, Flash SDK, and API keys are only needed later for specific work; none was installed or created for this step.

## Finish account connection

1. Fully quit and reopen Codex Desktop so it loads the new plugin and MCP tools.
2. Open `/mcp` in Codex, choose **runpod**, and select **Sign in with Runpod**. Approve the OAuth flow in the browser. Use the Runpod account intended for this project.
3. After sign-in, list Pods through the Runpod MCP tools. An empty list still verifies the connection; if the account should have Pods, check that the correct account was used.
4. Only then mark MCP authentication complete in [CHECKLIST.md](CHECKLIST.md).

## Separate project work

Stage 2 still needs a defined GPU inference task that changes a visible Domain 1 result, followed by a minimal Pod or Serverless request, measured runtime and cost, and submission evidence. Stage 3 later connects that result from the Replit backend using a service secret. Agent setup alone does not satisfy either stage.
