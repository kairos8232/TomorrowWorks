// Public Demand and Outlook views: one compact table each, with the source
// stated once underneath instead of on every row.
import { useEffect, useState } from 'react';
import { useDataSaver } from './dataSaver';
import dosmQ1 from '../data/sources/dosm-jmi-2026-q1.json';
import dosmQ2 from '../data/sources/dosm-jmi-2026-q2.json';
import { aeiData, aiViews, msData, roleSoc } from './aiviews';
import iloFile from '../data/sources/ilo-genai-exposure-2025.json';
import rolesFile from '../data/roles.json';
import lfsFile from '../data/sources/opendosm-lfs-month.json';
import { useLang, useT, useTx } from './i18n';

const pct = (now: number, before: number) => {
  const change = ((now - before) / before) * 100;
  return `${change >= 0 ? '+' : '−'}${Math.abs(change).toFixed(1)}%`;
};

type LfsMonth = { date: string; u_rate: number; lf_employed: number; lf_unemployed: number };
const locale = { en: 'en-MY', ms: 'ms-MY', zh: 'zh-CN' } as const;
const monthName = (d: string, lang: keyof typeof locale) => new Date(d).toLocaleDateString(locale[lang], { month: 'long', year: 'numeric' });

/** Latest monthly unemployment rate (OpenDOSM), shown as context above the job-ad table. */
function LabourContext() {
  const t = useT();
  const tx = useTx();
  const lang = useLang();
  // Snapshot first; the server refreshes it daily from OpenDOSM until 1 Nov (server/lfs.mjs).
  const [lfs, setLfs] = useState<{ source: typeof lfsFile.source; months: LfsMonth[]; live?: boolean }>({ source: lfsFile.source, months: lfsFile.months as LfsMonth[] });
  const saver = useDataSaver();   // data saver: keep the bundled snapshot, no request
  useEffect(() => { if (saver) return; fetch('/api/lfs').then((r) => (r.ok ? r.json() : null)).then((body) => { if (body?.months?.length) setLfs(body); }).catch(() => {}); }, [saver]);
  const months = lfs.months;
  if (months.length === 0) return null;
  const [latest] = months;
  const yearAgo = months.find((m) => m.date.slice(0, 4) === String(Number(latest.date.slice(0, 4)) - 1) && m.date.slice(5, 7) === latest.date.slice(5, 7));
  return <div className="labour-context">
    <p>{tx('{rate} unemployment in {month}.', { rate: <strong>{latest.u_rate}%</strong>, month: monthName(latest.date, lang) })}{yearAgo ? ` ${t('{rate}% a year earlier.', { rate: yearAgo.u_rate })}` : ''} {t('{n} thousand people employed.', { n: Math.round(latest.lf_employed).toLocaleString() })}</p>
    <p className="note">{tx('Labour Force Survey, a different measure from job ads below. Source: {src}, retrieved {date}, CC BY 4.0.', { src: <a href={lfs.source.url} target="_blank" rel="noreferrer">OpenDOSM</a>, date: lfs.source.retrievedAt })}</p>
  </div>;
}

export function DemandTable({ onCheckAd }: { onCheckAd?: () => void }) {
  const t = useT();
  const tx = useTx();
  const rows = dosmQ2.occupationMajorGroups.filter((g) => g.iscoMajorGroup && g.quarterly['2026-Q1'] != null && g.quarterly['2026-Q2'] != null);
  const src = dosmQ2.source;
  return <section className="data-table" aria-label="Online job ads by occupation group">
    {onCheckAd && <p className="demand-cta">{t('Applying for a job?')} <button type="button" className="text-button" onClick={onCheckAd}>{t('Check an ad against your CV')}</button></p>}
    <LabourContext />
    <p className="table-scroll-hint">{t('Swipe sideways to see all columns.')}</p>
    <table>
      <thead><tr><th>{t('Occupation group')}</th><th className="num">Q1 2026</th><th className="num">Q2 2026</th><th className="num">{t('Change')}</th></tr></thead>
      <tbody>{rows.map((g) => {
        const before = g.quarterly['2026-Q1'] as number;
        const now = g.quarterly['2026-Q2'] as number;
        return <tr key={g.label}><td>{t(g.label)}</td><td className="num">{before.toLocaleString()}</td><td className="num">{now.toLocaleString()}</td><td className={`num ${now >= before ? 'up' : 'down'}`}>{pct(now, before)}</td></tr>;
      })}</tbody>
    </table>
    <p className="note">{tx('Source: {src}, published {date} (Q1 data: {q1}). Counts online job ads across all industries, not every vacancy in Malaysia.', { src: <a href={src.url} target="_blank" rel="noreferrer">{src.name}</a>, date: src.publishedAt, q1: dosmQ1.source.publishedAt })}</p>
  </section>;
}

export function OutlookTable() {
  const t = useT();
  const tx = useTx();
  const rows = rolesFile.roles.map((r) => ({ role: r, v: aiViews(r) })).filter((r) => r.v.ilo).sort((a, b) => b.v.ilo!.mean - a.v.ilo!.mean);
  const aeiReady = aeiData.occupations.length > 0;
  const level = (x: number) => (x >= 0.55 ? 'high' : x >= 0.4 ? 'mid' : 'low');
  return <section className="data-table ai-views" aria-label="Three views of AI impact by role">
    <p className="ai-views-intro">{t('Three independent views of how AI affects each role. Where they disagree, the 1,000 futures in Your moves try each view.')}</p>
    <p className="table-scroll-hint">{t('Swipe sideways to see all columns.')}</p>
    <table>
      <thead><tr>
        <th>{t('Role')}</th>
        <th className="num">{t('Could change')}<small>ILO</small></th>
        <th className="num">{t('AI applicable')}<small>Microsoft</small></th>
        <th className="num">{t('Used with AI today')}<small>Anthropic</small></th>
        <th>{t('How AI is used')}<small>Anthropic</small></th>
      </tr></thead>
      <tbody>{rows.map(({ role, v }) => <tr key={role.id}>
        <td className="cap">{role.title}<small className="soc">SOC {roleSoc.roles[role.id]?.soc}</small></td>
        <td className="num"><span className={`ai-dot ${level(v.ilo!.mean)}`} />{v.ilo!.mean.toFixed(2)}<small>± {v.ilo!.sd.toFixed(2)}</small></td>
        <td className="num">{v.ms ? <><span className={`ai-dot ${level(v.ms.onIlo)}`} />{v.ms.score.toFixed(2)}</> : '–'}</td>
        <td className="num">{v.aei ? <><span className={`ai-dot ${level(v.aei.onIlo)}`} />{v.aei.observed.toFixed(2)}</> : '–'}</td>
        <td>{v.aei?.automationShare != null
          ? <span className="auto-split" title={t('{a}% automates the task, {b}% helps the person', { a: Math.round(v.aei.automationShare * 100), b: Math.round((1 - v.aei.automationShare) * 100) })}>
            <span className="bar"><span style={{ width: `${v.aei.automationShare * 100}%` }} /></span>
            {v.aei.automationShare >= 0.5 ? t('Mostly automates') : t('Mostly assists')}</span>
          : '–'}</td>
      </tr>)}</tbody>
    </table>
    <p className="note"><span className="ai-dot high" /> {t('higher')} <span className="ai-dot mid" /> {t('middle')} <span className="ai-dot low" /> {t('lower')}, {t('compared on one scale across all occupations in each source.')}</p>
    <ul className="note ai-sources">
      <li>{tx('ILO: share of tasks generative AI could change, mean ± spread from the source (0 to 1); not a job-loss forecast. {src}, 2025.', { src: <a href={iloFile.source.url} target="_blank" rel="noreferrer">ILO Working Paper 140</a> })}</li>
      <li>{tx('Microsoft: AI applicability from Bing Copilot conversations, United States, January–September 2024. {src}, CC BY 4.0, retrieved {date}.', { src: <a href={msData.source.url} target="_blank" rel="noreferrer">Working with AI</a>, date: msData.source.retrievedAt })}</li>
      <li>{aeiReady
        ? tx('Anthropic: observed exposure and automation vs assistance from Claude conversations. {src}, CC-BY, retrieved {date}.', { src: <a href={aeiData.source.url as string} target="_blank" rel="noreferrer">Anthropic Economic Index</a>, date: aeiData.source.retrievedAt })
        : tx('Anthropic: not imported yet ({src}).', { src: <a href={aeiData.source.url as string} target="_blank" rel="noreferrer">Anthropic Economic Index</a> })}</li>
      <li>{t('Microsoft and Anthropic use US occupation codes (SOC); each role’s code is shown under its name.')}</li>
    </ul>
  </section>;
}
