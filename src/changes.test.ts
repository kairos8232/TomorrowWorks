import { describe, expect, it } from 'vitest';
import { ilo, personaProfile, roles, snapshots, transferable } from './data';
import { whatChanged } from './changes';
import { recommendMoves, scenarios } from './scoring';

const movesFor = (id: 'aina' | 'hakim', snap: 'q1' | 'q2') => {
  const p = personaProfile(id);
  return recommendMoves(roles, p.currentRoleId, p.held, snapshots[snap], ilo, scenarios.moderate, transferable).moves;
};

describe('what changed between job-ad snapshots', () => {
  it('reports real rank and score changes, biggest rank move first', () => {
    const changes = whatChanged(movesFor('aina', 'q1'), movesFor('aina', 'q2'));
    for (const c of changes) expect(c.rankBefore !== c.rankAfter || c.scoreBefore !== c.scoreAfter).toBe(true);
    for (let i = 1; i < changes.length; i++) {
      expect(Math.abs(changes[i - 1].rankBefore - changes[i - 1].rankAfter)).toBeGreaterThanOrEqual(Math.abs(changes[i].rankBefore - changes[i].rankAfter));
    }
  });
  it('the reason is the DOSM job-ad change of the role\'s occupation group in each snapshot', () => {
    const changes = whatChanged(movesFor('hakim', 'q1'), movesFor('hakim', 'q2'));
    for (const c of changes) {
      expect(c.changeAfter).not.toBeNull();
      // A move whose score went up had a better job-ad change in the latest quarter than before.
      if (c.scoreAfter > c.scoreBefore) expect(c.changeAfter!).toBeGreaterThan(c.changeBefore!);
      if (c.scoreAfter < c.scoreBefore) expect(c.changeAfter!).toBeLessThan(c.changeBefore!);
    }
  });
  it('nothing changes when the data does not', () => {
    expect(whatChanged(movesFor('aina', 'q2'), movesFor('aina', 'q2'))).toEqual([]);
  });
});
