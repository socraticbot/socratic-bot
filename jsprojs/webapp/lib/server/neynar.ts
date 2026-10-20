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
