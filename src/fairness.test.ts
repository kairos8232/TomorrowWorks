// Fairness check shown on Your moves ("Is this fair?"). The ranking only sees
// confirmed ESCO skills; these tests prove that nothing else changes a result.
import { describe, expect, it } from 'vitest';
import { emptyProfile, ilo, personaProfile, roles, snapshots, teams, memberSkills, transferable, type Profile } from './data';
import { recommendMoves, scenarios, scoreRole } from './scoring';

const scores = (p: Profile) => recommendMoves(roles, p.currentRoleId, p.held, snapshots.q2, ilo, scenarios.moderate, transferable)
  .moves.map((m) => [m.role.id, m.score]);

describe('fairness: only skills decide the scores', () => {
  it('a profile has no field for age, gender, ethnicity, religion, name or location', () => {
    // interests and goals = what the person says they enjoy and want to contribute to; only used when they switch them on
    expect(Object.keys(emptyProfile()).sort()).toEqual(['currentRoleId', 'extra', 'goals', 'held', 'interests', 'persona']);
  });
  it('the same skills give the same scores whoever holds them (named sample person vs anonymous visitor)', () => {
    const aina = personaProfile('aina');
    const anonymous: Profile = { ...emptyProfile(), currentRoleId: aina.currentRoleId, held: new Set(aina.held) };
    expect(scores(anonymous)).toEqual(scores(aina));
  });
  it('team members with identical skills get identical rows (Aina and Farah)', () => {
    const team = teams.find((t) => t.id === 'finance-team')!;
    const [aina, farah] = ['Aina', 'Farah'].map((n) => memberSkills(team.members.find((m) => m.name === n)!));
    for (const role of roles) {
      expect(scoreRole(role, aina, snapshots.q2, ilo, scenarios.fast, transferable).score)
        .toBe(scoreRole(role, farah, snapshots.q2, ilo, scenarios.fast, transferable).score);
    }
  });
  it('the order in which skills were added does not matter', () => {
    const held = [...personaProfile('hakim').held];
    const a: Profile = { ...emptyProfile(), held: new Set(held) };
    const b: Profile = { ...emptyProfile(), held: new Set([...held].reverse()) };
    expect(scores(a)).toEqual(scores(b));
  });
  it('the current job only removes that role from the list; other scores are unchanged', () => {
    const held = personaProfile('aina').held;
    const withJob = recommendMoves(roles, 'accounting-assistant', held, snapshots.q2, ilo, scenarios.moderate, transferable).moves;
    const without = recommendMoves(roles, null, held, snapshots.q2, ilo, scenarios.moderate, transferable).moves;
    for (const m of withJob) expect(m.score).toBe(without.find((x) => x.role.id === m.role.id)!.score);
  });
});
