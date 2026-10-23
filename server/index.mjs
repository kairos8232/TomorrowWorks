// TomorrowWorks server: serves the built app (dist/) and one API route,
// GET /api/news (daily GDELT refresh until 1 Nov 2026, memory only; see news.mjs) and
// POST /api/cv-skills (the lines of a CV, contact details already removed in the browser;
// matched the same way, nothing stored or logged) and
// POST /api/skill-search, which embeds the person's own words with the
// RunPod Serverless endpoint (Job B, BAAI/bge-m3) and returns the nearest
// real ESCO skills. The RunPod API key stays here, in environment variables
// (Replit Secrets); the browser never sees it.
//
//   RUNPOD_API_KEY      RunPod API key (Replit Secret)
//   RUNPOD_ENDPOINT_ID  Serverless endpoint running the Infinity embedding worker
//   PORT                default 5000
//   RUNPOD_BASE_URL     test only: point at a local fake endpoint (default https://api.runpod.ai/v2)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cvSuggestions, loadSkillIndex, nearestSkills } from './search.mjs';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { briefService, newsService, NEWS_REFRESH_UNTIL } from './news.mjs';
import { lfsService } from './lfs.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const dist = join(root, 'dist');
const index = loadSkillIndex(join(root, 'data', 'derived', 'esco'));
const { RUNPOD_API_KEY, RUNPOD_ENDPOINT_ID } = process.env;
const PORT = Number(process.env.PORT) || 5000;
const RUNPOD_BASE_URL = process.env.RUNPOD_BASE_URL ?? 'https://api.runpod.ai/v2';
const MAX_TEXT = 500;
const CV_MAX_LINES = 40;   // same limits as src/cv.ts
const CV_MAX_LINE = 300;
const lfs = lfsService({ snapshot: JSON.parse(readFileSync(join(root, 'data', 'sources', 'opendosm-lfs-month.json'), 'utf8')) });
const news = newsService({
  snapshot: JSON.parse(readFileSync(join(root, 'data', 'sources', 'gdelt-news.json'), 'utf8')),
  topics: JSON.parse(readFileSync(join(root, 'data', 'sources', 'news-topics.json'), 'utf8')),
});

console.log(`News: daily GDELT refresh until ${new Date(NEWS_REFRESH_UNTIL).toISOString()}, snapshot fallback.`);
console.log(`Loaded ${index.items.length} ESCO skill vectors (${index.dim} dims, ${index.model}). RunPod ${RUNPOD_API_KEY && RUNPOD_ENDPOINT_ID ? 'configured' : 'NOT configured'}.`);

/** Ask the RunPod endpoint for one embedding (OpenAI-compatible route of the Infinity worker). */
async function embed(text) {
  const res = await fetch(`${RUNPOD_BASE_URL}/${RUNPOD_ENDPOINT_ID}/openai/v1/embeddings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${RUNPOD_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: index.model, input: [text] }),
    signal: AbortSignal.timeout(90_000), // first request after idle can take a while (cold start)
  });
  if (!res.ok) throw new Error(`RunPod responded ${res.status}`);
  const body = await res.json();
  const vector = body?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) throw new Error('RunPod response has no embedding');
  return vector;
}

/** Embed many short texts in batches of 32 (news headlines for the key-headlines brief). */
async function embedMany(texts) {
  const out = [];
  for (let i = 0; i < texts.length; i += 32) {
    const res = await fetch(`${RUNPOD_BASE_URL}/${RUNPOD_ENDPOINT_ID}/openai/v1/embeddings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${RUNPOD_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: index.model, input: texts.slice(i, i + 32) }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) throw new Error(`RunPod responded ${res.status}`);
    const body = await res.json();
    out.push(...[...body.data].sort((a, b) => a.index - b.index).map((d) => d.embedding));
  }
  return out;
}
const brief = briefService({ embedMany: RUNPOD_API_KEY && RUNPOD_ENDPOINT_ID ? embedMany : null });

// Small per-visitor limit so the sponsor credit cannot be drained by a script.
const recent = new Map();
function allowed(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 60_000);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length <= 20;
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function readJson(req, limit = 10_000) {
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > limit) throw new Error('Body too large'); }
  return JSON.parse(raw || '{}');
}

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

// Low bandwidth: text files are sent gzip-compressed (about a quarter of the size) and
// built files with a content hash in their name (dist/assets/) are cached for a year,
// so a repeat visit downloads almost nothing. Compressed copies are kept in memory.
const gzipCache = new Map();
const compressible = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg']);
function sendFile(req, res, file, data) {
  const ext = extname(file);
  const headers = { 'Content-Type': types[ext] ?? 'application/octet-stream', 'Vary': 'Accept-Encoding',
    'Cache-Control': file.includes(`${join('dist', 'assets')}`) ? 'public, max-age=31536000, immutable' : 'no-cache' };
  if (compressible.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) {
    if (!gzipCache.has(file)) gzipCache.set(file, gzipSync(data, { level: 9 }));
    res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' });
    return res.end(gzipCache.get(file));
  }
  res.writeHead(200, headers);
  res.end(data);
}

async function serveStatic(req, res) {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = normalize(join(dist, path === '/' ? 'index.html' : path));
  if (!file.startsWith(dist)) return send(res, 400, { error: 'Bad path' });
  try {
    sendFile(req, res, file, await readFile(file));
  } catch {
    const index = join(dist, 'index.html'); // single-page app fallback
    sendFile(req, res, index, await readFile(index));
  }
}

createServer(async (req, res) => {
  try {
    if (req.url === '/api/health') {
      return send(res, 200, { skills: index.items.length, model: index.model, runpod: Boolean(RUNPOD_API_KEY && RUNPOD_ENDPOINT_ID) });
    }
    if (req.url === '/api/lfs') return send(res, 200, await lfs.get());
    if (req.url === '/api/news') {
      const body = await news.get();
      return send(res, 200, { ...body, brief: brief.for(body) });
    }
    if (req.url === '/api/cv-skills') {
      if (req.method !== 'POST') return send(res, 405, { error: 'Use POST' });
      if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) return send(res, 503, { error: 'CV matching is not connected yet. Pick skills from the list instead.' });
      if (!allowed(req.socket.remoteAddress ?? '')) return send(res, 429, { error: 'Too many searches. Wait a minute and try again.' });
      const { lines, max } = await readJson(req, 40_000);
      if (!Array.isArray(lines) || lines.length === 0 || !lines.every((l) => typeof l === 'string' && l.trim())) return send(res, 400, { error: 'No lines to match. Paste your CV text or choose a file.' });
      if (lines.length > CV_MAX_LINES || lines.some((l) => l.length > CV_MAX_LINE)) return send(res, 400, { error: `Send at most ${CV_MAX_LINES} lines of up to ${CV_MAX_LINE} characters.` });
      const started = Date.now();
      // A CV can show more than the default 25 skills; the CV-vs-ad check asks for up to 80 so no skill is cut off.
      const results = cvSuggestions(index, await embedMany(lines), lines, { max: Number.isInteger(max) ? Math.min(Math.max(max, 1), 80) : 25 });
      return send(res, 200, { results, lines: lines.length, model: index.model, ms: Date.now() - started });
    }
    if (req.url === '/api/skill-search') {
      if (req.method !== 'POST') return send(res, 405, { error: 'Use POST' });
      if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) return send(res, 503, { error: 'Skill search is not connected yet. Pick skills from the list instead.' });
      if (!allowed(req.socket.remoteAddress ?? '')) return send(res, 429, { error: 'Too many searches. Wait a minute and try again.' });
      const { text } = await readJson(req);
      if (typeof text !== 'string' || !text.trim()) return send(res, 400, { error: 'Describe your experience in a few words.' });
      if (text.length > MAX_TEXT) return send(res, 400, { error: `Keep it under ${MAX_TEXT} characters.` });
      const started = Date.now();
      const results = nearestSkills(index, await embed(text.trim()), 10, 0.5);
      return send(res, 200, { results, model: index.model, ms: Date.now() - started });
    }
    return serveStatic(req, res);
  } catch (err) {
    console.error(err);
    return send(res, 502, { error: 'Skill search is unavailable right now. Pick skills from the list instead.' });
  }
}).listen(PORT, '0.0.0.0', () => { console.log(`TomorrowWorks on http://0.0.0.0:${PORT}`); warmUp(); });

/**
 * On start, wake the RunPod worker with one tiny request and start the news brief, so
 * the first visitor does not wait for a cold start (Autoscale restarts the server when
 * it has been idle; a sleeping RunPod worker can take over 90 s to load bge-m3).
 */
function warmUp() {
  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) return;
  const t = Date.now();
  embed('warm up')
    .then(() => console.log(`RunPod warm in ${((Date.now() - t) / 1000).toFixed(1)} s`))
    .catch((err) => console.warn(`RunPod warm-up failed: ${err.message}`));
  news.get().then((body) => brief.for(body)).catch(() => {});
}
