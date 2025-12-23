// Google Gemini API client

import {
  AIProviderClient,
  AIProviderConfig,
  PROVIDER_CONFIGS,
  RephraseRequest,
  RephraseResponse,
  TestConnectionResult,
  REPHRASE_SYSTEM_PROMPT,
} from './types';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiContent {
  parts: Array<{ text: string }>;
  role?: string;
}

interface GeminiRequest {
  contents: GeminiContent[];
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: {
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface GeminiError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

async function makeRequest(
  apiKey: string,
  model: string,
  body: GeminiRequest
): Promise<GeminiResponse> {
  const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error: GeminiError = await response.json();
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

export const geminiClient: AIProviderClient = {
  config: PROVIDER_CONFIGS.gemini as AIProviderConfig,

  async rephrase(request: RephraseRequest): Promise<RephraseResponse> {
    try {
      const response = await makeRequest(request.apiKey, request.model, {
        systemInstruction: {
          parts: [{ text: REPHRASE_SYSTEM_PROMPT.trim() }],
        },
        contents: [
          {
            parts: [{ text: request.prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2048,
        },
      });

      const rephrased = response.candidates[0]?.content?.parts[0]?.text?.trim();

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
      await makeRequest(apiKey, 'gemini-2.0-flash', {
        contents: [
          {
            parts: [{ text: 'Hi' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 10,
        },
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
