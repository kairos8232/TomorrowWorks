// Step 3: a learning plan for one chosen move.
// Rule: src/pathway.ts (documented in SIGNALS_AND_MATCHING.md, "Learning plan rule").
// Courses: data/pathway/resources.json. NOSS: data/pathway/noss.json. Both checked by hand.
import { useMemo } from 'react';
import resourcesFile from '../data/pathway/resources.json';
import nossFile from '../data/pathway/noss.json';
import { ilo, personaById, roleById, roles, snapshots, transferable, type Profile } from './data';
import { learningPlan, type Gap, type Resource } from './pathway';
import { recommendMoves, scenarios } from './scoring';
import { useT, useTx } from './i18n';
import { SdgContribution } from './SdgViews';
import { AiCourses } from './AiCourses';

const resources = resourcesFile.resources as Resource[];
const access = resourcesFile.access as Record<string, { name: string; url: string; note: string; source: string }>;
type NossEntry = { code: string; title: string; level: number; source: string; page: number };
type NossRole = { match: 'close' | 'related' | 'none'; noss: NossEntry[]; note?: string };
const nossRoles = nossFile.roles as Record<string, NossRole>;
const nossSources = nossFile.sources as Record<string, { name: string; url: string }>;

function GapTag({ gap }: { gap: Gap }) {
  return gap.partly
    ? <span className="skill-tag related" title={`≈ ${gap.partly}`}>{gap.skill.label}<small>≈ {gap.partly}</small></span>
    : <span className="skill-tag skill-gap">{gap.skill.label}</span>;
}

function NossRoute({ roleId }: { roleId: string }) {
  const t = useT();
  const entry = nossRoles[roleId];
  return <section className="panel plan-noss" aria-labelledby="noss">
    <h2 id="noss">{t('Malaysian certification route')}</h2>
    {!entry || entry.noss.length === 0
      ? <p>{t('No matching National Occupational Skills Standard (NOSS) in the current JPK register (January 2025).')}</p>
      : <>
        <ul className="noss-list">{entry.noss.map((n) => <li key={n.code}>
          <strong>{t('SKM Level {n}', { n: n.level })}: {n.title}</strong>
          <span>NOSS {n.code} · <a href={`${nossSources[n.source].url}#page=${n.page}`} target="_blank" rel="noreferrer">{t('JPK register, Jan 2025, p. {n}', { n: n.page })}</a></span>
        </li>)}</ul>
        <p className="note">{entry.match === 'related' ? `${t('A related standard, not the same job.')} ${entry.note ? t(entry.note) : ''}` : t('Closest standard by title.')} {t('An SKM is earned at a JPK-accredited centre (Jabatan Pembangunan Kemahiran) or through recognition of prior learning (PPT). It is one route, not a requirement for the job. Check the code’s current status with JPK before enrolling.')}</p>
      </>}
    <p className="note">{t('Checked by hand on {date}.', { date: nossFile.checkedAt })}</p>
  </section>;
}

export function PlanStep({ profile, roleId, onPickRole, onBackToMoves }: {
  profile: Profile; roleId: string | null; onPickRole: (id: string) => void; onBackToMoves: () => void;
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
  const closed = plan.gaps.length - plan.uncovered.length;
  const persona = personaById(profile.persona);
  const partly = plan.gaps.filter((g) => g.partly).length;

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

    {plan.gaps.length === 0
      ? <section className="panel"><h2>{t('Nothing to build')}</h2><p className="note">{t('You already have every essential ESCO skill for this role.')}</p></section>
      : <>
        <p className="plan-summary">
          {tx('{n} essential skills to build.', { n: <strong>{plan.gaps.length}</strong> })}{' '}
          {partly > 0 && <>{t('{n} of them are partly there.', { n: partly })}{' '}</>}
          {plan.steps.length > 0
            ? <>
              {plan.steps.length === 1 ? t('1 course covers {k} of them.', { k: closed }) : t('{n} courses cover {k} of them.', { n: plan.steps.length, k: closed })}{' '}
              {plan.statedHours > 0 && <>{tx('About {h} of study, as the providers state it.', { h: <strong>{t('{n} hours', { n: plan.statedHours })}</strong> })}{' '}</>}
              {plan.stepsWithoutHours > 0 && t('{n} more with no stated hours.', { n: plan.stepsWithoutHours })}
            </>
            : t('None of the courses we have checked covers them yet.')}
        </p>

        {plan.steps.length > 0 && <ol className="plan-steps">
          {plan.steps.map((step, i) => <li key={step.resource.id}>
            <span className="plan-num">{i + 1}</span>
            <div>
              <h3><a href={step.resource.url} target="_blank" rel="noreferrer">{step.resource.title}</a></h3>
              <p className="plan-meta">{step.resource.provider} · {t(step.resource.level)} · {step.resource.free ? t(step.resource.cost) : <span className="plan-paid">{t(step.resource.cost)}</span>}</p>
              <p className="plan-time" title={step.resource.timeBasis}>{step.resource.hours !== null ? t('{n} hours of study, as stated on the course page.', { n: step.resource.hours }) : `${t(step.resource.timeBasis)}.`}</p>
              <div className="tag-row"><span className="plan-closes">{t('Builds')}</span>{step.closes.map((g) => <GapTag key={g.skill.uri} gap={g} />)}</div>
            </div>
          </li>)}
        </ol>}

        {[...new Set(plan.steps.map((s) => s.resource.access).filter((a): a is string => !!a))].map((id) => <p key={id} className="plan-access note">
          <strong><a href={access[id].url} target="_blank" rel="noreferrer">{t(access[id].name)}</a>:</strong> {t(access[id].note)} <a href={access[id].source} target="_blank" rel="noreferrer">{t('Source')}</a>.
        </p>)}

        {plan.uncovered.length > 0 && <section className="skill-list plan-left">
          <h4>{t('Skills without a checked course')} <span>({plan.uncovered.length})</span></h4>
          <div className="tag-row">{plan.uncovered.map((g) => <GapTag key={g.skill.uri} gap={g} />)}</div>
          <p className="note">{t('We list a course only after checking its page against the skill.')}</p>
        </section>}

        {plan.uncovered.length > 0 && <AiCourses skills={plan.uncovered.map((g) => g.skill)} />}

        <details className="how-to-read">
          <summary>{t('How this plan is made')}</summary>
          <dl>
            <div><dt>{t('Skills')}</dt><dd>{t('The role’s essential ESCO skills you don’t have yet. A skill you partly have (≈) is included because it only counts half.')}</dd></div>
            <div><dt>{t('Order')}</dt><dd>{t('Start with the course that builds the most of your missing skills, then the next. If two are equal, a free course comes before a paid one, then the one with fewer stated hours.')}</dd></div>
            <div><dt>{t('Time')}</dt><dd>{t('The study time each provider states on its course page. We don’t estimate it ourselves.')}</dd></div>
            <div><dt>{t('Courses')}</dt><dd>{t('OpenLearn, CS50x and UN CC:Learn (free) and Coursera (paid, or free for 3 months through Rakyat Digital), each checked by hand on its own page on {date}. The link to each skill is our reading of the course’s stated outcomes and skills.', { date: resourcesFile.checkedAt })}</dd></div>
          </dl>
        </details>
      </>}

    <SdgContribution roleId={role.id} skills={plan.gaps.map((g) => g.skill)} heading={t('How this move connects to the SDGs')} />

    <NossRoute roleId={role.id} />
  </div>;
}
