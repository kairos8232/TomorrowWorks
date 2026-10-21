// Explainable role scoring. The rule is documented in SIGNALS_AND_MATCHING.md
// ("Scoring rule (hand-checkable)") and tested in src/scoring.test.ts.
//
//   score = wF·F + wD·D + wR·R
//   F  skill fit       = (exact matches + 0.5 × transferable) / essential skills of the role
//                        transferable = the person holds a different ESCO skill whose RunPod
//                        embedding is ≥ 0.85 similar (data/derived/transferable-skills.json)
//   D  demand trend    = clamp(0.5 + Δ, 0, 1), Δ = quarter-on-quarter change in DOSM
//                        online job offerings for the role's ISCO major group
//   R  AI resilience   = 1 − ILO mean GenAI exposure of the role's ISCO code
//   I  interest fit    = optional, only when the person turns it on (src/interests.ts);
//                        weight INTEREST_WEIGHT, then all weights are rescaled to sum to 1
//
// Every function here is pure: data goes in, numbers and reasons come out.

export type Skill = { uri: string; label: string; type: string; green: boolean; digital: boolean };

export type Role = {
  id: string;
  title: string;
  escoUri: string;
  isco: string;
  iscoMajorGroup: string;
  description: string;
  essentialSkills: Skill[];
  optionalSkills: Skill[];
};

export type DosmSnapshot = {
  source: { name: string; url: string; latestQuarter: string; publishedAt: string; retrievedAt: string; measure: string };
  occupationMajorGroups: { label: string; iscoMajorGroup?: string | null; quarterly: Record<string, number | null> }[];
};

export type IloExposure = {
  source: { name: string; url: string };
  occupations: { isco: string; mean: number; sd: number; gradient: string }[];
};

/** Needed-skill URI → ESCO skills that make it transferable (from scripts/build_transferable_skills.py). */
export type TransferableSkills = {
  method: { threshold: number; credit: number; model: string };
  neededSkills: Record<string, { label: string; transferableFrom: { uri: string; label: string; similarity: number }[] }>;
};

export const noTransferableSkills: TransferableSkills = { method: { threshold: 1, credit: 0, model: 'none' }, neededSkills: {} };

export type ScenarioId = 'moderate' | 'fast';

export type Scenario = { id: ScenarioId; label: string; assumption: string; weights: { F: number; D: number; R: number } };

export const scenarios: Record<ScenarioId, Scenario> = {
  moderate: {
    id: 'moderate',
    label: 'Moderate AI change',
    assumption: 'Exposure changes tasks gradually; current demand matters more.',
    weights: { F: 0.6, D: 0.25, R: 0.15 },
  },
  fast: {
    id: 'fast',
    label: 'Fast AI change',
    assumption: 'Highly exposed tasks change sooner; resilience matters more.',
    weights: { F: 0.5, D: 0.2, R: 0.3 },
  },
};

/** Weight of the optional interest part, before rescaling (0.2 of 1.2 = 1/6 of the score). */
export const INTEREST_WEIGHT = 0.2;

/** Interest fit for one role (0 to 1), or null when interests are off or unknown. */
export type InterestFn = (role: Role) => number | null;

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** The quarter before "YYYY-Qn", e.g. 2026-Q1 → 2025-Q4. */
export function previousQuarter(quarter: string) {
  const [year, q] = quarter.split('-Q').map(Number);
  return q === 1 ? `${year - 1}-Q4` : `${year}-Q${q - 1}`;
}

/**
 * Skill fit. Each essential skill of the role is one of:
 *   matched      – the person confirmed this exact ESCO skill (full credit)
 *   transferable – the person holds a closely related ESCO skill (partial credit, pair shown)
 *   missing      – neither
 */
export function skillFit(role: Role, confirmedSkillUris: ReadonlySet<string>, transferable: TransferableSkills = noTransferableSkills) {
  const matched: Skill[] = [];
  const related: { need: Skill; have: { uri: string; label: string }; similarity: number }[] = [];
  const missing: Skill[] = [];
  for (const need of role.essentialSkills) {
    if (confirmedSkillUris.has(need.uri)) {
      matched.push(need);
      continue;
    }
    const best = (transferable.neededSkills[need.uri]?.transferableFrom ?? []).find((c) => confirmedSkillUris.has(c.uri));
    if (best) related.push({ need, have: { uri: best.uri, label: best.label }, similarity: best.similarity });
    else missing.push(need);
  }
  const total = role.essentialSkills.length;
  const F = total ? (matched.length + transferable.method.credit * related.length) / total : 0;
  return { F, matched, transferable: related, missing };
}

/** Demand trend for an ISCO major group from one DOSM snapshot, or null if DOSM has no usable row. */
export function demandTrend(snapshot: DosmSnapshot, majorGroup: string) {
  const row = snapshot.occupationMajorGroups.find((r) => r.iscoMajorGroup === majorGroup);
  const current = snapshot.source.latestQuarter;
  const previous = previousQuarter(current);
  const now = row?.quarterly[current];
  const before = row?.quarterly[previous];
  if (!row || now == null || before == null || before === 0) return null;
  const change = (now - before) / before;
  return { D: clamp(0.5 + change), change, group: row.label, current, previous, now, before };
}

/** AI resilience from the ILO exposure index, or null if the ISCO code is not listed. */
export function aiResilience(ilo: IloExposure, isco: string) {
  const occ = ilo.occupations.find((o) => o.isco === isco);
  if (!occ) return null;
  return { R: 1 - occ.mean, exposure: occ.mean, gradient: occ.gradient };
}

/**
 * Score one role. If a signal is missing, its weight is shared between the
 * remaining parts in proportion to their weights, and the result says so.
 */
export function scoreRole(
  role: Role, confirmedSkillUris: ReadonlySet<string>, snapshot: DosmSnapshot, ilo: IloExposure, scenario: Scenario,
  transferable: TransferableSkills = noTransferableSkills, interest: InterestFn | null = null,
) {
  const fit = skillFit(role, confirmedSkillUris, transferable);
  const demand = demandTrend(snapshot, role.iscoMajorGroup);
  const resilience = aiResilience(ilo, role.isco);

  const parts = [
    { key: 'F' as 'F' | 'D' | 'R' | 'I', value: fit.F as number | null, weight: scenario.weights.F },
    { key: 'D' as const, value: demand?.D ?? null, weight: scenario.weights.D },
    { key: 'R' as const, value: resilience?.R ?? null, weight: scenario.weights.R },
  ];
  const I = interest ? interest(role) : null;
  if (I !== null) parts.push({ key: 'I' as const, value: I, weight: INTEREST_WEIGHT });
  const available = parts.filter((p) => p.value !== null);
  const totalWeight = available.reduce((sum, p) => sum + p.weight, 0);
  const contributions = available.map((p) => ({ key: p.key, value: p.value as number, weight: p.weight / totalWeight }));
  const score = contributions.reduce((sum, c) => sum + c.weight * c.value, 0);

  return {
    role,
    score,
    score100: Math.round(score * 100),
    contributions,
    missingSignals: parts.filter((p) => p.value === null).map((p) => p.key),
    fit,
    demand,
    resilience,
    scenario,
  };
}

export type RoleScore = ReturnType<typeof scoreRole>;

/** Rank roles by score, highest first; ties keep role-set order. */
export function rankRoles(
  roles: Role[], confirmedSkillUris: ReadonlySet<string>, snapshot: DosmSnapshot, ilo: IloExposure, scenario: Scenario,
  transferable: TransferableSkills = noTransferableSkills, interest: InterestFn | null = null,
) {
  return roles
    .map((role, index) => ({ index, result: scoreRole(role, confirmedSkillUris, snapshot, ilo, scenario, transferable, interest) }))
    .sort((a, b) => b.result.score - a.result.score || a.index - b.index)
    .map((x) => x.result);
}

/**
 * Split the person's current job ("where you are") from the ranked moves.
 * The current job would always win on skill fit, so it is shown for
 * comparison and never recommended.
 */
export function recommendMoves(
  roles: Role[], currentRoleId: string | null, confirmedSkillUris: ReadonlySet<string>, snapshot: DosmSnapshot,
  ilo: IloExposure, scenario: Scenario, transferable: TransferableSkills = noTransferableSkills, interest: InterestFn | null = null,
) {
  const current = roles.find((r) => r.id === currentRoleId) ?? null;
  return {
    current: current ? scoreRole(current, confirmedSkillUris, snapshot, ilo, scenario, transferable, interest) : null,
    moves: rankRoles(roles.filter((r) => r !== current), confirmedSkillUris, snapshot, ilo, scenario, transferable, interest),
  };
}
