// Future Skills Radar: where the viewer's own skills stand, and the nine jobs
// behind the signals. Rule: src/radar.ts (SIGNALS_AND_MATCHING.md, "Future Skills Radar").
// First view shows only the viewer's skills and one next step per band; every
// other skill stays behind a "Show its skills" button so the page is not a wall of tags.
import { useMemo, useState } from 'react';
import { ilo, roles, snapshots, type Profile, type SnapshotId } from './data';
import { useT } from './i18n';
import { radarGroups, skillRadar, type RadarGroup } from './radar';
import { scenarios, type Role, type ScenarioId, type Skill } from './scoring';

type Band = 'strong' | 'middle' | 'risk';
const pct = (x: number | null) => (x === null ? '–' : `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(1)}%`);
const quarter = (q: string) => q.replace('-', ' ');

/** Bands by thirds of the skill groups; returns a function that bands any outlook value. */
function bander(groups: RadarGroup[]) {
  const third = Math.ceil(groups.length / 3);
  const strongMin = groups[third - 1].outlook;
  const riskMax = groups[groups.length - third].outlook;
  return (outlook: number): Band => (outlook >= strongMin ? 'strong' : outlook <= riskMax ? 'risk' : 'middle');
}

/** One job's own outlook: the same rule applied to that role alone. */
function roleOutlooks(snapshotId: SnapshotId, scenarioId: ScenarioId) {
  return roles.map((role) => ({ role, ...radarGroups(skillRadar([role], snapshots[snapshotId], ilo, scenarios[scenarioId]))[0] }))
    .sort((a, b) => b.outlook - a.outlook);
}

function YourBand({ band, skills, onGo }: { band: Band; skills: Skill[]; onGo: (s: 'moves' | 'plan') => void }) {
  const t = useT();
  const [all, setAll] = useState(false);
  const head = { strong: t('Growing in value'), middle: t('Holding steady'), risk: t('At risk') }[band];
  const why = {
    strong: t('Used in jobs where hiring held up better and AI is likely to change less of the work.'),
    middle: t('Used in jobs in the middle on both hiring and AI change.'),
    risk: t('Used in jobs where hiring fell most and AI could change more of the work.'),
  }[band];
  const action = {
    strong: { label: t('Build on these in Your plan'), to: 'plan' as const },
    middle: { label: t('See roles that use them'), to: 'moves' as const },
    risk: { label: t('See moves that reuse them'), to: 'moves' as const },
  }[band];
  const shown = all ? skills : skills.slice(0, 5);
  return <section className={`you-band ${band}`}>
    <h2><strong>{skills.length}</strong> {head}</h2>
    <p className="note">{why}</p>
    {skills.length > 0
      ? <ul>{shown.map((s) => <li key={s.uri}>{s.label}</li>)}</ul>
      : <p className="note">{t('None of your skills here.')}</p>}
    {skills.length > 5 && <button type="button" className="text-button" onClick={() => setAll(!all)}>{all ? t('Show fewer') : t('+{n} more', { n: skills.length - 5 })}</button>}
    {skills.length > 0 && <button type="button" className="text-button you-band-go" onClick={() => onGo(action.to)}>{action.label} →</button>}
  </section>;
}

function JobRow({ role, band, demandChange, exposure, move, held }: { role: Role; band: Band; demandChange: number | null; exposure: number | null; move: number; held: ReadonlySet<string> }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const mine = role.essentialSkills.filter((s) => held.has(s.uri)).length;
  const label = { strong: t('Growing in value'), middle: t('Holding steady'), risk: t('At risk') }[band];
  const skills = [...role.essentialSkills].sort((a, b) => Number(held.has(b.uri)) - Number(held.has(a.uri)) || a.label.localeCompare(b.label));
  return <li className={`job-row ${band}`}>
    <div className="job-row-head">
      <div>
        <strong className="job-title">{role.title}</strong>
        <small>{t('Job ads {x}', { x: pct(demandChange) })} · {t('AI exposure {x}', { x: exposure === null ? '–' : exposure.toFixed(2) })}
          {move !== 0 ? ` · ${move > 0 ? '▲' : '▼'}${Math.abs(move)} ${t('since last quarter')}` : ''}</small>
      </div>
      <span className={`band-label ${band}`}>{label}</span>
    </div>
    <button type="button" className="text-button" aria-expanded={open} onClick={() => setOpen(!open)}>
      {open ? t('Hide skills') : mine > 0 ? t('Show its {n} skills (you have {m})', { n: skills.length, m: mine }) : t('Show its {n} skills', { n: skills.length })}
    </button>
    {open && <div className="tag-row job-row-skills">
      {skills.map((s) => <span key={s.uri} className={`skill-tag${held.has(s.uri) ? '' : ' radar-skill'}`}>{held.has(s.uri) ? '✓ ' : ''}{s.label}</span>)}
    </div>}
  </li>;
}

export function RadarView({ profile, onGo }: { profile: Profile; onGo: (s: 'moves' | 'plan' | 'skills') => void }) {
  const t = useT();
  const [snapshotId, setSnapshotId] = useState<SnapshotId>('q2');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('moderate');
  const held = profile.held;
  const { mineByBand, jobs } = useMemo(() => {
    const rows = skillRadar(roles, snapshots[snapshotId], ilo, scenarios[scenarioId]);
    const band = bander(radarGroups(rows));
    const mineByBand: Record<Band, Skill[]> = { strong: [], middle: [], risk: [] };
    for (const r of rows) if (held.has(r.skill.uri)) mineByBand[band(r.outlook)].push(r.skill);
    const now = roleOutlooks(snapshotId, scenarioId);
    const before = snapshotId === 'q2' ? roleOutlooks('q1', scenarioId) : now;
    const wasRank = new Map(before.map((x, i) => [x.role.id, i]));
    const jobs = now.map((x, i) => ({ ...x, band: band(x.outlook), move: (wasRank.get(x.role.id) ?? i) - i }));
    return { mineByBand, jobs };
  }, [snapshotId, scenarioId, held]);
  const total = mineByBand.strong.length + mineByBand.middle.length + mineByBand.risk.length;

  return <div className="step-body radar">
    <div className="radar-controls">
      <fieldset><legend>{t('If AI changes work')}</legend>
        {(['moderate', 'fast'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="radar-scenario" checked={scenarioId === id} onChange={() => setScenarioId(id)} />{id === 'moderate' ? t('Gradually') : t('Quickly')}</label>)}
      </fieldset>
    </div>

    {total > 0
      ? <>
        <h2 className="radar-section">{t('Your skills')} <span>{t('{n} of your skills are used in these jobs', { n: total })}</span></h2>
        <div className="you-grid">
          {(['strong', 'middle', 'risk'] as const).map((b) => <YourBand key={b} band={b} skills={mineByBand[b]} onGo={onGo} />)}
        </div>
      </>
      : <section className="panel"><p>{t('Add your skills in Your skills to see where yours fall.')}</p>
        <button type="button" className="primary-button" onClick={() => onGo('skills')}>{t('Add skills')}</button></section>}

    <h2 className="radar-section">{t('The jobs behind these signals')} <span>{t('Best outlook first')}</span></h2>
    {jobs.every((j) => j.demandChange !== null && j.demandChange < 0) && <p className="note">{t('Job ads fell for all nine jobs in this quarter, so the labels compare the jobs with each other.')}</p>}
    <ol className="job-list">
      {jobs.map((j) => <JobRow key={j.role.id} role={j.role} band={j.band} demandChange={j.demandChange} exposure={j.exposure} move={j.move} held={held} />)}
    </ol>

    <details className="how-to-read">
      <summary>{t('How this is worked out')}</summary>
      <p className="note">{t('Each skill gets the signals of the jobs that need it: the change in online job ads (DOSM, quarter on quarter) and how much generative AI could change those jobs (ILO). The top third of skill groups is “growing in value”, the bottom third “at risk”.')}</p>
      <div className="ledger-controls">
        <fieldset><legend>{t('Job-ad data')}</legend>
          {(['q1', 'q2'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="radar-snapshot" checked={snapshotId === id} onChange={() => setSnapshotId(id)} />{quarter(snapshots[id].source.latestQuarter)}</label>)}
        </fieldset>
      </div>
      <p className="note">{t('An estimate derived from roles, not a measured demand for each skill: DOSM online job ads by occupation group (quarter on quarter) and ILO generative AI exposure, for the essential ESCO skills of the nine roles. It supports your decision; it does not predict hiring.')}</p>
    </details>
  </div>;
}
