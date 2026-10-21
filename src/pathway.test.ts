import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import dosmQ2 from '../data/sources/dosm-jmi-2026-q2.json';
import iloFile from '../data/sources/ilo-genai-exposure-2025.json';
import transferableFile from '../data/derived/transferable-skills.json';
import resourcesFile from '../data/pathway/resources.json';
import nossFile from '../data/pathway/noss.json';
import { learningPlan, type Resource } from './pathway';
import { scenarios, scoreRole, type DosmSnapshot, type IloExposure, type Role, type TransferableSkills } from './scoring';

const roles = rolesFile.roles as Role[];
const resources = resourcesFile.resources as Resource[];
const score = (role: Role, held: Set<string>) =>
  scoreRole(role, held, dosmQ2 as DosmSnapshot, iloFile as IloExposure, scenarios.moderate, transferableFile as TransferableSkills);

// --- Synthetic example: the greedy order can be checked by hand -------------
const skill = (n: number) => ({ uri: `s${n}`, label: `skill ${n}`, type: 'skill/competence', green: false, digital: false });
const role: Role = { id: 'r', title: 'r', escoUri: '', isco: '9999', iscoMajorGroup: '9', description: '', essentialSkills: [1, 2, 3, 4, 5].map(skill), optionalSkills: [] };
const course = (id: string, covers: number[], hours: number | null, free = true): Resource =>
  ({ id, title: id, provider: 'test', url: '', cost: free ? 'Free' : 'Paid', free, access: null, level: '', hours, timeBasis: '', covers: covers.map((n) => `skill ${n}`) });

describe('learning plan rule (synthetic)', () => {
  const held = new Set(['s1']); // missing 2, 3, 4, 5
  it('picks the course closing the most gaps first, then the next, and lists what is left', () => {
    const plan = learningPlan(score(role, held), [course('a', [2], 2), course('b', [2, 3, 4], 10), course('c', [4], 1)]);
    expect(plan.steps.map((s) => s.resource.id)).toEqual(['b']);
    expect(plan.steps[0].closes.map((g) => g.skill.label)).toEqual(['skill 2', 'skill 3', 'skill 4']);
    expect(plan.uncovered.map((g) => g.skill.label)).toEqual(['skill 5']);
    expect(plan.statedHours).toBe(10);
  });
  it('breaks a tie on gaps closed by fewer stated hours; unknown hours count as longest', () => {
    const plan = learningPlan(score(role, held), [course('long', [2], 20), course('none', [2], null), course('short', [2], 5)]);
    expect(plan.steps.map((s) => s.resource.id)).toEqual(['short']);
  });
  it('prefers a free course over a paid one that closes the same gaps, even if longer', () => {
    const plan = learningPlan(score(role, held), [course('paid', [2, 3], 5, false), course('free', [2, 3], 20)]);
    expect(plan.steps.map((s) => s.resource.id)).toEqual(['free']);
  });
  it('never invents a step when no course covers a gap', () => {
    const plan = learningPlan(score(role, held), []);
    expect(plan.steps).toEqual([]);
    expect(plan.uncovered).toHaveLength(4);
  });
});

describe('real resources (data/pathway/resources.json)', () => {
  const labels = new Set(roles.flatMap((r) => r.essentialSkills.map((s) => s.label)));
  it('every resource maps only to ESCO essential skills that exist in roles.json', () => {
    for (const r of resources) for (const label of r.covers) expect(labels.has(label), `${r.id}: ${label}`).toBe(true);
  });
  it('every paid resource names an access programme that exists', () => {
    for (const r of resources) if (!r.free) expect((resourcesFile.access as Record<string, unknown>)[r.access ?? ''], r.id).toBeDefined();
  });
  it('every resource has a link, a cost and a stated time basis', () => {
    for (const r of resources) {
      expect(r.url).toMatch(/^https:\/\//);
      expect(r.cost).not.toBe('');
      expect(r.timeBasis).not.toBe('');
    }
  });
  it("Aina's plan for financial analyst starts with financial statements and closes only real gaps", () => {
    const aa = roles.find((r) => r.id === 'accounting-assistant')!;
    const fa = roles.find((r) => r.id === 'financial-analyst')!;
    const plan = learningPlan(score(fa, new Set(aa.essentialSkills.map((s) => s.uri))), resources);
    const gapLabels = new Set(plan.gaps.map((g) => g.skill.label));
    for (const step of plan.steps) for (const g of step.closes) expect(gapLabels.has(g.skill.label)).toBe(true);
    expect(plan.steps[0].resource.id).toBe('ol-financial-statements');
    expect(plan.steps.length + plan.uncovered.length).toBeGreaterThan(0);
  });
});

describe('Malaysian certification route (data/pathway/noss.json)', () => {
  const noss = nossFile as {
    sources: Record<string, { url: string }>;
    roles: Record<string, { match: string; noss: { code: string; level: number; source: string; page: number }[] }>;
  };
  it('every role has an entry, and "none" means no codes are shown', () => {
    for (const r of roles) {
      const entry = noss.roles[r.id];
      expect(entry, r.id).toBeDefined();
      expect(entry.match === 'none').toBe(entry.noss.length === 0);
    }
  });
  it('every NOSS code has the JPK shape, a level 1–5 and a cited source', () => {
    for (const entry of Object.values(noss.roles)) for (const n of entry.noss) {
      expect(n.code).toMatch(/^[A-Z]+\d*-\d{3}-\d(:\d{4})?$/);
      expect(Number(n.code.split('-')[2][0])).toBe(n.level);
      expect(noss.sources[n.source]?.url).toMatch(/^https:\/\//);
      expect(n.page).toBeGreaterThan(0);
    }
  });
});

describe('sample people (src/data.ts)', () => {
  it('every persona skill resolves to a real ESCO skill in the role set', async () => {
    const { personas, personaProfile } = await import('./data');
    for (const p of personas) {
      const profile = personaProfile(p.id);
      expect(profile.held.size, p.id).toBe(p.skillLabels ? p.skillLabels.length : roles.find((r) => r.id === p.roleId)!.essentialSkills.length);
    }
  });
});
