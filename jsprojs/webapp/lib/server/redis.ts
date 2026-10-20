import { Redis } from '@upstash/redis';

let client: Redis | null | undefined;

/**
 * Upstash Redis from the Vercel Marketplace integration, or null when it isn't
 * connected. Features that need storage (streaks, leaderboard, rate limits)
 * switch themselves off instead of failing.
 */
export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const configured =
    (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
    (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN);
  client = configured ? Redis.fromEnv() : null;
  return client;
}
