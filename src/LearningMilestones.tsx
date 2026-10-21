import { useId } from 'react';
import { useT } from './i18n';
import { learningMilestones } from './milestones';

// Provider/reviewer integration does not exist yet. Never substitute submitted evidence.
const verifiedCourses: ReadonlySet<string> = new Set();
export function LearningMilestones({courseUrls}:{courseUrls:string[]}) {
 const t=useT();const id=useId();const milestones=learningMilestones(courseUrls,verifiedCourses);
 const badges=[
  {kind:'first',name:'First course completed',earned:milestones.first,rule:'Unlocks after one course completion is verified.'},
  {kind:'plan',name:'Selected plan’s courses completed',earned:milestones.plan,rule:'Unlocks when every unique course in this plan has verified completion, including AI suggestions. Optional certification routes are excluded. Empty plans do not qualify.'},
 ];
 return <section className="learning-milestones" aria-labelledby={id}>
  <h3 id={id}>{t('Learning milestones')}</h3>
  <p className="note">{t('Badges light up only after course completion is verified. Verification is not connected yet; submitted links do not unlock badges. Course badges do not certify skill mastery.')}</p>
  <ul className="milestone-grid">{badges.map(badge=><li key={badge.name} className={'milestone milestone-'+badge.kind+(badge.earned?' earned':'')}>
   <div className="milestone-heading"><span className="milestone-state"><svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>{badge.earned?<path d="M6 7V4a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5"/>:<path d="M5 7V4a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5"/>}</svg>{t(badge.earned?'Unlocked':'Locked')}</span></div>
   <div className="milestone-art" aria-hidden="true"><svg viewBox="0 0 160 132" fill="none">
    <path d="M29 68h-8m118 0h-8M39 36l-6-6m94 0-6 6M80 17V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {badge.kind==='first'?<>
     <path d="m56 79-8 44 22-10 10 13 6-43m18-4 8 44-22-10-10 13-6-43" fill="var(--badge-ribbon)" stroke="var(--badge-line)" strokeWidth="2"/>
     <path d="m80 21 12 6 14 1 6 12 10 10-2 14 2 14-10 10-6 12-14 1-12 6-12-6-14-1-6-12-10-10 2-14-2-14 10-10 6-12 14-1 12-6Z" fill="var(--badge-fill)" stroke="var(--badge-line)" strokeWidth="2"/>
     <circle cx="80" cy="64" r="28" fill="var(--badge-inner)" stroke="var(--badge-line)" strokeWidth="1.5"/>
     <path d="m80 44 6 12 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2 6-12Z" fill="var(--badge-line)"/>
    </>:<>
     <path d="M59 38H43v13c0 14 10 21 22 21m36-34h16v13c0 14-10 21-22 21" stroke="var(--badge-line)" strokeWidth="5"/>
     <path d="M56 29h48v25c0 20-11 31-24 31S56 74 56 54V29Z" fill="var(--badge-fill)" stroke="var(--badge-line)" strokeWidth="2"/>
     <path d="M80 85v18m-19 9h38m-34-9h30v10H65v-10Z" stroke="var(--badge-line)" strokeWidth="4" strokeLinejoin="round"/>
     <path d="m80 39 5 10 11 2-8 8 2 11-10-6-10 6 2-11-8-8 11-2 5-10Z" fill="var(--badge-line)"/>
     <path d="M49 120h62" stroke="var(--badge-line)" strokeWidth="2" strokeLinecap="round"/>
    </>}
   </svg></div>
   <h4>{t(badge.name)}</h4><p className="note">{t(badge.rule)}</p>
  </li>)}</ul>
 </section>;
}
