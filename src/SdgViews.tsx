// SDG display pieces shared by Your moves, Your plan and Team view.
// Data and rules: src/sdg.ts and data/sdg/sdg-links.json.
import { useT } from './i18n';
import { goalUrl, roleSdgs, sdgData, sdgTotals } from './sdg';
import type { Skill } from './scoring';

export function SdgBadge({ target, short = false }: { target: string; short?: boolean }) {
  const t = useT();
  const info = sdgData.targets[target];
  const goal = sdgData.goals[info.goal];
  return <a className="sdg-badge" style={{ borderColor: goal.colour }} href={goalUrl(info.goal)} target="_blank" rel="noreferrer" title={`${t(goal.name)}: ${t(info.title)}`}>
    {short || !target.includes('.') ? t('SDG {n}', { n: target }) : t('SDG target {n}', { n: target })}
  </a>;
}

/** Role SDG links with their reasons (expanded row in Your moves). */
export function RoleSdgLine({ roleId }: { roleId: string }) {
  const t = useT();
  return <div className="sdg-line">
    {roleSdgs(roleId).map((l) => <p key={l.target}><SdgBadge target={l.target} /> <strong>{t(sdgData.targets[l.target].title)}.</strong> {t(l.reason)}</p>)}
  </div>;
}

/** "How this move connects to the SDGs": the role's targets and the targets of the skills to build. */
export function SdgContribution({ roleId, skills, heading, compact = false }: { roleId: string | null; skills: Skill[]; heading: string; compact?: boolean }) {
  const t = useT();
  const totals = sdgTotals(skills);
  const roleLinks = roleId ? roleSdgs(roleId) : [];
  if (compact) {
    const targets = [...new Set([...roleLinks.map((link) => link.target), ...totals.map((total) => total.target)])];
    return <section className="panel sdg-panel" aria-label={heading}>
      <h2>{heading}</h2>
      <ul className="sdg-summary-list">{targets.map((target) => {
        const roleLink = roleLinks.find((link) => link.target === target);
        const skillCount = totals.find((total) => total.target === target)?.skills.length ?? 0;
        return <li key={target}>
          <div className="sdg-summary-heading"><SdgBadge target={target} short /><strong>{t(sdgData.targets[target].title)}</strong></div>
          {roleLink && <p>{t(roleLink.reason)}</p>}
          {skillCount > 0 && <small>{t('Linked gap skills: {n}', { n: skillCount })}</small>}
        </li>;
      })}</ul>
      <p className="note sdg-summary-note">{t('All gap skills also link to SDG 4.4. Role links are written by hand; skill links use ESCO wording and flags. These are connections, not measured impact.')}</p>
    </section>;
  }
  return <section className="panel sdg-panel" aria-label={heading}>
    <h2>{heading}</h2>
    {roleId && <RoleSdgLine roleId={roleId} />}
    {totals.length > 0 && <>
      <h3>{t('Skills you would build')}</h3>
      <ul className="sdg-totals">{totals.map(({ target, skills: list }) => <li key={target}>
        <SdgBadge target={target} /> <span>{t(sdgData.targets[target].title)}</span>
        <small>{list.length === 1 ? t('1 skill') : t('{n} skills', { n: list.length })}: {list.map((s) => s.label).join(', ')}</small>
      </li>)}</ul>
    </>}
    <p className="note">{t('Every skill you build also counts towards SDG target 4.4: relevant skills for decent jobs.')} {t('Role links are written by hand; skill links follow fixed rules on ESCO skill wording and ESCO’s green and digital flags. They show a connection, not a measured impact.')}</p>
  </section>;
}
