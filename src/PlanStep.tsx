// Step 3: a learning plan for one chosen move.
// Rule: src/pathway.ts (documented in SIGNALS_AND_MATCHING.md, "Learning plan rule").
// Courses: data/pathway/resources.json, checked by hand.
import { useMemo } from 'react';
import resourcesFile from '../data/pathway/resources.json';
import { aina, ilo, roleById, roles, snapshots, transferable, type Profile } from './data';
import { learningPlan, type Gap, type Resource } from './pathway';
import { recommendMoves, scenarios } from './scoring';

const resources = resourcesFile.resources as Resource[];
function GapTag({ gap }: { gap: Gap }) {
  return gap.partly
    ? <span className="skill-tag related" title={`You have a related skill: ${gap.partly}`}>{gap.skill.label}<small>≈ {gap.partly}</small></span>
    : <span className="skill-tag skill-gap">{gap.skill.label}</span>;
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

  return <div className="step-body">
    <div className="who plan-who">
      <p>{profile.persona === 'aina' ? <><strong>Plan for {aina.name}</strong>, from {roleById(profile.currentRoleId)?.title}</> : <strong>Your plan</strong>} to</p>
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
            ? <>{plan.steps.length} free {plan.steps.length === 1 ? 'course covers' : 'courses cover'} {closed} of them{plan.statedHours > 0 ? <>, about <strong>{plan.statedHours} hours</strong> of study as the providers state it</> : ''}{plan.stepsWithoutHours ? ` (plus ${plan.stepsWithoutHours} ${plan.stepsWithoutHours === 1 ? 'course' : 'courses'} with no stated hours)` : ''}.</>
            : 'None of the courses we have checked covers them yet.'}
        </p>

        {plan.steps.length > 0 && <ol className="plan-steps">
          {plan.steps.map((step, i) => <li key={step.resource.id}>
            <span className="plan-num">{i + 1}</span>
            <div>
              <h3><a href={step.resource.url} target="_blank" rel="noreferrer">{step.resource.title}</a></h3>
              <p className="plan-meta">{step.resource.provider} · {step.resource.level} · {step.resource.cost}</p>
              <p className="plan-time">{step.resource.timeBasis}.</p>
              <div className="tag-row"><span className="plan-closes">Builds</span>{step.closes.map((g) => <GapTag key={g.skill.uri} gap={g} />)}</div>
            </div>
          </li>)}
        </ol>}

        {plan.uncovered.length > 0 && <section className="skill-list plan-left">
          <h4>No checked course yet <span>{plan.uncovered.length}</span></h4>
          <div className="tag-row">{plan.uncovered.map((g) => <GapTag key={g.skill.uri} gap={g} />)}</div>
          <p className="note">We only list a course after opening its page and matching its stated outcomes to the skill. These skills have no match yet.</p>
        </section>}

        <details className="how-to-read">
          <summary>How this plan is made</summary>
          <dl>
            <div><dt>Skills</dt><dd>The role’s essential ESCO skills you don’t have yet. A skill you partly have (≈) is included because it only counts half.</dd></div>
            <div><dt>Order</dt><dd>Start with the course that builds the most of your missing skills, then the next. If two are equal, the one with fewer stated hours comes first.</dd></div>
            <div><dt>Time</dt><dd>The study time each provider states on its course page. We don’t estimate it ourselves.</dd></div>
            <div><dt>Courses</dt><dd>Free courses checked by hand on {resourcesFile.checkedAt}. The link to each skill is our reading of the course’s stated outcomes.</dd></div>
          </dl>
        </details>
      </>}

  </div>;
}
