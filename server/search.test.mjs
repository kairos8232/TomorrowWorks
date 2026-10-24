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

describe('CV suggestions', () => {
  // Tiny 2-D index: three skills on known directions.
  const index = { dim: 2, model: 'test', items: [{ uri: 'a', label: 'budget' }, { uri: 'b', label: 'invoice' }, { uri: 'c', label: 'audit' }], vectors: Float32Array.from([1, 0, 0, 1, 0.6, 0.8]) };
  it('keeps each skill once, with its best similarity and the line it came from', async () => {
    const { cvSuggestions } = await import('./search.mjs');
    const out = cvSuggestions(index, [[1, 0], [0, 1]], ['line about budgets', 'line about invoices'], { perLine: 3, min: 0.55 });
    expect(out.map((s) => s.uri)).toEqual(['a', 'b', 'c']);
    expect(out.find((s) => s.uri === 'c').from).toBe('line about invoices');   // 0.8 beats 0.6
    expect(out.find((s) => s.uri === 'c').similarity).toBe(0.8);
  });
  it('drops skills below the minimum and respects max', async () => {
    const { cvSuggestions } = await import('./search.mjs');
    expect(cvSuggestions(index, [[1, 0]], ['x'], { min: 0.7 }).map((s) => s.uri)).toEqual(['a']);
    expect(cvSuggestions(index, [[1, 0], [0, 1]], ['x', 'y'], { max: 1 })).toHaveLength(1);
  });
});
