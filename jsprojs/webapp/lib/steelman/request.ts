import { z } from 'zod';
import { MAX_ENTRY_CHARS, MIN_ENTRY_CHARS } from './review';

const side = z.enum(['for', 'against']);
const stance = z.enum(['agree', 'disagree', 'unsure']);

/** How much writing the steel-man moved the writer's own view. */
export const SHIFTS = ['none', 'little', 'lot'] as const;
export type Shift = (typeof SHIFTS)[number];

export const draftRequestSchema = z.object({
  week: z.number().int().min(0),
  side,
  text: z.string().trim().min(MIN_ENTRY_CHARS).max(MAX_ENTRY_CHARS),
});

export const submitRequestSchema = draftRequestSchema.extend({
  stance,
  shift: z.enum(SHIFTS),
});

export const entryActionSchema = z.object({
  week: z.number().int().min(0),
  author: z.number().int().positive(),
});

export type DraftRequest = z.infer<typeof draftRequestSchema>;
export type SubmitRequest = z.infer<typeof submitRequestSchema>;
