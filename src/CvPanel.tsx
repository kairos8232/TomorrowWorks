// "Start from your CV" (Skills profile intake). The CV is read in the browser and
// never stored. Contact details are removed first (src/cv.ts); the person sees the
// remaining lines and can remove any before they are sent once to /api/cv-skills,
// which matches each line to existing ESCO skills on RunPod (Job B). Nothing is
// added until the person ticks the skills that are true for them.
import { useRef, useState } from 'react';
import type { Skill } from './scoring';
import { useT } from './i18n';
import { cvLines, readCvFile } from './cv';
import { sampleCv } from './sampleCv';

type Suggestion = Skill & { similarity: number; from: string };

export function CvPanel({ held, onAdd, onText }: { held: ReadonlySet<string>; onAdd: (skills: Skill[]) => void; onText?: (text: string) => void }) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [removed, setRemoved] = useState(0);
  const [identity, setIdentity] = useState(0);
  const [source, setSource] = useState('');
  const [paste, setPaste] = useState<string | null>(null);
  const [found, setFound] = useState<Suggestion[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<{ busy: boolean; message: string; vars: Record<string, string | number> }>({ busy: false, message: '', vars: {} });

  function load(text: string, name: string) {
    const out = cvLines(text);
    onText?.(text);   // lets the fresh-graduate path reuse the CV in the ad step (kept in memory only)
    setLines(out.lines); setRemoved(out.contactRemoved); setIdentity(out.identityRemoved); setSource(name);
    setFound([]); setPicked(new Set()); setPaste(null);
    setStatus({ busy: false, message: out.lines.length ? '' : 'No work lines found. Paste the text of your experience instead.', vars: {} });
  }
  async function onFile(file: File | undefined) {
    if (!file) return;
    setStatus({ busy: true, message: 'Reading your file…', vars: {} });
    try { load(await readCvFile(file), file.name); }
    catch (err) { setStatus({ busy: false, message: err instanceof Error ? err.message : 'Could not read this file. Paste the text instead.', vars: {} }); }
    if (fileRef.current) fileRef.current.value = '';
  }
  function clear() { onText?.(''); setLines([]); setRemoved(0); setIdentity(0); setSource(''); setFound([]); setPicked(new Set()); setPaste(null); setStatus({ busy: false, message: '', vars: {} }); }

  async function match() {
    setFound([]); setPicked(new Set());
    setStatus({ busy: true, message: 'Matching your CV. The first search after a pause can take up to a minute.', vars: {} });
    try {
      const res = await fetch('/api/cv-skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'CV matching is unavailable right now. Pick skills from the list instead.');
      setFound(body.results);
      setStatus({ busy: false, message: body.results.length ? 'Tick the skills that are true for you, then add them.' : 'No close ESCO skills found. Try describing your work instead.', vars: {} });
    } catch (err) {
      setStatus({ busy: false, message: err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'CV matching is unavailable right now. Pick skills from the list instead.', vars: {} });
    }
  }
  const toggle = (uri: string) => { const next = new Set(picked); if (next.has(uri)) next.delete(uri); else next.add(uri); setPicked(next); };
  const fresh = found.filter((s) => !held.has(s.uri));
  function add() {
    onAdd(found.filter((s) => picked.has(s.uri)).map(({ uri, label, type, green, digital }) => ({ uri, label, type, green: Boolean(green), digital: Boolean(digital) })));
    setStatus({ busy: false, message: '{n} skills added to Your skills.', vars: { n: picked.size } });
    setPicked(new Set());
  }

  return <section className="panel cv-panel" aria-labelledby="cv-head">
    <div className="cv-head">
      <div>
        <h2 id="cv-head">{t('Add skills from a CV')} <span className="optional-badge">{t('optional')}</span></h2>
        <p className="note">{t('Review work lines before sending them for skill matching. Contact details are removed; the file is never stored.')}</p>
      </div>
      <div className="cv-actions">
        <input ref={fileRef} type="file" accept=".pdf,.txt,application/pdf,text/plain" className="visually-hidden" id="cv-file" onChange={(e) => onFile(e.target.files?.[0])} />
        <label htmlFor="cv-file" className="primary-button cv-upload">{t('Choose CV file')}</label>
        <button type="button" className="secondary-button" onClick={() => setPaste(paste === null ? '' : null)} aria-expanded={paste !== null}>{t('Paste text')}</button>
        <button type="button" className="text-button" onClick={() => load(sampleCv, t('Fictional sample CV'))}>{t('Try a fictional CV')}</button>
      </div>
    </div>

    {paste !== null && <div className="cv-paste">
      <textarea aria-label={t('Paste your CV text')} value={paste} onChange={(e) => setPaste(e.target.value)} rows={5} maxLength={20000} placeholder={t('Paste your experience and skills here')} />
      <button type="button" className="primary-button" disabled={!paste.trim()} onClick={() => load(paste, t('Pasted text'))}>{t('Use this text')}</button>
    </div>}

    {lines.length > 0 && found.length === 0 && <div className="cv-lines">
      <p className="cv-summary"><strong>{source}</strong>: {t('{n} lines to match', { n: lines.length })}{removed > 0 && <> · {t('{n} contact lines removed', { n: removed })}</>}{identity > 0 && <> · {t('{n} personal details removed (name, age or identity)', { n: identity })}</>}</p>
      <details>
        <summary>{t('Check what will be sent')}</summary>
        <ul>{lines.map((l, i) => <li key={l}><span>{l}</span><button type="button" className="text-button" aria-label={t('Remove line: {line}', { line: l })} onClick={() => setLines(lines.filter((_, k) => k !== i))}>✕</button></li>)}</ul>
      </details>
      <div className="cv-go">
        <button type="button" className="primary-button" disabled={status.busy} onClick={match}>{status.busy ? t('Matching…') : t('Find skills in my CV')}</button>
        <button type="button" className="text-button" onClick={clear}>{t('Clear')}</button>
      </div>
    </div>}

    {status.message && <p className="note" aria-live="polite">{t(status.message, status.vars)}</p>}

    {found.length > 0 && <div className="cv-results">
      <ul>{found.map((s) => {
        const have = held.has(s.uri);
        return <li key={s.uri} className={have ? 'have' : ''}>
          <label>
            <input type="checkbox" checked={have || picked.has(s.uri)} disabled={have} onChange={() => toggle(s.uri)} />
            <span><strong>{s.label}</strong> <small>{have ? t('already in your skills') : t('match {n}%', { n: Math.round(s.similarity * 100) })}</small>
              <small className="cv-from">{t('from “{line}”', { line: s.from })}</small></span>
          </label>
        </li>;
      })}</ul>
      <div className="cv-go">
        <button type="button" className="primary-button" disabled={picked.size === 0} onClick={add}>{t('Add {n} selected skills', { n: picked.size })}</button>
        {fresh.length > 0 && <button type="button" className="text-button" onClick={() => setPicked(new Set(fresh.map((s) => s.uri)))}>{t('Tick all')}</button>}
        <button type="button" className="text-button" onClick={clear}>{t('Clear')}</button>
      </div>
    </div>}
  </section>;
}
