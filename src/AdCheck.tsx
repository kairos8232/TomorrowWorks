// "Check an ad" (Job market). The person pastes a job ad; the ad's lines are matched to
// ESCO skills on RunPod (same service as the CV intake, /api/cv-skills) and the person
// ticks the ones that really are in the ad. We then show which of those skills they
// hold, which are close, which to build, the closest of our roles with its demand and
// AI-exposure signals, and checked courses for the gaps. Rule: src/adFit.ts.
// The ad is not stored. No score is made up: only counts and existing signals.
import { useMemo, useRef, useState } from 'react';
import { ilo, roles, roleTitle, snapshots, transferable, type Profile } from './data';
import { aiResilience, demandTrend, type Skill } from './scoring';
import { closestRole, compareAd, cvGap } from './adFit';
import { planForGaps, type Resource } from './pathway';
import resourcesFile from '../data/pathway/resources.json';
import { cvLines } from './cv';
import { sampleAd } from './sampleAd';
import { sampleCvWithHabits } from './sampleCv';
import { CvAvoid } from './CvAvoid';
import { JobLinks } from './JobLinks';
import { useT } from './i18n';

const resources = resourcesFile.resources as Resource[];
type Suggestion = Skill & { similarity: number; from: string };
type ResultView = 'overview' | 'skills' | 'cv';
const pct = (x: number) => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(1)}%`;

export function AdCheck({ profile, onGo, onNext, initialCv = '' }: { profile: Profile; onGo: (screen: 'skills' | 'moves') => void; onNext?: (roleId: string | null) => void; initialCv?: string }) {
  const t = useT();
  const [text, setText] = useState('');
  const [cvText, setCvText] = useState(initialCv);
  const [found, setFound] = useState<Suggestion[] | null>(null);
  const [cvFound, setCvFound] = useState<Suggestion[] | null>(null);
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [resultView, setResultView] = useState<ResultView>('overview');
  const [showEntry, setShowEntry] = useState(true);
  const [showAllBuild, setShowAllBuild] = useState(false);
  const [showAllRelated, setShowAllRelated] = useState(false);
  const [showAllHave, setShowAllHave] = useState(false);
  const [status, setStatus] = useState({ busy: false, message: '' });
  const requestVersion = useRef(0);

  /** Match lines to ESCO skills on RunPod (same call as the CV import). */
  async function match(lines: string[], max?: number): Promise<Suggestion[]> {
    const res = await fetch('/api/cv-skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines, max }) });
    const body = await res.json().catch(() => ({}));
    // The server's own wording talks about CVs, so only its rate-limit message is shown as is.
    if (!res.ok) throw new Error(res.status === 429 ? body.error : 'Ad matching is unavailable right now. Try again in a minute.');
    return body.results;
  }

  async function check() {
    const lines = cvLines(text).lines;
    if (lines.length === 0) { setStatus({ busy: false, message: 'No requirements found. Paste the duties and requirements of the ad.' }); return; }
    const version = ++requestVersion.current;
    const cvL = cvText.trim() ? cvLines(cvText).lines : [];
    setFound(null); setCvFound(null);
    setStatus({ busy: true, message: 'Reading the ad. The first search after a pause can take up to a minute.' });
    try {
      const results = await match(lines);
      // The CV can show more skills than the default 25, so ask for up to 80: nothing is cut off.
      const cvResults = cvL.length > 0 ? await match(cvL, 80) : null;
      if (version !== requestVersion.current) return;
      setFound(results); setCvFound(cvResults);
      setTicked(new Set(results.map((s) => s.uri)));
      setResultView('overview');
      setShowEntry(results.length === 0);
      setShowAllBuild(false);
      setShowAllRelated(false);
      setShowAllHave(false);
      setStatus({ busy: false, message: results.length ? '' : 'No close ESCO skills found in this ad. Try pasting the duties and requirements.' });
    } catch (err) {
      if (version !== requestVersion.current) return;
      setStatus({ busy: false, message: err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Ad matching is unavailable right now. Try again in a minute.' });
    }
  }
  const invalidate = () => { requestVersion.current += 1; setFound(null); setCvFound(null); setTicked(new Set()); setShowEntry(true); setStatus({ busy: false, message: '' }); };
  const clear = () => { setText(''); setCvText(''); invalidate(); };
  const toggle = (uri: string) => { const next = new Set(ticked); if (next.has(uri)) next.delete(uri); else next.add(uri); setTicked(next); };

  const ad = useMemo(() => (found ?? []).filter((s) => ticked.has(s.uri)), [found, ticked]);
  const cmp = useMemo(() => compareAd(ad, profile.held, transferable), [ad, profile.held]);
  const closest = useMemo(() => closestRole(ad, roles), [ad]);
  const plan = useMemo(() => planForGaps(cmp.gaps, resources), [cmp]);
  const demand = closest ? demandTrend(snapshots.q2, closest.role.iscoMajorGroup) : null;
  const resilience = closest ? aiResilience(ilo, closest.role.isco) : null;
  // Grouping uses every matched skill, so unticking a skill does not move it between groups.
  const every = useMemo(() => compareAd(found ?? [], profile.held, transferable), [found, profile.held]);
  const cvSkillBy = new Map((cvFound ?? []).map((c) => [c.uri, c]));
  const gap = useMemo(() => (cvFound ? cvGap(ad, new Set(cvFound.map((c) => c.uri)), profile.held) : null), [ad, cvFound, profile.held]);
  const relatedBy = new Map(every.transferable.map((r) => [r.need.uri, r.have.label]));
  const heldUris = new Set(every.matched.map((s) => s.uri));
  const rows = (list: Suggestion[]) => <ul className="posting-skills">{list.map((s) => <li key={s.uri}><label>
    <input type="checkbox" checked={ticked.has(s.uri)} onChange={() => toggle(s.uri)} />
    <span><strong>{s.label}</strong>{relatedBy.has(s.uri) && <small>≈ {relatedBy.get(s.uri)}</small>}<small className="posting-from">{t('from “{line}”', { line: s.from })}</small></span>
  </label></li>)}</ul>;
  const build = (found ?? []).filter((s) => !heldUris.has(s.uri) && !relatedBy.has(s.uri));
  const close = (found ?? []).filter((s) => relatedBy.has(s.uri));
  const have = (found ?? []).filter((s) => heldUris.has(s.uri));
  const count = (list: Suggestion[]) => list.filter((s) => ticked.has(s.uri)).length;
  const share = (n: number, total: number) => total ? `${n / total * 100}%` : '0%';
  const hasResult = Boolean(found?.length);
  const hasCvResult = Boolean(cvFound);
  const chooseView = (view: ResultView) => { setResultView(view); setShowEntry(false); };

  return <div className="step-body posting-check">
    <section className={`panel posting-entry${hasResult && !showEntry ? ' posting-entry-compact' : ''}`} aria-labelledby="posting-head">
      <div className="posting-entry-head">
        <div><h2 id="posting-head">{t('Job ad')}</h2><p>{hasResult && !showEntry ? t('Ad checked{cv}', { cv: cvText.trim() ? t(' · CV included') : '' }) : t('Paste the duties and requirements. We will find the skills to review.')}</p></div>
        {hasResult && !showEntry
          ? <button type="button" className="secondary-button" onClick={() => setShowEntry(true)}>{t('Edit ad and CV')}</button>
          : <button type="button" className="secondary-button" onClick={() => { setText(sampleAd); setCvText(sampleCvWithHabits); invalidate(); }}>{t('Try a fictional example')}</button>}
      </div>
      {showEntry && <>
      <div className="posting-entry-grid">
        <div className="posting-entry-main">
          <label htmlFor="posting-text">{t('Duties and requirements')}</label>
          <textarea id="posting-text" value={text} onChange={(e) => { setText(e.target.value); invalidate(); }} rows={8} maxLength={20000} placeholder={t('Paste the duties and requirements here')} />
        </div>
        <div className="posting-entry-cv">
          <div><h3>{t('Your CV')}</h3><p>{t('Optional · Compare the skills it shows.')}</p></div>
          <textarea id="cv-box-text" aria-label={t('Your CV')} value={cvText} onChange={(e) => { setCvText(e.target.value); invalidate(); }} rows={7} maxLength={20000} placeholder={t('Paste your experience and skills here')} />
        </div>
      </div>
      <div className="posting-entry-actions">
        <div className="cv-go"><button type="button" className="primary-button" disabled={!text.trim() || status.busy} onClick={check}>{status.busy ? t('Reading…') : t('Check this ad')}</button>
          {(text || cvText || found) && <button type="button" className="text-button" onClick={clear}>{t('Clear')}</button>}</div>
        <p>{t('Contact details are removed before matching. Your text is not stored.')}</p>
      </div>
      </>}
      {status.message && <p className="note posting-status" role={status.busy ? 'status' : 'alert'}>{t(status.message)}</p>}
    </section>

    {hasResult && <section className="panel posting-result" aria-labelledby="posting-result-head">
      <div className="posting-result-heading journey-action-heading"><div><h2 id="posting-result-head">{t('Your ad at a glance')}</h2><p className="note">{t('AI-matched skills. Check the matches before relying on this result.')}</p></div>
        {onNext && <div className="journey-next-action"><button type="button" className="primary-button" onClick={() => onNext(closest?.role.id ?? null)}>{t('Next: Your plan')}</button></div>}
      </div>
      <div className="posting-result-counts" aria-label={t('Skill summary')}>
        <div><strong>{cmp.total}</strong><span>{t('From this ad')}</span></div>
        {profile.held.size > 0 && <><div><strong>{cmp.matched.length}</strong><span>{t('You have')}</span></div><div><strong>{cmp.transferable.length}</strong><span>{t('Related')}</span></div><div><strong>{cmp.missing.length}</strong><span>{t('To build')}</span></div></>}
      </div>
      {profile.held.size > 0 && cmp.total > 0 && <div className="posting-fit-bar" role="img" aria-label={t('{held} held, {related} related, {missing} to build', { held: cmp.matched.length, related: cmp.transferable.length, missing: cmp.missing.length })}>
        <span className="posting-fit-held" style={{ width: `${cmp.matched.length / cmp.total * 100}%` }} /><span className="posting-fit-related" style={{ width: `${cmp.transferable.length / cmp.total * 100}%` }} /><span className="posting-fit-missing" style={{ width: `${cmp.missing.length / cmp.total * 100}%` }} />
      </div>}
      {profile.held.size === 0 && <div className="empty-state-actions"><button type="button" className="primary-button" onClick={() => onGo('skills')}>{t('Add skills')}</button></div>}
      <nav className="posting-result-nav" aria-label={t('Result sections')}>
        <button type="button" aria-pressed={resultView === 'overview'} onClick={() => chooseView('overview')}>{t('Overview')}</button>
        <button type="button" aria-pressed={resultView === 'skills'} onClick={() => chooseView('skills')}>{t('Review skills')} <span>{found?.length}</span></button>
        {hasCvResult && <button type="button" aria-pressed={resultView === 'cv'} onClick={() => chooseView('cv')}>{t('CV feedback')}</button>}
      </nav>

      {resultView === 'overview' && <div className="posting-overview">
        {closest ? <div className="posting-role" aria-labelledby="posting-role-head">
      <h2 id="posting-role-head">{t('Closest role we track: {role}', { role: roleTitle(closest.role.title) })}</h2>
      <div className="posting-role-overlap">
        <p><strong>{closest.shared.length}</strong> {t('of {n} ad skills overlap with this role', { n: cmp.total })}</p>
        <div className="posting-role-overlap-track" aria-hidden="true"><span style={{ width: share(closest.shared.length, cmp.total) }} /></div>
      </div>
      <div className="detail-facts">
        <span className="fact-d">{demand ? <>{t(demand.group)} {pct(demand.change)}<small><a href={snapshots.q2.source.url} target="_blank" rel="noreferrer">DOSM</a> {t('{a} to {b}', { a: demand.previous, b: demand.current })}</small></> : t('No DOSM data')}</span>
        <span className="fact-r">{resilience ? <><a href={ilo.source.url} target="_blank" rel="noreferrer">{t('ILO exposure {x}', { x: resilience.exposure.toFixed(2) })}</a><small>{resilience.gradient}</small></> : t('No ILO data')}</span>
        <span className="fact-f">{t('{n} essential ESCO skills', { n: closest.role.essentialSkills.length })}<small><a className="esco-link" href={closest.role.escoUri} target="_blank" rel="noreferrer">{t('ESCO occupation {code}', { code: closest.role.isco })}</a></small></span>
      </div>
      <JobLinks title={closest.role.title} />
      {profile.held.size > 0 && <div className="empty-state-actions"><button type="button" className="secondary-button" onClick={() => onGo('moves')}>{t('Compare all roles in Your moves')}</button></div>}
        </div> : <p className="note">{t('No role we track shares enough skills with this ad to compare its demand and AI signals.')}</p>}
        {profile.held.size > 0 && cmp.gaps.length > 0 && <div className="posting-courses" aria-labelledby="posting-courses-head">
      <h2 id="posting-courses-head">{t('Checked courses for these gaps')}</h2>
      {plan.steps.length === 0
        ? <p className="note">{t('No hand-checked course covers these gaps yet.')}</p>
        : <><ol className="plan-order">{plan.steps.slice(0, 1).map((s) => <li key={s.resource.id}><a href={s.resource.url} target="_blank" rel="noreferrer">
          <span className="plan-order-text"><strong>{s.resource.title}</strong><small>{s.resource.provider} · {s.resource.hours === null ? t('time not stated') : t('{n} hours', { n: s.resource.hours })} · {t('Builds')}: {s.closes.map((g) => g.skill.label).join(', ')}</small></span></a></li>)}</ol>
          {plan.steps.length > 1 && <details className="posting-more-courses"><summary>{t('Show all {n} courses', { n: plan.steps.length })}</summary>
            <ol className="plan-order" start={2}>{plan.steps.slice(1).map((s) => <li key={s.resource.id}><a href={s.resource.url} target="_blank" rel="noreferrer">
              <span className="plan-order-text"><strong>{s.resource.title}</strong><small>{s.resource.provider} · {s.resource.hours === null ? t('time not stated') : t('{n} hours', { n: s.resource.hours })} · {t('Builds')}: {s.closes.map((g) => g.skill.label).join(', ')}</small></span></a></li>)}</ol>
          </details>}</>}
      {plan.uncovered.length > 0 && <p className="note">{t('{n} of these skills have no checked course yet.', { n: plan.uncovered.length })}</p>}
        </div>}
        <button type="button" className="secondary-button posting-review-action" onClick={() => chooseView('skills')}>{t('Review the {n} matched skills', { n: found?.length ?? 0 })}</button>
      </div>}

      {resultView === 'skills' && <div className="posting-review" aria-label={t('Review skills')}>
        <p className="note">{t('Untick any AI match that is not in the ad. Counts and the plan update as you review.')}</p>
        {profile.held.size > 0 ? <div className="posting-groups posting-review-groups">
          <div className="posting-group posting-build"><h3>{t('To build')} <span>{count(build)}</span></h3>
            <div className="posting-group-meter" aria-hidden="true"><span style={{ width: share(count(build), cmp.total) }} /></div>
            {build.length ? rows(showAllBuild ? build : build.slice(0, 6)) : <p className="note">{t('Nothing to build.')}</p>}
            {build.length > 6 && <button type="button" className="text-button" aria-expanded={showAllBuild} onClick={() => setShowAllBuild(!showAllBuild)}>{showAllBuild ? t('Show fewer') : t('Show all {n}', { n: build.length })}</button>}
          </div>
          <div className="posting-group posting-related"><h3>{t('Related')} <span>{count(close)}</span></h3>
            <div className="posting-group-meter" aria-hidden="true"><span style={{ width: share(count(close), cmp.total) }} /></div>
            {close.length ? rows(showAllRelated ? close : close.slice(0, 6)) : <p className="note">{t('No related skills in this ad.')}</p>}
            {close.length > 6 && <button type="button" className="text-button" aria-expanded={showAllRelated} onClick={() => setShowAllRelated(!showAllRelated)}>{showAllRelated ? t('Show fewer') : t('Show all {n}', { n: close.length })}</button>}
          </div>
          <div className="posting-group posting-have"><h3>{t('You have')} <span>{count(have)}</span></h3>
            <div className="posting-group-meter" aria-hidden="true"><span style={{ width: share(count(have), cmp.total) }} /></div>
            {have.length ? rows(showAllHave ? have : have.slice(0, 6)) : <p className="note">{t('None of the ticked skills yet.')}</p>}
            {have.length > 6 && <button type="button" className="text-button" aria-expanded={showAllHave} onClick={() => setShowAllHave(!showAllHave)}>{showAllHave ? t('Show fewer') : t('Show all {n}', { n: have.length })}</button>}
          </div>
        </div> : rows(found ?? [])}
      </div>}

      {resultView === 'cv' && gap && <div className="posting-cv" aria-labelledby="posting-cv-head">
        <h2 id="posting-cv-head">{t('Does your CV show these skills?')}</h2>
        <div className="posting-cv-map" role="group" aria-label={t('CV skill summary')}>
          <div className="posting-cv-ring" role="img" aria-label={t('{shown} shown on CV, {add} need CV evidence, {learn} still to learn', { shown: gap.shown.length, add: gap.addToCv.length, learn: gap.notYet.length })} style={{ background: ad.length ? `conic-gradient(#477157 0 ${share(gap.shown.length, ad.length)}, #c59a3f ${share(gap.shown.length, ad.length)} ${share(gap.shown.length + gap.addToCv.length, ad.length)}, #bd705e ${share(gap.shown.length + gap.addToCv.length, ad.length)} 100%)` : '#e8ece9' }}>
            <span className="posting-cv-ring-centre" aria-hidden="true"><strong>{gap.shown.length}<small>/{ad.length}</small></strong><span>{t('Shown on CV')}</span></span>
          </div>
          <div className="posting-cv-map-key" aria-hidden="true">
            <div className="posting-cv-key-add"><span className="posting-cv-key-dot" /><span>{t('Add evidence')}</span><strong>{gap.addToCv.length}</strong></div>
            <div className="posting-cv-key-learn"><span className="posting-cv-key-dot" /><span>{t('Still to learn')}</span><strong>{gap.notYet.length}</strong></div>
          </div>
        </div>
        <div className="posting-cv-layout"><div className="posting-cv-skills">
          {gap.addToCv.length > 0 && <div className="posting-group posting-build"><h3>{t('Add these to your CV')} <span>{gap.addToCv.length}</span></h3>
            <p className="note">{t('Add evidence for these skills only if they are true for you.')}</p>
            <ul className="posting-skills posting-cv-missing-list">{gap.addToCv.map((s) => <li key={s.uri}><details className="posting-card posting-cv-evidence"><summary>{s.label}</summary><small className="posting-from">{t('The ad says “{line}”', { line: (found ?? []).find((f) => f.uri === s.uri)?.from ?? '' })}</small></details></li>)}</ul></div>}
          {gap.notYet.length > 0 && <div className="posting-cv-next"><strong>{gap.notYet.length} {t('skills still to learn')}</strong><button type="button" className="text-button" onClick={() => chooseView('skills')}>{t('Review skills to build')}</button></div>}
          <details className="posting-group posting-cv-shown"><summary>{t('Your CV already shows')} <span>{gap.shown.length}</span></summary>
            {gap.shown.length === 0 ? <p className="note">{t('None of the ticked skills yet.')}</p>
              : <ul className="posting-skills">{gap.shown.map((s) => <li key={s.uri}><div className="posting-card"><strong>{s.label}</strong><small className="posting-from">{t('Your CV says “{line}”', { line: cvSkillBy.get(s.uri)?.from ?? '' })}</small></div></li>)}</ul>}
          </details>
        </div><CvAvoid cvText={cvText} /></div>
      </div>}
    </section>}
  </div>;
}
