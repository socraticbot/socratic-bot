import { Bias, BIASES } from './data';
import { Locale } from '@/lib/i18n/locales';
import type { LocaleCards } from './locales/types';
import { de } from './locales/de';
import { es } from './locales/es';
import { ru } from './locales/ru';
import { zh } from './locales/zh';

/** Distractor options that name a bias without a card of its own. */
export const EXTRA_OPTION_NAMES = ['Optimism Bias'] as const;

export const LOCALE_CARDS: Partial<Record<Locale, LocaleCards>> = { zh, de, es, ru };

/** A card with its text in `locale`, falling back to English for anything untranslated. */
export function localizeBias(bias: Bias, locale: Locale): Bias {
  const text = LOCALE_CARDS[locale]?.[bias.slug];
  return text ? { ...bias, ...text } : bias;
}

/** The localized name of a bias, given its English name, for `locale`. */
export function localizedName(englishName: string, locale: Locale): string {
  const card = BIASES.find((b) => b.name === englishName && !b.reviewOf);
  return card ? localizeBias(card, locale).name : englishName;
}
