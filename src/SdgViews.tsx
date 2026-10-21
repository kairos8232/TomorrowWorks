// SDG display pieces shared by Your moves, Your plan and Team view.
// Data and rules: src/sdg.ts and data/sdg/sdg-links.json.
import { useT } from './i18n';
import { goalUrl, roleSdgs, sdgData, sdgTotals } from './sdg';
import type { Skill } from './scoring';

export function SdgBadge({ target }: { target: string }) {
  const t = useT();
  const info = sdgData.targets[target];
  const goal = sdgData.goals[info.goal];
  return <a className="sdg-badge" style={{ borderColor: goal.colour }} href={goalUrl(info.goal)} target="_blank" rel="noreferrer" title={`${t(goal.name)}: ${t(info.title)}`}>
    {target.includes('.') ? t('SDG target {n}', { n: target }) : t('SDG {n}', { n: target })}
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
export function SdgContribution({ roleId, skills, heading }: { roleId: string | null; skills: Skill[]; heading: string }) {
  const t = useT();
  const totals = sdgTotals(skills);
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
