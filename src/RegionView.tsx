// Region view (regional skills body): SDG contribution added up from people →
// groups → region, with the same rule as Your plan (src/region.ts). Each group
// opens in the Team view. All people and groups are fictional.
import { useMemo, useState } from 'react';
import { roles, roleTitle, teams, type Viewer } from './data';
import { useT } from './i18n';
import { regionSdg, regions } from './region';
import { PossibleLinks, SdgBadge, SdgMethodNote } from './SdgViews';
import { targetTitle } from './sdg';
import { TeamView } from './TeamView';

const GROUP_COLOURS = ['#1e6b4f', '#c98a1b', '#4a6fa5'];
const roleName = (id: string | null) => (id ? roleTitle(roles.find((r) => r.id === id)!.title) : '–');

export function RegionView({ viewer }: { viewer: Viewer }) {
  const t = useT();
  const region = regions.find((r) => r.id === viewer.regionId) ?? regions[0];
  const data = useMemo(() => regionSdg(region), [region]);
  const [openTeam, setOpenTeam] = useState<string | null>(null);
  const colour = (teamId: string) => GROUP_COLOURS[data.groups.findIndex((g) => g.id === teamId) % GROUP_COLOURS.length];
  const alternatives = data.paths.flatMap((p) => p.alternatives.map((a) => ({ ...a, name: p.name, teamId: p.teamId })));

  if (openTeam) {
    const team = teams.find((x) => x.id === openTeam)!;
    return <div className="step-body">
      <button type="button" className="text-button role-back" onClick={() => { setOpenTeam(null); window.scrollTo({ top: 0 }); }}>{t('Back to {region}', { region: t(region.name) })}</button>
      <TeamView viewer={{ ...viewer, name: viewer.name, group: team.viewer, teamId: team.id }} />
    </div>;
  }

  return <div className="step-body region-view">
    <div className="who"><p><strong>{t('Viewing as {name}', { name: viewer.name })}</strong> ({t(viewer.group)}). {t(region.description)}</p></div>

    <section className="panel region-sdg" aria-labelledby="region-sdg-head">
      <h2 id="region-sdg-head">{t('Where this region’s reskilling contributes')}</h2>
      <p className="note">{t('{p} people in {g} groups. Each person counts once: their best move and the skills they would build for it, the same rule as Your plan.', { p: data.people, g: data.groups.length })}</p>
      <ul className="region-legend">{data.groups.map((g) => <li key={g.id}><i style={{ background: colour(g.id) }} aria-hidden="true" />{t(g.name)} <small>{t('{n} people', { n: g.people })}</small></li>)}</ul>
      <ul className="region-targets">
        {data.targets.map((row) => <li key={row.target}>
          <div className="region-target-head"><SdgBadge target={row.target} short /><strong>{t(targetTitle(row.target))}</strong><span className="region-count">{t('{n} of {m} people', { n: row.people, m: data.people })}</span></div>
          <div className="region-bar" role="img" aria-label={data.groups.filter((g) => row.byTeam[g.id]).map((g) => `${t(g.name)}: ${row.byTeam[g.id]}`).join(', ')}>
            {data.groups.map((g) => row.byTeam[g.id] ? <span key={g.id} style={{ width: `${(row.byTeam[g.id] / data.people) * 100}%`, background: colour(g.id) }} /> : null)}
          </div>
          <small>{data.paths.filter((p) => p.targets.includes(row.target)).map((p) => `${p.name} (${roleName(p.roleId)})`).join(', ')}</small>
        </li>)}
        {data.targets.length === 0 && <li><p>{t('No best move in this region reaches a reviewed SDG target yet.')}</p></li>}
        <li className="sdg-baseline-row">
          <div className="region-target-head"><SdgBadge target="4.4" short /><strong>{t(targetTitle('4.4'))}</strong><span className="region-count">{t('{n} of {m} people', { n: data.baseline, m: data.people })}</span></div>
          <p><span className="sdg-source baseline">{t('Baseline')}</span> {t('Everyone with skills to build counts towards it.')}</p>
        </li>
      </ul>

      {alternatives.length > 0 && <div className="region-levers">
        <h3>{t('Moves that would add SDG targets')}</h3>
        <p className="note">{t('Second or third moves of people in this region whose role is linked to targets their best move does not reach. A regional body could fund these routes.')}</p>
        <ul>{alternatives.map((a) => <li key={a.name + a.roleId}>
          <i style={{ background: colour(a.teamId) }} aria-hidden="true" />
          <span><strong>{a.name}</strong>: {roleName(a.roleId)} <small>{t('move #{n}', { n: a.rank })}</small></span>
          <span className="region-lever-targets">{a.targets.map((x) => <SdgBadge key={x} target={x} short />)}</span>
        </li>)}</ul>
      </div>}

      <PossibleLinks skills={data.paths.flatMap((p) => p.skills)} exclude={data.targets.map((x) => x.target)} />
      <p className="note">{t('Region = the groups this body supports, added up person by person. Open data on workers by occupation per Malaysian state is not published, so no state statistics are used or implied.')}</p>
      <SdgMethodNote />
    </section>

    <section className="panel region-groups" aria-labelledby="region-groups-head">
      <h2 id="region-groups-head">{t('Groups in this region')}</h2>
      <ul>{data.groups.map((g) => {
        const best = data.paths.filter((p) => p.teamId === g.id);
        const counts = [...new Set(best.map((p) => p.roleId))].map((id) => ({ id, n: best.filter((p) => p.roleId === id).length })).sort((a, b) => b.n - a.n);
        return <li key={g.id}>
          <i style={{ background: colour(g.id) }} aria-hidden="true" />
          <div><strong>{t(g.name)}</strong> <small>{t('{n} people', { n: g.people })}</small>
            <p className="note">{t('Best moves')}: {counts.map((c) => `${roleName(c.id)} ${c.n}`).join(', ')}</p></div>
          <button type="button" className="secondary-button" onClick={() => { setOpenTeam(g.id); window.scrollTo({ top: 0 }); }}>{t('Open team view')}</button>
        </li>;
      })}</ul>
    </section>
  </div>;
}
