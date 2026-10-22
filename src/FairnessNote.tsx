// Fairness evidence shown in "How ranking works": the scoring never sees identity
// (src/fairness.test.ts), identity phrases are removed before text reaches the model
// (server/identity.mjs), and the RunPod audit (scripts/fairness_audit.mjs) measures how
// much identity words would move the skill suggestions.
import auditFile from '../data/derived/fairness-audit.json';
import { useT, useTx } from './i18n';

type Audit = {
  status: string; date?: string; model?: string; descriptions?: number; cuesTested?: number;
  overall?: { keptMean: number; keptMin: number; sameFirst: number };
  pairs?: { attribute: string; pairs: { a: string; b: string; sharedMean: number }[] }[];
  sources: { name: string; url: string }[];
};
const audit = auditFile as Audit;

export function FairnessNote() {
  const t = useT();
  const tx = useTx();
  const gender = audit.pairs?.find((p) => p.attribute === 'gender')?.pairs[0];
  return <>
    <p>{t('Before your words are searched, common name, age and identity phrases (for example “As a woman,” or “I am 55 years old”) are removed in your browser. They do not describe skills.')}</p>
    {audit.status === 'measured' && audit.overall
      ? <p>{t('Measured on RunPod ({date}, {model}): adding gender, age, background, life-stage words or a name to {n} work descriptions kept on average {k} of the top 10 suggested skills (lowest {min}).', { date: audit.date!, model: audit.model!, n: audit.descriptions!, k: audit.overall.keptMean, min: audit.overall.keptMin })}{gender ? ` ${t('Women and men writing the same description shared {s} of 10 suggestions.', { s: gender.sharedMean })}` : ''}</p>
      : <p>{t('An audit of how identity words move the skill suggestions has not been run yet.')}</p>}
    <p className="note">{tx('Why we check: {a}; {b}.', { a: <a href={audit.sources[0].url} target="_blank" rel="noreferrer">{t('a 2024 study found text-embedding models rank CVs differently by name')}</a>, b: <a href={audit.sources[1].url} target="_blank" rel="noreferrer">{t('fairness is the first principle of Malaysia’s AI governance guidelines (MOSTI, 2024)')}</a> })}</p>
  </>;
}
