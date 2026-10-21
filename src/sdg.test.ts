import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import { roleSdgs, sdgData, sdgTotals, skillSdgs } from './sdg';
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
