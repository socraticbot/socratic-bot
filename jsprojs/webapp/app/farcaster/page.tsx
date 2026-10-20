import type { Metadata } from 'next';
import { dayNumber, getBiasForDay, resolveDay } from '@/lib/biases/daily';
import { biasUrlForDay, miniAppEmbed, shareText } from '@/lib/biases/share';
import { SITE_URL } from '@/lib/miniapp';
import BiasCard from './BiasCard';

// The bias changes at UTC midnight, so render per request.
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ day?: string | string[] }>;
}

async function requestedDay(searchParams: PageProps['searchParams']): Promise<number> {
  const { day } = await searchParams;
  return resolveDay(Array.isArray(day) ? day[0] : day, dayNumber(new Date()));
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const day = await requestedDay(searchParams);
  const imageUrl = `${SITE_URL}/api/og/today?day=${day}`;
  return {
    title: 'Bias of the day | Socratic Bot',
    description: shareText(day),
    // Soft launch: reachable by link only until it's promoted on the main site.
    robots: { index: false, follow: false },
    openGraph: {
      title: 'Bias of the day: can you spot it?',
      description: 'One cognitive bias a day. Spot it, then talk it through.',
      url: biasUrlForDay(day),
      images: [{ url: imageUrl, width: 1200, height: 800 }],
    },
    other: {
      'fc:miniapp': JSON.stringify(miniAppEmbed(day)),
    },
  };
}

export default async function FarcasterPage({ searchParams }: PageProps) {
  const day = await requestedDay(searchParams);
  return (
    <div className="min-h-screen p-4 sm:p-6 pt-8 sm:pt-12 bg-[#FDFBF9]">
      <BiasCard bias={getBiasForDay(day)} dayNumber={day} isToday={day === dayNumber(new Date())} />
    </div>
  );
}
