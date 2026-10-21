import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import dosmQ2 from '../data/sources/dosm-jmi-2026-q2.json';
import iloFile from '../data/sources/ilo-genai-exposure-2025.json';
import { interestData, interestFit, typeCredit, type RoleInterest } from './interests';
import { recommendMoves, scenarios, scoreRole, INTEREST_WEIGHT, type DosmSnapshot, type IloExposure, type Role } from './scoring';

const roles = rolesFile.roles as Role[];

describe('interest fit rule', () => {
  const profile: RoleInterest = { source: 'jobtag', match: 'close', occupation: 'x', code: 'x', url: 'x', scores: { R: 2.9, I: 2.7, A: 2.2, S: 2.8, E: 3.0, C: 3.2 } };
  it('top two types get 1, the third 0.5, the rest 0 (accounting clerk: C 3.2, E 3.0, R 2.9)', () => {
    expect(typeCredit(profile, 'C')).toBe(1);
    expect(typeCredit(profile, 'E')).toBe(1);
    expect(typeCredit(profile, 'R')).toBe(0.5);
    expect(typeCredit(profile, 'A')).toBe(0);
  });
  it('ties for second place both count as top two', () => {
    const tied = { ...profile, scores: { R: 2.9, I: 3.8, A: 2.3, S: 4.2, E: 3.8, C: 3.5 } };
    expect(typeCredit(tied, 'I')).toBe(1);
    expect(typeCredit(tied, 'E')).toBe(1);
  });
  it('O*NET letters: first two 1, third 0.5', () => {
    const onet: RoleInterest = { source: 'onet', match: 'close', occupation: 'x', code: 'x', url: 'x', letters: 'EIC' };
    expect([typeCredit(onet, 'E'), typeCredit(onet, 'I'), typeCredit(onet, 'C'), typeCredit(onet, 'S')]).toEqual([1, 1, 0.5, 0]);
  });
  it('averages over picks and is null without picks', () => {
    expect(interestFit('accounting-assistant', ['C', 'A'])).toBe(0.5);
    expect(interestFit('accounting-assistant', [])).toBeNull();
  });
  it('every role has a profile with a source link', () => {
    for (const r of roles) {
      const p = interestData.roles[r.id];
      expect(p, r.id).toBeDefined();
      expect(p.url).toMatch(/^https:\/\//);
      expect(Boolean(p.scores) || Boolean(p.letters)).toBe(true);
    }
  });
});

describe('interests in the score (switch on)', () => {
  const snap = dosmQ2 as DosmSnapshot;
  const ilo = iloFile as IloExposure;
  const role = roles.find((r) => r.id === 'data-analyst')!;
  it('off: the score is unchanged', () => {
    expect(scoreRole(role, new Set(), snap, ilo, scenarios.moderate, undefined, null).score)
      .toBe(scoreRole(role, new Set(), snap, ilo, scenarios.moderate).score);
  });
  it('on: interest is one part, weights rescaled to sum to 1', () => {
    const r = scoreRole(role, new Set(), snap, ilo, scenarios.moderate, undefined, () => 1);
    const total = r.contributions.reduce((s, c) => s + c.weight, 0);
    expect(total).toBeCloseTo(1, 10);
    expect(r.contributions.find((c) => c.key === 'I')!.weight).toBeCloseTo(INTEREST_WEIGHT / 1.2, 10);
  });
  it('picking investigative work moves data analyst above billing clerk for a person with no skills', () => {
    const fn = (r: Role) => interestFit(r.id, ['I']);
    const order = recommendMoves(roles, null, new Set(), snap, ilo, scenarios.moderate, undefined, fn).moves.map((m) => m.role.id);
    expect(order.indexOf('data-analyst')).toBeLessThan(order.indexOf('billing-clerk'));
  });
});
