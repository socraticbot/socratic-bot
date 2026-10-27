import { NextRequest } from 'next/server';
import { fidFromRequest } from '@/lib/server/auth';
import { json, unauthorized } from '@/lib/server/http';
import { getRedis } from '@/lib/server/redis';
import { getEntry } from '@/lib/server/steelman';
import { resolveWeek, weekNumber } from '@/lib/steelman/weekly';

/** The signed-in writer's entry for a week, so a reopened app (or another device) shows it. */
export async function GET(request: NextRequest) {
  const redis = getRedis();
  if (!redis) return json({ error: 'Submissions are not available yet' }, 503);
  const fid = await fidFromRequest(request);
  if (!fid) return unauthorized();
  const week = resolveWeek(request.nextUrl.searchParams.get('week') ?? undefined, weekNumber(new Date()));
  return json({ entry: await getEntry(redis, week, fid) }, 200, { 'Cache-Control': 'private, no-store' });
}
