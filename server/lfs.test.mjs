import { describe, expect, it } from 'vitest';
import { lfsService, toMonths } from './lfs.mjs';

const snapshot = { source: { name: 'snapshot', retrievedAt: '2026-10-21', latestMonth: '2026-08' }, months: [{ date: '2026-08-01', u_rate: 2.9 }] };
const row = (date, u) => ({ date, u_rate: u, p_rate: 71, ep_ratio: 69, lf: 1, lf_employed: 1, lf_unemployed: 0, lf_outside: 1 });
const day = 24 * 60 * 60 * 1000;

describe('monthly labour force refresh (OpenDOSM)', () => {
  it('keeps the importer fields, newest month first, and rejects changed fields', () => {
    expect(toMonths([row('2026-08-01', 2.9), row('2026-09-01', 3.0)]).map((m) => m.date)).toEqual(['2026-09-01', '2026-08-01']);
    expect(() => toMonths([{ date: 'x' }])).toThrow(/fields changed/);
  });
  it('fetches at most once a day, falls back to the snapshot, and stops after the end date', async () => {
    let calls = 0; let t = Date.parse('2026-10-22T09:00:00+08:00');
    const svc = lfsService({ snapshot, now: () => t, fetchImpl: async () => { calls++; return { ok: true, json: async () => [row('2026-09-01', 3.0)] }; } });
    const body = await svc.get();
    expect(body.live).toBe(true);
    expect(body.source.latestMonth).toBe('2026-09');
    t += day / 2; await svc.get(); expect(calls).toBe(1);
    const down = lfsService({ snapshot, now: () => t, fetchImpl: async () => ({ ok: false, status: 503 }) });
    expect((await down.get()).live).toBe(false);
    const late = lfsService({ snapshot, now: () => Date.parse('2026-11-02T09:00:00+08:00'), fetchImpl: async () => { calls++; return { ok: true, json: async () => [] }; } });
    expect((await late.get()).source.name).toBe('snapshot');
  });
});
