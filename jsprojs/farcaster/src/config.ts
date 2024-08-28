import { z } from 'zod';

const Config = z.object({
  // TODO: Actually parse this  correctly
  BANNED_USER_IDS: z.array(z.coerce.number()).optional().default([]),
  CHATSERVER_API_URL: z.string().url(),
  CHATSERVER_API_KEY: z.string().min(1),
  FID: z.coerce.number(),
  NEYNAR_API_KEY: z.string(),
  NEYNAR_SIGNER_UUID: z.string(),
});

export const config = Config.parse(process.env);
