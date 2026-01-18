import { getMistralModel } from '@/lib/mistral';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.AI_GATEWAY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI_GATEWAY_API_KEY is not configured. Please set it in .env.local' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stream text using Mistral via Vercel AI Gateway
    // Use string format "provider/model" - SDK automatically routes through gateway
    // CRITICAL: Use messages array format, not prompt string (matches votc implementation)
    const modelName = getMistralModel();
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    
    console.log('[chat] Streaming with model:', modelName);
    console.log('[chat] AI_GATEWAY_API_KEY set:', !!apiKey);
    
    const result = await streamText({
      model: modelName, // String format like "mistral/mistral-large-latest"
      messages: [{ role: 'user', content: prompt }], // Use messages array, not prompt string
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error streaming text:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to stream text', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
