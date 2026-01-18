import { mistral } from '@ai-sdk/mistral';

/**
 * Get the Mistral model instance
 * Uses the model specified in MISTRAL_MODEL env var, defaults to mistral-large-latest
 * The Vercel AI SDK automatically uses VERCEL_AI_GATEWAY_API_KEY from environment
 */
export function getMistralModel() {
  const modelName = process.env.MISTRAL_MODEL || 'mistral/mistral-large-latest';
  const apiKey = process.env.VERCEL_AI_GATEWAY_API_KEY;
  
  // Pass API key explicitly if provided
  if (apiKey) {
    return mistral(modelName, {
      apiKey: apiKey,
    });
  }
  
  return mistral(modelName);
}

/**
 * Get the model name being used
 */
export function getMistralModelName(): string {
  return process.env.MISTRAL_MODEL || 'mistral/mistral-large-latest';
}
