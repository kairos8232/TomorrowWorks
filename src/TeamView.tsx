// Team view for HR / L&D managers and career centres: a skills heatmap for a
// whole group and the gaps they share for one target role.
// Rule: src/team.ts (same scoring as Your moves). People are fictional.
import { useEffect, useMemo, useState } from 'react';
import resourcesFile from '../data/pathway/resources.json';
import { ilo, memberSkills, roleTitle, roles, snapshots, teams, transferable, type Viewer } from './data';
import { planForGaps, suggestedSteps, type Gap, type Resource } from './pathway';
import { CourseCard, GapTag, matches } from './PlanStep';
import { scenarios } from './scoring';
import { sharedGaps, teamGrid } from './team';
import { useT } from './i18n';
import { SdgContribution } from './SdgViews';

const resources = resourcesFile.resources as Resource[];

/** Cell shade: darker green = higher score. Text always carries the number. */
const shade = (score: number) => `rgba(30, 107, 79, ${Math.min(0.9, 0.08 + score / 110)})`;

export function TeamView({ viewer }: { viewer: Viewer }) {
  const t = useT();
  const team = teams.find((x) => x.id === viewer.teamId) ?? teams[0];
  const members = useMemo(() => team.members.map((m) => ({ name: m.name, roleId: m.roleId, held: memberSkills(m) })), [team]);
  const grid = useMemo(() => teamGrid(members, roles, snapshots.q2, ilo, scenarios.moderate, transferable), [members]);
  const ranked = [...grid.averages].filter((a) => a.average !== null).sort((a, b) => b.average! - a.average!);
  const [targetId, setTargetId] = useState<string | null>(null);
  useEffect(() => setTargetId(null), [team]);
  const target = roles.find((r) => r.id === targetId) ?? ranked[0].role;
  const shared = useMemo(() => sharedGaps(members, target, transferable, resources), [members, target]);
  // Same course rule as Your plan, applied to the gaps the group shares (most shared first).
  const course = useMemo(() => {
    const gaps: Gap[] = shared.gaps.map((g) => ({ skill: g.skill, partly: null }));
    const plan = planForGaps(gaps, resources);
    return { plan, ai: suggestedSteps(plan.uncovered, matches.skills) };
  }, [shared]);
  const [showAllAi, setShowAllAi] = useState(false);
  useEffect(() => setShowAllAi(false), [target]);
  const whoNeeds = (closes: Gap[]) => {
    const names = new Set(shared.gaps.filter((g) => closes.some((c) => c.skill.uri === g.skill.uri)).flatMap((g) => [...g.missing, ...g.partly]));
    return <p className="team-needs">{t('Needed by {n} of {m}: {names}', { n: names.size, m: shared.movers, names: members.map((m) => m.name).filter((n) => names.has(n)).join(', ') })}</p>;
  };
  const aiShown = showAllAi ? course.ai.steps : course.ai.steps.slice(0, 4);
  const total = course.plan.steps.length + course.ai.steps.length;

  return <div className="step-body team-view">
    <div className="who"><p><strong>{t('Viewing as {name}', { name: viewer.name })}</strong> ({t(viewer.group)}). {t(team.description)}</p></div>

    <section className="ledger" aria-labelledby="heat">
      <h2 id="heat" className="section-title">{t('Who fits which role')}</h2>
      <p className="note">{t('Each cell is that person’s score for the role, out of 100, from the same rule as Your moves (Q2 2026 job ads, AI changing work gradually). “Now” marks their current job.')}</p>
      <div className="heat-scroll">
        <table className="heatmap">
          <thead><tr><th scope="col">{t('Person')}</th>{roles.map((r) => <th scope="col" key={r.id}><button type="button" className={`heat-role${r.id === target.id ? ' active' : ''}`} onClick={() => setTargetId(r.id)}>{roleTitle(r.title)}</button></th>)}</tr></thead>
          <tbody>
            {grid.rows.map((row) => <tr key={row.member.name}>
              <th scope="row">{row.member.name}<small>{row.member.roleId ? roleTitle(roles.find((r) => r.id === row.member.roleId)!.title) : t('No job yet')}</small></th>
              {row.cells.map((c) => <td key={c.role.id} className={c.current ? 'now' : ''} style={c.current ? undefined : { background: shade(c.result.score100), color: c.result.score100 > 45 ? '#ffffff' : '#1c2430' }}>
                {c.current ? t('Now') : c.result.score100}
              </td>)}
            </tr>)}
            <tr className="heat-avg"><th scope="row">{t('Average')}<small>{t('moves only')}</small></th>
              {grid.averages.map((a) => <td key={a.role.id}>{a.average ?? '–'}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <p className="note">{t('Select a role name to see what the group would need to learn for it.')}</p>
    </section>

    <div className="plan-layout">
    <section className="panel team-plan" aria-labelledby="shared">
      <h2 id="shared">{t('Training plan for {role}', { role: roleTitle(target.title) })}</h2>
      <p className="note">{t('{n} of {m} people would be moving into this role. They share {g} skill gaps; courses that cover the most of them come first.', { n: shared.movers, m: members.length, g: shared.gaps.length })}</p>
      {shared.gaps.length === 0 ? <p>{t('No gaps: everyone already has these skills.')}</p> : <>
        {total > 0 && <ol className="plan-steps">
          {course.plan.steps.map((step, i) => <CourseCard key={step.resource.id} n={i + 1} showNumber primary={i === 0}
            title={step.resource.title} url={step.resource.url} closes={step.closes}
            label={<span className="course-kind checked">{t('Checked course')}</span>}
            meta={<>{step.resource.provider} · {step.resource.free ? t(step.resource.cost) : step.resource.access === 'rakyat-digital' ? t('Paid; free 3 months via Rakyat Digital') : t(step.resource.cost)} · {step.resource.hours !== null ? t('{n} hours', { n: step.resource.hours }) : t(step.resource.timeBasis)}</>}
            extra={whoNeeds(step.closes)} />)}
          {aiShown.map((step, i) => <CourseCard key={step.course.slug} n={course.plan.steps.length + i + 1} showNumber primary={course.plan.steps.length === 0 && i === 0}
            title={step.course.name} url={step.course.url} closes={step.closes}
            label={<span className="course-kind ai">{t('AI suggestion · match {n}%', { n: Math.round(step.bestMatch * 100) })}</span>}
            meta={<>Coursera · {t('Paid; free 3 months via Rakyat Digital')} · {step.course.workload ?? t('time not stated')}</>}
            extra={whoNeeds(step.closes)} />)}
        </ol>}
        {course.ai.steps.length > 4 && <button type="button" className="text-button plan-more" onClick={() => setShowAllAi(!showAllAi)}>{showAllAi ? t('Show fewer') : t('Show all {n} suggestions', { n: course.ai.steps.length })}</button>}
        {course.ai.unmatched.length > 0 && <div className="plan-unmatched"><span className="plan-closes">{t('No course found yet')}</span>{course.ai.unmatched.map((g) => <GapTag key={g.skill.uri} gap={g} />)}</div>}
        <details className="how-to-read">
          <summary>{t('Who lacks each skill ({n} gaps)', { n: shared.gaps.length })}</summary>
          {(() => {
            // Group skills by exactly who lacks them, most people first.
            const groups = new Map<string, { who: string[]; count: number; skills: typeof shared.gaps }>();
            for (const g of shared.gaps) {
              const who = [...g.missing, ...g.partly.map((n) => t('{name} (partly)', { name: n }))];
              const key = who.join('|');
              const entry = groups.get(key) ?? { who, count: g.missing.length + g.partly.length, skills: [] };
              entry.skills.push(g);
              groups.set(key, entry);
            }
            return <div className="lack-groups">{[...groups.values()].sort((x, y) => y.count - x.count).map((grp) => <div key={grp.who.join('|')} className="lack-group">
              <h3>{grp.count === shared.movers ? t('All {n} lack', { n: shared.movers }) : t('{n} of {m} lack', { n: grp.count, m: shared.movers })} <span>{grp.who.join(', ')} · {grp.skills.length === 1 ? t('1 skill') : t('{n} skills', { n: grp.skills.length })}</span></h3>
              <div className="tag-row">{grp.skills.map((g) => <span key={g.skill.uri} className="skill-tag skill-gap">{g.skill.label}</span>)}</div>
            </div>)}</div>;
          })()}
        </details>
      </>}
    </section>
    <SdgContribution roleId={target.id} skills={shared.gaps.map((g) => g.skill)} heading={t('Team training and the SDGs')} compact />
    </div>
    <p className="note">{t('All people here are fictional. In a real deployment each person would confirm their own skills; the manager or adviser sees the group view, not anyone’s CV.')}</p>
  </div>;
}
