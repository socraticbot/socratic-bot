import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { getBiasBySlug } from '@/lib/biases/data';
import { getDefaultModel, getModelById } from '@/lib/models';
import { buildSystemPrompt } from '@/lib/tutor/prompt';
import { parseChatRequest } from '@/lib/tutor/request';

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

  const { messages, modelId, biasSlug } = parsed.data;
  // Only models from the server-side allowlist; unknown ids fall back to the default.
  const model = (modelId && getModelById(modelId)) || getDefaultModel();
  const bias = biasSlug ? getBiasBySlug(biasSlug) : undefined;

  try {
    const result = streamText({
      model: model.id,
      system: buildSystemPrompt(bias),
      messages,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.7,
      // Log metadata only, never message text.
      onError: ({ error }) => {
        console.error('[chat] stream error', {
          model: model.id,
          message: error instanceof Error ? error.message : 'unknown',
        });
      },
    });
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[chat] model call failed', {
      model: model.id,
      message: error instanceof Error ? error.message : 'unknown',
    });
    return jsonError('Failed to generate a response', 500);
  }
}
