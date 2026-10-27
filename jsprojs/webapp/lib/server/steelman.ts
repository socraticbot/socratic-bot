import { Redis } from '@upstash/redis';
import { Feedback, totalScore } from '@/lib/steelman/review';
import { SHIFTS, Shift } from '@/lib/steelman/request';
import { Side } from '@/lib/steelman/topics';
import { Stance } from '@/lib/steelman/weekly';

/** Entries with this many distinct reports are hidden from everyone but their author. */
export const REPORT_LIMIT = 3;

export interface Entry {
  fid: number;
  week: number;
  side: Side;
  text: string;
  stance: Stance;
  shift: Shift;
  /** The final review, run on the submitted text. */
  feedback: Feedback;
  /** Submission time, ms since epoch. */
  at: number;
}

const entryKey = (week: number, fid: number) => `sm:entry:${week}:${fid}`;
const boardKey = (week: number, side: Side) => `sm:board:${week}:${side}`;
const votesKey = (week: number, fid: number) => `sm:votes:${week}:${fid}`;
const reportsKey = (week: number, fid: number) => `sm:reports:${week}:${fid}`;
const shiftKey = (week: number) => `sm:shift:${week}`;

/**
 * Board score: votes first, the review's total (3 to 15) as a tiebreak.
 * Dividing by 100 keeps the tiebreak below one vote.
 */
const tiebreak = (feedback: Feedback) => totalScore(feedback) / 100;

export async function getEntry(redis: Redis, week: number, fid: number): Promise<Entry | null> {
  return (await redis.get<Entry>(entryKey(week, fid))) ?? null;
}

/** Store `entry` as its author's one submission for the week. Returns the stored entry and whether this call created it. */
export async function submitEntry(redis: Redis, entry: Entry): Promise<{ entry: Entry; created: boolean }> {
  const created = await redis.set(entryKey(entry.week, entry.fid), entry, { nx: true });
  if (!created) return { entry: (await getEntry(redis, entry.week, entry.fid)) ?? entry, created: false };
  await Promise.all([
    redis.zadd(boardKey(entry.week, entry.side), { score: tiebreak(entry.feedback), member: String(entry.fid) }),
    redis.hincrby(shiftKey(entry.week), entry.shift, 1),
  ]);
  return { entry, created: true };
}

export interface RankedEntry {
  entry: Entry;
  votes: number;
  /** Whether the viewer has voted for this entry. */
  voted: boolean;
}

/** The week's top entries on one side, best first, without heavily reported ones. */
export async function topEntries(
  redis: Redis,
  week: number,
  side: Side,
  limit: number,
  viewer: number | null
): Promise<RankedEntry[]> {
  // Read extra so hidden entries don't leave the list short.
  const fids = (await redis.zrange<string[]>(boardKey(week, side), 0, limit * 2 - 1, { rev: true })).map(Number);
  if (fids.length === 0) return [];
  const [entries, reports, votes, voted] = await Promise.all([
    redis.mget<(Entry | null)[]>(...fids.map((fid) => entryKey(week, fid))),
    Promise.all(fids.map((fid) => redis.scard(reportsKey(week, fid)))),
    Promise.all(fids.map((fid) => redis.scard(votesKey(week, fid)))),
    Promise.all(fids.map((fid) => (viewer ? redis.sismember(votesKey(week, fid), String(viewer)) : 0))),
  ]);
  return fids
    .map((fid, i) => ({ entry: entries[i], reports: reports[i], votes: votes[i], voted: voted[i] === 1, fid }))
    .filter((r): r is typeof r & { entry: Entry } => r.entry !== null && (r.reports < REPORT_LIMIT || r.fid === viewer))
    .slice(0, limit)
    .map(({ entry, votes, voted }) => ({ entry, votes, voted }));
}

export type VoteResult = { ok: true; votes: number } | { ok: false; error: 'no_entry' | 'own_entry' };

/** One vote per voter per entry; voting twice changes nothing. */
export async function voteFor(redis: Redis, week: number, voter: number, author: number): Promise<VoteResult> {
  if (voter === author) return { ok: false, error: 'own_entry' };
  const entry = await getEntry(redis, week, author);
  if (!entry) return { ok: false, error: 'no_entry' };
  const added = await redis.sadd(votesKey(week, author), String(voter));
  if (added === 1) await redis.zincrby(boardKey(week, entry.side), 1, String(author));
  return { ok: true, votes: await redis.scard(votesKey(week, author)) };
}

/** Record a report. Reports are per reporter, so one person can't hide an entry alone. */
export async function reportEntry(redis: Redis, week: number, reporter: number, author: number): Promise<boolean> {
  if (reporter === author || !(await getEntry(redis, week, author))) return false;
  await redis.sadd(reportsKey(week, author), String(reporter));
  return true;
}

/** How many writers said steel-manning moved their own view, by amount. */
export async function shiftCounts(redis: Redis, week: number): Promise<Record<Shift, number>> {
  const stored = (await redis.hgetall<Record<string, number | string>>(shiftKey(week))) ?? {};
  return Object.fromEntries(SHIFTS.map((s) => [s, Number(stored[s] ?? 0)])) as Record<Shift, number>;
}
