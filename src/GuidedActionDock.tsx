import type { ReactNode } from 'react';

export function GuidedActionDock({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return <div className="guided-action-dock">
    <div className="guided-action-dock-inner">
      {note && <span className="guided-action-dock-note">{note}</span>}
      {children}
    </div>
  </div>;
}
