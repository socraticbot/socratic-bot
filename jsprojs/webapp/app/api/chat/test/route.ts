import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { getMistralModel, getMistralModelName } from '@/lib/mistral';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate text using Mistral via Vercel AI Gateway
    const result = await generateText({
      model: getMistralModel(),
      prompt: prompt,
      temperature: 0.7,
    });

    return NextResponse.json({
      text: result.text,
      usage: result.usage,
      model: getMistralModelName(),
    });
  } catch (error) {
    console.error('Error generating text:', error);
    return NextResponse.json(
      { error: 'Failed to generate text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
