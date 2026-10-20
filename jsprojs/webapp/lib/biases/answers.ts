/**
 * Remembers which option this browser picked for a day's card, so reopening
 * the page shows the result instead of the question. Per-viewer convenience
 * only; storage can be missing or blocked, so every access is guarded.
 */

const key = (day: number) => `socratic:answer:${day}`;

export function loadAnswer(day: number): string | null {
  try {
    return window.localStorage.getItem(key(day));
  } catch {
    return null;
  }
}

export function saveAnswer(day: number, answer: string): void {
  try {
    window.localStorage.setItem(key(day), answer);
  } catch {
    // Storage unavailable: the answer just won't be remembered.
  }
}
