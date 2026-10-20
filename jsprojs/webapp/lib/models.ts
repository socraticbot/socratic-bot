/**
 * Available models for the Socratic Tutor
 * All models use Vercel AI Gateway (one API key for all).
 *
 * Every model here must have `no_training: "all"` in the AI Gateway catalog
 * (https://ai-gateway.vercel.sh/v1/models), so conversations are never used
 * for training by the providers we route to. The server only accepts ids
 * from this list.
 */

export interface TutorModel {
  id: string; // Model identifier (e.g., 'anthropic/claude-haiku-5.5')
  name: string; // Display name
  provider: string; // Provider name
  description?: string; // Optional description
  avatar: string; // Avatar image path (e.g., '/sochat1.png')
  referenceUrl?: string; // Reference article/documentation URL
}

export const AVAILABLE_MODELS: TutorModel[] = [
  {
    id: 'anthropic/claude-haiku-5.5',
    name: 'Claude Haiku 5.5',
    provider: 'Anthropic',
    description: 'Fast, low-cost reasoning model',
    avatar: '/sochat4.png',
    referenceUrl: 'https://www.anthropic.com/claude',
  },
  {
    id: 'openai/gpt-6-luna',
    name: 'GPT-6 Luna',
    provider: 'OpenAI',
    description: 'Efficient reasoning model',
    avatar: '/sochat3.png',
    referenceUrl: 'https://openai.com/',
  },
  {
    id: 'google/gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    provider: 'Google',
    description: 'High-volume workhorse model',
    avatar: '/sochat5.png',
    referenceUrl: 'https://deepmind.google/technologies/gemini/',
  },
  {
    id: 'mistral/mistral-large-4',
    name: 'Mistral Large 4',
    provider: 'Mistral',
    description: 'Open-weight multimodal model',
    avatar: '/sochat2.png',
    referenceUrl: 'https://mistral.ai/',
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
