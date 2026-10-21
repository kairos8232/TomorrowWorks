// SDG links for roles and skills. Tested in src/sdg.test.ts.
//
// Skill -> UN targets matched by RunPod (BAAI/bge-m3): cosine similarity between the
//          ESCO skill text and the official UN target text (scripts/match_sdg_runpod.py,
//          data/derived/sdg-skill-matches.json). A match is shown if its similarity is at
//          least the reviewed threshold and people did not reject it (data/sdg/sdg-review.json).
//          ESCO digital skills also link to 4.4 (indicator 4.4.1 counts ICT skills).
//          Every skill counts towards 4.4 (relevant skills for decent jobs), shown once.
// Role  -> the two targets matched by most of its essential skills (above), and the
//          links written by the team in data/sdg/sdg-links.json, labelled as such.
import sdgFile from '../data/sdg/sdg-links.json';
import reviewFile from '../data/sdg/sdg-review.json';
import matchFile from '../data/derived/sdg-skill-matches.json';
import unFile from '../data/sources/un-sdg-targets.json';
import type { Skill } from './scoring';

/** source: 'ai' = RunPod match kept after review; 'team' = written by the team; 'esco' = ESCO digital flag. */
export type SdgLink = { target: string; source: 'ai' | 'team' | 'esco'; reason?: string; similarity?: number; skills?: Skill[] };
export const sdgData = sdgFile as {
  goals: Record<string, { name: string; short: string; colour: string }>;
  targets: Record<string, { goal: string; title: string }>;
  roles: Record<string, { target: string; reason: string }[]>;
  review: string;
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

/** RunPod matches at or above the threshold, before and after the human review (shown as counts). */
export const reviewCounts = (() => {
  const all = Object.values(sdgMatches.skills).flatMap((s) => s.targets.filter((t) => t.similarity >= sdgReview.threshold).map((t) => rejected(s.label, t.code)));
  return { proposed: all.length, rejected: all.filter(Boolean).length };
})();

/** Specific SDG links for one skill (4.4 for every skill is handled separately). */
export function skillSdgs(skill: Skill): SdgLink[] {
  const links: SdgLink[] = (sdgMatches.skills[skill.uri]?.targets ?? [])
    .filter((t) => t.similarity >= sdgReview.threshold && !rejected(skill.label, t.code))
    .map((t) => ({ target: t.code, source: 'ai', similarity: t.similarity }));
  if (skill.digital) links.push({ target: '4.4', source: 'esco' });
  return links;
}

/** Totals per target for a set of skills, most skills first (for the plan and team views). */
export function sdgTotals(skills: Skill[]) {
  const byTarget = new Map<string, Skill[]>();
  for (const s of skills) for (const l of skillSdgs(s)) byTarget.set(l.target, [...(byTarget.get(l.target) ?? []), s]);
  return [...byTarget].map(([target, list]) => ({ target, skills: list })).sort((a, b) => b.skills.length - a.skills.length || a.target.localeCompare(b.target, undefined, { numeric: true }));
}

type RoleLike = { id: string; essentialSkills: Skill[] };

/** A role's links: up to two targets matched by most of its essential skills, then the team's own links. */
export function roleSdgs(role: RoleLike): SdgLink[] {
  const ai: SdgLink[] = sdgTotals(role.essentialSkills).filter((t) => t.target !== '4.4').slice(0, 2)
    .map((t) => ({ target: t.target, source: 'ai', skills: t.skills }));
  const team: SdgLink[] = (sdgData.roles[role.id] ?? []).filter((l) => !ai.some((a) => a.target === l.target))
    .map((l) => ({ target: l.target, source: 'team', reason: l.reason }));
  return [...ai, ...team];
}

/** Goals (SDG numbers) a role is linked to: 'role' through its own links, 'skills' only through some essential skills. */
export function roleGoalLink(role: RoleLike, goal: string): 'role' | 'skills' | null {
  if (roleSdgs(role).some((l) => targetGoal(l.target) === goal)) return 'role';
  if (role.essentialSkills.some((s) => skillSdgs(s).some((l) => l.target !== '4.4' && targetGoal(l.target) === goal))) return 'skills';
  return null;
}

/**
 * Goal fit (optional score part G): 1 if the role itself is linked to one of
 * the person's goals, 0.5 if only some of its essential skills are, else 0.
 * With no goals picked it is null and the score is unchanged.
 */
export function goalFit(role: RoleLike, goals: string[]): number | null {
  if (goals.length === 0) return null;
  const links = goals.map((g) => roleGoalLink(role, g));
  return links.includes('role') ? 1 : links.includes('skills') ? 0.5 : 0;
}
