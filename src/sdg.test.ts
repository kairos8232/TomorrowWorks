import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import { goalFit, goalStatus, reviewCounts, roleSdgs, sdgData, sdgReview, skillPossibleSdgs, skillSdgs, targetGoal, targetTitle } from './sdg';
import { recommendMoves, scenarios } from './scoring';
import { ilo, personaProfile, snapshots, transferable } from './data';
import type { Role } from './scoring';

const roles = rolesFile.roles as Role[];

describe('SDG links (two-reviewer labels: relevant = strong, uncertain = possible, not relevant = hidden)', () => {
  const byId = (id: string) => roles.find((r) => r.id === id)!;
  const all = roles.flatMap((r) => r.essentialSkills);
  const find = (label: string) => all.find((s) => s.label === label)!;
  const labelOf = (skill: string, target: string) => sdgReview.labels.find((l) => l.skill === skill && l.target === target)?.label;
  it('every shown target has a goal colour and a title', () => {
    for (const s of all) for (const l of [...skillSdgs(s), ...skillPossibleSdgs(s)]) {
      expect(sdgData.goals[targetGoal(l.target)], l.target).toBeDefined();
      expect(targetTitle(l.target)).not.toBe(l.target);
    }
  });
  it('strong links are exactly the pairs the reviewers labelled relevant (plus ESCO digital -> 4.4)', () => {
    for (const s of all) for (const l of skillSdgs(s)) {
      if (l.source === 'esco') expect(l.target).toBe('4.4');
      else expect(labelOf(s.label, l.target)).toBe('relevant');
    }
    expect(reviewCounts.relevant).toBe(sdgReview.labels.filter((l) => l.label === 'relevant').length);
  });
  it('pairs labelled not relevant never show; uncertain ones only as possible', () => {
    for (const s of all) for (const l of [...skillSdgs(s), ...skillPossibleSdgs(s)]) expect(labelOf(s.label, l.target)).not.toBe('not relevant');
    const s = find('offer financial services');
    expect(skillSdgs(s).map((l) => l.target)).not.toContain('9.3');
    expect(skillPossibleSdgs(s).find((l) => l.target === '9.3')?.uncertain).toBe(true);
    expect(skillSdgs(find('develop automated migration methods')).map((l) => l.target)).not.toContain('10.7');
  });
  it('keyword-proposed links count when reviewers confirmed them (environmental awareness -> 12.8, energy efficiency -> 7.3)', () => {
    expect(skillSdgs(find('promote environmental awareness')).map((l) => l.target)).toContain('12.8');
    expect(skillSdgs(find('energy efficiency')).map((l) => l.target)).toContain('7.3');
  });
  it('sustainability manager links to 12.6 and 9.4 through many skills; billing clerk has none (4.4 baseline only)', () => {
    expect(roleSdgs(byId('sustainability-manager')).map((l) => l.target)).toEqual(['12.6', '9.4']);
    expect(roleSdgs(byId('billing-clerk'))).toEqual([]);
  });
  it('goal picker: climate (13) and clean energy (7) have reviewed links; 16 only possible ones', () => {
    expect(goalStatus(roles, '13')).toBe('strong');
    expect(goalStatus(roles, '7')).toBe('strong');
    expect(goalStatus(roles, '16')).toBe('possible');
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
