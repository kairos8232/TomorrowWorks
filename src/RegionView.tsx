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
    <header className="region-scope">
      <div><p className="region-scope-name">{t(region.name)}</p><h2>{t('{p} people across {g} groups', { p: data.people, g: data.groups.length })}</h2><p>{t('Totals from each person’s best move and skills to build. No names are shown.')}</p></div>
      <ul className="region-legend">{data.groups.map((g) => <li key={g.id}><i style={{ background: colour(g.id) }} aria-hidden="true" />{t(g.name)} <small>{t('{n} people', { n: g.people })}</small></li>)}</ul>
    </header>

    <div className={`region-dashboard${data.routes.length ? '' : ' single'}`}>
    <section className="panel region-sdg" aria-labelledby="region-sdg-head">
      <div className="region-panel-head"><h2 id="region-sdg-head">{t('Current training reach')}</h2><span>{t('Reviewed links')}</span></div>
      <p className="note">{t('Each person counts once for a target linked to their best move or skills.')}</p>
      <ul className="region-targets">
        {data.targets.map((row) => <li key={row.target}>
          <div className="region-target-head"><SdgBadge target={row.target} short /><strong>{t(targetTitle(row.target))}</strong></div>
          <div className="region-target-reach"><strong>{t('{n} of {m} people', { n: row.people, m: data.people })}</strong><small>{split(row.byTeam)}</small></div>
          <div className="region-bar" role="img" aria-label={split(row.byTeam)}>
            {data.groups.map((g) => row.byTeam[g.id] ? <span key={g.id} style={{ width: `${(row.byTeam[g.id] / data.people) * 100}%`, background: colour(g.id) }} /> : null)}
          </div>
        </li>)}
        {data.targets.length === 0 && <li><p>{t('No best move in these groups reaches a reviewed SDG target yet.')}</p></li>}
        <li className="sdg-baseline-row">
          <div className="region-target-head"><SdgBadge target="4.4" short /><strong>{t('Skills for work')}</strong></div>
          <div className="region-target-reach"><strong>{t('{n} of {m} people', { n: data.baseline, m: data.people })}</strong><small>{t('Baseline: everyone with skills to build')}</small></div>
        </li>
      </ul>
      <PossibleLinks skills={data.paths.flatMap((p) => p.skills)} exclude={data.targets.map((x) => x.target)} />
    </section>

    {data.routes.length > 0 && <section className="panel region-routes" aria-labelledby="region-routes-head">
      <div className="region-panel-head"><h2 id="region-routes-head">{t('Alternative training routes')}</h2><span>{t('Options to explore')}</span></div>
      <p className="note">{t('Second or third moves that could connect more people to SDG targets.')}</p>
      <ul className="region-route-list">{data.routes.map((r) => <li key={r.roleId}>
        <div className="region-route-top"><h3>{roleName(r.roleId)}</h3><strong>{t('{n} people', { n: r.people })}</strong></div>
        <p>{split(r.byTeam)}</p>
        <div className="region-route-adds"><span>{t('Linked targets')}</span><div>{r.targets.map((x) => <SdgBadge key={x} target={x} short />)}</div></div>
      </li>)}</ul>
    </section>}
    </div>

    <p className="note region-footnote">{t('Group managers see their own teams; this view shows totals only. No state employment statistics are used.')}</p>
    <SdgMethodNote />
  </div>;
}
