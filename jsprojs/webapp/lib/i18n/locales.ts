export const LOCALES = ['en', 'zh', 'de', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Locales offered in the picker and chosen automatically from the browser.
 * Any locale not listed here works only through `?lang=` links.
 */
export const PUBLIC_LOCALES: readonly Locale[] = ['en', 'zh', 'de', 'es'];

/**
 * Public but not yet reviewed by a native speaker; labelled "Beta" in the
 * picker (review checklist: notes/roadmap-2026/14-language-review-guide.md).
 */
export const BETA_LOCALES: readonly Locale[] = ['zh', 'de', 'es'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  de: 'Deutsch',
  es: 'Español',
};

/** BCP 47 tags for <html lang> and the model prompt. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-Hans',
  de: 'de',
  es: 'es',
};

export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  zh: 'Simplified Chinese',
  de: 'German',
  es: 'Spanish',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * `?lang=` wins (any supported locale, including unreleased ones); otherwise
 * the first public locale in Accept-Language; otherwise English.
 */
export function resolveLocale(param: string | null | undefined, acceptLanguage?: string | null): Locale {
  if (isLocale(param)) return param;
  for (const part of (acceptLanguage ?? '').split(',')) {
    const base = part.trim().split(';')[0].split('-')[0].toLowerCase();
    if (isLocale(base) && PUBLIC_LOCALES.includes(base)) return base;
  }
  return 'en';
}

/** Locales to show in the picker: the public ones, plus the current one if it isn't public yet. */
export function pickerLocales(current: Locale): Locale[] {
  return PUBLIC_LOCALES.includes(current) ? [...PUBLIC_LOCALES] : [...PUBLIC_LOCALES, current];
}
