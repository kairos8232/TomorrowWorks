// Region view, for a regional skills centre that funds training for several groups.
// It is the third level of the SDG view: person (Your plan) → group (Team view) →
// region (here), all with the same rule (src/region.ts). A funding body sees
// totals only, never names. All groups are fictional; no state statistics are used.
import { useMemo } from 'react';
import { roles, roleTitle, type Viewer } from './data';
import { useT } from './i18n';
import { regionSdg, regions } from './region';
import { PossibleLinks, SdgBadge, SdgMethodNote } from './SdgViews';
import { targetTitle } from './sdg';

const GROUP_COLOURS = ['#1e6b4f', '#c98a1b', '#4a6fa5'];
const roleName = (id: string) => roleTitle(roles.find((r) => r.id === id)!.title);

export function RegionView({ viewer }: { viewer: Viewer }) {
  const t = useT();
  const region = regions.find((r) => r.id === viewer.regionId) ?? regions[0];
  const data = useMemo(() => regionSdg(region), [region]);
  const colour = (teamId: string) => GROUP_COLOURS[data.groups.findIndex((g) => g.id === teamId) % GROUP_COLOURS.length];
  const split = (byTeam: Record<string, number>) => data.groups.filter((g) => byTeam[g.id]).map((g) => `${t(g.name)} ${byTeam[g.id]}`).join(', ');

  return <div className="step-body region-view">
    <div className="who"><p><strong>{t('Viewing as {name}', { name: viewer.name })}</strong> ({t(viewer.group)}). {t(region.description)}</p></div>

    <section className="panel region-purpose" aria-labelledby="region-purpose-head">
      <h2 id="region-purpose-head">{t('What this view is for')}</h2>
      <p>{t('A regional skills centre funds training for many employers and colleges. It needs one answer: which SDG targets does the training we fund reach, and which routes would reach more?')}</p>
      <ol className="sdg-levels">
        <li><strong>{t('Person')}</strong><span>{t('Your plan: one person’s best move and the skills they would build.')}</span></li>
        <li><strong>{t('Group')}</strong><span>{t('Team view: an HR manager or adviser sees only their own team or class.')}</span></li>
        <li className="here"><strong>{t('Region')}</strong><span>{t('This view: the centre adds up every group it funds, with the same rule. Totals only, no names.')}</span></li>
      </ol>
    </section>

    <section className="panel region-sdg" aria-labelledby="region-sdg-head">
      <h2 id="region-sdg-head">{t('Which SDG targets the funded training reaches')}</h2>
      <p className="note">{t('{p} people in {g} groups. Each person counts once: their best move and the skills they would build for it.', { p: data.people, g: data.groups.length })}</p>
      <ul className="region-legend">{data.groups.map((g) => <li key={g.id}><i style={{ background: colour(g.id) }} aria-hidden="true" />{t(g.name)} <small>{t('{n} people', { n: g.people })}</small></li>)}</ul>
      <ul className="region-targets">
        {data.targets.map((row) => <li key={row.target}>
          <div className="region-target-head"><SdgBadge target={row.target} short /><strong>{t(targetTitle(row.target))}</strong><span className="region-count">{t('{n} of {m} people', { n: row.people, m: data.people })}</span></div>
          <div className="region-bar" role="img" aria-label={split(row.byTeam)}>
            {data.groups.map((g) => row.byTeam[g.id] ? <span key={g.id} style={{ width: `${(row.byTeam[g.id] / data.people) * 100}%`, background: colour(g.id) }} /> : null)}
          </div>
          <small>{split(row.byTeam)}</small>
        </li>)}
        {data.targets.length === 0 && <li><p>{t('No best move in these groups reaches a reviewed SDG target yet.')}</p></li>}
        <li className="sdg-baseline-row">
          <div className="region-target-head"><SdgBadge target="4.4" short /><strong>{t(targetTitle('4.4'))}</strong><span className="region-count">{t('{n} of {m} people', { n: data.baseline, m: data.people })}</span></div>
          <p><span className="sdg-source baseline">{t('Baseline')}</span> {t('Everyone with skills to build counts towards it.')}</p>
        </li>
      </ul>
      <PossibleLinks skills={data.paths.flatMap((p) => p.skills)} exclude={data.targets.map((x) => x.target)} />
    </section>

    {data.routes.length > 0 && <section className="panel region-routes" aria-labelledby="region-routes-head">
      <h2 id="region-routes-head">{t('Routes that would reach more targets')}</h2>
      <p className="note">{t('Some people’s second or third move leads to a role linked to targets their best move does not reach. Funding training for these roles would add those targets.')}</p>
      <table className="routes-table">
        <thead><tr><th scope="col">{t('Training route')}</th><th scope="col">{t('People for whom it is a 2nd or 3rd move')}</th><th scope="col">{t('Adds')}</th></tr></thead>
        <tbody>{data.routes.map((r) => <tr key={r.roleId}>
          <th scope="row">{roleName(r.roleId)}</th>
          <td><strong>{r.people}</strong> <small>{split(r.byTeam)}</small></td>
          <td><span className="region-lever-targets">{r.targets.map((x) => <SdgBadge key={x} target={x} short />)}</span></td>
        </tr>)}</tbody>
      </table>
    </section>}

    <p className="note">{t('Each group’s own manager sees its Team view; this centre sees totals only. Open data on workers by occupation per Malaysian state is not published, so no state statistics are used or implied.')}</p>
    <SdgMethodNote />
  </div>;
}
