import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { getModelById, getDefaultModel } from '@/lib/models';

/**
 * API route that streams both the response AND internal thoughts.
 * Internal thoughts show what prompts are being sent to the LLM.
 * Uses Vercel AI Gateway - works with any model via AI_GATEWAY_API_KEY
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

    // CRITICAL: Ensure AI_GATEWAY_API_KEY is set in process.env
    if (!process.env.AI_GATEWAY_API_KEY) {
      process.env.AI_GATEWAY_API_KEY = apiKey;
    }

    const { prompt, modelId } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get model - use provided modelId or default
    const selectedModel = modelId ? getModelById(modelId) : getDefaultModel();
    if (!selectedModel) {
      return new Response(
        JSON.stringify({ error: `Invalid model ID: ${modelId}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const modelName = selectedModel.id; // e.g., 'mistral/mistral-large-latest'

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Emit internal thought about what we're doing
        const thought = `🤔 Thinking about your question with ${selectedModel.name}...\n\n💭 Prompt: ${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}\n\n📋 Generating response using ${selectedModel.provider}...`;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thought', content: thought })}\n\n`));

        try {
          // Use plain string - Vercel AI Gateway automatically routes when AI_GATEWAY_API_KEY is set
          const result = await streamText({
            model: modelName, // Plain string like 'mistral/mistral-large-latest'
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          });

          // Log generation ID for usage tracking (available in response metadata)
          // Generation IDs are included in chat completion responses as the 'id' field
          const generationId = result.response?.id;
          if (generationId) {
            console.log(`[chat] Generation ID: ${generationId}, Model: ${modelName}`);
          }

          // Stream the text response
          for await (const textPart of result.textStream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: textPart })}\n\n`));
          }

          // Signal completion with generation ID if available
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', generationId: generationId || null })}\n\n`));
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
