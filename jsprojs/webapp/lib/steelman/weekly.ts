import { Side, TOPICS, Topic } from './topics';

/** Monday of week 0 (UTC). Weeks change at UTC midnight between Sunday and Monday. */
export const WEEK_START = Date.UTC(2026, 9, 26);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Whole UTC weeks since the arena started (negative before it). */
export function weekNumber(date: Date): number {
  return Math.floor((date.getTime() - WEEK_START) / WEEK_MS);
}

/**
 * The week to show: a requested past week (from a shared link) or this week.
 * Future weeks and junk fall back to this week, so nobody can peek ahead.
 */
export function resolveWeek(requested: string | undefined, thisWeek: number): number {
  if (!requested || !/^\d+$/.test(requested)) return thisWeek;
  const week = Number(requested);
  return week <= thisWeek ? week : thisWeek;
}

/** The topic for a given week, cycling through the list. */
export function getTopicForWeek(week: number, topics: Topic[] = TOPICS): Topic {
  const n = topics.length;
  return topics[((week % n) + n) % n];
}

/** Where the writer stands on the claim before writing. */
export type Stance = 'agree' | 'disagree' | 'unsure';

/**
 * The side to steel-man: the one the writer doesn't hold. Someone unsure
 * picks a side themselves, so this returns null for them.
 */
export function sideToArgue(stance: Stance): Side | null {
  if (stance === 'agree') return 'against';
  if (stance === 'disagree') return 'for';
  return null;
}
