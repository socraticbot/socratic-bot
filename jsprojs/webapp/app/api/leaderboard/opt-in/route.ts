import { z } from 'zod';
import { dayNumber } from '@/lib/biases/daily';
import { fidFromRequest } from '@/lib/server/auth';
import { json, notConfigured, unauthorized } from '@/lib/server/http';
import { setOptIn } from '@/lib/server/players';
import { getRedis } from '@/lib/server/redis';
import { liveStreak } from '@/lib/streaks/streak';

const bodySchema = z.object({ optIn: z.boolean() });

/** Show or hide the signed-in player on the public leaderboard. */
export async function POST(request: Request) {
  const redis = getRedis();
  if (!redis) return notConfigured();
  const fid = await fidFromRequest(request);
  if (!fid) return unauthorized();

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid request' }, 400);

  const player = await setOptIn(redis, fid, parsed.data.optIn);
  if (!player) return json({ error: "Play today's card first" }, 404);
  return json({ player: { ...player, streak: liveStreak(player, dayNumber(new Date())) } });
}
