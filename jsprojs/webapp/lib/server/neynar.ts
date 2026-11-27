import { Configuration, NeynarAPIClient } from '@neynar/nodejs-sdk';

/** Accounts below this Neynar user score are kept off the public leaderboard (likely bots). */
export const MIN_USER_SCORE = 0.5;

export interface Profile {
  fid: number;
  username: string;
  pfpUrl: string | null;
}

let client: NeynarAPIClient | null | undefined;

function getClient(): NeynarAPIClient | null {
  if (client !== undefined) return client;
  const apiKey = process.env.NEYNAR_API_KEY;
  client = apiKey ? new NeynarAPIClient(new Configuration({ apiKey })) : null;
  return client;
}

export function isNeynarConfigured(): boolean {
  return getClient() !== null;
}

/** Profiles for `fids` that pass the bot filter, keyed by fid. Empty if Neynar isn't configured. */
export async function trustedProfiles(fids: number[]): Promise<Map<number, Profile>> {
  const neynar = getClient();
  const result = new Map<number, Profile>();
  if (!neynar || fids.length === 0) return result;
  const { users } = await neynar.fetchBulkUsers({ fids });
  for (const user of users) {
    if ((user.score ?? 0) < MIN_USER_SCORE) continue;
    result.set(user.fid, { fid: user.fid, username: user.username, pfpUrl: user.pfp_url ?? null });
  }
  return result;
}

export interface MiniAppNotification {
  title: string;
  body: string;
  target_url: string;
  uuid: string;
}

/** Neynar's own count of what happened to each target FID. */
export interface DeliveryResult {
  /** Delivered to the user's Farcaster client. */
  success: number;
  /** Farcaster rejected it (for example an invalid or revoked token). */
  failure: number;
  /** Not tried: usually the user has no notification token for this app (notifications off, or app not added). */
  notAttempted: number;
  /** Rate limited; safe to retry later. */
  retryable: number;
}

/**
 * Send `notification` to exactly `fids` (those with notifications enabled for the app).
 * Never calls Neynar with an empty list: that would send to every user.
 */
export async function sendNotification(fids: number[], notification: MiniAppNotification): Promise<DeliveryResult> {
  const neynar = getClient();
  if (!neynar) throw new Error('Neynar is not configured');
  if (fids.length === 0) return { success: 0, failure: 0, notAttempted: 0, retryable: 0 };
  const res = await neynar.publishFrameNotifications({ targetFids: fids, notification });
  return {
    success: res.success_count ?? 0,
    failure: res.failure_count ?? 0,
    notAttempted: res.not_attempted_count ?? 0,
    retryable: res.retryable_fids?.length ?? 0,
  };
}

/** A short, secret-free description of a failed Neynar call, for logs. */
export function describeNeynarError(error: unknown): string {
  const e = error as { response?: { status?: number; data?: { message?: unknown; code?: unknown } }; message?: unknown };
  const status = e?.response?.status;
  const detail = e?.response?.data?.message ?? e?.response?.data?.code ?? e?.message ?? String(error);
  return `${status ?? 'no status'}: ${String(detail).slice(0, 200)}`;
}
