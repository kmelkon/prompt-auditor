// Unified API interface for all providers

import type { AIProvider } from '../storage';
import { anthropicClient } from './anthropic';
import { openaiClient } from './openai';
import { geminiClient } from './gemini';
import { deepseekClient } from './deepseek';
import type {
  AIProviderClient,
  RephraseRequest,
  RephraseResponse,
  TestConnectionResult,
  AIProviderConfig,
} from './types';
import { PROVIDER_CONFIGS } from './types';

// Provider registry - all providers implemented
const providers: Record<AIProvider, AIProviderClient> = {
  anthropic: anthropicClient,
  openai: openaiClient,
  gemini: geminiClient,
  deepseek: deepseekClient,
};

export function getProviderClient(provider: AIProvider): AIProviderClient | null {
  return providers[provider];
}

export function getProviderConfig(provider: AIProvider): AIProviderConfig {
  return PROVIDER_CONFIGS[provider];
}

export function getAllProviderConfigs(): AIProviderConfig[] {
  return Object.values(PROVIDER_CONFIGS);
}

export function isProviderImplemented(provider: AIProvider): boolean {
  return providers[provider] !== null;
}

export async function rephrase(
  provider: AIProvider,
  request: RephraseRequest
): Promise<RephraseResponse> {
  const client = getProviderClient(provider);

  if (!client) {
    return {
      success: false,
      error: `Provider ${provider} is not yet implemented`,
    };
  }

  return client.rephrase(request);
}

export async function testConnection(
  provider: AIProvider,
  apiKey: string
): Promise<TestConnectionResult> {
  const client = getProviderClient(provider);

  if (!client) {
    return {
      success: false,
      error: `Provider ${provider} is not yet implemented`,
    };
  }

  return client.testConnection(apiKey);
}

// Re-export types
export type { RephraseRequest, RephraseResponse, TestConnectionResult, AIProviderConfig };
export { PROVIDER_CONFIGS };
