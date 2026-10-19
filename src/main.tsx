import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Screen = 'profile' | 'radar' | 'roles' | 'pathway';

const screens: { id: Screen; label: string; number: string; description: string }[] = [
  { id: 'profile', label: 'My profile', number: '01', description: 'Skills, experience and interests' },
  { id: 'radar', label: 'Skills radar', number: '02', description: 'Dated signals from a public source' },
  { id: 'roles', label: 'Role matches', number: '03', description: 'Scores, reasons and skills gaps' },
  { id: 'pathway', label: 'My pathway', number: '04', description: 'Learning steps and SDG links' },
];

const screenCopy: Record<Screen, { eyebrow: string; title: string; body: string; next: string }> = {
  profile: {
    eyebrow: 'Start here',
    title: 'Where are you today?',
    body: 'Add your current skills, experience and interests. This will become the starting point for explainable career matches.',
    next: 'Profile intake is the next build step.',
  },
  radar: {
    eyebrow: 'Evidence',
    title: 'See what is changing',
    body: 'The radar will show dated signals from an updatable public source, with a link back to the evidence.',
    next: 'No trend data has been connected yet.',
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
  const [screen, setScreen] = useState<Screen>('profile');
  const activeIndex = screens.findIndex((item) => item.id === screen);
  const content = screenCopy[screen];

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
        <header className="topbar"><span>Career navigation workspace</span><span className="status-pill">Planning build</span></header>
        <div className="content-wrap">
          <div className="progress-row"><span>YOUR JOURNEY</span><span>{String(activeIndex + 1).padStart(2, '0')} / 04</span></div>
          <div className="progress-track"><div style={{ width: `${((activeIndex + 1) / screens.length) * 100}%` }} /></div>
          <section className="hero" aria-labelledby="screen-title">
            <span className="eyebrow">{content.eyebrow}</span>
            <h1 id="screen-title">{content.title}</h1>
            <p>{content.body}</p>
          </section>
          <section className="work-card" aria-label={`${screens[activeIndex].label} status`}>
            <div className="card-icon" aria-hidden="true">{activeIndex + 1}</div>
            <div><h2>{screens[activeIndex].label}</h2><p>{content.next}</p></div>
          </section>
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
