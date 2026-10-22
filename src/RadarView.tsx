// Future Skills Radar: where the viewer's own skills stand, and the nine jobs
// behind the signals. Rule: src/radar.ts (SIGNALS_AND_MATCHING.md, "Future Skills Radar").
// One skill band and one role can be inspected at a time, keeping long skill
// lists from pushing the rest of the comparison far down the page.
import { useMemo, useState, type KeyboardEvent } from 'react';
import { ilo, roles, snapshots, type Profile, type SnapshotId } from './data';
import { useT } from './i18n';
import { radarGroups, skillRadar, type RadarGroup } from './radar';
import { scenarios, type Role, type ScenarioId, type Skill } from './scoring';

type Band = 'strong' | 'middle' | 'risk';
const bands: Band[] = ['strong', 'middle', 'risk'];
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

function YourBand({ band, skills, total, onGo }: { band: Band; skills: Skill[]; total: number; onGo: (s: 'moves' | 'plan' | 'skills') => void }) {
  const t = useT();
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
  return <section id="radar-band-panel" className={`you-band ${band}`} role="tabpanel" aria-labelledby={`radar-band-${band}`}>
    <h2>{t('Your skills')}</h2>
    <p className="note">{why}</p>
    {total === 0
      ? <><p className="note">{t('Add your skills in Your skills to see where yours fall.')}</p><button type="button" className="text-button you-band-go" onClick={() => onGo('skills')}>{t('Add skills')} →</button></>
      : skills.length > 0
      ? <ul>{skills.map((s) => <li key={s.uri}>{s.label}</li>)}</ul>
      : <p className="note">{t('None of your skills here.')}</p>}
    {skills.length > 0 && <button type="button" className="text-button you-band-go" onClick={() => onGo(action.to)}>{action.label} →</button>}
  </section>;
}

function JobRow({ role, demandChange, exposure, move, held, open, showAll, onToggle, onShowAll }: { role: Role; demandChange: number | null; exposure: number | null; move: number; held: ReadonlySet<string>; open: boolean; showAll: boolean; onToggle: () => void; onShowAll: () => void }) {
  const t = useT();
  const mine = role.essentialSkills.filter((s) => held.has(s.uri)).length;
  const skills = [...role.essentialSkills].sort((a, b) => Number(held.has(b.uri)) - Number(held.has(a.uri)) || a.label.localeCompare(b.label));
  return <li className="job-row">
    <button type="button" className="job-row-trigger" aria-expanded={open} onClick={onToggle}>
      <div>
        <strong className="job-title">{role.title}</strong>
        <small>{t('Job ads {x}', { x: pct(demandChange) })} · {t('AI exposure {x}', { x: exposure === null ? '–' : exposure.toFixed(2) })}
          {move !== 0 ? ` · ${move > 0 ? '▲' : '▼'}${Math.abs(move)} ${t('since last quarter')}` : ''}</small>
      </div>
      <span className="job-row-meta">{t('{n} essential ESCO skills', { n: skills.length })}{mine > 0 && <small>{t('{n} held', { n: mine })}</small>}</span>
      <span className="job-row-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
    </button>
    {open && <div className="job-row-detail">
      <div className="tag-row job-row-skills">{(showAll ? skills : skills.slice(0, 8)).map((s) => <span key={s.uri} className={`skill-tag${held.has(s.uri) ? '' : ' radar-skill'}`}>{held.has(s.uri) ? '✓ ' : ''}{s.label}</span>)}</div>
      {skills.length > 8 && <button type="button" className="text-button" onClick={onShowAll}>{showAll ? t('Show fewer') : t('+{n} more', { n: skills.length - 8 })}</button>}
    </div>}
  </li>;
}

export function RadarView({ profile, onGo }: { profile: Profile; onGo: (s: 'moves' | 'plan' | 'skills') => void }) {
  const t = useT();
  const [snapshotId, setSnapshotId] = useState<SnapshotId>('q2');
  const [scenarioId, setScenarioId] = useState<ScenarioId>('moderate');
  const [activeBand, setActiveBand] = useState<Band>('strong');
  const [openRoleId, setOpenRoleId] = useState<string | null>(null);
  const [showAllJobSkills, setShowAllJobSkills] = useState(false);
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
  const bandLabels: Record<Band, string> = { strong: t('Growing in value'), middle: t('Holding steady'), risk: t('At risk') };
  const visibleJobs = jobs.filter((j) => j.band === activeBand);
  const selectBand = (band: Band) => { setActiveBand(band); setOpenRoleId(null); setShowAllJobSkills(false); };
  const onBandKeyDown = (event: KeyboardEvent<HTMLButtonElement>, band: Band) => {
    const index = bands.indexOf(band);
    const next = event.key === 'ArrowRight' ? bands[(index + 1) % bands.length]
      : event.key === 'ArrowLeft' ? bands[(index + bands.length - 1) % bands.length]
      : event.key === 'Home' ? bands[0]
      : event.key === 'End' ? bands[bands.length - 1] : null;
    if (!next) return;
    event.preventDefault();
    selectBand(next);
    document.getElementById(`radar-band-${next}`)?.focus();
  };

  return <div className="step-body radar">
    <div className="radar-toolbar">
    <div className="radar-controls">
      <fieldset><legend>{t('If AI changes work')}</legend>
        {(['moderate', 'fast'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="radar-scenario" checked={scenarioId === id} onChange={() => setScenarioId(id)} />{id === 'moderate' ? t('Gradually') : t('Quickly')}</label>)}
      </fieldset>
    </div>
      <div className="ledger-controls">
        <fieldset><legend>{t('Job-ad data')}</legend>
          {(['q1', 'q2'] as const).map((id) => <label key={id} className="choice"><input type="radio" name="radar-snapshot" checked={snapshotId === id} onChange={() => setSnapshotId(id)} />{quarter(snapshots[id].source.latestQuarter)}</label>)}
        </fieldset>
      </div>
    </div>

    <div className="radar-band-tabs" role="tablist" aria-label={t('Future skills radar')}>
      {bands.map((b) => <button key={b} id={`radar-band-${b}`} type="button" role="tab" tabIndex={activeBand === b ? 0 : -1} aria-selected={activeBand === b} aria-controls="radar-band-panel" className={b} onClick={() => selectBand(b)} onKeyDown={(event) => onBandKeyDown(event, b)}><strong>{mineByBand[b].length}</strong><span>{bandLabels[b]}<small>{t('{n} roles', { n: jobs.filter((j) => j.band === b).length })}</small></span></button>)}
    </div>

    <div className="radar-workspace">
      <YourBand band={activeBand} skills={mineByBand[activeBand]} total={total} onGo={onGo} />
      <section className="radar-jobs">
        <h2>{t('The jobs behind these signals')}</h2>
        <p className="note">{t('Best outlook first')}</p>
        <ol className="job-list">
          {visibleJobs.map((j) => <JobRow key={j.role.id} role={j.role} demandChange={j.demandChange} exposure={j.exposure} move={j.move} held={held} open={openRoleId === j.role.id} showAll={showAllJobSkills} onToggle={() => { setOpenRoleId(openRoleId === j.role.id ? null : j.role.id); setShowAllJobSkills(false); }} onShowAll={() => setShowAllJobSkills(!showAllJobSkills)} />)}
        </ol>
      </section>
    </div>

    <p className="radar-method">{jobs.every((j) => j.demandChange !== null && j.demandChange < 0) && <>{t('Job ads fell for all nine jobs this quarter.')} </>}{t('Skills follow the outlook of jobs that need them, using DOSM job ads and ILO AI exposure. These labels compare nine roles; they do not predict hiring.')}</p>
  </div>;
}
