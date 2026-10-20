export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export const notConfigured = () => json({ error: 'Streaks are not available yet' }, 503);
export const unauthorized = () => json({ error: 'Sign in with Farcaster to keep a streak' }, 401);
