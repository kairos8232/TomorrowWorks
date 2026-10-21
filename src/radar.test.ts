import { describe, expect, it } from 'vitest';
import { ilo, roles, snapshots } from './data';
import { groupRankChanges, radarGroups, rankChanges, skillRadar } from './radar';
import { scenarios, type DosmSnapshot, type IloExposure, type Role } from './scoring';

const skill = (n: number) => ({ uri: `s${n}`, label: `skill ${n}`, type: 'skill/competence', green: false, digital: false });
const role = (id: string, isco: string, group: string, skills: number[]): Role =>
  ({ id, title: id, escoUri: '', isco, iscoMajorGroup: group, description: '', essentialSkills: skills.map(skill), optionalSkills: [] });
const snap: DosmSnapshot = {
  source: { name: 't', url: '', latestQuarter: '2026-Q2', publishedAt: '', retrievedAt: '', measure: '' },
  occupationMajorGroups: [
    { label: 'G1', iscoMajorGroup: '1', quarterly: { '2026-Q1': 100, '2026-Q2': 110 } }, // +10% -> D 0.6
    { label: 'G2', iscoMajorGroup: '2', quarterly: { '2026-Q1': 100, '2026-Q2': 90 } },  // -10% -> D 0.4
  ],
};
const iloT: IloExposure = { source: { name: 't', url: '' }, occupations: [{ isco: '1111', mean: 0.2, sd: 0, gradient: '' }, { isco: '2222', mean: 0.6, sd: 0, gradient: '' }] };
const a = role('a', '1111', '1', [1, 2]); // D 0.6, R 0.8
const b = role('b', '2222', '2', [2, 3]); // D 0.4, R 0.4

describe('skill radar rule (synthetic, hand-checkable)', () => {
  const rows = skillRadar([a, b], snap, iloT, scenarios.moderate); // wD 0.25, wR 0.15
  const byLabel = (l: string) => rows.find((r) => r.skill.label === l)!;
  it('a skill needed by one role takes that role\'s signals', () => {
    expect(byLabel('skill 1').outlook).toBeCloseTo((0.25 * 0.6 + 0.15 * 0.8) / 0.4, 10); // 0.675
    expect(byLabel('skill 3').outlook).toBeCloseTo((0.25 * 0.4 + 0.15 * 0.4) / 0.4, 10); // 0.4
  });
  it('a skill needed by two roles averages them', () => {
    const s2 = byLabel('skill 2');
    expect(s2.D).toBeCloseTo(0.5, 10);
    expect(s2.R).toBeCloseTo(0.6, 10);
    expect(s2.roles.map((r) => r.id)).toEqual(['a', 'b']);
  });
  it('ranks strongest outlook first', () => {
    expect(rows.map((r) => r.skill.label)).toEqual(['skill 1', 'skill 2', 'skill 3']);
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3]);
  });
  it('the fast scenario weights AI resilience more', () => {
    const fast = skillRadar([a, b], snap, iloT, scenarios.fast);
    expect(fast.find((r) => r.skill.label === 'skill 1')!.outlook).toBeCloseTo((0.2 * 0.6 + 0.3 * 0.8) / 0.5, 10);
  });
});

describe('skill radar with real data', () => {
  it('covers every essential skill once and reports rank changes between snapshots', () => {
    const q1 = skillRadar(roles, snapshots.q1, ilo, scenarios.moderate);
    const q2 = skillRadar(roles, snapshots.q2, ilo, scenarios.moderate);
    expect(q2.length).toBe(new Set(roles.flatMap((r) => r.essentialSkills.map((s) => s.uri))).size);
    const changes = rankChanges(q1, q2);
    expect([...changes.values()].reduce((x, y) => x + y, 0)).toBe(0); // ranks only move between skills
  });
});

describe('radar groups', () => {
  it('skills needed by the same roles form one group; groups cover every skill once', () => {
    const groups = radarGroups(skillRadar(roles, snapshots.q2, ilo, scenarios.moderate));
    const total = groups.reduce((n, g) => n + g.skills.length, 0);
    expect(total).toBe(new Set(roles.flatMap((r) => r.essentialSkills.map((s) => s.uri))).size);
    expect(new Set(groups.map((g) => g.key)).size).toBe(groups.length);
    for (let i = 1; i < groups.length; i++) expect(groups[i - 1].outlook).toBeGreaterThanOrEqual(groups[i].outlook);
  });
  it('group rank changes between snapshots sum to zero', () => {
    const before = radarGroups(skillRadar(roles, snapshots.q1, ilo, scenarios.moderate));
    const after = radarGroups(skillRadar(roles, snapshots.q2, ilo, scenarios.moderate));
    expect([...groupRankChanges(before, after).values()].reduce((a, b) => a + b, 0)).toBe(0);
  });
});
