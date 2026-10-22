import { describe, expect, it } from 'vitest';
import { ilo, personaProfile, roles, snapshots, transferable } from './data';
import { rng, scenarioAt, simulateFutures, tippingPoints } from './futures';
import { scenarios } from './scoring';

const aina = personaProfile('aina');
const run = (seed = 7, runs = 300) => simulateFutures({ roles, currentRoleId: aina.currentRoleId, held: aina.held, snapshots: [snapshots.q1, snapshots.q2], ilo, transferable, runs, seed });

describe('futures simulator', () => {
  it('is reproducible: same seed, same result', () => {
    expect([...run().byRole.values()]).toEqual([...run().byRole.values()]);
    expect(rng(1)()).toBe(rng(1)());
  });
  it('AI speed 0 is exactly "Gradually" and 1 is exactly "Quickly"', () => {
    expect(scenarioAt(0).weights).toEqual(scenarios.moderate.weights);
    expect(scenarioAt(1).weights).toEqual(scenarios.fast.weights);
  });
  it('shares are valid: best-move shares add up to 1, top-3 shares to 3, ranges are ordered', () => {
    const f = [...run().byRole.values()];
    expect(f.reduce((s, x) => s + x.best, 0)).toBeCloseTo(1);
    expect(f.reduce((s, x) => s + x.top3, 0)).toBeCloseTo(3);
    for (const x of f) { expect(x.low).toBeLessThanOrEqual(x.mid); expect(x.mid).toBeLessThanOrEqual(x.high); }
  });
  it('the current job is never a move', () => {
    expect(run().byRole.has(aina.currentRoleId!)).toBe(false);
  });
  it('tipping points cover the whole AI-speed range without gaps', () => {
    const seg = tippingPoints({ roles, currentRoleId: aina.currentRoleId, held: aina.held, snapshot: snapshots.q2, ilo, transferable });
    expect(seg[0].from).toBe(0);
    expect(seg[seg.length - 1].to).toBe(1);
    for (let i = 1; i < seg.length; i++) expect(seg[i].from).toBeGreaterThan(seg[i - 1].to);
  });
});
