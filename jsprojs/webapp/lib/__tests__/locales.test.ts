import { describe, expect, it } from 'vitest';
import { BIASES } from '@/lib/biases/data';
import { LOCALE_CARDS, localizeBias } from '@/lib/biases/localized';
import { UI } from '@/lib/i18n/ui';
import { LOCALES, PUBLIC_LOCALES, pickerLocales, resolveLocale } from '@/lib/i18n/locales';

const byEnglishName = new Map(BIASES.filter((b) => !b.reviewOf).map((b) => [b.name, b.slug]));

describe.each(Object.entries(LOCALE_CARDS))('%s cards', (locale, cards) => {
  it('translate every card, in schedule order', () => {
    expect(Object.keys(cards!)).toEqual(BIASES.map((b) => b.slug));
  });

  it.each(BIASES)('$slug: options map to the translated names of the English options', (bias) => {
    const card = cards![bias.slug];
    expect(card.options).toHaveLength(bias.options.length);
    bias.options.forEach((englishOption, i) => {
      const slug = byEnglishName.get(englishOption);
      if (slug) expect(card.options[i]).toBe(cards![slug].name);
    });
    expect(card.options.filter((o) => o === card.name)).toHaveLength(1);
  });

  it('uses the same text for a distractor without its own card everywhere', () => {
    const seen = new Map<string, string>();
    for (const bias of BIASES) {
      bias.options.forEach((englishOption, i) => {
        if (byEnglishName.has(englishOption)) return;
        const text = cards![bias.slug].options[i];
        expect(seen.get(englishOption) ?? text).toBe(text);
        seen.set(englishOption, text);
      });
    }
  });

  it.each(BIASES.filter((b) => b.reviewOf))('$slug reuses the original card name, definition and counter-move', (review) => {
    const original = cards![review.reviewOf!];
    const card = cards![review.slug];
    expect(card.name).toBe(original.name);
    expect(card.definition).toBe(original.definition);
    expect(card.counterMove).toBe(original.counterMove);
    expect(card.scenario).not.toBe(original.scenario);
  });

  it.each(BIASES)('$slug: scenario does not name the bias, and text has no em dashes', (bias) => {
    const card = cards![bias.slug];
    expect(card.scenario.toLowerCase()).not.toContain(card.name.toLowerCase());
    for (const field of [card.name, card.definition, card.scenario, card.explanation, card.counterMove]) {
      expect(field.trim().length).toBeGreaterThan(1);
      expect(field).not.toMatch(/—|——/);
    }
  });

  it('localizes a card with English fallback for missing locales', () => {
    expect(localizeBias(BIASES[0], locale as never).name).toBe(cards![BIASES[0].slug].name);
    expect(localizeBias(BIASES[0], 'en').name).toBe(BIASES[0].name);
  });
});

describe('UI strings', () => {
  it.each(LOCALES)('%s has every key filled in', (locale) => {
    for (const [key, value] of Object.entries(UI.en)) {
      expect(UI[locale][key as keyof typeof UI.en]?.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      if (value.includes('{')) {
        const vars = value.match(/\{\w+\}/g) ?? [];
        vars.forEach((v) => expect(UI[locale][key as keyof typeof UI.en]).toContain(v));
      }
    }
  });

  it.each(LOCALES)('%s embed button fits the 32 character limit', (locale) => {
    expect(UI[locale].embedButton.length).toBeLessThanOrEqual(32);
  });
});

describe('locale resolution', () => {
  it('honours ?lang= for any supported locale, including unreleased ones', () => {
    expect(resolveLocale('zh', 'en')).toBe('zh');
    expect(resolveLocale('de', null)).toBe('de');
  });

  it('only auto-selects public locales from the browser', () => {
    expect(resolveLocale(null, 'es-MX,es;q=0.9')).toBe(PUBLIC_LOCALES.includes('es') ? 'es' : 'en');
    expect(resolveLocale('xx', 'fr')).toBe('en');
  });

  it('shows an unreleased locale in the picker only while it is in use', () => {
    expect(pickerLocales('en')).toEqual([...PUBLIC_LOCALES]);
    expect(pickerLocales('zh')).toContain('zh');
  });
});
