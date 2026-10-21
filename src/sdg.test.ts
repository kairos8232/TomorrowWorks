import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import { goalFit, goalStatus, reviewCounts, roleSdgs, sdgData, sdgReview, skillPossibleSdgs, skillSdgs, targetGoal, targetTitle } from './sdg';
import { recommendMoves, scenarios } from './scoring';
import { ilo, personaProfile, snapshots, transferable } from './data';
import type { Role } from './scoring';

const roles = rolesFile.roles as Role[];

describe('SDG links (RunPod matches: strong checked, possible not checked, 4.4 baseline)', () => {
  const byId = (id: string) => roles.find((r) => r.id === id)!;
  const sm = byId('sustainability-manager');
  const all = roles.flatMap((r) => r.essentialSkills);
  const find = (label: string) => all.find((s) => s.label === label)!;
  it('every shown target has a goal colour and a title', () => {
    for (const s of all) for (const l of [...skillSdgs(s), ...skillPossibleSdgs(s)]) {
      expect(sdgData.goals[targetGoal(l.target)], l.target).toBeDefined();
      expect(targetTitle(l.target)).not.toBe(l.target);
    }
  });
  it('strong links are at or above the threshold and not rejected; possible ones sit between possibleFrom and the threshold', () => {
    for (const s of all) {
      for (const l of skillSdgs(s).filter((x) => x.source === 'ai')) expect(l.similarity!).toBeGreaterThanOrEqual(sdgReview.threshold);
      for (const l of skillPossibleSdgs(s)) { expect(l.similarity!).toBeGreaterThanOrEqual(sdgReview.possibleFrom); expect(l.similarity!).toBeLessThan(sdgReview.threshold); }
      for (const l of [...skillSdgs(s), ...skillPossibleSdgs(s)]) expect(sdgReview.rejectTargets.map((x) => x.target)).not.toContain(l.target);
    }
    expect(reviewCounts.rejected).toBeGreaterThan(0);
    expect(reviewCounts.rejected).toBeLessThan(reviewCounts.proposed);
  });
  it('rejected matches never show (data migration is not migration of people)', () => {
    expect(skillSdgs(find('develop automated migration methods')).map((l) => l.target)).not.toContain('10.7');
  });
  it('sustainability manager: strong links to 12.6 and 9.4 from many skills', () => {
    const links = roleSdgs(sm);
    expect(links.map((l) => l.target)).toEqual(['12.6', '9.4']);
    expect(links[0].skills!.length).toBeGreaterThan(5);
  });
  it('no forced links: a role without strong matches has none (4.4 baseline only)', () => {
    expect(roleSdgs(byId('billing-clerk'))).toEqual([]);
  });
  it('climate (13) is only a possible match today, so the goal picker disables it', () => {
    expect(skillPossibleSdgs(find('advise on carbon emissions reduction')).map((l) => l.target)).toContain('13.3');
    expect(goalStatus(roles, '13')).toBe('possible');
    expect(goalStatus(roles, '12')).toBe('strong');
  });
  it('ESCO digital skills also link to 4.4', () => {
    const s = { uri: 'x', label: 'use databases', type: 'skill/competence', green: false, digital: true };
    expect(skillSdgs(s).map((l) => [l.target, l.source])).toEqual([['4.4', 'esco']]);
  });
});

describe('goal fit (optional score part G, strong links only)', () => {
  const byId = (id: string) => roles.find((r) => r.id === id)!;
  it('1 through the role itself, 0.5 through some skills only, 0 otherwise, null with no goals', () => {
    expect(goalFit(byId('sustainability-manager'), ['12'])).toBe(1);
    expect(goalFit(byId('billing-clerk'), ['12'])).toBe(0);
    expect(goalFit(byId('data-analyst'), [])).toBeNull();
    for (const g of ['8', '9', '12']) for (const r of roles.filter((x) => goalFit(x, [g]) === 0.5)) {
      expect(roleSdgs(r).some((l) => l.target.split('.')[0] === g)).toBe(false);
    }
  });
  it('choosing responsible consumption (12) moves sustainability manager up for Aina', () => {
    const p = personaProfile('aina');
    const rank = (G: ((r: Role) => number | null) | null) => recommendMoves(roles, p.currentRoleId, p.held, snapshots.q2, ilo, scenarios.moderate, transferable, { G })
      .moves.findIndex((m) => m.role.id === 'sustainability-manager');
    expect(rank((r) => goalFit(r, ['12']))).toBeLessThan(rank(null));
  });
});
