import { describe, expect, it } from 'vitest';
import { arenaEmbed, arenaShareText, arenaUrlForWeek, steelmanCastText } from '@/lib/steelman/share';
import { TOPICS, claimFor, getTopicBySlug } from '@/lib/steelman/topics';
import { WEEK_START, getTopicForWeek, resolveWeek, sideToArgue, weekNumber } from '@/lib/steelman/weekly';
import { APP_DOMAIN } from '@/lib/server/auth';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('weekNumber', () => {
  it('is 0 for the whole first week and changes at UTC midnight on Monday', () => {
    expect(weekNumber(new Date(WEEK_START))).toBe(0);
    expect(weekNumber(new Date(WEEK_START + 7 * DAY_MS - 1))).toBe(0);
    expect(weekNumber(new Date(WEEK_START + 7 * DAY_MS))).toBe(1);
    expect(weekNumber(new Date(WEEK_START - 1))).toBe(-1);
  });

  it('starts on a Monday', () => {
    expect(new Date(WEEK_START).getUTCDay()).toBe(1);
  });
});

describe('resolveWeek', () => {
  it('allows past weeks and this week, never future weeks or junk', () => {
    expect(resolveWeek('2', 5)).toBe(2);
    expect(resolveWeek('5', 5)).toBe(5);
    expect(resolveWeek('6', 5)).toBe(5);
    expect(resolveWeek('-1', 5)).toBe(5);
    expect(resolveWeek('1e3', 5)).toBe(5);
    expect(resolveWeek(undefined, 5)).toBe(5);
  });
});

describe('topics', () => {
  it('cycles through every topic, including for negative weeks', () => {
    const seen = new Set(Array.from({ length: TOPICS.length }, (_, w) => getTopicForWeek(w).slug));
    expect(seen.size).toBe(TOPICS.length);
    expect(getTopicForWeek(TOPICS.length)).toBe(TOPICS[0]);
    expect(getTopicForWeek(-1)).toBe(TOPICS[TOPICS.length - 1]);
  });

  it('have unique slugs, both sides worded, and short enough claims for the share image', () => {
    expect(new Set(TOPICS.map((t) => t.slug)).size).toBe(TOPICS.length);
    for (const topic of TOPICS) {
      expect(getTopicBySlug(topic.slug)).toBe(topic);
      expect(topic.claim).not.toBe(topic.counter);
      expect(topic.claim.length).toBeLessThanOrEqual(90);
      expect(topic.counter.length).toBeLessThanOrEqual(90);
      expect(topic.context.length).toBeLessThanOrEqual(220);
    }
  });

  it('give each side its own claim', () => {
    const topic = TOPICS[0];
    expect(claimFor(topic, 'for')).toBe(topic.claim);
    expect(claimFor(topic, 'against')).toBe(topic.counter);
  });
});

describe('sideToArgue', () => {
  it('assigns the side the writer does not hold', () => {
    expect(sideToArgue('agree')).toBe('against');
    expect(sideToArgue('disagree')).toBe('for');
    expect(sideToArgue('unsure')).toBeNull();
  });
});

describe('share', () => {
  it('links to the shared week on the registered host, with a short enough button', () => {
    const embed = arenaEmbed(3);
    expect(new URL(embed.button.action.url).host).toBe(APP_DOMAIN);
    expect(embed.button.action.url).toBe(arenaUrlForWeek(3));
    expect(embed.button.title.length).toBeLessThanOrEqual(32);
    expect(new URL(embed.imageUrl).searchParams.get('week')).toBe('3');
  });

  it('numbers weeks from 1', () => {
    expect(arenaShareText(0)).toContain('#1');
  });

  it('starts a steel-man cast with the claim, leaving room to write', () => {
    const topic = TOPICS[0];
    const text = steelmanCastText(0, claimFor(topic, 'against'));
    expect(text).toContain('#1');
    expect(text).toContain(`"${topic.counter}"`);
    expect(text.endsWith('\n\n')).toBe(true);
    // Leaves most of a standard 320-byte cast for the argument itself.
    for (const t of TOPICS) {
      for (const claim of [t.claim, t.counter]) expect(new TextEncoder().encode(steelmanCastText(99, claim)).length).toBeLessThanOrEqual(130);
    }
  });
});
