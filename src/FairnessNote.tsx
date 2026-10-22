// Fairness evidence shown in "How ranking works": the scoring never sees identity
// (src/fairness.test.ts), identity phrases are removed before text reaches the model
// (server/identity.mjs), and the RunPod audit (scripts/fairness_audit.mjs) measures how
// much identity words would move the skill suggestions.
import auditFile from '../data/derived/fairness-audit.json';
import { useT, useTx } from './i18n';

type Audit = {
  status: string; date?: string; model?: string; descriptions?: number; cuesTested?: number;
  overall?: { keptMean: number; keptMin: number; sameFirst: number };
  control?: { keptMean: number; keptMin: number; sameFirst: number };
  languageShift?: { ethnicityCues: number; controlCues: number; otherIdentityCues: number };
  sources: { name: string; url: string }[];
};
const audit = auditFile as Audit;

export function FairnessNote() {
  const t = useT();
  const tx = useTx();
  const m = audit.status === 'measured' && audit.overall && audit.control ? { o: audit.overall, c: audit.control, lang: audit.languageShift } : null;
  return <>
    <p>{t('Before your words are searched, common name, age and identity phrases (for example “As a woman,” or “I am 55 years old”) are removed in your browser. They do not describe skills.')}</p>
    {m
      ? <>
        <p>{t('Measured on RunPod ({date}, {model}): adding identity words (gender, age, background, life stage or a name) to {n} work descriptions kept on average {k} of the top 10 suggested skills. Adding neutral words of similar length (for example “As someone who likes teamwork,”) kept {c}, so part of any shift is just from adding words.', { date: audit.date!, model: audit.model!, n: audit.descriptions!, k: m.o.keptMean, c: m.c.keptMean })}</p>
        {m.lang && m.lang.ethnicityCues > m.lang.controlCues && <p>{t('Ethnicity words pulled language skills into the suggestions {e} times (neutral words: {c}). The filter removes the common phrasings of this, not every phrasing.', { e: m.lang.ethnicityCues, c: m.lang.controlCues })}</p>}
      </>
      : <p>{t('An audit of how identity words move the skill suggestions is being re-run with a neutral-words comparison.')}</p>}
    <p className="note">{tx('Why we check: {a}; {b}.', { a: <a href={audit.sources[0].url} target="_blank" rel="noreferrer">{t('a 2024 study found text-embedding models rank CVs differently by name')}</a>, b: <a href={audit.sources[1].url} target="_blank" rel="noreferrer">{t('fairness is the first principle of Malaysia’s AI governance guidelines (MOSTI, 2024)')}</a> })}</p>
  </>;
}
