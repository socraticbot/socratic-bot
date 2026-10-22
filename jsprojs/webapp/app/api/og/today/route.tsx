import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { dayNumber, getBiasForDay, resolveDay } from '@/lib/biases/daily';
import { localizeBias } from '@/lib/biases/localized';
import { Locale, resolveLocale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/ui';

/**
 * The default `next/og` font is Latin-only, so for Chinese and Russian we
 * fetch just the characters we need from Google Fonts. Falls back to the
 * default font if the fetch fails.
 */
const FONTS: Partial<Record<Locale, string>> = { zh: 'Noto Sans SC', ru: 'Noto Serif' };

async function loadFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@400&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    return await (await fetch(src)).arrayBuffer();
  } catch {
    return null;
  }
}

/** 3:2 share image for the Farcaster embed. Shows the question, never the answer. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  // Same rules as the page: past days or today, never ahead; `?lang=` or English.
  const day = resolveDay(params.get('day') ?? undefined, dayNumber(new Date()));
  const locale = resolveLocale(params.get('lang'));
  const bias = localizeBias(getBiasForDay(day), locale);

  const label = `${t(locale, 'cardLabel', { n: day + 1 })}${bias.reviewOf ? ` · ${t(locale, 'review')}` : ''}`;
  const heading = t(locale, 'heading');
  const family = FONTS[locale];
  const font = family ? await loadFont(family, `${label}${heading}${bias.scenario}socratic.bot`) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 88px',
          background: '#FDFBF9',
          color: '#111111',
          fontFamily: font ? family : 'serif',
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: locale === 'zh' ? 2 : 6, color: '#888888', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontSize: 76, marginTop: 20 }}>{heading}</div>
        <div style={{ fontSize: 38, lineHeight: 1.4, marginTop: 36, color: '#333333' }}>{bias.scenario}</div>
        <div style={{ fontSize: 28, marginTop: 'auto', color: '#888888' }}>socratic.bot</div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
      fonts: font ? [{ name: family!, data: font, weight: 400, style: 'normal' }] : undefined,
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    }
  );
}
