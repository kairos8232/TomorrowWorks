// Live workplace news for GET /api/news (tests: server/news.test.mjs).
//
// - Fetches GDELT at most once a day, only until NEWS_REFRESH_UNTIL (end of 1 Nov 2026,
//   the last day of the hackathon), with the same query and topic words as
//   scripts/import_gdelt_news.py (data/sources/news-topics.json).
// - Keeps the result in memory only: nothing is written to disk or committed.
// - If GDELT fails, is slow or rate-limits, the committed snapshot
//   (data/sources/gdelt-news.json) is served, and the next try waits 6 hours.
// News is context only and never changes any score.

export const NEWS_REFRESH_UNTIL = Date.parse(process.env.NEWS_REFRESH_UNTIL ?? '2026-11-01T23:59:59+08:00');
const DAY = 24 * 60 * 60 * 1000;
const RETRY_AFTER_FAILURE = 6 * 60 * 60 * 1000;
const API = 'https://api.gdeltproject.org/api/v2/doc/doc';

const hasChinese = (s) => /[一-鿿]/.test(s);
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whole-word match for Latin script; plain substring for Chinese. Same rule as the Python script. */
export function hasTerm(title, term) {
  return hasChinese(term) ? title.includes(term) : new RegExp(`\\b${escape(term)}\\b`, 'i').test(title);
}

export function topicsFor(title, topics) {
  const names = [...new Set([...Object.keys(topics.query), ...Object.keys(topics.tagOnly)])];
  const found = names.filter((n) => [...(topics.query[n] ?? []), ...(topics.tagOnly[n] ?? [])].some((t) => hasTerm(title, t)));
  return found.length ? found : ['Other'];
}

export function gdeltQuery(topics) {
  return '(' + Object.values(topics.query).flat().map((t) => (t.includes(' ') ? `"${t}"` : t)).join(' OR ') + ')';
}

const seenIso = (v) => `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T${v.slice(9, 11)}:${v.slice(11, 13)}:${v.slice(13, 15)}Z`;

/** GDELT articles -> our article shape: tagged, newest first, repeated headlines dropped. */
export function toArticles(raw, topics) {
  const seen = new Set();
  return raw
    .filter((a) => a.url && a.title && a.seendate && a.domain)
    .map((a) => ({ title: a.title.trim(), url: a.url, outlet: a.domain, language: a.language ?? '', seenAt: seenIso(a.seendate), topics: topicsFor(a.title, topics) }))
    .sort((a, b) => b.seenAt.localeCompare(a.seenAt))
    .filter((a) => { const k = a.title.toLowerCase().split(/\s+/).join(' '); if (seen.has(k)) return false; seen.add(k); return true; });
}

/**
 * newsService({ snapshot, topics, fetchImpl, now }) -> { get() }.
 * get() returns { ...snapshotOrLive, live: boolean }. fetchImpl and now are injectable for tests.
 */
export function newsService({ snapshot, topics, fetchImpl = fetch, now = () => Date.now(), until = NEWS_REFRESH_UNTIL }) {
  let cache = null;       // { body, fetchedAt }
  let nextTry = 0;
  let inFlight = null;

  async function refresh() {
    const params = new URLSearchParams({ query: `sourcecountry:MY ${gdeltQuery(topics)}`, mode: 'artlist', format: 'json', maxrecords: '100', timespan: '7d', sort: 'datedesc' });
    const res = await fetchImpl(`${API}?${params}`, { headers: { 'User-Agent': 'TomorrowWorks hackathon prototype' }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`GDELT responded ${res.status}`);
    const text = await res.text();
    const articles = toArticles(JSON.parse(text || '{}').articles ?? [], topics);
    if (articles.length === 0) throw new Error('GDELT returned no articles');
    const days = articles.map((a) => a.seenAt.slice(0, 10)).sort();
    const fetchedAt = new Date(now()).toISOString();
    cache = {
      fetchedAt: now(),
      body: {
        source: { ...snapshot.source, retrievedAt: fetchedAt.slice(0, 10), fetchedAt, window: 'last 7 days before retrieval', covered: { from: days[0], to: days[days.length - 1] } },
        articles,
      },
    };
  }

  return {
    async get() {
      const t = now();
      const fresh = cache && t - cache.fetchedAt < DAY;
      if (!fresh && t <= until && t >= nextTry) {
        inFlight ??= refresh().catch((err) => { console.warn(`News refresh failed: ${err.message}`); nextTry = t + RETRY_AFTER_FAILURE; }).finally(() => { inFlight = null; });
        await inFlight;
      }
      return cache ? { ...cache.body, live: true } : { ...snapshot, live: false };
    },
  };
}
