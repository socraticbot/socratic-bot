import { Redis } from '@upstash/redis';
import { PlayerState, applyPlay, liveStreak } from '@/lib/streaks/streak';

const playerKey = (fid: number) => `player:${fid}`;
const playedKey = (fid: number, day: number) => `played:${fid}:${day}`;
const BOARD_KEY = 'board:streak';
const TWO_DAYS_S = 2 * 24 * 60 * 60;

export async function getPlayer(redis: Redis, fid: number): Promise<PlayerState | null> {
  return (await redis.get<PlayerState>(playerKey(fid))) ?? null;
}

async function savePlayer(redis: Redis, fid: number, player: PlayerState): Promise<void> {
  await redis.set(playerKey(fid), player);
  if (player.optIn) {
    await redis.zadd(BOARD_KEY, { score: player.streak, member: String(fid) });
  } else {
    await redis.zrem(BOARD_KEY, String(fid));
  }
}

/** The answer `fid` gave on `day`, so a reopened app can show the result instead of the question. */
export async function getAnswer(redis: Redis, fid: number, day: number): Promise<string | null> {
  // Plays recorded before answers were stored hold a placeholder, not an answer.
  const value = await redis.get<unknown>(playedKey(fid, day));
  return typeof value === 'string' ? value : null;
}

/** Record that `fid` played `day`'s card. Safe to call more than once per day. */
export async function recordPlay(
  redis: Redis,
  fid: number,
  day: number,
  answer: string,
  correct: boolean
): Promise<PlayerState> {
  // First play of the day wins; repeats and retries return the stored state.
  const first = await redis.set(playedKey(fid, day), answer, { nx: true, ex: TWO_DAYS_S });
  const prev = await getPlayer(redis, fid);
  if (!first) return prev ?? applyPlay(null, day, correct);
  const next = applyPlay(prev, day, correct);
  await savePlayer(redis, fid, next);
  return next;
}

export async function setOptIn(redis: Redis, fid: number, optIn: boolean): Promise<PlayerState | null> {
  const player = await getPlayer(redis, fid);
  if (!player) return null;
  const next = { ...player, optIn };
  await savePlayer(redis, fid, next);
  return next;
}

export interface BoardEntry {
  fid: number;
  streak: number;
}

/** Opted-in players with live streaks, longest first. */
export async function topStreaks(redis: Redis, today: number, limit: number): Promise<BoardEntry[]> {
  // Scores can be stale for players who stopped; read extra and filter.
  const fids = (await redis.zrange<string[]>(BOARD_KEY, 0, limit * 5 - 1, { rev: true })).map(Number);
  if (fids.length === 0) return [];
  const players = await redis.mget<(PlayerState | null)[]>(...fids.map(playerKey));
  return fids
    .map((fid, i) => ({ fid, player: players[i] }))
    .filter((e): e is { fid: number; player: PlayerState } => Boolean(e.player?.optIn))
    .map(({ fid, player }) => ({ fid, streak: liveStreak(player, today) }))
    .filter((e) => e.streak > 0)
    .sort((a, b) => b.streak - a.streak);
}
