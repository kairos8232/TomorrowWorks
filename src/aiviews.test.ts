import { describe, expect, it } from 'vitest';
import { roles } from './data';
import { aiSources, aiViews, msData, roleSoc } from './aiviews';

describe('three views of AI impact', () => {
  it('every role has a SOC code that exists in the Microsoft data', () => {
    for (const r of roles) {
      const soc = roleSoc.roles[r.id]?.soc;
      expect(soc, r.id).toBeDefined();
      expect(msData.occupations.some((o) => o.soc === soc), `${r.id} ${soc}`).toBe(true);
    }
  });
  it('values placed on the ILO scale stay within 0-1 and keep the order of the source', () => {
    const v = roles.map((r) => aiViews(r));
    for (const x of v) { expect(x.ilo).not.toBeNull(); expect(x.ms!.onIlo).toBeGreaterThanOrEqual(0); expect(x.ms!.onIlo).toBeLessThanOrEqual(1); }
    const byScore = [...v].sort((a, b) => a.ms!.score - b.ms!.score).map((x) => x.ms!.onIlo);
    expect(byScore).toEqual([...byScore].sort((a, b) => a - b));
  });
  it('Anthropic is only used once its import has run', () => {
    expect(aiSources().includes('aei')).toBe(aiViews(roles[0]).aei !== null);
  });
});
