import { z } from 'zod';
import { dayNumber, getBiasForDay } from '@/lib/biases/daily';
import { fidFromRequest } from '@/lib/server/auth';
import { json, notConfigured, unauthorized } from '@/lib/server/http';
import { recordPlay } from '@/lib/server/players';
import { getRedis } from '@/lib/server/redis';
import { liveStreak } from '@/lib/streaks/streak';

const bodySchema = z.object({ day: z.number().int(), answer: z.string().max(100) });

/** Record today's card as played for the signed-in Farcaster user. */
export async function POST(request: Request) {
  const redis = getRedis();
  if (!redis) return notConfigured();
  const fid = await fidFromRequest(request);
  if (!fid) return unauthorized();

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid request' }, 400);

  const today = dayNumber(new Date());
  // Only today's card counts toward a streak; past cards from shared links don't.
  if (parsed.data.day !== today) return json({ error: "Only today's card counts" }, 409);

  const bias = getBiasForDay(today);
  if (!bias.options.includes(parsed.data.answer)) return json({ error: 'Invalid answer' }, 400);

  const player = await recordPlay(redis, fid, today, parsed.data.answer, parsed.data.answer === bias.name);
  return json({ player: { ...player, streak: liveStreak(player, today) } });
}
