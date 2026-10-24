// Search links for a role title on Malaysian job sites. We only build the link;
// nothing is fetched or scraped, so no vacancy list or count is ever shown by us.
// The person opens the site's own search and sees that site's own results.

export type JobLink = { id: string; name: string; url: string };

/** "Data analyst" → "data-analyst" (the form JobStreet uses in its search paths). */
export const slug = (title: string) => title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function jobSearchLinks(title: string): JobLink[] {
  const q = encodeURIComponent(title.trim());
  return [
    { id: 'jobstreet', name: 'JobStreet', url: `https://my.jobstreet.com/${slug(title)}-jobs` },
    { id: 'linkedin', name: 'LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=Malaysia` },
    { id: 'indeed', name: 'Indeed', url: `https://malaysia.indeed.com/jobs?q=${q}` },
    // The government portal has no search address we can fill in, so this opens its home page.
    { id: 'myfuturejobs', name: 'MYFutureJobs', url: 'https://myfuturejobs.gov.my/' },
  ];
}
