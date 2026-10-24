// Three views of AI impact per role. Tested in src/aiviews.test.ts.
// Rule documented in docs/SIGNALS_AND_MATCHING.md ("Three views of AI impact").
//
//   ILO        how exposed the job's tasks are to generative AI (expert + model rating, global;
//              mean and standard deviation per ISCO occupation)            → used in the score
//   Microsoft  how applicable AI is to the job's activities, from Copilot conversations (US, 2024)
//   Anthropic  how much the job's tasks are actually done with Claude ("observed exposure"),
//              and whether that use automates the task or augments the person
//
// The three use different scales. To compare them, each value is placed on the ILO scale by
// matching its position in its own list of all occupations: z = (value − mean) / sd of that
// source, then ILO mean + z × ILO sd (kept within 0–1). Used for display and in the futures
// simulator; the main score keeps using ILO only.
import iloFile from '../data/sources/ilo-genai-exposure-2025.json';
import msFile from '../data/sources/ms-ai-applicability.json';
import aeiFile from '../data/sources/anthropic-economic-index.json';
import roleSocFile from '../data/sources/role-soc.json';

type Stats = { mean: number; sd: number };
const stats = (xs: number[]): Stats => {
  const mean = xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
  return { mean, sd: Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (xs.length || 1)) || 1 };
};
const clamp = (x: number) => Math.min(1, Math.max(0, x));

export const msData = msFile as { source: Record<string, string>; occupations: { soc: string; title: string; score: number }[] };
export const aeiData = aeiFile as { source: Record<string, unknown> & { retrievedAt: string | null }; occupations: { soc: string; title: string; observed: number }[]; roles: Record<string, { tasks: number; tasksWithUse: number; automationShare: number | null }> };
export const roleSoc = roleSocFile as { roles: Record<string, { soc: string; title: string }> };

const iloStats = stats((iloFile.occupations as { mean: number }[]).map((o) => o.mean));
const msStats = stats(msData.occupations.map((o) => o.score));
const aeiStats = stats(aeiData.occupations.map((o) => o.observed));
const onIlo = (value: number, s: Stats) => clamp(iloStats.mean + ((value - s.mean) / s.sd) * iloStats.sd);

export type AiViews = {
  ilo: { mean: number; sd: number } | null;
  ms: { score: number; onIlo: number } | null;
  aei: { observed: number; onIlo: number; automationShare: number | null } | null;
};

/** The three views for one role (null where a source has no value for it). */
export function aiViews(role: { id: string; isco: string }): AiViews {
  const ilo = (iloFile.occupations as { isco: string; mean: number; sd: number }[]).find((o) => o.isco === role.isco);
  const soc = roleSoc.roles[role.id]?.soc;
  const ms = soc ? msData.occupations.find((o) => o.soc === soc) : undefined;
  const aei = soc ? aeiData.occupations.find((o) => o.soc === soc) : undefined;
  return {
    ilo: ilo ? { mean: ilo.mean, sd: ilo.sd } : null,
    ms: ms ? { score: ms.score, onIlo: onIlo(ms.score, msStats) } : null,
    aei: aei ? { observed: aei.observed, onIlo: onIlo(aei.observed, aeiStats), automationShare: aeiData.roles[soc!]?.automationShare ?? null } : null,
  };
}

/** Which sources are available at all (Anthropic needs its import to have run). */
export const aiSources = () => ['ilo', 'ms', ...(aeiData.occupations.length ? ['aei'] : [])] as ('ilo' | 'ms' | 'aei')[];
