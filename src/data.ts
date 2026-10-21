// All imported, attributed data the app uses, in one place.
// Sources and how each file is built: SIGNALS_AND_MATCHING.md.
import rolesFile from '../data/roles.json';
import dosmQ1 from '../data/sources/dosm-jmi-2026-q1.json';
import dosmQ2 from '../data/sources/dosm-jmi-2026-q2.json';
import iloFile from '../data/sources/ilo-genai-exposure-2025.json';
import transferableFile from '../data/derived/transferable-skills.json';
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
};

/**
 * Fictional demo people, one per target group in the Domain 1 brief.
 * Their skills are ESCO skills from data/roles.json, chosen by the team to
 * fit the story; they are not real people or real CVs.
 */
export type PersonaId = 'aina' | 'hakim';
export type Persona = { id: PersonaId; name: string; group: string; description: string; summary: string; roleId: string | null; skillLabels: string[] | null };
export const personas: Persona[] = [
  {
    id: 'aina',
    name: 'Aina',
    group: 'Working adult whose job AI is changing',
    description: 'a fictional accounting assistant',
    summary: 'Fictional accounting assistant, three years at a mid-sized firm in Shah Alam. Her days are invoices, bank reconciliations and month-end reports, the kind of routine work AI tools now speed up.',
    roleId: 'accounting-assistant',
    skillLabels: null, // all essential skills of her role
  },
  {
    id: 'hakim',
    name: 'Hakim',
    group: 'Fresh graduate choosing a first job',
    description: 'a fictional statistics graduate',
    summary: 'Fictional fresh graduate in statistics from a Malaysian public university, with a three-month internship cleaning survey data. No job yet; he wants to know which roles his degree skills lead to.',
    roleId: null,
    skillLabels: ['statistics', 'apply statistical analysis techniques', 'quantitative analysis', 'empirical analysis', 'conduct quantitative research',
      'scientific research methodology', 'economics', 'microeconomics', 'macroeconomics', 'digital data processing', 'perform data cleansing',
      'query languages', 'use databases', 'data visualisation software', 'visual presentation techniques', 'business communication'],
  },
];
export const personaById = (id: PersonaId | null) => personas.find((p) => p.id === id) ?? null;
export const aina = personas[0];

export function personaProfile(id: PersonaId): Profile {
  const p = personaById(id)!;
  const held = p.skillLabels
    ? new Set(p.skillLabels.map((label) => allSkills.find((s) => s.label === label)!.uri))
    : new Set(roleById(p.roleId)!.essentialSkills.map((s) => s.uri));
  return { persona: p.id, currentRoleId: p.roleId, held, extra: new Map() };
}
export const ainaProfile = () => personaProfile('aina');

export const emptyProfile = (): Profile => ({ persona: null, currentRoleId: null, held: new Set(), extra: new Map() });

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
  },
];

export function memberSkills(m: TeamMember): Set<string> {
  return m.skillLabels
    ? new Set(m.skillLabels.map((label) => allSkills.find((s) => s.label === label)!.uri))
    : new Set(roleById(m.roleId)!.essentialSkills.map((s) => s.uri));
}
