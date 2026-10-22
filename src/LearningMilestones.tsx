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
  <p className="note">{t('Complete courses to work towards these milestones. Verification is not connected in this demo, so they remain locked.')}</p>
  <ul className="milestone-grid">{badges.map(badge=><li key={badge.name} className={'milestone milestone-'+badge.kind+(badge.earned?' earned':'')}>
   <span className="milestone-art" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none">
    {badge.kind==='first'?<><path d="m20 40-3 18 11-5 4 7 4-20m8 0 3 18-11-5-4 7-4-20" fill="var(--badge-ribbon)" stroke="var(--badge-line)" strokeWidth="1.5"/><path d="m32 5 6 3 7 1 3 6 5 5-1 7 1 7-5 5-3 6-7 1-6 3-6-3-7-1-3-6-5-5 1-7-1-7 5-5 3-6 7-1 6-3Z" fill="var(--badge-fill)" stroke="var(--badge-line)" strokeWidth="1.5"/><circle cx="32" cy="27" r="13" fill="var(--badge-inner)" stroke="var(--badge-line)"/><path d="m32 17 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1 3-7Z" fill="var(--badge-line)"/></>:<><path d="M19 14H9v8c0 9 6 14 13 14m23-22h10v8c0 9-6 14-13 14" stroke="var(--badge-line)" strokeWidth="2.5"/><path d="M19 10h26v17c0 13-6 20-13 20s-13-7-13-20V10Z" fill="var(--badge-fill)" stroke="var(--badge-line)" strokeWidth="1.5"/><path d="m32 17 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1 3-7Z" fill="var(--badge-line)"/><path d="M32 47v8m-11 4h22m-17-4h12v4H26v-4Z" stroke="var(--badge-line)" strokeWidth="2"/></>}
   </svg></span>
   <div className="milestone-copy"><h4>{t(badge.name)}</h4><details className="milestone-rule"><summary>{t('How to unlock')}</summary><p className="note">{t(badge.rule)}</p><p className="note">{t('Learning milestones do not certify skill mastery.')}</p></details></div>
   <span className="milestone-state"><svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>{badge.earned?<path d="M6 7V4a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5"/>:<path d="M5 7V4a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5"/>}</svg>{t(badge.earned?'Unlocked':'Locked')}</span>
  </li>)}</ul>
 </section>;
}
