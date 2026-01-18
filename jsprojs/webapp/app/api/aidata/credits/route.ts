import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to fetch AI Gateway credit balance
 * GET /api/aidata/credits
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI_GATEWAY_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://ai-gateway.vercel.sh/v1/credits', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch credits: ${errorText}` },
        { status: response.status }
      );
    }

    const credits = await response.json();
    return NextResponse.json(credits);
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch credits', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
