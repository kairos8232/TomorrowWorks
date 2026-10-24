/** Remove identity cues (name, age, "As a woman," …) from a work description. See identity.mjs. */
export function stripIdentity(text: string): { text: string; removed: number };
