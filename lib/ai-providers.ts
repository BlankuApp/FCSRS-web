import { AIProvider, AIProviderConfig } from './types';

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    displayName: 'OpenAI',
    models: [
      { id: 'gpt-5.2', name: 'GPT-5.2' },
      { id: 'gpt-5-mini', name: 'GPT-5 Mini' },
      { id: 'gpt-5-nano', name: 'GPT-5 Nano' },
      { id: 'gpt-4.1', name: 'GPT-4.1' },
    ],
  },
  google: {
    displayName: 'Google',
    models: [
      { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro' },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
    ],
  },
  xai: {
    displayName: 'xAI',
    models: [
      { id: 'grok-4-1-fast-reasoning', name: 'Grok 4.1 Fast Reasoning' },
      { id: 'grok-4-1-fast-non-reasoning', name: 'Grok 4.1 Fast Non-Reasoning' },
    ],
  },
  anthropic: {
    displayName: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5' },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5' },
      { id: 'claude-opus-4-5', name: 'Claude Opus 4.5' },
    ],
  },
};

export const DEFAULT_PROVIDER: AIProvider = 'openai';
export const DEFAULT_MODEL = 'gpt-5-mini';

export function getDefaultModel(provider: AIProvider): string {
  const providerConfig = AI_PROVIDERS[provider];
  return providerConfig.models[0]?.id || '';
}

export function getProviderDisplayName(provider: AIProvider): string {
  return AI_PROVIDERS[provider]?.displayName || provider;
}
