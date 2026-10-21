// Public Demand and Outlook views: one compact table each, with the source
// stated once underneath instead of on every row.
import dosmQ1 from '../data/sources/dosm-jmi-2026-q1.json';
import dosmQ2 from '../data/sources/dosm-jmi-2026-q2.json';
import iloFile from '../data/sources/ilo-genai-exposure-2025.json';
import rolesFile from '../data/roles.json';
import lfsFile from '../data/sources/opendosm-lfs-month.json';

const pct = (now: number, before: number) => {
  const change = ((now - before) / before) * 100;
  return `${change >= 0 ? '+' : '−'}${Math.abs(change).toFixed(1)}%`;
};

type LfsMonth = { date: string; u_rate: number; lf_employed: number; lf_unemployed: number };
const monthName = (d: string) => new Date(d).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });

/** Latest monthly unemployment rate (OpenDOSM), shown as context above the job-ad table. */
function LabourContext() {
  const months = lfsFile.months as LfsMonth[];
  if (months.length === 0) return null;
  const [latest] = months;
  const yearAgo = months.find((m) => m.date.slice(0, 4) === String(Number(latest.date.slice(0, 4)) - 1) && m.date.slice(5, 7) === latest.date.slice(5, 7));
  return <div className="labour-context">
    <p><strong>{latest.u_rate}%</strong> unemployment in {monthName(latest.date)}{yearAgo ? `, ${yearAgo.u_rate}% a year earlier` : ''}. {Math.round(latest.lf_employed).toLocaleString()} thousand people employed.</p>
    <p className="note">Labour Force Survey, a different measure from job ads below. Source: <a href={lfsFile.source.url} target="_blank" rel="noreferrer">OpenDOSM</a>, retrieved {lfsFile.source.retrievedAt}, CC BY 4.0.</p>
  </div>;
}

export function DemandTable() {
  const rows = dosmQ2.occupationMajorGroups.filter((g) => g.iscoMajorGroup && g.quarterly['2026-Q1'] != null && g.quarterly['2026-Q2'] != null);
  const src = dosmQ2.source;
  return <section className="data-table" aria-label="Online job ads by occupation group">
    <LabourContext />
    <table>
      <thead><tr><th>Occupation group</th><th className="num">Q1 2026</th><th className="num">Q2 2026</th><th className="num">Change</th></tr></thead>
      <tbody>{rows.map((g) => {
        const before = g.quarterly['2026-Q1'] as number;
        const now = g.quarterly['2026-Q2'] as number;
        return <tr key={g.label}><td>{g.label}</td><td className="num">{before.toLocaleString()}</td><td className="num">{now.toLocaleString()}</td><td className={`num ${now >= before ? 'up' : 'down'}`}>{pct(now, before)}</td></tr>;
      })}</tbody>
    </table>
    <p className="note">Source: <a href={src.url} target="_blank" rel="noreferrer">{src.name}</a>, published {src.publishedAt} (Q1 data: {dosmQ1.source.publishedAt}). Counts online job ads across all industries, not every vacancy in Malaysia.</p>
  </section>;
}

export function OutlookTable() {
  const occ = new Map(iloFile.occupations.map((o) => [o.isco, o]));
  const rows = rolesFile.roles.map((r) => ({ role: r, ilo: occ.get(r.isco) })).filter((r) => r.ilo).sort((a, b) => b.ilo!.mean - a.ilo!.mean);
  return <section className="data-table" aria-label="Generative AI exposure by role">
    <table>
      <thead><tr><th>Role</th><th className="num">ISCO</th><th className="num">Exposure</th><th>ILO gradient</th></tr></thead>
      <tbody>{rows.map(({ role, ilo }) => <tr key={role.id}><td className="cap">{role.title}</td><td className="num">{role.isco}</td><td className="num">{ilo!.mean.toFixed(2)}</td><td>{ilo!.gradient}</td></tr>)}</tbody>
    </table>
    <p className="note">Exposure is the average share of a role's tasks that generative AI could change (0 to 1). It does not predict job loss. Source: <a href={iloFile.source.url} target="_blank" rel="noreferrer">ILO Working Paper 140</a>, 2025.</p>
  </section>;
}
