import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import transferableFile from '../data/derived/transferable-skills.json';
import { personaProfile } from './data';
import { AD_ROLE_MIN, closestRole, compareAd } from './adFit';
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
