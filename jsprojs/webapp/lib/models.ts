/**
 * Available models for the Socratic Tutor
 * All models use Vercel AI Gateway (one API key for all).
 *
 * Every model here must have `no_training: "all"` in the AI Gateway catalog
 * (https://ai-gateway.vercel.sh/v1/models), so conversations are never used
 * for training by the providers we route to, and must be available on the
 * AI Gateway free tier (other models return 403 on a free-tier account).
 * The server only accepts ids from this list.
 */

export interface TutorModel {
  id: string; // Model identifier (e.g., 'mistral/mistral-large-3')
  name: string; // Display name
  provider: string; // Provider name
  description?: string; // Optional description
  avatar: string; // Avatar image path (e.g., '/sochat1.png')
  referenceUrl?: string; // Reference article/documentation URL
}

export const AVAILABLE_MODELS: TutorModel[] = [
  {
    id: 'mistral/mistral-large-3',
    name: 'Mistral Large 3',
    provider: 'Mistral',
    description: 'Open-weight model from Mistral',
    avatar: '/sochat2.png',
    referenceUrl: 'https://mistral.ai/',
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Fast general-purpose model',
    avatar: '/sochat5.png',
    referenceUrl: 'https://deepmind.google/technologies/gemini/',
  },
  {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 mini',
    provider: 'OpenAI',
    description: 'Compact GPT-5 variant',
    avatar: '/sochat3.png',
    referenceUrl: 'https://openai.com/index/gpt-5/',
  },
  {
    id: 'meta/llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    description: 'Open-weight model from Meta',
    avatar: '/sochat1.png',
    referenceUrl: 'https://www.llama.com/',
  },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0];

/**
 * Get model by ID
 */
export function getModelById(id: string): TutorModel | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}

/**
 * Get default model
 */
export function getDefaultModel(): TutorModel {
  return DEFAULT_MODEL;
}
