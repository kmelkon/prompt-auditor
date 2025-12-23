// DeepSeek API client (OpenAI-compatible)

import {
  AIProviderClient,
  AIProviderConfig,
  PROVIDER_CONFIGS,
  RephraseRequest,
  RephraseResponse,
  TestConnectionResult,
  REPHRASE_SYSTEM_PROMPT,
} from './types';

const API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  max_tokens?: number;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface DeepSeekError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

async function makeRequest(
  apiKey: string,
  body: DeepSeekRequest
): Promise<DeepSeekResponse> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error: DeepSeekError = await response.json();
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

export const deepseekClient: AIProviderClient = {
  config: PROVIDER_CONFIGS.deepseek as AIProviderConfig,

  async rephrase(request: RephraseRequest): Promise<RephraseResponse> {
    try {
      const response = await makeRequest(request.apiKey, {
        model: request.model,
        max_tokens: 2048,
        messages: [
          {
            role: 'system',
            content: REPHRASE_SYSTEM_PROMPT.trim(),
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
      });

      const rephrased = response.choices[0]?.message?.content?.trim();

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
      await makeRequest(apiKey, {
        model: 'deepseek-chat',
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
