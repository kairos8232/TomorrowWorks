// Demo evidence submissions, not verified learning or provider completion.
export type CourseStatus = { url: string };
export type CourseProgress = Record<string, CourseStatus>;
export type LearningAction = { type: 'submit'; url: string } | { type: 'remove' };
export function credentialUrl(value: string): string | null {
  if (value.length > 2000) return null;
  try {
    const url=new URL(value.trim());
    if(url.protocol!=='https:' || !url.hostname.includes('.') || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}
export function advanceLearning(status: CourseStatus | undefined, action: LearningAction): CourseStatus | undefined {
  if(action.type==='remove') return undefined;
  const url=credentialUrl(action.url);
  return url ? {url} : status;
}
export function activityCount(courses: string[], progress: CourseProgress) {
  const urls=[...new Set(courses)];
  return {total:urls.length,recorded:urls.filter(url=>!!progress[url]).length};
}
