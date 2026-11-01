import { createHash, timingSafeEqual } from 'node:crypto';
import { dayNumber } from '@/lib/biases/daily';
import { MAX_TARGETS, buildReminder, chunk } from '@/lib/reminders/notification';
import { json } from '@/lib/server/http';
import { isNeynarConfigured, sendNotification } from '@/lib/server/neynar';
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
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return json({ error: 'CRON_SECRET is not set' }, 503);
  if (!matchesSecret(request.headers.get('authorization'), secret)) return json({ error: 'Unauthorized' }, 401);

  const redis = getRedis();
  if (!redis || !isNeynarConfigured()) return json({ error: 'Reminders are not available' }, 503);

  const today = dayNumber(new Date());
  const due = await dueReminders(redis, today);
  let sent = 0;
  let failed = 0;
  for (const [locale, fids] of due) {
    const notification = buildReminder(today, locale);
    for (const batch of chunk(fids, MAX_TARGETS)) {
      try {
        await sendNotification(batch, notification);
        sent += batch.length;
      } catch (error) {
        failed += batch.length;
        console.error('reminder batch failed', { locale, size: batch.length, error: String(error) });
      }
    }
  }
  return json({ day: today, sent, failed });
}
