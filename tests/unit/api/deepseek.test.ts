import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deepseekClient } from '../../../src/lib/api/deepseek';
import type { RephraseRequest } from '../../../src/lib/api/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('DeepSeek API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('config', () => {
    it('should have correct provider configuration', () => {
      expect(deepseekClient.config.name).toBe('deepseek');
      expect(deepseekClient.config.displayName).toBe('DeepSeek');
      expect(deepseekClient.config.defaultModel).toBe('deepseek-chat');
      expect(deepseekClient.config.models.length).toBeGreaterThan(0);
    });
  });

  describe('rephrase', () => {
    it('should successfully rephrase a prompt', async () => {
      const mockResponse = {
        id: 'test-id',
        object: 'chat.completion',
        created: 1234567890,
        model: 'deepseek-chat',
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
        model: 'deepseek-chat',
      };

      const result = await deepseekClient.rephrase(request);

      expect(result.success).toBe(true);
      expect(result.rephrased).toBe('Rephrased prompt here');
      expect(result.error).toBeUndefined();
    });

    it('should use correct API endpoint', async () => {
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
        model: 'deepseek-chat',
      };

      await deepseekClient.rephrase(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.deepseek.com/v1/chat/completions',
        expect.any(Object)
      );
    });

    it('should include correct headers with Bearer token', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Rephrased' } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key-123',
        model: 'deepseek-chat',
      };

      await deepseekClient.rephrase(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-key-123',
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
        model: 'deepseek-chat',
      };

      await deepseekClient.rephrase(request);

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.messages).toHaveLength(2);
      expect(requestBody.messages[0].role).toBe('system');
      expect(requestBody.messages[0].content).toContain('Prompt Auditor');
      expect(requestBody.messages[1].role).toBe('user');
      expect(requestBody.messages[1].content).toBe('Test prompt');
    });

    it('should use correct model from request', async () => {
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
        model: 'deepseek-coder',
      };

      await deepseekClient.rephrase(request);

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.model).toBe('deepseek-coder');
    });

    it('should set max_tokens to 2048', async () => {
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
        model: 'deepseek-chat',
      };

      await deepseekClient.rephrase(request);

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.max_tokens).toBe(2048);
    });

    it('should handle API errors', async () => {
      const mockError = {
        error: {
          message: 'Invalid API key provided',
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
        model: 'deepseek-chat',
      };

      const result = await deepseekClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key provided');
      expect(result.rephrased).toBeUndefined();
    });

    it('should handle empty choices', async () => {
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
        model: 'deepseek-chat',
      };

      const result = await deepseekClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No response received from API');
    });

    it('should handle network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Connection timeout')
      );

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'deepseek-chat',
      };

      const result = await deepseekClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timeout');
    });

    it('should trim whitespace from rephrased text', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '  \n\tRephrased content with whitespace\n  ',
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
        model: 'deepseek-chat',
      };

      const result = await deepseekClient.rephrase(request);

      expect(result.rephrased).toBe('Rephrased content with whitespace');
    });

    it('should handle rate limit errors', async () => {
      const mockError = {
        error: {
          message: 'Rate limit exceeded',
          type: 'rate_limit_error',
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => mockError,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'deepseek-chat',
      };

      const result = await deepseekClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded');
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

      const result = await deepseekClient.testConnection('valid-api-key');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should use deepseek-chat model and minimal tokens for testing', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Hi' } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await deepseekClient.testConnection('test-key');

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.model).toBe('deepseek-chat');
      expect(requestBody.max_tokens).toBe(10);
      expect(requestBody.messages).toHaveLength(1);
      expect(requestBody.messages[0].content).toBe('Hi');
    });

    it('should return error for invalid API key', async () => {
      const mockError = {
        error: {
          message: 'Incorrect API key',
          type: 'invalid_request_error',
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => mockError,
      });

      const result = await deepseekClient.testConnection('invalid-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Incorrect API key');
    });

    it('should handle connection failures', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      );

      const result = await deepseekClient.testConnection('test-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle server errors', async () => {
      const mockError = {
        error: {
          message: 'Internal server error',
          type: 'server_error',
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => mockError,
      });

      const result = await deepseekClient.testConnection('test-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
    });
  });
});
