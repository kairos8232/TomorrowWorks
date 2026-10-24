// Team view for HR / L&D managers and career centres: a skills heatmap for a
// whole group and the gaps they share for one target role. Each viewer sees only
// their own group; the regional total is a separate screen (src/RegionView.tsx).
// Rule: src/team.ts (same scoring as Your moves). People are fictional.
import { useEffect, useMemo, useState } from 'react';
import resourcesFile from '../data/pathway/resources.json';
import { ilo, memberSkills, roleTitle, roles, snapshots, teams, transferable, type Viewer } from './data';
import { planForGaps, suggestedSteps, type Gap, type Resource } from './pathway';
import { CourseCard, GapTag, matches } from './PlanStep';
import { recommendMoves, scenarios, skillFit } from './scoring';
import { simulateFutures } from './futures';
import { sharedGaps, teamGrid } from './team';
import { useT } from './i18n';
import { SdgContribution } from './SdgViews';

const resources = resourcesFile.resources as Resource[];

type Member = { name: string; roleId: string | null; held: ReadonlySet<string> };

/** One person's own view inside Team view: where they fit, how far they are from the chosen role, and where to start. */
function PersonPage({ member, teamName, onBack }: { member: Member; teamName: string; onBack: () => void }) {
  const t = useT();
  const [targetId, onPickRole] = useState<string | null>(null);
  const [allGaps, setAllGaps] = useState(false);
  useEffect(() => setAllGaps(false), [member, targetId]);
  const { moves } = useMemo(() => recommendMoves(roles, member.roleId, member.held, snapshots.q2, ilo, scenarios.moderate, transferable), [member]);
  const target = roles.find((r) => r.id === targetId) ?? moves[0].role;
  const futures = useMemo(() => simulateFutures({ roles, currentRoleId: member.roleId, held: member.held, snapshots: [snapshots.q1, snapshots.q2], ilo, transferable }), [member]);
  const inRole = member.roleId === target.id;
  const fit = skillFit(target, member.held, transferable);
  const total = target.essentialSkills.length;
  const gaps: Gap[] = [...fit.missing.map((skill) => ({ skill, partly: null })), ...fit.transferable.map((x) => ({ skill: x.need, partly: x.have.label }))];
  const plan = planForGaps(gaps, resources);
  const ai = suggestedSteps(plan.uncovered, matches.skills);
  const steps = [
    ...plan.steps.map((s) => ({ key: s.resource.id, title: s.resource.title, url: s.resource.url, n: s.closes.length, time: s.resource.hours !== null ? t('{n} hours', { n: s.resource.hours }) : null, ai: false })),
    ...ai.steps.map((s) => ({ key: s.course.slug, title: s.course.name, url: s.course.url, n: s.closes.length, time: s.course.workload, ai: true })),
  ].slice(0, 3);
  const current = member.roleId ? roleTitle(roles.find((r) => r.id === member.roleId)!.title) : t('No job yet');
  const pct = (n: number) => `${(n / total) * 100}%`;
  return <section className="panel person-panel" aria-labelledby="person-head">
    <button type="button" className="text-button role-back" onClick={onBack} autoFocus>{t('Back to {team}', { team: teamName })}</button>
    <header className="person-head">
      <span className="person-avatar" aria-hidden="true">{member.name[0]}</span>
      <div>
        <h2 id="person-head">{member.name}</h2>
        <p>{current}, {t('{n} skills', { n: member.held.size })}</p>
      </div>
    </header>

    <h3>{t('Where {name} fits best', { name: member.name })}</h3>
    <div className="fit-cards">{moves.slice(0, 3).map((m) => {
      const f = futures.byRole.get(m.role.id);
      const on = m.role.id === target.id;
      return <button type="button" key={m.role.id} className={`fit-card${on ? ' on' : ''}`} aria-pressed={on} onClick={() => onPickRole(m.role.id)}>
        <span className="fit-role">{roleTitle(m.role.title)}</span>
        <span className="fit-score">{m.score100}<small>{t('Score')}</small></span>
        {f && <span className="fit-futures">{t('Best move in {p}% of futures', { p: Math.round(f.best * 100) })}</span>}
      </button>;
    })}</div>

    <h3>{t('Getting to {role}', { role: roleTitle(target.title) })}</h3>
    {inRole ? <p className="note">{t('This is their current job.')}</p> : <>
      <div className="bridge">
        <div className="bridge-bar" role="img" aria-label={t('{a} of {b} skills already, {c} related, {d} to learn', { a: fit.matched.length, b: total, c: fit.transferable.length, d: fit.missing.length })}>
          <span className="have" style={{ width: pct(fit.matched.length) }} />
          <span className="near" style={{ width: pct(fit.transferable.length) }} />
        </div>
        <p className="bridge-text"><strong>{t('{a} of {b} skills', { a: fit.matched.length, b: total })}</strong> {t('already')}{fit.transferable.length ? `, ${t('{n} related', { n: fit.transferable.length })}` : ''}, {t('{n} to learn', { n: fit.missing.length })}</p>
      </div>
      <div className="person-cols">
        <div>
          <h4>{t('Skills to learn')} <span className="count">{fit.transferable.length ? t('{n}, including {m} related', { n: gaps.length, m: fit.transferable.length }) : gaps.length}</span></h4>
          <div className="tag-row">{(allGaps ? gaps : gaps.slice(0, 6)).map((g) => <span key={g.skill.uri} className="skill-tag person-gap">{g.skill.label}{g.partly ? <small> ≈ {g.partly}</small> : null}</span>)}</div>
          {gaps.length > 6 && <button type="button" className="text-button" onClick={() => setAllGaps(!allGaps)}>{allGaps ? t('Show fewer') : t('Show all {n}', { n: gaps.length })}</button>}
        </div>
        <div>
          <div className="start-head">
            <h4>{t('Start with')}</h4>
            {plan.steps.length > 0 && <span className="start-total">{t('About {h} hours', { h: plan.statedHours })}</span>}
          </div>
          {steps.length === 0 ? <p className="note">{t('No course found yet')}</p>
            : <ol className="start-steps">{steps.map((s, k) => <li key={s.key} className={k === 0 ? 'first' : ''}>
              <span className="start-num" aria-hidden="true">{k + 1}</span>
              <div className="start-body">
                <a href={s.url} target="_blank" rel="noreferrer" className="start-title">{s.title}</a>
                <span className="start-meta">
                  {s.time && <span className="chip">{s.time}</span>}
                  <span>{t('covers {n} of these skills', { n: s.n })}</span>
                  {s.ai && <span className="chip ai">{t('AI suggestion')}</span>}
                </span>
                {k === 0 && <a href={s.url} target="_blank" rel="noreferrer" className="primary-button start-open">{t('Open course')}</a>}
              </div>
            </li>)}</ol>}
          {plan.steps.length > 0 && <p className="note start-note">{t('Total of the {n} checked courses, as stated by each provider.', { n: plan.steps.length })}</p>}
        </div>
      </div>
    </>}
    <p className="note person-foot">{t('Same rules as Your moves and Your plan. In real use, each person confirms their own skills and decides their own move; this view supports the conversation.')}</p>
  </section>;
}

/** Cell shade: darker green = higher score. Text always carries the number. */
const shade = (score: number) => `rgba(30, 107, 79, ${Math.min(0.9, 0.08 + score / 110)})`;

/** One group only: the viewer's own team or class. */
export function TeamView({ viewer }: { viewer: Viewer }) {
  const team = teams.find((x) => x.id === viewer.teamId) ?? teams[0];
  return <div className="step-body team-view"><TeamBody team={team} /></div>;
}

function TeamBody({ team }: { team: (typeof teams)[number] }) {
  const t = useT();
  const members = useMemo(() => team.members.map((m) => ({ name: m.name, roleId: m.roleId, held: memberSkills(m) })), [team]);
  const grid = useMemo(() => teamGrid(members, roles, snapshots.q2, ilo, scenarios.moderate, transferable), [members]);
  const ranked = [...grid.averages].filter((a) => a.average !== null).sort((a, b) => b.average! - a.average!);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [personName, setPersonName] = useState<string | null>(null);
  const [mode, setMode] = useState<'plan' | 'compare'>('plan');
  useEffect(() => { setTargetId(null); setPersonName(null); setMode('plan'); }, [team]);
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
    return <p className="team-needs">{t('Needed by {n} of {m}', { n: names.size, m: shared.movers })}</p>;
  };
  const aiShown = showAllAi ? course.ai.steps : course.ai.steps.slice(0, 2);
  const total = course.plan.steps.length + course.ai.steps.length;

  const open = (name: string) => { setPersonName(name); window.scrollTo({ top: 0 }); };
  if (personName) {
    return <div className="team-body"><PersonPage member={members.find((m) => m.name === personName)!} teamName={t(team.name)} onBack={() => { setPersonName(null); window.scrollTo({ top: 0 }); }} /></div>;
  }
  return <div className="team-body">
    <div className="team-toolbar">
      <div className="team-toolbar-context">
        <p>{t(team.name)} · {t('{n} people', { n: members.length })}</p>
        {mode === 'plan' && <div className="team-target">
          <div className="team-target-field">
            <label htmlFor="team-role">{t('Plan for role')}</label>
            <select id="team-role" value={target.id} onChange={(event) => setTargetId(event.target.value)}>{ranked.map((item) => <option key={item.role.id} value={item.role.id}>{roleTitle(item.role.title)}</option>)}</select>
          </div>
          <div className="team-target-stats" aria-live="polite">
            <span>{t('{n} moving', { n: shared.movers })}</span>
            <span>{t('{n} shared gaps', { n: shared.gaps.length })}</span>
          </div>
        </div>}
      </div>
      <div className="team-modes" aria-label={t('Team view')}>
        <button type="button" className={mode === 'plan' ? 'on' : ''} aria-pressed={mode === 'plan'} onClick={() => setMode('plan')}>{t('Team plan')}</button>
        <button type="button" className={mode === 'compare' ? 'on' : ''} aria-pressed={mode === 'compare'} onClick={() => setMode('compare')}>{t('Compare roles')}</button>
      </div>
    </div>

    {mode === 'compare' ? <section className="panel team-compare" aria-labelledby="heat">
      <h2 id="heat">{t('Who fits which role')}</h2>
      <p className="note">{t('Select a role to see its team plan, or a person to open their profile.')}</p>
      <div className="heat-scroll"><table className="heatmap">
        <thead><tr><th scope="col">{t('Person')}</th>{roles.map((r) => <th scope="col" key={r.id}><button type="button" className={`heat-role${r.id === target.id ? ' active' : ''}`} onClick={() => { setTargetId(r.id); setMode('plan'); }}>{roleTitle(r.title)}</button></th>)}</tr></thead>
        <tbody>{grid.rows.map((row) => <tr key={row.member.name}>
          <th scope="row"><button type="button" className="heat-person" onClick={() => open(row.member.name)}>{row.member.name}</button><small>{row.member.roleId ? roleTitle(roles.find((r) => r.id === row.member.roleId)!.title) : t('No job yet')}</small></th>
          {row.cells.map((c) => <td key={c.role.id} className={c.current ? 'now' : ''} style={c.current ? undefined : { background: shade(c.result.score100), color: c.result.score100 > 45 ? '#ffffff' : '#1c2430' }}>{c.current ? t('Now') : c.result.score100}</td>)}
        </tr>)}
        <tr className="heat-avg"><th scope="row">{t('Average')}{members.some((m) => m.roleId) && <small>{t('moves only')}</small>}</th>{grid.averages.map((a) => <td key={a.role.id}>{a.average ?? '–'}</td>)}</tr>
        </tbody>
      </table></div>
    </section> : <>
      <div className="team-overview">
        <section className="panel team-fit" aria-labelledby="team-fit-head">
          <h2 id="team-fit-head">{t('Fit for {role}', { role: roleTitle(target.title) })}</h2>
          <ul>{grid.rows.map((row) => {
            const cell = row.cells.find((c) => c.role.id === target.id)!;
            const fit = skillFit(target, row.member.held, transferable);
            const gaps = fit.missing.length + fit.transferable.length;
            return <li key={row.member.name}><button type="button" className="team-fit-person" onClick={() => open(row.member.name)}>
              <span className="person-avatar small" aria-hidden="true">{row.member.name[0]}</span>
              <span className="team-fit-name"><strong>{row.member.name}</strong><small>{row.member.roleId ? roleTitle(roles.find((r) => r.id === row.member.roleId)!.title) : t('No job yet')}</small></span>
              <span className="team-fit-gap">{cell.current ? t('Current role') : t('{n} to build', { n: gaps })}</span>
              <span className="team-fit-score">{cell.current ? t('Now') : cell.result.score100}</span>
            </button></li>;
          })}</ul>
        </section>
        <section className="panel team-priorities" aria-labelledby="team-priorities-head">
          <h2 id="team-priorities-head">{t('Skills to teach first')}</h2>
          {shared.gaps.length === 0 ? <p className="note">{t('No gaps: everyone already has these skills.')}</p> : <ol>{shared.gaps.slice(0, 5).map((gap) => <li key={gap.skill.uri}>
            <span>{gap.skill.label}</span><strong>{gap.missing.length + gap.partly.length}/{shared.movers}</strong>
          </li>)}</ol>}
          {shared.gaps.length > 5 && <p className="team-priority-note">{t('{n} more gaps in the training plan below', { n: shared.gaps.length - 5 })}</p>}
        </section>
      </div>

    <div className="plan-layout">
    <section className="panel team-plan" aria-labelledby="shared">
      <h2 id="shared">{t('Training plan for {role}', { role: roleTitle(target.title) })}</h2>
      <p className="note">{t('Courses covering the most shared gaps come first.')}</p>
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
        {course.ai.steps.length > 2 && <button type="button" className="text-button plan-more" onClick={() => setShowAllAi(!showAllAi)}>{showAllAi ? t('Show fewer') : t('Show all {n} suggestions', { n: course.ai.steps.length })}</button>}
        {course.ai.unmatched.length > 0 && <div className="plan-unmatched"><span className="plan-closes">{t('No course found yet')}</span>{course.ai.unmatched.map((g) => <GapTag key={g.skill.uri} gap={g} />)}</div>}
        <details className="how-to-read">
          <summary>{t('See all {n} skill gaps', { n: shared.gaps.length })}</summary>
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
    </>}
    <p className="note">{t('All people here are fictional. In a real deployment each person would confirm their own skills; the manager or adviser sees the group view, not anyone’s CV.')}</p>
  </div>;
}
