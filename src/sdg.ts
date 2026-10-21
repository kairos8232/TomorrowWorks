// SDG links for roles and skills. Tested in src/sdg.test.ts.
//
// Skill -> UN targets matched by RunPod (BAAI/bge-m3): cosine similarity between the
//          ESCO skill text and the official UN target text (scripts/match_sdg_runpod.py,
//          data/derived/sdg-skill-matches.json). Levels (data/sdg/sdg-review.json):
//            strong   = similarity >= threshold (0.60) and not rejected by the human check;
//                       used for tags, role links and the optional Goals ranking.
//            possible = similarity from possibleFrom (0.55) up to the threshold, not rejected;
//                       shown as "possible, not checked", never used for ranking or tags.
//            below possibleFrom: not shown.
//          ESCO digital skills also link to 4.4 (indicator 4.4.1 counts ICT skills).
//          Baseline: every skill counts towards 4.4 (relevant skills for decent jobs), shown once.
// Role  -> the two targets matched strongly by most of its essential skills (none is fine).
import sdgFile from '../data/sdg/sdg-links.json';
import reviewFile from '../data/sdg/sdg-review.json';
import matchFile from '../data/derived/sdg-skill-matches.json';
import unFile from '../data/sources/un-sdg-targets.json';
import type { Skill } from './scoring';

/** source: 'ai' = RunPod match; 'esco' = ESCO digital flag. level: see the rule above. */
export type SdgLink = { target: string; source: 'ai' | 'esco'; level: 'strong' | 'possible'; similarity?: number; skills?: Skill[] };
export const sdgData = sdgFile as {
  goals: Record<string, { name: string; short: string; colour: string }>;
  targets: Record<string, { goal: string; title: string }>;
  pickerGoals: string[];
};
export const sdgReview = reviewFile;
export const sdgMatches = matchFile as { method: { model: string; where: string; matchedAt: string; targets: { name: string; url: string; retrievedAt: string } }; skills: Record<string, { label: string; targets: { code: string; similarity: number }[] }> };
const unTitles = new Map(unFile.targets.map((t) => [t.code, t.title]));

export const goalUrl = (goal: string) => `https://sdgs.un.org/goals/goal${goal}`;
export const targetGoal = (code: string) => sdgData.targets[code]?.goal ?? code.split('.')[0];
/** Short title used on screen (shortened from the UN text); the official UN text otherwise. */
export const targetTitle = (code: string) => sdgData.targets[code]?.title ?? unTitles.get(code) ?? code;

const rejectedTargets = new Set(sdgReview.rejectTargets.map((r) => r.target));
const rejectedPairs = new Set(sdgReview.rejectPairs.map((r) => `${r.skill}|${r.target}`));
const rejected = (label: string, code: string) => rejectedTargets.has(code) || rejectedPairs.has(`${label}|${code}`);

/** RunPod matches at or above the threshold, before and after the human check (shown as counts). */
export const reviewCounts = (() => {
  const all = Object.values(sdgMatches.skills).flatMap((s) => s.targets.filter((t) => t.similarity >= sdgReview.threshold).map((t) => rejected(s.label, t.code)));
  return { proposed: all.length, rejected: all.filter(Boolean).length };
})();

function aiLinks(skill: Skill, level: 'strong' | 'possible'): SdgLink[] {
  const [lo, hi] = level === 'strong' ? [sdgReview.threshold, Infinity] : [sdgReview.possibleFrom, sdgReview.threshold];
  return (sdgMatches.skills[skill.uri]?.targets ?? [])
    .filter((t) => t.similarity >= lo && t.similarity < hi && !rejected(skill.label, t.code))
    .map((t) => ({ target: t.code, source: 'ai', level, similarity: t.similarity }));
}

/** Strong SDG links for one skill (the 4.4 baseline for every skill is handled separately). */
export function skillSdgs(skill: Skill): SdgLink[] {
  const links = aiLinks(skill, 'strong');
  if (skill.digital) links.push({ target: '4.4', source: 'esco', level: 'strong' });
  return links;
}
/** Possible links: just under the threshold and not checked. Display only. */
export const skillPossibleSdgs = (skill: Skill) => aiLinks(skill, 'possible');

function totals(skills: Skill[], links: (s: Skill) => SdgLink[]) {
  const byTarget = new Map<string, { skills: Skill[]; best: number }>();
  for (const s of skills) for (const l of links(s)) {
    const e = byTarget.get(l.target) ?? { skills: [], best: 0 };
    if (!e.skills.includes(s)) e.skills.push(s);
    e.best = Math.max(e.best, l.similarity ?? 0);
    byTarget.set(l.target, e);
  }
  return [...byTarget].map(([target, e]) => ({ target, skills: e.skills, best: e.best }))
    .sort((a, b) => b.skills.length - a.skills.length || b.best - a.best || a.target.localeCompare(b.target, undefined, { numeric: true }));
}
/** Strong links per target for a set of skills, most skills first (plan and team views). */
export const sdgTotals = (skills: Skill[]) => totals(skills, skillSdgs);
/** Possible links per target, leaving out targets that already have a strong link. */
export const sdgPossibleTotals = (skills: Skill[]) => {
  const strong = new Set(sdgTotals(skills).map((t) => t.target));
  return totals(skills, skillPossibleSdgs).filter((t) => !strong.has(t.target));
};

type RoleLike = { id: string; essentialSkills: Skill[] };

/** A role's links: up to two targets matched strongly by most of its essential skills. */
export function roleSdgs(role: RoleLike): SdgLink[] {
  return sdgTotals(role.essentialSkills).filter((t) => t.target !== '4.4').slice(0, 2)
    .map((t) => ({ target: t.target, source: 'ai', level: 'strong', similarity: t.best, skills: t.skills }));
}

/** Goals (SDG numbers) a role is linked to: 'role' through its own links, 'skills' only through some essential skills. */
export function roleGoalLink(role: RoleLike, goal: string): 'role' | 'skills' | null {
  if (roleSdgs(role).some((l) => targetGoal(l.target) === goal)) return 'role';
  if (role.essentialSkills.some((s) => skillSdgs(s).some((l) => l.target !== '4.4' && targetGoal(l.target) === goal))) return 'skills';
  return null;
}

/** Whether any of the given roles links to a goal strongly, only possibly, or not at all (for the goal picker). */
export function goalStatus(roles: RoleLike[], goal: string): 'strong' | 'possible' | 'none' {
  const skills = roles.flatMap((r) => r.essentialSkills);
  if (skills.some((s) => skillSdgs(s).some((l) => targetGoal(l.target) === goal))) return 'strong';
  if (skills.some((s) => skillPossibleSdgs(s).some((l) => targetGoal(l.target) === goal))) return 'possible';
  return 'none';
}

/**
 * Goal fit (optional score part G): 1 if the role itself is linked to one of
 * the person's goals, 0.5 if only some of its essential skills are, else 0.
 * Strong links only. With no goals picked it is null and the score is unchanged.
 */
export function goalFit(role: RoleLike, goals: string[]): number | null {
  if (goals.length === 0) return null;
  const links = goals.map((g) => roleGoalLink(role, g));
  return links.includes('role') ? 1 : links.includes('skills') ? 0.5 : 0;
}
