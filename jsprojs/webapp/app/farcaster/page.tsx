import type { Metadata } from 'next';
import { dayNumber, getBiasForDate } from '@/lib/biases/daily';
import { BIAS_URL, miniAppEmbed, shareText } from '@/lib/biases/share';
import { SITE_URL } from '@/lib/miniapp';
import BiasCard from './BiasCard';

// The bias changes at UTC midnight, so render per request.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const day = dayNumber(new Date());
  const imageUrl = `${SITE_URL}/api/og/today?day=${day}`;
  return {
    title: 'Bias of the day | Socratic Bot',
    description: shareText(day),
    // Soft launch: reachable by link only until it's promoted on the main site.
    robots: { index: false, follow: false },
    openGraph: {
      title: 'Bias of the day: can you spot it?',
      description: 'One cognitive bias a day. Spot it, then talk it through.',
      url: BIAS_URL,
      images: [{ url: imageUrl, width: 1200, height: 800 }],
    },
    other: {
      'fc:miniapp': JSON.stringify(miniAppEmbed(day)),
    },
  };
}

export default function FarcasterPage() {
  const now = new Date();
  return (
    <div className="min-h-screen p-4 sm:p-6 pt-8 sm:pt-12 bg-[#FDFBF9]">
      <BiasCard bias={getBiasForDate(now)} dayNumber={dayNumber(now)} />
    </div>
  );
}
