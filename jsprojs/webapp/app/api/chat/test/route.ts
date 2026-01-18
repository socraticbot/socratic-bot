import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { getMistralModel, getMistralModelName } from '@/lib/mistral';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured (AI_GATEWAY_API_KEY, not VERCEL_AI_GATEWAY_API_KEY)
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI_GATEWAY_API_KEY is not configured. Please set it in .env.local' },
        { status: 500 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate text using Mistral via Vercel AI Gateway
    // Use string format "provider/model" - SDK automatically routes through gateway
    // when AI_GATEWAY_API_KEY is set in environment
    const modelName = getMistralModel();
    const result = await generateText({
      model: modelName, // String format like "mistral/mistral-large-latest"
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for common errors
    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      return NextResponse.json(
        { error: 'API key not configured. Please set AI_GATEWAY_API_KEY in .env.local', details: errorMessage },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate text', details: errorMessage },
      { status: 500 }
    );
  }
}
