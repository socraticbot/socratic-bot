/**
 * Get the Mistral model name for Vercel AI Gateway
 * Uses the model specified in MISTRAL_MODEL env var, defaults to mistral-large-latest
 * 
 * For Vercel AI Gateway:
 * - Set AI_GATEWAY_API_KEY in .env.local (not VERCEL_AI_GATEWAY_API_KEY)
 * - Use string format "provider/model" - SDK automatically routes through gateway
 * - The SDK reads AI_GATEWAY_API_KEY automatically when using string model names
 * 
 * Note: The dev server must be restarted after changing .env.local
 */
export function getMistralModel(): string {
  return process.env.MISTRAL_MODEL || 'mistral/mistral-large-latest';
}

/**
 * Get the model name being used (alias for getMistralModel)
 */
export function getMistralModelName(): string {
  return getMistralModel();
}
