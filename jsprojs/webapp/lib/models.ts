/**
 * Available models for the Socratic Tutor
 * All models use Vercel AI Gateway (one API key for all)
 */

export interface TutorModel {
  id: string; // Model identifier (e.g., 'mistral/mistral-large-latest')
  name: string; // Display name (e.g., 'Mistral Large')
  provider: string; // Provider name (e.g., 'Mistral')
  description?: string; // Optional description
}

export const AVAILABLE_MODELS: TutorModel[] = [
  {
    id: 'mistral/mistral-large-latest',
    name: 'Mistral Large',
    provider: 'Mistral',
    description: 'Powerful reasoning and instruction following',
  },
  {
    id: 'mistral/devstral-2',
    name: 'Devstral 2',
    provider: 'Mistral',
    description: 'Fast and efficient for quick responses',
  },
  {
    id: 'openai/gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Deep reasoning and nuanced understanding',
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Faster GPT-4 with extended context',
  },
  {
    id: 'anthropic/claude-3-5-sonnet-20241022',
    name: 'Claude Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and speed',
  },
  {
    id: 'anthropic/claude-3-opus-20240229',
    name: 'Claude Opus',
    provider: 'Anthropic',
    description: 'Most capable for complex reasoning',
  },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0]; // Mistral Large

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
