// Step 3: a learning plan for one chosen move.
// Rule: src/pathway.ts (documented in SIGNALS_AND_MATCHING.md, "Learning plan rule").
// Courses: data/pathway/resources.json. NOSS: data/pathway/noss.json. Both checked by hand.
import { useMemo } from 'react';
import resourcesFile from '../data/pathway/resources.json';
import nossFile from '../data/pathway/noss.json';
import { ilo, personaById, roleById, roles, snapshots, transferable, type Profile } from './data';
import { learningPlan, type Gap, type Resource } from './pathway';
import { recommendMoves, scenarios } from './scoring';

const resources = resourcesFile.resources as Resource[];
const access = resourcesFile.access as Record<string, { name: string; url: string; note: string; source: string }>;
type NossEntry = { code: string; title: string; level: number; source: string; page: number };
type NossRole = { match: 'close' | 'related' | 'none'; noss: NossEntry[]; note?: string };
const nossRoles = nossFile.roles as Record<string, NossRole>;
const nossSources = nossFile.sources as Record<string, { name: string; url: string }>;

function GapTag({ gap }: { gap: Gap }) {
  return gap.partly
    ? <span className="skill-tag related" title={`You have a related skill: ${gap.partly}`}>{gap.skill.label}<small>≈ {gap.partly}</small></span>
    : <span className="skill-tag skill-gap">{gap.skill.label}</span>;
}

function NossRoute({ roleId }: { roleId: string }) {
  const entry = nossRoles[roleId];
  return <section className="panel plan-noss" aria-labelledby="noss">
    <h2 id="noss">Malaysian certification route</h2>
    {!entry || entry.noss.length === 0
      ? <p>No matching National Occupational Skills Standard (NOSS) in the current JPK register (January 2025).</p>
      : <>
        <ul className="noss-list">{entry.noss.map((n) => <li key={n.code}>
          <strong>SKM Level {n.level}: {n.title}</strong>
          <span>NOSS {n.code} · <a href={`${nossSources[n.source].url}#page=${n.page}`} target="_blank" rel="noreferrer">JPK register, Jan 2025, p. {n.page}</a></span>
        </li>)}</ul>
        <p className="note">{entry.match === 'related' ? `A related standard, not the same job. ${entry.note ?? ''}` : 'Closest standard by title.'} An SKM is earned at a JPK-accredited centre or through recognition of prior learning (PPT). It is one route, not a requirement for the job. Check the code’s current status with <abbr title="Jabatan Pembangunan Kemahiran">JPK</abbr> before enrolling.</p>
      </>}
    <p className="note">Checked by hand on {nossFile.checkedAt}.</p>
  </section>;
}

export function PlanStep({ profile, roleId, onPickRole, onBackToMoves }: {
  profile: Profile; roleId: string | null; onPickRole: (id: string) => void; onBackToMoves: () => void;
}) {
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

  return <div className="step-body">
    <div className="who plan-who">
      <p>{persona ? <><strong>Plan for {persona.name}</strong>{profile.currentRoleId ? <>, from {roleById(profile.currentRoleId)?.title}</> : ''}</> : <strong>Your plan</strong>} to</p>
      <label className="plan-pick"><span className="visually-hidden">Move to plan</span>
        <select value={role.id} onChange={(e) => onPickRole(e.target.value)}>
          {moves.map((m, i) => <option key={m.role.id} value={m.role.id}>{i + 1}. {m.role.title}</option>)}
        </select>
      </label>
      <button type="button" className="text-button" onClick={onBackToMoves}>Back to your moves</button>
    </div>

    {plan.gaps.length === 0
      ? <section className="panel"><h2>Nothing to build</h2><p className="note">You already have every essential ESCO skill for this role.</p></section>
      : <>
        <p className="plan-summary">
          <strong>{plan.gaps.length}</strong> essential {plan.gaps.length === 1 ? 'skill' : 'skills'} to build{plan.gaps.some((g) => g.partly) ? `, ${plan.gaps.filter((g) => g.partly).length} of them partly there` : ''}.{' '}
          {plan.steps.length > 0
            ? <>{plan.steps.length} {plan.steps.length === 1 ? 'course covers' : 'courses cover'} {closed} of them{plan.statedHours > 0 ? <>, about <strong>{plan.statedHours} hours</strong> of study as the providers state it</> : ''}{plan.stepsWithoutHours ? ` (plus ${plan.stepsWithoutHours} ${plan.stepsWithoutHours === 1 ? 'course' : 'courses'} with no stated hours)` : ''}.</>
            : 'None of the courses we have checked covers them yet.'}
        </p>

        {plan.steps.length > 0 && <ol className="plan-steps">
          {plan.steps.map((step, i) => <li key={step.resource.id}>
            <span className="plan-num">{i + 1}</span>
            <div>
              <h3><a href={step.resource.url} target="_blank" rel="noreferrer">{step.resource.title}</a></h3>
              <p className="plan-meta">{step.resource.provider} · {step.resource.level} · {step.resource.free ? step.resource.cost : <span className="plan-paid">{step.resource.cost}</span>}</p>
              <p className="plan-time">{step.resource.timeBasis}.</p>
              <div className="tag-row"><span className="plan-closes">Builds</span>{step.closes.map((g) => <GapTag key={g.skill.uri} gap={g} />)}</div>
            </div>
          </li>)}
        </ol>}

        {[...new Set(plan.steps.map((s) => s.resource.access).filter((a): a is string => !!a))].map((id) => <p key={id} className="plan-access note">
          <strong><a href={access[id].url} target="_blank" rel="noreferrer">{access[id].name}</a>:</strong> {access[id].note} <a href={access[id].source} target="_blank" rel="noreferrer">Source</a>.
        </p>)}

        {plan.uncovered.length > 0 && <section className="skill-list plan-left">
          <h4>No checked course yet <span>{plan.uncovered.length}</span></h4>
          <div className="tag-row">{plan.uncovered.map((g) => <GapTag key={g.skill.uri} gap={g} />)}</div>
          <p className="note">We only list a course after opening its page and matching its stated outcomes to the skill. These skills have no match yet.</p>
        </section>}

        <details className="how-to-read">
          <summary>How this plan is made</summary>
          <dl>
            <div><dt>Skills</dt><dd>The role’s essential ESCO skills you don’t have yet. A skill you partly have (≈) is included because it only counts half.</dd></div>
            <div><dt>Order</dt><dd>Start with the course that builds the most of your missing skills, then the next. If two are equal, a free course comes before a paid one, then the one with fewer stated hours.</dd></div>
            <div><dt>Time</dt><dd>The study time each provider states on its course page. We don’t estimate it ourselves.</dd></div>
            <div><dt>Courses</dt><dd>OpenLearn, CS50x and UN CC:Learn (free) and Coursera (paid, or free for 3 months through Rakyat Digital), each checked by hand on its own page on {resourcesFile.checkedAt}. The link to each skill is our reading of the course’s stated outcomes and skills.</dd></div>
          </dl>
        </details>
      </>}

    <NossRoute roleId={role.id} />
  </div>;
}
