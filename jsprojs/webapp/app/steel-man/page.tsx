import type { Metadata } from 'next';
import { arenaEmbed, arenaOgImageUrl, arenaShareText, arenaUrlForWeek } from '@/lib/steelman/share';
import { getTopicForWeek, resolveWeek, weekNumber } from '@/lib/steelman/weekly';
import SteelManArena from './SteelManArena';

// The topic changes at UTC midnight on Mondays, so render per request.
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ week?: string | string[] }>;
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function resolveRequest(searchParams: PageProps['searchParams']): Promise<number> {
  return resolveWeek(first((await searchParams).week), weekNumber(new Date()));
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const week = await resolveRequest(searchParams);
  return {
    title: 'Steel-Man Arena | Socratic Bot',
    description: arenaShareText(week),
    // Soft launch: reachable by link only until it's promoted on the main site.
    robots: { index: false, follow: false },
    openGraph: {
      title: `Steel-Man Arena: ${getTopicForWeek(week).claim}`,
      description: arenaShareText(week),
      url: arenaUrlForWeek(week),
      images: [{ url: arenaOgImageUrl(week), width: 1200, height: 800 }],
    },
    other: {
      'fc:miniapp': JSON.stringify(arenaEmbed(week)),
    },
  };
}

export default async function SteelManPage({ searchParams }: PageProps) {
  const week = await resolveRequest(searchParams);
  return (
    <div className="min-h-screen p-4 sm:p-6 pt-8 sm:pt-12 bg-[#FDFBF9]">
      <SteelManArena topic={getTopicForWeek(week)} week={week} isThisWeek={week === weekNumber(new Date())} />
    </div>
  );
}
