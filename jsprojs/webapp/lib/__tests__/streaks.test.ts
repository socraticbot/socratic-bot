import { describe, expect, it } from 'vitest';
import type { Redis } from '@upstash/redis';
import { NEW_PLAYER, applyPlay, liveStreak } from '@/lib/streaks/streak';
import { getAnswer, recordPlay, setOptIn, topStreaks } from '@/lib/server/players';
import { clientKey } from '@/lib/server/ratelimit';

describe('applyPlay', () => {
  it('starts a streak of 1 on the first play', () => {
    const p = applyPlay(null, 5, true);
    expect(p).toMatchObject({ streak: 1, best: 1, lastDay: 5, spotted: 1, plays: 1, optIn: false });
  });

  it('extends the streak on consecutive days and counts days played, not correct answers', () => {
    let p = applyPlay(null, 5, true);
    p = applyPlay(p, 6, false);
    p = applyPlay(p, 7, false);
    expect(p).toMatchObject({ streak: 3, best: 3, spotted: 1, plays: 3 });
  });

  it('ignores a second play on the same day', () => {
    const p = applyPlay(null, 5, true);
    expect(applyPlay(p, 5, false)).toBe(p);
  });

  it('restarts at 1 after a missed day but keeps the best', () => {
    let p = applyPlay(null, 5, true);
    p = applyPlay(p, 6, true);
    p = applyPlay(p, 9, true);
    expect(p).toMatchObject({ streak: 1, best: 2, plays: 3 });
  });

  it('keeps the opt-in choice across plays', () => {
    const p = applyPlay({ ...NEW_PLAYER, optIn: true, lastDay: 4, streak: 1, best: 1 }, 5, true);
    expect(p.optIn).toBe(true);
  });
});

describe('liveStreak', () => {
  const p = { ...NEW_PLAYER, streak: 4, best: 4, lastDay: 10 };
  it('is alive today and the day after', () => {
    expect(liveStreak(p, 10)).toBe(4);
    expect(liveStreak(p, 11)).toBe(4);
  });
  it('is 0 once a full day is missed', () => {
    expect(liveStreak(p, 12)).toBe(0);
  });
});

/** Just enough of Upstash Redis for the player store. */
function fakeRedis() {
  const kv = new Map<string, unknown>();
  const zsets = new Map<string, Map<string, number>>();
  const zset = (k: string) => zsets.get(k) ?? zsets.set(k, new Map()).get(k)!;
  return {
    kv,
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
    async zadd(k: string, { score, member }: { score: number; member: string }) {
      zset(k).set(member, score);
      return 1;
    },
    async zrem(k: string, member: string) {
      return zset(k).delete(member) ? 1 : 0;
    },
    async zrange(k: string, start: number, stop: number) {
      return [...zset(k).entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(start, stop + 1)
        .map(([m]) => m);
    },
  };
}

describe('player store', () => {
  it('records one play per day even when called twice', async () => {
    const redis = fakeRedis() as unknown as Redis;
    await recordPlay(redis, 1, 5, 'Anchoring', true);
    const again = await recordPlay(redis, 1, 5, 'Anchoring', false);
    expect(again).toMatchObject({ streak: 1, plays: 1, spotted: 1 });
  });

  it('only lists opted-in players with live streaks, longest first', async () => {
    const redis = fakeRedis() as unknown as Redis;
    for (const day of [3, 4, 5]) await recordPlay(redis, 1, day, 'Anchoring', true); // streak 3
    for (const day of [4, 5]) await recordPlay(redis, 2, day, 'Anchoring', true); // streak 2
    await recordPlay(redis, 3, 1, 'Anchoring', true); // stale streak
    await recordPlay(redis, 4, 5, 'Anchoring', true); // never opts in
    await setOptIn(redis, 1, true);
    await setOptIn(redis, 2, true);
    await setOptIn(redis, 3, true);
    expect(await topStreaks(redis, 5, 10)).toEqual([
      { fid: 1, streak: 3 },
      { fid: 2, streak: 2 },
    ]);
  });

  it('removes a player from the board when they opt out', async () => {
    const redis = fakeRedis() as unknown as Redis;
    await recordPlay(redis, 1, 5, 'Anchoring', true);
    await setOptIn(redis, 1, true);
    await setOptIn(redis, 1, false);
    expect(await topStreaks(redis, 5, 10)).toEqual([]);
  });

  it("remembers the first answer of the day", async () => {
    const redis = fakeRedis() as unknown as Redis;
    await recordPlay(redis, 1, 5, 'Halo Effect', false);
    await recordPlay(redis, 1, 5, 'Anchoring', true);
    expect(await getAnswer(redis, 1, 5)).toBe('Halo Effect');
    expect(await getAnswer(redis, 1, 6)).toBeNull();
  });

  it('cannot opt in before playing', async () => {
    const redis = fakeRedis() as unknown as Redis;
    expect(await setOptIn(redis, 9, true)).toBeNull();
  });
});

describe('rate limit key', () => {
  it('prefers the platform IP header, then the first forwarded IP', () => {
    expect(clientKey(new Request('https://x', { headers: { 'x-real-ip': '1.1.1.1' } }))).toBe('1.1.1.1');
    expect(clientKey(new Request('https://x', { headers: { 'x-forwarded-for': '2.2.2.2, 3.3.3.3' } }))).toBe('2.2.2.2');
    expect(clientKey(new Request('https://x'))).toBe('unknown');
  });
});

describe('stored answers', () => {
  it('ignores placeholder values from plays recorded before answers were stored', async () => {
    const redis = fakeRedis();
    await redis.set('played:1:5', 1);
    expect(await getAnswer(redis as unknown as Redis, 1, 5)).toBeNull();
  });
});
