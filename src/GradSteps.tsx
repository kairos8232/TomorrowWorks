// The three-step path shown above the content, for both starts:
//   fresh graduate:  Your CV, A job ad, Your plan
//   already working: Your skills, Your moves, Your plan (sample people too)
// Shown only after a start on the home screen or the account menu (state in main.tsx, not stored).
import { useT } from './i18n';

export type StepPath = 'grad' | 'work';
export type GradStep = 'skills' | 'adcheck' | 'moves' | 'plan';
const PATHS: Record<StepPath, { id: GradStep; label: string }[]> = {
  grad: [{ id: 'skills', label: 'Your CV' }, { id: 'adcheck', label: 'A job ad' }, { id: 'plan', label: 'Your plan' }],
  work: [{ id: 'skills', label: 'Your skills' }, { id: 'moves', label: 'Your moves' }, { id: 'plan', label: 'Your plan' }],
};

/** True if the screen is one of the three steps of this path. */
export const isStepScreen = (path: StepPath, screen: string) => PATHS[path].some((s) => s.id === screen);

export function GradSteps({ path, current, onGo }: { path: StepPath; current: GradStep; onGo: (step: GradStep) => void }) {
  const t = useT();
  const steps = PATHS[path];
  const at = steps.findIndex((s) => s.id === current);
  return <nav className="grad-steps" aria-label={t('Your steps')}>
    <ol>{steps.map((s, i) => <li key={s.id} className={i < at ? 'done' : i === at ? 'current' : ''}>
      <button type="button" aria-current={i === at ? 'step' : undefined} onClick={() => onGo(s.id)}>
        <span className="grad-step-mark" aria-hidden="true">{i + 1}</span>
        {t(s.label)}
      </button>
    </li>)}</ol>
  </nav>;
}
