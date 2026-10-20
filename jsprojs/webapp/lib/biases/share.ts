import { Locale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/ui';
import { SITE_URL } from '@/lib/miniapp';

/** Soft-launch home for the daily card and the Farcaster Mini App. */
export const BIAS_URL = `${SITE_URL}/farcaster`;

const langParam = (locale: Locale) => (locale === 'en' ? '' : `&lang=${locale}`);

/** Link to one day's card (and language), so a shared cast opens the bias it shows. */
export function biasUrlForDay(day: number, locale: Locale = 'en'): string {
  return `${BIAS_URL}?day=${day}${langParam(locale)}`;
}

export function ogImageUrl(day: number, locale: Locale = 'en'): string {
  return `${SITE_URL}/api/og/today?day=${day}${langParam(locale)}`;
}

/** Shares invite people to play; they never reveal the answer. */
export function shareText(dayNumber: number, locale: Locale = 'en'): string {
  return t(locale, 'shareText', { n: dayNumber + 1 });
}

/** `fc:miniapp` embed: a cast containing the link shows this image and a launch button. */
export function miniAppEmbed(day: number, locale: Locale = 'en') {
  return {
    version: '1',
    imageUrl: ogImageUrl(day, locale),
    button: {
      title: t(locale, 'embedButton'),
      action: {
        type: 'launch_miniapp',
        name: 'Socratic Bot',
        url: biasUrlForDay(day, locale),
        splashImageUrl: `${SITE_URL}/splash-200.png`,
        splashBackgroundColor: '#FDFBF9',
      },
    },
  };
}
