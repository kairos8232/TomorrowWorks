// Workplace news: recent headlines from Malaysian outlets (GDELT snapshot).
// Context only: news never changes any score. Built by scripts/import_gdelt_news.py.
import { useState } from 'react';
import newsFile from '../data/sources/gdelt-news.json';
import { useT, useTx } from './i18n';

type Article = { title: string; url: string; outlet: string; language: string; seenAt: string; topics: string[] };
const articles = newsFile.articles as Article[];
const topics = ['All', ...new Set(articles.flatMap((a) => a.topics))];
const day = (iso: string) => new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

export function NewsView() {
  const [topic, setTopic] = useState('All');
  const t = useT();
  const tx = useTx();
  if (articles.length === 0) {
    return <section className="panel soon-panel"><h2>{t('No news imported yet')}</h2><p>{tx('Headlines appear here after running {cmd}. News is shown as context only and never changes your scores.', { cmd: <code>python3 scripts/import_gdelt_news.py</code> })}</p></section>;
  }
  const shown = topic === 'All' ? articles : articles.filter((a) => a.topics.includes(topic));
  return <section className="data-table news" aria-label="Workplace news">
    <div className="ledger-controls">
      <fieldset><legend>{t('Topic')}</legend>
        {topics.map((x) => <label key={x} className="choice"><input type="radio" name="topic" checked={topic === x} onChange={() => setTopic(x)} />{t(x)}</label>)}
      </fieldset>
    </div>
    <ul className="news-list">
      {shown.map((a) => <li key={a.url}>
        <a href={a.url} target="_blank" rel="noreferrer">{a.title}</a>
        <span className="note">{a.outlet}, {day(a.seenAt)}{a.topics.length ? `. ${a.topics.map((x) => t(x)).join(', ')}` : ''}</span>
      </li>)}
    </ul>
    <p className="note">{tx('Reported news, not job counts: it never changes your scores. Headlines from outlets in Malaysia found by {gdelt} in the last 4 weeks before retrieval, retrieved {date}. Topics come from search terms found in each headline; “Other” means none were.', { gdelt: <a href={newsFile.source.url} target="_blank" rel="noreferrer">GDELT</a>, date: newsFile.source.retrievedAt })}</p>
  </section>;
}
