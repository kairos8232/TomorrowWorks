// Monthly labour force (OpenDOSM lfs_month) for GET /api/lfs. Tests: server/lfs.test.mjs.
// Same rules as the news refresh (news.mjs): fetched at most once a day, only until
// NEWS_REFRESH_UNTIL (1 Nov 2026), kept in memory only, and the committed snapshot
// (data/sources/opendosm-lfs-month.json, written by scripts/import_lfs_month.py) is served
// when OpenDOSM is slow or unavailable. Context only; never feeds a score.
import { NEWS_REFRESH_UNTIL } from './news.mjs';

const API = 'https://api.data.gov.my/data-catalogue?id=lfs_month&sort=-date&limit=13';
const FIELDS = ['date', 'u_rate', 'p_rate', 'ep_ratio', 'lf', 'lf_employed', 'lf_unemployed', 'lf_outside'];
const DAY = 24 * 60 * 60 * 1000;
const RETRY_AFTER_FAILURE = 6 * 60 * 60 * 1000;

/** OpenDOSM rows -> the snapshot's shape, newest month first. Throws if fields changed. */
export function toMonths(rows) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('OpenDOSM returned no rows');
  const missing = FIELDS.filter((f) => !(f in rows[0]));
  if (missing.length) throw new Error(`OpenDOSM fields changed; missing ${missing.join(', ')}`);
  return rows.map((r) => Object.fromEntries(FIELDS.map((f) => [f, r[f]]))).sort((a, b) => b.date.localeCompare(a.date));
}

export function lfsService({ snapshot, fetchImpl = fetch, now = () => Date.now(), until = NEWS_REFRESH_UNTIL }) {
  let cache = null;
  let nextTry = 0;
  let inFlight = null;
  async function refresh() {
    const res = await fetchImpl(API, { headers: { 'User-Agent': 'TomorrowWorks hackathon prototype' }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`OpenDOSM responded ${res.status}`);
    const months = toMonths(await res.json());
    const fetchedAt = new Date(now()).toISOString();
    cache = { fetchedAt: now(), body: { source: { ...snapshot.source, retrievedAt: fetchedAt.slice(0, 10), fetchedAt, latestMonth: months[0].date.slice(0, 7) }, months } };
  }
  return {
    async get() {
      const t = now();
      if (!(cache && t - cache.fetchedAt < DAY) && t <= until && t >= nextTry) {
        inFlight ??= refresh().catch((err) => { console.warn(`Labour force refresh failed: ${err.message}`); nextTry = t + RETRY_AFTER_FAILURE; }).finally(() => { inFlight = null; });
        await inFlight;
      }
      return cache ? { ...cache.body, live: true } : { ...snapshot, live: false };
    },
  };
}
