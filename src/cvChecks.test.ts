import { describe, expect, it } from 'vitest';
import { checkCvText, CV_MANUAL_CHECKS, CV_SOURCES } from './cvChecks';
import { sampleCv, sampleCvWithHabits } from './sampleCv';

const ids = (t: string) => checkCvText(t).map((f) => f.id);

describe('checkCvText', () => {
  it('finds nothing wrong in a clean CV', () => {
    expect(ids('Jane\nExperience\nWorked at a shop (Jan 2021 to Mar 2022)\nSkills\nExcel')).toEqual([]);
  });
  it('flags apostrophe years', () => { expect(ids("Experience\nClerk, Jan '21 to Mar '22")).toContain('date-apostrophe'); });
  it('flags mixed date styles only when two styles appear', () => {
    expect(ids('A\nB\nClerk Jan 2021 to Mar 2022\nAssistant 03/2019 to 12/2020')).toContain('date-mixed');
    expect(ids('A\nB\nClerk Jan 2021 to Mar 2022\nAssistant Feb 2019 to Dec 2020')).not.toContain('date-mixed');
  });
  it('flags creative headings but not standard ones, and skips the title and name lines', () => {
    const f = checkCvText('MY NAME\nCV\nWHERE I HAVE WORKED:\nEDUCATION\nSkills:').find((x) => x.id === 'headings');
    expect(f?.evidence).toEqual(['WHERE I HAVE WORKED:']);
    expect(ids('JANE TAN\nCV\nEDUCATION\nSkills:')).not.toContain('headings');
  });
  it('flags an acronym unless it is spelled out or common', () => {
    expect(checkCvText('A\nB\nImproved SEO for a shop').find((x) => x.id === 'acronyms')?.evidence).toEqual(['SEO']);
    expect(ids('A\nB\nSearch Engine Optimisation (SEO) for a shop')).not.toContain('acronyms');
    expect(ids('A\nB\nSent the CV as a PDF')).not.toContain('acronyms');
  });
  it('flags icons, university email, salary and identity lines', () => {
    expect(ids('A\nB\n☎ 012')).toContain('icons');
    expect(ids('A\nB\nlee@student.mmu.edu.my')).toContain('email');
    expect(ids('A\nB\nExpected salary: RM 3,000')).toContain('salary');
    expect(ids('A\nB\nMarital status: single')).toContain('identity');
  });
  it('every finding and manual check names a known source', () => {
    for (const c of CV_MANUAL_CHECKS) expect(CV_SOURCES[c.source]).toBeDefined();
    for (const f of checkCvText("A\nB\nJan '21\n☎ x@student.edu.my\nExpected salary: 1")) expect(CV_SOURCES[f.source]).toBeDefined();
  });
  it('the fictional sample CV has no text problems', () => { expect(ids(sampleCv)).toEqual([]); });
});

it('the demo CV with habits shows exactly the three planted problems', () => {
  expect(checkCvText(sampleCvWithHabits).map((f) => f.id).sort()).toEqual(['acronyms', 'date-apostrophe', 'salary']);
});
