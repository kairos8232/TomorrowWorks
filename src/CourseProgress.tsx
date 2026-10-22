import { useId, useState } from 'react';
import { useT } from './i18n';
import { credentialUrl, type CourseStatus, type LearningAction } from './learningCheck';

export function LearningProgress({total,recorded}:{total:number;recorded:number}) {
 const t=useT();const id=useId();
 // This prototype has no provider/reviewer verification. Never infer completion from a link.
 return <aside className="learning-progress" aria-labelledby={id}>
  <h3 id={id}>{t('About course completion')}</h3>
  <p className="note">{t('You can start these courses now. This demo cannot verify when you finish them.')}</p>
  {total>0 && recorded>0 && <p className="note" aria-live="polite">{t('Evidence submitted for {recorded} of {total} courses',{recorded,total})}. {t('These links are not verified and do not unlock milestones.')}</p>}
  <details className="plan-explainer"><summary>{t('About demo evidence')}</summary>
    <p className="note">{t('Evidence links are optional. They do not verify a completed course or unlock a milestone.')}</p>
    <p className="note">{t('A completed course does not prove mastery of every linked skill. Evidence links stay in this tab, clear on refresh and are not sent to a reviewer.')}</p>
  </details>
 </aside>;
}

export function CourseProgressControl({status,onAction}:{status:CourseStatus|undefined;onAction:(action:LearningAction)=>void}) {
 const t=useT();const id=useId();const [text,setText]=useState(status?.url??'');const [editing,setEditing]=useState(false);const [error,setError]=useState(false);
 const showForm=!status||editing;
 return <details className="course-check">
  <summary id={id}><span>{t(status ? 'Evidence submitted — not verified' : 'Finished this course? Try a demo evidence link')}</span><span className="evidence-optional">{t('Optional')}</span></summary>
  <div className="course-evidence-body">
  <p className="note">{t('Prototype: use a fictional public credential link only. Do not submit a real certificate or personal information. File uploads are not enabled.')}</p>
  {status && <div role="status">
    <strong>{t('Evidence submitted — not verified')}</strong>
    <p className="note">{t('Link format accepted only. Its contents, issuer, learner identity and relevance to this course have not been checked.')}</p>
    <a className="evidence-link" href={status.url} target="_blank" rel="noreferrer">{status.url}</a>
    {!editing && <div className="evidence-actions"><button type="button" className="text-button" onClick={()=>{setText(status.url);setEditing(true);setError(false);}}>{t('Edit evidence link')}</button><button type="button" className="text-button" onClick={()=>{onAction({type:'remove'});setText('');setError(false);}}>{t('Remove evidence')}</button></div>}
  </div>}
  {showForm && <form noValidate onSubmit={e=>{e.preventDefault();const url=credentialUrl(text);if(!url){setError(true);return;}onAction({type:'submit',url});setEditing(false);setError(false);}}>
   <label className="reflection-label" htmlFor={id+'-url'}>{t('Public credential link (HTTPS)')}</label>
   <input className="evidence-url" id={id+'-url'} type="url" maxLength={2000} value={text} placeholder="https://example.org/credentials/demo" onChange={e=>{setText(e.target.value);setError(false);}} aria-invalid={error||undefined} aria-describedby={id+'-help'+(error?' '+id+'-error':'')} />
   <p className="note" id={id+'-help'}>{t('A provider verification page is preferable to an image link. A link alone does not verify completion.')}</p>
   {error && <p role="alert" id={id+'-error'}>{t('Enter a valid HTTPS link without a username or password.')}</p>}
   <div className="evidence-actions"><button className="secondary-button" type="submit">{t('Submit demo evidence')}</button>{editing && <button type="button" className="text-button" onClick={()=>{setEditing(false);setText(status?.url??'');setError(false);}}>{t('Cancel')}</button>}</div>
  </form>}
  </div>
 </details>;
}
