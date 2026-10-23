// The three-step path for a fresh graduate: Your CV, A job ad, Your plan.
// Shown only after "Start here" on the home screen (state in main.tsx, not stored).
import { useT } from './i18n';

export type GradStep = 'skills' | 'adcheck' | 'plan';
const STEPS: { id: GradStep; label: string }[] = [
  { id: 'skills', label: 'Your CV' },
  { id: 'adcheck', label: 'A job ad' },
  { id: 'plan', label: 'Your plan' },
];

export function GradSteps({ current, onGo }: { current: GradStep; onGo: (step: GradStep) => void }) {
  const t = useT();
  const at = STEPS.findIndex((s) => s.id === current);
  return <nav className="grad-steps" aria-label={t('Your steps')}>
    <ol>{STEPS.map((s, i) => <li key={s.id} className={i < at ? 'done' : i === at ? 'current' : ''}>
      <button type="button" aria-current={i === at ? 'step' : undefined} onClick={() => onGo(s.id)}>
        <span className="grad-step-mark" aria-hidden="true">{i + 1}</span>
        {t(s.label)}
      </button>
    </li>)}</ol>
  </nav>;
}
