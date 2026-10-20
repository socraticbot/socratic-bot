/**
 * Translated text for one card. Keys in a locale file are card slugs from
 * lib/biases/data.ts. Rules (enforced by lib/__tests__/locales.test.ts):
 * - `options` keeps the English order, and each option is that locale's
 *   `name` for the bias the English option names.
 * - Review cards (slugs ending in -review) reuse the original card's `name`,
 *   `definition` and `counterMove` text.
 * - `scenario` must not contain the card's own `name`.
 */
export interface CardText {
  name: string;
  definition: string;
  scenario: string;
  options: string[];
  explanation: string;
  counterMove: string;
}

export type LocaleCards = Record<string, CardText>;
