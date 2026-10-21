import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import { goalFit, roleSdgs, sdgData, sdgTotals, skillSdgs } from './sdg';
import { recommendMoves, scenarios } from './scoring';
import { ilo, personaProfile, snapshots, transferable } from './data';
import type { Role } from './scoring';

const roles = rolesFile.roles as Role[];
const skill = (label: string, green = false, digital = false) => ({ uri: label, label, type: 'skill/competence', green, digital });

describe('SDG links', () => {
  it('every role has at least one target with a reason, and every target exists', () => {
    for (const r of roles) {
      const links = roleSdgs(r.id);
      expect(links.length, r.id).toBeGreaterThan(0);
      for (const l of links) { expect(sdgData.targets[l.target], l.target).toBeDefined(); expect(l.reason.length).toBeGreaterThan(20); }
    }
  });
  it('every rule target exists and every target has a goal', () => {
    for (const rule of sdgData.skillRules) expect(sdgData.targets[rule.target], rule.target).toBeDefined();
    for (const t of Object.values(sdgData.targets)) expect(sdgData.goals[t.goal]).toBeDefined();
  });
  it('skills get specific links from their wording and ESCO flags', () => {
    expect(skillSdgs(skill('advise on carbon emissions reduction', true)).map((l) => l.target)).toEqual(['13.2']);
    expect(skillSdgs(skill('fraud detection')).map((l) => l.target)).toEqual(['16.5']);
    expect(skillSdgs(skill('environmental policy', true)).map((l) => l.target)).toEqual(['12']);
    expect(skillSdgs(skill('use databases', false, true)).map((l) => l.target)).toEqual(['4.4']);
    expect(skillSdgs(skill('file documents'))).toEqual([]);
  });
  it('sustainability manager essential skills reach climate, waste and reporting targets', () => {
    const sm = roles.find((r) => r.id === 'sustainability-manager')!;
    const targets = sdgTotals(sm.essentialSkills).map((t) => t.target);
    for (const t of ['13.2', '12.5', '12.6']) expect(targets).toContain(t);
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
