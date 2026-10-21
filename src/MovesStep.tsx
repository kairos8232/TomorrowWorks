// Step 2: ranked moves for the person's ESCO skills, as a ledger.
// Data: src/data.ts. Scoring rule: src/scoring.ts (documented in SIGNALS_AND_MATCHING.md).
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ilo, personaById, roles, snapshots, transferable, type Profile, type SnapshotId } from './data';
import { whatChanged } from './changes';
import { interestData, interestFit, topTypes, type InterestType } from './interests';
import { goalFit, roleGoalLink, sdgData } from './sdg';
import { RoleSdgLine } from './SdgViews';
import { recommendMoves, scenarios, type Extras, type RoleScore, type ScenarioId } from './scoring';
import { useLang, useT, useTx } from './i18n';

const pct = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;

// Small bar for one score part, with its value. Weights are listed once above the table.
function Part({ value, label, area }: { value: number | null; label: string; area: 'f' | 'd' | 'r' }) {
  const t = useT();
  if (value === null) return <span className={`part part-${area} none`} data-label={label}>{t('no data')}</span>;
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
  const t = useT();
  const [all, setAll] = useState(false);
  const LIMIT = 8;
  const shown = all ? children : children.slice(0, LIMIT);
  return <div className="skill-list">
    <h4>{title} <span>{children.length}</span></h4>
    {children.length === 0 ? <p className="note">{empty}</p> : <div className="tag-row">{shown}
      {children.length > LIMIT && <button type="button" className="text-button" onClick={() => setAll(!all)}>{all ? t('Show fewer') : t('+{n} more', { n: children.length - LIMIT })}</button>}
    </div>}
  </div>;
}

/** Which kinds of work this role involves (job tag / O*NET), and how that meets the person's picks. */
function InterestLine({ roleId, picks }: { roleId: string; picks: InterestType[] }) {
  const t = useT();
  const p = interestData.roles[roleId];
  if (!p) return null;
  const tops = topTypes(roleId).map((x) => t(interestData.types[x].plain).toLowerCase());
  const fit = interestFit(roleId, picks);
  return <p className="interest-line note">
    {t('Work interests: mostly {a} and {b}, then {c}.', { a: tops[0], b: tops[1], c: tops[2] })}{' '}
    {fit !== null && <strong>{t('Your interest fit: {n}%.', { n: Math.round(fit * 100) })}</strong>}{' '}
    {t('Source: {src}, {occ} ({match}).', { src: p.source === 'jobtag' ? 'job tag (MHLW Japan)' : 'O*NET (US DOL)', occ: p.occupation, match: p.match === 'close' ? t('close match') : t('related occupation') })}{' '}
    <a href={p.url} target="_blank" rel="noreferrer">{t('Open')}</a>
  </p>;
}

function LedgerRow({ result, rank, delta, onPlan, picks, goals }: { result: RoleScore; rank: number | null; delta?: number; onPlan?: () => void; picks: InterestType[]; goals: string[] }) {
  const t = useT();
  const { role, fit, demand, resilience } = result;
  const [open, setOpen] = useState(false);
  const part = (k: 'F' | 'D' | 'R') => result.contributions.find((c) => c.key === k)?.value ?? null;
  return <li className={`ledger-row${rank === null ? ' current' : ''}`}>
    <button type="button" className="ledger-line" onClick={() => setOpen(!open)} aria-expanded={open}>
      <span className="rank">{rank === null ? t('Now') : rank}</span>
      <span className="role-name">{role.title}<small>{t('{n} held', { n: fit.matched.length })}{fit.transferable.length ? `, ${t('{n} transferable', { n: fit.transferable.length })}` : ''}, {t('{n} to build', { n: fit.missing.length })}{picks.length > 0 && (interestFit(role.id, picks) ?? 0) >= 0.75 ? <em className="fits">{t('fits your interests')}</em> : null}{goals.filter((g) => roleGoalLink(role, g)).map((g) => <em key={g} className="fits goal" style={{ color: sdgData.goals[g].colour }}>{roleGoalLink(role, g) === 'role' ? t('linked to SDG {n}', { n: g }) : t('skills linked to SDG {n}', { n: g })}</em>)}</small></span>
      <Part value={part('F')} label={t('Skill fit')} area="f" />
      <Part value={part('D')} label={t('Demand')} area="d" />
      <Part value={part('R')} label={t('AI resilience')} area="r" />
      <span className="score"><Delta value={delta} />{result.score100}</span>
    </button>
    {open && <div className="ledger-detail">
      <div className="detail-facts">
        <span className="fact-f">{t('{n} essential ESCO skills', { n: role.essentialSkills.length })}<small>{t('transferable count half')}</small></span>
        <span className="fact-d">{demand ? <>{t(demand.group)} {pct(demand.change)}<small>{t('DOSM {a} to {b}', { a: demand.previous, b: demand.current })}</small></> : t('No DOSM data')}</span>
        <span className="fact-r">{resilience ? <>{t('ILO exposure {x}', { x: resilience.exposure.toFixed(2) })}<small>{resilience.gradient}</small></> : t('No ILO data')}</span>
      </div>
      <div className="detail-actions">
        {onPlan && fit.missing.length + fit.transferable.length > 0 && <button type="button" className="primary-button" onClick={onPlan}>{t('Plan this move')}</button>}
        <a className="esco-link" href={role.escoUri} target="_blank" rel="noreferrer">{t('ESCO occupation {code}', { code: role.isco })}</a>
      </div>
      <div className="detail-skills">
        <SkillList title={t('You have')} empty={t('None of this role’s essential skills yet.')}>
          {[...fit.transferable.map((t) => <span className="skill-tag related" key={t.need.uri} title={`≈ ${t.have.label} (${t.similarity.toFixed(2)})`}>{t.need.label}<small>≈ {t.have.label}</small></span>),
            ...fit.matched.map((s) => <span className="skill-tag" key={s.uri}>{s.label}</span>)]}
        </SkillList>
        <SkillList title={t('To build')} empty={t('Nothing missing.')}>
          {fit.missing.map((s) => <span className="skill-tag skill-gap" key={s.uri}>{s.label}</span>)}
        </SkillList>
      </div>
      <RoleSdgLine roleId={role.id} />
      <InterestLine roleId={role.id} picks={picks} />
    </div>}
  </li>;
}

const signed = (x: number | null) => (x === null ? 'no data' : `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(1)}%`);
const quarter = (q: string) => q.replace('-', ' ');

/** Latest vs previous DOSM snapshot for the same skills and scenario: what moved, and why. */
function WhatChanged({ profile, scenarioId, extras }: { profile: Profile; scenarioId: ScenarioId; extras: Extras }) {
  const t = useT();
  const [all, setAll] = useState(false);
  const changes = useMemo(() => {
    const run = (id: SnapshotId) => recommendMoves(roles, profile.currentRoleId, profile.held, snapshots[id], ilo, scenarios[scenarioId], transferable, extras).moves;
    return whatChanged(run('q1'), run('q2'));
  }, [profile, scenarioId, extras]);
  const latest = quarter(snapshots.q2.source.latestQuarter);
  const earlier = quarter(snapshots.q1.source.latestQuarter);
  if (changes.length === 0) return <details className="what-changed"><summary>{t('What changed with {q} job-ad data', { q: latest })}</summary><p className="note">{t('Nothing moved compared with {q} data.', { q: earlier })}</p></details>;
  const rankMoves = changes.filter((c) => c.rankBefore !== c.rankAfter).length;
  const allDown = changes.every((c) => c.scoreAfter < c.scoreBefore);
  const shown = all ? changes : changes.slice(0, 3);
  return <details className="what-changed">
    <summary><strong>{t('What changed with {q} job-ad data', { q: latest })}</strong><span>{rankMoves === 0 ? t('Your order of moves stayed the same.') : rankMoves === 1 ? t('1 move changed place.') : t('{n} moves changed place.', { n: rankMoves })}</span></summary>
    {allDown && <p>{t('Online job ads fell in every occupation group in {q}, so every score dropped.', { q: latest })}</p>}
    <ul>{shown.map((c) => <li key={c.role.id}>
      <strong className="cap">{c.role.title}</strong>{' '}
      {c.rankBefore !== c.rankAfter ? <span className={c.rankAfter < c.rankBefore ? 'up' : 'down'}>{t('#{a} to #{b}', { a: c.rankBefore, b: c.rankAfter })}</span> : <span>{t('stays #{n}', { n: c.rankAfter })}</span>}, {t('score {a} to {b}', { a: c.scoreBefore, b: c.scoreAfter })}.{' '}
      <span className="note">{t('Job ads for {group}: {now} in {q}, after {before} in {earlier}.', { group: t(c.group ?? ''), now: signed(c.changeAfter), q: latest, before: signed(c.changeBefore), earlier })}</span>
    </li>)}</ul>
    {changes.length > 3 && <button type="button" className="text-button" onClick={() => setAll(!all)}>{all ? t('Show fewer') : t('Show all {n}', { n: changes.length })}</button>}
  </details>;
}

export function MovesStep({ profile, onEditSkills, onPlan }: { profile: Profile; onEditSkills: () => void; onPlan: (roleId: string) => void }) {
  const t = useT();
  const tx = useTx();
  const [snapshotId, setSnapshotId] = useState<SnapshotId>('q2');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('moderate');
  const [useInterests, setUseInterests] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);
  const [useGoals, setUseGoals] = useState(false);
  const snapshot = snapshots[snapshotId];
  const scenario = scenarios[scenarioId];
  const picks = profile.interests;
  const extras = useMemo<Extras>(() => ({
    I: useInterests && picks.length > 0 ? (role) => interestFit(role.id, picks) : null,
    G: useGoals && goals.length > 0 ? (role) => goalFit(role, goals) : null,
  }), [useInterests, picks, useGoals, goals]);
  const extrasOn = [extras.I, extras.G].filter(Boolean).length;
  const { current, moves } = useMemo(
    () => recommendMoves(roles, profile.currentRoleId, profile.held, snapshot, ilo, scenario, transferable, extras),
    [profile, snapshot, scenario, extras],
  );

  // Remember the previous scores so a data or scenario switch can show what changed.
  const previous = useRef<Map<string, number> | null>(null);
  const [deltas, setDeltas] = useState<Map<string, number>>(new Map());
  const switchKey = `${snapshotId}|${scenarioId}|${extras.I ? 'i' : ''}|${extras.G ? goals.join(',') : ''}`;
  const lastSwitch = useRef(switchKey);
  useEffect(() => {
    const now = new Map([current, ...moves].filter((r): r is RoleScore => r !== null).map((r) => [r.role.id, r.score100]));
    if (previous.current && lastSwitch.current !== switchKey) setDeltas(new Map([...now].map(([id, score]) => [id, score - (previous.current!.get(id) ?? score)])));
    else if (lastSwitch.current === switchKey) setDeltas(new Map());
    previous.current = now;
    lastSwitch.current = switchKey;
  }, [current, moves, switchKey]);

  const persona = personaById(profile.persona);
  return <div className="step-body">
    <div className="who">
      <p>{persona ? tx('{who}, {description} with {n} skills.', { who: <strong>{t('Viewing as {name}', { name: persona.name })}</strong>, description: t(persona.description), n: profile.held.size })
        : tx('{who}{job}.', { who: <strong>{profile.held.size === 1 ? t('Your 1 skill') : t('Your {n} skills', { n: profile.held.size })}</strong>, job: current ? `, ${t('current job {role}', { role: current.role.title })}` : '' })}</p>
      <button type="button" className="text-button" onClick={onEditSkills}>{persona ? t('Use my own skills') : t('Edit skills')}</button>
    </div>

    <WhatChanged profile={profile} scenarioId={scenarioId} extras={extras} />

    <details className="how-to-read">
      <summary>{t('How to read this')}</summary>
      <dl>
        <div><dt>{t('Score')}</dt><dd>{t('A mix of the three parts below, out of 100. It is an estimate to help you compare, not a hiring decision.')}</dd></div>
        <div><dt>{t('Skill fit')}</dt><dd>{t('How many of the role’s essential skills you already have. A closely related skill counts half.')}</dd></div>
        <div><dt>{t('Demand')}</dt><dd>{t('Whether online job ads for this kind of work rose or fell last quarter in Malaysia (DOSM, Department of Statistics Malaysia).')}</dd></div>
        <div><dt>{t('AI resilience')}</dt><dd>{t('How much of the work generative AI is unlikely to change, from the ILO (International Labour Organization). Higher is safer.')}</dd></div>
        <div><dt>{t('Goals')}</dt><dd>{t('Optional. Pick the SDGs you care about to highlight linked roles. When counted, a role linked to your goal through its own work scores 1, through some of its skills 0.5, otherwise 0; this counts for one sixth of the score.')}</dd></div>
        <div><dt>{t('Interests')}</dt><dd>{t('Optional. When switched on, how well the work matches what you enjoy counts for one sixth of the score. Interest profiles of each kind of work come from job tag (Japan’s Ministry of Health, Labour and Welfare); no Malaysian data exists yet.')}</dd></div>
        <div><dt>{t('Now')}</dt><dd>{t('Your current job, for comparison.')}</dd></div>
      </dl>
    </details>

    <section className="ledger" aria-label="Ranked moves">
      <div className="ledger-controls">
        <fieldset><legend>{t('Job-ad data')}</legend>
          {(['q1', 'q2'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="snapshot" checked={snapshotId === id} onChange={() => setSnapshotId(id)} />{snapshots[id].source.latestQuarter.replace('-', ' ')}</label>)}
        </fieldset>
        <fieldset><legend>{t('If AI changes work')}</legend>
          {(['moderate', 'fast'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="scenario" checked={scenarioId === id} onChange={() => setScenarioId(id)} />{id === 'moderate' ? t('Gradually') : t('Quickly')}</label>)}
        </fieldset>
      </div>
      <details className="ranking-options">
        <summary>{t('Personalise with interests and goals')}{extrasOn > 0 && <span className="option-count">{extrasOn}</span>}</summary>
        <div className="ranking-options-body">
          <fieldset><legend>{t('Your interests')}</legend>
            <label className={`toggle${picks.length === 0 ? ' off' : ''}`}><input type="checkbox" checked={useInterests && picks.length > 0} disabled={picks.length === 0} onChange={(e) => setUseInterests(e.target.checked)} />
              {picks.length === 0 ? t('Pick them in Your skills first') : t('Include in ranking ({list})', { list: picks.map((x) => t(interestData.types[x].plain).toLowerCase()).join(', ') })}</label>
          </fieldset>
          <div className="goal-pick" role="group" aria-label={t('Goals you care about')}>
            <span>{t('Goals you care about')}</span>
            {Object.entries(sdgData.goals).filter(([g]) => g !== '4').map(([g, info]) => {
              const on = goals.includes(g);
              return <button key={g} type="button" aria-pressed={on} className={`goal-chip${on ? ' on' : ''}`} style={{ borderColor: info.colour, ...(on ? { background: info.colour, color: '#ffffff' } : {}) }}
                onClick={() => setGoals(on ? goals.filter((x) => x !== g) : [...goals, g])} title={t(info.name)}>{g}</button>;
            })}
            <label className={`toggle${goals.length === 0 ? ' off' : ''}`}><input type="checkbox" checked={useGoals && goals.length > 0} disabled={goals.length === 0} onChange={(e) => setUseGoals(e.target.checked)} />{t('Count in ranking')}</label>
          </div>
          {goals.length > 0 && <p className="note">{goals.map((g) => `${g}. ${t(sdgData.goals[g].name)}`).join(' · ')}{useGoals ? '' : ` — ${t('highlighted only; switch on to count them in the ranking.')}`}</p>}
        </div>
      </details>
      <p className="note">{t(scenario.assumption)} {extrasOn === 1 ? t('Your choices count for one sixth of each score.') : extrasOn === 2 ? t('Your interests and goals together count for two sevenths of each score.') : ''}</p>
      <ol className="ledger-table">
        <li className="ledger-head" aria-hidden="true"><span className="rank">{t('Rank')}</span><span>{t('Role')}</span><span>{t('Skill fit')}</span><span>{t('Demand')}</span><span>{t('AI resilience')}</span><span className="score">{t('Score')}</span></li>
        {current && <LedgerRow result={current} rank={null} delta={deltas.get(current.role.id)} picks={picks} goals={goals} />}
        {moves.map((m, i) => <LedgerRow key={m.role.id} result={m} rank={i + 1} delta={deltas.get(m.role.id)} onPlan={() => onPlan(m.role.id)} picks={picks} goals={goals} />)}
      </ol>
    </section>
    <details className="how-to-read fairness">
      <summary>{t('Is this fair?')}</summary>
      <dl>
        <div><dt>{t('Used')}</dt><dd>{t('Only the skills you confirmed, each role’s ESCO skills, DOSM job ads for the role’s occupation group, and ILO’s AI exposure for the role.')}</dd></div>
        <div><dt>{t('Never asked')}</dt><dd>{t('Age, gender, ethnicity, religion, name, where you live or which school you went to. The app has no place to store them.')}</dd></div>
        <div><dt>{t('Checked')}</dt><dd>{t('Automated tests prove that the same skills always give the same scores, whoever holds them and in whatever order they were added, and that your current job only takes that role off the list.')}</dd></div>
        <div><dt>{t('Limits')}</dt><dd>{t('The sources can carry their own bias: job ads favour some kinds of work and ESCO describes roles from a European view. Scores support your decision; they do not decide it.')}</dd></div>
      </dl>
    </details>
  </div>;
}

export function SourcesFooter() {
  const tx = useTx();
  const t = useT();
  const lang = useLang();
  return <footer className="sources-footer">
    <p>{tx('Sources: {dosm}, Q1 and Q2 2026; {ilo}, 2025; ESCO v1.2.1. Skill similarity uses BAAI/bge-m3 embeddings computed on RunPod.', { dosm: <a href={snapshots.q2.source.url} target="_blank" rel="noreferrer">DOSM Job Market Insights</a>, ilo: <a href={ilo.source.url} target="_blank" rel="noreferrer">ILO Working Paper 140</a> })}</p>
    {/* Licence wording required by ESCO: kept in English in every language. */}
    <p>This service uses the ESCO classification of the European Commission. {t('The role set is an adapted selection of ESCO. Profiles in this prototype are fictional or kept only in your browser tab.')}</p>
    {lang !== 'en' && <p>{t('Skill names and role titles are shown in English because ESCO has no Malay or Chinese version.')}</p>}
  </footer>;
}
