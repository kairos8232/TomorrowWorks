// Public Demand and Outlook views: one compact table each, with the source
// stated once underneath instead of on every row.
import dosmQ1 from '../data/sources/dosm-jmi-2026-q1.json';
import dosmQ2 from '../data/sources/dosm-jmi-2026-q2.json';
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
  const months = lfsFile.months as LfsMonth[];
  if (months.length === 0) return null;
  const [latest] = months;
  const yearAgo = months.find((m) => m.date.slice(0, 4) === String(Number(latest.date.slice(0, 4)) - 1) && m.date.slice(5, 7) === latest.date.slice(5, 7));
  return <div className="labour-context">
    <p>{tx('{rate} unemployment in {month}.', { rate: <strong>{latest.u_rate}%</strong>, month: monthName(latest.date, lang) })}{yearAgo ? ` ${t('{rate}% a year earlier.', { rate: yearAgo.u_rate })}` : ''} {t('{n} thousand people employed.', { n: Math.round(latest.lf_employed).toLocaleString() })}</p>
    <p className="note">{tx('Labour Force Survey, a different measure from job ads below. Source: {src}, retrieved {date}, CC BY 4.0.', { src: <a href={lfsFile.source.url} target="_blank" rel="noreferrer">OpenDOSM</a>, date: lfsFile.source.retrievedAt })}</p>
  </div>;
}

export function DemandTable() {
  const t = useT();
  const tx = useTx();
  const rows = dosmQ2.occupationMajorGroups.filter((g) => g.iscoMajorGroup && g.quarterly['2026-Q1'] != null && g.quarterly['2026-Q2'] != null);
  const src = dosmQ2.source;
  return <section className="data-table" aria-label="Online job ads by occupation group">
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
  const occ = new Map(iloFile.occupations.map((o) => [o.isco, o]));
  const rows = rolesFile.roles.map((r) => ({ role: r, ilo: occ.get(r.isco) })).filter((r) => r.ilo).sort((a, b) => b.ilo!.mean - a.ilo!.mean);
  return <section className="data-table" aria-label="Generative AI exposure by role">
    <p className="table-scroll-hint">{t('Swipe sideways to see all columns.')}</p>
    <table>
      <thead><tr><th>{t('Role')}</th><th className="num">ISCO</th><th className="num">{t('Exposure')}</th><th>{t('ILO gradient')}</th></tr></thead>
      <tbody>{rows.map(({ role, ilo }) => <tr key={role.id}><td className="cap">{role.title}</td><td className="num">{role.isco}</td><td className="num">{ilo!.mean.toFixed(2)}</td><td>{ilo!.gradient}</td></tr>)}</tbody>
    </table>
    <p className="note">{tx('Exposure is the average share of a role’s tasks that generative AI could change (0 to 1). It does not predict job loss. Source: {src}, 2025.', { src: <a href={iloFile.source.url} target="_blank" rel="noreferrer">ILO Working Paper 140</a> })}</p>
  </section>;
}
