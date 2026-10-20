'use client';

import { useEffect } from 'react';
import { signalReady } from '@/lib/miniapp';

/** Tells the Farcaster client the app has loaded. Renders nothing. */
export default function MiniAppReady() {
  useEffect(() => {
    signalReady().catch(() => {
      // Not in a Mini App, or the host is unavailable: nothing to do.
    });
  }, []);
  return null;
}
