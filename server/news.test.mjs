import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { briefService, cleanTitle, keyHeadlines, newsService, topicsFor, toArticles } from './news.mjs';

const topics = JSON.parse(readFileSync(new URL('../data/sources/news-topics.json', import.meta.url), 'utf8'));
const snapshot = { source: { name: 'snapshot', retrievedAt: '2026-10-21' }, articles: [{ title: 'old', topics: ['Other'] }] };
const gdelt = (titles) => ({ ok: true, text: async () => JSON.stringify({ articles: titles.map((t, i) => ({ url: `u${i}`, title: t, seendate: `2026102${i}T010000Z`, domain: 'thestar.com.my', language: 'English' })) }) });
const day = 24 * 60 * 60 * 1000;

describe('news topic tagging (same rule as the Python script)', () => {
  it('tags English, Malay and Chinese headlines; untagged become Other', () => {
    expect(topicsFor('Bersedia gaji minimum RM2,000', topics)).toEqual(['Pay and wages']);
    expect(topicsFor('高通11月起全球裁员', topics)).toEqual(['Layoffs']);
    expect(topicsFor('Nvidia urges firms to adopt AI', topics)).toEqual(['AI industry']);
    expect(topicsFor('Brunei minister urges graduates to use AI to enhance skills', topics)).toEqual(['AI and automation']);
    expect(topicsFor('AI deepfakes, extremist recruitment: PAS MP sounds alarm', topics)).toEqual(['AI industry']);
    expect(topicsFor('Did KTMB appoint a third party to handle recruitment?', topics)).toEqual(['Hiring']);
    expect(topicsFor('Brazil election news', topics)).toEqual(['Other']);
  });
  it('undoes GDELT spacing without changing words', () => {
    expect(cleanTitle('Bersedia gaji minimum RM2 , 000 tahun depan')).toBe('Bersedia gaji minimum RM2,000 tahun depan');
    expect(cleanTitle('AI deepfakes , extremist recruitment : PAS MP')).toBe('AI deepfakes, extremist recruitment: PAS MP');
    expect(cleanTitle('最低薪金涨至两千 ： 惠及逾400万人之后 ， 成本由谁承担 ？ | 八方论见')).toBe('最低薪金涨至两千：惠及逾400万人之后，成本由谁承担？| 八方论见');
  });
  it('drops repeated headlines and sorts newest first', () => {
    const a = toArticles([{ url: 'a', title: 'AI rules', seendate: '20261020T010000Z', domain: 'x' }, { url: 'b', title: 'AI  rules', seendate: '20261021T010000Z', domain: 'y' }], topics);
    expect(a.map((x) => x.url)).toEqual(['b']);
  });
});

describe('daily refresh until 1 Nov 2026, memory only, snapshot fallback', () => {
  it('fetches once per day and serves the cached result in between', async () => {
    let calls = 0; let t = Date.parse('2026-10-22T09:00:00+08:00');
    const svc = newsService({ snapshot, topics, now: () => t, fetchImpl: async () => { calls++; return gdelt(['AI jobs', 'Hiring drive']); } });
    expect((await svc.get()).live).toBe(true);
    t += day / 2; await svc.get();
    expect(calls).toBe(1);
    t += day; await svc.get();
    expect(calls).toBe(2);
  });
  it('falls back to the snapshot when GDELT fails, and waits 30 minutes before retrying', async () => {
    let calls = 0; let t = Date.parse('2026-10-22T09:00:00+08:00');
    const svc = newsService({ snapshot, topics, now: () => t, fetchImpl: async () => { calls++; return { ok: false, status: 429, text: async () => '' }; } });
    const body = await svc.get();
    expect(body.live).toBe(false);
    expect(body.source.name).toBe('snapshot');
    t += 20 * 60 * 1000; await svc.get();
    expect(calls).toBe(1);
    t += 10 * 60 * 1000; await svc.get();
    expect(calls).toBe(2);
  });
  it('never fetches after the end date', async () => {
    let calls = 0;
    const svc = newsService({ snapshot, topics, now: () => Date.parse('2026-11-02T09:00:00+08:00'), fetchImpl: async () => { calls++; return gdelt(['AI']); } });
    expect((await svc.get()).live).toBe(false);
    expect(calls).toBe(0);
  });
});

describe('key headlines per topic (most representative real headlines)', () => {
  const arts = [
    { url: 'a', title: 'a', topics: ['AI and automation'] },
    { url: 'b', title: 'b', topics: ['AI and automation'] },
    { url: 'c', title: 'c', topics: ['AI and automation'] },
    { url: 'd', title: 'd', topics: ['Hiring'] },
  ];
  it('picks the headlines closest to the topic centre, at most 3, only real URLs', () => {
    const vectors = [[1, 0], [0.9, 0.1], [0, 1], [0.5, 0.5]];
    const picks = keyHeadlines(arts, vectors, 2);
    expect(picks['AI and automation']).toEqual(['b', 'a']);
    expect(picks['Hiring']).toEqual(['d']);
  });
  it('computes once per article set in the background, then serves the cache', async () => {
    let calls = 0;
    const svc = briefService({ embedMany: async (texts) => { calls++; return texts.map((_, i) => [1, i]); } });
    const body = { articles: arts };
    expect(svc.for(body)).toBeNull();
    await new Promise((r) => setTimeout(r, 0));
    expect(svc.for(body)?.picks['Hiring']).toEqual(['d']);
    svc.for(body);
    expect(calls).toBe(1);
  });
});
