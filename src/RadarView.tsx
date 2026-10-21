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

export function RadarView({ profile }: { profile: Profile }) {
  const t = useT();
  const [snapshotId, setSnapshotId] = useState<SnapshotId>('q2');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('moderate');
  const { groups, changes } = useMemo(() => {
    const now = radarGroups(skillRadar(roles, snapshots[snapshotId], ilo, scenarios[scenarioId]));
    const other: SnapshotId = snapshotId === 'q2' ? 'q1' : 'q2';
    const before = radarGroups(skillRadar(roles, snapshots[other], ilo, scenarios[scenarioId]));
    return { groups: now, changes: snapshotId === 'q2' ? groupRankChanges(before, now) : new Map<string, number>() };
  }, [snapshotId, scenarioId]);
  const third = Math.ceil(groups.length / 3);
  const band = (i: number) => (i < third ? 'strong' : i >= groups.length - third ? 'risk' : 'middle') as 'strong' | 'middle' | 'risk';
  const held = profile.held;
  const mineIn = (b: 'strong' | 'risk') => groups.filter((_, i) => band(i) === b).reduce((n, g) => n + g.skills.filter((s) => held.has(s.uri)).length, 0);
  const top = groups[0];
  const bottom = groups[groups.length - 1];

  return <div className="step-body radar">
    <section className="radar-summary">
      <div className="radar-card strong"><small>{t('Strongest outlook')}</small><strong className="cap">{top.roles.map((r) => r.title).join(' + ')}</strong><span>{t('{n} skills', { n: top.skills.length })} · {Math.round(top.outlook * 100)}</span></div>
      <div className="radar-card risk"><small>{t('Most at risk')}</small><strong className="cap">{bottom.roles.map((r) => r.title).join(' + ')}</strong><span>{t('{n} skills', { n: bottom.skills.length })} · {Math.round(bottom.outlook * 100)}</span></div>
      {held.size > 0 && <div className="radar-card mine"><small>{t('Your skills')}</small><strong>{t('{a} in the top third, {b} in the bottom third', { a: mineIn('strong'), b: mineIn('risk') })}</strong><span>{t('of {n} you have in these roles', { n: groups.reduce((n, g) => n + g.skills.filter((s) => held.has(s.uri)).length, 0) })}</span></div>}
    </section>

    <section className="ledger" aria-label={t('Future skills radar')}>
      <div className="ledger-controls">
        <fieldset><legend>{t('Job-ad data')}</legend>
          {(['q1', 'q2'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="radar-snapshot" checked={snapshotId === id} onChange={() => setSnapshotId(id)} />{quarter(snapshots[id].source.latestQuarter)}</label>)}
        </fieldset>
        <fieldset><legend>{t('If AI changes work')}</legend>
          {(['moderate', 'fast'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="radar-scenario" checked={scenarioId === id} onChange={() => setScenarioId(id)} />{id === 'moderate' ? t('Gradually') : t('Quickly')}</label>)}
        </fieldset>
      </div>
      <p className="note">{t('Skills needed by the same roles share the same signals, so they are shown together. Outlook out of 100 combines the job-ad trend and AI resilience of those roles; arrows show the move since {q} data.', { q: quarter(snapshots.q1.source.latestQuarter) })}</p>
      <ol className="radar-list">{groups.map((g, i) => <GroupRow key={g.key} group={g} change={changes.get(g.key) ?? 0} band={band(i)} held={held} />)}</ol>
      <p className="note">{t('An estimate derived from roles, not a measured demand for each skill: DOSM online job ads by occupation group (quarter on quarter) and ILO generative AI exposure, for the essential ESCO skills of the nine roles. It supports your decision; it does not predict hiring.')}</p>
    </section>
  </div>;
}
