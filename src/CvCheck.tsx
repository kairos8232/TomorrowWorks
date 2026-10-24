// Check my CV: paste a CV and see the plain-rule checks from src/cvChecks.ts (via CvAvoid).
// For anyone, no job ad needed. Runs in the browser only: no RunPod call, nothing stored.
// "Compare with a job ad" hands the text to Check a job ad, where the CV is compared with an ad.
import { useState } from 'react';
import { CvAvoid } from './CvAvoid';
import { useT } from './i18n';
import { sampleCvWithHabits } from './sampleCv';

export function CvCheck({ onCompare }: { onCompare: (cvText: string) => void }) {
  const t = useT();
  const [text, setText] = useState('');
  const has = text.trim().length > 0;
  return <div className={`step-body cv-check${has ? ' cv-check-has-text' : ''}`}>
    <section className="panel cv-check-entry" aria-labelledby="cv-check-head">
      <div className="posting-entry-head">
        <div><h2 id="cv-check-head">{t('Your CV')}</h2><p>{t('Paste the text of your CV. The checks run on this page; nothing is sent or stored.')}</p></div>
        <button type="button" className="secondary-button" onClick={() => setText(sampleCvWithHabits)}>{t('Try a fictional example')}</button>
      </div>
      <textarea id="cv-check-text" aria-labelledby="cv-check-head" value={text} onChange={(e) => setText(e.target.value)} rows={10} maxLength={20000} placeholder={t('Paste your experience and skills here')} />
      <div className="cv-go">
        <button type="button" className="primary-button" disabled={!has} onClick={() => onCompare(text)}>{t('Compare with a job ad')}</button>
        {has && <button type="button" className="text-button" onClick={() => setText('')}>{t('Clear')}</button>}
      </div>
    </section>
    {has && <CvAvoid cvText={text} />}
  </div>;
}
