// Import the Anthropic Economic Index (how Claude is actually used for work), per US occupation.
//
// Usage (needs internet to huggingface.co; Node 20+, no packages). Run in Replit's Shell:
//     node scripts/import_anthropic_index.mjs
//
// Source: Anthropic Economic Index, huggingface.co/datasets/Anthropic/EconomicIndex (data CC-BY).
//   labor_market_impacts/job_exposure.csv              occ_code,title,observed_exposure
//   release_2025_03_27/automation_vs_augmentation_by_task.csv  task_name + share of conversations
//       per interaction pattern: directive, feedback_loop (automation) / task_iteration,
//       validation, learning (augmentation), filtered
//   release_2025_03_27/task_pct_v2.csv                 task_name,pct (share of conversations)
//   release_2025_03_27/onet_task_statements.csv        O*NET-SOC Code,...,Task
//
// Writes data/sources/anthropic-economic-index.json:
//   occupations: observed exposure for every occupation (to compare our roles with the whole list)
//   roles: for the SOC codes in data/sources/role-soc.json, the share of AI use on that
//          occupation's tasks that automates the task vs augments the person, weighted by how
//          often each task appears in conversations. Nothing is estimated by us.
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = 'https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/main/';
const FILES = {
  exposure: 'labor_market_impacts/job_exposure.csv',
  pattern: 'release_2025_03_27/automation_vs_augmentation_by_task.csv',
  pct: 'release_2025_03_27/task_pct_v2.csv',
  tasks: 'release_2025_03_27/onet_task_statements.csv',
};
const OUT = 'data/sources/anthropic-economic-index.json';

/** Small CSV parser: quoted fields, commas and newlines inside quotes. */
function parseCsv(text) {
  const rows = []; let row = []; let field = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, k) => [h.trim(), r[k]])));
}

async function get(name) {
  const res = await fetch(BASE + FILES[name], { headers: { 'User-Agent': 'TomorrowWorks hackathon prototype' } });
  if (!res.ok) throw new Error(`${FILES[name]}: HTTP ${res.status}`);
  return parseCsv(await res.text());
}

const key = (task) => task.toLowerCase().trim().replace(/\.$/, '');

const [exposure, pattern, pct, tasks] = await Promise.all([get('exposure'), get('pattern'), get('pct'), get('tasks')]);
const socs = [...new Set(Object.values(JSON.parse(readFileSync('data/sources/role-soc.json', 'utf8')).roles).map((r) => r.soc))];
const patternBy = new Map(pattern.map((r) => [key(r.task_name), r]));
const pctBy = new Map(pct.map((r) => [key(r.task_name), Number(r.pct)]));

const roles = {};
for (const soc of socs) {
  const own = tasks.filter((t) => (t['O*NET-SOC Code'] ?? '').startsWith(soc));
  let auto = 0, aug = 0, weight = 0, matched = 0;
  for (const t of own) {
    const p = patternBy.get(key(t.Task ?? '')); const w = pctBy.get(key(t.Task ?? '')) ?? 0;
    if (!p || w === 0) continue;
    matched++;
    const a = Number(p.directive) + Number(p.feedback_loop);
    const g = Number(p.task_iteration) + Number(p.validation) + Number(p.learning);
    if (a + g === 0) continue;
    auto += w * a / (a + g); aug += w * g / (a + g); weight += w;
  }
  roles[soc] = { tasks: own.length, tasksWithUse: matched, automationShare: weight ? Math.round((auto / weight) * 1000) / 1000 : null };
}

const out = {
  source: {
    name: 'Anthropic Economic Index',
    url: 'https://huggingface.co/datasets/Anthropic/EconomicIndex',
    publisher: 'Anthropic',
    licence: 'CC-BY (data)',
    geography: 'Global use of Claude; occupations in the US O*NET/SOC classification',
    measure: 'Observed exposure per occupation (labor_market_impacts/job_exposure.csv); automation vs augmentation share of AI use on each occupation’s tasks (release 2025-03-27), weighted by task share of conversations',
    files: FILES,
    retrievedAt: new Date().toISOString().slice(0, 10),
  },
  occupations: exposure.map((r) => ({ soc: r.occ_code, title: r.title, observed: Number(r.observed_exposure) })),
  roles,
};
writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
console.log(`Wrote ${OUT}: ${out.occupations.length} occupations; roles:`, roles);
