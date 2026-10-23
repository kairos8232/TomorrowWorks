import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ainaProfile, emptyProfile, personaProfile, roles, viewerById, viewers, type PersonaId, type Profile, type ViewerId } from './data';
import { MovesStep, SourcesFooter } from './MovesStep';
import { advanceLearning, type CourseProgress, type LearningAction } from './learningCheck';
import { SkillsStep } from './SkillsStep';
import { GradSteps, isStepScreen, type GradStep, type StepPath } from './GradSteps';
import { LangProvider, languages, translate, useT, type Lang } from './i18n';
import { applyFonts, DataSaverProvider, initialDataSaver, saveDataSaver } from './dataSaver';
import './styles.css';

// Screens after the first steps load on demand, with their data (low bandwidth: the first visit
// downloads only Home, Your skills and Your moves).
const PlanStep = lazy(() => import('./PlanStep').then((m) => ({ default: m.PlanStep })));
const RegionView = lazy(() => import('./RegionView').then((m) => ({ default: m.RegionView })));
const TeamView = lazy(() => import('./TeamView').then((m) => ({ default: m.TeamView })));
const DemandTable = lazy(() => import('./PublicTables').then((m) => ({ default: m.DemandTable })));
const OutlookTable = lazy(() => import('./PublicTables').then((m) => ({ default: m.OutlookTable })));
const AdCheck = lazy(() => import('./AdCheck').then((m) => ({ default: m.AdCheck })));
const NewsView = lazy(() => import('./NewsView').then((m) => ({ default: m.NewsView })));
const RadarView = lazy(() => import('./RadarView').then((m) => ({ default: m.RadarView })));
const SignalSources = lazy(() => import('./SignalSources').then((m) => ({ default: m.SignalSources })));

type Screen = 'home' | 'skills' | 'moves' | 'plan' | 'team' | 'region' | 'demand' | 'adcheck' | 'outlook' | 'news' | 'trending' | 'signals';

type NavItem = { id: Screen; label: string; hint: string; soon?: boolean };
const careerNav: NavItem[] = [
  { id: 'skills', label: 'Your skills', hint: 'Describe your work' },
  { id: 'moves', label: 'Your moves', hint: 'Roles ranked for you' },
  { id: 'plan', label: 'Your plan', hint: 'What to learn next' },
];
const regionNav: NavItem[] = [
  { id: 'region', label: 'Region view', hint: 'SDG totals for the groups it funds' },
];
const teamNav: NavItem[] = [
  { id: 'team', label: 'Team view', hint: 'Who fits which role, shared gaps' },
];
const marketNav: NavItem[] = [
  { id: 'demand', label: 'Job ads', hint: 'Demand by occupation' },
  { id: 'adcheck', label: 'Check a job ad', hint: 'Paste an ad, see skills and signals' },
  { id: 'outlook', label: 'AI impact', hint: 'Three views of AI by role' },
  { id: 'news', label: 'Workplace news', hint: 'Latest reported changes' },
  { id: 'trending', label: 'Future skills radar', hint: 'Skills rising or at risk' },
  { id: 'signals', label: 'Signal sources', hint: 'Every source and its date' },
];

// Job market tabs in three zones: the tool on the left, the market data in the middle, the reference on the right.
const marketZone: Record<string, 'tool' | 'data' | 'reference'> = { adcheck: 'tool', demand: 'data', outlook: 'data', news: 'data', trending: 'data', signals: 'reference' };

const titles: Record<Exclude<Screen, 'home'>, { title: string; intro: string }> = {
  skills: { title: 'Your skills', intro: 'Tell us what you do. Your moves are ranked from these skills only.' },
  moves: { title: 'Your moves', intro: 'Compare roles by skill fit, demand and AI change.' },
  region: { title: 'Region view', intro: 'For regional skills centres that fund training for many employers and colleges: which SDG targets that training reaches, in totals.' },
  team: { title: 'Team view', intro: 'For HR and learning managers planning how to reskill a team, and career centres advising a class.' },
  plan: { title: 'Your plan', intro: 'Courses for the skills a move needs, in a sensible order, and the Malaysian certification route where one exists.' },
  demand: { title: 'Job ads in Malaysia', intro: 'Online job ads by occupation group, Q1 to Q2 2026.' },
  adcheck: { title: 'Check a job ad', intro: 'See the skills it asks for, where you stand, and what to learn next.' },
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
  return <details className="language-picker" name="header-dropdown" ref={picker}>
    <summary aria-label={`${t('Language')}: ${current.label}`}><span className="language-full">{current.label}</span><span className="language-short">{lang === 'en' ? 'EN' : lang === 'ms' ? 'BM' : '中文'}</span></summary>
    <div className="language-options" aria-label={t('Language')}>
      {languages.map((option) => <button key={option.id} type="button" aria-pressed={lang === option.id} onClick={() => { setLang(option.id); picker.current!.open = false; }}>{option.label}</button>)}
    </div>
  </details>;
}

function roundedRoute(points: [number, number][]) {
  const [start, ...rest] = points;
  let path = `M ${start[0]} ${start[1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const before = points[i - 1];
    const corner = points[i];
    const after = points[i + 1];
    const incoming = Math.hypot(corner[0] - before[0], corner[1] - before[1]);
    const outgoing = Math.hypot(after[0] - corner[0], after[1] - corner[1]);
    const radius = Math.min(45, incoming / 2, outgoing / 2);
    const entry: [number, number] = [corner[0] - (corner[0] - before[0]) / incoming * radius, corner[1] - (corner[1] - before[1]) / incoming * radius];
    const exit: [number, number] = [corner[0] + (after[0] - corner[0]) / outgoing * radius, corner[1] + (after[1] - corner[1]) / outgoing * radius];
    path += ` L ${entry[0]} ${entry[1]} Q ${corner[0]} ${corner[1]} ${exit[0]} ${exit[1]}`;
  }
  const end = rest[rest.length - 1];
  return `${path} L ${end[0]} ${end[1]}`;
}

function randomHeroRoute(previous: number): { path: string; pattern: number } {
  const between = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
  const start = -120;
  const first = between(700, 790);
  const middle = between(990, 1090);
  const right = between(1210, 1300);
  const startY = between(425, 470);
  const top = between(145, 210);
  const mid = between(335, 410);
  const bottom = between(520, 590);
  const pattern = (previous + 1 + between(0, 1)) % 3;
  const routes: [number, number][][] = [
    [[start, startY], [first, startY], [first, top], [right, top], [right, mid], [middle, mid], [middle, bottom], [1560, bottom]],
    [[start, startY], [first, startY], [first, bottom], [right, bottom], [right, top], [middle, top], [middle, mid], [1560, mid]],
    [[start, startY], [first, startY], [first, top], [middle, top], [middle, bottom], [right, bottom], [right, mid], [1560, mid]],
  ];
  return { path: roundedRoute(routes[pattern]), pattern };
}

function Home({ start, startWithRole, startFreshGrad, go, lang, setLang }: {
  start: (who: ViewerId) => void;
  startWithRole: (role: string) => void;
  startFreshGrad: () => void;
  go: (screen: Screen) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
}) {
  const [role, setRole] = useState('Accounting assistant');
  const routeRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const route = routeRef.current;
    const line = route?.querySelector('.journey-route-line');
    if (!route || !line) return;
    let pattern = -1;
    const reroute = () => {
      const next = randomHeroRoute(pattern);
      pattern = next.pattern;
      line.setAttribute('d', next.path);
    };
    reroute();
    line.addEventListener('animationiteration', reroute);
    let visible = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const paused = !visible || document.hidden || reducedMotion.matches;
      route.classList.toggle('is-paused', paused);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(route);
    document.addEventListener('visibilitychange', update);
    reducedMotion.addEventListener('change', update);
    update();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); reducedMotion.removeEventListener('change', update); line.removeEventListener('animationiteration', reroute); };
  }, []);
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
        <a href="#how">{t('Where to start')}</a>
      </nav>
      <button type="button" className="organisation-link" onClick={() => start('hr')}>{t('For organisations')}</button>
      <LanguagePicker lang={lang} setLang={setLang} />
    </header>

    <main>
      <section className="quiet-hero" aria-labelledby="home-title">
        <h1 id="home-title">{t('Your experience can take you further.')}</h1>
        <div className="hero-choices">
          <div className="choice-grid">
            <section className="choice-card choice-main" aria-labelledby="choice-grad">
              <h2 id="choice-grad">{t("I'm a fresh graduate")}</h2>
              <p>{t('From your CV to your first job: your skills, the gaps and what to learn.')}</p>
              <button type="button" className="choice-button" onClick={startFreshGrad}>{t('Start here')}</button>
            </section>
            <section className="choice-card" aria-labelledby="choice-work">
              <h2 id="choice-work">{t('I already work')}</h2>
              <form className="direction-form" onSubmit={submit}>
                <label htmlFor="current-role">{t('I work as')}</label>
                <div className="role-field"><input id="current-role" value={role} onChange={(event) => setRole(event.target.value)} autoComplete="organization-title" /></div>
                <button type="submit">{t('Show me where it can lead')}</button>
              </form>
            </section>
          </div>
          <p className="quiet-proof">{t('Malaysian job-market evidence')} <span aria-hidden="true">·</span> {t('Nothing you type is stored')}</p>
        </div>
        <svg ref={routeRef} className="journey-route" viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <path className="journey-route-line" pathLength="1000" d="M -120 450 H 760 Q 820 450 820 390 V 280 Q 820 220 880 220 H 1200 Q 1280 220 1280 300 V 340 Q 1280 400 1220 400 H 1100 Q 1040 400 1040 460 V 500 Q 1040 560 1100 560 H 1560" />
        </svg>
      </section>

      <section className="quiet-paths" id="how" aria-labelledby="paths-title">
        <div className="quiet-paths-head">
          <h2 id="paths-title">{t('Choose where to start.')}</h2>
        </div>
        <div className="quiet-paths-grid">
          <article className="quiet-path">
            <span className="quiet-path-number">01 / {t('Career path')}</span>
            <h3>{t('Find your next move')}</h3>
            <p>{t('Start with your skills, compare nearby roles, then make a learning plan.')}</p>
            <button type="button" onClick={() => go('skills')}>{t('Explore careers')} <span aria-hidden="true">↗</span></button>
          </article>
          <article className="quiet-path">
            <span className="quiet-path-number">02 / {t('Job market')}</span>
            <h3>{t('See how work is changing')}</h3>
            <p>{t('Explore Malaysian job ads, AI impact, workplace news and future skills.')}</p>
            <button type="button" onClick={() => go('demand')}>{t('Explore the job market')} <span aria-hidden="true">↗</span></button>
          </article>
          <article className="quiet-path">
            <span className="quiet-path-number">03 / {t('For organisations')}</span>
            <h3>{t('Plan for your team')}</h3>
            <p>{t('Compare role fit across a team and see which skills to build first.')}</p>
            <button type="button" onClick={() => start('hr')}>{t('Explore organisations')} <span aria-hidden="true">↗</span></button>
          </article>
        </div>
      </section>
    </main>
    <footer className="public-footer"><span>TomorrowWorks</span><span>{t('Career direction, grounded in evidence.')}</span><small className="public-footer-esco">This service uses the ESCO classification of the European Commission.</small></footer>
  </div>;
}

function NavIcon({ id }: { id: Screen }) {
  const shape = {
    skills: <><path d="M4 7h2m4 0h10M4 12h2m4 0h10M4 17h2m4 0h10" /><path d="m3.5 7 1 1 2-2m-3 6 1 1 2-2m-3 6 1 1 2-2" /></>,
    moves: <><path d="M4 18h5v-5h5V8h6" /><path d="m16 4 4 4-4 4" /></>,
    plan: <><path d="M7 3h10v18H7zM10 8h4m-4 4h4m-4 4h4" /></>,
    region: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
    team: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-2a5.5 5.5 0 0 1 11 0v2M17 6a3 3 0 0 1 0 6m1 3a4 4 0 0 1 2.5 4" /></>,
    demand: <><path d="M4 20V11m5 9V6m5 14v-8m5 8V4M2 20h20" /></>,
    adcheck: <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4M9 12h6m-6 4h4" /></>,
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
function ViewerSwitch({ viewer, choose, saver, toggleSaver }: { viewer: ViewerId; choose: (v: ViewerId) => void; saver: boolean; toggleSaver: () => void }) {
  const t = useT();
  const ref = useRef<HTMLDetailsElement>(null);
  const current = viewerById(viewer);
  const viewType = current.kind === 'team' ? 'Team' : current.kind === 'region' ? 'Region' : 'Individual';
  return <details className="viewer-switch" name="header-dropdown" ref={ref}>
    <summary><span className="avatar" aria-hidden="true">{current.name[0]}</span>
      <span><strong>{current.name}</strong><small>{t(viewType)}</small></span></summary>
    <ul>{viewers.map((v) => <li key={v.id}><button type="button" aria-current={v.id === viewer ? 'true' : undefined} onClick={() => { ref.current!.open = false; choose(v.id); }}>
      <strong>{v.id === 'me' ? t('Me (my own skills)') : v.name}</strong><small>{t(v.group)}</small>
    </button></li>)}
      <li className="viewer-setting"><button type="button" role="switch" aria-checked={saver} onClick={toggleSaver}>
        <strong>{t('Low-data mode')}<span className="viewer-setting-state">{saver ? t('On') : t('Off')}</span></strong>
        <small>{t('Uses system fonts. News and labour figures show the last saved copy until you load today’s.')}</small>
      </button></li></ul>
    <p className="note">{t('Demo people are fictional. No sign-in in this prototype.')}</p>
  </details>;
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [profile, setProfile] = useState<Profile>(ainaProfile);
  const [planRoleId, setPlanRoleId] = useState<string | null>(null);
  // True only after "Start here" on Home: shows the three-step bar. In memory, so a refresh returns to Home without it.
  const [path, setPath] = useState<StepPath | null>(null);
  const gradPath = path === 'grad';
  // The CV text read in step 1, so step 2 does not ask for it again. Memory only; cleared with the path.
  const [gradCv, setGradCv] = useState('');
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
  const [saver, setSaver] = useState(initialDataSaver);
  useEffect(() => applyFonts(saver), [saver]);
  const toggleSaver = () => { setSaver(!saver); saveDataSaver(!saver); };
  const go = (s: Screen) => { if (s === 'home') { setPath(null); setGradCv(''); } setScreen(s); window.scrollTo({ top: 0 }); };
  function start(who: ViewerId) {
    const v = viewerById(who);
    setPath(v.kind === 'person' || v.kind === 'me' ? 'work' : null);
    setViewer(who);
    setPlanRoleId(null);
    if (v.kind === 'person') { setProfile(personaProfile(who as PersonaId)); go('moves'); }
    else if (v.kind === 'me') { setProfile(emptyProfile()); go('skills'); }
    else if (v.kind === 'region') go('region');
    else go('team');
  }
  function startWithRole(role: string) {
    setPath('work');
    const normalized = role.trim().toLowerCase();
    const match = roles.find((candidate) => candidate.title.toLowerCase() === normalized || candidate.title.toLowerCase().includes(normalized));
    setViewer('me');
    setPlanRoleId(null);
    setProfile({ ...emptyProfile(), currentRoleId: match?.id ?? null });
    go('skills');
  }
  /** Fresh graduate start: an empty profile and the three-step path, beginning at Your CV. */
  function startFreshGrad() {
    setViewer('me');
    setPlanRoleId(null);
    setProfile(emptyProfile());
    setPath('grad');
    setGradCv('');
    go('skills');
  }
  const kind = viewerById(viewer).kind;
  const page = screen === 'home' ? null : titles[screen];

  const t = translate(lang);
  if (screen === 'home') return <LangProvider value={lang}><DataSaverProvider value={saver}><Home start={start} startWithRole={startWithRole} startFreshGrad={startFreshGrad} go={go} lang={lang} setLang={setLang} /></DataSaverProvider></LangProvider>;

  const onGradPath = path !== null && isStepScreen(path, screen);
  const inMarket = marketNav.some(item => item.id === screen) && !onGradPath;
  const subnavButton = (item: NavItem) => <button key={item.id} type="button" className={screen === item.id ? 'active' : ''} aria-current={screen === item.id ? 'page' : undefined} onClick={() => go(item.id)}>{t(item.label)}</button>;
  const isOrganisation = kind === 'team' || kind === 'region';
  const primaryItems = kind === 'region' ? regionNav : kind === 'team' ? teamNav : careerNav;

  return <LangProvider value={lang}><DataSaverProvider value={saver}><div className="app-shell">
    <header className="workspace-header">
      <div className="workspace-header-main">
        <button type="button" className="workspace-brand" onClick={() => go('home')}>TomorrowWorks</button>
        <nav className="workspace-primary" aria-label={t('Main navigation')}>
          {!isOrganisation && <button type="button" className={!inMarket ? 'active' : ''} onClick={() => go('skills')}>{t('Career path')}</button>}
          {isOrganisation && <button type="button" className={!inMarket ? 'active' : ''} onClick={() => go(kind === 'region' ? 'region' : 'team')}>{t('For organisations')}</button>}
          {!isOrganisation && <button type="button" className={screen === 'adcheck' && !onGradPath ? 'active' : ''} onClick={() => go('adcheck')}>{t('Check my CV')}</button>}
          <button type="button" className={inMarket && screen !== 'adcheck' ? 'active' : ''} onClick={() => go('demand')}>{t('Job market')}</button>
        </nav>
        <details className="workspace-mobile-menu">
          <summary>{t('Menu')}</summary>
          <nav aria-label={t('Main navigation')}>
            {!isOrganisation && <button type="button" onClick={() => go('skills')}>{t('Career path')}</button>}
            {isOrganisation && <button type="button" onClick={() => go(kind === 'region' ? 'region' : 'team')}>{t('For organisations')}</button>}
            {!isOrganisation && <button type="button" onClick={() => go('adcheck')}>{t('Check my CV')}</button>}
            <button type="button" onClick={() => go('demand')}>{t('Job market')}</button>
          </nav>
        </details>
        <div className="workspace-utility">
          <ViewerSwitch viewer={viewer} choose={start} saver={saver} toggleSaver={toggleSaver} />
          <LanguagePicker lang={lang} setLang={setLang} />
        </div>
      </div>
    </header>

    <main className="main-content">
      <div className={`content-wrap${screen === 'plan' ? ' plan-page' : screen === 'moves' ? ' moves-page' : ''}`}>
        {onGradPath && path && <GradSteps path={path} current={screen as GradStep} onGo={go} />}
        {!onGradPath && <nav className={`workspace-subnav${inMarket ? ' market-subnav' : ''}`} aria-label={inMarket ? t('The job market') : kind === 'region' ? t('My region') : kind === 'team' ? t('My team') : t('My career')}>
          {inMarket
            ? (['tool', 'data', 'reference'] as const).map((zone) => <div key={zone} className={`subnav-zone subnav-${zone}`}>{marketNav.filter((item) => marketZone[item.id] === zone).map(subnavButton)}</div>)
            : primaryItems.map(subnavButton)}
        </nav>}
        {page && (screen !== 'moves' || profile.held.size === 0) && <header className="page-head">
          <h1>{t(page.title)}</h1>
          <p>{t(page.intro)}</p>
        </header>}
        <Suspense fallback={<p className="note loading-note">{t('Loading…')}</p>}>
        {screen === 'skills' && <SkillsStep profile={profile} setProfile={setProfile} onNext={() => go(gradPath ? 'adcheck' : 'moves')} nextLabel={gradPath ? 'Next: A job ad' : path === 'work' ? 'Next: Your moves' : undefined} onCvText={gradPath ? setGradCv : undefined} />}
        {screen === 'moves' && (profile.held.size > 0
          ? <MovesStep showNext={path === 'work'} profile={profile} onEditSkills={() => { if (profile.persona) { setProfile(emptyProfile()); setViewer('me'); } go('skills'); }} onPlan={(id) => { setPlanRoleId(id); go('plan'); }} />
          : <section className="panel"><h2>{t('Add your skills first')}</h2><p className="note">{t('Your moves are ranked from your skills.')}</p><div className="empty-state-actions"><button type="button" className="primary-button" onClick={() => go('skills')}>{t('Add skills')}</button></div></section>)}
        {screen === 'plan' && (profile.held.size > 0
          ? <PlanStep learningChoices={learningChoices[progressOwner] ?? {}} onChooseLearningCourse={chooseLearningCourse} openedCourses={openedCourses[progressOwner]} onOpenCourse={openCourse} progress={courseProgress[progressOwner] ?? {}} onCourseStatus={updateCourseStatus} profile={profile} roleId={planRoleId} onPickRole={setPlanRoleId} />
          : <section className="panel"><h2>{t('Add your skills first')}</h2><p className="note">{t('Your plan is built from the skills a move needs that you don’t have yet.')}</p><div className="empty-state-actions"><button type="button" className="primary-button" onClick={() => go('skills')}>{t('Add skills')}</button></div></section>)}
        {screen === 'plan' && path !== null && profile.held.size > 0 && <section className="panel"><h2>{t('Want to try another role?')}</h2><p className="note">{t('Compare every role we track against your skills.')}</p><div className="empty-state-actions"><button type="button" className="secondary-button" onClick={() => go('moves')}>{t('Try another role')}</button></div></section>}
        {screen === 'region' && <RegionView viewer={kind === 'region' ? viewerById(viewer) : viewerById('region')} />}
        {screen === 'team' && <TeamView viewer={kind === 'team' ? viewerById(viewer) : viewerById('hr')} />}
        {screen === 'demand' && <DemandTable onCheckAd={() => go('adcheck')} />}
        {screen === 'adcheck' && <AdCheck profile={profile} onGo={go} initialCv={gradPath ? gradCv : ''} onNext={gradPath ? (id) => { setPlanRoleId(id); go('plan'); } : undefined} />}
        {screen === 'outlook' && <OutlookTable />}
        {screen === 'news' && <NewsView />}
        {screen === 'trending' && <RadarView profile={profile} onGo={go} />}
        {screen === 'signals' && <SignalSources />}
        </Suspense>
        {comingSoon[screen] && <section className="panel soon-panel"><h2>{t('Coming soon')}</h2><p>{t(comingSoon[screen]!)}</p></section>}
        <SourcesFooter showSourceSummary={!['home', 'moves', 'plan', 'demand', 'adcheck', 'outlook', 'news', 'trending', 'signals'].includes(screen)} />
      </div>
    </main>
  </div></DataSaverProvider></LangProvider>;
}

createRoot(document.getElementById('root')!).render(<App />);
