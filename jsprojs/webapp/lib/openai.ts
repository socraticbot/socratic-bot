import { openai } from '@ai-sdk/openai';

/**
 * Get the OpenAI model instance
 * Uses the model specified in OPENAI_MODEL env var, defaults to gpt-4
 * 
 * Requires OPENAI_API_KEY to be set in .env.local
 */
export function getOpenAIModel() {
  const modelName = process.env.OPENAI_MODEL || 'gpt-4';
  return openai(modelName);
}

/**
 * Get the model name being used
 */
export function getOpenAIModelName(): string {
  return process.env.OPENAI_MODEL || 'gpt-4';
}
