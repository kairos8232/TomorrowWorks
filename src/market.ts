import dosmQ2 from '../data/sources/dosm-jmi-2026-q2.json';
import iloExposure from '../data/sources/ilo-genai-exposure-2025.json';
import rolesFile from '../data/roles.json';

export const industries = [
  { id: 'all', label: 'All covered industries' },
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'education', label: 'Education' },
  { id: 'finance', label: 'Finance' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'retail', label: 'Retail' },
  { id: 'technology', label: 'Technology' },
  { id: 'other', label: 'Other industries' },
] as const;

export type IndustryId = (typeof industries)[number]['id'];
export type CoveredIndustry = Exclude<IndustryId, 'all'>;
export type SignalKind = 'change' | 'demand' | 'skill' | 'outlook';

export type MarketSignal = {
  id: string;
  kind: SignalKind;
  industries: [CoveredIndustry, ...CoveredIndustry[]];
  title: string;
  summary: string;
  searchTerms: string[];
  source: {
    name: string;
    url: string;
    publishedAt: string;
    retrievedAt: string;
    geography: string;
    coverage: string;
    measure?: string;
  };
  assumptions?: string[];
};

// Signals built from imported, verified sources (see SIGNALS_AND_MATCHING.md).
// DOSM: occupation major groups only. DOSM's Q2 2026 industry table puts 49% of
// ads under "Unclassified" (Q1: 8%), so industry-level changes are not shown.
const coveredIndustries = industries.filter((i) => i.id !== 'all').map((i) => i.id) as [CoveredIndustry, ...CoveredIndustry[]];
const pctChange = (now: number, before: number) => `${now >= before ? '+' : ''}${(((now - before) / before) * 100).toFixed(1)}%`;

function dosmDemandSignals(): MarketSignal[] {
  const src = dosmQ2.source;
  return dosmQ2.occupationMajorGroups
    .filter((g) => g.iscoMajorGroup && g.quarterly['2026-Q2'] != null && g.quarterly['2026-Q1'] != null)
    .map((g) => {
      const now = g.quarterly['2026-Q2'] as number;
      const before = g.quarterly['2026-Q1'] as number;
      return {
        id: `dosm-${g.iscoMajorGroup}`,
        kind: 'demand' as const,
        industries: coveredIndustries,
        title: `${g.label}: ${now.toLocaleString()} online job ads`,
        summary: `${before.toLocaleString()} in Q1 2026 → ${now.toLocaleString()} in Q2 2026 (${pctChange(now, before)} quarter on quarter). Counts all industries together.`,
        searchTerms: [g.label, 'job ads', 'vacancies', 'demand'],
        source: { name: src.name, url: src.url, publishedAt: src.publishedAt, retrievedAt: src.retrievedAt, geography: src.geography, coverage: src.coverage, measure: src.measure },
      };
    });
}

function iloOutlookSignals(): MarketSignal[] {
  const occ = new Map(iloExposure.occupations.map((o) => [o.isco, o]));
  return rolesFile.roles.flatMap((r) => {
    const o = occ.get(r.isco);
    if (!o) return [];
    return [{
      id: `ilo-${r.id}`,
      kind: 'outlook' as const,
      industries: coveredIndustries,
      title: `${r.title[0].toUpperCase()}${r.title.slice(1)}: GenAI exposure ${o.mean.toFixed(2)} (${o.gradient})`,
      summary: `Average share of this occupation's tasks (ISCO ${r.isco}) that generative AI could change, on a 0–1 scale. A measure of possible task change, not a forecast of job loss.`,
      searchTerms: [r.title, 'AI', 'exposure', 'automation'],
      source: { name: iloExposure.source.name, url: iloExposure.source.url, publishedAt: iloExposure.source.publishedAt, retrievedAt: iloExposure.source.retrievedAt, geography: iloExposure.source.geography, coverage: iloExposure.source.coverage, measure: iloExposure.source.measure },
      assumptions: ['Exposure is estimated per task from the ILO global index (2025); local job design can differ.'],
    }];
  });
}

export const marketSignals: MarketSignal[] = [...dosmDemandSignals(), ...iloOutlookSignals()];

export function filterMarketSignals(signals: MarketSignal[], kind: SignalKind | 'all', industry: IndustryId, query: string) {
  const needle = query.trim().toLocaleLowerCase();
  return signals.filter((signal) => {
    if (kind !== 'all' && signal.kind !== kind) return false;
    if (industry !== 'all' && !signal.industries.includes(industry)) return false;
    if (!needle) return true;
    const industryLabels = industries.filter((item) => signal.industries.some((id) => id === item.id)).map((item) => item.label);
    return [signal.title, signal.summary, signal.source.name, ...signal.searchTerms, ...industryLabels].some((text) => text.toLocaleLowerCase().includes(needle));
  });
}
