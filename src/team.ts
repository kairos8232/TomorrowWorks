// Team view: the same scoring rule as Your moves, for several people at once.
// Tested in src/team.test.ts.
import type { Resource } from './pathway';
import { scoreRole, skillFit, type DosmSnapshot, type IloExposure, type Role, type RoleScore, type Scenario, type Skill, type TransferableSkills } from './scoring';

export type Member = { name: string; roleId: string | null; held: ReadonlySet<string> };

/** One row per member, one cell per role; a member's current role is marked, never hidden. */
export function teamGrid(
  members: Member[], roles: Role[], snapshot: DosmSnapshot, ilo: IloExposure, scenario: Scenario, transferable: TransferableSkills,
) {
  const rows = members.map((m) => ({
    member: m,
    cells: roles.map((role) => ({ role, current: role.id === m.roleId, result: scoreRole(role, m.held, snapshot, ilo, scenario, transferable) as RoleScore })),
  }));
  // Average score per role over the members for whom it would be a move (not their current job).
  const averages = roles.map((role, i) => {
    const scores = rows.filter((r) => !r.cells[i].current).map((r) => r.cells[i].result.score100);
    return { role, average: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null, people: scores.length };
  });
  return { rows, averages };
}

export type SharedGap = { skill: Skill; missing: string[]; partly: string[]; course: Resource | null };

/**
 * For one target role: each essential skill with who is missing it (or only
 * partly has it), most-shared first (ties: skills with a checked course first), and the first checked course covering it
 * (free before paid). Members whose current job is the target are left out.
 */
export function sharedGaps(members: Member[], role: Role, transferable: TransferableSkills, resources: Resource[]) {
  const movers = members.filter((m) => m.roleId !== role.id);
  const byFree = [...resources].sort((a, b) => Number(b.free) - Number(a.free));
  const gaps: SharedGap[] = role.essentialSkills.map((skill) => ({ skill, missing: [], partly: [], course: byFree.find((r) => r.covers.includes(skill.label)) ?? null }));
  for (const m of movers) {
    const fit = skillFit(role, m.held, transferable);
    for (const g of gaps) {
      if (fit.missing.some((s) => s.uri === g.skill.uri)) g.missing.push(m.name);
      else if (fit.transferable.some((t) => t.need.uri === g.skill.uri)) g.partly.push(m.name);
    }
  }
  return {
    movers: movers.length,
    gaps: gaps
      .filter((g) => g.missing.length + g.partly.length > 0)
      .sort((a, b) => b.missing.length + b.partly.length - (a.missing.length + a.partly.length) || b.missing.length - a.missing.length || Number(!!b.course) - Number(!!a.course)),
  };
}
