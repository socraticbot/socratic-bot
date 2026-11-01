import { describe, expect, it } from 'vitest';
import type { Redis } from '@upstash/redis';
import { LOCALES } from '@/lib/i18n/locales';
import { MAX_BODY, MAX_TITLE, buildReminder, chunk, uuidV5 } from '@/lib/reminders/notification';
import { recordPlay } from '@/lib/server/players';
import { dueReminders, getReminder, setReminder } from '@/lib/server/reminders';

describe('uuidV5', () => {
  it('matches the RFC 4122 reference value', () => {
    // python3 -c "import uuid; print(uuid.uuid5(uuid.NAMESPACE_URL, 'https://www.socratic.bot/'))"
    expect(uuidV5('https://www.socratic.bot/')).toBe('c6a1e718-9bb2-50e3-8e21-3ca747899e2a');
  });
});

describe.each(LOCALES)('%s reminder', (locale) => {
  const n = buildReminder(12, locale);

  it('fits Farcaster limits', () => {
    expect(n.title.length).toBeGreaterThan(0);
    expect(n.title.length).toBeLessThanOrEqual(MAX_TITLE);
    expect(n.body.length).toBeGreaterThan(0);
    expect(n.body.length).toBeLessThanOrEqual(MAX_BODY);
  });

  it('targets exactly the registered host, or tokens get invalidated', () => {
    const url = new URL(n.target_url);
    expect(url.protocol).toBe('https:');
    expect(url.host).toBe('www.socratic.bot');
    expect(url.searchParams.get('day')).toBe('12');
  });

  it('has a stable idempotency key per day and language', () => {
    expect(buildReminder(12, locale).uuid).toBe(n.uuid);
    expect(buildReminder(13, locale).uuid).not.toBe(n.uuid);
  });
});

it('gives each language its own idempotency key', () => {
  expect(new Set(LOCALES.map((l) => buildReminder(1, l).uuid)).size).toBe(LOCALES.length);
});

it('chunks lists', () => {
  expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  expect(chunk([], 2)).toEqual([]);
});

/** Just enough of Upstash Redis for reminders and plays. */
function fakeRedis() {
  const kv = new Map<string, unknown>();
  const hashes = new Map<string, Map<string, unknown>>();
  const hash = (k: string) => hashes.get(k) ?? hashes.set(k, new Map()).get(k)!;
  return {
    async get(k: string) {
      return kv.has(k) ? structuredClone(kv.get(k)) : null;
    },
    async set(k: string, v: unknown, opts?: { nx?: boolean }) {
      if (opts?.nx && kv.has(k)) return null;
      kv.set(k, structuredClone(v));
      return 'OK';
    },
    async mget(...keys: string[]) {
      return keys.map((k) => (kv.has(k) ? structuredClone(kv.get(k)) : null));
    },
    async zadd() {
      return 1;
    },
    async zrem() {
      return 1;
    },
    async hget(k: string, field: string) {
      return hash(k).get(field) ?? null;
    },
    async hset(k: string, values: Record<string, unknown>) {
      for (const [f, v] of Object.entries(values)) hash(k).set(f, v);
      return 1;
    },
    async hdel(k: string, field: string) {
      return hash(k).delete(field) ? 1 : 0;
    },
    async hgetall(k: string) {
      const h = hash(k);
      return h.size ? Object.fromEntries(h) : null;
    },
  } as unknown as Redis;
}

describe('reminder store', () => {
  it('is off until a user opts in, and off again after opting out', async () => {
    const redis = fakeRedis();
    expect(await getReminder(redis, 7)).toBeNull();
    await setReminder(redis, 7, 'de');
    expect(await getReminder(redis, 7)).toBe('de');
    await setReminder(redis, 7, null);
    expect(await getReminder(redis, 7)).toBeNull();
  });

  it('reminds only opted-in users who have not played today, grouped by language', async () => {
    const redis = fakeRedis();
    expect(await dueReminders(redis, 5)).toEqual(new Map());
    await setReminder(redis, 1, 'en');
    await setReminder(redis, 2, 'en');
    await setReminder(redis, 3, 'zh');
    await setReminder(redis, 4, 'es');
    await recordPlay(redis, 2, 5, 'x', true); // played today
    await recordPlay(redis, 4, 4, 'x', true); // played yesterday only
    const due = await dueReminders(redis, 5);
    expect(Object.fromEntries(due)).toEqual({ en: [1], zh: [3], es: [4] });
  });
});
