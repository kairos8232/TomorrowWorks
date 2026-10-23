import { describe, expect, it } from 'vitest';
import rolesFile from '../data/roles.json';
import { jobSearchLinks, slug } from './jobLinks';

describe('job search links', () => {
  it('puts the role title into each site search', () => {
    const links = Object.fromEntries(jobSearchLinks('data analyst').map((l) => [l.id, l.url]));
    expect(links.jobstreet).toBe('https://my.jobstreet.com/data-analyst-jobs');
    expect(links.linkedin).toBe('https://www.linkedin.com/jobs/search/?keywords=data%20analyst&location=Malaysia');
    expect(links.indeed).toBe('https://malaysia.indeed.com/jobs?q=data%20analyst');
  });
  it('makes a clean slug and encodes odd characters', () => {
    expect(slug('  Billing   clerk ')).toBe('billing-clerk');
    expect(jobSearchLinks('R&D manager')[1].url).toContain('keywords=R%26D%20manager');
  });
  it('every role in the app gets four https links and no made-up counts', () => {
    for (const role of rolesFile.roles) {
      const links = jobSearchLinks(role.title);
      expect(links).toHaveLength(4);
      for (const l of links) expect(l.url.startsWith('https://')).toBe(true);
    }
  });
});
