import { SITE_URL } from '@/lib/miniapp';

/** Soft-launch home for the daily card and the Farcaster Mini App. */
export const BIAS_URL = `${SITE_URL}/farcaster`;

/** Link to one day's card, so a shared cast opens the bias it shows. */
export function biasUrlForDay(day: number): string {
  return `${BIAS_URL}?day=${day}`;
}

/** Shares invite people to play; they never reveal the answer. */
export function shareText(dayNumber: number): string {
  return `Bias of the day #${dayNumber + 1}: can you spot it? 🧠`;
}

/** `fc:miniapp` embed: a cast containing the link shows this image and a launch button. */
export function miniAppEmbed(day: number) {
  return {
    version: '1',
    imageUrl: `${SITE_URL}/api/og/today?day=${day}`,
    button: {
      title: "Spot today's bias",
      action: {
        type: 'launch_miniapp',
        name: 'Socratic Bot',
        url: biasUrlForDay(day),
        splashImageUrl: `${SITE_URL}/splash-200.png`,
        splashBackgroundColor: '#FDFBF9',
      },
    },
  };
}
