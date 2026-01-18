import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to fetch AI Gateway generation details
 * GET /api/aidata/generation?id={generation_id}
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

    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get('id');

    if (!generationId) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://ai-gateway.vercel.sh/v1/generation?id=${encodeURIComponent(generationId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch generation: ${errorText}` },
        { status: response.status }
      );
    }

    const generation = await response.json();
    return NextResponse.json(generation);
  } catch (error) {
    console.error('Error fetching generation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch generation', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
