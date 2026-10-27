import { fidFromRequest } from '@/lib/server/auth';
import { json, unauthorized } from '@/lib/server/http';
import { getRedis } from '@/lib/server/redis';
import { getEntry, voteFor } from '@/lib/server/steelman';
import { entryActionSchema } from '@/lib/steelman/request';

/**
 * "A proponent would sign this": one vote per entry. Only people who wrote
 * their own steel-man that week can vote, so votes come from people who did the work.
 */
export async function POST(request: Request) {
  const redis = getRedis();
  if (!redis) return json({ error: 'Voting is not available yet' }, 503);
  const fid = await fidFromRequest(request);
  if (!fid) return unauthorized();

  const parsed = entryActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid request' }, 400);
  const { week, author } = parsed.data;

  if (!(await getEntry(redis, week, fid))) return json({ error: 'Write your own steel-man for this week to vote' }, 403);
  const result = await voteFor(redis, week, fid, author);
  if (!result.ok) return json({ error: result.error === 'own_entry' ? "You can't vote for your own entry" : 'Entry not found' }, 400);
  return json({ votes: result.votes, voted: true });
}
