import { fidFromRequest } from '@/lib/server/auth';
import { json, unauthorized } from '@/lib/server/http';
import { allowReview } from '@/lib/server/ratelimit';
import { getRedis } from '@/lib/server/redis';
import { reviewSteelman } from '@/lib/server/review';
import { getEntry, submitEntry } from '@/lib/server/steelman';
import { fitMessage } from '@/lib/steelman/review';
import { submitRequestSchema } from '@/lib/steelman/request';
import { getTopicForWeek, weekNumber } from '@/lib/steelman/weekly';

/**
 * Submit this week's steel-man for the signed-in Farcaster user. The final
 * text is reviewed here, so stored scores always match the stored text.
 * One submission per person per week.
 */
export async function POST(request: Request) {
  const redis = getRedis();
  if (!redis) return json({ error: 'Submissions are not available yet' }, 503);
  if (!process.env.AI_GATEWAY_API_KEY) return json({ error: 'AI_GATEWAY_API_KEY is not configured' }, 500);
  const fid = await fidFromRequest(request);
  if (!fid) return unauthorized();

  const parsed = submitRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid request' }, 400);
  const { week, side, text, stance, shift } = parsed.data;
  // Only this week's topic takes submissions; past topics from shared links are practice.
  if (week !== weekNumber(new Date())) return json({ error: "Only this week's topic takes submissions" }, 409);

  // Already submitted: return the stored entry without another model call.
  const existing = await getEntry(redis, week, fid);
  if (existing) return json({ entry: existing, created: false });

  if (!(await allowReview(request))) {
    return json({ error: "You've asked for a lot of feedback this hour. Take a break and try again later." }, 429);
  }
  const result = await reviewSteelman(getTopicForWeek(week), side, text);
  if (result.kind === 'crisis') return json({ safety: 'crisis', reply: result.reply });
  if (result.kind === 'error') return json({ error: 'The reviewer could not respond. Please try again.', code: result.code }, 502);

  const rejection = fitMessage(result.feedback.fit);
  if (rejection) return json({ error: rejection, feedback: result.feedback }, 422);

  const stored = await submitEntry(redis, {
    fid,
    week,
    side,
    text,
    stance,
    shift,
    feedback: result.feedback,
    at: Date.now(),
  });
  return json(stored);
}
