// Anthropic (Claude) API client

import {
  AIProviderClient,
  AIProviderConfig,
  PROVIDER_CONFIGS,
  RephraseRequest,
  RephraseResponse,
  TestConnectionResult,
  REPHRASE_SYSTEM_PROMPT,
} from './types';

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  system?: string;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicError {
  type: string;
  error: {
    type: string;
    message: string;
  };
}

async function makeRequest(
  apiKey: string,
  body: AnthropicRequest
): Promise<AnthropicResponse> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': API_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error: AnthropicError = await response.json();
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

export const anthropicClient: AIProviderClient = {
  config: PROVIDER_CONFIGS.anthropic as AIProviderConfig,

  async rephrase(request: RephraseRequest): Promise<RephraseResponse> {
    try {
      const response = await makeRequest(request.apiKey, {
        model: request.model,
        max_tokens: 2048,
        system: REPHRASE_SYSTEM_PROMPT.trim(),
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
      });

      const rephrased = response.content[0]?.text?.trim();

      if (!rephrased) {
        return {
          success: false,
          error: 'No response received from API',
        };
      }

      return {
        success: true,
        rephrased,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async testConnection(apiKey: string): Promise<TestConnectionResult> {
    try {
      // Make a minimal request to test the API key
      await makeRequest(apiKey, {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hi',
          },
        ],
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  },
};
