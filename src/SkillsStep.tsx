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

const skillByUri = new Map(allSkills.map((s) => [s.uri, s]));

export function SkillsStep({ profile, setProfile, onNext }: { profile: Profile; setProfile: (p: Profile) => void; onNext: () => void }) {
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
      const res = await fetch('/api/skill-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: description }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'Skill search is unavailable right now. Pick skills from the list below instead.');
      setFound(body.results);
      setSearch({ busy: false, message: body.results.length ? 'Closest ESCO skills for “{text}”. Add the ones that are true for you.' : 'No close ESCO skills found. Try describing a task you do often.', vars: { text: description.trim() } });
    } catch (err) {
      setFound([]);
      setSearch({ busy: false, message: err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Skill search is unavailable right now. Pick skills from the list below instead.', vars: {} });
    }
  }

  const needle = query.trim().toLowerCase();
  const listHits = needle.length >= 2 ? allSkills.filter((s) => s.label.toLowerCase().includes(needle)).slice(0, 12) : [];
  const heldSkills = [...profile.held].map((u) => skillByUri.get(u) ?? profile.extra.get(u)).filter((s): s is Skill => Boolean(s)).sort((a, b) => a.label.localeCompare(b.label));
  const visibleHeld = showAllHeld ? heldSkills : heldSkills.slice(0, 8);
  const pick = (s: Skill, extra?: React.ReactNode) => <button type="button" key={s.uri} className={`skill-tag${profile.held.has(s.uri) ? '' : ' skill-add'}`} onClick={() => toggle(s)} aria-pressed={profile.held.has(s.uri)}>
    {profile.held.has(s.uri) ? '✓ ' : '+ '}{s.label}{extra}
  </button>;

  return <div className="step-body skills-body">
    <CvPanel held={profile.held} onAdd={addMany} />
    <div className="skills-intake">
    <section className="panel job-panel">
      <div><h2>{t('Your current job')}</h2>
        <p className="note">{t('Shown as “Now” for comparison, outside the ranking.')}</p></div>
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

    <section className="panel describe-panel">
      <h2>{t('Describe your work')}</h2>
      <p className="note">{t('Write in English, Bahasa Malaysia or Chinese. AI suggests existing ESCO skills; you choose which to add.')}</p>
      <form className="skill-search" onSubmit={findSkills}>
        <textarea aria-label={t('Describe your work')} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={2} placeholder={t('e.g. I reconcile bank statements and prepare month-end reports')} />
        <button type="submit" className="primary-button" disabled={search.busy || !description.trim()}>{search.busy ? t('Searching…') : t('Find my skills')}</button>
      </form>
      {search.message && <p className="note" aria-live="polite">{t(search.message, search.vars)}</p>}
      {found.length > 0 && <div className="tag-row">{found.map((s) => pick(s, <small>{t('match {n}%', { n: Math.round(s.similarity * 100) })}</small>))}</div>}
    </section>

    </div>

    <section className="panel profile-trio selected-skills">
    <div className="trio-cols">
    <div className="trio-col">
      <h2>{t('Your skills')} <span className="count">{heldSkills.length}</span></h2>
      {heldSkills.length === 0 ? <p className="note">{t('No skills yet. Describe your work or search the list above.')}</p>
        : <div className="tag-row">{visibleHeld.map((s) => <button type="button" key={s.uri} className="skill-tag removable" onClick={() => toggle(s)} aria-label={t('Remove {skill}', { skill: s.label })}>{s.label} <span aria-hidden="true">✕</span></button>)}</div>}
      {heldSkills.length > 8 && <button type="button" className="text-button" aria-expanded={showAllHeld} onClick={() => setShowAllHeld(!showAllHeld)}>{showAllHeld ? t('Show fewer') : t('Show all {n}', { n: heldSkills.length })}</button>}
    </div>
    <div className="trio-col" role="group" aria-labelledby="enjoy">
      <h2 id="enjoy">{t('What kind of work do you enjoy?')} <span className="count">{t('optional')}</span></h2>
      <p className="note">{t('Pick up to two. They only change your ranking if you switch them on in Your moves.')}</p>
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
    <div className="trio-col" role="group" aria-labelledby="contribute">
      <h2 id="contribute">{t('What do you want your work to contribute to?')} <span className="count">{t('optional')}</span></h2>
      <p className="note">{t('UN Sustainable Development Goals. Pick up to two. They only change your ranking if you switch them on in Your moves.')}</p>
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
      <div className="step-actions">
        <button type="button" className="primary-button" onClick={onNext} disabled={heldSkills.length === 0}>{t('See my moves')}</button>
        {heldSkills.length === 0 && <span className="note">{t('Add at least one skill first.')}</span>}
      </div>
    </section>
  </div>;
}
