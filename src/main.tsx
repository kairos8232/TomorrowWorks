import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { filterMarketSignals, industries, marketSignals, type IndustryId, type MarketSignal, type SignalKind } from './market';
import { compareSkills, samplePromotionTarget, type Target, type TargetDraft } from './personal';
import { RoleMatches, SourcesFooter } from './RoleMatches';
import './styles.css';

type Screen = 'market' | 'changes' | 'demand' | 'skills' | 'outlook' | 'signin' | 'profile' | 'gaps' | 'roles' | 'pathway';
type ProfileDraft = { currentRole: string; skills: string; experience: string; interests: string; workPreferences: string; qualifications: string };
type Profile = { currentRole: string; skills: string[]; experience: string; interests: string[]; workPreferences: string; qualifications: string[] };

const emptyProfile: ProfileDraft = { currentRole: '', skills: '', experience: '', interests: '', workPreferences: '', qualifications: '' };
const sampleProfile: ProfileDraft = {
  currentRole: 'Junior Accountant',
  skills: 'Excel, bookkeeping, financial reporting',
  experience: '2 years supporting monthly reports and reconciliations',
  interests: 'data analysis, dashboards',
  workPreferences: 'I enjoy finding patterns and explaining them clearly to a team.',
  qualifications: '',
};

function splitEntries(value: string) {
  return [...new Set(value.split(',').map((entry) => entry.trim()).filter(Boolean))];
}

const viewKind: Partial<Record<Screen, SignalKind | 'all'>> = { market: 'all', changes: 'change', demand: 'demand', skills: 'skill', outlook: 'outlook' };

function SignalCard({ signal }: { signal: MarketSignal }) {
  return <article className="signal-card">
    <span className="market-label">{signal.kind === 'change' ? 'REPORTED CHANGE' : signal.kind.toUpperCase()}</span>
    <h2>{signal.title}</h2>
    <p>{signal.summary}</p>
    <p className="signal-source">{signal.source.name} · Published {signal.source.publishedAt} · Retrieved {signal.source.retrievedAt}</p>
    <p className="signal-source">{signal.source.geography} · {signal.industries.map((id) => industries.find((item) => item.id === id)!.label).join(', ')}</p>
    <p className="signal-source">Coverage: {signal.source.coverage}{signal.source.measure ? ` · Measure: ${signal.source.measure}` : ''}</p>
    {signal.assumptions && <p className="signal-source">Assumptions: {signal.assumptions.join('; ')}</p>}
    <a href={signal.source.url} target="_blank" rel="noreferrer">Open original source ↗</a>
  </article>;
}

const screens: { id: Screen; label: string; description: string }[] = [
  { id: 'market', label: 'Explore', description: 'Market overview' },
  { id: 'changes', label: 'Workplace changes', description: 'Reported industry issues' },
  { id: 'demand', label: 'Demand', description: 'Roles in demand now' },
  { id: 'skills', label: 'Skills', description: 'Skills requested now' },
  { id: 'outlook', label: 'Outlook', description: 'Possible future change' },
  { id: 'signin', label: 'Sign in', description: 'Demo entry for personal guidance' },
  { id: 'profile', label: 'My profile', description: 'Skills, experience and interests' },
  { id: 'gaps', label: 'My skill gaps', description: 'Compare a chosen target' },
  { id: 'roles', label: 'Role matches', description: 'Scores, reasons and skills gaps' },
  { id: 'pathway', label: 'My pathway', description: 'Learning steps and SDG links' },
];
const publicScreens = screens.filter((item) => item.id === 'market' || item.id === 'changes' || item.id === 'demand' || item.id === 'skills' || item.id === 'outlook');
const personalScreens = screens.filter((item) => item.id === 'profile' || item.id === 'gaps' || item.id === 'roles' || item.id === 'pathway');

const screenCopy: Record<Screen, { title: string; body: string; next: string }> = {
  market: {
    title: 'Explore work. Plan what comes next.',
    body: 'Browse workplace changes, demand, skills, and possible futures across industries. Each claim will show its source and coverage once verified.',
    next: 'No public market source has been connected yet.',
  },
  changes: {
    title: 'What is changing at work?',
    body: 'Browse dated reports and announcements about workplace issues across the covered industries. Each item will link to its original source.',
    next: 'No verified news or announcement feed is connected yet. Reported issues will appear here with source, date, industry tag, and coverage limits.',
  },
  demand: {
    title: 'Where is demand now?',
    body: 'Browse role demand only when a verified source supports the measure and location shown.',
    next: 'No verified demand source is connected yet. Counts, rankings, and trends will appear with the measure, geography, and date.',
  },
  skills: {
    title: 'Which skills are needed now?',
    body: 'See requested skills from dated public evidence once the source and extraction method are verified.',
    next: 'No verified skills source is connected yet. This view will explain which roles request each skill and where the evidence comes from.',
  },
  outlook: {
    title: 'What could change?',
    body: 'Explore possible future scenarios separately from today’s demand, with their assumptions and uncertainty clearly labelled.',
    next: 'Future scenarios are not available yet. This view will show estimates and assumptions, not guaranteed job forecasts.',
  },
  signin: {
    title: 'Make it yours',
    body: 'A future account will let you save your profile and return to your plan. Sign-in is not available in this prototype.',
    next: 'No account is created in the demo.',
  },
  profile: {
    title: 'Where are you today?',
    body: 'Add your current skills, experience and interests. This will become the starting point for explainable career matches.',
    next: 'Enter a profile to begin.',
  },
  gaps: {
    title: 'What should I build next?',
    body: 'Choose a promotion or career-move target and compare its illustrative skill list with your reviewed profile. This preview does not claim employer requirements.',
    next: 'Review a fictional profile before comparing your skills with a target.',
  },
  roles: {
    title: 'Find your next role',
    body: 'Nine ESCO roles ranked by your skills, DOSM job-ad demand and ILO AI exposure. Switch the data snapshot or the scenario to see how the ranking changes.',
    next: 'No roles have been ranked yet.',
  },
  pathway: {
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
  const [targetDraft, setTargetDraft] = useState<TargetDraft>(samplePromotionTarget);
  const [target, setTarget] = useState<Target | null>(null);
  const [targetError, setTargetError] = useState('');
  const [industry, setIndustry] = useState<IndustryId>('all');
  const [search, setSearch] = useState('');
  const activeScreen = screens.find((item) => item.id === screen)!;
  const content = screenCopy[screen];
  const currentKind = viewKind[screen];
  const visibleSignals = currentKind ? filterMarketSignals(marketSignals, currentKind, industry, search) : [];
  const hasViewSource = currentKind ? marketSignals.some((signal) => currentKind === 'all' || signal.kind === currentKind) : false;
  const industryLabel = industries.find((item) => item.id === industry)!.label;
  const comparison = profile && target ? compareSkills(profile.skills, target.skills) : null;
  const browseControls = currentKind ? <section className="browse-controls" aria-label="Filter public evidence">
    <div className="browse-fields">
      <label>Industry<select value={industry} onChange={(event) => setIndustry(event.target.value as IndustryId)}>{industries.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label>Search available evidence<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Topic, role, or skill" /></label>
    </div>
    <p className="scope-status" aria-live="polite">{industryLabel} · {search.trim() ? `search: “${search.trim()}” · ` : ''}{visibleSignals.length} verified {visibleSignals.length === 1 ? 'signal' : 'signals'} in this view. {marketSignals.length === 0 ? 'No source has been imported yet.' : ''}</p>
  </section> : null;

  function updateDraft(field: keyof ProfileDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setProfile(null);
    setProfileError('');
    setTarget(null);
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const skills = splitEntries(draft.skills);
    const interests = splitEntries(draft.interests);
    if (!draft.currentRole.trim() || !draft.experience.trim() || skills.length === 0 || interests.length === 0) {
      setProfileError('Complete every field and separate multiple skills or interests with commas.');
      return;
    }
    setProfile({ currentRole: draft.currentRole.trim(), skills, experience: draft.experience.trim(), interests, workPreferences: draft.workPreferences.trim(), qualifications: splitEntries(draft.qualifications) });
    setProfileError('');
  }

  function updateTarget(field: 'role' | 'skills', value: string) {
    setTargetDraft((current) => ({ ...current, [field]: value }));
    setTarget(null);
    setTargetError('');
  }

  function updateMoveType(value: TargetDraft['moveType']) {
    setTargetDraft((current) => ({ ...current, moveType: value }));
    setTarget(null);
    setTargetError('');
  }

  function saveTarget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const skills = splitEntries(targetDraft.skills);
    if (!targetDraft.role.trim() || skills.length === 0) {
      setTargetError('Enter a target role and at least one illustrative target skill.');
      return;
    }
    setTarget({ moveType: targetDraft.moveType, role: targetDraft.role.trim(), skills });
    setTargetError('');
  }

  function enterDemo() {
    if (!demoEntered) {
      setDraft(sampleProfile);
      setProfile(null);
      setProfileError('');
      setTarget(null);
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
            <h1 id="screen-title">{content.title}</h1>
            <p>{content.body}</p>
            {screen === 'market' && <div className="hero-actions"><button type="button" className="primary-button" onClick={() => setScreen('signin')}>Try the skill-gap demo</button><span>Fictional profile · no account needed</span></div>}
            {screen === 'market' && marketSignals.length === 0 && <div className="hero-source-status">Public evidence: no verified source connected yet.</div>}
          </section>
          {screen !== 'market' && browseControls}
          {screen === 'market' ? (
            <>
              <section className="market-grid" aria-label="Public market overview">
                <button type="button" className="market-card" onClick={() => setScreen('changes')}><span className="market-label">WORKPLACE CHANGES</span><h2>Reported workplace issues</h2><p>Dated reports and announcements about work, linked to their source when connected.</p><span className="card-link">Explore reported changes →</span></button>
                <button type="button" className="market-card" onClick={() => setScreen('demand')}><span className="market-label">CURRENT DEMAND</span><h2>Roles in demand now</h2><p>Present-day vacancy or labour measures, with their exact coverage once sourced.</p><span className="card-link">Explore demand →</span></button>
                <button type="button" className="market-card" onClick={() => setScreen('skills')}><span className="market-label">SKILLS NEEDED NOW</span><h2>Skills employers request</h2><p>Skills requested for covered roles, with source and date when verified.</p><span className="card-link">Explore skills →</span></button>
                <button type="button" className="market-card" onClick={() => setScreen('outlook')}><span className="market-label">FUTURE OUTLOOK</span><h2>What could change</h2><p>Possible scenarios with assumptions, separate from today's demand.</p><span className="card-link">Explore outlook →</span></button>
              </section>
              {browseControls}
              {visibleSignals.length > 0 && <section className="signal-list" aria-label="Available market evidence">{visibleSignals.map((signal) => <SignalCard key={signal.id} signal={signal} />)}</section>}
            </>
          ) : screen === 'changes' || screen === 'demand' || screen === 'skills' || screen === 'outlook' ? (
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
                <div className="field-grid">
                  <label>Experience<textarea value={draft.experience} onChange={(event) => updateDraft('experience', event.target.value)} placeholder="Describe the work you have done" rows={3} /></label>
                  <label>Interests<input value={draft.interests} onChange={(event) => updateDraft('interests', event.target.value)} placeholder="e.g. data analysis, dashboards" autoComplete="off" /><small>Separate interests with commas.</small></label>
                </div>
                <div className="field-grid">
                  <label>Work preferences or strengths (optional)<textarea value={draft.workPreferences} onChange={(event) => updateDraft('workPreferences', event.target.value)} placeholder="e.g. I enjoy explaining data and working with a team" rows={2} /><small>Describe tasks or ways of working you prefer. This does not affect matching yet.</small></label>
                  <label>Current certificates or qualifications (optional)<input value={draft.qualifications} onChange={(event) => updateDraft('qualifications', event.target.value)} placeholder="Use the fictional demo only" autoComplete="off" /><small>Separate entries with commas. No certificate is assumed from your job title.</small></label>
                </div>
                {profileError && <p className="form-error" role="alert">{profileError}</p>}
                <button type="submit" className="primary-button">Review profile</button>
              </form>
              {profile && <div className="profile-review" aria-live="polite"><span className="review-label">PROFILE READY</span><h3>{profile.currentRole}</h3><p>{profile.experience}</p><div className="tag-row">{profile.skills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}</div><p className="review-interests"><strong>Interested in:</strong> {profile.interests.join(', ')}</p>{profile.workPreferences && <p><strong>Work preferences or strengths:</strong> {profile.workPreferences}</p>}<p><strong>Current certificates or qualifications:</strong> {profile.qualifications.length ? profile.qualifications.join(', ') : 'None entered for this fictional profile'}</p><button type="button" className="text-button" onClick={() => setScreen('gaps')}>Compare skills for a target →</button></div>}
            </section>
          ) : screen === 'gaps' ? (
            profile ? <section className="profile-panel" aria-label="Personal skill-gap preview">
              <div className="panel-heading"><div><h2>Compare with a chosen target</h2><p>Fictional demo. The target list is editable and illustrative, not a verified employer requirement.</p></div><button type="button" className="text-button" onClick={() => setScreen('profile')}>Edit profile</button></div>
              <p className="profile-context">Reviewed profile: {profile.currentRole} · {profile.skills.length} current skills</p>
              <div className={`gap-workspace${target && comparison ? ' has-results' : ''}`}>
              <form onSubmit={saveTarget} noValidate>
                <div className="field-grid">
                  <label>Next move<select value={targetDraft.moveType} onChange={(event) => updateMoveType(event.target.value as TargetDraft['moveType'])}><option value="promotion">Promotion in my field</option><option value="career move">Move to another role</option></select></label>
                  <label>Target role<input value={targetDraft.role} onChange={(event) => updateTarget('role', event.target.value)} placeholder="Role you want to explore" autoComplete="off" /></label>
                </div>
                <label>Illustrative target skills<input value={targetDraft.skills} onChange={(event) => updateTarget('skills', event.target.value)} placeholder="e.g. Excel, budgeting, team leadership" autoComplete="off" /><small>Separate skills with commas. These are example inputs, not sourced requirements.</small></label>
                {targetError && <p className="form-error" role="alert">{targetError}</p>}
                <button type="submit" className="primary-button">Compare with my profile</button>
              </form>
              {target && comparison && <div className="gap-results" aria-live="polite">
                <span className="review-label">ILLUSTRATIVE COMPARISON</span>
                <h3>{target.moveType === 'promotion' ? 'Promotion target' : 'Career-move target'}: {target.role}</h3>
                <p>Exact skill names are compared after ignoring case and extra spaces. This does not assess proficiency, experience, eligibility, or promotion readiness.</p>
                <div className="gap-grid">
                  <div><h4>Skills you listed already</h4><div className="tag-row">{comparison.matched.length ? comparison.matched.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>) : <p>No exact matches in this illustrative target list.</p>}</div></div>
                  <div><h4>Skills to work on for this target</h4><div className="tag-row">{comparison.missing.length ? comparison.missing.map((skill) => <span className="skill-tag skill-gap" key={skill}>{skill}</span>) : <p>All entered target skill names match. Proficiency is still unassessed.</p>}</div></div>
                </div>
                <div className="credential-note"><h4>Certificates or qualifications</h4><p><strong>You entered:</strong> {profile.qualifications.length ? profile.qualifications.join(', ') : 'None for this fictional profile.'}</p><p><strong>Target requirement:</strong> No applicable certificate requirement has been verified yet. We cannot say which certificate is needed for this role or promotion.</p></div>
              </div>}
              </div>
            </section> : <section className="work-card" aria-label="Profile needed"><div className="card-icon" aria-hidden="true">✦</div><div><h2>Review your fictional profile first</h2><p>{content.next}</p><button type="button" className="primary-button demo-entry" onClick={() => setScreen('profile')}>Open my profile</button></div></section>
          ) : screen === 'roles' ? (
            <RoleMatches />
          ) : (
            <section className="work-card" aria-label={`${activeScreen.label} status`}>
              <div className="card-icon" aria-hidden="true">✦</div>
              <div><h2>{activeScreen.label}</h2><p>{content.next}</p></div>
            </section>
          )}
          <SourcesFooter />
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
