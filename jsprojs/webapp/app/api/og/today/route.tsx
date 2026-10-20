import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { dayNumber, getBiasForDay, resolveDay } from '@/lib/biases/daily';

/** 3:2 share image for the Farcaster embed. Shows the question, never the answer. */
export async function GET(request: NextRequest) {
  // Same rule as the page: past days or today, never ahead.
  const day = resolveDay(request.nextUrl.searchParams.get('day') ?? undefined, dayNumber(new Date()));
  const bias = getBiasForDay(day);

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
          {`Bias of the day #${day + 1}${bias.reviewOf ? ' · Review' : ''}`}
        </div>
        <div style={{ fontSize: 76, marginTop: 20 }}>Can you spot it?</div>
        <div style={{ fontSize: 38, lineHeight: 1.4, marginTop: 36, color: '#333333' }}>{bias.scenario}</div>
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
