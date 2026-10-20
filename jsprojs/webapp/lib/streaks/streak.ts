/**
 * Streak rules for "Bias of the day". Pure functions, so they can be tested
 * without a database.
 *
 * A streak counts consecutive days played (answering today's card), not
 * correct answers: showing up is the practice that matters, and ranking by
 * correctness would reward looking answers up.
 */

export interface PlayerState {
  /** Consecutive days played, ending on lastDay. */
  streak: number;
  best: number;
  /** Rotation day (see lib/biases/daily.ts) of the last card played. */
  lastDay: number;
  /** Cards answered correctly, all time. */
  spotted: number;
  plays: number;
  /** Opted in to appear on the public leaderboard. */
  optIn: boolean;
}

export const NEW_PLAYER: PlayerState = {
  streak: 0,
  best: 0,
  lastDay: -1,
  spotted: 0,
  plays: 0,
  optIn: false,
};

/** State after playing `day`'s card. Playing the same day twice changes nothing. */
export function applyPlay(prev: PlayerState | null, day: number, correct: boolean): PlayerState {
  const player = prev ?? NEW_PLAYER;
  if (player.lastDay === day) return player;
  const streak = player.lastDay === day - 1 ? player.streak + 1 : 1;
  return {
    ...player,
    streak,
    best: Math.max(player.best, streak),
    lastDay: day,
    spotted: player.spotted + (correct ? 1 : 0),
    plays: player.plays + 1,
  };
}

/** The streak as of `today`: still alive if the player played today or yesterday. */
export function liveStreak(player: PlayerState, today: number): number {
  return player.lastDay >= today - 1 ? player.streak : 0;
}
