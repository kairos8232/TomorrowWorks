import type React from 'react';
// Role matches screen: explainable scores from real sources.
// Data: ESCO roles, DOSM Q1/Q2 2026 snapshots, ILO exposure, and transferable
// skills precomputed from the RunPod ESCO embeddings. Scoring: ./scoring.ts.
import { useEffect, useMemo, useRef, useState } from 'react';
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

// Small bar for one score part, with its value. Weights are listed once above the table.
function Part({ value, label, area }: { value: number | null; label: string; area: 'f' | 'd' | 'r' }) {
  if (value === null) return <span className={`part part-${area} none`} data-label={label}>no data</span>;
  return <span className={`part part-${area}`} data-label={label} aria-label={`${label} ${value.toFixed(2)}`}>
    <span className="bar" aria-hidden="true"><span style={{ width: `${Math.round(value * 100)}%` }} /></span>
    <span className="part-num">{value.toFixed(2)}</span>
  </span>;
}

function Delta({ value }: { value: number | undefined }) {
  if (!value) return null;
  return <span className={`delta ${value > 0 ? 'up' : 'down'}`} aria-label={`${value > 0 ? 'up' : 'down'} ${Math.abs(value)} since the last switch`}>{value > 0 ? '▲' : '▼'}{Math.abs(value)}</span>;
}

// Shows the first few skills and a button for the rest, so long lists stay scannable.
function SkillList({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  const [all, setAll] = useState(false);
  const LIMIT = 8;
  const shown = all ? children : children.slice(0, LIMIT);
  return <div className="skill-list">
    <h4>{title} <span>{children.length}</span></h4>
    {children.length === 0 ? <p className="note">{empty}</p> : <div className="tag-row">{shown}
      {children.length > LIMIT && <button type="button" className="text-button" onClick={() => setAll(!all)}>{all ? 'Show fewer' : `+${children.length - LIMIT} more`}</button>}
    </div>}
  </div>;
}

function LedgerRow({ result, rank, delta }: { result: RoleScore; rank: number | null; delta?: number }) {
  const { role, fit, demand, resilience } = result;
  const [open, setOpen] = useState(false);
  const part = (k: 'F' | 'D' | 'R') => result.contributions.find((c) => c.key === k)?.value ?? null;
  return <li className={`ledger-row${rank === null ? ' current' : ''}`}>
    <button type="button" className="ledger-line" onClick={() => setOpen(!open)} aria-expanded={open}>
      <span className="rank">{rank === null ? 'Now' : rank}</span>
      <span className="role-name">{role.title}<small>{fit.matched.length} held{fit.transferable.length ? `, ${fit.transferable.length} transferable` : ''}, {fit.missing.length} to build</small></span>
      <Part value={part('F')} label="Skill fit" area="f" />
      <Part value={part('D')} label="Demand trend" area="d" />
      <Part value={part('R')} label="AI resilience" area="r" />
      <span className="score"><Delta value={delta} />{result.score100}</span>
    </button>
    {open && <div className="ledger-detail">
      <div className="detail-facts">
        <span className="fact-f">{role.essentialSkills.length} essential ESCO skills<small>transferable count half</small></span>
        <span className="fact-d">{demand ? <>{demand.group} {pct(demand.change)}<small>DOSM {demand.previous} to {demand.current}</small></> : 'No DOSM data'}</span>
        <span className="fact-r">{resilience ? <>ILO exposure {resilience.exposure.toFixed(2)}<small>{resilience.gradient}</small></> : 'No ILO data'}</span>
      </div>
      <div className="detail-skills">
        <SkillList title="You have" empty="None of this role's essential skills yet.">
          {[...fit.transferable.map((t) => <span className="skill-tag related" key={t.need.uri} title={`Transferable from your ${t.have.label} (similarity ${t.similarity.toFixed(2)})`}>{t.need.label}<small>≈ {t.have.label}</small></span>),
            ...fit.matched.map((s) => <span className="skill-tag" key={s.uri}>{s.label}</span>)]}
        </SkillList>
        <SkillList title="To build" empty="Nothing missing.">
          {fit.missing.map((s) => <span className="skill-tag skill-gap" key={s.uri}>{s.label}</span>)}
        </SkillList>
      </div>
      <a className="esco-link" href={role.escoUri} target="_blank" rel="noreferrer">ESCO occupation {role.isco}</a>
    </div>}
  </li>;
}

export function RoleMatches() {
  const [currentRoleId, setCurrentRoleId] = useState(DEFAULT_ROLE);
  const [held, setHeld] = useState<Set<string>>(() => new Set(roles.find((r) => r.id === DEFAULT_ROLE)!.essentialSkills.map((s) => s.uri)));
  const [snapshotId, setSnapshotId] = useState<SnapshotId>('q2');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('moderate');
  const [query, setQuery] = useState('');
  // Free-text skill search through the server and the RunPod endpoint (Job B).
  const [description, setDescription] = useState('');
  const [found, setFound] = useState<(Skill & { similarity: number })[]>([]);
  const [searchState, setSearchState] = useState<{ busy: boolean; message: string }>({ busy: false, message: '' });
  async function findSkills(e: React.FormEvent) {
    e.preventDefault();
    setSearchState({ busy: true, message: 'Searching… the first search after a pause can take up to a minute.' });
    try {
      const res = await fetch('/api/skill-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: description }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'Skill search is unavailable right now. Pick skills from the list instead.');
      setFound(body.results);
      setSearchState({ busy: false, message: body.results.length ? `${body.results.length} ESCO skills match. Add the ones that are true for you.` : 'No close ESCO skills found. Try other words.' });
    } catch (err) {
      setFound([]);
      setSearchState({ busy: false, message: err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Skill search is unavailable right now. Pick skills from the list instead.' });
    }
  }
  const skillByUri = new Map(allSkills.map((s) => [s.uri, s]));
  const snapshot = snapshots[snapshotId];
  const scenario = scenarios[scenarioId];

  const { current, moves } = useMemo(
    () => recommendMoves(roles, currentRoleId, held, snapshot, ilo, scenario, transferable),
    [currentRoleId, held, snapshot, scenario],
  );

  // Remember the previous scores so a snapshot or scenario switch can show what changed.
  const previous = useRef<Map<string, number> | null>(null);
  const [deltas, setDeltas] = useState<Map<string, number>>(new Map());
  const switchKey = `${snapshotId}|${scenarioId}`;
  const lastSwitch = useRef(switchKey);
  useEffect(() => {
    const now = new Map([current, ...moves].filter((r): r is RoleScore => r !== null).map((r) => [r.role.id, r.score100]));
    if (previous.current && lastSwitch.current !== switchKey) {
      setDeltas(new Map([...now].map(([id, score]) => [id, score - (previous.current!.get(id) ?? score)])));
    } else if (lastSwitch.current === switchKey) {
      setDeltas(new Map());
    }
    previous.current = now;
    lastSwitch.current = switchKey;
  }, [current, moves, switchKey]);

  function chooseCurrentRole(id: string) {
    setCurrentRoleId(id);
    setHeld(new Set(roles.find((r) => r.id === id)!.essentialSkills.map((s) => s.uri)));
  }
  function toggle(uri: string) {
    setHeld((prev) => { const next = new Set(prev); if (next.has(uri)) next.delete(uri); else next.add(uri); return next; });
  }
  const needle = query.trim().toLowerCase();
  const searchHits = needle.length >= 2 ? allSkills.filter((s) => s.label.toLowerCase().includes(needle)).slice(0, 12) : [];
  // Skills found by search may be any ESCO skill, not only those in the role set.
  const [extraSkills, setExtraSkills] = useState<Map<string, Skill>>(new Map());
  const heldSkills = [...held].map((uri) => skillByUri.get(uri) ?? extraSkills.get(uri)).filter((s): s is Skill => Boolean(s)).sort((a, b) => a.label.localeCompare(b.label));
  function addFound(skill: Skill) {
    if (!skillByUri.has(skill.uri)) setExtraSkills((prev) => new Map(prev).set(skill.uri, skill));
    toggle(skill.uri);
  }

  return <section className="ledger" aria-label="Role matches">
    <div className="ledger-controls">
      <label>Current job<select value={currentRoleId} onChange={(e) => chooseCurrentRole(e.target.value)}>{roles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select></label>
      <fieldset><legend>Job-ad data</legend>
        {(['q1', 'q2'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="snapshot" checked={snapshotId === id} onChange={() => setSnapshotId(id)} />DOSM {snapshots[id].source.latestQuarter.replace('-', ' ')}</label>)}
      </fieldset>
      <fieldset><legend>AI-change scenario</legend>
        {(['moderate', 'fast'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="scenario" checked={scenarioId === id} onChange={() => setScenarioId(id)} />{scenarios[id].label}</label>)}
      </fieldset>
    </div>
    <p className="note">{scenario.assumption} Score = {scenario.weights.F} × skill fit + {scenario.weights.D} × demand + {scenario.weights.R} × AI resilience. Estimates only.</p>

    <ol className="ledger-table">
      <li className="ledger-head" aria-hidden="true"><span className="rank">Rank</span><span>Role</span><span>Skill fit</span><span>Demand</span><span>AI resilience</span><span className="score">Score</span></li>
      {current && <LedgerRow result={current} rank={null} delta={deltas.get(current.role.id)} />}
      {moves.map((m, i) => <LedgerRow key={m.role.id} result={m} rank={i + 1} delta={deltas.get(m.role.id)} />)}
    </ol>
    <p className="note">Select a row for reasons and skills. ▲▼ show how a score moved after a switch.</p>

    <details className="skill-editor">
      <summary>Edit your skills ({held.size} ESCO skills)</summary>
      <div className="tag-row">{heldSkills.map((s) => <button type="button" key={s.uri} className="skill-tag removable" onClick={() => toggle(s.uri)} aria-label={`Remove ${s.label}`}>{s.label} ✕</button>)}</div>
      <form className="skill-search" onSubmit={findSkills}>
        <label>Describe your work in your own words<textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={2} placeholder="e.g. I reconcile bank statements and prepare monthly reports in Excel" /></label>
        <button type="submit" className="primary-button" disabled={searchState.busy || !description.trim()}>{searchState.busy ? 'Searching…' : 'Find matching skills'}</button>
      </form>
      {searchState.message && <p className="note" aria-live="polite">{searchState.message}</p>}
      {found.length > 0 && <div className="tag-row">{found.map((s) => <button type="button" key={s.uri} className={`skill-tag${held.has(s.uri) ? '' : ' skill-gap'}`} onClick={() => addFound(s)}>{held.has(s.uri) ? 'Remove ' : 'Add '}{s.label}<small>similarity {s.similarity.toFixed(2)}</small></button>)}</div>}
      <p className="note">Works in English, Bahasa Malaysia or Chinese. The BAAI/bge-m3 model on RunPod only finds existing ESCO skills; you decide which are true.</p>
      <label>Or pick from the list<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try data, budget or sustainability" /></label>
      {searchHits.length > 0 && <div className="tag-row">{searchHits.map((s) => <button type="button" key={s.uri} className={`skill-tag${held.has(s.uri) ? '' : ' skill-gap'}`} onClick={() => toggle(s.uri)}>{held.has(s.uri) ? 'Remove ' : 'Add '}{s.label}</button>)}</div>}
    </details>
  </section>;
}

export function SourcesFooter() {
  return <footer className="sources-footer">
    <p>Sources: <a href={dosmQ2.source.url} target="_blank" rel="noreferrer">DOSM Job Market Insights</a>, Q1 and Q2 2026; <a href={iloFile.source.url} target="_blank" rel="noreferrer">ILO Working Paper 140</a>, 2025; ESCO v1.2.1. Skill similarity uses BAAI/bge-m3 embeddings computed on RunPod.</p>
    <p>This service uses the ESCO classification of the European Commission. The role set is an adapted selection of ESCO.</p>
  </footer>;
}
