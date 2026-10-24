// "Is there a new DOSM Job Market Insights quarter?" for GET /api/dosm-next. Tests: server/dosm.test.mjs.
// Same rule as scripts/check_dosm_jmi.py: DOSM answers 200 for any release address, so a quarter
// counts as published only when its page has a "Data JMI Q<q> <year>" download link.
// Looks at most once a day until NEWS_REFRESH_UNTIL, memory only. It never imports anything:
// the scores change only when the team runs scripts/import_dosm_jmi.py.
import { NEWS_REFRESH_UNTIL } from './news.mjs';

const DAY = 24 * 60 * 60 * 1000;
const RETRY_AFTER_FAILURE = 6 * 60 * 60 * 1000;

/** '2026-Q2' -> '2026-Q3'; '2026-Q4' -> '2027-Q1'. */
export function nextQuarter(latest) {
  const [year, q] = latest.split('-Q').map(Number);
  return q === 4 ? `${year + 1}-Q1` : `${year}-Q${q + 1}`;
}

/** Swap the quarter in the latest release URL: ...-q22026 -> ...-q32026. */
export function releaseUrl(latestUrl, latest, wanted) {
  const slug = (quarter) => { const [year, q] = quarter.split('-Q'); return `q${q}${year}`; };
  if (!latestUrl.endsWith(slug(latest))) throw new Error(`Release URL does not end with ${slug(latest)}`);
  return latestUrl.slice(0, -slug(latest).length) + slug(wanted);
}

const unescapeHtml = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** [{label, url}] for the Data download of this quarter, e.g. 'Data JMI Q2 2026'. */
export function findDataLinks(page, base, quarter) {
  const [year, q] = quarter.split('-Q');
  const wanted = new RegExp(`^Data\\s+JMI\\s+Q${q}\\s+${year}$`, 'i');
  const out = [];
  for (const m of page.matchAll(/<a\b[^>]*?href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!wanted.test(label)) continue;
    let url = unescapeHtml(m[1]);
    if (url.startsWith('/')) url = new URL(base).origin + url;
    if (!out.some((o) => o.url === url)) out.push({ label, url });
  }
  return out;
}

export function dosmService({ latestQuarter, latestUrl, fetchImpl = fetch, now = () => Date.now(), until = NEWS_REFRESH_UNTIL }) {
  const wanted = nextQuarter(latestQuarter);
  const pageUrl = releaseUrl(latestUrl, latestQuarter, wanted);
  let cache = null;
  let nextTry = 0;
  let inFlight = null;
  async function refresh() {
    const res = await fetchImpl(pageUrl, { headers: { 'User-Agent': 'TomorrowWorks hackathon prototype' }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`DOSM responded ${res.status}`);
    const links = findDataLinks(await res.text(), pageUrl, wanted);
    cache = { fetchedAt: now(), body: { checked: wanted, latestImported: latestQuarter, published: links.length > 0, dataUrl: links[0]?.url ?? null, pageUrl, checkedAt: new Date(now()).toISOString() } };
  }
  return {
    async get() {
      const t = now();
      if (!(cache && t - cache.fetchedAt < DAY) && t <= until && t >= nextTry) {
        inFlight ??= refresh().catch((err) => { console.warn(`DOSM check failed: ${err.message}`); nextTry = t + RETRY_AFTER_FAILURE; }).finally(() => { inFlight = null; });
        await inFlight;
      }
      return cache ? { ...cache.body, live: true } : { checked: wanted, latestImported: latestQuarter, published: null, dataUrl: null, pageUrl, checkedAt: null, live: false };
    },
  };
}
