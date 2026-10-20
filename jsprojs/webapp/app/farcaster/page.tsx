import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { dayNumber, getBiasForDay, resolveDay } from '@/lib/biases/daily';
import { biasUrlForDay, miniAppEmbed, ogImageUrl, shareText } from '@/lib/biases/share';
import { LOCALE_TAGS, Locale, resolveLocale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/ui';
import FarcasterApp from './FarcasterApp';

// The bias changes at UTC midnight, so render per request.
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ day?: string | string[]; lang?: string | string[] }>;
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function resolveRequest(searchParams: PageProps['searchParams']): Promise<{ day: number; locale: Locale }> {
  const params = await searchParams;
  const locale = resolveLocale(first(params.lang), (await headers()).get('accept-language'));
  return { day: resolveDay(first(params.day), dayNumber(new Date())), locale };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { day, locale } = await resolveRequest(searchParams);
  return {
    title: `${t(locale, 'tabCard')} | Socratic Bot`,
    description: shareText(day, locale),
    // Soft launch: reachable by link only until it's promoted on the main site.
    robots: { index: false, follow: false },
    openGraph: {
      title: `${t(locale, 'tabCard')}: ${t(locale, 'heading')}`,
      description: shareText(day, locale),
      url: biasUrlForDay(day, locale),
      images: [{ url: ogImageUrl(day, locale), width: 1200, height: 800 }],
    },
    other: {
      'fc:miniapp': JSON.stringify(miniAppEmbed(day, locale)),
    },
  };
}

export default async function FarcasterPage({ searchParams }: PageProps) {
  const { day, locale } = await resolveRequest(searchParams);
  return (
    <div lang={LOCALE_TAGS[locale]} className="min-h-screen p-4 sm:p-6 pt-8 sm:pt-12 bg-[#FDFBF9]">
      <FarcasterApp
        bias={getBiasForDay(day)}
        locale={locale}
        dayNumber={day}
        isToday={day === dayNumber(new Date())}
      />
    </div>
  );
}
