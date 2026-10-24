import { describe, expect, it } from 'vitest';
import resourcesFile from '../data/pathway/resources.json';
import { ilo, memberSkills, roles, snapshots, teams, transferable } from './data';
import type { Resource } from './pathway';
import { scenarios, scoreRole } from './scoring';
import { sharedGaps, teamGrid } from './team';

const resources = resourcesFile.resources as Resource[];
const membersOf = (id: string) => teams.find((t) => t.id === id)!.members.map((m) => ({ name: m.name, roleId: m.roleId, held: memberSkills(m) }));

describe('team view', () => {
  it('every sample member skill resolves to a real ESCO skill', () => {
    for (const t of teams) for (const m of t.members) {
      expect(memberSkills(m).size, `${t.id}/${m.name}`).toBe(m.skillLabels ? m.skillLabels.length : roles.find((r) => r.id === m.roleId)!.essentialSkills.length);
    }
  });
  it('each cell is exactly the individual score (same rule as Your moves)', () => {
    const members = membersOf('finance-team');
    const grid = teamGrid(members, roles, snapshots.q2, ilo, scenarios.moderate, transferable);
    const cell = grid.rows[1].cells[3];
    expect(cell.result.score).toBe(scoreRole(cell.role, members[1].held, snapshots.q2, ilo, scenarios.moderate, transferable).score);
  });
  it('averages leave out members for whom the role is their current job', () => {
    const grid = teamGrid(membersOf('finance-team'), roles, snapshots.q2, ilo, scenarios.moderate, transferable);
    expect(grid.averages.find((a) => a.role.id === 'accounting-assistant')!.people).toBe(3); // 5 members, 2 are accounting assistants
  });
  it('shared gaps count each member once and sort most-shared first', () => {
    const da = roles.find((r) => r.id === 'data-analyst')!;
    const { gaps, movers } = sharedGaps(membersOf('graduating-class'), da, transferable, resources);
    expect(movers).toBe(3);
    for (const g of gaps) expect(g.missing.length + g.partly.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < gaps.length; i++) expect(gaps[i - 1].missing.length + gaps[i - 1].partly.length).toBeGreaterThanOrEqual(gaps[i].missing.length + gaps[i].partly.length);
  });
});
