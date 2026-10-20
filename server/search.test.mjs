import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { halfToFloat, loadSkillIndex, nearestSkills, normalise } from './search.mjs';

describe('float16 decoding', () => {
  it('decodes known half-precision values', () => {
    expect(halfToFloat(0x3c00)).toBe(1);
    expect(halfToFloat(0xc000)).toBe(-2);
    expect(halfToFloat(0x0000)).toBe(0);
    expect(halfToFloat(0x3555)).toBeCloseTo(0.3333, 3);
  });
});

describe('ESCO skill index from the RunPod run', () => {
  const index = loadSkillIndex(join(__dirname, '..', 'data', 'derived', 'esco'));

  it('loads 13,939 unique skills with 1024-dim vectors', () => {
    expect(index.items).toHaveLength(13939);
    expect(index.dim).toBe(1024);
    expect(new Set(index.items.map((s) => s.uri)).size).toBe(13939);
  });

  it('a skill\'s own vector returns that skill first (similarity ≈ 1)', () => {
    const row = index.items.findIndex((s) => s.label === 'manage budgets');
    const own = index.vectors.slice(row * index.dim, (row + 1) * index.dim);
    const [top] = nearestSkills(index, own, 5);
    expect(top.label).toBe('manage budgets');
    expect(top.similarity).toBeGreaterThan(0.99);
  });

  it('returns related skills next, all above the minimum similarity', () => {
    const row = index.items.findIndex((s) => s.label === 'manage budgets');
    const own = index.vectors.slice(row * index.dim, (row + 1) * index.dim);
    const hits = nearestSkills(index, Array.from(own, (x) => x * 3), 5, 0.5); // scaling must not matter
    expect(hits.map((h) => h.label)).toContain('budget for financial needs');
    for (const h of hits) expect(h.similarity).toBeGreaterThanOrEqual(0.5);
  });

  it('rejects a vector from a different model size', () => {
    expect(() => nearestSkills(index, new Array(384).fill(0.1))).toThrow(/dimensions/);
  });

  it('normalise gives length 1', () => {
    const v = normalise([3, 4]);
    expect(Math.hypot(...v)).toBeCloseTo(1, 6);
  });
});
