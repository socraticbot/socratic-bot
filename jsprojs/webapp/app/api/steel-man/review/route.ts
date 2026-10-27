import { json } from '@/lib/server/http';
import { allowReview } from '@/lib/server/ratelimit';
import { reviewSteelman } from '@/lib/server/review';
import { draftRequestSchema } from '@/lib/steelman/request';
import { getTopicForWeek, weekNumber } from '@/lib/steelman/weekly';

/** Feedback on a draft. Nothing is stored; anyone can practise, signed in or not. */
export async function POST(request: Request) {
  if (!process.env.AI_GATEWAY_API_KEY) return json({ error: 'AI_GATEWAY_API_KEY is not configured' }, 500);
  if (!(await allowReview(request))) {
    return json({ error: "You've asked for a lot of feedback this hour. Take a break and try again later." }, 429);
  }

  const parsed = draftRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid request' }, 400);
  const { week, side, text } = parsed.data;
  if (week > weekNumber(new Date())) return json({ error: 'Invalid week' }, 400);

  const result = await reviewSteelman(getTopicForWeek(week), side, text);
  if (result.kind === 'crisis') return json({ safety: 'crisis', reply: result.reply });
  if (result.kind === 'error') return json({ error: 'The reviewer could not respond. Please try again.', code: result.code }, 502);
  return json({ feedback: result.feedback, model: result.model });
}
