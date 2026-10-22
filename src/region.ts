// Region view: SDG contribution added up from people → groups → region.
// A "region" is the set of groups a regional body supports (e.g. a state skills
// council). Each person counts once, with the same rule as Your plan: their best
// move, and the skills they would build for it (missing + partly held). A person
// contributes to a target if that move is linked to it, or a skill they would
// build is strongly linked to it (src/sdg.ts). 4.4 (skills for work) is the baseline
// for everyone who has something to learn. No state statistics are used or implied:
// open data on workers by occupation per state is not published (checked 22 Oct 2026).
// Tested in src/region.test.ts.
import { ilo, memberSkills, roles, snapshots, teams, transferable } from './data';
import { recommendMoves, scenarios, type Skill } from './scoring';
import { roleSdgs, sdgTotals } from './sdg';

export type Region = { id: string; name: string; description: string; teamIds: string[] };

export const regions: Region[] = [{
  id: 'klang-valley',
  name: 'Klang Valley skills network',
  description: 'All three fictional groups added up: a finance team, a graduating class and a logistics office.',
  teamIds: ['finance-team', 'graduating-class', 'logistics-office'],
}];

export type PersonPath = { name: string; teamId: string; roleId: string | null; skills: Skill[]; targets: string[]; alternatives: { roleId: string; rank: number; targets: string[] }[] };

/** One person's best move and the targets their path reaches (same rule as Your plan). */
export function personPath(teamId: string, member: (typeof teams)[number]['members'][number]): PersonPath {
  const held = memberSkills(member);
  const moves = recommendMoves(roles, member.roleId, held, snapshots.q2, ilo, scenarios.moderate, transferable).moves;
  const best = moves[0];
  if (!best) return { name: member.name, teamId, roleId: null, skills: [], targets: [], alternatives: [] };
  const skills = [...best.fit.missing, ...best.fit.transferable.map((t) => t.need)];
  const targets = new Set([...roleSdgs(best.role).map((l) => l.target), ...sdgTotals(skills).map((x) => x.target)]);
  targets.delete('4.4');
  // Their 2nd and 3rd moves, where that role's own links add targets the best move does not reach.
  const alternatives = moves.slice(1, 3).map((m, k) => ({ roleId: m.role.id, rank: k + 2, targets: roleSdgs(m.role).map((l) => l.target).filter((x) => !targets.has(x)) }))
    .filter((a) => a.targets.length > 0);
  return { name: member.name, teamId, roleId: best.role.id, skills, targets: [...targets].sort(), alternatives };
}

export type RegionTarget = { target: string; people: number; byTeam: Record<string, number> };

/** Add up the paths of everyone in the region's groups. */
export function regionSdg(region: Region) {
  const groups = region.teamIds.map((id) => teams.find((t) => t.id === id)!);
  const paths = groups.flatMap((g) => g.members.map((m) => personPath(g.id, m)));
  const byTarget = new Map<string, RegionTarget>();
  for (const p of paths) for (const target of p.targets) {
    const row = byTarget.get(target) ?? { target, people: 0, byTeam: {} };
    row.people++;
    row.byTeam[p.teamId] = (row.byTeam[p.teamId] ?? 0) + 1;
    byTarget.set(target, row);
  }
  return {
    groups: groups.map((g) => ({ id: g.id, name: g.name, people: g.members.length })),
    people: paths.length,
    paths,
    targets: [...byTarget.values()].sort((a, b) => b.people - a.people || a.target.localeCompare(b.target, undefined, { numeric: true })),
    baseline: paths.filter((p) => p.skills.length > 0).length,   // everyone with something to learn counts towards 4.4
  };
}
