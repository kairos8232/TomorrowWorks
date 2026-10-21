// SDG display pieces shared by Your moves, Your plan and Team view.
// Rule: src/sdg.ts (RunPod matches checked by people, plus links written by the team).
import { roleById } from './data';
import { useT } from './i18n';
import { goalUrl, reviewCounts, roleSdgs, sdgData, sdgMatches, sdgReview, sdgTotals, targetGoal, targetTitle, type SdgLink } from './sdg';
import type { Skill } from './scoring';

export function SdgBadge({ target, short = false }: { target: string; short?: boolean }) {
  const t = useT();
  const goal = sdgData.goals[targetGoal(target)];
  return <a className="sdg-badge" style={{ borderColor: goal.colour }} href={goalUrl(targetGoal(target))} target="_blank" rel="noreferrer" title={`${t(goal.name)}: ${t(targetTitle(target))}`}>
    {short || !target.includes('.') ? t('SDG {n}', { n: target }) : t('SDG target {n}', { n: target })}
  </a>;
}

/** Why a role links to a target: how many of its skills RunPod matched, or the team's reason. */
function LinkWhy({ link, total }: { link: SdgLink; total: number }) {
  const t = useT();
  if (link.source === 'ai') {
    const names = link.skills!.map((s) => s.label);
    return <p>{t('{n} of its {m} essential skills match this target', { n: names.length, m: total })}: {names.slice(0, 4).join(', ')}{names.length > 4 ? ` ${t('and {n} more', { n: names.length - 4 })}` : ''}. <span className="sdg-source ai">{t('AI match, checked')}</span></p>;
  }
  return <p>{t(link.reason ?? '')} <span className="sdg-source team">{t('Written by the team')}</span></p>;
}

/** Role SDG links with their evidence (role view in Your moves). */
export function RoleSdgLine({ roleId }: { roleId: string }) {
  const t = useT();
  const role = roleById(roleId)!;
  return <div className="sdg-line">
    {roleSdgs(role).map((l) => <div key={l.target}><p><SdgBadge target={l.target} /> <strong>{t(targetTitle(l.target))}.</strong></p><LinkWhy link={l} total={role.essentialSkills.length} /></div>)}
  </div>;
}

/** How the links were made, in one line, with the counts from the human check. */
export function SdgMethodNote() {
  const t = useT();
  return <p className="note sdg-summary-note">{t('Skill links: RunPod ({model}) compared each ESCO skill with the official UN target texts; matches with similarity of at least {th} were checked by people, who removed {r} of {p}.', { model: sdgMatches.method.model, th: sdgReview.threshold.toFixed(2), r: reviewCounts.rejected, p: reviewCounts.proposed })} {t('Role links come from those matches, or are written by the team where none fit. They show a connection, not a measured impact.')} <a href={sdgMatches.method.targets.url} target="_blank" rel="noreferrer">{t('UN target list')}</a></p>;
}

/** "This move and the SDGs": the role's targets and the targets of the skills to build. */
export function SdgContribution({ roleId, skills, heading }: { roleId: string | null; skills: Skill[]; heading: string; compact?: boolean }) {
  const t = useT();
  const totals = sdgTotals(skills);
  const role = roleId ? roleById(roleId) : null;
  const roleLinks = role ? roleSdgs(role) : [];
  const targets = [...new Set([...roleLinks.map((link) => link.target), ...totals.map((total) => total.target), ...(skills.length > 0 ? ['4.4'] : [])])];
  const gapCount = new Set(skills.map((skill) => skill.uri)).size;
  return <section className="panel sdg-panel" aria-label={heading}>
    <h2>{heading}</h2>
    <ul className="sdg-summary-list">{targets.map((target) => {
      const roleLink = roleLinks.find((link) => link.target === target);
      const linked = totals.find((total) => total.target === target)?.skills ?? [];
      return <li key={target}>
        <div className="sdg-summary-heading"><SdgBadge target={target} short /><strong>{t(targetTitle(target))}</strong></div>
        {roleLink && role && <LinkWhy link={roleLink} total={role.essentialSkills.length} />}
        {target === '4.4' ? <>
          <small>{t('Broad skills link: all {n} gap skills', { n: gapCount })}</small>
          {linked.length > 0 && <small>{t('Specific ICT link: {n} ESCO digital skills', { n: linked.length })}</small>}
        </> : linked.length > 0 && <small>{roleLink?.source === 'ai'
          ? t('You would build {n} of them', { n: linked.length })
          : t('Gap skills you would build for it: {skills}', { skills: linked.length > 4 ? `${linked.slice(0, 4).map((s) => s.label).join(', ')} ${t('and {n} more', { n: linked.length - 4 })}` : linked.map((s) => s.label).join(', ') })}</small>}
      </li>;
    })}</ul>
    <SdgMethodNote />
  </section>;
}
