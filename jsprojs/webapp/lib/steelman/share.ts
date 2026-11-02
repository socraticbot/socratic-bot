import { SITE_URL } from '@/lib/miniapp';

export const ARENA_URL = `${SITE_URL}/steel-man`;

/** Link to one week's topic, so a shared cast opens the topic its image shows. */
export function arenaUrlForWeek(week: number): string {
  return `${ARENA_URL}?week=${week}`;
}

export function arenaOgImageUrl(week: number): string {
  return `${SITE_URL}/api/og/steel-man?week=${week}`;
}

/** Shares invite people to write. */
export function arenaShareText(week: number): string {
  return `Steel-Man Arena #${week + 1}: can you argue the side you disagree with better than its own fans? 🛡️`;
}

/** The start of a steel-man cast: names the claim, then the writer's case follows in the composer. */
export function steelmanCastText(week: number, claim: string): string {
  return `Steel-man #${week + 1}, arguing a side I don't hold: "${claim}"\n\n`;
}

/** `fc:miniapp` embed: a cast containing the link shows this image and a launch button. */
export function arenaEmbed(week: number) {
  return {
    version: '1',
    imageUrl: arenaOgImageUrl(week),
    button: {
      title: "Steel-man this week's topic",
      action: {
        type: 'launch_miniapp',
        name: 'Socratic Bot',
        url: arenaUrlForWeek(week),
        splashImageUrl: `${SITE_URL}/splash-200.png`,
        splashBackgroundColor: '#FDFBF9',
      },
    },
  };
}
