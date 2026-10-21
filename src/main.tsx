import { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ainaProfile, emptyProfile, ilo, personaProfile, roles, snapshots, sourceLinks, teams, transferable, viewerById, viewers, type PersonaId, type Profile, type ViewerId } from './data';
import { MovesStep, SourcesFooter } from './MovesStep';
import { DemandTable, OutlookTable } from './PublicTables';
import { recommendMoves, scenarios } from './scoring';
import { NewsView } from './NewsView';
import { PlanStep } from './PlanStep';
import { SkillsStep } from './SkillsStep';
import { TeamView } from './TeamView';
import { LangProvider, languages, translate, useT, type Lang } from './i18n';
import './styles.css';

type Screen = 'home' | 'skills' | 'moves' | 'plan' | 'team' | 'demand' | 'outlook' | 'news' | 'trending';

type NavItem = { id: Screen; label: string; hint: string; soon?: boolean };
const careerNav: NavItem[] = [
  { id: 'skills', label: '1. Your skills', hint: 'Describe your work' },
  { id: 'moves', label: '2. Your moves', hint: 'Roles ranked for you' },
  { id: 'plan', label: '3. Your plan', hint: 'What to learn next' },
];
const teamNav: NavItem[] = [
  { id: 'team', label: 'Team view', hint: 'Who fits which role, shared gaps' },
];
const marketNav: NavItem[] = [
  { id: 'demand', label: 'Job ads', hint: 'Demand by occupation' },
  { id: 'outlook', label: 'AI exposure', hint: 'How much AI could change' },
  { id: 'news', label: 'Workplace news', hint: 'Latest reported changes' },
  { id: 'trending', label: 'Skills in demand', hint: 'Skills employers ask for', soon: true },
];

const titles: Record<Exclude<Screen, 'home'>, { title: string; intro: string }> = {
  skills: { title: 'Your skills', intro: 'Tell us what you do. Your moves are ranked from these skills only.' },
  moves: { title: 'Your moves', intro: 'Nine roles ranked by how well your skills fit, whether job ads are rising, and how much of the work AI could change.' },
  team: { title: 'Team view', intro: 'For HR and learning managers planning how to reskill a team, and career centres advising a class.' },
  plan: { title: 'Your plan', intro: 'Courses for the skills a move needs, in a sensible order, and the Malaysian certification route where one exists.' },
  demand: { title: 'Job ads in Malaysia', intro: 'Online job ads by occupation group, Q1 to Q2 2026.' },
  outlook: { title: 'AI exposure by role', intro: 'How much of each role’s work generative AI could change.' },
  news: { title: 'Workplace news', intro: 'What Malaysian outlets reported recently about AI, layoffs, hiring and reskilling.' },
  trending: { title: 'Skills in demand', intro: 'Skills that Malaysian employers ask for.' },
};

const comingSoon: Partial<Record<Screen, string>> = {
  trending: 'Not connected yet. For now, each role’s skills come from ESCO and appear when you open a role in Your moves.',
};

function Home({ start }: { start: (who: ViewerId) => void }) {
  // Each persona's live result, computed from the same data and rule as the Moves step.
  const previews = useMemo(() => viewers.filter((v) => v.kind !== 'me').map((viewer) => {
    if (viewer.kind === 'team') return { viewer, moves: [] };
    const p = personaProfile(viewer.id as PersonaId);
    return { viewer, moves: recommendMoves(roles, p.currentRoleId, p.held, snapshots.q2, ilo, scenarios.moderate, transferable).moves.slice(0, 3) };
  }), []);
  const t = useT();
  return <div className="home">
    <section className="home-hero">
      <h1>{t('AI is changing your job. See where you can move next.')}</h1>
      <p>{t('Explore career moves using your skills, Malaysian job-ad data and research on AI.')}</p>
      <div className="hero-actions">
        <button type="button" className="primary-button" onClick={() => start('me')}>{t('Start with my own skills')}</button>
        <button type="button" className="secondary-button" onClick={() => start('aina')}>{t('Try a sample person')}</button>
      </div>
      <p className="note">{t('No account, no CV. Nothing you enter leaves your browser tab except the words you send to the skill search.')}</p>
    </section>

    <section className="home-how" aria-labelledby="how">
      <h2 id="how">{t('How it works')}</h2>
      <ol>
        <li><strong>{t('Your skills.')}</strong> {t('Describe your work and confirm the skills it finds.')}</li>
        <li><strong>{t('Your moves.')}</strong> {t('Compare nine roles with clear reasons for each score.')}</li>
        <li><strong>{t('Your plan.')}</strong> {t('See checked courses and a Malaysian SKM route where one exists.')}</li>
      </ol>
    </section>

    <section className="home-people" aria-labelledby="meet">
      <h2 id="meet">{t('One tool, four kinds of user')}</h2>
      <div className="people-grid">
        {previews.map(({ viewer, moves }) => <article key={viewer.id} className={`person-card${viewer.kind === 'team' ? ' team-card' : ''}`}>
          <p className="person-group">{t(viewer.group)}</p>
          <h3>{viewer.name}</h3>
          <p>{t(viewer.summary)}</p>
          {viewer.kind === 'person'
            ? <><p className="note">{t('Top moves with Q2 2026 data')}</p>
              <ol className="mini-ledger">{moves.map((m) => <li key={m.role.id}><span>{m.role.title}</span><strong>{m.score100}</strong></li>)}</ol></>
            : <p className="note">{t('Team view: {n} fictional people', { n: teams.find((x) => x.id === viewer.teamId)!.members.length })}</p>}
          <button type="button" className="text-button" onClick={() => start(viewer.id)}>{t('View as {name}', { name: viewer.name })}</button>
        </article>)}
      </div>
    </section>

    <section className="home-sources" aria-labelledby="data">
      <h2 id="data">{t('Where the numbers come from')}</h2>
      <dl>
        <div><dt><a href={sourceLinks.dosm} target="_blank" rel="noreferrer">DOSM</a></dt><dd>{t('Department of Statistics Malaysia. Online job ads by occupation, every quarter.')}</dd></div>
        <div><dt><a href={sourceLinks.ilo} target="_blank" rel="noreferrer">ILO</a></dt><dd>{t('International Labour Organization. How much of each job’s tasks generative AI could change.')}</dd></div>
        <div><dt><a href={sourceLinks.esco} target="_blank" rel="noreferrer">ESCO</a></dt><dd>{t('The European Commission’s list of skills and occupations. It uses the same job codes as Malaysia’s MASCO.')}</dd></div>
      </dl>
    </section>
  </div>;
}

function NavGroup({ label, items, screen, go }: { label: string; items: NavItem[]; screen: Screen; go: (s: Screen) => void }) {
  const t = useT();
  return <div className="nav-group">
    <p className="nav-group-label">{t(label)}</p>
    <nav className="nav-list" aria-label={label}>
      {items.map((item) => <button key={item.id} type="button" className={`nav-item${screen === item.id ? ' active' : ''}${item.soon ? ' is-soon' : ''}`} aria-current={screen === item.id ? 'page' : undefined} onClick={() => go(item.id)}>
        <strong>{t(item.label)}{item.soon && <span className="soon">{t('Soon')}</span>}</strong><small>{t(item.hint)}</small>
      </button>)}
    </nav>
  </div>;
}

/** "View as" switcher: looks like an account menu, but only swaps fictional demo data. */
function ViewerSwitch({ viewer, choose }: { viewer: ViewerId; choose: (v: ViewerId) => void }) {
  const t = useT();
  const ref = useRef<HTMLDetailsElement>(null);
  const current = viewerById(viewer);
  return <details className="viewer-switch" ref={ref}>
    <summary><span className="avatar" aria-hidden="true">{current.name === 'Me' ? '·' : current.name.split(' ').pop()![0]}</span>
      <span><small>{t('Viewing as')}</small><strong>{current.name === 'Me' ? t('Me (my own skills)') : current.name}</strong></span></summary>
    <ul>{viewers.map((v) => <li key={v.id}><button type="button" aria-current={v.id === viewer ? 'true' : undefined} onClick={() => { ref.current!.open = false; choose(v.id); }}>
      <strong>{v.id === 'me' ? t('Me (my own skills)') : v.name}</strong><small>{t(v.group)}</small>
    </button></li>)}</ul>
    <p className="note">{t('Demo people are fictional. No sign-in in this prototype.')}</p>
  </details>;
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [profile, setProfile] = useState<Profile>(ainaProfile);
  const [planRoleId, setPlanRoleId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ViewerId>('aina');
  const [lang, setLangState] = useState<Lang>(() => {
    try { const saved = localStorage.getItem('tw-lang'); return saved === 'ms' || saved === 'zh' ? saved : 'en'; } catch { return 'en'; }
  });
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem('tw-lang', l); } catch { /* storage unavailable */ } };
  const go = (s: Screen) => { setScreen(s); window.scrollTo({ top: 0 }); };
  function start(who: ViewerId) {
    const v = viewerById(who);
    setViewer(who);
    setPlanRoleId(null);
    if (v.kind === 'person') { setProfile(personaProfile(who as PersonaId)); go('moves'); }
    else if (v.kind === 'me') { setProfile(emptyProfile()); go('skills'); }
    else go('team');
  }
  const kind = viewerById(viewer).kind;
  const page = screen === 'home' ? null : titles[screen];

  const t = translate(lang);
  return <LangProvider value={lang}><div className="app-shell">
    <aside className="sidebar" aria-label="Navigation">
      <button type="button" className="brand" onClick={() => go('home')}>TomorrowWorks</button>
      <p className="sidebar-kicker">{t('Your career, mapped forward.')}</p>
      <label className="lang-pick"><span>{t('Language')}</span><select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>{languages.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>
      <ViewerSwitch viewer={viewer} choose={start} />
      {kind === 'team'
        ? <NavGroup label="My team" items={teamNav} screen={screen} go={go} />
        : <NavGroup label="My career" items={careerNav} screen={screen} go={go} />}
      <NavGroup label="The job market" items={marketNav} screen={screen} go={go} />
      <div className="sidebar-note">{t('Prototype for SDC Hackathon 2026')}<br /><span>{t('Profiles are fictional or stay in your browser.')}</span></div>
    </aside>

    <main className="main-content">
      <div className="content-wrap">
        {page && <header className="page-head">
          <h1>{t(page.title)}</h1>
          {screen !== 'moves' && screen !== 'plan' && <p>{t(page.intro)}</p>}
        </header>}
        {screen === 'home' && <Home start={start} />}
        {screen === 'skills' && <SkillsStep profile={profile} setProfile={setProfile} onNext={() => go('moves')} />}
        {screen === 'moves' && (profile.held.size > 0
          ? <MovesStep profile={profile} onEditSkills={() => { if (profile.persona) { setProfile(emptyProfile()); setViewer('me'); } go('skills'); }} onPlan={(id) => { setPlanRoleId(id); go('plan'); }} />
          : <section className="panel"><h2>{t('Add your skills first')}</h2><p className="note">{t('Your moves are ranked from your skills.')}</p><button type="button" className="primary-button" onClick={() => go('skills')}>{t('Add skills')}</button> <button type="button" className="text-button" onClick={() => start('aina')}>{t('Or view as Aina')}</button></section>)}
        {screen === 'plan' && (profile.held.size > 0
          ? <PlanStep profile={profile} roleId={planRoleId} onPickRole={setPlanRoleId} onBackToMoves={() => go('moves')} />
          : <section className="panel"><h2>{t('Add your skills first')}</h2><p className="note">{t('Your plan is built from the skills a move needs that you don’t have yet.')}</p><button type="button" className="primary-button" onClick={() => go('skills')}>{t('Add skills')}</button> <button type="button" className="text-button" onClick={() => start('aina')}>{t('Or view as Aina')}</button></section>)}
        {screen === 'team' && <TeamView viewer={kind === 'team' ? viewerById(viewer) : viewerById('hr')} />}
        {screen === 'demand' && <DemandTable />}
        {screen === 'outlook' && <OutlookTable />}
        {screen === 'news' && <NewsView />}
        {comingSoon[screen] && <section className="panel soon-panel"><h2>{t('Coming soon')}</h2><p>{t(comingSoon[screen]!)}</p></section>}
        <SourcesFooter showSourceSummary={!['home', 'demand', 'outlook', 'news', 'trending'].includes(screen)} />
      </div>
    </main>
  </div></LangProvider>;
}

createRoot(document.getElementById('root')!).render(<App />);
