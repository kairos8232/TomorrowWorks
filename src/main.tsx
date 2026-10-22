import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ainaProfile, emptyProfile, personaProfile, roles, viewerById, viewers, type PersonaId, type Profile, type ViewerId } from './data';
import { MovesStep, SourcesFooter } from './MovesStep';
import { DemandTable, OutlookTable } from './PublicTables';
import { NewsView } from './NewsView';
import { PlanStep } from './PlanStep';
import { advanceLearning, type CourseProgress, type LearningAction } from './learningCheck';
import { SkillsStep } from './SkillsStep';
import { TeamView } from './TeamView';
import { RadarView } from './RadarView';
import { SignalSources } from './SignalSources';
import { LangProvider, languages, translate, useT, type Lang } from './i18n';
import '@fontsource/carlito/400.css';
import '@fontsource/carlito/700.css';
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

function LanguagePicker({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const t = useT();
  const picker = useRef<HTMLDetailsElement>(null);
  const current = languages.find((option) => option.id === lang)!;
  return <details className="language-picker" ref={picker}>
    <summary aria-label={`${t('Language')}: ${current.label}`}><span className="language-full">{current.label}</span><span className="language-short">{lang === 'en' ? 'EN' : lang === 'ms' ? 'BM' : '中文'}</span></summary>
    <div className="language-options" aria-label={t('Language')}>
      {languages.map((option) => <button key={option.id} type="button" aria-pressed={lang === option.id} onClick={() => { setLang(option.id); picker.current!.open = false; }}><span>{option.label}</span><span aria-hidden="true">{lang === option.id ? '✓' : ''}</span></button>)}
    </div>
  </details>;
}

function Home({ start, startWithRole, go, lang, setLang }: {
  start: (who: ViewerId) => void;
  startWithRole: (role: string) => void;
  go: (screen: Screen) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
}) {
  const [role, setRole] = useState('Accounting assistant');
  const t = useT();
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (role.trim()) startWithRole(role);
  }
  return <div className="quiet-home">
    <header className="public-header" aria-label={t('Main navigation')}>
      <button type="button" className="public-brand" onClick={() => go('home')}>TomorrowWorks</button>
      <nav className="public-nav" aria-label={t('Explore TomorrowWorks')}>
        <button type="button" onClick={() => go('skills')}>{t('Explore careers')}</button>
        <button type="button" onClick={() => go('demand')}>{t('Job market')}</button>
        <a href="#how">{t('How it works')}</a>
      </nav>
      <button type="button" className="organisation-link" onClick={() => start('hr')}>{t('For organisations')}</button>
      <LanguagePicker lang={lang} setLang={setLang} />
    </header>

    <main>
      <section className="quiet-hero" aria-labelledby="home-title">
        <h1 id="home-title">{t('Your experience can take you further.')}</h1>
        <form className="direction-form" onSubmit={submit}>
          <label htmlFor="current-role">{t('I work as')}</label>
          <div className="role-field"><input id="current-role" value={role} onChange={(event) => setRole(event.target.value)} autoComplete="organization-title" /></div>
          <button type="submit">{t('Show me where it can lead')}</button>
        </form>
        <p className="quiet-proof">{t('Malaysian job-market evidence')} <span aria-hidden="true">·</span> {t('No CV required')}</p>
        <div className="journey-route" aria-hidden="true">
          <i className="route-segment route-a" /><i className="route-segment route-b" /><i className="route-segment route-c" />
          <i className="route-segment route-d" /><i className="route-segment route-e" /><i className="route-segment route-f" />
          <i className="route-segment route-g" /><i className="route-segment route-h" /><i className="route-segment route-i" />
          <span className="route-marker" />
        </div>
      </section>

      <section className="quiet-next" id="how" aria-labelledby="next-title">
        <div className="quiet-section-head">
          <p>{t('How it works')}</p>
          <h2 id="next-title">{t('One role. More than one possible future.')}</h2>
        </div>
        <ol className="quiet-steps">
          <li><span>01</span><div><h3>{t('Start with the work you already do')}</h3><p>{t('Choose your role, then keep only the skills that feel true to your experience.')}</p></div></li>
          <li><span>02</span><div><h3>{t('See realistic next moves')}</h3><p>{t('Compare nearby roles using skill fit, Malaysian demand and likely AI change.')}</p></div></li>
          <li><span>03</span><div><h3>{t('Leave with one practical plan')}</h3><p>{t('See the gaps to close and the learning route that can move you forward.')}</p></div></li>
        </ol>
      </section>

      <section className="quiet-evidence" aria-labelledby="evidence-title">
        <p className="quiet-kicker">{t('Built for decisions in Malaysia')}</p>
        <h2 id="evidence-title">{t('A clearer view of where work is moving.')}</h2>
        <div className="evidence-row">
          <p>{t('Explore job-ad demand, workplace signals and changing skill needs without starting from a blank search box.')}</p>
          <button type="button" onClick={() => go('demand')}>{t('Explore the job market')} <span aria-hidden="true">↗</span></button>
        </div>
      </section>

      <section className="quiet-organisations" aria-labelledby="organisations-title">
        <p>{t('For employers and educators')}</p>
        <h2 id="organisations-title">{t('Help more people make their next move.')}</h2>
        <button type="button" onClick={() => start('hr')}>{t('Open the organisation view')} <span aria-hidden="true">→</span></button>
      </section>
    </main>
    <footer className="public-footer"><span>TomorrowWorks</span><span>{t('Career direction, grounded in evidence.')}</span></footer>
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
  const sampleLabel = current.kind === 'team' ? t('Sample team') : current.kind === 'me' ? t('My path') : `${t('Sample')} — ${current.name}`;
  return <details className="viewer-switch" ref={ref}>
    <summary><span className="avatar" aria-hidden="true">{current.kind === 'team' ? 'T' : current.kind === 'me' ? 'M' : current.name[0]}</span>
      <span><small>{t('Try an example')}</small><strong>{sampleLabel}</strong></span></summary>
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
  useEffect(() => { document.documentElement.lang = lang === 'ms' ? 'ms-MY' : lang === 'zh' ? 'zh-Hans' : 'en'; }, [lang]);
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
  function startWithRole(role: string) {
    const normalized = role.trim().toLowerCase();
    const match = roles.find((candidate) => candidate.title.toLowerCase() === normalized || candidate.title.toLowerCase().includes(normalized));
    setViewer('me');
    setPlanRoleId(null);
    setProfile({ ...emptyProfile(), currentRoleId: match?.id ?? null });
    go('skills');
  }
  const kind = viewerById(viewer).kind;
  const page = screen === 'home' ? null : titles[screen];

  const t = translate(lang);
  if (screen === 'home') return <LangProvider value={lang}><Home start={start} startWithRole={startWithRole} go={go} lang={lang} setLang={setLang} /></LangProvider>;

  const inMarket = marketNav.some(item => item.id === screen);
  const primaryItems = kind === 'team' ? teamNav : careerNav;

  return <LangProvider value={lang}><div className="app-shell">
    <header className="workspace-header">
      <div className="workspace-header-main">
        <button type="button" className="workspace-brand" onClick={() => go('home')}>TomorrowWorks</button>
        <nav className="workspace-primary" aria-label={t('Main navigation')}>
          <button type="button" className={!inMarket && kind !== 'team' ? 'active' : ''} onClick={() => kind === 'team' ? start('me') : go('skills')}>{t('Career path')}</button>
          <button type="button" className={inMarket ? 'active' : ''} onClick={() => go('demand')}>{t('Job market')}</button>
          <button type="button" className={kind === 'team' && !inMarket ? 'active' : ''} onClick={() => start('hr')}>{t('For organisations')}</button>
        </nav>
        <details className="workspace-mobile-menu">
          <summary>{t('Menu')}</summary>
          <nav aria-label={t('Main navigation')}>
            <button type="button" onClick={() => kind === 'team' ? start('me') : go('skills')}>{t('Career path')}</button>
            <button type="button" onClick={() => go('demand')}>{t('Job market')}</button>
            <button type="button" onClick={() => start('hr')}>{t('For organisations')}</button>
          </nav>
        </details>
        <div className="workspace-utility">
          <ViewerSwitch viewer={viewer} choose={start} />
          <LanguagePicker lang={lang} setLang={setLang} />
        </div>
      </div>
    </header>

    <main className="main-content">
      <div className="content-wrap">
        {page && <header className="page-head">
          <h1>{t(page.title)}</h1>
          {screen !== 'moves' && screen !== 'plan' && <p>{t(page.intro)}</p>}
        </header>}
        <nav className="workspace-subnav" aria-label={inMarket ? t('The job market') : kind === 'team' ? t('My team') : t('My career')}>
          {(inMarket ? marketNav : kind === 'team' ? teamNav : primaryItems).map((item) => <button key={item.id} type="button" className={screen === item.id ? 'active' : ''} aria-current={screen === item.id ? 'page' : undefined} onClick={() => go(item.id)}>{t(item.label)}</button>)}
        </nav>
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
