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

// ---- Key headlines per topic (RunPod, bge-m3) -------------------------------
// For each topic: embed its headlines, take their average direction (centroid),
// and keep the 3 headlines closest to it: the most representative real
// headlines. Nothing is written by a model, so nothing can be invented.

const norm = (v) => { const n = Math.hypot(...v) || 1; return v.map((x) => x / n); };
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);

/** articles + vectors (same order) -> { topic: [url, url, url] }, most representative first. */
export function keyHeadlines(articles, vectors, perTopic = 3) {
  const out = {};
  const topics = [...new Set(articles.flatMap((a) => a.topics))].filter((t) => t !== 'Other');
  for (const topic of topics) {
    const idx = articles.map((a, i) => (a.topics.includes(topic) ? i : -1)).filter((i) => i >= 0);
    const vs = idx.map((i) => norm(vectors[i]));
    const centre = norm(vs[0].map((_, d) => vs.reduce((s, v) => s + v[d], 0) / vs.length));
    out[topic] = idx.map((i, k) => ({ i, sim: dot(vs[k], centre) }))
      .sort((a, b) => b.sim - a.sim).slice(0, perTopic).map((x) => articles[x.i].url);
  }
  return out;
}

/**
 * briefService({ embedMany }) -> { for(body) }: returns the cached brief for this
 * set of articles, or starts computing it in the background (one RunPod batch per
 * new set, i.e. at most once per daily refresh) and returns null meanwhile.
 */
export function briefService({ embedMany }) {
  const cache = new Map(); // key -> { picks, model }
  const running = new Set();
  return {
    for(body) {
      const tagged = body.articles.filter((a) => !a.topics.includes('Other'));
      const key = tagged.map((a) => a.url).join('\n');
      if (!embedMany || tagged.length === 0) return null;
      if (cache.has(key)) return cache.get(key);
      if (!running.has(key)) {
        running.add(key);
        embedMany(tagged.map((a) => a.title))
          .then((vectors) => cache.set(key, { picks: keyHeadlines(tagged, vectors), model: 'BAAI/bge-m3 on RunPod' }))
          .catch((err) => console.warn(`News brief failed: ${err.message}`))
          .finally(() => running.delete(key));
      }
      return null;
    },
  };
}
