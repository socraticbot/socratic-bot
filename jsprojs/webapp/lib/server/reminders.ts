import { Redis } from '@upstash/redis';
import { Locale, isLocale } from '@/lib/i18n/locales';
import { playedKey } from './players';

/** Hash of opted-in FIDs to the language their reminder is sent in. No entry means no reminders. */
const REMINDERS_KEY = 'reminders';

/** The language `fid` gets reminders in, or null if they haven't opted in. */
export async function getReminder(redis: Redis, fid: number): Promise<Locale | null> {
  const value = await redis.hget<string>(REMINDERS_KEY, String(fid));
  return isLocale(value) ? value : null;
}

/** Opt `fid` in (in `locale`) or out (null). */
export async function setReminder(redis: Redis, fid: number, locale: Locale | null): Promise<void> {
  if (locale) {
    await redis.hset(REMINDERS_KEY, { [String(fid)]: locale });
  } else {
    await redis.hdel(REMINDERS_KEY, String(fid));
  }
}

/** Opted-in FIDs who haven't played `day` yet, grouped by language. */
export async function dueReminders(redis: Redis, day: number): Promise<Map<Locale, number[]>> {
  const all = (await redis.hgetall<Record<string, unknown>>(REMINDERS_KEY)) ?? {};
  const optedIn = Object.entries(all)
    .map(([fid, locale]) => ({ fid: Number(fid), locale }))
    .filter((e): e is { fid: number; locale: Locale } => Number.isInteger(e.fid) && e.fid > 0 && isLocale(e.locale));

  const due = new Map<Locale, number[]>();
  for (let i = 0; i < optedIn.length; i += 500) {
    const batch = optedIn.slice(i, i + 500);
    const played = await redis.mget<unknown[]>(...batch.map((e) => playedKey(e.fid, day)));
    batch.forEach((e, j) => {
      if (played[j] !== null && played[j] !== undefined) return;
      due.set(e.locale, [...(due.get(e.locale) ?? []), e.fid]);
    });
  }
  return due;
}
