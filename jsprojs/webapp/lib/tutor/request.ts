import { z } from 'zod';

export const MAX_MESSAGES = 20;
export const MAX_MESSAGE_CHARS = 4000;
export const MAX_TOTAL_CHARS = 20000;

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
});

const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(MAX_MESSAGES),
  modelId: z.string().optional(),
  biasSlug: z.string().max(64).optional(),
});

export type ChatMessage = z.infer<typeof messageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export type ParseResult =
  | { ok: true; data: ChatRequest }
  | { ok: false; error: string };

export function parseChatRequest(body: unknown): ParseResult {
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid request' };
  }
  const { messages } = parsed.data;
  if (messages[messages.length - 1].role !== 'user') {
    return { ok: false, error: 'Last message must be from the user' };
  }
  const total = messages.reduce((sum, m) => sum + m.content.length, 0);
  if (total > MAX_TOTAL_CHARS) {
    return { ok: false, error: 'Conversation too long. Please start a new one.' };
  }
  return { ok: true, data: parsed.data };
}
