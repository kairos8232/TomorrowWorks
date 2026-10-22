import { describe, expect, it } from 'vitest';
import { stripIdentity } from './identity.mjs';
import { CUES, DESCRIPTIONS } from '../scripts/fairness_audit.mjs';

describe('identity cues are removed before text reaches the model', () => {
  it('removes names, ages and identity "As a …," clauses', () => {
    expect(stripIdentity('My name is Tan Mei Ling. I reconcile bank statements').text).toBe('I reconcile bank statements');
    expect(stripIdentity('I am 55 years old. I write code').text).toBe('I write code');
    expect(stripIdentity('As a Malay Malaysian, I prepare reports').text).toBe('I prepare reports');
    expect(stripIdentity('As a mother returning to work after a career break, I issue invoices').text).toBe('I issue invoices');
    expect(stripIdentity('As a woman, I build dashboards').removed).toBe(1);
  });
  it('keeps work clauses and ordinary text', () => {
    expect(stripIdentity('As a team lead, I manage budgets').text).toBe('As a team lead, I manage budgets');
    expect(stripIdentity('I prepare month-end reports').removed).toBe(0);
    expect(stripIdentity('I analysed data for 3 years.').text).toBe('I analysed data for 3 years.');
  });
  it('every audit cue is removed, giving back the original description', () => {
    for (const group of Object.values(CUES)) for (const prefix of Object.values(group))
      for (const d of DESCRIPTIONS) expect(stripIdentity(prefix + d).text).toBe(d);
  });
});
