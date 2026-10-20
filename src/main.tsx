import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Screen = 'market' | 'profile' | 'roles' | 'pathway';
type ProfileDraft = { currentRole: string; skills: string; experience: string; interests: string };
type Profile = { currentRole: string; skills: string[]; experience: string; interests: string[] };

const emptyProfile: ProfileDraft = { currentRole: '', skills: '', experience: '', interests: '' };
const sampleProfile: ProfileDraft = {
  currentRole: 'Junior Accountant',
  skills: 'Excel, bookkeeping, financial reporting',
  experience: '2 years supporting monthly reports and reconciliations',
  interests: 'data analysis, dashboards',
};

function splitEntries(value: string) {
  return [...new Set(value.split(',').map((entry) => entry.trim()).filter(Boolean))];
}

const screens: { id: Screen; label: string; number: string; description: string }[] = [
  { id: 'market', label: 'Explore market', number: '01', description: 'Demand now and future outlook' },
  { id: 'profile', label: 'My profile', number: '02', description: 'Skills, experience and interests' },
  { id: 'roles', label: 'Role matches', number: '03', description: 'Scores, reasons and skills gaps' },
  { id: 'pathway', label: 'My pathway', number: '04', description: 'Learning steps and SDG links' },
];

const screenCopy: Record<Screen, { eyebrow: string; title: string; body: string; next: string }> = {
  market: {
    eyebrow: 'Start exploring',
    title: 'What does work need next?',
    body: 'Explore today’s demand and the skills employers need. Future outlooks will be shown separately as estimates, with dates and sources.',
    next: 'No public market source has been connected yet.',
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
  const [draft, setDraft] = useState<ProfileDraft>(emptyProfile);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState('');
  const activeIndex = screens.findIndex((item) => item.id === screen);
  const content = screenCopy[screen];

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
    setProfile({ currentRole: draft.currentRole.trim(), skills, experience: draft.experience.trim(), interests });
    setProfileError('');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Project navigation">
        <div className="brand"><span className="brand-mark" aria-hidden="true">✦</span><span>Tomorrow<span className="brand-accent">Works</span></span></div>
        <p className="sidebar-kicker">Your career, mapped forward.</p>
        <nav className="journey" aria-label="Career journey">
          {screens.map((item) => (
            <button
              className={`journey-step${screen === item.id ? ' active' : ''}`}
              key={item.id}
              onClick={() => setScreen(item.id)}
              type="button"
              aria-current={screen === item.id ? 'step' : undefined}
            >
              <span className="journey-number">{item.number}</span>
              <span><strong>{item.label}</strong><small>{item.description}</small></span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">Prototype in progress<br /><span>Public evidence and clear explanations at every step.</span></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><span>Career navigation workspace</span><span className="status-pill">Prototype build</span></header>
        <div className="content-wrap">
          <div className="progress-row"><span>YOUR JOURNEY</span><span>{String(activeIndex + 1).padStart(2, '0')} / 04</span></div>
          <div className="progress-track"><div style={{ width: `${((activeIndex + 1) / screens.length) * 100}%` }} /></div>
          <section className="hero" aria-labelledby="screen-title">
            <span className="eyebrow">{content.eyebrow}</span>
            <h1 id="screen-title">{content.title}</h1>
            <p>{content.body}</p>
          </section>
          {screen === 'market' ? (
            <section className="market-grid" aria-label="Public market overview">
              <div className="market-card"><span className="market-label">CURRENT DEMAND</span><h2>Roles in demand now</h2><p>Demand evidence will appear here after we connect and verify a public source. No job counts are available yet.</p></div>
              <div className="market-card"><span className="market-label">SKILLS NEEDED NOW</span><h2>Skills employers request</h2><p>Requested skills will appear here with the source, location, and date behind each claim.</p></div>
              <div className="market-card"><span className="market-label">FUTURE OUTLOOK</span><h2>What could change</h2><p>Future scenarios will appear here as estimates with their assumptions. They are not current hiring facts.</p></div>
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
                {profileError && <p className="form-error" role="alert">{profileError}</p>}
                <button type="submit" className="primary-button">Review profile</button>
              </form>
              {profile && <div className="profile-review" aria-live="polite"><span className="review-label">PROFILE READY</span><h3>{profile.currentRole}</h3><p>{profile.experience}</p><div className="tag-row">{profile.skills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}</div><p className="review-interests"><strong>Interested in:</strong> {profile.interests.join(', ')}</p><button type="button" className="text-button" onClick={() => setScreen('roles')}>Continue to role matches →</button></div>}
            </section>
          ) : (
            <section className="work-card" aria-label={`${screens[activeIndex].label} status`}>
              <div className="card-icon" aria-hidden="true">{activeIndex + 1}</div>
              <div><h2>{screens[activeIndex].label}</h2><p>{content.next}</p>{screen === 'roles' && profile && <p className="profile-context">Profile ready: {profile.currentRole} · {profile.skills.length} skills entered</p>}</div>
            </section>
          )}
          <div className="page-actions">
            {activeIndex > 0 && <button type="button" className="secondary-button" onClick={() => setScreen(screens[activeIndex - 1].id)}>Back</button>}
            {activeIndex < screens.length - 1 && <button type="button" className="primary-button" onClick={() => setScreen(screens[activeIndex + 1].id)}>Explore next <span aria-hidden="true">→</span></button>}
          </div>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
