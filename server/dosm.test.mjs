import { describe, expect, it } from 'vitest';
import { dosmService, findDataLinks, nextQuarter, releaseUrl } from './dosm.mjs';

const latestUrl = 'https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-job-market-insights-q22026';
const base = 'https://www.dosm.gov.my/portal-main/release-content/x';
const withData = '<div id="data"><a download="Data JMI Q3 2026" href="https://www.dosm.gov.my/portal-main/release-document-log?release_document_id=999&amp;x=1">Data JMI Q3 2026</a><a href="/y">Press Statement JMI Q3 2026</a></div>';
const without = '<html><body><p>Big Data Analytics</p><a href="/y">Press Statement JMI Q3 2026</a></body></html>';
const day = 24 * 60 * 60 * 1000;

describe('new DOSM quarter check', () => {
  it('computes the next quarter and its release address', () => {
    expect(nextQuarter('2026-Q2')).toBe('2026-Q3');
    expect(nextQuarter('2026-Q4')).toBe('2027-Q1');
    expect(releaseUrl(latestUrl, '2026-Q2', '2026-Q3')).toBe(latestUrl.replace('q22026', 'q32026'));
    expect(() => releaseUrl('https://x/abc', '2026-Q2', '2026-Q3')).toThrow();
  });
  it('counts a quarter as published only when the Data link is on the page', () => {
    expect(findDataLinks(withData, base, '2026-Q3')).toEqual([{ label: 'Data JMI Q3 2026', url: 'https://www.dosm.gov.my/portal-main/release-document-log?release_document_id=999&x=1' }]);
    expect(findDataLinks(without, base, '2026-Q3')).toEqual([]);
    expect(findDataLinks(withData, base, '2026-Q2')).toEqual([]);
  });
  it('checks at most once a day, reports not published, falls back, and stops after the end date', async () => {
    let calls = 0; let t = Date.parse('2026-10-24T09:00:00+08:00');
    const mk = (page, extra = {}) => dosmService({ latestQuarter: '2026-Q2', latestUrl, now: () => t, fetchImpl: async () => { calls++; return { ok: true, text: async () => page }; }, ...extra });
    const svc = mk(without);
    const a = await svc.get();
    expect(a).toMatchObject({ live: true, checked: '2026-Q3', published: false, dataUrl: null });
    t += day / 2; await svc.get(); expect(calls).toBe(1);
    expect((await mk(withData).get()).published).toBe(true);
    const down = dosmService({ latestQuarter: '2026-Q2', latestUrl, now: () => t, fetchImpl: async () => ({ ok: false, status: 503 }) });
    expect(await down.get()).toMatchObject({ live: false, published: null, checkedAt: null });
    const late = dosmService({ latestQuarter: '2026-Q2', latestUrl, now: () => Date.parse('2026-11-02T09:00:00+08:00'), fetchImpl: async () => { calls++; return { ok: true, text: async () => withData }; } });
    expect((await late.get()).live).toBe(false);
  });
});
