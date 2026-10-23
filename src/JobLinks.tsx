// "Find this role": links to each job site's own search for a role title (src/jobSearch.ts).
import { useT } from './i18n';
import { jobSearchLinks } from './jobSearch';

export function JobLinks({ title }: { title: string }) {
  const t = useT();
  return <div className="detail-find">
    <h3>{t('Find this role')}</h3>
    <p className="note">{t('Search for “{role}” on these job sites.', { role: title })}</p>
    <ul>{jobSearchLinks(title).map((l) => <li key={l.id}><a href={l.url} target="_blank" rel="noreferrer">{l.name}</a></li>)}</ul>
  </div>;
}
