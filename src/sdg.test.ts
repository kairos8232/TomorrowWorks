import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import { goalFit, reviewCounts, roleSdgs, sdgData, sdgReview, sdgTotals, skillSdgs, targetGoal, targetTitle } from './sdg';
import { recommendMoves, scenarios } from './scoring';
import { ilo, personaProfile, snapshots, transferable } from './data';
import type { Role } from './scoring';

const roles = rolesFile.roles as Role[];

describe('SDG links (RunPod matches checked by people)', () => {
  const byId = (id: string) => roles.find((r) => r.id === id)!;
  const sm = byId('sustainability-manager');
  it('every role has at least one link, and every linked target has a goal and a title', () => {
    for (const r of roles) {
      const links = roleSdgs(r);
      expect(links.length, r.id).toBeGreaterThan(0);
      for (const l of links) { expect(sdgData.goals[targetGoal(l.target)], l.target).toBeDefined(); expect(targetTitle(l.target)).not.toBe(l.target); }
    }
  });
  it('skill links are matches at or above the threshold that were not rejected', () => {
    for (const r of roles) for (const s of r.essentialSkills) for (const l of skillSdgs(s).filter((x) => x.source === 'ai')) {
      expect(l.similarity!).toBeGreaterThanOrEqual(sdgReview.threshold);
      expect(sdgReview.rejectTargets.map((x) => x.target)).not.toContain(l.target);
    }
    expect(reviewCounts.rejected).toBeGreaterThan(0);
    expect(reviewCounts.rejected).toBeLessThan(reviewCounts.proposed);
  });
  it('rejected matches never show (data migration is not migration of people)', () => {
    const skill = roles.flatMap((r) => r.essentialSkills).find((s) => s.label === 'develop automated migration methods')!;
    expect(skillSdgs(skill).map((l) => l.target)).not.toContain('10.7');
  });
  it('sustainability manager: RunPod links its skills to 12.6 (sustainable company practices) and 9.4', () => {
    const ai = roleSdgs(sm).filter((l) => l.source === 'ai');
    expect(ai.map((l) => l.target)).toEqual(['12.6', '9.4']);
    expect(ai[0].skills!.length).toBeGreaterThan(5);
    expect(sdgTotals(sm.essentialSkills).map((t) => t.target)).toContain('12.6');
  });
  it('roles without a strong match keep the team-written link, labelled as such', () => {
    const links = roleSdgs(byId('billing-clerk'));
    expect(links.map((l) => [l.target, l.source])).toEqual([['8.5', 'team']]);
    expect(links[0].reason!.length).toBeGreaterThan(20);
  });
  it('ESCO digital skills also link to 4.4', () => {
    const s = { uri: 'x', label: 'use databases', type: 'skill/competence', green: false, digital: true };
    expect(skillSdgs(s).map((l) => [l.target, l.source])).toEqual([['4.4', 'esco']]);
  });
});

describe('goal fit (optional score part G)', () => {
  const byId = (id: string) => roles.find((r) => r.id === id)!;
  it('1 through the role itself, 0.5 through some skills only, 0 otherwise, null with no goals', () => {
    expect(goalFit(byId('sustainability-manager'), ['13'])).toBe(1);
    expect(goalFit(byId('accountant'), ['16'])).toBe(1);
    expect(goalFit(byId('billing-clerk'), ['13'])).toBe(0);
    expect(goalFit(byId('data-analyst'), [])).toBeNull();
  });
  it('choosing climate (13) moves sustainability manager up for Hakim', () => {
    const p = personaProfile('hakim');
    const rank = (G: ((r: Role) => number | null) | null) => recommendMoves(roles, p.currentRoleId, p.held, snapshots.q2, ilo, scenarios.moderate, transferable, { G })
      .moves.findIndex((m) => m.role.id === 'sustainability-manager');
    expect(rank((r) => goalFit(r, ['13']))).toBeLessThan(rank(null));
  });
});
