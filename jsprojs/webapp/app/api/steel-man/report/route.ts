import { fidFromRequest } from '@/lib/server/auth';
import { json, unauthorized } from '@/lib/server/http';
import { getRedis } from '@/lib/server/redis';
import { reportEntry } from '@/lib/server/steelman';
import { entryActionSchema } from '@/lib/steelman/request';

/** Flag an entry as abusive. Enough distinct reports hide it (see REPORT_LIMIT). */
export async function POST(request: Request) {
  const redis = getRedis();
  if (!redis) return json({ error: 'Reporting is not available yet' }, 503);
  const fid = await fidFromRequest(request);
  if (!fid) return unauthorized();

  const parsed = entryActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid request' }, 400);

  const ok = await reportEntry(redis, parsed.data.week, fid, parsed.data.author);
  if (!ok) return json({ error: 'Entry not found' }, 400);
  // Log ids only, never entry text.
  console.info('[steel-man] entry reported', { week: parsed.data.week, author: parsed.data.author });
  return json({ reported: true });
}
