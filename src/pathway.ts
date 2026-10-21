// Learning plan for one chosen move. Documented in SIGNALS_AND_MATCHING.md
// ("Learning plan rule") and tested in src/pathway.test.ts.
//
// Gaps     = the role's essential skills the person is missing, plus the
//            transferable ones (only half credit, so still worth learning).
// Steps    = courses from data/pathway/resources.json, picked greedily:
//            each step is the course that closes the most remaining gaps
//            (ties: more fully missing skills, then free before paid, then
//            fewer stated hours, then file order). Stop when no course
//            closes another gap.
// Time     = the study hours each provider states. Never estimated by us.
// Leftover = gaps no checked course covers, shown as such.
import type { RoleScore, Skill } from './scoring';

export type Resource = {
  id: string;
  title: string;
  provider: string;
  url: string;
  cost: string;
  free: boolean;
  access: string | null;
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
      const rival = best ? unused[best.index] : null;
      const better = !best || !rival
        || closes.length > best.closes.length
        || (closes.length === best.closes.length && full > best.full)
        || (closes.length === best.closes.length && full === best.full && resource.free && !rival.free)
        || (closes.length === best.closes.length && full === best.full && resource.free === rival.free
          && (resource.hours ?? Infinity) < (rival.hours ?? Infinity));
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

/** One AI-matched course per step, from data/derived/coursera-skill-matches.json. */
export type SuggestedCourse = { slug: string; name: string; url: string; workload: string | null; similarity: number };
export type SuggestedStep = { course: SuggestedCourse; closes: Gap[]; bestMatch: number };

/**
 * Same greedy rule as the checked plan, for the gaps no checked course covers:
 * each step is the AI-matched course that appears in the most remaining gaps'
 * match lists (ties: higher best match). Gaps without any match are returned.
 */
export function suggestedSteps(gaps: Gap[], matchesByUri: Record<string, { courses: SuggestedCourse[] } | undefined>) {
  let open = gaps.filter((g) => (matchesByUri[g.skill.uri]?.courses.length ?? 0) > 0);
  const unmatched = gaps.filter((g) => !open.includes(g));
  const steps: SuggestedStep[] = [];
  while (open.length > 0) {
    const bySlug = new Map<string, SuggestedStep>();
    for (const g of open) for (const c of matchesByUri[g.skill.uri]!.courses) {
      const step = bySlug.get(c.slug) ?? { course: c, closes: [], bestMatch: 0 };
      step.closes.push(g);
      step.bestMatch = Math.max(step.bestMatch, c.similarity);
      bySlug.set(c.slug, step);
    }
    const pick = [...bySlug.values()].sort((a, b) => b.closes.length - a.closes.length || b.bestMatch - a.bestMatch)[0];
    steps.push(pick);
    open = open.filter((g) => !pick.closes.includes(g));
  }
  return { steps, unmatched };
}
