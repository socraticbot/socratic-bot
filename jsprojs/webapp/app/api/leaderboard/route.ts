import { dayNumber } from '@/lib/biases/daily';
import { json, notConfigured } from '@/lib/server/http';
import { isNeynarConfigured, trustedProfiles } from '@/lib/server/neynar';
import { topStreaks } from '@/lib/server/players';
import { getRedis } from '@/lib/server/redis';

const BOARD_SIZE = 10;

/** Top live streaks among opted-in players who pass the bot filter. */
export async function GET() {
  const redis = getRedis();
  if (!redis || !isNeynarConfigured()) return notConfigured();

  const candidates = await topStreaks(redis, dayNumber(new Date()), BOARD_SIZE * 3);
  const profiles = await trustedProfiles(candidates.map((c) => c.fid));
  const entries = candidates
    .filter((c) => profiles.has(c.fid))
    .slice(0, BOARD_SIZE)
    .map((c) => ({ ...profiles.get(c.fid)!, streak: c.streak }));

  return json({ entries }, 200, { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' });
}
