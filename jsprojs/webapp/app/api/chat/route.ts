import { generateText } from 'ai';
import { NextRequest } from 'next/server';
import { getBiasBySlug } from '@/lib/biases/data';
import { AVAILABLE_MODELS, getDefaultModel, getModelById } from '@/lib/models';
import { buildSystemPrompt } from '@/lib/tutor/prompt';
import { parseChatRequest } from '@/lib/tutor/request';
import { CRISIS_REPLIES, crisisLocale } from '@/lib/tutor/safety';
import { allowChat } from '@/lib/server/ratelimit';

const MAX_OUTPUT_TOKENS = 600;

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return jsonError('AI_GATEWAY_API_KEY is not configured', 500);
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonError('Expected application/json', 415);
  }

  if (!(await allowChat(request))) {
    return jsonError('Too many messages for now. Please take a break and try again in a few minutes.', 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const parsed = parseChatRequest(body);
  if (!parsed.ok) {
    return jsonError(parsed.error, 400);
  }

  const { messages, modelId, biasSlug, locale = 'en' } = parsed.data;
  // Only models from the server-side allowlist; unknown ids fall back to the default.
  const model = (modelId && getModelById(modelId)) || getDefaultModel();
  const bias = biasSlug ? getBiasBySlug(biasSlug) : undefined;

  // Crisis language never reaches the model (see lib/tutor/safety.ts).
  const crisis = crisisLocale(messages[messages.length - 1].content);
  if (crisis) {
    console.info('[chat] crisis reply sent', { model: model.id, locale: crisis });
    return Response.json({ reply: CRISIS_REPLIES[crisis], model: model.id, safety: 'crisis' });
  }

  // Try the chosen model first, then the other allowlisted models. A model can
  // fail or return no text (for example, a content filter or an upstream
  // change); the user should still get a reply.
  const candidates = [model, ...AVAILABLE_MODELS.filter((m) => m.id !== model.id)];
  const system = buildSystemPrompt(bias, locale);
  let lastCode = 'empty';

  for (const candidate of candidates) {
    try {
      // Non-streaming on purpose: replies are short, and a complete reply can be
      // checked before it is sent (see notes 08, revision 3).
      const { text, finishReason } = await generateText({
        model: candidate.id,
        system,
        messages,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7,
      });
      const reply = text.trim();
      if (reply) {
        if (candidate.id !== model.id) {
          console.warn('[chat] used fallback model', { requested: model.id, used: candidate.id });
        }
        return Response.json({ reply, model: candidate.id });
      }
      lastCode = `empty:${finishReason}`;
      // Log metadata only, never message text.
      console.error('[chat] model returned empty reply', { model: candidate.id, finishReason });
    } catch (error) {
      lastCode = errorCode(error);
      console.error('[chat] model call failed', { model: candidate.id, code: lastCode });
    }
  }

  return new Response(
    JSON.stringify({ error: 'The tutor could not respond. Please try again.', code: lastCode }),
    { status: 502, headers: { 'Content-Type': 'application/json' } }
  );
}

/** Short, non-sensitive identifier for an upstream failure (error class and HTTP status). */
function errorCode(error: unknown): string {
  if (!(error instanceof Error)) return 'unknown';
  const status = (error as { statusCode?: unknown }).statusCode;
  return typeof status === 'number' ? `${error.name}:${status}` : error.name;
}
