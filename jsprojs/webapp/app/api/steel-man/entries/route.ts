import { NextRequest } from 'next/server';
import { fidFromRequest } from '@/lib/server/auth';
import { json } from '@/lib/server/http';
import { isNeynarConfigured, trustedProfiles } from '@/lib/server/neynar';
import { getRedis } from '@/lib/server/redis';
import { getEntry, shiftCounts, topEntries } from '@/lib/server/steelman';
import { totalScore } from '@/lib/steelman/review';
import { resolveWeek, weekNumber } from '@/lib/steelman/weekly';

const GALLERY_SIZE = 20;

/**
 * How others argued a week's topic on one side, best first, among writers who
 * pass the bot filter. This week's entries unlock once you've submitted your
 * own, so nobody can copy before writing; past weeks are open to everyone.
 */
export async function GET(request: NextRequest) {
  const redis = getRedis();
  if (!redis || !isNeynarConfigured()) return json({ error: 'The arena is not available yet' }, 503);

  const params = request.nextUrl.searchParams;
  const thisWeek = weekNumber(new Date());
  const week = resolveWeek(params.get('week') ?? undefined, thisWeek);
  const side = params.get('side');
  if (side !== 'for' && side !== 'against') return json({ error: 'Invalid side' }, 400);

  const viewer = await fidFromRequest(request);
  if (week === thisWeek && !(viewer && (await getEntry(redis, week, viewer)))) {
    return json({ error: 'Submit your own steel-man to see how others argued', locked: true }, 403);
  }

  const [ranked, shifts] = await Promise.all([
    topEntries(redis, week, side, GALLERY_SIZE * 2, viewer),
    shiftCounts(redis, week),
  ]);
  const profiles = await trustedProfiles(ranked.map((r) => r.entry.fid));
  const entries = ranked
    // Your own entry always shows to you; others need a trusted profile.
    .filter((r) => profiles.has(r.entry.fid) || r.entry.fid === viewer)
    .slice(0, GALLERY_SIZE)
    .map(({ entry, votes, voted }) => ({
      fid: entry.fid,
      username: profiles.get(entry.fid)?.username ?? null,
      pfpUrl: profiles.get(entry.fid)?.pfpUrl ?? null,
      text: entry.text,
      stance: entry.stance,
      shift: entry.shift,
      scores: { charity: entry.feedback.charity, strength: entry.feedback.strength, depth: entry.feedback.depth },
      total: totalScore(entry.feedback),
      votes,
      voted,
      mine: entry.fid === viewer,
    }));

  // Responses can depend on the viewer, so don't share them between users.
  return json({ week, side, entries, shifts }, 200, { 'Cache-Control': 'private, no-store' });
}
