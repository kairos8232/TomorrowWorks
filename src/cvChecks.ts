// "Things to avoid in your CV": plain rule checks on pasted CV text, each tied to a
// published source. No score and no AI. A rule only reports what it can see in text;
// layout rules (columns, tables, headers, image PDFs) cannot be seen in pasted text, so
// they are a checklist the person ticks. Sources were retrieved 24 Oct 2026.
// Tested in src/cvChecks.test.ts.

export type CvSource = { id: string; name: string; url: string; date: string; note?: string };

export const CV_SOURCES: Record<string, CvSource> = {
  jsmy: { id: 'jsmy', name: 'Jobstreet Malaysia: ATS format resume', url: 'https://my.jobstreet.com/career-advice/article/ats-format-resume-template-tips', date: 'updated 30 Jul 2025' },
  jscan: { id: 'jscan', name: 'Jobscan: 5 ATS resume formatting mistakes', url: 'https://www.jobscan.co/blog/ats-formatting-mistakes/', date: '10 Apr 2026', note: 'Jobscan sells a resume scanner; advice, not measured tests.' },
  scu: { id: 'scu', name: 'Santa Clara University Career Center: common ATS formatting mistakes', url: 'https://www.scu.edu/careercenter/toolkit/job-scan-common-ats-resume-formatting-mistakes/', date: 'no date shown' },
  jssg: { id: 'jssg', name: 'Jobstreet Singapore: 7 common resume mistakes fresh grads make', url: 'https://sg.jobstreet.com/career-advice/article/7-common-resume-mistakes-fresh-grads-make', date: 'updated 17 Oct 2025', note: 'Singapore site.' },
  fair: { id: 'fair', name: 'Wilson & Caliskan 2024 (arXiv 2407.20371): AI resume screening and names', url: 'https://arxiv.org/abs/2407.20371', date: '2024' },
};

export type Finding = { id: string; message: string; evidence: string[]; source: string };

const STANDARD_HEADINGS = /^(work |professional |relevant |internship |industrial )?(experience|experiences|history|training|internships?)$|^(education|skills|technical skills|key skills|core skills|summary|profile|professional summary|objective|career objective|projects|certifications?|certificates|languages|awards|achievements|activities|volunteer(ing)?|volunteer experience|references|contact|personal details|co-curricular activities|extracurricular activities|publications)$/i;
const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*';
// Acronyms nearly every reader knows; everything else should be spelled out once.
const KNOWN_ACRONYMS = new Set(['CV', 'PDF', 'UK', 'US', 'USA', 'AI', 'IT', 'HR', 'CGPA', 'GPA', 'SPM', 'STPM', 'UEC', 'KL', 'MS', 'RM', 'ID', 'PR', 'BSC', 'MSC', 'BA', 'MA', 'PHD', 'MBA', 'SQL', 'HTML', 'CSS', 'API']);

const first = (xs: string[], n = 4) => xs.slice(0, n);

/** Run every text rule on the pasted CV. Returns only the problems it found. */
export function checkCvText(text: string): Finding[] {
  const lines = text.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
  const out: Finding[] = [];

  // 1. Dates a parser may not read: "Jan '21".
  const apostrophe = lines.flatMap((l) => l.match(new RegExp(`${MONTH}\\s*['’]\\d{2}\\b|['’]\\d{2}\\s*[-–]\\s*['’]?\\d{2}\\b`, 'gi')) ?? []);
  if (apostrophe.length) out.push({ id: 'date-apostrophe', message: 'Write dates with the full year, for example “Jan 2021”.', evidence: first(apostrophe), source: 'jscan' });

  // 2. Several date styles in one CV.
  const styles = new Set<string>();
  for (const l of lines) {
    if (new RegExp(`${MONTH}\\.?\\s+(19|20)\\d{2}`, 'i').test(l)) styles.add('month name and year (Jan 2021)');
    if (/\b\d{1,2}\/(19|20)\d{2}\b/.test(l)) styles.add('numbers (01/2021)');
    if (/\b\d{1,2}\/\d{1,2}\/(19|20)?\d{2}\b/.test(l)) styles.add('day/month/year (01/02/2021)');
  }
  if (styles.size > 1) out.push({ id: 'date-mixed', message: 'Use one date style all through the CV.', evidence: [...styles], source: 'scu' });

  // 3. Headings: all-capital or colon-ended short lines that are not a standard heading.
  //    The first two lines are the title and the name, so they are skipped.
  const headingLike = lines.slice(2).filter((l) => {
    const bare = l.replace(/:$/, '').trim();
    const words = bare.split(/\s+/);
    const shape = (l.endsWith(':') || (bare === bare.toUpperCase() && /\p{L}/u.test(bare))) && words.length <= 4 && !/\d|@|,/.test(bare);
    return shape && !STANDARD_HEADINGS.test(bare);
  });
  if (headingLike.length) out.push({ id: 'headings', message: 'Use plain headings such as Work Experience, Education and Skills.', evidence: first(headingLike), source: 'jsmy' });

  // 4. Acronyms never spelled out.
  const acronyms = new Set<string>();
  for (const m of text.matchAll(/\b[A-Z]{2,6}\b/g)) {
    const a = m[0];
    if (KNOWN_ACRONYMS.has(a)) continue;
    // Not an acronym if the whole line is in capitals (a heading or a name).
    const lineOf = lines.find((l) => l.includes(a)) ?? '';
    if (lineOf === lineOf.toUpperCase()) continue;
    const spelled = new RegExp(`\\(\\s*${a}\\s*\\)|\\b${a}\\s*\\(`).test(text);
    if (!spelled) acronyms.add(a);
  }
  if (acronyms.size) out.push({ id: 'acronyms', message: 'Spell out an acronym the first time you use it, for example “Search Engine Optimisation (SEO)”.', evidence: first([...acronyms], 6), source: 'jsmy' });

  // 5. Icons and symbols that can be read as garbled text.
  const icons = [...text.matchAll(/[☀-➿\u{1F300}-\u{1FAFF}-]/gu)].map((m) => m[0]);
  if (icons.length) out.push({ id: 'icons', message: 'Replace icons and symbols with words, for example “Phone:” instead of a phone symbol.', evidence: first([...new Set(icons)], 6), source: 'jscan' });

  // 6. Email address a university gave you.
  const edu = (text.match(/[\w.+-]+@[\w.-]+/g) ?? []).filter((e) => /\.edu(\.[a-z]{2})?$|siswa|student/i.test(e.split('@')[1]));
  if (edu.length) out.push({ id: 'email', message: 'Use a personal, professional email address, not a university one.', evidence: [edu[0]], source: 'jssg' });

  // 7. Expected salary stated.
  const salary = lines.filter((l) => /expected salary|salary expectation|expected pay/i.test(l));
  if (salary.length) out.push({ id: 'salary', message: 'Leave out your expected salary unless the employer asks for it.', evidence: first(salary, 2), source: 'jssg' });

  // 8. Details that say nothing about skills and invite bias.
  const identity = lines.filter((l) => /^(age|gender|sex|marital status|religion|race|date of birth|dob|nationality)\s*[:\-]/i.test(l) || /\b\d{1,2}\s*years? old\b/i.test(l));
  if (identity.length) out.push({ id: 'identity', message: 'Age, gender, marital status, religion and race say nothing about your skills. Consider leaving them out. This app removes them before matching.', evidence: first(identity, 3), source: 'fair' });

  return out;
}

/** Things only the person can see in the file, each with its source. */
export const CV_MANUAL_CHECKS: { id: string; text: string; source: string }[] = [
  { id: 'columns', text: 'One column, no tables, graphics or images.', source: 'jsmy' },
  { id: 'header', text: 'Name, phone, email and skills are in the main text, not in a header, footer or text box.', source: 'jsmy' },
  { id: 'file', text: 'Saved as .docx or a PDF you can select text in (not a picture of a page).', source: 'jsmy' },
  { id: 'font', text: 'A plain font such as Arial, Calibri or Georgia.', source: 'jsmy' },
  { id: 'examples', text: 'Each skill is shown by something you did, not only listed as a keyword.', source: 'jsmy' },
  { id: 'length', text: 'One page, with only what is relevant (no primary or secondary school activities).', source: 'jssg' },
  { id: 'proof', text: 'Proofread for spelling and grammar.', source: 'jssg' },
  { id: 'photo', text: 'No photo, or a professional one. Not a casual or holiday picture.', source: 'jssg' },
];
