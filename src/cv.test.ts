import { describe, expect, it } from 'vitest';
import { cvLines, CV_MAX_LINES } from './cv';
import { sampleCv } from './sampleCv';

describe('CV lines', () => {
  it('removes contact details before anything is sent', () => {
    const { lines, contactRemoved } = cvLines('Reach me at aina@example.com\n+60 12-000 0000\nwww.example.com/aina\nI reconcile bank statements every month');
    expect(lines).toEqual(['I reconcile bank statements every month']);
    expect(contactRemoved).toBe(3);
  });
  it('drops names, headings and dates; strips bullets; removes duplicates', () => {
    const { lines } = cvLines('AINA BINTI RAHMAN\nEXPERIENCE\n2019 to 2021\n• Process supplier invoices\n- process supplier invoices\nExcel');
    expect(lines).toEqual(['Process supplier invoices']);
  });
  it('splits long paragraphs into sentences and caps the number of lines', () => {
    const para = 'I prepare month-end reports for the manager. ' + 'I reconcile accounts with care every week. '.repeat(5);
    expect(cvLines(para).lines).toEqual(['I prepare month-end reports for the manager.', 'I reconcile accounts with care every week.']);
    const many = Array.from({ length: 60 }, (_, i) => `Task number ${i} done well`).join('\n');
    expect(cvLines(many).lines).toHaveLength(CV_MAX_LINES);
  });
  it('the fictional sample CV keeps its work lines and loses name and contact', () => {
    const { lines, contactRemoved } = cvLines(sampleCv);
    expect(contactRemoved).toBe(1);
    expect(lines).toContain('Reconcile bank statements every month and follow up on differences');
    expect(lines.join(' ')).not.toMatch(/AINA|example\.com|\+60/);
  });
});
