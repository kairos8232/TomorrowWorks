import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import transferableFile from '../data/derived/transferable-skills.json';
import { personaProfile } from './data';
import { AD_ROLE_MIN, closestRole, compareAd, cvGap } from './adFit';
import { noTransferableSkills, skillFit, type Role, type TransferableSkills } from './scoring';

const roles = rolesFile.roles as Role[];
const transferable = transferableFile as TransferableSkills;
const bookkeeper = roles.find((r) => r.id === 'bookkeeper')!;
const held = personaProfile('aina').held;

describe('compareAd', () => {
  it('splits an ad into held and to-build skills and counts them', () => {
    const ad = bookkeeper.essentialSkills.slice(0, 6);
    const got = compareAd(ad, new Set(ad.slice(0, 2).map((s) => s.uri)), noTransferableSkills);
    expect(got.matched).toHaveLength(2);
    expect(got.missing).toHaveLength(4);
    expect(got.total).toBe(6);
    expect(got.gaps).toHaveLength(4);
    expect(got.F).toBeCloseTo(2 / 6);
  });
  it('gives the same answer as a role with those essential skills (one rule for roles and ads)', () => {
    const ad = bookkeeper.essentialSkills;
    const viaAd = compareAd(ad, held, transferable);
    const viaRole = skillFit(bookkeeper, held, transferable);
    expect(viaAd.matched.map((s) => s.uri)).toEqual(viaRole.matched.map((s) => s.uri));
    expect(viaAd.missing.map((s) => s.uri)).toEqual(viaRole.missing.map((s) => s.uri));
    expect(viaAd.transferable.length).toBe(viaRole.transferable.length);
  });
  it('lists transferable skills as gaps that are only partly held', () => {
    const need = bookkeeper.essentialSkills.find((s) => (transferable.neededSkills[s.uri]?.transferableFrom.length ?? 0) > 0);
    if (!need) return;   // no transferable pair in this data: nothing to check
    const from = transferable.neededSkills[need.uri].transferableFrom[0];
    const got = compareAd([need], new Set([from.uri]), transferable);
    expect(got.transferable).toHaveLength(1);
    expect(got.gaps[0].partly).toBe(from.label);
  });
  it('handles an empty ad', () => {
    const got = compareAd([], held, transferable);
    expect(got.total).toBe(0);
    expect(got.gaps).toEqual([]);
  });
});

describe('closestRole', () => {
  it('finds the role whose skills the ad asks for', () => {
    for (const role of roles) {
      const hit = closestRole(role.essentialSkills.slice(0, 8), roles);
      expect(hit?.role.id, role.id).toBe(role.id);
    }
  });
  it('returns null when fewer than the minimum skills are shared', () => {
    const few = bookkeeper.essentialSkills.slice(0, AD_ROLE_MIN - 1);
    expect(closestRole(few, roles)).toBeNull();
    expect(closestRole([], roles)).toBeNull();
  });
  it('counts a shared skill once, even if a role lists it as essential and optional', () => {
    const hit = closestRole(bookkeeper.essentialSkills, roles)!;
    expect(new Set(hit.shared.map((s) => s.uri)).size).toBe(hit.shared.length);
  });
});

describe('cvGap', () => {
  const ad = bookkeeper.essentialSkills.slice(0, 6);
  const uris = (list: { uri: string }[]) => list.map((s) => s.uri);
  it('splits ad skills into shown on the CV, held but not on the CV, and not yet', () => {
    const cv = new Set([ad[0].uri, ad[1].uri]);
    const held = new Set([ad[1].uri, ad[2].uri, ad[3].uri]);
    const got = cvGap(ad, cv, held);
    expect(uris(got.shown)).toEqual([ad[0].uri, ad[1].uri]);   // on the CV, whether or not held
    expect(uris(got.addToCv)).toEqual([ad[2].uri, ad[3].uri]); // held, CV does not show
    expect(uris(got.notYet)).toEqual([ad[4].uri, ad[5].uri]);
  });
  it('every ad skill lands in exactly one group', () => {
    const got = cvGap(ad, new Set([ad[0].uri]), new Set([ad[2].uri]));
    expect(got.shown.length + got.addToCv.length + got.notYet.length).toBe(ad.length);
    expect(new Set([...uris(got.shown), ...uris(got.addToCv), ...uris(got.notYet)]).size).toBe(ad.length);
  });
  it('an empty CV shows nothing and everything held is to add', () => {
    const got = cvGap(ad, new Set(), new Set([ad[0].uri]));
    expect(got.shown).toEqual([]);
    expect(uris(got.addToCv)).toEqual([ad[0].uri]);
  });
});
