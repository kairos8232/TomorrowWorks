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

// Populate only after a source, its date, reuse terms, and the displayed claim are verified.
export const marketSignals: MarketSignal[] = [];

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
