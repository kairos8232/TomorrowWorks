// CV intake: turn a CV into short lines that can be matched to ESCO skills.
// The file is read in the browser; nothing is stored. Contact details (emails,
// web links, phone numbers) are removed here, before anything leaves the device.
// Only the remaining lines are sent once to /api/cv-skills (RunPod Job B).
// Tested in src/cv.test.ts.

export const CV_MAX_LINES = 40;
export const CV_MAX_LINE = 300;

/** Lines that look like contact details: email, web link, or a phone number. */
const CONTACT = /@|https?:\/\/|www\.|linkedin|\+?\d[\d\s().-]{7,}\d/i;
const BULLET = /^[\s•·▪●◦*\-–—>]+/;

/** True if the line may describe work: at least three words with letters, not all in capitals. */
const describesWork = (line: string) => line.split(/\s+/).filter((w) => /\p{L}{2,}/u.test(w)).length >= 3
  && /\p{Ll}/u.test(line);   // all-capital lines are headings or names

/**
 * Split CV text into lines worth matching: one per bullet or line, long paragraphs
 * split into sentences, bullets stripped, contact details and short headings
 * (names, "Education", dates) dropped, duplicates removed, at most CV_MAX_LINES.
 * Returns the lines and how many were dropped as contact details.
 */
export function cvLines(text: string): { lines: string[]; contactRemoved: number } {
  const seen = new Set<string>();
  const lines: string[] = [];
  let contactRemoved = 0;
  const parts = text.replace(/\r/g, '').split(/\n|[•▪●◦]|;\s/);
  for (const raw of parts) {
    const pieces = raw.length > 200 ? raw.split(/(?<=[.!?])\s+/) : [raw];
    for (const piece of pieces) {
      const line = piece.replace(BULLET, '').replace(/\s+/g, ' ').trim().slice(0, CV_MAX_LINE);
      if (!line) continue;
      if (CONTACT.test(line)) { contactRemoved++; continue; }
      if (!describesWork(line)) continue;
      const key = line.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(line);
    }
  }
  return { lines: lines.slice(0, CV_MAX_LINES), contactRemoved };
}

/** Read a CV file in the browser: PDF (pdf.js, loaded only when needed) or plain text. */
export async function readCvFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (file.size > 5_000_000) throw new Error('This file is over 5 MB. Paste the text instead.');
  if (name.endsWith('.txt') || file.type === 'text/plain') return file.text();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    const pdfjs = await import('pdfjs-dist');
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    let text = '';
    for (let p = 1; p <= Math.min(pdf.numPages, 10); p++) {
      const content = await (await pdf.getPage(p)).getTextContent();
      for (const item of content.items) if ('str' in item) text += item.str + (item.hasEOL ? '\n' : ' ');
      text += '\n';
    }
    if (!text.trim()) throw new Error('No text found in this PDF (it may be a scanned image). Paste the text instead.');
    return text;
  }
  throw new Error('Use a PDF or .txt file, or paste the text.');
}
