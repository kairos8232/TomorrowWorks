// Team view for HR / L&D managers and career centres: a skills heatmap for a
// whole group and the gaps they share for one target role.
// Rule: src/team.ts (same scoring as Your moves). People are fictional.
import { useMemo, useState } from 'react';
import resourcesFile from '../data/pathway/resources.json';
import { ilo, memberSkills, roleTitle, roles, snapshots, teams, transferable } from './data';
import type { Resource } from './pathway';
import { scenarios } from './scoring';
import { sharedGaps, teamGrid } from './team';
import { useT } from './i18n';

const resources = resourcesFile.resources as Resource[];

/** Cell shade: darker green = higher score. Text always carries the number. */
const shade = (score: number) => `rgba(30, 107, 79, ${Math.min(0.9, 0.08 + score / 110)})`;

export function TeamView() {
  const t = useT();
  const [teamId, setTeamId] = useState(teams[0].id);
  const team = teams.find((t) => t.id === teamId)!;
  const members = useMemo(() => team.members.map((m) => ({ name: m.name, roleId: m.roleId, held: memberSkills(m) })), [team]);
  const grid = useMemo(() => teamGrid(members, roles, snapshots.q2, ilo, scenarios.moderate, transferable), [members]);
  const ranked = [...grid.averages].filter((a) => a.average !== null).sort((a, b) => b.average! - a.average!);
  const [targetId, setTargetId] = useState<string | null>(null);
  const target = roles.find((r) => r.id === targetId) ?? ranked[0].role;
  const shared = useMemo(() => sharedGaps(members, target, transferable, resources), [members, target]);

  return <div className="step-body team-view">
    <div className="ledger-controls team-pick">
      <fieldset><legend>{t('Group')}</legend>
        {teams.map((t) => <label key={t.id} className="choice"><input type="radio" name="team" checked={teamId === t.id} onChange={() => { setTeamId(t.id); setTargetId(null); }} />{t.name}</label>)}
      </fieldset>
    </div>
    <div className="who"><p><strong>{team.viewer}.</strong> {team.description}</p></div>

    <section className="ledger" aria-labelledby="heat">
      <h2 id="heat" className="section-title">{t('Who fits which role')}</h2>
      <p className="note">Each cell is that person’s score for the role, out of 100, from the same rule as Your moves (Q2 2026 job ads, AI changing work gradually). “Now” marks their current job.</p>
      <div className="heat-scroll">
        <table className="heatmap">
          <thead><tr><th scope="col">{t('Person')}</th>{roles.map((r) => <th scope="col" key={r.id}><button type="button" className={`heat-role${r.id === target.id ? ' active' : ''}`} onClick={() => setTargetId(r.id)}>{roleTitle(r.title)}</button></th>)}</tr></thead>
          <tbody>
            {grid.rows.map((row) => <tr key={row.member.name}>
              <th scope="row">{row.member.name}<small>{row.member.roleId ? roleTitle(roles.find((r) => r.id === row.member.roleId)!.title) : 'No job yet'}</small></th>
              {row.cells.map((c) => <td key={c.role.id} className={c.current ? 'now' : ''} style={c.current ? undefined : { background: shade(c.result.score100), color: c.result.score100 > 45 ? '#ffffff' : '#1c2430' }}>
                {c.current ? t('Now') : c.result.score100}
              </td>)}
            </tr>)}
            <tr className="heat-avg"><th scope="row">{t('Average')}<small>moves only</small></th>
              {grid.averages.map((a) => <td key={a.role.id}>{a.average ?? '–'}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <p className="note">Select a role name to see what the group would need to learn for it.</p>
    </section>

    <section className="ledger" aria-labelledby="shared">
      <h2 id="shared" className="section-title">{t('Shared gaps for {role}', { role: roleTitle(target.title) })}</h2>
      <p className="note">{shared.movers} of {members.length} people would be moving into this role. Skills most of them lack come first, with the first checked course that covers each (free before paid).</p>
      {shared.gaps.length === 0 ? <p>No gaps: everyone already has these skills.</p> : <ol className="gap-table">
        {shared.gaps.slice(0, 12).map((g) => {
          const count = g.missing.length + g.partly.length;
          return <li key={g.skill.uri}>
            <span className="gap-name">{g.skill.label}</span>
            <span className="gap-bar" aria-hidden="true"><span style={{ width: `${(count / shared.movers) * 100}%` }} /></span>
            <span className="gap-count">{count} of {shared.movers}<small>{[...g.missing, ...g.partly.map((n) => `${n} (partly)`)].join(', ')}</small></span>
            <span className="gap-course">{g.course ? <a href={g.course.url} target="_blank" rel="noreferrer">{g.course.title}</a> : <span className="note">{t('No checked course yet')}</span>}</span>
          </li>;
        })}
      </ol>}
      {shared.gaps.length > 12 && <p className="note">Showing the 12 most shared of {shared.gaps.length} gaps.</p>}
    </section>
    <p className="note">All people here are fictional. In a real deployment each person would confirm their own skills; the manager or adviser sees the group view, not anyone’s CV.</p>
  </div>;
}
