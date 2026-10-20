import { BIASES, Bias } from './data';

/** Day 0 of the rotation (UTC). */
export const ROTATION_START = Date.UTC(2026, 9, 20);

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole UTC days since the rotation started (negative before it). */
export function dayNumber(date: Date): number {
  const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((utcMidnight - ROTATION_START) / DAY_MS);
}

/** The bias for a given rotation day, cycling through the list. */
export function getBiasForDay(day: number, biases: Bias[] = BIASES): Bias {
  const n = biases.length;
  return biases[((day % n) + n) % n];
}

/** The same bias for everyone on a given UTC day. */
export function getBiasForDate(date: Date, biases: Bias[] = BIASES): Bias {
  return getBiasForDay(dayNumber(date), biases);
}
