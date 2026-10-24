// Interest fit: how well a role's work matches the kinds of work a person
// enjoys (Holland RIASEC). Role profiles: data/interests/role-interests.json
// (job tag, Japan MHLW/JILPT; O*NET fallback). Tested in src/interests.test.ts.
//
// For each type the person picks (up to two):
//   1   if it is one of the role's top two types (ties count as top two)
//   0.5 if it is the role's third type
//   0   otherwise
// Interest fit = the average over the picks. With no picks it is null and
// the score is the usual skills + market score.
import interestsFile from '../data/interests/role-interests.json';

export type InterestType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export const interestTypes: InterestType[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export type RoleInterest = {
  source: 'jobtag' | 'onet';
  match: 'close' | 'related';
  occupation: string;
  code: string;
  url: string;
  scores?: Record<InterestType, number>;
  letters?: string;
};

export const interestData = interestsFile as {
  types: Record<InterestType, { name: string; plain: string }>;
  sources: Record<string, { name: string; citation: string; terms: string }>;
  roles: Record<string, RoleInterest>;
  checkedAt: string;
};

/** Credit (1, 0.5 or 0) for one picked type in one role's profile. */
export function typeCredit(profile: RoleInterest, type: InterestType): number {
  if (profile.scores) {
    const score = profile.scores[type];
    const ranked = interestTypes.map((t) => profile.scores![t]).sort((a, b) => b - a);
    if (score >= ranked[1]) return 1;   // one of the two highest, ties included
    if (score >= ranked[2]) return 0.5; // third highest
    return 0;
  }
  const pos = (profile.letters ?? '').indexOf(type);
  return pos === 0 || pos === 1 ? 1 : pos === 2 ? 0.5 : 0;
}

export function interestFit(roleId: string, picks: InterestType[]): number | null {
  const profile = interestData.roles[roleId];
  if (!profile || picks.length === 0) return null;
  return picks.reduce((sum, t) => sum + typeCredit(profile, t), 0) / picks.length;
}

/** The role's top types in order (for display). */
export function topTypes(roleId: string): InterestType[] {
  const profile = interestData.roles[roleId];
  if (!profile) return [];
  if (profile.scores) return [...interestTypes].sort((a, b) => profile.scores![b] - profile.scores![a]).slice(0, 3);
  return (profile.letters ?? '').split('') as InterestType[];
}
