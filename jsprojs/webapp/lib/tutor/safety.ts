/**
 * Deterministic crisis check, run before any model call. Models can mistake
 * statements like "nobody would miss me" for beliefs to question, so obvious
 * crisis language never reaches the Socratic prompt.
 *
 * This is a floor, not a classifier: the system prompt also carries safety
 * rules for wording these patterns miss.
 */

const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid/i,
  /\bkill(ing)?\s+my\s?self\b/i,
  /\bend(ing)?\s+(it\s+all|my\s+life|things)\b/i,
  /\btake\s+my\s+(own\s+)?life\b/i,
  /\b(want|wanna|wish)\s+(to\s+)?(die|be\s+dead|disappear\s+forever)\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive|exist|wake\s+up)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(live|living|going\s+on)\b/i,
  /\b(nobody|no\s+one|noone)\s+(would|will)\s+(miss|care|notice)\b/i,
  /\b(better|easier)\s+off\s+(without\s+me|dead|if\s+i\s+(was|were)\s+gone)\b/i,
  /\b(self[-\s]?harm|hurt(ing)?\s+my\s?self|cut(ting)?\s+my\s?self)\b/i,
  /\b(being|getting)\s+(abused|hit|beaten)\b/i,
];

export const CRISIS_REPLY =
  "I'm really sorry you're feeling this way, and I'm glad you said something. " +
  "I'm an AI tutor, so I'm not the right support for this, but you don't have to go through it alone. " +
  'You can find free, confidential help in your country at findahelpline.com, ' +
  "or contact local emergency services if you're in danger right now. " +
  "If you'd like to talk about something else later, I'll be here.";

export function isCrisisMessage(text: string): boolean {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}
