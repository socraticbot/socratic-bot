import { generateText } from 'ai';
import { getDefaultModel } from '@/lib/models';
import { Feedback, buildReviewRequest, buildReviewerPrompt, parseFeedback } from '@/lib/steelman/review';
import { Side, Topic } from '@/lib/steelman/topics';
import { CRISIS_REPLIES, crisisLocale } from '@/lib/tutor/safety';

const MAX_OUTPUT_TOKENS = 900;

export type ReviewResult =
  | { kind: 'ok'; feedback: Feedback; model: string }
  | { kind: 'crisis'; reply: string }
  | { kind: 'error'; code: string };

/**
 * Review a steel-man with the default model. Crisis language never reaches
 * the model (see lib/tutor/safety.ts). A reply that isn't valid JSON gets one
 * retry before giving up.
 */
export async function reviewSteelman(topic: Topic, side: Side, text: string): Promise<ReviewResult> {
  const crisis = crisisLocale(text);
  if (crisis) {
    console.info('[steel-man] crisis reply sent', { locale: crisis });
    return { kind: 'crisis', reply: CRISIS_REPLIES[crisis] };
  }

  const model = getDefaultModel();
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const { text: reply } = await generateText({
        model: model.id,
        system: buildReviewerPrompt(),
        prompt: buildReviewRequest(topic, side, text),
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.3,
      });
      const feedback = parseFeedback(reply);
      if (feedback) return { kind: 'ok', feedback, model: model.id };
    }
    // Log metadata only, never entry text.
    console.error('[steel-man] unparseable review', { model: model.id });
    return { kind: 'error', code: 'unparseable' };
  } catch (error) {
    const code = errorCode(error);
    console.error('[steel-man] model call failed', { model: model.id, code });
    return { kind: 'error', code };
  }
}

/** Short, non-sensitive identifier for an upstream failure (error class and HTTP status). */
function errorCode(error: unknown): string {
  if (!(error instanceof Error)) return 'unknown';
  const status = (error as { statusCode?: unknown }).statusCode;
  return typeof status === 'number' ? `${error.name}:${status}` : error.name;
}
