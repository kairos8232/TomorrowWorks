// Learning plan for one chosen move. Documented in SIGNALS_AND_MATCHING.md
// ("Learning plan rule") and tested in src/pathway.test.ts.
//
// Gaps     = the role's essential skills the person is missing, plus the
//            transferable ones (only half credit, so still worth learning).
// Steps    = free courses from data/pathway/resources.json, picked greedily:
//            each step is the course that closes the most remaining gaps
//            (ties: more fully missing skills, then fewer stated hours,
//            then file order). Stop when no course closes another gap.
// Time     = the study hours each provider states. Never estimated by us.
// Leftover = gaps no checked course covers, shown as such.
import type { RoleScore, Skill } from './scoring';

export type Resource = {
  id: string;
  title: string;
  provider: string;
  url: string;
  cost: string;
  level: string;
  hours: number | null;
  timeBasis: string;
  covers: string[];
};

export type Gap = { skill: Skill; partly: string | null };

export type PlanStep = { resource: Resource; closes: Gap[] };

export function learningPlan(result: RoleScore, resources: Resource[]) {
  const gaps: Gap[] = [
    ...result.fit.missing.map((skill) => ({ skill, partly: null })),
    ...result.fit.transferable.map((t) => ({ skill: t.need, partly: t.have.label })),
  ];
  let open = gaps;
  const steps: PlanStep[] = [];
  const unused = [...resources];

  while (open.length > 0) {
    let best: { index: number; closes: Gap[]; full: number } | null = null;
    unused.forEach((resource, index) => {
      const closes = open.filter((g) => resource.covers.includes(g.skill.label));
      const full = closes.filter((g) => g.partly === null).length;
      if (closes.length === 0) return;
      const better = !best
        || closes.length > best.closes.length
        || (closes.length === best.closes.length && full > best.full)
        || (closes.length === best.closes.length && full === best.full && (resource.hours ?? Infinity) < (unused[best.index].hours ?? Infinity));
      if (better) best = { index, closes, full };
    });
    if (!best) break;
    const pick = best as { index: number; closes: Gap[] };
    steps.push({ resource: unused[pick.index], closes: pick.closes });
    open = open.filter((g) => !pick.closes.includes(g));
    unused.splice(pick.index, 1);
  }

  const statedHours = steps.reduce((sum, s) => sum + (s.resource.hours ?? 0), 0);
  return {
    gaps,
    steps,
    uncovered: open,
    statedHours,
    stepsWithoutHours: steps.filter((s) => s.resource.hours === null).length,
  };
}

export type LearningPlan = ReturnType<typeof learningPlan>;
