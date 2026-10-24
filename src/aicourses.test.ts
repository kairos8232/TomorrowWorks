import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import matches from '../data/derived/coursera-skill-matches.json';

describe('AI-matched Coursera courses (data/derived/coursera-skill-matches.json)', () => {
  const uris = new Set(rolesFile.roles.flatMap((r) => r.essentialSkills.map((s) => s.uri)));
  it('only real role skills, real Coursera links, at or above the stated threshold, best first', () => {
    for (const [uri, entry] of Object.entries(matches.skills)) {
      expect(uris.has(uri), entry.label).toBe(true);
      expect(entry.courses.length).toBeLessThanOrEqual(matches.method.topPerSkill);
      entry.courses.forEach((c, i) => {
        expect(c.url).toBe(`https://www.coursera.org/learn/${c.slug}`);
        expect(c.similarity).toBeGreaterThanOrEqual(matches.method.threshold);
        if (i > 0) expect(c.similarity).toBeLessThanOrEqual(entry.courses[i - 1].similarity);
      });
    }
  });
  it('records how the match was made (model, RunPod endpoint, catalogue date, spot-check)', () => {
    expect(matches.method.model).toBe('BAAI/bge-m3');
    expect(matches.method.where).toContain('RunPod');
    expect(matches.method.catalogue.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(matches.method.spotCheck.length).toBeGreaterThan(20);
  });
});
