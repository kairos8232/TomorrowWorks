// Step 3: a learning plan for one chosen move.
// Rule: src/pathway.ts (documented in SIGNALS_AND_MATCHING.md, "Learning plan rule").
// Courses: data/pathway/resources.json. NOSS: data/pathway/noss.json. Both checked by hand.
import type React from 'react';
import { useMemo, useState } from 'react';
import resourcesFile from '../data/pathway/resources.json';
import nossFile from '../data/pathway/noss.json';
import { ilo, personaById, roleById, roles, snapshots, transferable, type Profile } from './data';
import { learningPlan, suggestedSteps, type Gap, type Resource, type SuggestedCourse } from './pathway';
import { recommendMoves, scenarios } from './scoring';
import { useLang, useT, useTx } from './i18n';
import { SdgContribution } from './SdgViews';
import matchesFile from '../data/derived/coursera-skill-matches.json';
import { CourseProgressControl, LearningProgress } from './CourseProgress';
import { ChangeCourse } from './ChangeCourse';
import { LearningMilestones } from './LearningMilestones';
import { activityCount, type CourseProgress, type LearningAction } from './learningCheck';

const resources = resourcesFile.resources as Resource[];
// AI-matched Coursera courses (RunPod, bge-m3); see scripts/match_courses_runpod.py.
export const matches = matchesFile as { method: { coursesEmbedded: number; catalogue: { retrievedAt: string } }; skills: Record<string, { courses: SuggestedCourse[] } | undefined> };
const hrd = resourcesFile.hrdCorp;
const access = resourcesFile.access as Record<string, { name: string; url: string; note: string; source: string }>;
type NossEntry = { code: string; title: string; level: number; source: string; page: number };
type NossRole = { match: 'close' | 'related' | 'none'; noss: NossEntry[]; note?: string };
const nossRoles = nossFile.roles as Record<string, NossRole>;
const nossSources = nossFile.sources as Record<string, { name: string; url: string }>;

export function GapTag({ gap }: { gap: Gap }) {
  return gap.partly
    ? <span className="skill-tag related" title={`≈ ${gap.partly}`}>{gap.skill.label}<small>≈ {gap.partly}</small></span>
    : <span className="skill-tag skill-gap">{gap.skill.label}</span>;
}

/** One course in the plan. Checked and AI-suggested courses share this layout; only the label differs. */
export function CourseCard({ n, title, url, meta, closes, label, primary, showNumber, extra, onOpen }: {
  n: number; title: string; url: string; meta: React.ReactNode; closes: Gap[]; label: React.ReactNode; primary: boolean; showNumber: boolean; extra?: React.ReactNode; onOpen?: () => void;
}) {
  const t = useT();
  return <li>
    {showNumber && <span className="plan-num">{n}</span>}
    <div>
      <div className="plan-course-head">
        <div>
          {label}
          <h3>{title}</h3>
        </div>
        <a className={`${primary ? 'primary-button' : 'secondary-button'} plan-course-action`} href={url} target="_blank" rel="noreferrer" onClick={onOpen} aria-label={t('View {name}', { name: title })}>{t('View course')}</a>
      </div>
      <p className="plan-meta">{meta}</p>
      <div className="tag-row"><span className="plan-closes">{t('Builds')}</span>{closes.map((g) => <GapTag key={g.skill.uri} gap={g} />)}</div>
      {extra}
    </div>
  </li>;
}

/**
 * Malaysian certification route. With `n`, it is the last numbered step of the plan
 * (marked optional); it certifies the whole job, so it shows no "Builds" skills.
 */
const hasNoss = (roleId: string) => (nossRoles[roleId]?.noss.length ?? 0) > 0;
function NossRoute({ roleId, n }: { roleId: string; n?: number }) {
  const t = useT();
  const lang = useLang();
  const entry = nossRoles[roleId];
  if (!entry || entry.noss.length === 0) {
    return <p className="plan-noss-none note">{t('Malaysian certification: no matching NOSS standard in the current JPK register (January 2025).')}</p>;
  }
  // Show the Malay title in Bahasa Malaysia, the English one otherwise; merge levels that share a title.
  const titleOf = (n: NossEntry) => (lang === 'ms' ? n.title.replace(/ \([^)]*\)$/, '') : n.title.match(/\(([^)]*)\)$/)?.[1] ?? n.title);
  const groups = new Map<string, NossEntry[]>();
  for (const n of entry.noss) groups.set(titleOf(n), [...(groups.get(titleOf(n)) ?? []), n]);
  const first = entry.noss[0];
  const levels = (list: NossEntry[]) => list.map((n) => n.level).sort().join(` ${t('or')} `);
  const body = <>
    <div className="plan-course-head">
      <div>
        <span className="course-kind noss">{t('Malaysian certification · optional')}</span>
        <h3 id="noss">{`SKM ${[...groups][0][0]} · ${t('Level')} ${levels([...groups][0][1])}`}</h3>
        {groups.size > 1 && <p className="noss-also">{t('Also')}: {[...groups].slice(1).map(([title, list]) => `SKM ${title} · ${t('Level')} ${levels(list)}`).join(' · ')}</p>}
      </div>
      <a className="secondary-button plan-course-action" href={`${nossSources[first.source].url}#page=${first.page}`} target="_blank" rel="noreferrer">{t('View in JPK register')}</a>
    </div>
    <p className="plan-meta">NOSS {entry.noss.map((n) => n.code).join(', ')} · {t('JPK register, Jan 2025, p. {n}', { n: [...new Set(entry.noss.map((n) => n.page))].join(', ') })}</p>
    <p className="note">{entry.match === 'related' ? `${t('Related route, not the same job.')} ${entry.note ? t(entry.note) : ''} ` : ''}{t('Optional SKM route via a JPK-accredited centre or prior learning (PPT). Check the code with JPK before enrolling.')} {t('Checked by hand on {date}.', { date: nossFile.checkedAt })}</p>
    <div className="tag-row"><span className="plan-closes">{t('Certifies')}</span><span className="note">{t('the whole job, not single skills')}</span></div>
  </>;
  return n === undefined
    ? <section className="plan-noss-card" aria-labelledby="noss">{body}</section>
    : <li className="plan-noss-step">{n > 1 && <span className="plan-num">{n}</span>}<div>{body}</div></li>;
}

export function PlanStep({ profile, roleId, onPickRole, onBackToMoves, progress, onCourseStatus, openedCourses, onOpenCourse, learningChoices, onChooseLearningCourse }: {
  profile: Profile; roleId: string | null; onPickRole: (id: string) => void; onBackToMoves: () => void;
  learningChoices: Record<string, string>; onChooseLearningCourse: (role: string, url: string) => void;
  openedCourses: Set<string> | undefined; onOpenCourse: (url: string) => void;
  progress: CourseProgress; onCourseStatus: (course: string, action: LearningAction) => void;
}) {
  const t = useT();
  const tx = useTx();
  // Only the skill-fit part matters here; demand and scenario do not change the gaps.
  const { moves } = useMemo(
    () => recommendMoves(roles, profile.currentRoleId, profile.held, snapshots.q2, ilo, scenarios.moderate, transferable),
    [profile],
  );
  const chosen = moves.find((m) => m.role.id === roleId) ?? moves[0];
  const plan = useMemo(() => learningPlan(chosen, resources), [chosen]);
  const role = chosen.role;
  const persona = personaById(profile.persona);
  const suggested = useMemo(() => suggestedSteps(plan.uncovered, matches.skills), [plan]);
  const [showAllAi, setShowAllAi] = useState(false);
  const aiShown = showAllAi ? suggested.steps : suggested.steps.slice(0, 4);
  const total = plan.steps.length + suggested.steps.length;
  const courseChoices = [
    ...plan.steps.map(step => ({ title: step.resource.title, url: step.resource.url, provider: step.resource.provider, suggested: false })),
    ...suggested.steps.map(step => ({ title: step.course.name, url: step.course.url, provider: 'Coursera', suggested: true })),
  ];
  // Keep the existing checked-first plan order; submitted evidence is not completed learning.
  const selectedCourse = courseChoices.find(course => course.url === learningChoices[role.id]);
  const nextCourse = selectedCourse ?? courseChoices.find(course => !progress[course.url]);
  const activities = activityCount([...plan.steps.map(step => step.resource.url), ...suggested.steps.map(step => step.course.url)], progress);

  return <div className="step-body">
    <div className="who plan-who">
      <p>{persona
        ? (profile.currentRoleId
          ? tx('{who}, from {role}, to', { who: <strong>{t('Plan for {name}', { name: persona.name })}</strong>, role: roleById(profile.currentRoleId)?.title })
          : tx('{who} to', { who: <strong>{t('Plan for {name}', { name: persona.name })}</strong> }))
        : tx('{who} to', { who: <strong>{t('Your plan')}</strong> })}</p>
      <label className="plan-pick"><span className="visually-hidden">{t('Move to plan')}</span>
        <select value={role.id} onChange={(e) => onPickRole(e.target.value)}>
          {moves.map((m, i) => <option key={m.role.id} value={m.role.id}>{i + 1}. {m.role.title}</option>)}
        </select>
      </label>
      <button type="button" className="text-button" onClick={onBackToMoves}>{t('Back to your moves')}</button>
    </div>

    <div className="plan-layout">
    <div className="plan-main">
    {plan.gaps.length === 0
      ? <section className="panel"><h2>{t('Nothing to build')}</h2><p className="note">{t('You already have every essential ESCO skill for this role.')}</p></section>
      : <section className="panel plan-learning" aria-labelledby="plan-skills-heading">
        <h2 id="plan-skills-heading">{plan.gaps.length} {t('skills to build')}</h2>
        <p className="plan-learning-intro">{plan.steps.length === 0
          ? t('No checked course yet. Review the suggestions for these skills below.')
          : plan.uncovered.length === 0
            ? t('Start with the first checked course below.')
            : t('Start with a checked course, then review suggestions for the remaining skills.')}</p>
        {plan.steps.length > 0 && <p className="plan-total"><strong>{t('Estimated time: {h} hours', { h: plan.statedHours })}</strong> {t('for the {n} checked courses, as stated by each provider', { n: plan.steps.length })}{plan.stepsWithoutHours > 0 ? ` (${t('{n} without a stated time', { n: plan.stepsWithoutHours })})` : ''}{suggested.steps.length > 0 ? `; ${t('AI suggestions show their own time')}` : ''}.</p>}

        <LearningProgress total={activities.total} recorded={activities.recorded} />
        <LearningMilestones courseUrls={courseChoices.map(course=>course.url)} />
        {nextCourse ? <section className="next-learning" aria-labelledby="next-learning-title">
          <div>
            <h3 id="next-learning-title">{t('Learning course for {role}', {role: role.title})}</h3>
            <p className="next-course-title">{nextCourse.title}</p>
            <p className="note">{nextCourse.provider} · {t(nextCourse.suggested ? 'AI suggestion · not checked by hand' : 'Checked course')}</p>
          </div>
          <a className="primary-button" href={nextCourse.url} target="_blank" rel="noreferrer" onClick={() => onOpenCourse(nextCourse.url)} aria-label={t(openedCourses?.has(nextCourse.url) ? 'Continue learning: {name}' : 'Start learning: {name}', { name: nextCourse.title })}>{t(openedCourses?.has(nextCourse.url) ? 'Continue learning' : 'Start learning')}</a>
          <ChangeCourse key={(profile.persona ?? 'me') + role.id} courses={courseChoices} currentUrl={nextCourse.url} onConfirm={url=>onChooseLearningCourse(role.id,url)} />
          <p className="note next-learning-note">{t(selectedCourse ? 'You chose this course for this role. Continue reopens the provider page; lesson position and completion are not tracked.' : 'First course in your plan without submitted evidence. Continue reopens the provider page; lesson position and completion are not tracked.')}</p>
        </section> : courseChoices.length > 0 ? <section className="next-learning" aria-labelledby="next-learning-title">
          <h3 id="next-learning-title">{t('Evidence submitted for every course in this plan')}</h3>
          <ChangeCourse key={(profile.persona ?? 'me') + role.id} courses={courseChoices} currentUrl={undefined} onConfirm={url=>onChooseLearningCourse(role.id,url)} />
          <p className="note next-learning-note">{t('Completion is still unverified. You can reopen any course below to keep learning, or edit its evidence.')}</p>
        </section> : null}
        {total + Number(hasNoss(role.id)) > 0 && <ol className={`plan-steps${total + Number(hasNoss(role.id)) === 1 ? ' single' : ''}`}>
          {plan.steps.map((step, i) => <CourseCard key={step.resource.id} n={i + 1} showNumber={total + Number(hasNoss(role.id)) > 1} primary={i === 0}
            title={step.resource.title} url={step.resource.url} closes={step.closes} onOpen={() => onOpenCourse(step.resource.url)}
            extra={<CourseProgressControl key={(profile.persona ?? 'me') + step.resource.url} status={progress[step.resource.url]} onAction={(action) => onCourseStatus(step.resource.url, action)} />}
            label={<span className="course-kind checked">{t('Checked course')}</span>}
            meta={<span title={step.resource.timeBasis}>{step.resource.provider} · {t(step.resource.level)} · {step.resource.free ? t(step.resource.cost) : step.resource.access === 'rakyat-digital' ? t('Paid; free 3 months via Rakyat Digital') : <span className="plan-paid">{t(step.resource.cost)}</span>} · {step.resource.hours !== null ? t('{n} hours', { n: step.resource.hours }) : t(step.resource.timeBasis)}</span>} />)}
          {aiShown.map((step, i) => <CourseCard key={step.course.slug} n={plan.steps.length + i + 1} showNumber={total + Number(hasNoss(role.id)) > 1} primary={plan.steps.length === 0 && i === 0}
            title={step.course.name} url={step.course.url} closes={step.closes} onOpen={() => onOpenCourse(step.course.url)}
            extra={<CourseProgressControl key={(profile.persona ?? 'me') + step.course.url} status={progress[step.course.url]} onAction={(action) => onCourseStatus(step.course.url, action)} />}
            label={<span className="course-kind ai">{t('AI suggestion · match {n}%', { n: Math.round(step.bestMatch * 100) })}</span>}
            meta={<>Coursera · {t('Paid; free 3 months via Rakyat Digital')} · {step.course.workload ?? t('time not stated')}</>} />)}
          {hasNoss(role.id) && <NossRoute roleId={role.id} n={plan.steps.length + aiShown.length + 1} />}
        </ol>}
        {suggested.steps.length > 4 && <button type="button" className="text-button plan-more" onClick={() => setShowAllAi(!showAllAi)}>{showAllAi ? t('Show fewer') : t('Show all {n} suggestions', { n: suggested.steps.length })}</button>}

        {suggested.unmatched.length > 0 && <div className="plan-unmatched"><span className="plan-closes">{t('No course found yet')}</span>{suggested.unmatched.map((g) => <GapTag key={g.skill.uri} gap={g} />)}</div>}

        {[...new Set(plan.steps.map((s) => s.resource.access).filter((a): a is string => !!a))].map((id) => <p key={id} className="plan-access note">
          <strong><a href={access[id].url} target="_blank" rel="noreferrer">{t(access[id].name)}</a>:</strong> {t(access[id].note)} <a href={access[id].source} target="_blank" rel="noreferrer">{t('Source')}</a>.
        </p>)}

        <p className="plan-access note"><strong>HRD Corp:</strong> {t(hrd.claimable.note)} <a href={hrd.claimable.url} target="_blank" rel="noreferrer">{t(hrd.claimable.name)}</a>. {t(hrd.elatih.note)} <a href={hrd.elatih.url} target="_blank" rel="noreferrer">{t(hrd.elatih.name)}</a>. {t('Checked by hand on {date}.', { date: hrd.checkedAt })}</p>

        <p className="plan-method note">
          {plan.steps.length > 0 && t('Checked courses: opened by hand on {date}; ordered by how many gaps they cover, then price and stated hours.', { date: resourcesFile.checkedAt })}{' '}
          {suggested.steps.length > 0 && t('AI suggestions: RunPod compared {n} Coursera course descriptions with the remaining skills and ordered them the same way; not checked by hand, and match % is text similarity, not quality. Catalogue retrieved {date}; eligible Malaysians can get Coursera free for 3 months through Rakyat Digital.', { n: matches.method.coursesEmbedded.toLocaleString(), date: matches.method.catalogue.retrievedAt })}
        </p>
        {!hasNoss(role.id) && <NossRoute roleId={role.id} />}
      </section>}

    {plan.gaps.length === 0 && <NossRoute roleId={role.id} />}

    </div>
    <SdgContribution roleId={role.id} skills={plan.gaps.map((g) => g.skill)} heading={t('This move and the SDGs')} compact />
    </div>

  </div>;
}
