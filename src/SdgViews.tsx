// SDG display pieces shared by Your moves, Your plan and Team view.
// Rule: src/sdg.ts (RunPod matches: strong = checked by people; possible = not checked; 4.4 baseline).
import { roleById } from './data';
import { useT } from './i18n';
import { goalUrl, reviewCounts, roleSdgs, sdgData, sdgMatches, sdgPossibleTotals, sdgTotals, targetGoal, targetTitle, type SdgLink } from './sdg';
import type { Skill } from './scoring';

export function SdgBadge({ target, short = false }: { target: string; short?: boolean }) {
  const t = useT();
  const goal = sdgData.goals[targetGoal(target)];
  return <a className="sdg-badge" style={{ borderColor: goal.colour }} href={goalUrl(targetGoal(target))} target="_blank" rel="noreferrer" title={`${t(goal.name)}: ${t(targetTitle(target))}`}>
    {short || !target.includes('.') ? t('SDG {n}', { n: target }) : t('SDG target {n}', { n: target })}
  </a>;
}

const names = (skills: Skill[], t: ReturnType<typeof useT>) =>
  skills.length > 4 ? `${skills.slice(0, 4).map((s) => s.label).join(', ')} ${t('and {n} more', { n: skills.length - 4 })}` : skills.map((s) => s.label).join(', ');

/** Why a role links to a target: how many of its skills RunPod matched strongly. */
function LinkWhy({ link, total }: { link: SdgLink; total: number }) {
  const t = useT();
  return <p>{t('{n} of its {m} essential skills link to this target', { n: link.skills!.length, m: total })}: {names(link.skills!, t)}. <span className="sdg-source strong">{t('Reviewed link')}</span></p>;
}

/** Possible links (just under the threshold, not checked), collapsed. */
export function PossibleLinks({ skills, exclude }: { skills: Skill[]; exclude: string[] }) {
  const t = useT();
  const list = sdgPossibleTotals(skills).filter((p) => !exclude.includes(p.target));
  if (list.length === 0) return null;
  return <details className="sdg-possible">
    <summary>{t('Possible links ({n}), not confirmed', { n: list.length })}</summary>
    <ul>{list.map((p) => <li key={p.target}><SdgBadge target={p.target} short /> {t(targetTitle(p.target))} <small>· {names(p.skills, t)} · {t('similarity {x}', { x: p.best.toFixed(2) })}</small></li>)}</ul>
  </details>;
}

const BASELINE = 'Every skill here counts towards SDG 4.4: relevant skills for decent jobs.';

/** Role SDG links with their evidence (role view in Your moves). */
export function RoleSdgLine({ roleId }: { roleId: string }) {
  const t = useT();
  const role = roleById(roleId)!;
  const links = roleSdgs(role);
  return <div className="sdg-line">
    {links.map((l) => <div key={l.target}><p><SdgBadge target={l.target} /> <strong>{t(targetTitle(l.target))}.</strong></p><LinkWhy link={l} total={role.essentialSkills.length} /></div>)}
    {links.length === 0 && <p>{t('No strong match to a specific SDG target yet.')}</p>}
    <p className="sdg-baseline"><span className="sdg-source baseline">{t('Baseline')}</span> {t(BASELINE)}</p>
    <PossibleLinks skills={role.essentialSkills} exclude={links.map((l) => l.target)} />
  </div>;
}

/** How the links were made, with the counts from the human check. */
export function SdgMethodNote() {
  const t = useT();
  return <p className="note sdg-summary-note">{t('Links proposed by RunPod ({model}) and keyword matching; shown as strong only if two reviewers agreed ({n} of {p} pairs). A connection, not a measured impact.', { model: sdgMatches.method.model, n: reviewCounts.relevant, p: reviewCounts.pairs })} <a href={sdgMatches.method.targets.url} target="_blank" rel="noreferrer">{t('UN target list')}</a></p>;
}

/** "This move and the SDGs": what the skills to build connect to, strong first, then possible, then the 4.4 baseline. */
export function SdgContribution({ roleId, skills, heading }: { roleId: string | null; skills: Skill[]; heading: string; compact?: boolean }) {
  const t = useT();
  const role = roleId ? roleById(roleId) : null;
  const roleLinks = role ? roleSdgs(role) : [];
  const strong = sdgTotals(skills).filter((x) => x.target !== '4.4');
  const targets = [...new Set([...roleLinks.map((l) => l.target), ...strong.map((x) => x.target)])];
  const digital = sdgTotals(skills).find((x) => x.target === '4.4')?.skills.length ?? 0;
  const gapCount = new Set(skills.map((skill) => skill.uri)).size;
  return <section className="panel sdg-panel" aria-label={heading}>
    <h2>{heading}</h2>
    <ul className="sdg-summary-list">
      {targets.map((target) => {
        const roleLink = roleLinks.find((link) => link.target === target);
        const linked = strong.find((x) => x.target === target)?.skills ?? [];
        return <li key={target}>
          <div className="sdg-summary-heading"><SdgBadge target={target} short /><strong>{t(targetTitle(target))}</strong></div>
          {roleLink && role ? <LinkWhy link={roleLink} total={role.essentialSkills.length} /> : <p><span className="sdg-source strong">{t('Reviewed link')}</span></p>}
          {linked.length > 0 && <small>{roleLink ? t('You would build {n} of them', { n: linked.length }) : t('Gap skills you would build for it: {skills}', { skills: names(linked, t) })}</small>}
        </li>;
      })}
      {targets.length === 0 && <li><p>{t('No strong match to a specific SDG target yet.')}</p></li>}
      <li className="sdg-baseline-row">
        <div className="sdg-summary-heading"><SdgBadge target="4.4" short /><strong>{t(targetTitle('4.4'))}</strong></div>
        <p><span className="sdg-source baseline">{t('Baseline')}</span> {t('All {n} skills you would build count towards it.', { n: gapCount })}{digital > 0 ? ` ${t('{n} are ESCO digital skills (indicator 4.4.1).', { n: digital })}` : ''}</p>
      </li>
    </ul>
    <PossibleLinks skills={skills} exclude={targets} />
    <SdgMethodNote />
  </section>;
}
