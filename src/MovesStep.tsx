// Step 2: ranked moves for the person's ESCO skills, as a ledger.
// Data: src/data.ts. Scoring rule: src/scoring.ts (documented in SIGNALS_AND_MATCHING.md).
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ilo, personaById, roles, roleTitle, snapshots, transferable, type Profile, type SnapshotId } from './data';
import { simulateFutures, tippingPoints, type RoleFutures } from './futures';
import { whatChanged } from './changes';
import { interestData, interestFit, topTypes, type InterestType } from './interests';
import { goalFit, roleGoalLink, sdgData } from './sdg';
import { RoleSdgLine } from './SdgViews';
import { FairnessNote } from './FairnessNote';
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

// The dedicated role view has room for the complete skill list.
function SkillList({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return <div className="skill-list">
    <h4>{title} <span>{children.length}</span></h4>
    {children.length === 0 ? <p className="note">{empty}</p> : <div className="tag-row">{children}</div>}
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
    <strong>{t('Work interests')}</strong> · {tops.slice(0, 2).join(' · ')}{' '}
    {fit !== null && <span>· {t('Your interest fit: {n}%.', { n: Math.round(fit * 100) })}</span>}{' '}
    <a href={p.url} target="_blank" rel="noreferrer" title={`${p.occupation} (${p.match})`}>{p.source === 'jobtag' ? 'job tag (Japan)' : 'O*NET (US)'}</a>
  </p>;
}

/** How many futures a lower row must win against the row above to be called a close call. */
const CLOSE_CALL = 0.3;

/** Colours of the leading moves in the futures panel (rest = grey). Fixed order, so a role keeps its colour. */
const FUTURE_COLOURS = ['#7fd6a8', '#f2b84b', '#ef8a6b'];
const FUTURE_REST = '#5d7d70';
const DOT_ROWS = 20;

/** "1,000 possible futures": one dot per future coloured by its best move, the tipping point on an AI-speed strip, and the assumptions. */
function FuturesPanel({ futures, tipping, quarter }: { futures: ReturnType<typeof simulateFutures>; tipping: ReturnType<typeof tippingPoints>; quarter: string }) {
  const t = useT();
  const leaders = [...futures.byRole.values()].filter((x) => x.best > 0).sort((a, b) => b.best - a.best);
  const shown = leaders.slice(0, 3);
  const name = (id: string) => roleTitle(roles.find((r) => r.id === id)!.title);
  const p = (x: number) => Math.round(x * 100);
  const share = (x: number) => (x > 0 && x < 0.005 ? '<1' : String(p(x)));   // a move that wins a few futures is not 0%
  const top = leaders[0];
  const robust = !!top && top.best >= 0.8;
  const colour = (id: string) => { const k = shown.findIndex((x) => x.roleId === id); return k >= 0 ? FUTURE_COLOURS[k] : FUTURE_REST; };
  // Dots grouped by winner (biggest group first), filled column by column, so each move forms one block.
  const order = new Map(leaders.map((x, k) => [x.roleId, k]));
  const dots = [...futures.winners].sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99));
  const cols = Math.ceil(dots.length / DOT_ROWS);
  return <section className="futures-panel" aria-labelledby="futures-head">
    <div className="futures-top">
      <div className="futures-lead">
        <h2 id="futures-head">{robust ? t('{role} is your best move', { role: name(top.roleId) }) : t('No single best move')}</h2>
        <p className="futures-sub">{robust
          ? t('Best in {p}% of {n} simulated futures: a robust choice.', { p: share(top.best), n: futures.runs.toLocaleString() })
          : t('Each dot is one of {n} simulated futures, coloured by its best move.', { n: futures.runs.toLocaleString() })}</p>
        <ul className="futures-legend">{shown.map((x) => <li key={x.roleId}>
          <i style={{ background: colour(x.roleId) }} aria-hidden="true" />
          <span className="cap-first">{name(x.roleId)}</span>
          <strong>{share(x.best)}%</strong>
        </li>)}</ul>
      </div>
      <svg className="futures-dots" viewBox={`0 0 ${cols * 10} ${DOT_ROWS * 10}`} aria-hidden="true" focusable="false">
        {dots.map((id, i) => <circle key={i} cx={Math.floor(i / DOT_ROWS) * 10 + 5} cy={(i % DOT_ROWS) * 10 + 5} r="3.6" fill={colour(id)} />)}
      </svg>
    </div>
    <div className="futures-speed">
      <div className="speed-labels"><span>{t('Gradually')}</span><span>{t('AI speed')}</span><span>{t('Quickly')}</span></div>
      <div className="speed-strip" role="img" aria-label={tipping.length > 1
        ? t('Tipping point: {a} leads until AI moves about {x}% of the way from Gradually to Quickly; after that, {b}.', { a: name(tipping[0].roleId), x: Math.round(tipping[1].from * 100), b: name(tipping[1].roleId) })
        : tipping[0] ? t('{a} stays your best move at every AI speed from Gradually to Quickly ({q} job ads, published ILO values).', { a: name(tipping[0].roleId), q: quarter }) : ''}>
        {tipping.map((seg, k) => {
          const end = k === tipping.length - 1 ? 1 : tipping[k + 1].from;
          return <span key={seg.roleId + seg.from} style={{ flexGrow: Math.max(end - seg.from, 0.02), background: colour(seg.roleId) }} />;
        })}
      </div>
      <p className="speed-note">{tipping.length > 1
        ? t('Tipping point: {a} leads until AI moves about {x}% of the way from Gradually to Quickly; after that, {b}.', { a: name(tipping[0].roleId), x: Math.round(tipping[1].from * 100), b: name(tipping[1].roleId) })
        : tipping[0] ? t('{a} stays your best move at every AI speed from Gradually to Quickly ({q} job ads, published ILO values).', { a: name(tipping[0].roleId), q: quarter }) : null}</p>
    </div>
    <details>
      <summary>{t('How the futures are made')}</summary>
      <ul className="note">
        <li>{t('AI speed: anywhere between Gradually and Quickly, chosen at random in each future (our assumption).')}</li>
        <li>{t('AI exposure: each future trusts one of three sources (ILO, Microsoft or Anthropic), chosen at random; ILO values vary within their own standard deviation.')}</li>
        <li>{t('Job-ad demand: one of the two DOSM quarters we have, chosen at random.')}</li>
        <li>{t('Each future is scored with the same rule as the ranking below; your skills, interests and goals do not change. A fixed seed gives the same result every time.')}</li>
        <li>{t('Score ranges on each row cover 90% of futures. These are estimates for comparing options, not predictions.')}</li>
      </ul>
    </details>
  </section>;
}

function LedgerRow({ result, rank, delta, onInspect, picks, goals, future, closeTo }: { result: RoleScore; rank: number | null; delta?: number; onInspect: () => void; picks: InterestType[]; goals: string[]; future?: RoleFutures; closeTo?: number }) {
  const t = useT();
  const { role, fit } = result;
  const part = (k: 'F' | 'D' | 'R') => result.contributions.find((c) => c.key === k)?.value ?? null;
  return <li className={`ledger-row${rank === null ? ' current' : ''}`}>
    <button type="button" className="ledger-line" onClick={onInspect}>
      <span className="rank">{rank === null ? t('Now') : rank}</span>
      <span className="role-name">{role.title}<small>{t('{n} held', { n: fit.matched.length })}{fit.transferable.length ? `, ${t('{n} transferable', { n: fit.transferable.length })}` : ''}, {t('{n} to build', { n: fit.missing.length })}{picks.length > 0 && (interestFit(role.id, picks) ?? 0) >= 0.75 ? <em className="fits">{t('fits your interests')}</em> : null}{goals.filter((g) => roleGoalLink(role, g)).map((g) => <em key={g} className="sdg-tag" title={roleGoalLink(role, g) === 'role' ? t('This role is linked to SDG {n}', { n: g }) : t('Some skills of this role are linked to SDG {n}', { n: g })}><span className="sdg-square" style={{ background: sdgData.goals[g].colour }}>{g}</span>{t(sdgData.goals[g].short)}{roleGoalLink(role, g) === 'skills' ? ` · ${t('via skills')}` : ''}</em>)}{future && <span className="future-line">{future.top3 > 0 ? `${t('Top 3 in {n}% of futures', { n: Math.round(future.top3 * 100) })} · ` : ''}{t('score {a}–{b} across futures', { a: future.low, b: future.high })}{closeTo ? <em className="close-call">{t('close call with #{n}', { n: closeTo })}</em> : null}</span>}</small></span>
      <Part value={part('F')} label={t('Skill fit')} area="f" />
      <Part value={part('D')} label={t('Demand')} area="d" />
      <Part value={part('R')} label={t('AI resilience')} area="r" />
      <span className="score"><Delta value={delta} />{result.score100}</span>
      <span className="visually-hidden">{t('View details')}</span>
    </button>
  </li>;
}

function RoleDetail({ result, rank, picks, onBack, onPlan }: { result: RoleScore; rank: number | null; picks: InterestType[]; onBack: () => void; onPlan?: () => void }) {
  const t = useT();
  const { role, fit, demand, resilience } = result;
  return <section className="role-focus" aria-label={t('View {role} details', { role: role.title })}>
    <button type="button" className="text-button role-back" onClick={onBack} autoFocus>{t('Back to ranking')}</button>
    <div className="role-focus-heading">
      <div><span className="role-focus-rank">{rank === null ? t('Now') : t('Rank {n}', { n: rank })}</span><h2>{role.title}</h2>
        <p className="note">{t('{n} held', { n: fit.matched.length })}{fit.transferable.length ? `, ${t('{n} transferable', { n: fit.transferable.length })}` : ''} · {t('{n} to build', { n: fit.missing.length })}</p></div>
      <strong className="focus-score">{result.score100}<small>{t('Score')}</small></strong>
    </div>
    <div className="detail-actions">
      {onPlan && fit.missing.length + fit.transferable.length > 0 && <button type="button" className="primary-button" onClick={onPlan}>{t('Plan this move')}</button>}
      <a className="esco-link" href={role.escoUri} target="_blank" rel="noreferrer">{t('ESCO occupation {code}', { code: role.isco })}</a>
    </div>
    <div className="detail-facts">
      <span className="fact-f">{t('{n} essential ESCO skills', { n: role.essentialSkills.length })}</span>
      <span className="fact-d">{demand ? <>{t(demand.group)} {pct(demand.change)}<small><a href={snapshots[demand.current === snapshots.q1.source.latestQuarter ? 'q1' : 'q2'].source.url} target="_blank" rel="noreferrer">DOSM</a> {t('{a} to {b}', { a: demand.previous, b: demand.current })}</small></> : t('No DOSM data')}</span>
      <span className="fact-r">{resilience ? <><a href={ilo.source.url} target="_blank" rel="noreferrer">{t('ILO exposure {x}', { x: resilience.exposure.toFixed(2) })}</a><small>{resilience.gradient}</small></> : t('No ILO data')}</span>
    </div>
    <div className="detail-skills">
      <SkillList title={t('You have')} empty={t('None of this role’s essential skills yet.')}>
        {[...fit.transferable.map((item) => <span className="skill-tag related" key={item.need.uri} title={item.have.label}>{item.need.label}<small>≈ {item.have.label}</small></span>),
          ...fit.matched.map((skill) => <span className="skill-tag" key={skill.uri}>{skill.label}</span>)]}
      </SkillList>
      <SkillList title={t('To build')} empty={t('Nothing missing.')}>
        {fit.missing.map((skill) => <span className="skill-tag skill-gap" key={skill.uri}>{skill.label}</span>)}
      </SkillList>
    </div>
    <div className="detail-evidence"><RoleSdgLine roleId={role.id} /><InterestLine roleId={role.id} picks={picks} /></div>
  </section>;
}

const signed = (x: number | null) => (x === null ? 'no data' : `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(1)}%`);
const quarter = (q: string) => q.replace('-', ' ');

/** One focused comparison, with the job-ad source stated once. */
function ChangesView({ changes, onBack }: { changes: ReturnType<typeof whatChanged>; onBack: () => void }) {
  const t = useT();
  const latest = quarter(snapshots.q2.source.latestQuarter);
  const earlier = quarter(snapshots.q1.source.latestQuarter);
  const rankMoves = changes.filter((c) => c.rankBefore !== c.rankAfter).length;
  const allDown = changes.length > 0 && changes.every((c) => c.scoreAfter < c.scoreBefore);
  return <section className="moves-focus" aria-label={t('Compare quarters')}>
    <button type="button" className="text-button role-back" onClick={onBack} autoFocus>{t('Back to ranking')}</button>
    <h2>{t('What changed with {q} job-ad data', { q: latest })}</h2>
    <p>{changes.length === 0 ? t('Nothing moved compared with {q} data.', { q: earlier }) : rankMoves === 0 ? t('Your order of moves stayed the same.') : rankMoves === 1 ? t('1 move changed place.') : t('{n} moves changed place.', { n: rankMoves })} {allDown && t('Online job ads fell in every occupation group in {q}, so every score dropped.', { q: latest })}</p>
    {changes.length > 0 && <ul className="change-list">{[...changes].sort((a, b) => a.rankAfter - b.rankAfter).map((c) => <li key={c.role.id}>
      <strong className="cap">{c.role.title}</strong>
      <span>{c.rankBefore !== c.rankAfter ? t('#{a} to #{b}', { a: c.rankBefore, b: c.rankAfter }) : t('stays #{n}', { n: c.rankAfter })} · {t('score {a} to {b}', { a: c.scoreBefore, b: c.scoreAfter })}</span>
      <small>{t(c.group ?? '')} {signed(c.changeAfter)}</small>
    </li>)}</ul>}
    <p className="note">{t('Job-ad change by occupation group, from {a} to {b}.', { a: earlier, b: latest })} <a href={snapshots.q2.source.url} target="_blank" rel="noreferrer">{t('DOSM source')}</a></p>
  </section>;
}

function MethodView({ onBack }: { onBack: () => void }) {
  const t = useT();
  return <section className="moves-focus" aria-label={t('How ranking works')}>
    <button type="button" className="text-button role-back" onClick={onBack} autoFocus>{t('Back to ranking')}</button>
    <h2>{t('How ranking works')}</h2>
    <p>{t('Scores are estimates for comparing roles, not hiring decisions.')}</p>
    <div className="method-grid">
      <div><h3>{t('Skill fit')}</h3><p>{t('Your confirmed skills against the role’s essential ESCO skills. Related skills count half.')}</p></div>
      <div><h3>{t('Demand')}</h3><p>{t('Change in Malaysian online job ads for the role’s occupation group.')}</p></div>
      <div><h3>{t('AI resilience')}</h3><p>{t('How much of the work is less exposed to generative AI. Higher means less exposed.')}</p></div>
    </div>
    <div className="method-plain"><h3>{t('Fairness and limits')}</h3>
      <p>{t('The ranking uses skills you confirmed, role skills and the two sourced signals above. It never asks for age, gender, ethnicity, religion or school.')}</p>
      <p>{t('Tests check that the same skills produce the same scores. Job ads cover only online postings, and ESCO describes roles from a European perspective.')}</p>
      <FairnessNote />
    </div>
    <div className="method-sources"><h3>{t('Sources')}</h3>
      <a href={snapshots.q2.source.url} target="_blank" rel="noreferrer">DOSM Job Market Insights</a>
      <a href={ilo.source.url} target="_blank" rel="noreferrer">ILO Working Paper 140</a>
      <a href="https://esco.ec.europa.eu/" target="_blank" rel="noreferrer">ESCO v1.2.1</a>
    </div>
  </section>;
}

export function MovesStep({ profile, onEditSkills, onPlan }: { profile: Profile; onEditSkills: () => void; onPlan: (roleId: string) => void }) {
  const t = useT();
  const tx = useTx();
  const [snapshotId, setSnapshotId] = useState<SnapshotId>('q2');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('moderate');
  const [useInterests, setUseInterests] = useState(false);
  const [useGoals, setUseGoals] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [panel, setPanel] = useState<'ranking' | 'changes' | 'method'>('ranking');
  const snapshot = snapshots[snapshotId];
  const scenario = scenarios[scenarioId];
  const picks = profile.interests;
  const goals = profile.goals;
  const extras = useMemo<Extras>(() => ({
    I: useInterests && picks.length > 0 ? (role) => interestFit(role.id, picks) : null,
    G: useGoals && goals.length > 0 ? (role) => goalFit(role, goals) : null,
  }), [useInterests, picks, useGoals, goals]);
  const extrasOn = [extras.I, extras.G].filter(Boolean).length;
  const { current, moves } = useMemo(
    () => recommendMoves(roles, profile.currentRoleId, profile.held, snapshot, ilo, scenario, transferable, extras),
    [profile, snapshot, scenario, extras],
  );
  // 1,000 simulated futures (src/futures.ts): same rule, uncertain AI speed, ILO exposure and quarter.
  const futures = useMemo(() => simulateFutures({ roles, currentRoleId: profile.currentRoleId, held: profile.held, snapshots: [snapshots.q1, snapshots.q2], ilo, transferable, extras }), [profile, extras]);
  const tipping = useMemo(() => tippingPoints({ roles, currentRoleId: profile.currentRoleId, held: profile.held, snapshot, ilo, transferable, extras }), [profile, snapshot, extras]);
  const changes = useMemo(() => {
    const run = (id: SnapshotId) => recommendMoves(roles, profile.currentRoleId, profile.held, snapshots[id], ilo, scenarios[scenarioId], transferable, extras).moves;
    return whatChanged(run('q1'), run('q2'));
  }, [profile, scenarioId, extras]);

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

  const selectedResult = selectedRoleId ? [current, ...moves].find((result) => result?.role.id === selectedRoleId) : null;
  const backToRanking = () => { setPanel('ranking'); setSelectedRoleId(null); window.scrollTo({ top: 0 }); };
  const openPanel = (next: 'changes' | 'method') => { setPanel(next); window.scrollTo({ top: 0 }); };
  if (selectedResult) {
    const rank = moves.findIndex((result) => result.role.id === selectedRoleId);
    return <div className="step-body"><RoleDetail result={selectedResult} rank={rank < 0 ? null : rank + 1} picks={picks}
      onBack={backToRanking}
      onPlan={rank < 0 ? undefined : () => onPlan(selectedResult.role.id)} /></div>;
  }
  if (panel === 'changes') return <div className="step-body"><ChangesView changes={changes} onBack={backToRanking} /></div>;
  if (panel === 'method') return <div className="step-body"><MethodView onBack={backToRanking} /></div>;
  const persona = personaById(profile.persona);
  const rankMoves = changes.filter((change) => change.rankBefore !== change.rankAfter).length;
  const allDown = changes.length > 0 && changes.every((change) => change.scoreAfter < change.scoreBefore);
  return <div className="step-body">
    <div className="who">
      <p>{persona ? tx('{who}, {description} with {n} skills.', { who: <strong>{t('Viewing as {name}', { name: persona.name })}</strong>, description: t(persona.description), n: profile.held.size })
        : tx('{who}{job}.', { who: <strong>{profile.held.size === 1 ? t('Your 1 skill') : t('Your {n} skills', { n: profile.held.size })}</strong>, job: current ? `, ${t('current job {role}', { role: current.role.title })}` : '' })}</p>
      <button type="button" className="text-button" onClick={onEditSkills}>{persona ? t('Use my own skills') : t('Edit skills')}</button>
    </div>

    <div className="moves-update">
      <p><strong>{t('{q} update', { q: quarter(snapshots.q2.source.latestQuarter) })}</strong> · {rankMoves === 0 ? t('Your order of moves stayed the same.') : rankMoves === 1 ? t('1 move changed place.') : t('{n} moves changed place.', { n: rankMoves })} {allDown && t('All scores fell as online job ads declined.')}</p>
      <div><button type="button" className="text-button" onClick={() => openPanel('changes')}>{t('Compare quarters')}</button>
        <button type="button" className="text-button" onClick={() => openPanel('method')}>{t('How ranking works')}</button></div>
    </div>

    <FuturesPanel futures={futures} tipping={tipping} quarter={snapshot.source.latestQuarter.replace('-', ' ')} />

    <section className="ledger" aria-label="Ranked moves">
      <div className="ledger-controls">
        <fieldset><legend>{t('Job-ad data')}</legend>
          {(['q1', 'q2'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="snapshot" checked={snapshotId === id} onChange={() => setSnapshotId(id)} />{snapshots[id].source.latestQuarter.replace('-', ' ')}</label>)}
        </fieldset>
        <fieldset><legend>{t('If AI changes work')}</legend>
          {(['moderate', 'fast'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="scenario" checked={scenarioId === id} onChange={() => setScenarioId(id)} />{id === 'moderate' ? t('Gradually') : t('Quickly')}</label>)}
        </fieldset>
        <fieldset className="ranking-personalise"><legend>{t('Personalise ranking')}</legend>
          <label className={`toggle${picks.length === 0 ? ' off' : ''}`} title={picks.length ? picks.map((x) => t(interestData.types[x].plain)).join(', ') : t('Pick them in Your skills first')}><input type="checkbox" checked={useInterests && picks.length > 0} disabled={picks.length === 0} onChange={(e) => setUseInterests(e.target.checked)} />{t('Interests')}{picks.length > 0 && <small>{picks.length}</small>}</label>
          <label className={`toggle${goals.length === 0 ? ' off' : ''}`} title={goals.length ? goals.map((g) => `SDG ${g} ${t(sdgData.goals[g].short)}`).join(', ') : t('Pick them in Your skills first')}><input type="checkbox" checked={useGoals && goals.length > 0} disabled={goals.length === 0} onChange={(e) => setUseGoals(e.target.checked)} />{t('Goals')}{goals.length > 0 && <span className="sdg-mini">{goals.map((g) => <span key={g} className="sdg-square" style={{ background: sdgData.goals[g].colour }}>{g}</span>)}</span>}</label>
        </fieldset>
      </div>
      <p className="note">{t(scenario.assumption)} {extrasOn === 1 ? t('Your choices count for one sixth of each score.') : extrasOn === 2 ? t('Your interests and goals together count for two sevenths of each score.') : ''}</p>
      <p className="note moves-select-hint">{t('Select a role to see details.')}</p>
      <ol className="ledger-table">
        <li className="ledger-head" aria-hidden="true"><span className="rank">{t('Rank')}</span><span>{t('Role')}</span><span>{t('Skill fit')}</span><span>{t('Demand')}</span><span>{t('AI resilience')}</span><span className="score">{t('Score')}</span></li>
        {current && <LedgerRow result={current} rank={null} delta={deltas.get(current.role.id)} onInspect={() => { setSelectedRoleId(current.role.id); window.scrollTo({ top: 0 }); }} picks={picks} goals={goals} />}
        {moves.map((m, i) => <LedgerRow key={m.role.id} result={m} rank={i + 1} delta={deltas.get(m.role.id)} onInspect={() => { setSelectedRoleId(m.role.id); window.scrollTo({ top: 0 }); }} picks={picks} goals={goals}
          future={futures.byRole.get(m.role.id)} closeTo={i > 0 && futures.swapShare(moves[i - 1].role.id, m.role.id) >= CLOSE_CALL ? i : undefined} />)}
      </ol>
    </section>
  </div>;
}

export function SourcesFooter({ showSourceSummary = true }: { showSourceSummary?: boolean }) {
  const tx = useTx();
  const t = useT();
  const lang = useLang();
  return <footer className="sources-footer">
    {showSourceSummary && <p>{tx('Sources: {dosm}, Q1 and Q2 2026; {ilo}, 2025; ESCO v1.2.1. Skill similarity uses BAAI/bge-m3 embeddings computed on RunPod.', { dosm: <a href={snapshots.q2.source.url} target="_blank" rel="noreferrer">DOSM Job Market Insights</a>, ilo: <a href={ilo.source.url} target="_blank" rel="noreferrer">ILO Working Paper 140</a> })}</p>}
    {/* Licence wording required by ESCO: kept in English in every language. */}
    <p>This service uses the ESCO classification of the European Commission. {t('The role set is an adapted selection of ESCO. Profiles in this prototype are fictional or kept only in your browser tab.')}</p>
    {lang !== 'en' && <p>{t('Skill names and role titles are shown in English because ESCO has no Malay or Chinese version.')}</p>}
  </footer>;
}
