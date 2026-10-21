// SDG links for roles and skills. Data and reasons: data/sdg/sdg-links.json.
// Tested in src/sdg.test.ts.
//
// Role  -> 1-2 targets chosen by hand, each with a reason tied to the role's ESCO skills.
// Skill -> every rule whose pattern matches the ESCO label (first reason per target);
//          an ESCO green skill with no specific match -> Goal 12 (green skill);
//          an ESCO digital skill -> 4.4 (ICT skills, indicator 4.4.1);
//          every skill -> 4.4 (relevant skills for decent jobs), shown once, not per skill.
import sdgFile from '../data/sdg/sdg-links.json';
import type { Skill } from './scoring';

export type SdgLink = { target: string; reason: string };
export const sdgData = sdgFile as {
  goals: Record<string, { name: string; colour: string }>;
  targets: Record<string, { goal: string; title: string }>;
  roles: Record<string, SdgLink[]>;
  skillRules: { target: string; pattern: string; reason: string }[];
  review: string;
};

export const goalUrl = (goal: string) => `https://sdgs.un.org/goals/goal${goal}`;
export const roleSdgs = (roleId: string): SdgLink[] => sdgData.roles[roleId] ?? [];

/** Specific SDG links for one skill (4.4 for every skill is handled separately). */
export function skillSdgs(skill: Skill): SdgLink[] {
  const links: SdgLink[] = sdgData.skillRules
    .filter((r) => new RegExp(r.pattern, 'i').test(skill.label))
    .map((r) => ({ target: r.target, reason: r.reason }));
  if (skill.green && links.length === 0) links.push({ target: '12', reason: 'ESCO marks it as a green skill.' });
  if (skill.digital) links.push({ target: '4.4', reason: 'A digital skill (SDG indicator 4.4.1 counts ICT skills).' });
  return links;
}

/** Totals per target for a set of skills, most skills first (for the plan and team views). */
export function sdgTotals(skills: Skill[]) {
  const byTarget = new Map<string, Skill[]>();
  for (const s of skills) for (const l of skillSdgs(s)) byTarget.set(l.target, [...(byTarget.get(l.target) ?? []), s]);
  return [...byTarget].map(([target, list]) => ({ target, skills: list })).sort((a, b) => b.skills.length - a.skills.length || a.target.localeCompare(b.target, undefined, { numeric: true }));
}
