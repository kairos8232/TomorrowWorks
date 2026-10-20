import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { filterMarketSignals, industries, marketSignals, type IndustryId, type MarketSignal, type SignalKind } from './market';
import './styles.css';

type Screen = 'market' | 'demand' | 'skills' | 'outlook' | 'signin' | 'profile' | 'roles' | 'pathway';
type ProfileDraft = { currentRole: string; skills: string; experience: string; interests: string; workPreferences: string };
type Profile = { currentRole: string; skills: string[]; experience: string; interests: string[]; workPreferences: string };

const emptyProfile: ProfileDraft = { currentRole: '', skills: '', experience: '', interests: '', workPreferences: '' };
const sampleProfile: ProfileDraft = {
  currentRole: 'Junior Accountant',
  skills: 'Excel, bookkeeping, financial reporting',
  experience: '2 years supporting monthly reports and reconciliations',
  interests: 'data analysis, dashboards',
  workPreferences: 'I enjoy finding patterns and explaining them clearly to a team.',
};

function splitEntries(value: string) {
  return [...new Set(value.split(',').map((entry) => entry.trim()).filter(Boolean))];
}

const viewKind: Partial<Record<Screen, SignalKind | 'all'>> = { market: 'all', demand: 'demand', skills: 'skill', outlook: 'outlook' };

function SignalCard({ signal }: { signal: MarketSignal }) {
  return <article className="signal-card">
    <span className="market-label">{signal.kind === 'change' ? 'REPORTED CHANGE' : signal.kind.toUpperCase()}</span>
    <h2>{signal.title}</h2>
    <p>{signal.summary}</p>
    <p className="signal-source">{signal.source.name} · {signal.source.publishedAt} · {signal.source.geography}</p>
    <p className="signal-source">Coverage: {signal.source.coverage}{signal.source.measure ? ` · Measure: ${signal.source.measure}` : ''}</p>
    <a href={signal.source.url} target="_blank" rel="noreferrer">Open original source ↗</a>
  </article>;
}

const screens: { id: Screen; label: string; description: string }[] = [
  { id: 'market', label: 'Explore', description: 'Market overview' },
  { id: 'demand', label: 'Demand', description: 'Roles in demand now' },
  { id: 'skills', label: 'Skills', description: 'Skills requested now' },
  { id: 'outlook', label: 'Outlook', description: 'Possible future change' },
  { id: 'signin', label: 'Sign in', description: 'Demo entry for personal guidance' },
  { id: 'profile', label: 'My profile', description: 'Skills, experience and interests' },
  { id: 'roles', label: 'Role matches', description: 'Scores, reasons and skills gaps' },
  { id: 'pathway', label: 'My pathway', description: 'Learning steps and SDG links' },
];
const publicScreens = screens.filter((item) => item.id === 'market' || item.id === 'demand' || item.id === 'skills' || item.id === 'outlook');
const personalScreens = screens.filter((item) => item.id === 'profile' || item.id === 'roles' || item.id === 'pathway');

const screenCopy: Record<Screen, { eyebrow: string; title: string; body: string; next: string }> = {
  market: {
    eyebrow: 'Start exploring',
    title: 'What does work need next?',
    body: 'Explore today’s demand and the skills employers need. Future outlooks will be shown separately as estimates, with dates and sources.',
    next: 'No public market source has been connected yet.',
  },
  demand: {
    eyebrow: 'Explore the market',
    title: 'Where is demand now?',
    body: 'Browse role demand only when a verified source supports the measure and location shown.',
    next: 'No verified demand source is connected yet. Counts, rankings, and trends will appear with the measure, geography, and date.',
  },
  skills: {
    eyebrow: 'Explore the market',
    title: 'Which skills are needed now?',
    body: 'See requested skills from dated public evidence once the source and extraction method are verified.',
    next: 'No verified skills source is connected yet. This view will explain which roles request each skill and where the evidence comes from.',
  },
  outlook: {
    eyebrow: 'Explore the market',
    title: 'What could change?',
    body: 'Explore possible future scenarios separately from today’s demand, with their assumptions and uncertainty clearly labelled.',
    next: 'Future scenarios are not available yet. This view will show estimates and assumptions, not guaranteed job forecasts.',
  },
  signin: {
    eyebrow: 'Personal guidance',
    title: 'Make it yours',
    body: 'A future account will let you save your profile and return to your plan. Sign-in is not available in this prototype.',
    next: 'No account is created in the demo.',
  },
  profile: {
    eyebrow: 'Personal guidance',
    title: 'Where are you today?',
    body: 'Add your current skills, experience and interests. This will become the starting point for explainable career matches.',
    next: 'Enter a profile to begin.',
  },
  roles: {
    eyebrow: 'Recommendations',
    title: 'Find your next role',
    body: 'Role cards will show a match score, supporting evidence, existing skills and the skills to build next.',
    next: 'No roles have been ranked yet.',
  },
  pathway: {
    eyebrow: 'Action plan',
    title: 'Make your next move',
    body: 'Choose a role to see ordered learning steps, time estimates, verified resources and its SDG connection.',
    next: 'The learning pathway is not available yet.',
  },
};

function App() {
  const [screen, setScreen] = useState<Screen>('market');
  const [demoEntered, setDemoEntered] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(emptyProfile);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState('');
  const [industry, setIndustry] = useState<IndustryId>('all');
  const [search, setSearch] = useState('');
  const activeScreen = screens.find((item) => item.id === screen)!;
  const content = screenCopy[screen];
  const currentKind = viewKind[screen];
  const visibleSignals = currentKind ? filterMarketSignals(marketSignals, currentKind, industry, search) : [];
  const hasViewSource = currentKind ? marketSignals.some((signal) => currentKind === 'all' || signal.kind === currentKind) : false;
  const industryLabel = industries.find((item) => item.id === industry)!.label;

  function updateDraft(field: keyof ProfileDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setProfile(null);
    setProfileError('');
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const skills = splitEntries(draft.skills);
    const interests = splitEntries(draft.interests);
    if (!draft.currentRole.trim() || !draft.experience.trim() || skills.length === 0 || interests.length === 0) {
      setProfileError('Complete every field and separate multiple skills or interests with commas.');
      return;
    }
    setProfile({ currentRole: draft.currentRole.trim(), skills, experience: draft.experience.trim(), interests, workPreferences: draft.workPreferences.trim() });
    setProfileError('');
  }

  function enterDemo() {
    if (!demoEntered) {
      setDraft(sampleProfile);
      setProfile(null);
      setProfileError('');
    }
    setDemoEntered(true);
    setScreen('profile');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Project navigation">
        <div className="brand"><span className="brand-mark" aria-hidden="true">✦</span><span>Tomorrow<span className="brand-accent">Works</span></span></div>
        <p className="sidebar-kicker">Your career, mapped forward.</p>
        <div className="nav-group">
          <p className="nav-group-label">BROWSE</p>
          <nav className="nav-list" aria-label="Browse the market">
            {publicScreens.map((item) => (
              <button className={`nav-item${screen === item.id ? ' active' : ''}`} key={item.id} onClick={() => setScreen(item.id)} type="button" aria-current={screen === item.id ? 'page' : undefined}>
                <strong>{item.label}</strong><small>{item.description}</small>
              </button>
            ))}
          </nav>
        </div>
        {demoEntered && <div className="nav-group personal-group">
          <p className="nav-group-label">MY CAREER</p>
          <nav className="nav-list" aria-label="My career">
            {personalScreens.map((item) => (
              <button className={`nav-item${screen === item.id ? ' active' : ''}`} key={item.id} onClick={() => setScreen(item.id)} type="button" aria-current={screen === item.id ? 'page' : undefined}>
                <strong>{item.label}</strong><small>{item.description}</small>
              </button>
            ))}
          </nav>
        </div>}
        <div className="sidebar-note">Prototype in progress<br /><span>Public evidence and clear explanations for each insight.</span></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><span>Career market explorer</span><button type="button" className="career-button" onClick={() => setScreen(demoEntered ? 'profile' : 'signin')}>{demoEntered ? 'My profile' : 'My career'}</button></header>
        <div className="content-wrap">
          <section className="hero" aria-labelledby="screen-title">
            <span className="eyebrow">{content.eyebrow}</span>
            <h1 id="screen-title">{content.title}</h1>
            <p>{content.body}</p>
          </section>
          {currentKind && <section className="browse-controls" aria-label="Filter public evidence">
            <div className="browse-fields">
              <label>Industry<select value={industry} onChange={(event) => setIndustry(event.target.value as IndustryId)}>{industries.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
              <label>Search available evidence<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Topic, role, or skill" /></label>
            </div>
            <p className="scope-status" aria-live="polite">{industryLabel} · {search.trim() ? `search: “${search.trim()}” · ` : ''}{visibleSignals.length} verified {visibleSignals.length === 1 ? 'signal' : 'signals'} in this view. {marketSignals.length === 0 ? 'No source has been imported yet.' : ''}</p>
          </section>}
          {screen === 'market' ? (
            <>
              <section className="market-grid" aria-label="Public market overview">
                <button type="button" className="market-card" onClick={() => setScreen('demand')}><span className="market-label">CURRENT DEMAND</span><h2>Roles in demand now</h2><p>Demand evidence will appear here after we connect and verify a public source. No job counts are available yet.</p><span className="card-link">Explore demand →</span></button>
                <button type="button" className="market-card" onClick={() => setScreen('skills')}><span className="market-label">SKILLS NEEDED NOW</span><h2>Skills employers request</h2><p>Requested skills will appear here with the source, location, and date behind each claim.</p><span className="card-link">Explore skills →</span></button>
                <button type="button" className="market-card" onClick={() => setScreen('outlook')}><span className="market-label">FUTURE OUTLOOK</span><h2>What could change</h2><p>Future scenarios will appear here as estimates with their assumptions. They are not current hiring facts.</p><span className="card-link">Explore outlook →</span></button>
              </section>
              {visibleSignals.length > 0 && <section className="signal-list" aria-label="Available market evidence">{visibleSignals.map((signal) => <SignalCard key={signal.id} signal={signal} />)}</section>}
              <div className="market-actions"><button type="button" className="primary-button" onClick={() => setScreen('signin')}>Get personalised guidance</button></div>
            </>
          ) : screen === 'demand' || screen === 'skills' || screen === 'outlook' ? (
            visibleSignals.length > 0 ? <section className="signal-list" aria-label={`${activeScreen.label} evidence`}>{visibleSignals.map((signal) => <SignalCard key={signal.id} signal={signal} />)}</section> : <section className="topic-panel" aria-label={`${activeScreen.label} information`}>
              <span className="market-label">SOURCE STATUS</span>
              <h2>{hasViewSource ? 'No evidence matches this scope' : 'Evidence is being connected'}</h2>
              <p>{hasViewSource ? 'Try another industry or search term. Only verified records are shown.' : content.next}</p>
              <button type="button" className="text-button" onClick={() => setScreen('market')}>Browse market overview →</button>
            </section>
          ) : screen === 'signin' ? (
            <section className="work-card" aria-label="Demo entry">
              <div className="card-icon" aria-hidden="true">✦</div>
              <div><h2>Continue with a fictional profile</h2><p>This demo skips real sign-in and uses sample information. It does not create an account, store a résumé, or save your details.</p><button type="button" className="primary-button demo-entry" onClick={enterDemo}>{demoEntered ? 'Continue to profile' : 'Continue with sample profile'}</button></div>
            </section>
          ) : screen === 'profile' ? (
            <section className="profile-panel" aria-label="Skills profile">
              <div className="panel-heading"><div><h2>Build your skills profile</h2><p>Use a fictional example for the demo. No CV upload or personal details are needed.</p></div><button type="button" className="text-button" onClick={() => { setDraft(sampleProfile); setProfile(null); setProfileError(''); }}>Load sample profile</button></div>
              <form onSubmit={saveProfile} noValidate>
                <div className="field-grid">
                  <label>Current role<input value={draft.currentRole} onChange={(event) => updateDraft('currentRole', event.target.value)} placeholder="e.g. Junior Accountant" autoComplete="off" /></label>
                  <label>Current skills<input value={draft.skills} onChange={(event) => updateDraft('skills', event.target.value)} placeholder="e.g. Excel, reporting" autoComplete="off" /><small>Separate skills with commas.</small></label>
                </div>
                <label>Experience<textarea value={draft.experience} onChange={(event) => updateDraft('experience', event.target.value)} placeholder="Describe the work you have done" rows={3} /></label>
                <label>Interests<input value={draft.interests} onChange={(event) => updateDraft('interests', event.target.value)} placeholder="e.g. data analysis, dashboards" autoComplete="off" /><small>Separate interests with commas.</small></label>
                <label>Work preferences or strengths (optional)<textarea value={draft.workPreferences} onChange={(event) => updateDraft('workPreferences', event.target.value)} placeholder="e.g. I enjoy explaining data and working with a team" rows={2} /><small>Describe tasks or ways of working you prefer. This does not affect matching yet.</small></label>
                {profileError && <p className="form-error" role="alert">{profileError}</p>}
                <button type="submit" className="primary-button">Review profile</button>
              </form>
              {profile && <div className="profile-review" aria-live="polite"><span className="review-label">PROFILE READY</span><h3>{profile.currentRole}</h3><p>{profile.experience}</p><div className="tag-row">{profile.skills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}</div><p className="review-interests"><strong>Interested in:</strong> {profile.interests.join(', ')}</p>{profile.workPreferences && <p><strong>Work preferences or strengths:</strong> {profile.workPreferences}</p>}<button type="button" className="text-button" onClick={() => setScreen('roles')}>Continue to role matches →</button></div>}
            </section>
          ) : (
            <section className="work-card" aria-label={`${activeScreen.label} status`}>
              <div className="card-icon" aria-hidden="true">✦</div>
              <div><h2>{activeScreen.label}</h2><p>{content.next}</p>{screen === 'roles' && profile && <p className="profile-context">Profile ready: {profile.currentRole} · {profile.skills.length} skills entered</p>}</div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
