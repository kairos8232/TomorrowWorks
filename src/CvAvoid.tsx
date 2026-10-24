// "Things to avoid in your CV" panel for Check an ad. Plain rule checks on the pasted
// text (src/cvChecks.ts) plus a checklist for what only the person can see in the file.
// Checklist items are grouped by source. No score. The text stays in the browser.
import { useMemo, useState } from 'react';
import { CV_MANUAL_CHECKS, CV_SOURCES, checkCvText } from './cvChecks';
import { useT } from './i18n';

export function CvAvoid({ cvText }: { cvText: string }) {
  const t = useT();
  const [done, setDone] = useState<Set<string>>(new Set());
  const findings = useMemo(() => checkCvText(cvText), [cvText]);
  const used = new Set([...findings.map((f) => f.source), ...CV_MANUAL_CHECKS.map((c) => c.source)]);
  const manualSources = [...new Set(CV_MANUAL_CHECKS.map((c) => c.source))];
  const src = (id: string) => <a href={CV_SOURCES[id].url} target="_blank" rel="noreferrer">{t(CV_SOURCES[id].name.split(':')[0])}</a>;
  const toggle = (id: string) => { const next = new Set(done); if (next.has(id)) next.delete(id); else next.add(id); setDone(next); };

  return <><section className="panel cv-avoid" aria-labelledby="cv-avoid-head">
    <div className="cv-avoid-heading"><div><h2 id="cv-avoid-head">{t('CV checks')}</h2><p className="note">{t('Text checks only. Review the file itself too.')}</p></div><strong aria-label={t('{n} text issues to review', { n: findings.length })}>{findings.length}</strong></div>
    {findings.length === 0
      ? <p className="note">{t('Nothing found in the text we can check. Now check the file itself below.')}</p>
      : <ul className="cv-avoid-list">{findings.map((f) => <li key={f.id}>
        <strong>{t(f.message)}</strong>
        <small>{f.evidence.join(' · ')} <span aria-hidden="true">·</span> {src(f.source)}</small>
      </li>)}</ul>}
  </section>
  <section className="panel cv-avoid-file" aria-label={t('Check the file yourself')}>
    <div className="cv-avoid-checklist">
      <div className="cv-avoid-file-head"><div><h2>{t('Check the file yourself')}</h2><p className="note">{t('We cannot see columns, headers or the file type from pasted text.')}</p></div><span aria-label={t('{done} of {total} file checks reviewed', { done: done.size, total: CV_MANUAL_CHECKS.length })}>{done.size}/{CV_MANUAL_CHECKS.length}</span></div>
      <div className="cv-avoid-manual-groups">{manualSources.map((source) => <div className="cv-avoid-manual-group" key={source}>
        <p className="cv-avoid-manual-source">{t('Guidance from')} {src(source)}</p>
        <ul className="cv-avoid-list cv-avoid-manual">{CV_MANUAL_CHECKS.filter((c) => c.source === source).map((c) => <li key={c.id}>
          <label><input type="checkbox" checked={done.has(c.id)} onChange={() => toggle(c.id)} /> <span>{t(c.text)}</span></label>
        </li>)}</ul>
      </div>)}</div>
    </div>

    <div className="cv-avoid-sources"><strong>{t('Sources')}</strong>
      <ul>{[...used].map((id) => <li key={id}><a href={CV_SOURCES[id].url} aria-label={CV_SOURCES[id].name} target="_blank" rel="noreferrer">{t(CV_SOURCES[id].name.split(':')[0])}</a> · {CV_SOURCES[id].date}{CV_SOURCES[id].note ? ` · ${CV_SOURCES[id].note}` : ''}</li>)}</ul>
    </div>
  </section></>;
}
