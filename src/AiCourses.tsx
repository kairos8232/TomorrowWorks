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
  const rows = skills.map((skill) => ({ skill, course: matches.skills[skill.uri]?.courses[0] as Match | undefined }));
  const shown = all ? rows : rows.slice(0, 4);
  return <div className="ai-courses">
    <h4 id="ai-courses">{t('Skills without a checked course')} <span className="ai-count">{skills.length}</span></h4>
    <p className="note">{t('AI suggested Coursera matches below. They are unverified; match % is text similarity, not course quality.')}</p>
    <ul>{shown.map(({ skill, course }) => <li key={skill.uri}>
      <span className="ai-skill">{skill.label}</span>
      <span>{course ? <><a href={course.url} target="_blank" rel="noreferrer">{course.name}</a>
        <small>{t('match {n}%', { n: Math.round(course.similarity * 100) })}{course.workload ? ` · ${course.workload}` : ''}</small></> : t('No AI suggestion')}</span>
    </li>)}</ul>
    {rows.length > 4 && <button type="button" className="text-button" onClick={() => setAll(!all)}>{all ? t('Show fewer') : t('Show all {n}', { n: rows.length })}</button>}
    <p className="note">{t('Catalogue retrieved {date}. Coursera is paid; eligible Malaysians can get 3 months free through Rakyat Digital.', { date: matches.method.catalogue.retrievedAt })}</p>
  </div>;
}
