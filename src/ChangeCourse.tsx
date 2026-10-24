import { useId, useRef, useState } from 'react';
import { useT } from './i18n';

export type CourseChoice = {title:string;url:string;provider:string;suggested:boolean};
export function ChangeCourse({courses,currentUrl,onConfirm}:{courses:CourseChoice[];currentUrl:string|undefined;onConfirm:(url:string)=>void}) {
 const t=useT();const id=useId();const dialog=useRef<HTMLDialogElement>(null);const [draft,setDraft]=useState(currentUrl??'');
 const chosen=courses.find(course=>course.url===draft);
 return <>
  <button type="button" className="secondary-button change-course-button" disabled={courses.length<2} onClick={()=>{setDraft(currentUrl??courses[0]?.url??'');dialog.current?.showModal();}}>{t('Change course')}</button>
  <dialog className="change-course-dialog" ref={dialog} aria-labelledby={id} aria-describedby={id+'-warning'}>
   <h2 id={id}>{t('Change your learning course?')}</h2>
   <p id={id+'-warning'}>{t('Confirming will replace the highlighted learning course and its Start or Continue link. Your existing evidence and opened-course history will be kept. Switching does not mark either course complete.')}</p>
   <form onSubmit={event=>{event.preventDefault();if(!chosen||draft===currentUrl)return;onConfirm(draft);dialog.current?.close();}}>
    <label className="reflection-label" htmlFor={id+'-pick'}>{t('Choose a course from this plan')}</label>
    <select id={id+'-pick'} value={draft} onChange={event=>setDraft(event.target.value)}>
     {courses.map(course=><option key={course.url} value={course.url}>{course.title}{course.suggested?' ('+t('AI suggestion')+')':''}</option>)}
    </select>
    {chosen && <p className="note">{chosen.provider} · {t(chosen.suggested?'AI suggestion · not checked by hand':'Checked course')}</p>}
    <div className="evidence-actions"><button type="button" className="secondary-button" onClick={()=>dialog.current?.close()}>{t('Cancel')}</button><button type="submit" className="primary-button" disabled={!chosen||draft===currentUrl}>{t('Confirm course change')}</button></div>
   </form>
  </dialog>
 </>;
}
