import { createHash } from 'node:crypto';
import { biasUrlForDay } from '@/lib/biases/share';
import { Locale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/ui';

/** Farcaster limits: title 1 to 32 characters, body 1 to 128. */
export const MAX_TITLE = 32;
export const MAX_BODY = 128;

/** Neynar accepts up to 100 target FIDs per call. */
export const MAX_TARGETS = 100;

export interface ReminderNotification {
  title: string;
  body: string;
  target_url: string;
  uuid: string;
}

// RFC 4122 URL namespace.
const URL_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

/** UUIDv5 (SHA-1, name-based): the same name always gives the same id. */
export function uuidV5(name: string, namespace: string = URL_NAMESPACE): string {
  const ns = Buffer.from(namespace.replace(/-/g, ''), 'hex');
  const bytes = createHash('sha1').update(ns).update(name, 'utf8').digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * The daily reminder for one language. `uuid` is the idempotency key: a retried
 * cron run reuses it, so nobody gets the same reminder twice.
 */
export function buildReminder(day: number, locale: Locale): ReminderNotification {
  const target_url = biasUrlForDay(day, locale);
  return {
    title: t(locale, 'reminderTitle'),
    body: t(locale, 'reminderBody'),
    target_url,
    uuid: uuidV5(`${target_url}#reminder`),
  };
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
