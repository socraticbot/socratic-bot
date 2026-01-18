import { mistral } from '@ai-sdk/mistral';

/**
 * Get the Mistral model instance via Vercel AI Gateway
 * Uses the model specified in MISTRAL_MODEL env var, defaults to mistral-large-latest
 * For Vercel AI Gateway, we need to:
 * 1. Set baseURL to Vercel AI Gateway endpoint
 * 2. Use VERCEL_AI_GATEWAY_API_KEY as the API key
 * Note: The dev server must be restarted after changing .env.local
 */
export function getMistralModel() {
  const modelName = process.env.MISTRAL_MODEL || 'mistral/mistral-large-latest';
  const apiKey = process.env.VERCEL_AI_GATEWAY_API_KEY;
  
  // For Vercel AI Gateway, use the gateway endpoint and API key
  if (apiKey) {
    return mistral(modelName, {
      baseURL: 'https://gateway.ai.cloud.vercel.com/v1',
      apiKey: apiKey,
    });
  }
  
  // Fallback to direct Mistral API (requires MISTRAL_API_KEY)
  return mistral(modelName);
}

/**
 * Get the model name being used
 */
export function getMistralModelName(): string {
  return process.env.MISTRAL_MODEL || 'mistral/mistral-large-latest';
}
