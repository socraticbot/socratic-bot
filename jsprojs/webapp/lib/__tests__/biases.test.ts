import { describe, expect, it } from 'vitest';
import { BIASES, getBiasBySlug } from '@/lib/biases/data';
import { EXTRA_OPTION_NAMES } from '@/lib/biases/localized';
import { ROTATION_START, dayNumber, getBiasForDate, getBiasForDay, resolveDay } from '@/lib/biases/daily';
import { BIAS_URL, biasUrlForDay, miniAppEmbed, shareText } from '@/lib/biases/share';

describe('bias data', () => {
  const originals = BIASES.filter((b) => !b.reviewOf);
  const reviews = BIASES.filter((b) => b.reviewOf);

  it('has unique slugs, and unique names among non-review cards', () => {
    expect(new Set(BIASES.map((b) => b.slug)).size).toBe(BIASES.length);
    expect(new Set(originals.map((b) => b.name)).size).toBe(originals.length);
  });

  it('covers every day through 2026-11-30 without repeating', () => {
    const lastDay = dayNumber(new Date(Date.UTC(2026, 10, 30)));
    expect(BIASES.length).toBeGreaterThan(lastDay);
  });

  it('puts a review card on every 7th day', () => {
    BIASES.forEach((bias, day) => {
      expect(Boolean(bias.reviewOf)).toBe(day % 7 === 6);
    });
  });

  it.each(reviews)('$slug revisits a bias shown at least 6 days earlier, in a new scenario', (review) => {
    const day = BIASES.indexOf(review);
    const original = BIASES.findIndex((b) => b.slug === review.reviewOf);
    expect(original).toBeGreaterThanOrEqual(0);
    expect(day - original).toBeGreaterThanOrEqual(6);
    expect(review.name).toBe(BIASES[original].name);
    expect(review.scenario).not.toBe(BIASES[original].scenario);
  });

  it.each(reviews)('$slug only offers biases already seen as options', (review) => {
    const day = BIASES.indexOf(review);
    const seen = new Set(BIASES.slice(0, day).map((b) => b.name));
    review.options.forEach((option) => expect(seen.has(option)).toBe(true));
  });

  it.each(BIASES)('$slug has exactly one correct option among three distinct ones', (bias) => {
    expect(bias.options).toHaveLength(3);
    expect(new Set(bias.options).size).toBe(3);
    expect(bias.options.filter((o) => o === bias.name)).toHaveLength(1);
  });

  it.each(BIASES)('$slug only offers options that are real bias names', (bias) => {
    const names = new Set([...BIASES.map((b) => b.name), ...EXTRA_OPTION_NAMES]);
    bias.options.forEach((option) => expect(names.has(option)).toBe(true));
  });

  it.each(BIASES)('$slug scenario does not give away the answer', (bias) => {
    expect(bias.scenario.toLowerCase()).not.toContain(bias.name.toLowerCase());
  });

  it.each(BIASES)('$slug has all text fields filled in', (bias) => {
    for (const field of [bias.definition, bias.scenario, bias.explanation, bias.counterMove]) {
      expect(field.trim().length).toBeGreaterThan(10);
    }
  });

  it('does not put the correct answer in the same position every day', () => {
    const positions = new Set(BIASES.map((b) => b.options.indexOf(b.name)));
    expect(positions.size).toBe(3);
  });

  it('looks up by slug, including review cards', () => {
    expect(getBiasBySlug('anchoring-review')?.reviewOf).toBe('anchoring');
    expect(getBiasBySlug('anchoring')?.name).toBe('Anchoring');
    expect(getBiasBySlug('nope')).toBeUndefined();
  });
});

describe('daily rotation', () => {
  it('starts at the first bias on the rotation start date', () => {
    expect(dayNumber(new Date(ROTATION_START))).toBe(0);
    expect(getBiasForDate(new Date(ROTATION_START))).toBe(BIASES[0]);
  });

  it('gives everyone the same bias all UTC day', () => {
    const morning = new Date(Date.UTC(2026, 9, 21, 0, 0, 1));
    const night = new Date(Date.UTC(2026, 9, 21, 23, 59, 59));
    expect(getBiasForDate(morning)).toBe(getBiasForDate(night));
    expect(getBiasForDate(morning)).toBe(BIASES[1]);
  });

  it('wraps around after the last bias, and handles days before the start', () => {
    expect(getBiasForDay(BIASES.length)).toBe(BIASES[0]);
    expect(getBiasForDay(-1)).toBe(BIASES[BIASES.length - 1]);
  });
});

describe('requested day', () => {
  it('shows a requested past day', () => {
    expect(resolveDay('3', 10)).toBe(3);
    expect(resolveDay('10', 10)).toBe(10);
  });

  it('never shows a future day', () => {
    expect(resolveDay('11', 10)).toBe(10);
  });

  it('falls back to today on junk', () => {
    for (const junk of [undefined, '', '-1', '1.5', 'abc', '3; drop']) {
      expect(resolveDay(junk, 10)).toBe(10);
    }
  });
});

describe('sharing', () => {
  it('never names the bias in the share text', () => {
    BIASES.forEach((bias, day) => {
      expect(shareText(day)).not.toContain(bias.name);
    });
  });

  it('builds a valid fc:miniapp embed', () => {
    const embed = miniAppEmbed(3);
    expect(embed.version).toBe('1');
    expect(embed.button.title.length).toBeLessThanOrEqual(32);
    expect(embed.button.action.type).toBe('launch_miniapp');
    expect(embed.button.action.url).toBe(biasUrlForDay(3));
    expect(biasUrlForDay(3)).toBe(`${BIAS_URL}?day=3`);
    expect(embed.imageUrl).toMatch(/^https:\/\/www\.socratic\.bot\/api\/og\/today\?day=3$/);
    expect(JSON.stringify(embed).length).toBeLessThan(1024);
  });
});
