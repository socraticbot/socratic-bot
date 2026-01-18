import { getMistralModel } from '@/lib/mistral';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

/**
 * API route that streams both the response AND internal thoughts.
 * Internal thoughts show what prompts are being sent to the LLM.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'AI_GATEWAY_API_KEY is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.AI_GATEWAY_API_KEY) {
      process.env.AI_GATEWAY_API_KEY = apiKey;
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const modelName = getMistralModel();

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Emit internal thought about what we're doing
        const thought = `🤔 Thinking about your question...\n\n💭 Prompt: ${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}\n\n📋 Generating response...`;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thought', content: thought })}\n\n`));

        try {
          const result = await streamText({
            model: modelName,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          });

          // Stream the text response
          for await (const textPart of result.textStream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: textPart })}\n\n`));
          }

          // Signal completion
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: errorMsg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in stream-thoughts:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to stream thoughts', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
