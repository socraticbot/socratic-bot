/**
 * Thin wrapper around the Farcaster Mini App SDK, loaded lazily so regular
 * web visitors don't pay for it. All Mini App calls go through this file.
 */

export const SITE_URL = 'https://www.socratic.bot';

async function loadSdk() {
  const { sdk } = await import('@farcaster/miniapp-sdk');
  return sdk;
}

export async function isInMiniApp(): Promise<boolean> {
  try {
    const sdk = await loadSdk();
    return await sdk.isInMiniApp();
  } catch {
    return false;
  }
}

/** Hide the host's splash screen. Without this, Mini App users see an endless loader. */
export async function signalReady(): Promise<void> {
  if (!(await isInMiniApp())) return;
  const sdk = await loadSdk();
  await sdk.actions.ready();
}

export async function composeCast(text: string, url: string): Promise<void> {
  const sdk = await loadSdk();
  await sdk.actions.composeCast({ text, embeds: [url] });
}

/** Web fallback: Farcaster's compose intent URL. */
export function composeIntentUrl(text: string, url: string): string {
  const params = new URLSearchParams({ text });
  params.append('embeds[]', url);
  return `https://farcaster.xyz/~/compose?${params.toString()}`;
}
