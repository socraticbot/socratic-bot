import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from './redis';

interface Limiters {
  perClient: Ratelimit;
  global: Ratelimit;
}

let limiters: { chat: Limiters; review: Limiters } | null | undefined;

function getLimiters() {
  if (limiters !== undefined) return limiters;
  const redis = getRedis();
  limiters = redis
    ? {
        chat: {
          // Generous enough for shared networks, low enough to stop scripted abuse.
          perClient: new Ratelimit({ redis, prefix: 'rl:chat:client', limiter: Ratelimit.slidingWindow(40, '10 m') }),
          // Hard ceiling on total model calls per day across everyone.
          global: new Ratelimit({ redis, prefix: 'rl:chat:global', limiter: Ratelimit.fixedWindow(3000, '1 d') }),
        },
        // Steel-man reviews are longer calls; a writer needs a few drafts a week, not dozens.
        review: {
          perClient: new Ratelimit({ redis, prefix: 'rl:sm:client', limiter: Ratelimit.slidingWindow(8, '1 h') }),
          global: new Ratelimit({ redis, prefix: 'rl:sm:global', limiter: Ratelimit.fixedWindow(1000, '1 d') }),
        },
      }
    : null;
  return limiters;
}

export function clientKey(request: Request): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

/** True if this chat request may go ahead. Always true when Redis isn't connected. */
export async function allowChat(request: Request): Promise<boolean> {
  return allow(request, 'chat');
}

/** True if this steel-man review may go ahead. Always true when Redis isn't connected. */
export async function allowReview(request: Request): Promise<boolean> {
  return allow(request, 'review');
}

async function allow(request: Request, kind: 'chat' | 'review'): Promise<boolean> {
  const l = getLimiters()?.[kind];
  if (!l) return true;
  const [client, global] = await Promise.all([l.perClient.limit(clientKey(request)), l.global.limit('all')]);
  return client.success && global.success;
}
