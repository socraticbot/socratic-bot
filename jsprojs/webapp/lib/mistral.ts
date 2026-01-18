import { mistral } from '@ai-sdk/mistral';

/**
 * Get the Mistral model instance via Vercel AI Gateway
 * Uses the model specified in MISTRAL_MODEL env var, defaults to mistral-large-latest
 * 
 * For Vercel AI Gateway:
 * - Set VERCEL_AI_GATEWAY_API_KEY in .env.local
 * - The SDK will use the gateway automatically when the API key is set
 * 
 * Note: The dev server must be restarted after changing .env.local
 */
export function getMistralModel() {
  const modelName = process.env.MISTRAL_MODEL || 'mistral/mistral-large-latest';
  const gatewayApiKey = process.env.VERCEL_AI_GATEWAY_API_KEY;
  
  // If Vercel AI Gateway API key is set, configure for gateway
  if (gatewayApiKey) {
    return mistral(modelName, {
      baseURL: 'https://gateway.ai.cloud.vercel.com',
      apiKey: gatewayApiKey,
    });
  }
  
  // Fallback to direct Mistral API (requires MISTRAL_API_KEY env var)
  return mistral(modelName);
}

/**
 * Get the model name being used
 */
export function getMistralModelName(): string {
  return process.env.MISTRAL_MODEL || 'mistral/mistral-large-latest';
}
