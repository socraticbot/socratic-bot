import { createClient } from '@farcaster/quick-auth';

const quickAuth = createClient();

/** Must match the domain in public/.well-known/farcaster.json. */
export const APP_DOMAIN = 'www.socratic.bot';

/** The verified Farcaster ID from a Quick Auth bearer token, or null. */
export async function fidFromRequest(request: Request): Promise<number | null> {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const payload = await quickAuth.verifyJwt({ token: header.slice(7), domain: APP_DOMAIN });
    return typeof payload.sub === 'number' ? payload.sub : null;
  } catch {
    return null;
  }
}
