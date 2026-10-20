import { dayNumber } from '@/lib/biases/daily';
import { fidFromRequest } from '@/lib/server/auth';
import { json, notConfigured, unauthorized } from '@/lib/server/http';
import { getPlayer } from '@/lib/server/players';
import { getRedis } from '@/lib/server/redis';
import { liveStreak } from '@/lib/streaks/streak';

/** The signed-in player's streak, or null if they haven't played yet. */
export async function GET(request: Request) {
  const redis = getRedis();
  if (!redis) return notConfigured();
  const fid = await fidFromRequest(request);
  if (!fid) return unauthorized();
  const player = await getPlayer(redis, fid);
  const today = dayNumber(new Date());
  return json({ player: player ? { ...player, streak: liveStreak(player, today) } : null });
}
