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
    id: 'meta/llama-3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    description: 'Efficient and capable open-source model',
  },
  {
    id: 'mistral/devstral-2',
    name: 'Devstral 2',
    provider: 'Mistral',
    description: 'Fast and efficient for quick responses',
  },
  {
    id: 'openai/gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'OpenAI',
    description: 'Compact and fast GPT-5 variant',
  },
  {
    id: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    provider: 'Anthropic',
    description: 'Most capable for complex reasoning',
  },
  {
    id: 'xai/grok-4.1-fast-reasoning',
    name: 'Grok 4.1 Fast Reasoning',
    provider: 'xAI',
    description: 'Fast reasoning with deep understanding',
  },
  {
    id: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'DeepSeek',
    description: 'Advanced reasoning and code capabilities',
  },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0]; // Llama 3.1 8B

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
