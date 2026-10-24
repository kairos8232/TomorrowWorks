// Workplace news: recent headlines from Malaysian outlets (GDELT snapshot).
// Context only: news never changes any score. Built by scripts/import_gdelt_news.py.
import { useEffect, useRef, useState } from 'react';
import { useDataSaver } from './dataSaver';
import newsFile from '../data/sources/gdelt-news.json';
import topicFile from '../data/sources/news-topics.json';
import { useT, useTx } from './i18n';

type Article = { title: string; url: string; outlet: string; language: string; seenAt: string; topics: string[] };
type Brief = { picks: Record<string, string[]>; model: string };
type NewsBody = { source: typeof newsFile.source & { covered?: { from: string; to: string }; fetchedAt?: string }; articles: Article[]; live?: boolean; brief?: Brief | null };
const day = (iso: string) => new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

const pageSize = 10;
// Topic order: the workplace topics as listed in news-topics.json, then the 'otherwise' topics (AI industry).
const topicOrder = [...new Set([...Object.keys(topicFile.query), ...Object.keys(topicFile.tagOnly), ...Object.values(topicFile.requires).map((r) => r.otherwise)])];

export function NewsView() {
  const [topic, setTopic] = useState('All topics');
  const [page, setPage] = useState(1);
  const feedRef = useRef<HTMLDivElement>(null);
  // Bundled snapshot first; the server may replace it with today's GDELT headlines (until 1 Nov 2026).
  const [news, setNews] = useState<NewsBody>(newsFile as NewsBody);
  const saver = useDataSaver();
  const [want, setWant] = useState(false);   // data saver: fetch today's headlines only when asked
  const [briefLoading, setBriefLoading] = useState(false);
  const [fetching, setFetching] = useState(!saver);   // true until the first request for today's headlines finishes
  useEffect(() => {
    if (saver && !want) return;
    setFetching(true);
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const load = () => fetch('/api/news').then((r) => (r.ok ? r.json() : null)).then((body: NewsBody | null) => {
      setFetching(false);
      if (body?.articles?.length) setNews(body);
      // The brief is computed on RunPod in the background; a sleeping worker can take
      // 1-2 minutes to start, so ask again every 20 s for up to 3 minutes.
      const waiting = Boolean(body && !body.brief && tries++ < 9);
      setBriefLoading(waiting);
      if (waiting) timer = setTimeout(load, 20_000);
    }).catch(() => { setBriefLoading(false); setFetching(false); });
    load();
    return () => clearTimeout(timer);
  }, [saver, want]);
  const articles = news.articles;
  const topics = [...new Set(articles.flatMap((a) => a.topics).filter((x) => x !== 'Other'))]
    .sort((a, b) => (topicOrder.indexOf(a) + 1 || 99) - (topicOrder.indexOf(b) + 1 || 99));
  const covered = news.source.covered;
  const t = useT();
  const tx = useTx();
  if (articles.length === 0) {
    return <section className="panel soon-panel"><h2>{t('No news imported yet')}</h2><p>{tx('Headlines appear here after running {cmd}. News is shown as context only and never changes your scores.', { cmd: <code>python3 scripts/import_gdelt_news.py</code> })}</p></section>;
  }
  // "All topics" leaves out "Other": GDELT matches whole articles, so untagged headlines are often off-topic.
  const shown = topic === 'All topics' ? articles.filter((a) => !a.topics.includes('Other')) : articles.filter((a) => a.topics.includes(topic));
  const pageCount = Math.max(1, Math.ceil(shown.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const first = (currentPage - 1) * pageSize;
  const selectTopic = (next: string) => { setTopic(next); setPage(1); };
  const changePage = (next: number) => {
    setPage(next);
    requestAnimationFrame(() => feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const byUrl = new Map(articles.map((a) => [a.url, a]));
  return <section className="data-table news" aria-label="Workplace news">
    <div className="news-topics-head">
      <div><h2>{t('Browse topics')}</h2><p className="note">{t('Choose a topic to focus the headlines below.')}</p></div>
      <div className="news-topic-options">
        <button type="button" aria-pressed={topic === 'All topics'} onClick={() => selectTopic('All topics')}>{t('All topics')}</button>
        <button type="button" aria-pressed={topic === 'Other'} onClick={() => selectTopic('Other')}>{t('Other')}</button>
      </div>
    </div>
    <p className="note news-status" aria-live="polite">{fetching
      ? t('Showing saved headlines from {date}. Checking for today’s headlines…', { date: day(newsFile.source.retrievedAt) })
      : news.live ? t('Today’s headlines loaded.') : t('Showing saved headlines from {date}.', { date: day(newsFile.source.retrievedAt) })}</p>
    <div className="news-topic-grid news-fade" key={`${news.live ? 'live' : 'saved'}-${news.brief ? 'brief' : 'plain'}`}>
      {topics.map((name) => {
        const list = articles.filter((a) => a.topics.includes(name));
        const picked = news.brief?.picks[name]?.map((url) => byUrl.get(url)).filter((a): a is Article => Boolean(a)) ?? [];
        const lead = picked.find((a) => a.topics.length === 1) ?? list.find((a) => a.topics.length === 1) ?? picked[0] ?? list[0];
        return <button type="button" key={name} className="news-topic-card" aria-pressed={topic === name} onClick={() => selectTopic(name)}>
          <span className="news-topic-count">{list.length}</span>
          <strong>{t(name)}</strong>
          {lead && <span className="news-topic-lead">{lead.title}</span>}
        </button>;
      })}
    </div>
    {news.brief && <p className="note news-topic-method">{t('Representative headlines use {model} picks where available. The headlines themselves come from the outlets.', { model: news.brief.model })}</p>}
    {!news.brief && briefLoading && <p className="note news-topic-method" aria-live="polite">{t('The summary of key headlines is loading. RunPod may be starting up, which can take a minute or two.')}</p>}
    <div className="news-feed-head" ref={feedRef}>
      <h2>{topic === 'All topics' ? t('Latest headlines') : t(topic)}</h2>
      <span className="note">{t('Showing {from}–{to} of {n}', { from: shown.length ? first + 1 : 0, to: Math.min(first + pageSize, shown.length), n: shown.length })}</span>
    </div>
    <ul className="news-list">
      {shown.slice(first, first + pageSize).map((a) => <li key={a.url}>
        <span className="news-item-topic">{t(a.topics[0] ?? 'Other')}</span>
        <a href={a.url} target="_blank" rel="noreferrer">{a.title}</a>
        <span className="note">{a.outlet} · {day(a.seenAt)}</span>
      </li>)}
    </ul>
    {pageCount > 1 && <nav className="news-pages" aria-label={t('Headline pages')}>
      <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>{t('Previous')}</button>
      <span>{t('Page {page} of {total}', { page: currentPage, total: pageCount })}</span>
      <button type="button" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>{t('Next')}</button>
    </nav>}
    <div className="news-source note">
      <p>{t('News is context only. It does not change your scores.')}</p>
      <p>{tx('{n} headlines from Malaysian outlets via {gdelt}, seen {from} to {to}, retrieved {date}. Topics use headline words; “Other” may be off-topic.', { n: articles.length, gdelt: <a href={news.source.url} target="_blank" rel="noreferrer">GDELT</a>, from: covered?.from ?? '–', to: covered?.to ?? '–', date: news.source.retrievedAt })} {news.live ? t('Updated daily until 1 Nov 2026.') : t('Saved snapshot.')}{saver && !news.live && <> <button type="button" className="text-button" onClick={() => setWant(true)}>{t('Load today’s headlines')}</button></>}</p>
    </div>
  </section>;
}
