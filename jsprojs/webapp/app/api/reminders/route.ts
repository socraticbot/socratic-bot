import { z } from 'zod';
import { LOCALES } from '@/lib/i18n/locales';
import { fidFromRequest } from '@/lib/server/auth';
import { json, notConfigured, unauthorized } from '@/lib/server/http';
import { setReminder } from '@/lib/server/reminders';
import { getRedis } from '@/lib/server/redis';

const bodySchema = z.object({ enabled: z.boolean(), locale: z.enum(LOCALES) });

/** Opt the signed-in user in to (or out of) a daily reminder, in their current language. */
export async function POST(request: Request) {
  const redis = getRedis();
  if (!redis) return notConfigured();
  const fid = await fidFromRequest(request);
  if (!fid) return unauthorized();

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid request' }, 400);

  const { enabled, locale } = parsed.data;
  await setReminder(redis, fid, enabled ? locale : null);
  return json({ reminders: enabled ? locale : null });
}
