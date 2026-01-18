import { mistral } from '@ai-sdk/mistral';

/**
 * Get the Mistral model instance
 * Uses the model specified in MISTRAL_MODEL env var, defaults to mistral-large-latest
 */
export function getMistralModel() {
  const modelName = process.env.MISTRAL_MODEL || 'mistral/mistral-large-latest';
  return mistral(modelName);
}

/**
 * Get the model name being used
 */
export function getMistralModelName(): string {
  return process.env.MISTRAL_MODEL || 'mistral/mistral-large-latest';
}
