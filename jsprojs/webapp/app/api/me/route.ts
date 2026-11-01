import { dayNumber } from '@/lib/biases/daily';
import { fidFromRequest } from '@/lib/server/auth';
import { json, notConfigured, unauthorized } from '@/lib/server/http';
import { getAnswer, getPlayer } from '@/lib/server/players';
import { getRedis } from '@/lib/server/redis';
import { getReminder } from '@/lib/server/reminders';
import { liveStreak } from '@/lib/streaks/streak';

/**
 * The signed-in player's streak (null if they haven't played), today's answer if any,
 * and the language of their daily reminder (null if they haven't turned reminders on).
 */
export async function GET(request: Request) {
  const redis = getRedis();
  if (!redis) return notConfigured();
  const fid = await fidFromRequest(request);
  if (!fid) return unauthorized();
  const today = dayNumber(new Date());
  const [player, todayAnswer, reminders] = await Promise.all([
    getPlayer(redis, fid),
    getAnswer(redis, fid, today),
    getReminder(redis, fid),
  ]);
  return json({ player: player ? { ...player, streak: liveStreak(player, today) } : null, todayAnswer, reminders });
}
