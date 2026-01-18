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
          // Step 1: Analyze the question (internal thought)
          const analyzeThought = `🔍 Step 1: Analyzing your question...\n\n"${prompt.substring(0, 150)}${prompt.length > 150 ? '...' : ''}"\n\n💭 What is the student really asking? What assumptions might they have?`;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thought', content: analyzeThought })}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for readability

          // Step 2: Formulate Socratic approach (internal thought)
          const approachThought = `🎯 Step 2: Formulating Socratic approach...\n\n📋 Strategy: Instead of giving a direct answer, I'll ask questions that help the student think deeper.\n\n💡 What questions will guide them to discover the answer themselves?`;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thought', content: approachThought })}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 500));

          // Step 3: Generate response with LLM
          const generatingThought = `🤖 Step 3: Generating response with ${selectedModel.name}...\n\n📤 Sending prompt to model...`;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thought', content: generatingThought })}\n\n`));

          // Use plain string - Vercel AI Gateway automatically routes when AI_GATEWAY_API_KEY is set
          const result = await streamText({
            model: modelName, // Plain string like 'mistral/mistral-large-latest'
            messages: [
              {
                role: 'system',
                content: 'You are a Socratic tutor. Instead of giving direct answers, ask thoughtful questions that guide the student to think deeper and discover answers themselves. Keep responses concise and focused on one question or thought at a time.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          });

          // Log generation ID for usage tracking (response is a Promise, await it if needed)
          let generationId: string | null = null;
          try {
            const response = await result.response;
            generationId = response?.id || null;
            if (generationId) {
              console.log(`[chat] Generation ID: ${generationId}, Model: ${modelName}`);
            }
          } catch (err) {
            // Generation ID is optional, continue without it
            console.log(`[chat] Could not get generation ID, Model: ${modelName}`);
          }

          // Stream the text response
          let hasText = false;
          for await (const textPart of result.textStream) {
            hasText = true;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: textPart })}\n\n`));
          }

          // If no text was streamed, there might be an issue
          if (!hasText) {
            console.error('[chat] No text was streamed from model');
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: 'No response received from model. Please try again.' })}\n\n`));
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
