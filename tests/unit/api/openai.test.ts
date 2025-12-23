import { describe, it, expect, beforeEach, vi } from 'vitest';
import { openaiClient } from '../../../src/lib/api/openai';
import type { RephraseRequest } from '../../../src/lib/api/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('OpenAI API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('config', () => {
    it('should have correct provider configuration', () => {
      expect(openaiClient.config.name).toBe('openai');
      expect(openaiClient.config.displayName).toBe('OpenAI');
      expect(openaiClient.config.defaultModel).toBe('gpt-4o');
      expect(openaiClient.config.models.length).toBeGreaterThan(0);
    });
  });

  describe('rephrase', () => {
    it('should successfully rephrase a prompt', async () => {
      const mockResponse = {
        id: 'test-id',
        object: 'chat.completion',
        created: 1234567890,
        model: 'gpt-4o',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Rephrased prompt here',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Original prompt',
        apiKey: 'test-api-key',
        model: 'gpt-4o',
      };

      const result = await openaiClient.rephrase(request);

      expect(result.success).toBe(true);
      expect(result.rephrased).toBe('Rephrased prompt here');
      expect(result.error).toBeUndefined();
    });

    it('should include correct headers in request', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Rephrased' } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'gpt-4o',
      };

      await openaiClient.rephrase(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-key',
          }),
        })
      );
    });

    it('should send system and user messages', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Rephrased' } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test prompt',
        apiKey: 'test-key',
        model: 'gpt-4o',
      };

      await openaiClient.rephrase(request);

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.messages).toHaveLength(2);
      expect(requestBody.messages[0].role).toBe('system');
      expect(requestBody.messages[1].role).toBe('user');
      expect(requestBody.messages[1].content).toBe('Test prompt');
    });

    it('should handle API errors', async () => {
      const mockError = {
        error: {
          message: 'Incorrect API key provided',
          type: 'invalid_request_error',
          code: 'invalid_api_key',
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => mockError,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'invalid-key',
        model: 'gpt-4o',
      };

      const result = await openaiClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Incorrect API key provided');
      expect(result.rephrased).toBeUndefined();
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        choices: [],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'gpt-4o',
      };

      const result = await openaiClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No response received from API');
    });

    it('should handle network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network connection failed')
      );

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'gpt-4o',
      };

      const result = await openaiClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network connection failed');
    });

    it('should trim whitespace from rephrased text', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '  \nRephrased with whitespace\t  ',
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'gpt-4o',
      };

      const result = await openaiClient.rephrase(request);

      expect(result.rephrased).toBe('Rephrased with whitespace');
    });

    it('should use max_tokens configuration', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Rephrased' } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'gpt-4o',
      };

      await openaiClient.rephrase(request);

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.max_tokens).toBe(2048);
    });
  });

  describe('testConnection', () => {
    it('should return success for valid API key', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Hi' } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await openaiClient.testConnection('valid-api-key');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should use lightweight model for testing', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Hi' } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await openaiClient.testConnection('test-key');

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.model).toBe('gpt-4o-mini');
      expect(requestBody.max_tokens).toBe(10);
    });

    it('should return error for invalid API key', async () => {
      const mockError = {
        error: {
          message: 'Invalid API key',
          type: 'invalid_request_error',
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => mockError,
      });

      const result = await openaiClient.testConnection('invalid-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('should handle connection failures', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Connection timeout')
      );

      const result = await openaiClient.testConnection('test-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timeout');
    });
  });
});
