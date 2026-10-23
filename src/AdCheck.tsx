// "Check an ad" (Job market). The person pastes a job ad; the ad's lines are matched to
// ESCO skills on RunPod (same service as the CV intake, /api/cv-skills) and the person
// ticks the ones that really are in the ad. We then show which of those skills they
// hold, which are close, which to build, the closest of our roles with its demand and
// AI-exposure signals, and checked courses for the gaps. Rule: src/adFit.ts.
// The ad is not stored. No score is made up: only counts and existing signals.
import { useMemo, useState } from 'react';
import { ilo, roles, roleTitle, snapshots, transferable, type Profile } from './data';
import { aiResilience, demandTrend, type Skill } from './scoring';
import { closestRole, compareAd, cvGap } from './adFit';
import { planForGaps, type Resource } from './pathway';
import resourcesFile from '../data/pathway/resources.json';
import { cvLines } from './cv';
import { sampleAd } from './sampleAd';
import { sampleCv } from './sampleCv';
import { JobLinks } from './JobLinks';
import { useT } from './i18n';

const resources = resourcesFile.resources as Resource[];
type Suggestion = Skill & { similarity: number; from: string };
const pct = (x: number) => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(1)}%`;

export function AdCheck({ profile, onGo }: { profile: Profile; onGo: (screen: 'skills' | 'moves') => void }) {
  const t = useT();
  const [text, setText] = useState('');
  const [cvText, setCvText] = useState('');
  const [found, setFound] = useState<Suggestion[] | null>(null);
  const [cvFound, setCvFound] = useState<Suggestion[] | null>(null);
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState({ busy: false, message: '' });

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
    const cvL = cvText.trim() ? cvLines(cvText).lines : [];
    setFound(null); setCvFound(null);
    setStatus({ busy: true, message: 'Reading the ad. The first search after a pause can take up to a minute.' });
    try {
      const results = await match(lines);
      // The CV can show more skills than the default 25, so ask for up to 80: nothing is cut off.
      const cvResults = cvL.length > 0 ? await match(cvL, 80) : null;
      setFound(results); setCvFound(cvResults);
      setTicked(new Set(results.map((s) => s.uri)));
      setStatus({ busy: false, message: results.length ? '' : 'No close ESCO skills found in this ad. Try pasting the duties and requirements.' });
    } catch (err) {
      setStatus({ busy: false, message: err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Ad matching is unavailable right now. Try again in a minute.' });
    }
  }
  const clear = () => { setText(''); setCvText(''); setFound(null); setCvFound(null); setTicked(new Set()); setStatus({ busy: false, message: '' }); };
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
  const rows = (list: Suggestion[]) => <ul className="ad-skills">{list.map((s) => <li key={s.uri}><label>
    <input type="checkbox" checked={ticked.has(s.uri)} onChange={() => toggle(s.uri)} />
    <span><strong>{s.label}</strong>{relatedBy.has(s.uri) && <small>≈ {relatedBy.get(s.uri)}</small>}<small className="ad-from">{t('from “{line}”', { line: s.from })}</small></span>
  </label></li>)}</ul>;
  const build = (found ?? []).filter((s) => !heldUris.has(s.uri) && !relatedBy.has(s.uri));
  const close = (found ?? []).filter((s) => relatedBy.has(s.uri));
  const have = (found ?? []).filter((s) => heldUris.has(s.uri));
  const count = (list: Suggestion[]) => list.filter((s) => ticked.has(s.uri)).length;

  return <div className="step-body ad-check">
    <section className="panel" aria-labelledby="ad-head">
      <h2 id="ad-head">{t('Paste a job ad')}</h2>
      <p className="note">{t('Copy the duties and requirements from any job site. Contact details are removed, and the ad is not stored. Use a fictional ad if you prefer.')}</p>
      <textarea aria-label={t('Paste the job ad text')} value={text} onChange={(e) => setText(e.target.value)} rows={8} maxLength={20000} placeholder={t('Paste the duties and requirements here')} />
      <h3 className="ad-cv-label">{t('Your CV')} <span className="optional-badge">{t('optional')}</span></h3>
      <p className="note">{t('Add your CV to see which of these skills it already shows. Contact details and personal details are removed, and it is not stored.')}</p>
      <textarea aria-label={t('Paste your CV text')} value={cvText} onChange={(e) => setCvText(e.target.value)} rows={5} maxLength={20000} placeholder={t('Paste your experience and skills here')} />
      <div className="cv-go">
        <button type="button" className="primary-button" disabled={!text.trim() || status.busy} onClick={check}>{status.busy ? t('Reading…') : t('Check this ad')}</button>
        <button type="button" className="secondary-button" onClick={() => { setText(sampleAd); setCvText(sampleCv); setFound(null); setCvFound(null); setStatus({ busy: false, message: '' }); }}>{t('Try a fictional example')}</button>
        {(text || cvText || found) && <button type="button" className="text-button" onClick={clear}>{t('Clear')}</button>}
      </div>
      {status.message && <p className="note" aria-live="polite">{t(status.message)}</p>}
    </section>

    {found && found.length > 0 && <section className="panel ad-result" aria-labelledby="ad-result-head">
      <h2 id="ad-result-head">{t('Skills this ad asks for')}</h2>
      <p className="ad-summary">{profile.held.size === 0
        ? t('The ad asks for {n} skills. Add your skills to see how many you already have.', { n: cmp.total })
        : [t('You have {held} of the {total} skills ticked from this ad.', { held: cmp.matched.length, total: cmp.total }),
          cmp.transferable.length > 0 ? t('{n} related skills could help.', { n: cmp.transferable.length }) : null,
          cmp.missing.length > 0 ? t('{n} to build.', { n: cmp.missing.length }) : null].filter(Boolean).join(' ')}</p>
      {profile.held.size === 0 && <div className="empty-state-actions"><button type="button" className="primary-button" onClick={() => onGo('skills')}>{t('Add skills')}</button></div>}
      <p className="note">{t('Skills are matched by AI (BAAI/bge-m3 on RunPod) to the ESCO list. Untick any that are not really in the ad.')}</p>
      {profile.held.size > 0 && <div className="ad-groups">
        <div className="ad-group ad-build"><h3>{t('To build')} <span>{count(build)}</span></h3>{build.length ? rows(build) : <p className="note">{t('Nothing to build.')}</p>}</div>
        {close.length > 0 && <div className="ad-group"><h3>{t('Close to a skill you have')} <span>{count(close)}</span></h3>{rows(close)}</div>}
        <div className="ad-group ad-have"><h3>{t('You have')} <span>{count(have)}</span></h3>{have.length ? rows(have) : <p className="note">{t('None of the ticked skills yet.')}</p>}</div>
      </div>}
      {profile.held.size === 0 && rows(found)}
    </section>}

    {found && found.length > 0 && gap && <section className="panel ad-cv" aria-labelledby="ad-cv-head">
      <h2 id="ad-cv-head">{t('Does your CV show these skills?')}</h2>
      <p className="ad-summary">{t('Your CV shows {a} of the {n} skills ticked from this ad.', { a: gap.shown.length, n: ad.length })}</p>
      <p className="note">{t('Only skills your CV actually says can be seen by a screener, whether a person or software.')}</p>
      <div className="ad-groups">
        {gap.addToCv.length > 0 && <div className="ad-group ad-build"><h3>{t('You have these, but your CV does not show them')} <span>{gap.addToCv.length}</span></h3>
          <ul className="ad-skills">{gap.addToCv.map((s) => <li key={s.uri}><div className="ad-card"><strong>{s.label}</strong><small className="ad-from">{t('The ad says “{line}”', { line: (found ?? []).find((f) => f.uri === s.uri)?.from ?? '' })}</small><small>{t('Add a line about this to your CV.')}</small></div></li>)}</ul></div>}
        {gap.notYet.length > 0 && <div className="ad-group"><h3>{t('Not on your CV or in your skills yet')} <span>{gap.notYet.length}</span></h3>
          <ul className="ad-skills">{gap.notYet.map((s) => <li key={s.uri}><div className="ad-card"><strong>{s.label}</strong><small className="ad-from">{t('The ad says “{line}”', { line: (found ?? []).find((f) => f.uri === s.uri)?.from ?? '' })}</small></div></li>)}</ul></div>}
        <div className="ad-group ad-have"><h3>{t('Your CV already shows')} <span>{gap.shown.length}</span></h3>
          {gap.shown.length === 0 ? <p className="note">{t('None of the ticked skills yet.')}</p>
            : <ul className="ad-skills">{gap.shown.map((s) => <li key={s.uri}><div className="ad-card"><strong>{s.label}</strong><small className="ad-from">{t('Your CV says “{line}”', { line: cvSkillBy.get(s.uri)?.from ?? '' })}</small></div></li>)}</ul>}</div>
      </div>
      {profile.held.size === 0 && gap.notYet.length > 0 && <div className="empty-state-actions"><button type="button" className="secondary-button" onClick={() => onGo('skills')}>{t('Add your skills')}</button></div>}
    </section>}

    {found && found.length > 0 && closest && <section className="panel ad-role" aria-labelledby="ad-role-head">
      <h2 id="ad-role-head">{t('Closest role we track: {role}', { role: roleTitle(closest.role.title) })}</h2>
      <p className="note">{t('This ad shares {n} skills with it. The signals below are the same ones used in Your moves.', { n: closest.shared.length })}</p>
      <div className="detail-facts">
        <span className="fact-d">{demand ? <>{t(demand.group)} {pct(demand.change)}<small><a href={snapshots.q2.source.url} target="_blank" rel="noreferrer">DOSM</a> {t('{a} to {b}', { a: demand.previous, b: demand.current })}</small></> : t('No DOSM data')}</span>
        <span className="fact-r">{resilience ? <><a href={ilo.source.url} target="_blank" rel="noreferrer">{t('ILO exposure {x}', { x: resilience.exposure.toFixed(2) })}</a><small>{resilience.gradient}</small></> : t('No ILO data')}</span>
        <span className="fact-f">{t('{n} essential ESCO skills', { n: closest.role.essentialSkills.length })}<small><a className="esco-link" href={closest.role.escoUri} target="_blank" rel="noreferrer">{t('ESCO occupation {code}', { code: closest.role.isco })}</a></small></span>
      </div>
      <JobLinks title={closest.role.title} />
      {profile.held.size > 0 && <div className="empty-state-actions"><button type="button" className="secondary-button" onClick={() => onGo('moves')}>{t('Compare all roles in Your moves')}</button></div>}
    </section>}

    {found && found.length > 0 && closest === null && <section className="panel"><p className="note">{t('No role we track shares enough skills with this ad to compare its demand and AI signals.')}</p></section>}

    {found && found.length > 0 && profile.held.size > 0 && cmp.gaps.length > 0 && <section className="panel ad-courses" aria-labelledby="ad-courses-head">
      <h2 id="ad-courses-head">{t('Checked courses for these gaps')}</h2>
      {plan.steps.length === 0
        ? <p className="note">{t('No hand-checked course covers these gaps yet.')}</p>
        : <ol className="plan-order">{plan.steps.map((s) => <li key={s.resource.id}><a href={s.resource.url} target="_blank" rel="noreferrer">
          <span className="plan-order-text"><strong>{s.resource.title}</strong><small>{s.resource.provider} · {s.resource.hours === null ? t('time not stated') : t('{n} hours', { n: s.resource.hours })} · {t('Builds')}: {s.closes.map((g) => g.skill.label).join(', ')}</small></span></a></li>)}</ol>}
      {plan.uncovered.length > 0 && <p className="note">{t('{n} of these skills have no checked course yet.', { n: plan.uncovered.length })}</p>}
    </section>}
  </div>;
}
