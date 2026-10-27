import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTopicForWeek, resolveWeek, weekNumber } from '@/lib/steelman/weekly';

/** 3:2 share image for the Farcaster embed: the week's claim, framed as a challenge. */
export async function GET(request: NextRequest) {
  // Same rules as the page: past weeks or this week, never ahead.
  const week = resolveWeek(request.nextUrl.searchParams.get('week') ?? undefined, weekNumber(new Date()));
  const topic = getTopicForWeek(week);

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
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 6, color: '#888888', textTransform: 'uppercase' }}>
          {`Steel-Man Arena #${week + 1}`}
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.2, marginTop: 28 }}>{`“${topic.claim}”`}</div>
        <div style={{ fontSize: 36, lineHeight: 1.4, marginTop: 36, color: '#444444' }}>
          Disagree? Write the strongest case for it. Agree? Write the strongest case against.
        </div>
        <div style={{ fontSize: 28, marginTop: 'auto', color: '#888888' }}>socratic.bot</div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    }
  );
}
