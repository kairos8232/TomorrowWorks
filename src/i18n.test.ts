import { describe, expect, it } from 'vitest';
import { translate, translationKeys } from './i18n';

describe('screen translations', () => {
  it('every key has Malay and Chinese text with the same {placeholders}', () => {
    const holes = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    for (const key of translationKeys) for (const lang of ['ms', 'zh'] as const) {
      const text = translate(lang)(key);
      expect(text, `${lang}: ${key}`).not.toBe('');
      expect(holes(text), `${lang}: ${key}`).toBe(holes(key));
    }
  });
  it('fills placeholders and falls back to English for unknown text', () => {
    expect(translate('zh')('See {name}’s moves', { name: 'Aina' })).toBe('查看 Aina 的职业选择');
    expect(translate('ms')('Text that has no translation')).toBe('Text that has no translation');
  });
});
