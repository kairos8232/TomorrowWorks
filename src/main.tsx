import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { aina, ainaProfile, emptyProfile, ilo, roles, snapshots, sourceLinks, transferable, type Profile } from './data';
import { MovesStep, SourcesFooter } from './MovesStep';
import { DemandTable, OutlookTable } from './PublicTables';
import { recommendMoves, scenarios } from './scoring';
import { NewsView } from './NewsView';
import { PlanStep } from './PlanStep';
import { SkillsStep } from './SkillsStep';
import './styles.css';

type Screen = 'home' | 'skills' | 'moves' | 'plan' | 'demand' | 'outlook' | 'news' | 'trending';

type NavItem = { id: Screen; label: string; hint: string; soon?: boolean };
const careerNav: NavItem[] = [
  { id: 'skills', label: '1. Your skills', hint: 'Describe your work' },
  { id: 'moves', label: '2. Your moves', hint: 'Roles ranked for you' },
  { id: 'plan', label: '3. Your plan', hint: 'What to learn next' },
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
  plan: { title: 'Your plan', intro: 'Free courses for the skills a move needs, in a sensible order, and the Malaysian certification route where one exists.' },
  demand: { title: 'Job ads in Malaysia', intro: 'Online job ads by occupation group, Q1 to Q2 2026.' },
  outlook: { title: 'AI exposure by role', intro: 'How much of each role’s work generative AI could change.' },
  news: { title: 'Workplace news', intro: 'What Malaysian outlets reported recently about AI, layoffs, hiring and reskilling.' },
  trending: { title: 'Skills in demand', intro: 'Skills that Malaysian employers ask for.' },
};

const comingSoon: Partial<Record<Screen, string>> = {
  trending: 'Not connected yet. For now, each role’s skills come from ESCO and appear when you open a role in Your moves.',
};

function Home({ start }: { start: (who: 'aina' | 'me') => void }) {
  // Aina's live result, computed from the same data and rule as the Moves step.
  const preview = useMemo(() => {
    const p = ainaProfile();
    return recommendMoves(roles, p.currentRoleId, p.held, snapshots.q2, ilo, scenarios.moderate, transferable).moves.slice(0, 3);
  }, []);
  return <div className="home">
    <section className="home-hero">
      <h1>AI is changing your job. See where you can move next.</h1>
      <p>For Malaysian workers whose everyday tasks are starting to be done by AI. TomorrowWorks compares your skills with nine real roles, using official Malaysian job-ad figures and international research on AI.</p>
      <div className="hero-actions">
        <button type="button" className="primary-button" onClick={() => start('aina')}>Try it as Aina</button>
        <button type="button" className="secondary-button" onClick={() => start('me')}>Start with my own skills</button>
      </div>
      <p className="note">No account, no CV. Nothing you enter leaves your browser tab except the words you send to the skill search.</p>
    </section>

    <section className="home-how" aria-labelledby="how">
      <h2 id="how">How it works</h2>
      <ol>
        <li><strong>Your skills.</strong> Describe your work in your own words. An AI model finds the matching skills, and you confirm them.</li>
        <li><strong>Your moves.</strong> Nine roles ranked by skill fit, job-ad demand and AI exposure. Every score shows its reasons.</li>
        <li><strong>Your plan.</strong> Pick a move and get free courses for the skills it needs, plus the Malaysian SKM route where one exists.</li>
      </ol>
    </section>

    <section className="home-aina" aria-labelledby="meet">
      <div>
        <h2 id="meet">Meet {aina.name}</h2>
        <p>{aina.summary}</p>
      </div>
      <div>
        <p className="note">Her top moves with Q2 2026 data</p>
        <ol className="mini-ledger">{preview.map((m) => <li key={m.role.id}><span>{m.role.title}</span><strong>{m.score100}</strong></li>)}</ol>
        <button type="button" className="text-button" onClick={() => start('aina')}>See why</button>
      </div>
    </section>

    <section className="home-sources" aria-labelledby="data">
      <h2 id="data">Where the numbers come from</h2>
      <dl>
        <div><dt><a href={sourceLinks.dosm} target="_blank" rel="noreferrer">DOSM</a></dt><dd>Department of Statistics Malaysia. Online job ads by occupation, every quarter.</dd></div>
        <div><dt><a href={sourceLinks.ilo} target="_blank" rel="noreferrer">ILO</a></dt><dd>International Labour Organization. How much of each job’s tasks generative AI could change.</dd></div>
        <div><dt><a href={sourceLinks.esco} target="_blank" rel="noreferrer">ESCO</a></dt><dd>The European Commission’s list of skills and occupations. It uses the same job codes as Malaysia’s MASCO.</dd></div>
      </dl>
    </section>
  </div>;
}

function Steps({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  return <ol className="steps" aria-label="Steps">
    {careerNav.map((item) => <li key={item.id}>
      <button type="button" className={screen === item.id ? 'active' : ''} aria-current={screen === item.id ? 'step' : undefined} onClick={() => go(item.id)}>
        {item.label}{item.soon && <span className="soon">Soon</span>}
      </button>
    </li>)}
  </ol>;
}

function NavGroup({ label, items, screen, go }: { label: string; items: NavItem[]; screen: Screen; go: (s: Screen) => void }) {
  return <div className="nav-group">
    <p className="nav-group-label">{label}</p>
    <nav className="nav-list" aria-label={label}>
      {items.map((item) => <button key={item.id} type="button" className={`nav-item${screen === item.id ? ' active' : ''}${item.soon ? ' is-soon' : ''}`} aria-current={screen === item.id ? 'page' : undefined} onClick={() => go(item.id)}>
        <strong>{item.label}{item.soon && <span className="soon">Soon</span>}</strong><small>{item.hint}</small>
      </button>)}
    </nav>
  </div>;
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [profile, setProfile] = useState<Profile>(ainaProfile);
  const [planRoleId, setPlanRoleId] = useState<string | null>(null);
  const go = (s: Screen) => { setScreen(s); window.scrollTo({ top: 0 }); };
  function start(who: 'aina' | 'me') {
    setProfile(who === 'aina' ? ainaProfile() : emptyProfile());
    setPlanRoleId(null);
    go(who === 'aina' ? 'moves' : 'skills');
  }
  const isCareer = screen === 'skills' || screen === 'moves' || screen === 'plan';
  const page = screen === 'home' ? null : titles[screen];

  return <div className="app-shell">
    <aside className="sidebar" aria-label="Navigation">
      <button type="button" className="brand" onClick={() => go('home')}>TomorrowWorks</button>
      <p className="sidebar-kicker">Your career, mapped forward.</p>
      <NavGroup label="My career" items={careerNav} screen={screen} go={go} />
      <NavGroup label="The job market" items={marketNav} screen={screen} go={go} />
      <div className="sidebar-note">Prototype for SDC Hackathon 2026<br /><span>Profiles are fictional or stay in your browser.</span></div>
    </aside>

    <main className="main-content">
      <div className="content-wrap">
        {page && <header className="page-head">
          {isCareer && <Steps screen={screen} go={go} />}
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </header>}
        {screen === 'home' && <Home start={start} />}
        {screen === 'skills' && <SkillsStep profile={profile} setProfile={setProfile} onNext={() => go('moves')} />}
        {screen === 'moves' && (profile.held.size > 0
          ? <MovesStep profile={profile} onEditSkills={() => { if (profile.persona) setProfile(emptyProfile()); go('skills'); }} onPlan={(id) => { setPlanRoleId(id); go('plan'); }} />
          : <section className="panel"><h2>Add your skills first</h2><p className="note">Your moves are ranked from your skills.</p><button type="button" className="primary-button" onClick={() => go('skills')}>Add skills</button> <button type="button" className="text-button" onClick={() => start('aina')}>Or try it as Aina</button></section>)}
        {screen === 'plan' && (profile.held.size > 0
          ? <PlanStep profile={profile} roleId={planRoleId} onPickRole={setPlanRoleId} onBackToMoves={() => go('moves')} />
          : <section className="panel"><h2>Add your skills first</h2><p className="note">Your plan is built from the skills a move needs that you don’t have yet.</p><button type="button" className="primary-button" onClick={() => go('skills')}>Add skills</button> <button type="button" className="text-button" onClick={() => start('aina')}>Or try it as Aina</button></section>)}
        {screen === 'demand' && <DemandTable />}
        {screen === 'outlook' && <OutlookTable />}
        {screen === 'news' && <NewsView />}
        {comingSoon[screen] && <section className="panel soon-panel"><h2>Coming soon</h2><p>{comingSoon[screen]}</p></section>}
        <SourcesFooter />
      </div>
    </main>
  </div>;
}

createRoot(document.getElementById('root')!).render(<App />);
