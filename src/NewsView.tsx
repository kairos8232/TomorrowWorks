// Workplace news: recent headlines from Malaysian outlets (GDELT snapshot).
// Context only: news never changes any score. Built by scripts/import_gdelt_news.py.
import { useState } from 'react';
import newsFile from '../data/sources/gdelt-news.json';

type Article = { title: string; url: string; outlet: string; language: string; seenAt: string; topics: string[] };
const articles = newsFile.articles as Article[];
const topics = ['All', ...new Set(articles.flatMap((a) => a.topics))];
const day = (iso: string) => new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

export function NewsView() {
  const [topic, setTopic] = useState('All');
  if (articles.length === 0) {
    return <section className="panel soon-panel"><h2>No news imported yet</h2><p>Headlines appear here after running <code>python3 scripts/import_gdelt_news.py</code>. News is shown as context only and never changes your scores.</p></section>;
  }
  const shown = topic === 'All' ? articles : articles.filter((a) => a.topics.includes(topic));
  return <section className="data-table news" aria-label="Workplace news">
    <div className="ledger-controls">
      <fieldset><legend>Topic</legend>
        {topics.map((t) => <label key={t} className="choice"><input type="radio" name="topic" checked={topic === t} onChange={() => setTopic(t)} />{t}</label>)}
      </fieldset>
    </div>
    <ul className="news-list">
      {shown.map((a) => <li key={a.url}>
        <a href={a.url} target="_blank" rel="noreferrer">{a.title}</a>
        <span className="note">{a.outlet}, {day(a.seenAt)}{a.topics.length ? `. ${a.topics.join(', ')}` : ''}</span>
      </li>)}
    </ul>
    <p className="note">Reported news, not job counts: it never changes your scores. Headlines from outlets in Malaysia found by <a href={newsFile.source.url} target="_blank" rel="noreferrer">GDELT</a> in the {newsFile.source.window}, retrieved {newsFile.source.retrievedAt}. Topics come from search terms found in each headline; “Other” means none were.</p>
  </section>;
}
