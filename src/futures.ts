// Futures simulator for "Handling uncertainty". Tested in src/futures.test.ts.
// Rule documented in SIGNALS_AND_MATCHING.md ("Futures simulator").
//
// Instead of two fixed scenarios, score every move in many simulated futures, each with:
//   AI speed  t ~ uniform(0, 1): weights move in a straight line from "Gradually" (t = 0)
//             to "Quickly" (t = 1)                                   (our assumption)
//   exposure  which expert view is right is itself uncertain: each future picks one source
//             at random (src/aiviews.ts). ILO: mean + ILO standard deviation × normal(0, 1);
//             Microsoft / Anthropic: their value placed on the ILO scale. Kept in 0..1.
//   demand    the job-ad change of one of the two DOSM quarters we have, chosen at random
// Everything else (skills, the scoring rule, optional interests/goals) is unchanged, so
// each future is scored with exactly the same rule as Your moves.
// A fixed seed makes the result identical on every visit.
import { aiSources, aiViews } from './aiviews';
import { recommendMoves, scenarios, type DosmSnapshot, type Extras, type IloExposure, type Role, type Scenario, type TransferableSkills } from './scoring';

export const FUTURES = 1000;
export const SEED = 7;

/** Small seeded random number generator (mulberry32), so results are reproducible. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal from two uniforms (Box–Muller). */
const normal = (r: () => number) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

/** Scenario weights at AI speed t: 0 = Gradually, 1 = Quickly. */
export function scenarioAt(t: number): Scenario {
  const a = scenarios.moderate.weights, b = scenarios.fast.weights;
  const mix = (x: number, y: number) => x + (y - x) * t;
  return { ...scenarios.moderate, weights: { F: mix(a.F, b.F), D: mix(a.D, b.D), R: mix(a.R, b.R) } };
}

export type RoleFutures = {
  roleId: string;
  best: number;       // share of futures where this is the top move
  top3: number;       // share of futures where it is in the top 3 moves
  low: number;        // 5th percentile of its score (0-100)
  mid: number;        // median score
  high: number;       // 95th percentile
};

const pct = (sorted: number[], p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

/**
 * Run the futures. Returns per-move results in the order of `order` (the ranking on screen),
 * plus how often each neighbouring pair on screen swaps places.
 */
export function simulateFutures(input: {
  roles: Role[]; currentRoleId: string | null; held: ReadonlySet<string>; snapshots: DosmSnapshot[];
  ilo: IloExposure; transferable: TransferableSkills; extras?: Extras; runs?: number; seed?: number;
}) {
  const { roles, currentRoleId, held, snapshots, ilo, transferable, extras = {}, runs = FUTURES, seed = SEED } = input;
  const r = rng(seed);
  const iscos = new Set(roles.map((x) => x.isco));
  const base = ilo.occupations.filter((o) => iscos.has(o.isco));
  const sources = aiSources();
  // Per ISCO code: the Microsoft / Anthropic values on the ILO scale (first role with that code).
  const alt = new Map(roles.map((role) => [role.isco, aiViews(role)]));
  const scores = new Map<string, number[]>();
  const best = new Map<string, number>();
  const top3 = new Map<string, number>();
  const ranks: Map<string, number>[] = [];
  for (let i = 0; i < runs; i++) {
    const t = r();
    const snapshot = snapshots[Math.floor(r() * snapshots.length)];
    const source = sources[Math.floor(r() * sources.length)];
    const sampled: IloExposure = { ...ilo, occupations: base.map((o) => {
      const v = alt.get(o.isco);
      const other = source === 'ms' ? v?.ms?.onIlo : source === 'aei' ? v?.aei?.onIlo : undefined;
      return { ...o, mean: other ?? Math.min(1, Math.max(0, o.mean + o.sd * normal(r))) };
    }) };
    const { moves } = recommendMoves(roles, currentRoleId, held, snapshot, sampled, scenarioAt(t), transferable, extras);
    const rank = new Map<string, number>();
    moves.forEach((m, k) => {
      rank.set(m.role.id, k);
      scores.set(m.role.id, [...(scores.get(m.role.id) ?? []), m.score * 100]);
      if (k === 0) best.set(m.role.id, (best.get(m.role.id) ?? 0) + 1);
      if (k < 3) top3.set(m.role.id, (top3.get(m.role.id) ?? 0) + 1);
    });
    ranks.push(rank);
  }
  const byRole = new Map<string, RoleFutures>();
  for (const [id, list] of scores) {
    const s = [...list].sort((a, b) => a - b);
    byRole.set(id, { roleId: id, best: (best.get(id) ?? 0) / runs, top3: (top3.get(id) ?? 0) / runs, low: Math.round(pct(s, 0.05)), mid: Math.round(pct(s, 0.5)), high: Math.round(pct(s, 0.95)) });
  }
  /** Share of futures in which `lower` (shown below) beats `upper`. */
  const swapShare = (upper: string, lower: string) => ranks.filter((m) => (m.get(lower) ?? 0) < (m.get(upper) ?? 0)).length / runs;
  return { runs, seed, byRole, swapShare };
}

/**
 * Tipping points: sweep AI speed from Gradually (0) to Quickly (1) with the published ILO
 * means and the chosen quarter, and report where the top move changes.
 */
export function tippingPoints(input: { roles: Role[]; currentRoleId: string | null; held: ReadonlySet<string>; snapshot: DosmSnapshot; ilo: IloExposure; transferable: TransferableSkills; extras?: Extras; steps?: number }) {
  const { steps = 100 } = input;
  const segments: { roleId: string; from: number; to: number }[] = [];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const top = recommendMoves(input.roles, input.currentRoleId, input.held, input.snapshot, input.ilo, scenarioAt(t), input.transferable, input.extras ?? {}).moves[0]?.role.id;
    if (!top) continue;
    const last = segments[segments.length - 1];
    if (last && last.roleId === top) last.to = t;
    else segments.push({ roleId: top, from: t, to: t });
  }
  return segments;
}
