// Step 2: ranked moves for the person's ESCO skills, as a ledger.
// Data: src/data.ts. Scoring rule: src/scoring.ts (documented in SIGNALS_AND_MATCHING.md).
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { aina, ilo, roles, snapshots, transferable, type Profile, type SnapshotId } from './data';
import { recommendMoves, scenarios, type RoleScore, type ScenarioId } from './scoring';

const pct = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;

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

function LedgerRow({ result, rank, delta, onPlan }: { result: RoleScore; rank: number | null; delta?: number; onPlan?: () => void }) {
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
      <div className="detail-actions">
        {onPlan && fit.missing.length + fit.transferable.length > 0 && <button type="button" className="primary-button" onClick={onPlan}>Plan this move</button>}
        <a className="esco-link" href={role.escoUri} target="_blank" rel="noreferrer">ESCO occupation {role.isco}</a>
      </div>
    </div>}
  </li>;
}

export function MovesStep({ profile, onEditSkills, onPlan }: { profile: Profile; onEditSkills: () => void; onPlan: (roleId: string) => void }) {
  const [snapshotId, setSnapshotId] = useState<SnapshotId>('q2');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('moderate');
  const snapshot = snapshots[snapshotId];
  const scenario = scenarios[scenarioId];
  const { current, moves } = useMemo(
    () => recommendMoves(roles, profile.currentRoleId, profile.held, snapshot, ilo, scenario, transferable),
    [profile, snapshot, scenario],
  );

  // Remember the previous scores so a data or scenario switch can show what changed.
  const previous = useRef<Map<string, number> | null>(null);
  const [deltas, setDeltas] = useState<Map<string, number>>(new Map());
  const switchKey = `${snapshotId}|${scenarioId}`;
  const lastSwitch = useRef(switchKey);
  useEffect(() => {
    const now = new Map([current, ...moves].filter((r): r is RoleScore => r !== null).map((r) => [r.role.id, r.score100]));
    if (previous.current && lastSwitch.current !== switchKey) setDeltas(new Map([...now].map(([id, score]) => [id, score - (previous.current!.get(id) ?? score)])));
    else if (lastSwitch.current === switchKey) setDeltas(new Map());
    previous.current = now;
    lastSwitch.current = switchKey;
  }, [current, moves, switchKey]);

  return <div className="step-body">
    <div className="who">
      <p>{profile.persona === 'aina' ? <><strong>Viewing as {aina.name}</strong>, a fictional accounting assistant with {profile.held.size} skills.</> : <><strong>Your {profile.held.size} {profile.held.size === 1 ? 'skill' : 'skills'}</strong>{current ? `, current job ${current.role.title}` : ''}.</>}</p>
      <button type="button" className="text-button" onClick={onEditSkills}>{profile.persona === 'aina' ? 'Use my own skills' : 'Edit skills'}</button>
    </div>

    <details className="how-to-read">
      <summary>How to read this</summary>
      <dl>
        <div><dt>Score</dt><dd>A mix of the three parts below, out of 100. It is an estimate to help you compare, not a hiring decision.</dd></div>
        <div><dt>Skill fit</dt><dd>How many of the role’s essential skills you already have. A closely related skill counts half.</dd></div>
        <div><dt>Demand</dt><dd>Whether online job ads for this kind of work rose or fell last quarter in Malaysia (<abbr title="Department of Statistics Malaysia">DOSM</abbr>).</dd></div>
        <div><dt>AI resilience</dt><dd>How much of the work generative AI is unlikely to change, from the <abbr title="International Labour Organization">ILO</abbr>. Higher is safer.</dd></div>
        <div><dt>Now</dt><dd>Your current job, for comparison.</dd></div>
      </dl>
    </details>

    <section className="ledger" aria-label="Ranked moves">
      <div className="ledger-controls">
        <fieldset><legend>Job-ad data</legend>
          {(['q1', 'q2'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="snapshot" checked={snapshotId === id} onChange={() => setSnapshotId(id)} />{snapshots[id].source.latestQuarter.replace('-', ' ')}</label>)}
        </fieldset>
        <fieldset><legend>If AI changes work</legend>
          {(['moderate', 'fast'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="scenario" checked={scenarioId === id} onChange={() => setScenarioId(id)} />{id === 'moderate' ? 'Gradually' : 'Quickly'}</label>)}
        </fieldset>
      </div>
      <p className="note">{scenario.assumption} Try switching: the arrows show how each score moves.</p>
      <ol className="ledger-table">
        <li className="ledger-head" aria-hidden="true"><span className="rank">Rank</span><span>Role</span><span>Skill fit</span><span>Demand</span><span>AI resilience</span><span className="score">Score</span></li>
        {current && <LedgerRow result={current} rank={null} delta={deltas.get(current.role.id)} />}
        {moves.map((m, i) => <LedgerRow key={m.role.id} result={m} rank={i + 1} delta={deltas.get(m.role.id)} onPlan={() => onPlan(m.role.id)} />)}
      </ol>
      <p className="note">Select a role to see the skills you have and the skills to build, then plan the move.</p>
    </section>
  </div>;
}

export function SourcesFooter() {
  return <footer className="sources-footer">
    <p>Sources: <a href={snapshots.q2.source.url} target="_blank" rel="noreferrer">DOSM Job Market Insights</a>, Q1 and Q2 2026; <a href={ilo.source.url} target="_blank" rel="noreferrer">ILO Working Paper 140</a>, 2025; ESCO v1.2.1. Skill similarity uses BAAI/bge-m3 embeddings computed on RunPod.</p>
    <p>This service uses the ESCO classification of the European Commission. The role set is an adapted selection of ESCO. Profiles in this prototype are fictional or kept only in your browser tab.</p>
  </footer>;
}
