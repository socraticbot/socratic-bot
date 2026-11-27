import { createHash, timingSafeEqual } from 'node:crypto';
import { dayNumber } from '@/lib/biases/daily';
import { MAX_TARGETS, buildReminder, chunk } from '@/lib/reminders/notification';
import { json } from '@/lib/server/http';
import { DeliveryResult, describeNeynarError, isNeynarConfigured, sendNotification } from '@/lib/server/neynar';
import { getRedis } from '@/lib/server/redis';
import { dueReminders } from '@/lib/server/reminders';

/** Constant-time comparison, so response timing doesn't leak the secret. */
function matchesSecret(header: string | null, secret: string): boolean {
  const digest = (v: string) => createHash('sha256').update(v).digest();
  return timingSafeEqual(digest(header ?? ''), digest(`Bearer ${secret}`));
}

/**
 * Daily reminder, run by Vercel Cron (see vercel.json). Only users who turned
 * reminders on and haven't played today's card are notified.
 *
 * The JSON response (and the log line) says where reminders stop:
 * nobody opted in, everyone already played, Neynar had no token for them
 * (notAttempted), Farcaster rejected them (failure), or a call errored.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return json({ error: 'CRON_SECRET is not set' }, 503);
  if (!matchesSecret(request.headers.get('authorization'), secret)) return json({ error: 'Unauthorized' }, 401);

  const redis = getRedis();
  if (!redis) return json({ error: 'Redis is not configured' }, 503);
  if (!isNeynarConfigured()) return json({ error: 'NEYNAR_API_KEY is not set' }, 503);

  const today = dayNumber(new Date());
  const { due, optedIn, played } = await dueReminders(redis, today);
  const neynar: DeliveryResult = { success: 0, failure: 0, notAttempted: 0, retryable: 0 };
  const errors: string[] = [];
  let targeted = 0;

  for (const [locale, fids] of due) {
    const notification = buildReminder(today, locale);
    for (const batch of chunk(fids, MAX_TARGETS)) {
      targeted += batch.length;
      try {
        const result = await sendNotification(batch, notification);
        neynar.success += result.success;
        neynar.failure += result.failure;
        neynar.notAttempted += result.notAttempted;
        neynar.retryable += result.retryable;
      } catch (error) {
        errors.push(`${locale} batch of ${batch.length}: ${describeNeynarError(error)}`);
      }
    }
  }

  const summary = { day: today, optedIn, alreadyPlayed: played, targeted, neynar, errors };
  console.log('reminders', JSON.stringify(summary));
  return json(summary, errors.length > 0 && neynar.success === 0 ? 502 : 200);
}
