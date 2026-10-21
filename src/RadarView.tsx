// Future Skills Radar: skills of the nine roles grouped by the roles that need
// them, ranked by an estimated outlook (job-ad trend + AI resilience of those roles).
// Rule: src/radar.ts (documented in SIGNALS_AND_MATCHING.md, "Future Skills Radar").
import { useMemo, useState } from 'react';
import { ilo, roles, snapshots, type Profile, type SnapshotId } from './data';
import { useT } from './i18n';
import { groupRankChanges, radarGroups, skillRadar, type RadarGroup } from './radar';
import { scenarios, type ScenarioId } from './scoring';

const pct = (x: number | null) => (x === null ? '–' : `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(1)}%`);
const quarter = (q: string) => q.replace('-', ' ');

function GroupRow({ group, change, band, held }: { group: RadarGroup; change: number; band: 'strong' | 'middle' | 'risk'; held: ReadonlySet<string> }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const mine = group.skills.filter((s) => held.has(s.uri)).length;
  const shown = open ? group.skills : group.skills.slice(0, 8);
  return <li className={`radar-row ${band}`}>
    <div className="radar-head">
      <span className="radar-rank">{group.rank}</span>
      <div className="radar-who">
        <strong className="cap">{group.roles.map((r) => r.title).join(' + ')}</strong>
        <small>{group.skills.length === 1 ? t('1 skill') : t('{n} skills', { n: group.skills.length })}
          {group.roles.length > 1 ? ` · ${t('shared by {n} roles', { n: group.roles.length })}` : ''}
          {mine > 0 ? ` · ${t('you have {n}', { n: mine })}` : ''}</small>
      </div>
      <span className="radar-score" aria-label={t('Outlook {n} of 100', { n: Math.round(group.outlook * 100) })}>
        <span className="bar" aria-hidden="true"><span style={{ width: `${Math.round(group.outlook * 100)}%` }} /></span>
        <strong>{Math.round(group.outlook * 100)}</strong>
      </span>
      <span className="radar-facts">{t('Job ads {x}', { x: pct(group.demandChange) })}<small>{t('AI exposure {x}', { x: group.exposure === null ? '–' : group.exposure.toFixed(2) })}</small></span>
      <span className={`radar-move ${change > 0 ? 'up' : change < 0 ? 'down' : ''}`}>{change > 0 ? `▲${change}` : change < 0 ? `▼${-change}` : '–'}</span>
    </div>
    <div className="tag-row radar-skills">
      {shown.map((s) => <span key={s.uri} className={`skill-tag${held.has(s.uri) ? '' : ' radar-skill'}`}>{held.has(s.uri) ? '✓ ' : ''}{s.label}{s.green ? <small className="flag">{t('green')}</small> : null}{s.digital ? <small className="flag">{t('digital')}</small> : null}</span>)}
      {group.skills.length > 8 && <button type="button" className="text-button" onClick={() => setOpen(!open)}>{open ? t('Show fewer') : t('+{n} more', { n: group.skills.length - 8 })}</button>}
    </div>
  </li>;
}

type Band = 'strong' | 'middle' | 'risk';

/** Plain heading for a group: "Used by sustainability managers and business analysts". */
function usedBy(group: RadarGroup, t: ReturnType<typeof useT>) {
  const names = group.roles.map((r) => r.title);
  const list = names.length <= 2 ? names.join(` ${t('and')} `) : `${names.slice(0, -1).join(', ')} ${t('and')} ${names[names.length - 1]}`;
  return t('Used by: {roles}', { roles: list });
}

function BandColumn({ band, groups, held, onlyMine }: { band: Band; groups: RadarGroup[]; held: ReadonlySet<string>; onlyMine: boolean }) {
  const t = useT();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const title = { strong: t('Growing in value'), middle: t('Holding steady'), risk: t('At risk') }[band];
  const why = {
    strong: t('Used in jobs where hiring held up better and AI is likely to change less of the work.'),
    middle: t('Used in jobs in the middle on both hiring and AI change.'),
    risk: t('Used in jobs where hiring fell most and AI could change more of the work.'),
  }[band];
  const visible = groups
    .map((g) => ({ g, skills: [...g.skills].sort((a, b) => Number(held.has(b.uri)) - Number(held.has(a.uri))).filter((s) => !onlyMine || held.has(s.uri)) }))
    .filter((x) => x.skills.length > 0);
  const count = visible.reduce((n, x) => n + x.skills.length, 0);
  return <section className={`band-col ${band}`} aria-labelledby={`band-${band}`}>
    <h2 id={`band-${band}`}>{title} <span>{count}</span></h2>
    <p className="note">{why}</p>
    {visible.length === 0 && <p className="note">{onlyMine ? t('None of your skills here.') : t('No skills here.')}</p>}
    {visible.map(({ g, skills }) => {
      const shown = open[g.key] ? skills : skills.slice(0, 6);
      return <div key={g.key} className="band-group">
        <h3 className="cap-first">{usedBy(g, t)}</h3>
        <div className="tag-row">
          {shown.map((s) => <span key={s.uri} className={`skill-tag${held.has(s.uri) ? ' mine' : ' radar-skill'}`}>{held.has(s.uri) ? '✓ ' : ''}{s.label}</span>)}
          {skills.length > 6 && <button type="button" className="text-button" onClick={() => setOpen({ ...open, [g.key]: !open[g.key] })}>{open[g.key] ? t('Show fewer') : t('+{n} more', { n: skills.length - 6 })}</button>}
        </div>
      </div>;
    })}
  </section>;
}

export function RadarView({ profile }: { profile: Profile }) {
  const t = useT();
  const [snapshotId, setSnapshotId] = useState<SnapshotId>('q2');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('moderate');
  const held = profile.held;
  const [onlyMine, setOnlyMine] = useState(false);
  const { groups, changes } = useMemo(() => {
    const now = radarGroups(skillRadar(roles, snapshots[snapshotId], ilo, scenarios[scenarioId]));
    const other: SnapshotId = snapshotId === 'q2' ? 'q1' : 'q2';
    const before = radarGroups(skillRadar(roles, snapshots[other], ilo, scenarios[scenarioId]));
    return { groups: now, changes: snapshotId === 'q2' ? groupRankChanges(before, now) : new Map<string, number>() };
  }, [snapshotId, scenarioId]);
  const third = Math.ceil(groups.length / 3);
  const band = (i: number): Band => (i < third ? 'strong' : i >= groups.length - third ? 'risk' : 'middle');
  const inBand = (b: Band) => groups.filter((_, i) => band(i) === b);
  const mine = (b: Band) => inBand(b).reduce((n, g) => n + g.skills.filter((s) => held.has(s.uri)).length, 0);
  const myTotal = mine('strong') + mine('middle') + mine('risk');

  return <div className="step-body radar">
    {myTotal > 0
      ? <section className="radar-you">
        <p>{t('Of your {n} skills that these jobs use:', { n: myTotal })}</p>
        <div className="radar-you-counts">
          <span className="strong"><strong>{mine('strong')}</strong> {t('growing in value')}</span>
          <span className="middle"><strong>{mine('middle')}</strong> {t('holding steady')}</span>
          <span className="risk"><strong>{mine('risk')}</strong> {t('at risk')}</span>
        </div>
      </section>
      : <p className="note">{t('Add your skills in Your skills to see where yours fall.')}</p>}

    <div className="radar-controls">
      {held.size > 0 && <fieldset><legend className="visually-hidden">{t('Show')}</legend>
        <label className="choice"><input type="radio" name="radar-mine" checked={!onlyMine} onChange={() => setOnlyMine(false)} />{t('All skills')}</label>
        <label className="choice"><input type="radio" name="radar-mine" checked={onlyMine} onChange={() => setOnlyMine(true)} />{t('Only my skills')}</label>
      </fieldset>}
      <fieldset><legend>{t('If AI changes work')}</legend>
        {(['moderate', 'fast'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="radar-scenario" checked={scenarioId === id} onChange={() => setScenarioId(id)} />{id === 'moderate' ? t('Gradually') : t('Quickly')}</label>)}
      </fieldset>
    </div>

    <div className="band-grid">
      {(['strong', 'middle', 'risk'] as const).map((b) => <BandColumn key={b} band={b} groups={inBand(b)} held={held} onlyMine={onlyMine} />)}
    </div>

    <details className="how-to-read">
      <summary>{t('How this is worked out')}</summary>
      <p className="note">{t('Skills needed by the same roles share the same signals, so they are shown together. Outlook out of 100 combines the job-ad trend and AI resilience of those roles; arrows show the move since {q} data.', { q: quarter(snapshots.q1.source.latestQuarter) })} {t('The top third of groups is “growing in value”, the bottom third “at risk”.')}</p>
      <div className="ledger-controls">
        <fieldset><legend>{t('Job-ad data')}</legend>
          {(['q1', 'q2'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="radar-snapshot" checked={snapshotId === id} onChange={() => setSnapshotId(id)} />{quarter(snapshots[id].source.latestQuarter)}</label>)}
        </fieldset>
      </div>
      <ol className="radar-list">{groups.map((g, i) => <GroupRow key={g.key} group={g} change={changes.get(g.key) ?? 0} band={band(i)} held={held} />)}</ol>
      <p className="note">{t('An estimate derived from roles, not a measured demand for each skill: DOSM online job ads by occupation group (quarter on quarter) and ILO generative AI exposure, for the essential ESCO skills of the nine roles. It supports your decision; it does not predict hiring.')}</p>
    </details>
  </div>;
}
