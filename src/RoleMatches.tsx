// Role matches screen: explainable scores from real sources.
// Data: ESCO roles, DOSM Q1/Q2 2026 snapshots, ILO exposure, and transferable
// skills precomputed from the RunPod ESCO embeddings. Scoring: ./scoring.ts.
import { useMemo, useState } from 'react';
import rolesFile from '../data/roles.json';
import dosmQ1 from '../data/sources/dosm-jmi-2026-q1.json';
import dosmQ2 from '../data/sources/dosm-jmi-2026-q2.json';
import iloFile from '../data/sources/ilo-genai-exposure-2025.json';
import transferableFile from '../data/derived/transferable-skills.json';
import {
  recommendMoves, scenarios,
  type DosmSnapshot, type IloExposure, type Role, type RoleScore, type ScenarioId, type Skill, type TransferableSkills,
} from './scoring';

const roles = rolesFile.roles as Role[];
const snapshots = { q1: dosmQ1 as DosmSnapshot, q2: dosmQ2 as DosmSnapshot };
type SnapshotId = keyof typeof snapshots;
const ilo = iloFile as IloExposure;
const transferable = transferableFile as TransferableSkills;

// Every ESCO skill used by the role set, for the searchable skill list
// (also the fallback while the RunPod skill-search endpoint is not connected).
const allSkills: Skill[] = [...new Map(roles.flatMap((r) => [...r.essentialSkills, ...r.optionalSkills]).map((s) => [s.uri, s])).values()]
  .sort((a, b) => a.label.localeCompare(b.label));

const pct = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;
const DEFAULT_ROLE = 'accounting-assistant';

function Breakdown({ result }: { result: RoleScore }) {
  const names = { F: 'Skill fit', D: 'Demand trend', R: 'AI resilience' } as const;
  return <div className="breakdown" aria-label="Score breakdown">
    {result.contributions.map((c) => <div className="breakdown-row" key={c.key}>
      <span>{names[c.key]}</span>
      <span className="bar" aria-hidden="true"><span style={{ width: `${Math.round(c.value * 100)}%` }} /></span>
      <span className="breakdown-num">{c.value.toFixed(2)} × {c.weight.toFixed(2)}</span>
    </div>)}
    {result.missingSignals.length > 0 && <p className="note">No data for {result.missingSignals.join(', ')}; its weight was shared between the other parts.</p>}
  </div>;
}

function RoleCard({ result, rank }: { result: RoleScore; rank: number | null }) {
  const { role, fit, demand, resilience } = result;
  const [open, setOpen] = useState(false);
  return <article className={`role-card${rank === null ? ' current' : ''}`}>
    <header className="role-head">
      <div>
        <span className="review-label">{rank === null ? 'WHERE YOU ARE' : `MOVE #${rank}`}</span>
        <h3>{role.title}</h3>
        <p className="role-meta">ISCO {role.isco} · <a href={role.escoUri} target="_blank" rel="noreferrer">ESCO occupation ↗</a></p>
      </div>
      <div className="role-score" aria-label={`Estimated score ${result.score100} out of 100`}><strong>{result.score100}</strong><small>/100 est.</small></div>
    </header>
    <Breakdown result={result} />
    <ul className="reasons">
      <li><strong>Skills:</strong> {fit.matched.length} held{fit.transferable.length ? ` + ${fit.transferable.length} transferable` : ''} of {role.essentialSkills.length} essential ESCO skills.</li>
      {demand && <li><strong>Demand:</strong> DOSM online job offerings for {demand.group}: {demand.before.toLocaleString()} ({demand.previous}) → {demand.now.toLocaleString()} ({demand.current}), {pct(demand.change)}.</li>}
      {resilience && <li><strong>AI exposure:</strong> ILO score {resilience.exposure.toFixed(2)} ({resilience.gradient}): the share of tasks generative AI could change, not a job-loss forecast.</li>}
    </ul>
    <button type="button" className="text-button" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Hide skills' : 'Show skills'}</button>
    {open && <div className="skill-detail">
      {fit.transferable.length > 0 && <div><h4>Transferable (half credit)</h4><ul className="pairs">{fit.transferable.map((t) => <li key={t.need.uri}><span className="skill-tag">{t.need.label}</span> ← your <em>{t.have.label}</em> <small>similarity {t.similarity.toFixed(2)}</small></li>)}</ul></div>}
      <div><h4>Skills you hold</h4><div className="tag-row">{fit.matched.length ? fit.matched.map((s) => <span className="skill-tag" key={s.uri}>{s.label}</span>) : <p>None of this role's essential skills yet.</p>}</div></div>
      <div><h4>Skills to build ({fit.missing.length})</h4><div className="tag-row">{fit.missing.map((s) => <span className="skill-tag skill-gap" key={s.uri}>{s.label}{s.green ? ' 🌱' : ''}</span>)}</div></div>
    </div>}
  </article>;
}

export function RoleMatches() {
  const [currentRoleId, setCurrentRoleId] = useState(DEFAULT_ROLE);
  const [held, setHeld] = useState<Set<string>>(() => new Set(roles.find((r) => r.id === DEFAULT_ROLE)!.essentialSkills.map((s) => s.uri)));
  const [snapshotId, setSnapshotId] = useState<SnapshotId>('q2');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('moderate');
  const [query, setQuery] = useState('');
  const snapshot = snapshots[snapshotId];
  const scenario = scenarios[scenarioId];

  const { current, moves } = useMemo(
    () => recommendMoves(roles, currentRoleId, held, snapshot, ilo, scenario, transferable),
    [currentRoleId, held, snapshot, scenario],
  );

  function chooseCurrentRole(id: string) {
    setCurrentRoleId(id);
    setHeld(new Set(roles.find((r) => r.id === id)!.essentialSkills.map((s) => s.uri)));
  }
  function toggle(uri: string) {
    setHeld((prev) => { const next = new Set(prev); if (next.has(uri)) next.delete(uri); else next.add(uri); return next; });
  }
  const needle = query.trim().toLowerCase();
  const searchHits = needle.length >= 2 ? allSkills.filter((s) => s.label.toLowerCase().includes(needle)).slice(0, 12) : [];
  const heldSkills = allSkills.filter((s) => held.has(s.uri));

  return <section className="profile-panel" aria-label="Role matches">
    <div className="panel-heading"><div>
      <h2>Ranked moves from your ESCO skills</h2>
      <p>Fictional demo profile. Scores are <strong>estimates</strong> that support your decision; they are not hiring decisions.</p>
    </div></div>

    <div className="match-controls">
      <label>Current job (ESCO)<select value={currentRoleId} onChange={(e) => chooseCurrentRole(e.target.value)}>{roles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select></label>
      <fieldset><legend>Data snapshot</legend>
        {(['q1', 'q2'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="snapshot" checked={snapshotId === id} onChange={() => setSnapshotId(id)} />DOSM {snapshots[id].source.latestQuarter.replace('-', ' ')}</label>)}
      </fieldset>
      <fieldset><legend>AI-change scenario</legend>
        {(['moderate', 'fast'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="scenario" checked={scenarioId === id} onChange={() => setScenarioId(id)} />{scenarios[id].label}</label>)}
      </fieldset>
    </div>
    <p className="note">{scenario.label}: {scenario.assumption} Weights: skill fit {scenario.weights.F}, demand {scenario.weights.D}, AI resilience {scenario.weights.R}. Demand uses {snapshot.source.name} (published {snapshot.source.publishedAt}).</p>

    <details className="skill-editor">
      <summary>Your ESCO skills ({held.size}) — tick or search to edit</summary>
      <div className="tag-row">{heldSkills.map((s) => <button type="button" key={s.uri} className="skill-tag removable" onClick={() => toggle(s.uri)} aria-label={`Remove ${s.label}`}>{s.label} ✕</button>)}</div>
      <label>Search ESCO skills<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. data, budget, sustainability" /></label>
      {searchHits.length > 0 && <div className="tag-row">{searchHits.map((s) => <button type="button" key={s.uri} className={`skill-tag${held.has(s.uri) ? '' : ' skill-gap'}`} onClick={() => toggle(s.uri)}>{held.has(s.uri) ? '✓ ' : '+ '}{s.label}</button>)}</div>}
      <p className="note">Free-text skill search (English, Bahasa Malaysia, Chinese) via the RunPod endpoint is being connected; until then, pick from this list.</p>
    </details>

    <div className="role-list">
      {current && <RoleCard result={current} rank={null} />}
      {moves.map((m, i) => <RoleCard key={m.role.id} result={m} rank={i + 1} />)}
    </div>
  </section>;
}

export function SourcesFooter() {
  return <footer className="sources-footer">
    <p><strong>Sources:</strong> <a href={dosmQ2.source.url} target="_blank" rel="noreferrer">DOSM Job Market Insights</a> (Q1, Q2 2026) · <a href={iloFile.source.url} target="_blank" rel="noreferrer">ILO Working Paper 140</a> (2025) · ESCO v1.2.1 · skill similarity: <code>BAAI/bge-m3</code> embeddings computed on RunPod.</p>
    <p>This service uses the ESCO classification of the European Commission. The role set is an adapted selection of ESCO.</p>
  </footer>;
}
