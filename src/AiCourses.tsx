// Courses found by AI for skills that have no hand-checked course.
// Data: data/derived/coursera-skill-matches.json, made by scripts/match_courses_runpod.py:
// RunPod (BAAI/bge-m3) embedded 25,051 Coursera course descriptions and compared them
// with the ESCO skill vectors. Labelled as AI-matched and not checked by hand.
import { useState } from 'react';
import matchesFile from '../data/derived/coursera-skill-matches.json';
import { useT } from './i18n';
import type { Skill } from './scoring';

type Match = { slug: string; name: string; url: string; workload: string | null; similarity: number };
const matches = matchesFile as { method: { coursesEmbedded: number; threshold: number; catalogue: { retrievedAt: string } }; skills: Record<string, { label: string; courses: Match[] }> };

export function AiCourses({ skills }: { skills: Skill[] }) {
  const t = useT();
  const [all, setAll] = useState(false);
  const found = skills.map((s) => ({ skill: s, course: matches.skills[s.uri]?.courses[0] })).filter((x): x is { skill: Skill; course: Match } => Boolean(x.course));
  if (found.length === 0) return null;
  const shown = all ? found : found.slice(0, 6);
  return <section className="ai-courses" aria-labelledby="ai-courses">
    <h4 id="ai-courses">{t('Found by AI on Coursera')} <span className="ai-label">{t('not checked by hand')}</span></h4>
    <p className="note">{t('RunPod compared {n} Coursera course descriptions with these skills (BAAI/bge-m3). The match is text similarity, not a quality rating; open the course to judge it.', { n: matches.method.coursesEmbedded.toLocaleString() })}</p>
    <ul>{shown.map(({ skill, course }) => <li key={skill.uri}>
      <span className="ai-skill">{skill.label}</span>
      <span><a href={course.url} target="_blank" rel="noreferrer">{course.name}</a>
        <small>{t('match {n}%', { n: Math.round(course.similarity * 100) })}{course.workload ? ` · ${course.workload}` : ''}</small></span>
    </li>)}</ul>
    {found.length > 6 && <button type="button" className="text-button" onClick={() => setAll(!all)}>{all ? t('Show fewer') : t('Show all {n}', { n: found.length })}</button>}
    <p className="note">{t('Catalogue retrieved {date}. Coursera is paid; eligible Malaysians can get 3 months free through Rakyat Digital.', { date: matches.method.catalogue.retrievedAt })}</p>
  </section>;
}
