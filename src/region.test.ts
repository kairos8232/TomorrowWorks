import { describe, expect, it } from 'vitest';
import { personaProfile, teams } from './data';
import { personPath, regionSdg, regions } from './region';
import { roleSdgs, sdgTotals } from './sdg';
import { recommendMoves, scenarios } from './scoring';
import { ilo, roles, snapshots, transferable } from './data';

const region = regions[0];
const r = regionSdg(region);

describe('region SDG view (people → groups → region)', () => {
  it('counts every person of every group once', () => {
    const members = region.teamIds.reduce((n, id) => n + teams.find((t) => t.id === id)!.members.length, 0);
    expect(r.people).toBe(members);
    expect(r.paths).toHaveLength(members);
  });
  it('each target count equals the people whose path reaches it, split by group', () => {
    for (const row of r.targets) {
      expect(row.people).toBe(r.paths.filter((p) => p.targets.includes(row.target)).length);
      expect(Object.values(row.byTeam).reduce((a, b) => a + b, 0)).toBe(row.people);
    }
    expect(r.targets.some((x) => x.target === '4.4')).toBe(false);   // 4.4 is the baseline, shown separately
  });
  it('a person uses the same rule as Your plan (Aina: best move and its gap skills)', () => {
    const aina = personaProfile('aina');
    const best = recommendMoves(roles, aina.currentRoleId, aina.held, snapshots.q2, ilo, scenarios.moderate, transferable).moves[0];
    const skills = [...best.fit.missing, ...best.fit.transferable.map((t) => t.need)];
    const expected = new Set([...roleSdgs(best.role).map((l) => l.target), ...sdgTotals(skills).map((x) => x.target)]);
    expected.delete('4.4');
    const p = personPath('finance-team', teams[0].members.find((m) => m.name === 'Aina')!);
    expect(p.roleId).toBe(best.role.id);
    expect(p.targets).toEqual([...expected].sort());
  });
  it('alternatives are only 2nd/3rd moves whose role links add new targets', () => {
    for (const p of r.paths) for (const a of p.alternatives) {
      expect([2, 3]).toContain(a.rank);
      for (const t of a.targets) expect(p.targets).not.toContain(t);
    }
  });
});
