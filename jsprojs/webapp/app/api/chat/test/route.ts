import { mistral } from '@ai-sdk/mistral';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get model from environment variable, default to mistral-large-latest
    const modelName = process.env.MISTRAL_MODEL || 'mistral/mistral-large-latest';

    // Generate text using Mistral via Vercel AI Gateway
    const result = await generateText({
      model: mistral(modelName),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    return NextResponse.json({
      text: result.text,
      usage: result.usage,
      model: modelName,
    });
  } catch (error) {
    console.error('Error generating text:', error);
    return NextResponse.json(
      { error: 'Failed to generate text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
