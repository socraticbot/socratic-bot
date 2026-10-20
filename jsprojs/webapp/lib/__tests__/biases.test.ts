import { describe, expect, it } from 'vitest';
import { BIASES, getBiasBySlug } from '@/lib/biases/data';
import { ROTATION_START, dayNumber, getBiasForDate, getBiasForDay } from '@/lib/biases/daily';
import { BIAS_URL, miniAppEmbed, shareText } from '@/lib/biases/share';

describe('bias data', () => {
  it('has unique slugs and names', () => {
    expect(new Set(BIASES.map((b) => b.slug)).size).toBe(BIASES.length);
    expect(new Set(BIASES.map((b) => b.name)).size).toBe(BIASES.length);
  });

  it.each(BIASES)('$slug has exactly one correct option among three distinct ones', (bias) => {
    expect(bias.options).toHaveLength(3);
    expect(new Set(bias.options).size).toBe(3);
    expect(bias.options.filter((o) => o === bias.name)).toHaveLength(1);
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

  it('looks up by slug', () => {
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
    expect(embed.button.action.url).toBe(BIAS_URL);
    expect(embed.imageUrl).toMatch(/^https:\/\/www\.socratic\.bot\/api\/og\/today\?day=3$/);
    expect(JSON.stringify(embed).length).toBeLessThan(1024);
  });
});
