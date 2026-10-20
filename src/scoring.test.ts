import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import dosmQ1 from '../data/sources/dosm-jmi-2026-q1.json';
import dosmQ2 from '../data/sources/dosm-jmi-2026-q2.json';
import iloFile from '../data/sources/ilo-genai-exposure-2025.json';
import {
  demandTrend, previousQuarter, rankRoles, scenarios, scoreRole, skillFit,
  type DosmSnapshot, type IloExposure, type Role,
} from './scoring';

const roles = rolesFile.roles as Role[];
const q1 = dosmQ1 as DosmSnapshot;
const q2 = dosmQ2 as DosmSnapshot;
const ilo = iloFile as IloExposure;

// --- Worked example from SIGNALS_AND_MATCHING.md (synthetic inputs) ---------
const skill = (n: number) => ({ uri: `s${n}`, label: `skill ${n}`, type: 'skill/competence', green: false, digital: false });
const exampleRole: Role = {
  id: 'example', title: 'Example role', escoUri: 'x', isco: '9999', iscoMajorGroup: '9',
  description: '', essentialSkills: [1, 2, 3, 4, 5, 6].map(skill), optionalSkills: [],
};
const exampleSnapshot: DosmSnapshot = {
  source: { name: 'test', url: '', latestQuarter: '2026-Q2', publishedAt: '', retrievedAt: '', measure: '' },
  occupationMajorGroups: [{ label: 'Group 9', iscoMajorGroup: '9', quarterly: { '2026-Q1': 100, '2026-Q2': 108 } }],
};
const exampleIlo: IloExposure = { source: { name: 'test', url: '' }, occupations: [{ isco: '9999', mean: 0.45, sd: 0.1, gradient: 'Gradient 2' }] };
const holdsThree = new Set(['s1', 's2', 's3']);

describe('worked example (hand-checked in SIGNALS_AND_MATCHING.md)', () => {
  it('F = 3/6, D = 0.5 + 8% = 0.58, R = 1 − 0.45 = 0.55', () => {
    const r = scoreRole(exampleRole, holdsThree, exampleSnapshot, exampleIlo, scenarios.moderate);
    expect(r.fit.F).toBe(0.5);
    expect(r.demand!.D).toBeCloseTo(0.58, 10);
    expect(r.resilience!.R).toBeCloseTo(0.55, 10);
  });
  it('moderate: 0.6·0.50 + 0.25·0.58 + 0.15·0.55 = 0.5275 → 53', () => {
    const r = scoreRole(exampleRole, holdsThree, exampleSnapshot, exampleIlo, scenarios.moderate);
    expect(r.score).toBeCloseTo(0.5275, 10);
    expect(r.score100).toBe(53);
  });
  it('fast: 0.5·0.50 + 0.2·0.58 + 0.3·0.55 = 0.531 → 53', () => {
    const r = scoreRole(exampleRole, holdsThree, exampleSnapshot, exampleIlo, scenarios.fast);
    expect(r.score).toBeCloseTo(0.531, 10);
  });
});

describe('rules', () => {
  it('previous quarter wraps the year', () => {
    expect(previousQuarter('2026-Q1')).toBe('2025-Q4');
    expect(previousQuarter('2026-Q2')).toBe('2026-Q1');
  });
  it('D is clamped to 0–1', () => {
    const crash = { ...exampleSnapshot, occupationMajorGroups: [{ label: 'g', iscoMajorGroup: '9', quarterly: { '2026-Q1': 100, '2026-Q2': 20 } }] };
    expect(demandTrend(crash, '9')!.D).toBe(0);
  });
  it('a missing signal shares its weight between the others and is reported', () => {
    const noIlo: IloExposure = { ...exampleIlo, occupations: [] };
    const r = scoreRole(exampleRole, holdsThree, exampleSnapshot, noIlo, scenarios.moderate);
    expect(r.missingSignals).toEqual(['R']);
    // weights 0.6 and 0.25 rescaled to sum to 1
    expect(r.score).toBeCloseTo((0.6 * 0.5 + 0.25 * 0.58) / 0.85, 10);
  });
  it('skill fit matches by ESCO URI and lists missing skills', () => {
    const f = skillFit(exampleRole, new Set(['s2', 'not-a-skill']));
    expect(f.matched.map((s) => s.uri)).toEqual(['s2']);
    expect(f.missing).toHaveLength(5);
  });
});

describe('real data', () => {
  it('every role has a DOSM demand row and an ILO exposure score', () => {
    for (const role of roles) {
      const r = scoreRole(role, new Set(), q2, ilo, scenarios.moderate);
      expect(r.missingSignals, role.title).toEqual([]);
    }
  });
  it('DOSM Professionals: Q1 2026 +15.8% (D ≈ 0.658), Q2 2026 −9.5% (D ≈ 0.405)', () => {
    expect(demandTrend(q1, '2')!.D).toBeCloseTo(0.658, 3);
    expect(demandTrend(q2, '2')!.D).toBeCloseTo(0.405, 3);
  });
  it('switching the DOSM snapshot changes the score for the same profile', () => {
    const accountant = roles.find((r) => r.id === 'accountant')!;
    const profile = new Set(accountant.essentialSkills.slice(0, 10).map((s) => s.uri));
    const before = scoreRole(accountant, profile, q1, ilo, scenarios.moderate).score;
    const after = scoreRole(accountant, profile, q2, ilo, scenarios.moderate).score;
    expect(after).toBeLessThan(before);
  });
  it('ranking returns every role once, highest score first', () => {
    const ranked = rankRoles(roles, new Set(), q2, ilo, scenarios.fast);
    expect(ranked).toHaveLength(roles.length);
    for (let i = 1; i < ranked.length; i++) expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
  });
});
