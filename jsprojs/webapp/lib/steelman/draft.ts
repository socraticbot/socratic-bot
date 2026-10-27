/**
 * Keeps this browser's work on a week's topic (stance, side, text, feedback)
 * so closing the app doesn't lose a draft. Per-viewer convenience only;
 * storage can be missing or blocked, so every access is guarded.
 */

import type { Feedback } from './review';
import type { Side } from './topics';
import type { Stance } from './weekly';

export interface Draft {
  stance: Stance | null;
  side: Side | null;
  text: string;
  /** Feedback on earlier drafts, oldest first. */
  rounds: Feedback[];
  /** The final review, once submitted. */
  final: Feedback | null;
}

export const EMPTY_DRAFT: Draft = { stance: null, side: null, text: '', rounds: [], final: null };

const key = (week: number) => `socratic:steelman:${week}`;

export function loadDraft(week: number): Draft {
  try {
    const raw = window.localStorage.getItem(key(week));
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    return {
      stance: parsed.stance ?? null,
      side: parsed.side ?? null,
      text: typeof parsed.text === 'string' ? parsed.text : '',
      rounds: Array.isArray(parsed.rounds) ? parsed.rounds : [],
      final: parsed.final ?? null,
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

export function saveDraft(week: number, draft: Draft): void {
  try {
    window.localStorage.setItem(key(week), JSON.stringify(draft));
  } catch {
    // Storage unavailable: the draft just won't be remembered.
  }
}
