// Workplace news: recent headlines from Malaysian outlets (GDELT snapshot).
// Context only: news never changes any score. Built by scripts/import_gdelt_news.py.
import { useEffect, useState } from 'react';
import { useDataSaver } from './dataSaver';
import newsFile from '../data/sources/gdelt-news.json';
import { useT, useTx } from './i18n';

type Article = { title: string; url: string; outlet: string; language: string; seenAt: string; topics: string[] };
type Brief = { picks: Record<string, string[]>; model: string };
type NewsBody = { source: typeof newsFile.source & { covered?: { from: string; to: string }; fetchedAt?: string }; articles: Article[]; live?: boolean; brief?: Brief | null };
const day = (iso: string) => new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

/** Per topic: counts plus the most representative real headlines (picked by RunPod; nothing generated). */
function TopicBrief({ articles, brief, topic }: { articles: Article[]; brief: Brief; topic: string }) {
  const t = useT();
  const byUrl = new Map(articles.map((a) => [a.url, a]));
  const names = Object.keys(brief.picks).filter((x) => topic === 'All topics' || x === topic);
  if (names.length === 0) return null;
  return <section className="news-brief" aria-label={t('In brief')}>
    <h2>{t('In brief')}</h2>
    {names.map((name) => {
      const list = articles.filter((a) => a.topics.includes(name));
      const outlets = new Set(list.map((a) => a.outlet)).size;
      const langs = [...new Set(list.map((a) => a.language))].map((l) => t(l)).join(', ');
      return <div key={name} className="news-brief-topic">
        <h3>{t(name)} <span>{t('{n} headlines · {m} outlets · {langs}', { n: list.length, m: outlets, langs })}</span></h3>
        <ul>{brief.picks[name].map((url) => byUrl.get(url)).filter((a): a is Article => Boolean(a)).map((a) => <li key={a.url}><a href={a.url} target="_blank" rel="noreferrer">{a.title}</a> <small>{a.outlet}</small></li>)}</ul>
      </div>;
    })}
    <p className="note">{t('Key headlines are the real headlines closest to the centre of each topic, picked by {model}. No text is written by AI.', { model: brief.model })}</p>
  </section>;
}

export function NewsView() {
  const [topic, setTopic] = useState('All topics');
  // Bundled snapshot first; the server may replace it with today's GDELT headlines (until 1 Nov 2026).
  const [news, setNews] = useState<NewsBody>(newsFile as NewsBody);
  const saver = useDataSaver();
  const [want, setWant] = useState(false);   // data saver: fetch today's headlines only when asked
  const [briefLoading, setBriefLoading] = useState(false);
  useEffect(() => {
    if (saver && !want) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const load = () => fetch('/api/news').then((r) => (r.ok ? r.json() : null)).then((body: NewsBody | null) => {
      if (body?.articles?.length) setNews(body);
      // The brief is computed on RunPod in the background; a sleeping worker can take
      // 1-2 minutes to start, so ask again every 20 s for up to 3 minutes.
      const waiting = Boolean(body && !body.brief && tries++ < 9);
      setBriefLoading(waiting);
      if (waiting) timer = setTimeout(load, 20_000);
    }).catch(() => setBriefLoading(false));
    load();
    return () => clearTimeout(timer);
  }, [saver, want]);
  const articles = news.articles;
  const topics = ['All topics', ...new Set(articles.flatMap((a) => a.topics).filter((x) => x !== 'Other')), 'Other'];
  const covered = news.source.covered;
  const t = useT();
  const tx = useTx();
  if (articles.length === 0) {
    return <section className="panel soon-panel"><h2>{t('No news imported yet')}</h2><p>{tx('Headlines appear here after running {cmd}. News is shown as context only and never changes your scores.', { cmd: <code>python3 scripts/import_gdelt_news.py</code> })}</p></section>;
  }
  // "All topics" leaves out "Other": GDELT matches whole articles, so untagged headlines are often off-topic.
  const shown = topic === 'All topics' ? articles.filter((a) => !a.topics.includes('Other')) : articles.filter((a) => a.topics.includes(topic));
  return <section className="data-table news" aria-label="Workplace news">
    <div className="ledger-controls">
      <fieldset><legend>{t('Topic')}</legend>
        {topics.map((x) => <label key={x} className="choice"><input type="radio" name="topic" checked={topic === x} onChange={() => setTopic(x)} />{t(x)}</label>)}
      </fieldset>
    </div>
    {news.brief ? <TopicBrief articles={articles} brief={news.brief} topic={topic} />
      : briefLoading && <p className="note news-brief-loading" aria-live="polite">{t('The summary of key headlines is loading. RunPod may be starting up, which can take a minute or two.')}</p>}
    <ul className="news-list">
      {shown.map((a) => <li key={a.url}>
        <a href={a.url} target="_blank" rel="noreferrer">{a.title}</a>
        <span className="note">{a.outlet}, {day(a.seenAt)}{a.topics.length && !a.topics.includes('Other') ? `. ${a.topics.map((x) => t(x)).join(', ')}` : ''}</span>
      </li>)}
    </ul>
    <p className="note">{tx('Reported news, not job counts: it never changes your scores. {n} headlines from outlets in Malaysia found by {gdelt}, seen {from} to {to}, retrieved {date}. Topics come from topic words in each headline (English, Malay, Chinese); “Other” headlines matched the search only in the article text and are often off-topic.', { n: articles.length, gdelt: <a href={news.source.url} target="_blank" rel="noreferrer">GDELT</a>, from: covered?.from ?? '–', to: covered?.to ?? '–', date: news.source.retrievedAt })} {news.live ? t('Updated daily until 1 Nov 2026.') : t('Saved snapshot.')}{saver && !news.live && <> <button type="button" className="text-button" onClick={() => setWant(true)}>{t('Load today’s headlines')}</button></>}</p>
  </section>;
}
