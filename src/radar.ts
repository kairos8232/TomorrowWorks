// Future Skills Radar: an estimated outlook for every essential skill of the
// nine roles, from the same two market signals as Your moves. Tested in src/radar.test.ts.
//
// For a skill needed by roles r1..rk (essential skills in data/roles.json):
//   D(skill) = average of D(r) over those roles with DOSM data   (job-ad trend, 0..1)
//   R(skill) = average of R(r) over those roles with ILO data    (1 − AI exposure, 0..1)
//   outlook  = (wD·D + wR·R) / (wD + wR), with the scenario's weights (Gradually / Quickly)
// Missing signals share their weight as in scoreRole. Rank 1 = strongest outlook.
// "Rising / falling" compares the skill's rank under the previous and latest DOSM snapshot.
// This is an estimate derived from roles, not a measured demand for the skill itself.
import { aiResilience, demandTrend, type DosmSnapshot, type IloExposure, type Role, type Scenario, type Skill } from './scoring';

export type RadarRow = {
  skill: Skill;
  roles: Role[];
  D: number | null;
  R: number | null;
  demandChange: number | null; // average quarter-on-quarter job-ad change of those roles' groups
  exposure: number | null;     // average ILO exposure of those roles
  outlook: number;
  rank: number;
};

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function skillRadar(roles: Role[], snapshot: DosmSnapshot, ilo: IloExposure, scenario: Scenario): RadarRow[] {
  const bySkill = new Map<string, { skill: Skill; roles: Role[] }>();
  for (const role of roles) for (const s of role.essentialSkills) {
    const entry = bySkill.get(s.uri) ?? { skill: s, roles: [] };
    entry.roles.push(role);
    bySkill.set(s.uri, entry);
  }
  const rows = [...bySkill.values()].map(({ skill, roles: needing }) => {
    const demands = needing.map((r) => demandTrend(snapshot, r.iscoMajorGroup)).filter((d) => d !== null);
    const resiliences = needing.map((r) => aiResilience(ilo, r.isco)).filter((x) => x !== null);
    const D = mean(demands.map((d) => d!.D));
    const R = mean(resiliences.map((x) => x!.R));
    const parts = [{ v: D, w: scenario.weights.D }, { v: R, w: scenario.weights.R }].filter((p) => p.v !== null);
    const totalW = parts.reduce((a, p) => a + p.w, 0);
    const outlook = totalW ? parts.reduce((a, p) => a + (p.w / totalW) * (p.v as number), 0) : 0;
    return {
      skill, roles: needing, D, R, outlook, rank: 0,
      demandChange: mean(demands.map((d) => d!.change)),
      exposure: mean(resiliences.map((x) => x!.exposure)),
    };
  });
  rows.sort((a, b) => b.outlook - a.outlook || b.roles.length - a.roles.length || a.skill.label.localeCompare(b.skill.label));
  rows.forEach((r, i) => { r.rank = i + 1; });
  return rows;
}

/** Rank change per skill between two radars (positive = moved up). */
export function rankChanges(before: RadarRow[], after: RadarRow[]) {
  const was = new Map(before.map((r) => [r.skill.uri, r.rank]));
  return new Map(after.map((r) => [r.skill.uri, (was.get(r.skill.uri) ?? r.rank) - r.rank]));
}

/**
 * Skills needed by exactly the same roles share the same signals, so the radar
 * shows them as one group (ranking them one by one would be false precision).
 * Groups are ranked by outlook; key = the role ids joined with '+'.
 */
export type RadarGroup = { key: string; roles: Role[]; skills: Skill[]; outlook: number; demandChange: number | null; exposure: number | null; rank: number };

export function radarGroups(rows: RadarRow[]): RadarGroup[] {
  const groups = new Map<string, RadarGroup>();
  for (const r of rows) {
    const key = r.roles.map((x) => x.id).join('+');
    const g = groups.get(key) ?? { key, roles: r.roles, skills: [], outlook: r.outlook, demandChange: r.demandChange, exposure: r.exposure, rank: 0 };
    g.skills.push(r.skill);
    groups.set(key, g);
  }
  const list = [...groups.values()].sort((a, b) => b.outlook - a.outlook || b.roles.length - a.roles.length || b.skills.length - a.skills.length);
  list.forEach((g, i) => { g.rank = i + 1; g.skills.sort((a, b) => a.label.localeCompare(b.label)); });
  return list;
}

/** Group rank change between two snapshots (positive = moved up). */
export function groupRankChanges(before: RadarGroup[], after: RadarGroup[]) {
  const was = new Map(before.map((g) => [g.key, g.rank]));
  return new Map(after.map((g) => [g.key, (was.get(g.key) ?? g.rank) - g.rank]));
}
