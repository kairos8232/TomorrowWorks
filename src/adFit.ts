// Job-ad check: compare the skills a pasted ad asks for with the skills a person holds.
// Rule (documented in SIGNALS_AND_MATCHING.md, "Job-ad check"):
//   1. The ad's lines are matched to ESCO skills on RunPod (same service as the CV intake).
//      The person can untick any skill that is not really in the ad.
//   2. Held / close / to build uses the SAME rule as a role's essential skills (skillFit),
//      so an ad is treated like a one-off role made from the ticked skills.
//   3. The closest role is the one of our 9 roles that shares the most ticked skills
//      (essential or optional), and only if it shares at least AD_ROLE_MIN. Its demand
//      and AI-exposure signals are the same figures used in Your moves.
//   4. CV vs ad (cvGap): the person's CV is matched the same way; each ad skill is shown by the
//      CV, held but missing from the CV, or not there yet.
// No score is invented: the output is counts, the person's own skills, and existing signals.
import { skillFit, type Role, type Skill, type TransferableSkills } from './scoring';
import type { Gap } from './pathway';

export const AD_ROLE_MIN = 3;

/** An ad as a one-off role whose essential skills are the ones ticked. */
const adAsRole = (skills: Skill[]): Role => ({
  id: 'ad', title: 'This ad', escoUri: '', isco: '', iscoMajorGroup: '', description: '', essentialSkills: skills, optionalSkills: [],
});

/** Held, close (transferable) and to-build skills for an ad, with the same rule as skillFit. */
export function compareAd(adSkills: Skill[], held: ReadonlySet<string>, transferable: TransferableSkills) {
  const fit = skillFit(adAsRole(adSkills), held, transferable);
  const gaps: Gap[] = [
    ...fit.missing.map((skill) => ({ skill, partly: null })),
    ...fit.transferable.map((t) => ({ skill: t.need, partly: t.have.label })),
  ];
  return { ...fit, gaps, total: adSkills.length };
}

/** The role sharing the most skills with the ad, or null if none shares at least AD_ROLE_MIN. */
export function closestRole(adSkills: Skill[], roles: Role[]) {
  const uris = new Set(adSkills.map((s) => s.uri));
  let best: { role: Role; shared: Skill[]; essentialShared: number } | null = null;
  for (const role of roles) {
    const essential = new Set(role.essentialSkills.map((s) => s.uri));
    const shared = [...role.essentialSkills, ...role.optionalSkills].filter((s, i, all) => uris.has(s.uri) && all.findIndex((x) => x.uri === s.uri) === i);
    const essentialShared = shared.filter((s) => essential.has(s.uri)).length;
    const better = !best || shared.length > best.shared.length || (shared.length === best.shared.length && essentialShared > best.essentialShared);
    if (better) best = { role, shared, essentialShared };
  }
  return best && best.shared.length >= AD_ROLE_MIN ? best : null;
}

/**
 * CV vs ad. For the ad's (ticked) skills: which the CV already shows, which the person has
 * in Your skills but the CV does not show (add them to the CV), and which are not there yet.
 * "Shows" means the CV's lines matched the same ESCO skill; nothing is guessed.
 */
export function cvGap(adSkills: Skill[], cvUris: ReadonlySet<string>, held: ReadonlySet<string>) {
  const shown = adSkills.filter((s) => cvUris.has(s.uri));
  const addToCv = adSkills.filter((s) => !cvUris.has(s.uri) && held.has(s.uri));
  const notYet = adSkills.filter((s) => !cvUris.has(s.uri) && !held.has(s.uri));
  return { shown, addToCv, notYet };
}
