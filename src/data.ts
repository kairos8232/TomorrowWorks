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
  persona: 'aina' | null;          // null = the visitor's own (in-memory) skills
  currentRoleId: string | null;    // shown as "Now" for comparison; never ranked
  held: Set<string>;
  extra: Map<string, Skill>;       // skills found by search that are outside the role set
};

/** Fictional demo person. Her skills are the ESCO essential skills of "accounting assistant". */
export const aina = {
  name: 'Aina',
  summary: 'Fictional accounting assistant, three years at a mid-sized firm in Shah Alam. Her days are invoices, bank reconciliations and month-end reports, the kind of routine work AI tools now speed up.',
  roleId: 'accounting-assistant',
};

export function ainaProfile(): Profile {
  return { persona: 'aina', currentRoleId: aina.roleId, held: new Set(roleById(aina.roleId)!.essentialSkills.map((s) => s.uri)), extra: new Map() };
}

export const emptyProfile = (): Profile => ({ persona: null, currentRoleId: null, held: new Set(), extra: new Map() });

export const sourceLinks = { dosm: dosmQ2.source.url, ilo: iloFile.source.url, esco: 'https://esco.ec.europa.eu/' };
