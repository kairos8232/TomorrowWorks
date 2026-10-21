// Step 1: the person's skills, as ESCO skills. Two ways in: describe your work
// (RunPod skill search, Job B) or pick from the list. Matches use only these.
import type React from 'react';
import { useState } from 'react';
import { allSkills, roles, roleTitle, type Profile } from './data';
import type { Skill } from './scoring';
import { useT } from './i18n';

const skillByUri = new Map(allSkills.map((s) => [s.uri, s]));

export function SkillsStep({ profile, setProfile, onNext }: { profile: Profile; setProfile: (p: Profile) => void; onNext: () => void }) {
  const t = useT();
  const [description, setDescription] = useState('');
  const [found, setFound] = useState<(Skill & { similarity: number })[]>([]);
  const [search, setSearch] = useState<{ busy: boolean; message: string }>({ busy: false, message: '' });
  const [query, setQuery] = useState('');

  const update = (patch: Partial<Profile>) => setProfile({ ...profile, ...patch, persona: null });
  function toggle(skill: Skill) {
    const held = new Set(profile.held);
    const extra = new Map(profile.extra);
    if (held.has(skill.uri)) held.delete(skill.uri);
    else { held.add(skill.uri); if (!skillByUri.has(skill.uri)) extra.set(skill.uri, skill); }
    update({ held, extra });
  }

  async function findSkills(e: React.FormEvent) {
    e.preventDefault();
    setFound([]); // clear the previous results so they are not mistaken for this search
    setSearch({ busy: true, message: 'Searching. The first search after a pause can take up to a minute.' });
    try {
      const res = await fetch('/api/skill-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: description }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'Skill search is unavailable right now. Pick skills from the list below instead.');
      setFound(body.results);
      setSearch({ busy: false, message: body.results.length ? `Closest ESCO skills for “${description.trim()}”. Add the ones that are true for you.` : 'No close ESCO skills found. Try describing a task you do often.' });
    } catch (err) {
      setFound([]);
      setSearch({ busy: false, message: err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Skill search is unavailable right now. Pick skills from the list below instead.' });
    }
  }

  const needle = query.trim().toLowerCase();
  const listHits = needle.length >= 2 ? allSkills.filter((s) => s.label.toLowerCase().includes(needle)).slice(0, 12) : [];
  const heldSkills = [...profile.held].map((u) => skillByUri.get(u) ?? profile.extra.get(u)).filter((s): s is Skill => Boolean(s)).sort((a, b) => a.label.localeCompare(b.label));
  const pick = (s: Skill, extra?: React.ReactNode) => <button type="button" key={s.uri} className={`skill-tag${profile.held.has(s.uri) ? '' : ' skill-add'}`} onClick={() => toggle(s)} aria-pressed={profile.held.has(s.uri)}>
    {profile.held.has(s.uri) ? '✓ ' : '+ '}{s.label}{extra}
  </button>;

  return <div className="step-body">
    <section className="panel">
      <h2>{t('Your current job')}</h2>
      <p className="note">{t('Shown as “Now” so you can compare. It is never recommended back to you.')}</p>
      <select value={profile.currentRoleId ?? ''} onChange={(e) => update({ currentRoleId: e.target.value || null })} aria-label="Your current job">
        <option value="">{t('Not in this list')}</option>
        {roles.map((r) => <option key={r.id} value={r.id}>{roleTitle(r.title)}</option>)}
      </select>
    </section>

    <section className="panel">
      <h2>{t('Describe your work')}</h2>
      <p className="note">{t('In English, Bahasa Malaysia or Chinese. An AI model finds the closest skills in ESCO, the European Commission’s list of 13,960 skills. It only finds existing skills; you decide which are true.')}</p>
      <form className="skill-search" onSubmit={findSkills}>
        <textarea aria-label="Describe your work" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={2} placeholder="e.g. I reconcile bank statements and prepare month-end reports" />
        <button type="submit" className="primary-button" disabled={search.busy || !description.trim()}>{search.busy ? t('Searching…') : t('Find my skills')}</button>
      </form>
      {search.message && <p className="note" aria-live="polite">{search.message}</p>}
      {found.length > 0 && <div className="tag-row">{found.map((s) => pick(s, <small>match {Math.round(s.similarity * 100)}%</small>))}</div>}
      <label className="list-search">{t('Or search the skill list')}<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try budget, data or sustainability" /></label>
      {listHits.length > 0 && <div className="tag-row">{listHits.map((s) => pick(s))}</div>}
    </section>

    <section className="panel">
      <h2>{t('Your skills')} <span className="count">{heldSkills.length}</span></h2>
      {heldSkills.length === 0 ? <p className="note">{t('No skills yet. Describe your work or search the list above.')}</p>
        : <div className="tag-row">{heldSkills.map((s) => <button type="button" key={s.uri} className="skill-tag removable" onClick={() => toggle(s)} aria-label={`Remove ${s.label}`}>{s.label} <span aria-hidden="true">✕</span></button>)}</div>}
    </section>

    <div className="step-actions">
      <button type="button" className="primary-button" onClick={onNext} disabled={heldSkills.length === 0}>{t('See my moves')}</button>
      {heldSkills.length === 0 && <span className="note">{t('Add at least one skill first.')}</span>}
    </div>
  </div>;
}
