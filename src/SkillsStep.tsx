// Step 1: the person's skills, as ESCO skills. Three ways in: a CV (read in the
// browser, lines matched on RunPod; src/CvPanel.tsx), describe your work (RunPod
// skill search, Job B) or pick from the list. Matches use only these.
import type React from 'react';
import { useState } from 'react';
import { allSkills, roles, roleTitle, type Profile } from './data';
import type { Skill } from './scoring';
import { useT } from './i18n';
import { interestData, interestTypes, type InterestType } from './interests';
import { goalStatus, sdgData } from './sdg';
import { CvPanel } from './CvPanel';
import { stripIdentity } from '../server/identity.mjs';
import { GuidedActionDock } from './GuidedActionDock';

const skillByUri = new Map(allSkills.map((s) => [s.uri, s]));

export function SkillsStep({ profile, setProfile, onNext, nextLabel, onCvText, guided = false }: { profile: Profile; setProfile: (p: Profile) => void; onNext: () => void; nextLabel?: string; onCvText?: (text: string) => void; guided?: boolean }) {
  const t = useT();
  const [description, setDescription] = useState('');
  const [found, setFound] = useState<(Skill & { similarity: number })[]>([]);
  const [search, setSearch] = useState<{ busy: boolean; message: string; vars: Record<string, string> }>({ busy: false, message: '', vars: {} });
  const [query, setQuery] = useState('');
  const [showAllHeld, setShowAllHeld] = useState(false);

  const update = (patch: Partial<Profile>) => setProfile({ ...profile, ...patch, persona: null });
  function toggle(skill: Skill) {
    const held = new Set(profile.held);
    const extra = new Map(profile.extra);
    if (held.has(skill.uri)) held.delete(skill.uri);
    else { held.add(skill.uri); if (!skillByUri.has(skill.uri)) extra.set(skill.uri, skill); }
    update({ held, extra });
  }
  function addMany(skills: Skill[]) {
    const held = new Set(profile.held);
    const extra = new Map(profile.extra);
    for (const s of skills) { held.add(s.uri); if (!skillByUri.has(s.uri)) extra.set(s.uri, s); }
    update({ held, extra });
  }

  async function findSkills(e: React.FormEvent) {
    e.preventDefault();
    setFound([]); // clear the previous results so they are not mistaken for this search
    setSearch({ busy: true, message: 'Searching. The first search after a pause can take up to a minute.', vars: {} });
    try {
      // Fairness and privacy: name, age and identity phrases are removed before the text leaves the browser.
      const clean = stripIdentity(description);
      if (!clean.text.trim()) throw new Error('Describe a task you do, for example what you prepare, check or build.');
      const res = await fetch('/api/skill-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: clean.text }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'Skill search is unavailable right now. Pick skills from the list below instead.');
      setFound(body.results);
      setSearch({ busy: false, message: (body.results.length ? 'Closest ESCO skills for “{text}”. Add the ones that are true for you.' : 'No close ESCO skills found. Try describing a task you do often.') + (clean.removed ? ' Personal details (name, age or identity) were left out of the search; they do not describe skills.' : ''), vars: { text: clean.text.trim() } });
    } catch (err) {
      setFound([]);
      setSearch({ busy: false, message: err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Skill search is unavailable right now. Pick skills from the list below instead.', vars: {} });
    }
  }

  const needle = query.trim().toLowerCase();
  const listHits = needle.length >= 2 ? allSkills.filter((s) => s.label.toLowerCase().includes(needle)).slice(0, 12) : [];
  const heldSkills = [...profile.held].map((u) => skillByUri.get(u) ?? profile.extra.get(u)).filter((s): s is Skill => Boolean(s)).sort((a, b) => a.label.localeCompare(b.label));
  const visibleHeld = showAllHeld ? heldSkills : heldSkills.slice(0, 4);
  const currentRole = roles.find((role) => role.id === profile.currentRoleId);
  const currentRoleHeld = currentRole?.essentialSkills.filter((skill) => profile.held.has(skill.uri)).length ?? 0;
  const pick = (s: Skill, extra?: React.ReactNode) => <button type="button" key={s.uri} className={`skill-tag${profile.held.has(s.uri) ? '' : ' skill-add'}`} onClick={() => toggle(s)} aria-pressed={profile.held.has(s.uri)}>
    {profile.held.has(s.uri) ? '✓ ' : '+ '}{s.label}{extra}
  </button>;

  return <div className="step-body skills-body">
    <div className="skills-intake">
    <section className="panel job-panel">
      <div><h2>{t('Your current job')}</h2>
        <p className="note">{t('Shown as “Now” in Your moves.')}</p></div>
      <select value={profile.currentRoleId ?? ''} onChange={(e) => update({ currentRoleId: e.target.value || null })} aria-label={t('Your current job')}>
        <option value="">{t('Not in this list')}</option>
        {roles.map((r) => <option key={r.id} value={r.id}>{roleTitle(r.title)}</option>)}
      </select>
      <div className="manual-search">
        <h3>{t('Search the skill list')}</h3>
        <input type="search" aria-label={t('Search the skill list')} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('Try budget, data or sustainability')} />
        {listHits.length > 0 && <div className="tag-row">{listHits.map((s) => pick(s))}</div>}
      </div>
    </section>

    <div className="skills-main-entry">
    <section className="panel describe-panel">
      <h2>{t('Describe your work')}</h2>
      <p className="note">{t('Describe a task in English, Malay or Chinese.')}</p>
      <form className="skill-search" onSubmit={findSkills}>
        <textarea aria-label={t('Describe your work')} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={2} placeholder={t('e.g. I reconcile bank statements and prepare month-end reports')} />
        <button type="submit" className="primary-button" disabled={search.busy || !description.trim()}>{search.busy ? t('Searching…') : t('Find my skills')}</button>
      </form>
      {search.message && <p className="note" aria-live="polite">{t(search.message, search.vars)}</p>}
      {found.length > 0 && <div className="tag-row">{found.map((s) => pick(s, <small>{t('match {n}%', { n: Math.round(s.similarity * 100) })}</small>))}</div>}
    </section>
    <CvPanel held={profile.held} onAdd={addMany} onText={onCvText} />
    </div>

    </div>

    <section className="panel selected-skills">
      <div className="skills-summary-main">
        <h2>{t('Your skills')}</h2>
        <div className="skills-overview">
          <div className="skills-total"><strong>{heldSkills.length}</strong><span>{t('skills selected')}</span></div>
          {currentRole && <div className="skills-coverage">
            <div className="skills-coverage-label"><span>{t('Essential skills for {role}', { role: roleTitle(currentRole.title) })}</span><strong>{currentRoleHeld} / {currentRole.essentialSkills.length}</strong></div>
            <div className="skills-coverage-track" role="img" aria-label={t('{held} of {total} essential skills selected for {role}', { held: currentRoleHeld, total: currentRole.essentialSkills.length, role: roleTitle(currentRole.title) })}>
              <span style={{ width: `${currentRoleHeld / currentRole.essentialSkills.length * 100}%` }} />
            </div>
          </div>}
        </div>
        {heldSkills.length === 0 ? <p className="note">{t('No skills yet. Describe your work or search the list above.')}</p>
          : <div className="tag-row">{visibleHeld.map((s) => <button type="button" key={s.uri} className="skill-tag removable" onClick={() => toggle(s)} aria-label={t('Remove {skill}', { skill: s.label })}>{s.label} <span aria-hidden="true">✕</span></button>)}</div>}
        {heldSkills.length > 4 && <button type="button" className="text-button" aria-expanded={showAllHeld} onClick={() => setShowAllHeld(!showAllHeld)}>{showAllHeld ? t('Show fewer') : t('Show all {n}', { n: heldSkills.length })}</button>}
      </div>
      {!guided && <div className="journey-next-action">
        <button type="button" className="primary-button" onClick={onNext} disabled={heldSkills.length === 0}>{t(nextLabel ?? 'See my moves')}</button>
        {heldSkills.length === 0 && <span className="note">{t('Add at least one skill first.')}</span>}
      </div>}
    </section>

    <section className="skills-preferences" aria-labelledby="preferences-title">
      <div className="skills-preferences-head">
        <h2 id="preferences-title">{t('Personalise your moves')} <span className="optional-badge">{t('optional')}</span></h2>
        <p className="note">{t('These choices only affect ranking when you turn them on in Your moves.')}</p>
      </div>
      <div className="preferences-grid">
    <div className="panel preference-panel" role="group" aria-labelledby="enjoy">
      <h2 id="enjoy">{t('What kind of work do you enjoy?')}</h2>
      <p className="note">{t('Choose up to two. Turn on Interests in Your moves to use them in ranking.')}</p>
      <div className="choice-list">{interestTypes.map((type) => {
        const on = profile.interests.includes(type);
        const full = !on && profile.interests.length >= 2;
        return <button type="button" key={type} className={`interest-choice${on ? ' on' : ''}`} aria-pressed={on} disabled={full}
          onClick={() => update({ interests: on ? profile.interests.filter((x) => x !== type) : [...profile.interests, type] as InterestType[] })}>
          <span className="tick" aria-hidden="true">{on ? '✓' : ''}</span>
          <span><strong>{t(interestData.types[type].plain)}</strong><small>{t(interestData.types[type].name)}</small></span>
        </button>;
      })}</div>
    </div>
    <div className="panel preference-panel" role="group" aria-labelledby="contribute">
      <h2 id="contribute">{t('What do you want your work to contribute to?')}</h2>
      <p className="note">{t('Choose up to two UN goals. Turn on Goals in Your moves to use them in ranking.')}</p>
      <div className="choice-list">{sdgData.pickerGoals.map((g) => {
        const info = sdgData.goals[g];
        const status = goalStatus(roles, g);
        const on = profile.goals.includes(g);
        const full = !on && profile.goals.length >= 2;
        return <button type="button" key={g} className={`interest-choice goal-choice${on ? ' on' : ''}`} aria-pressed={on} disabled={full || (status !== 'strong' && !on)}
          title={status === 'strong' ? undefined : t('Matching depends on the skills of the nine roles; more roles or skills could add links.')}
          onClick={() => update({ goals: on ? profile.goals.filter((x) => x !== g) : [...profile.goals, g] })}>
          <span className="tick" aria-hidden="true">{on ? '✓' : ''}</span>
          <span className="sdg-square" style={{ background: info.colour }}>{g}</span>
          <span><strong>{t(info.short)}</strong>{status === 'strong' ? (info.short !== info.name && <small>{t(info.name)}</small>) : <small>{status === 'possible' ? t('Only possible matches so far') : t('No strong match yet')}</small>}</span>
        </button>;
      })}</div>
      </div>
      </div>
    </section>
    {guided && <GuidedActionDock note={heldSkills.length === 0 ? t('Add at least one skill first.') : undefined}>
      <button type="button" className="primary-button" onClick={onNext} disabled={heldSkills.length === 0}>{t(nextLabel ?? 'See my moves')}</button>
    </GuidedActionDock>}
  </div>;
}
