export type MoveType = 'promotion' | 'career move';

export type TargetDraft = {
  moveType: MoveType;
  role: string;
  skills: string;
};

export type Target = {
  moveType: MoveType;
  role: string;
  skills: string[];
};

export const samplePromotionTarget: TargetDraft = {
  moveType: 'promotion',
  role: 'Senior Accountant',
  skills: 'Excel, financial reporting, budgeting, team leadership',
};

// Early demo only: exact names after case and whitespace normalisation.
// A sourced matcher will need synonyms, proficiency, experience, and evidence.
export function compareSkills(current: string[], required: string[]) {
  const normalise = (skill: string) => skill.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  const held = new Set(current.map(normalise));
  return {
    matched: required.filter((skill) => held.has(normalise(skill))),
    missing: required.filter((skill) => !held.has(normalise(skill))),
  };
}
