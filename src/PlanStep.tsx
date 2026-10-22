// Step 3: a learning plan for one chosen move.
// Rule: src/pathway.ts (documented in SIGNALS_AND_MATCHING.md, "Learning plan rule").
// Courses: data/pathway/resources.json. NOSS: data/pathway/noss.json. Both checked by hand.
import type React from 'react';
import { useMemo } from 'react';
import resourcesFile from '../data/pathway/resources.json';
import nossFile from '../data/pathway/noss.json';
import { ilo, personaById, roles, snapshots, transferable, type Profile } from './data';
import { learningPlan, suggestedSteps, type Gap, type Resource, type SuggestedCourse } from './pathway';
import { recommendMoves, scenarios } from './scoring';
import { useLang, useT } from './i18n';
import { SdgBadge } from './SdgViews';
import { roleSdgs, sdgTotals } from './sdg';
import matchesFile from '../data/derived/coursera-skill-matches.json';
import { CourseProgressControl } from './CourseProgress';
import type { CourseProgress, LearningAction } from './learningCheck';

const resources = resourcesFile.resources as Resource[];
// AI-matched Coursera courses (RunPod, bge-m3); see scripts/match_courses_runpod.py.
export const matches = matchesFile as { method: { coursesEmbedded: number; catalogue: { retrievedAt: string } }; skills: Record<string, { courses: SuggestedCourse[] } | undefined> };
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

/** Optional Malaysian certification route, separate from the courses that build skills. */
function NossRoute({ roleId }: { roleId: string }) {
  const t = useT();
  const lang = useLang();
  const entry = nossRoles[roleId];
  if (!entry || entry.noss.length === 0) return null;
  // Show the Malay title in Bahasa Malaysia, the English one otherwise; merge levels that share a title.
  const titleOf = (n: NossEntry) => (lang === 'ms' ? n.title.replace(/ \([^)]*\)$/, '') : n.title.match(/\(([^)]*)\)$/)?.[1] ?? n.title);
  const groups = new Map<string, NossEntry[]>();
  for (const n of entry.noss) groups.set(titleOf(n), [...(groups.get(titleOf(n)) ?? []), n]);
  const first = entry.noss[0];
  const levels = (list: NossEntry[]) => list.map((n) => n.level).sort().join(` ${t('or')} `);
  return <div className="plan-fact"><span>{t('Optional certification')}{entry.match === 'related' ? ` · ${t('Related route')}` : ''}</span><a href={`${nossSources[first.source].url}#page=${first.page}`} target="_blank" rel="noreferrer">SKM {[...groups][0][0]} · {t('Level')} {levels([...groups][0][1])} ↗</a></div>;
}

export function PlanStep({ profile, roleId, onPickRole, onBackToMoves, progress, onCourseStatus, openedCourses, onOpenCourse, learningChoices, onChooseLearningCourse }: {
  profile: Profile; roleId: string | null; onPickRole: (id: string) => void; onBackToMoves: () => void;
  learningChoices: Record<string, string>; onChooseLearningCourse: (role: string, url: string) => void;
  openedCourses: Set<string> | undefined; onOpenCourse: (url: string) => void;
  progress: CourseProgress; onCourseStatus: (course: string, action: LearningAction) => void;
}) {
  const t = useT();
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
  const total = plan.steps.length + suggested.steps.length;
  const courseChoices = [
    ...plan.steps.map(step => ({ title: step.resource.title, url: step.resource.url, provider: step.resource.provider, suggested: false, closes: step.closes, time: step.resource.hours === null ? null : t('{n} hours', { n: step.resource.hours }), accessId: step.resource.access })),
    ...suggested.steps.map(step => ({ title: step.course.name, url: step.course.url, provider: 'Coursera', suggested: true, closes: step.closes, time: step.course.workload, accessId: 'rakyat-digital' })),
  ];
  // Keep the existing checked-first plan order; submitted evidence is not completed learning.
  const selectedCourse = courseChoices.find(course => course.url === learningChoices[role.id]);
  const nextCourse = selectedCourse ?? courseChoices.find(course => !progress[course.url]) ?? courseChoices[0];
  const sdgTargets = [...new Set([...roleSdgs(role).map(link => link.target), ...sdgTotals(plan.gaps.map(gap => gap.skill)).map(link => link.target)].filter(target => target !== '4.4'))];

  return <div className="step-body">
    <div className="who plan-who">
      <p><strong>{persona ? t('Plan for {name}', { name: persona.name }) : t('Your plan')}</strong></p>
      <label className="plan-pick"><span className="visually-hidden">{t('Move to plan')}</span>
        <select value={role.id} onChange={(e) => onPickRole(e.target.value)}>
          {moves.map((m, i) => <option key={m.role.id} value={m.role.id}>{i + 1}. {m.role.title}</option>)}
        </select>
      </label>
      <button type="button" className="text-button" onClick={onBackToMoves}>{t('Back to your moves')}</button>
    </div>

    {plan.gaps.length === 0
      ? <section className="panel"><h2>{t('Nothing to build')}</h2><p className="note">{t('You already have every essential ESCO skill for this role.')}</p></section>
      : <section className="panel plan-dashboard" aria-labelledby="plan-skills-heading">
        <div className="plan-dashboard-top">
          <div><h2 id="plan-skills-heading">{t('{n} skills to build', { n: plan.gaps.length })}</h2>
          <p>{total > 0 ? t('{n} courses to choose from', { n: total }) : t('No course found yet')}</p></div>
        </div>
        {nextCourse && <div className="plan-dashboard-body">
          <div className="plan-course-picker">
            <label htmlFor="plan-course-choice">{t('Choose a course')}</label>
            <select id="plan-course-choice" value={nextCourse.url} onChange={event => onChooseLearningCourse(role.id, event.target.value)}>
              {courseChoices.map((course, index) => <option key={course.url} value={course.url}>{index + 1}. {course.title}{course.suggested ? ` · ${t('AI suggestion')}` : ''}</option>)}
            </select>
            <p className="plan-course-source">{nextCourse.provider} · {nextCourse.time ?? t('time not stated')} · {t(nextCourse.suggested ? 'AI suggestion · not checked by hand' : 'Checked course')}</p>
          </div>
          <div className="plan-selected-course">
            <div className="plan-selected-heading"><div><h3>{nextCourse.title}</h3></div>
              <a className="primary-button" href={nextCourse.url} target="_blank" rel="noreferrer" onClick={() => onOpenCourse(nextCourse.url)} aria-label={t(openedCourses?.has(nextCourse.url) ? 'Continue learning: {name}' : 'Start learning: {name}', { name: nextCourse.title })}>{t(openedCourses?.has(nextCourse.url) ? 'Continue learning' : 'Start learning')} ↗</a></div>
            <div className="tag-row plan-selected-skills"><span className="plan-closes">{t('Builds')}</span>{nextCourse.closes.map(gap => <GapTag key={gap.skill.uri} gap={gap} />)}</div>
            <CourseProgressControl key={(profile.persona ?? 'me') + nextCourse.url} status={progress[nextCourse.url]} onAction={action => onCourseStatus(nextCourse.url, action)} />
            <p className="plan-verification-note">{t('Completion not verified here')}</p>
          </div>
        </div>}
        {suggested.unmatched.length > 0 && <div className="plan-unmatched"><span className="plan-closes">{t('No course found yet')}</span>{suggested.unmatched.map(gap => <GapTag key={gap.skill.uri} gap={gap} />)}</div>}
        <div className="plan-facts">
          <NossRoute roleId={role.id} />
          {nextCourse?.accessId && access[nextCourse.accessId] && <div className="plan-fact"><span>{t('Access')}</span><a href={access[nextCourse.accessId].url} target="_blank" rel="noreferrer">{t(access[nextCourse.accessId].name)} ↗</a></div>}
          <div className="plan-fact"><span>{t('Linked goals')}</span><div className="plan-sdg-badges">{[...sdgTargets, '4.4'].map(target => <SdgBadge key={target} target={target} short />)}</div></div>
          <div className="plan-fact plan-milestone-fact"><span>{t('Milestones')} · {t('Locked until verification')}</span><div className="plan-mini-milestones"><span><b aria-hidden="true">1</b>{t('First course')}</span><span><b aria-hidden="true">✓</b>{t('Full plan')}</span></div></div>
        </div>
      </section>}

  </div>;
}
