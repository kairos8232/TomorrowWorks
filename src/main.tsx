import { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ainaProfile, emptyProfile, ilo, personaProfile, roles, snapshots, sourceLinks, teams, transferable, viewerById, viewers, type PersonaId, type Profile, type ViewerId } from './data';
import { MovesStep, SourcesFooter } from './MovesStep';
import { DemandTable, OutlookTable } from './PublicTables';
import { recommendMoves, scenarios } from './scoring';
import { NewsView } from './NewsView';
import { PlanStep } from './PlanStep';
import { advanceLearning, type CourseProgress, type LearningAction } from './learningCheck';
import { SkillsStep } from './SkillsStep';
import { TeamView } from './TeamView';
import { RadarView } from './RadarView';
import { SignalSources } from './SignalSources';
import { LangProvider, languages, translate, useT, type Lang } from './i18n';
import './styles.css';

type Screen = 'home' | 'skills' | 'moves' | 'plan' | 'team' | 'demand' | 'outlook' | 'news' | 'trending' | 'signals';

type NavItem = { id: Screen; label: string; hint: string; soon?: boolean };
const careerNav: NavItem[] = [
  { id: 'skills', label: 'Your skills', hint: 'Describe your work' },
  { id: 'moves', label: 'Your moves', hint: 'Roles ranked for you' },
  { id: 'plan', label: 'Your plan', hint: 'What to learn next' },
];
const teamNav: NavItem[] = [
  { id: 'team', label: 'Team view', hint: 'Who fits which role, shared gaps' },
];
const marketNav: NavItem[] = [
  { id: 'demand', label: 'Job ads', hint: 'Demand by occupation' },
  { id: 'outlook', label: 'AI impact', hint: 'Three views of AI by role' },
  { id: 'news', label: 'Workplace news', hint: 'Latest reported changes' },
  { id: 'trending', label: 'Future skills radar', hint: 'Skills rising or at risk' },
  { id: 'signals', label: 'Signal sources', hint: 'Every source and its date' },
];

const titles: Record<Exclude<Screen, 'home'>, { title: string; intro: string }> = {
  skills: { title: 'Your skills', intro: 'Tell us what you do. Your moves are ranked from these skills only.' },
  moves: { title: 'Your moves', intro: 'Nine roles ranked by how well your skills fit, whether job ads are rising, and how much of the work AI could change.' },
  team: { title: 'Team view', intro: 'For HR and learning managers planning how to reskill a team, and career centres advising a class.' },
  plan: { title: 'Your plan', intro: 'Courses for the skills a move needs, in a sensible order, and the Malaysian certification route where one exists.' },
  demand: { title: 'Job ads in Malaysia', intro: 'Online job ads by occupation group, Q1 to Q2 2026.' },
  outlook: { title: 'AI impact by role', intro: 'How much AI could change each role, how applicable it is, and how it is already used.' },
  news: { title: 'Workplace news', intro: 'What Malaysian outlets reported recently about AI, layoffs, hiring and reskilling.' },
  trending: { title: 'Future skills radar', intro: 'Which skills are gaining value as AI changes work, and where yours stand.' },
  signals: { title: 'Signal sources', intro: 'Every data source behind TomorrowWorks: what it measures, how often it updates, and its date.' },
};

const comingSoon: Partial<Record<Screen, string>> = {
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

function NavIcon({ id }: { id: Screen }) {
  const shape = {
    skills: <><path d="M4 7h2m4 0h10M4 12h2m4 0h10M4 17h2m4 0h10" /><path d="m3.5 7 1 1 2-2m-3 6 1 1 2-2m-3 6 1 1 2-2" /></>,
    moves: <><path d="M4 18h5v-5h5V8h6" /><path d="m16 4 4 4-4 4" /></>,
    plan: <><path d="M7 3h10v18H7zM10 8h4m-4 4h4m-4 4h4" /></>,
    team: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-2a5.5 5.5 0 0 1 11 0v2M17 6a3 3 0 0 1 0 6m1 3a4 4 0 0 1 2.5 4" /></>,
    demand: <><path d="M4 20V11m5 9V6m5 14v-8m5 8V4M2 20h20" /></>,
    outlook: <><circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M19 5l-3 3M8 16l-3 3" /></>,
    news: <><path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5" /></>,
    trending: <><path d="M3 17h5v-5h5V8h8m-4-4 4 4-4 4" /></>,
    signals: <><path d="M4 18a8 8 0 0 1 16 0" /><path d="M7.5 18a4.5 4.5 0 0 1 9 0" /><circle cx="12" cy="18" r="1.2" /></>,
    home: null,
  }[id];
  return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shape}</svg>;
}

function NavGroup({ label, items, screen, go }: { label: string; items: NavItem[]; screen: Screen; go: (s: Screen) => void }) {
  const t = useT();
  return <div className="nav-group">
    <p className="nav-group-label">{t(label)}</p>
    <nav className="nav-list" aria-label={label}>
      {items.map((item) => <button key={item.id} type="button" className={`nav-item${screen === item.id ? ' active' : ''}${item.soon ? ' is-soon' : ''}`} aria-current={screen === item.id ? 'page' : undefined} onClick={() => go(item.id)}>
        <NavIcon id={item.id} /><span className="nav-copy"><strong>{t(item.label)}{item.soon && <span className="soon">{t('Soon')}</span>}</strong><small>{t(item.hint)}</small></span>
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
    <summary><span className="avatar" aria-hidden="true">{current.name === 'Me' ? t('Me')[0] : current.name.split(' ').pop()![0]}</span>
      <span><small>{t('Viewing as')}</small><strong>{current.name === 'Me' ? t('Me') : current.name}</strong></span></summary>
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
  // Kept above the screens so navigation preserves status; refresh clears it.
  // Use the actual profile owner because editing a sample makes it the visitor's profile.
  const [courseProgress, setCourseProgress] = useState<Record<string, CourseProgress>>({});
  const progressOwner = profile.persona ?? 'me';
  const [learningChoices, setLearningChoices] = useState<Record<string, Record<string, string>>>({});
  function chooseLearningCourse(role: string, url: string) {
    setLearningChoices(previous => ({ ...previous, [progressOwner]: { ...previous[progressOwner], [role]: url } }));
  }
  // A visited provider link only changes Start to Continue, never learning/completion scores.
  const [openedCourses, setOpenedCourses] = useState<Record<string, Set<string>>>({});
  function openCourse(url: string) {
    setOpenedCourses(previous => ({ ...previous, [progressOwner]: new Set([...(previous[progressOwner] ?? []), url]) }));
  }
  function updateCourseStatus(course: string, action: LearningAction) {
    setCourseProgress((previous) => {
      const next = advanceLearning(previous[progressOwner]?.[course], action);
      const owner = { ...previous[progressOwner] };
      if (next) owner[course] = next;
      else delete owner[course];
      return { ...previous, [progressOwner]: owner };
    });
  }
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
      <button type="button" className="brand" onClick={() => go('home')}>Tomorrow<span className="brand-accent">Works</span></button>
      <ViewerSwitch viewer={viewer} choose={start} />
      {kind === 'team'
        ? <NavGroup label="My team" items={teamNav} screen={screen} go={go} />
        : <NavGroup label="My career" items={careerNav} screen={screen} go={go} />}
      <NavGroup label="The job market" items={marketNav} screen={screen} go={go} />
      <label className="lang-pick"><svg className="lang-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg><span>{t('Language')}</span><select value={lang} aria-label={t('Language')} onChange={(e) => setLang(e.target.value as Lang)}>{languages.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select><svg className="lang-caret" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2 4 4 4 4-4" /></svg></label>
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
          : <section className="panel"><h2>{t('Add your skills first')}</h2><p className="note">{t('Your moves are ranked from your skills.')}</p><div className="empty-state-actions"><button type="button" className="primary-button" onClick={() => go('skills')}>{t('Add skills')}</button></div></section>)}
        {screen === 'plan' && (profile.held.size > 0
          ? <PlanStep learningChoices={learningChoices[progressOwner] ?? {}} onChooseLearningCourse={chooseLearningCourse} openedCourses={openedCourses[progressOwner]} onOpenCourse={openCourse} progress={courseProgress[progressOwner] ?? {}} onCourseStatus={updateCourseStatus} profile={profile} roleId={planRoleId} onPickRole={setPlanRoleId} onBackToMoves={() => go('moves')} />
          : <section className="panel"><h2>{t('Add your skills first')}</h2><p className="note">{t('Your plan is built from the skills a move needs that you don’t have yet.')}</p><div className="empty-state-actions"><button type="button" className="primary-button" onClick={() => go('skills')}>{t('Add skills')}</button></div></section>)}
        {screen === 'team' && <TeamView viewer={kind === 'team' ? viewerById(viewer) : viewerById('hr')} />}
        {screen === 'demand' && <DemandTable />}
        {screen === 'outlook' && <OutlookTable />}
        {screen === 'news' && <NewsView />}
        {screen === 'trending' && <RadarView profile={profile} onGo={go} />}
        {screen === 'signals' && <SignalSources />}
        {comingSoon[screen] && <section className="panel soon-panel"><h2>{t('Coming soon')}</h2><p>{t(comingSoon[screen]!)}</p></section>}
        <SourcesFooter showSourceSummary={!['home', 'moves', 'demand', 'outlook', 'news', 'trending', 'signals'].includes(screen)} />
      </div>
    </main>
  </div></LangProvider>;
}

createRoot(document.getElementById('root')!).render(<App />);
