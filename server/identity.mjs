// Remove identity cues from a work description or CV line before it is embedded.
// Used in the browser (Describe your work, CV upload) so these words never reach the
// model, and by scripts/fairness_audit.mjs to measure the effect. Plain rules, no AI:
//   - sentences that state a name or an age ("My name is …", "I am 55 years old", "aged 30");
//   - a leading "As a/an …," clause when it names an identity (gender, age group, ethnicity,
//     religion, family role, life stage such as "fresh graduate", disability, origin); "As a team lead, …" is kept;
//   - identity words used as an adjective before a job noun are left alone (rare in practice).
// Tested in server/identity.test.mjs.

const IDENTITY = /\b(woman|women|man|men|female|male|girl|boy|lady|gentleman|mother|father|mum|mom|dad|wife|husband|single parent|parent|malay|chinese|indian|bumiputera|orang asli|iban|kadazan|dusun|melanau|bidayuh|muslim|christian|buddhist|hindu|sikh|disabled|disability|wheelchair|deaf|blind|oku|young|old|older|elderly|senior citizen|retiree|pensioner|teenager|youth|fresh graduate|school leaver|career break|rural|village|kampung|immigrant|foreigner|migrant|refugee|years? old|\d+\s*-?\s*year-?\s*old)\b/i;

/** Sentences that only state a name or an age. */
const NAME_OR_AGE = /^(my name is|i am called|i'm called|name:)\b|^(i am|i'm|aged?)\s*\d{1,2}\b|^i am \d{1,2} years? old/i;

/**
 * Return the text with identity cues removed, and how many were removed.
 * @param {string} text
 * @returns {{ text: string, removed: number }}
 */
export function stripIdentity(text) {
  let removed = 0;
  const sentences = text.split(/(?<=[.!?])\s+/);
  const kept = [];
  for (let s of sentences) {
    const trimmed = s.trim();
    if (NAME_OR_AGE.test(trimmed)) { removed++; continue; }
    // Leading "As a(n) / someone …," clause: drop it only if it names an identity.
    const lead = trimmed.match(/^as (?:an?|someone|somebody)\s+([^,]{1,80}),\s*/i);
    if (lead && IDENTITY.test(lead[1])) { s = trimmed.slice(lead[0].length); removed++; s = s.charAt(0).toUpperCase() + s.slice(1); }
    if (s.trim()) kept.push(s.trim());
  }
  return { text: kept.join(' '), removed };
}
