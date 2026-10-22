// All imported, attributed data the app uses, in one place.
// Sources and how each file is built: SIGNALS_AND_MATCHING.md.
import rolesFile from '../data/roles.json';
import dosmQ1 from '../data/sources/dosm-jmi-2026-q1.json';
import dosmQ2 from '../data/sources/dosm-jmi-2026-q2.json';
import iloFile from '../data/sources/ilo-genai-exposure-2025.json';
import transferableFile from '../data/derived/transferable-skills.json';
import type { InterestType } from './interests';
import type { DosmSnapshot, IloExposure, Role, Skill, TransferableSkills } from './scoring';

export const roles = rolesFile.roles as Role[];
export const snapshots = { q1: dosmQ1 as DosmSnapshot, q2: dosmQ2 as DosmSnapshot };
export type SnapshotId = keyof typeof snapshots;
export const ilo = iloFile as IloExposure;
export const transferable = transferableFile as TransferableSkills;

/** Every ESCO skill used by the role set (the pick-from-list option and RunPod fallback). */
export const allSkills: Skill[] = [...new Map(roles.flatMap((r) => [...r.essentialSkills, ...r.optionalSkills]).map((s) => [s.uri, s])).values()]
  .sort((a, b) => a.label.localeCompare(b.label));

/** ESCO titles are lower case ("accounting assistant"); show them with a capital first letter. */
export const roleTitle = (title: string) => title[0].toUpperCase() + title.slice(1);

export const roleById = (id: string | null) => roles.find((r) => r.id === id) ?? null;

/** The person whose matches are shown. Skills are ESCO skill URIs. */
export type Profile = {
  persona: PersonaId | null;       // null = the visitor's own (in-memory) skills
  currentRoleId: string | null;    // shown as "Now" for comparison; never ranked
  held: Set<string>;
  extra: Map<string, Skill>;       // skills found by search that are outside the role set
  interests: InterestType[];       // kinds of work the person enjoys (Holland RIASEC), optional, up to two
  goals: string[];                 // SDG goal numbers the person wants their work to contribute to, optional, up to two
};

/**
 * Fictional demo people, one per target group in the Domain 1 brief.
 * Their skills are ESCO skills from data/roles.json, chosen by the team to
 * fit the story; they are not real people or real CVs.
 */
export type PersonaId = 'aina' | 'hakim';
export type Persona = { id: PersonaId; name: string; group: string; description: string; summary: string; roleId: string | null; skillLabels: string[] | null; interests: InterestType[]; goals: string[] };
export const personas: Persona[] = [
  {
    id: 'aina',
    name: 'Aina',
    group: 'Working adult whose job AI is changing',
    description: 'a fictional accounting assistant',
    summary: 'Fictional accounting assistant in Shah Alam, handling invoices, bank reconciliations and reports.',
    roleId: 'accounting-assistant',
    skillLabels: null, // all essential skills of her role
    interests: ['C', 'S'],
    goals: ['12'],
  },
  {
    id: 'hakim',
    name: 'Hakim',
    group: 'Fresh graduate choosing a first job',
    description: 'a fictional statistics graduate',
    summary: 'Fictional statistics graduate with a survey-data internship, choosing his first role.',
    roleId: null,
    skillLabels: ['statistics', 'apply statistical analysis techniques', 'quantitative analysis', 'empirical analysis', 'conduct quantitative research',
      'scientific research methodology', 'economics', 'microeconomics', 'macroeconomics', 'digital data processing', 'perform data cleansing',
      'query languages', 'use databases', 'data visualisation software', 'visual presentation techniques', 'business communication'],
    interests: ['I', 'C'],
    goals: ['9'],
  },
];
export const personaById = (id: PersonaId | null) => personas.find((p) => p.id === id) ?? null;
export const aina = personas[0];

export function personaProfile(id: PersonaId): Profile {
  const p = personaById(id)!;
  const held = p.skillLabels
    ? new Set(p.skillLabels.map((label) => allSkills.find((s) => s.label === label)!.uri))
    : new Set(roleById(p.roleId)!.essentialSkills.map((s) => s.uri));
  return { persona: p.id, currentRoleId: p.roleId, held, extra: new Map(), interests: [...p.interests], goals: [...p.goals] };
}
export const ainaProfile = () => personaProfile('aina');

export const emptyProfile = (): Profile => ({ persona: null, currentRoleId: null, held: new Set(), extra: new Map(), interests: [], goals: [] });

export const sourceLinks = { dosm: dosmQ2.source.url, ilo: iloFile.source.url, esco: 'https://esco.ec.europa.eu/' };

/**
 * Fictional groups for the Team view: an HR manager's team and a career
 * centre's graduating class (target groups 3 and 4 in the brief). A member
 * either holds all essential skills of a role (roleId) or a listed set.
 */
export type TeamMember = { name: string; roleId: string | null; skillLabels: string[] | null };
export type Team = { id: string; name: string; viewer: string; description: string; members: TeamMember[] };
export const teams: Team[] = [
  {
    id: 'finance-team',
    name: 'Finance team',
    viewer: 'HR / learning and development manager',
    description: 'A fictional five-person finance team at a mid-sized firm. Which moves fit the team, and which skills should a training budget go to first?',
    members: [
      { name: 'Aina', roleId: 'accounting-assistant', skillLabels: null },
      { name: 'Ravi', roleId: 'billing-clerk', skillLabels: null },
      { name: 'Mei Ling', roleId: 'bookkeeper', skillLabels: null },
      { name: 'Farah', roleId: 'accounting-assistant', skillLabels: null },
      { name: 'Daniel', roleId: 'accountant', skillLabels: null },
    ],
  },
  {
    id: 'graduating-class',
    name: 'Graduating class',
    viewer: 'University or TVET career centre',
    description: 'Three fictional graduates advised by one career centre. Which roles fit each of them, and which skills is the whole class missing?',
    members: [
      { name: 'Hakim', roleId: null, skillLabels: personas[1].skillLabels },
      { name: 'Siti', roleId: null, skillLabels: ['economics', 'microeconomics', 'macroeconomics', 'business communication', 'market research', 'conduct qualitative research', 'statistics', 'build business relationships'] },
      { name: 'Wei Jie', roleId: null, skillLabels: ['computer programming', 'use databases', 'query languages', 'debug software', 'web services', 'digital data processing'] },
    ],
  },  {
    id: 'logistics-office',
    name: 'Logistics office',
    viewer: 'Operations manager',
    description: 'A fictional four-person office at a logistics company: two billing clerks, a bookkeeper and a business analyst.',
    members: [
      { name: 'Kumar', roleId: 'billing-clerk', skillLabels: null },
      { name: 'Nurul', roleId: 'billing-clerk', skillLabels: null },
      { name: 'Jason', roleId: 'bookkeeper', skillLabels: null },
      { name: 'Aisyah', roleId: 'business-analyst', skillLabels: null },
    ],
  },
];

export function memberSkills(m: TeamMember): Set<string> {
  return m.skillLabels
    ? new Set(m.skillLabels.map((label) => allSkills.find((s) => s.label === label)!.uri))
    : new Set(roleById(m.roleId)!.essentialSkills.map((s) => s.uri));
}

/**
 * Demo "View as" choices: one fictional person per target group in the brief.
 * No sign-in exists; switching only changes which sample data and screens show.
 */
export type ViewerId = PersonaId | 'hr' | 'adviser' | 'region' | 'me';
export type Viewer = { id: ViewerId; name: string; group: string; summary: string; kind: 'person' | 'team' | 'region' | 'me'; teamId?: string; regionId?: string };
export const viewers: Viewer[] = [
  { id: 'aina', name: 'Aina', group: personas[0].group, summary: personas[0].summary, kind: 'person' },
  { id: 'hakim', name: 'Hakim', group: personas[1].group, summary: personas[1].summary, kind: 'person' },
  {
    id: 'hr', name: 'Puan Rosnah', group: 'HR and learning manager', kind: 'team', teamId: 'finance-team',
    summary: 'Fictional HR manager deciding which skills her finance team should learn.',
  },
  {
    id: 'adviser', name: 'Encik Lim', group: 'University career adviser', kind: 'team', teamId: 'graduating-class',
    summary: 'Fictional university adviser comparing career moves for three graduates.',
  },
  {
    id: 'region', name: 'Encik Faizal', group: 'Regional skills officer', kind: 'region', regionId: 'klang-valley',
    summary: 'Fictional officer at a regional skills body, seeing how all its groups contribute to the SDGs.',
  },
  { id: 'me', name: 'Me', group: 'Your own skills', summary: 'Describe your own work and see your own moves. Nothing is saved.', kind: 'me' },
];
export const viewerById = (id: ViewerId) => viewers.find((v) => v.id === id)!;
