import { describe, it, expect, beforeEach, vi } from 'vitest';
import { anthropicClient } from '../../../src/lib/api/anthropic';
import type { RephraseRequest } from '../../../src/lib/api/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('Anthropic API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('config', () => {
    it('should have correct provider configuration', () => {
      expect(anthropicClient.config.name).toBe('anthropic');
      expect(anthropicClient.config.displayName).toBe('Claude (Anthropic)');
      expect(anthropicClient.config.defaultModel).toBe('claude-sonnet-4-20250514');
      expect(anthropicClient.config.models.length).toBeGreaterThan(0);
    });
  });

  describe('rephrase', () => {
    it('should successfully rephrase a prompt', async () => {
      const mockResponse = {
        id: 'test-id',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Rephrased prompt here' }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 100, output_tokens: 50 },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Original prompt',
        apiKey: 'test-api-key',
        model: 'claude-sonnet-4-20250514',
      };

      const result = await anthropicClient.rephrase(request);

      expect(result.success).toBe(true);
      expect(result.rephrased).toBe('Rephrased prompt here');
      expect(result.error).toBeUndefined();
    });

    it('should include correct headers in request', async () => {
      const mockResponse = {
        content: [{ text: 'Rephrased' }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'claude-sonnet-4-20250514',
      };

      await anthropicClient.rephrase(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'test-key',
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      const mockError = {
        type: 'error',
        error: {
          type: 'invalid_request_error',
          message: 'Invalid API key',
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
        model: 'claude-sonnet-4-20250514',
      };

      const result = await anthropicClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
      expect(result.rephrased).toBeUndefined();
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        content: [],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'claude-sonnet-4-20250514',
      };

      const result = await anthropicClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No response received from API');
    });

    it('should handle network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      );

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'claude-sonnet-4-20250514',
      };

      const result = await anthropicClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should trim whitespace from rephrased text', async () => {
      const mockResponse = {
        content: [{ text: '  Rephrased with spaces  \n' }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'claude-sonnet-4-20250514',
      };

      const result = await anthropicClient.rephrase(request);

      expect(result.rephrased).toBe('Rephrased with spaces');
    });
  });

  describe('testConnection', () => {
    it('should return success for valid API key', async () => {
      const mockResponse = {
        content: [{ text: 'Hi' }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await anthropicClient.testConnection('valid-api-key');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should use lightweight model for testing', async () => {
      const mockResponse = {
        content: [{ text: 'Hi' }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await anthropicClient.testConnection('test-key');

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.model).toBe('claude-3-5-haiku-20241022');
      expect(requestBody.max_tokens).toBe(10);
    });

    it('should return error for invalid API key', async () => {
      const mockError = {
        error: {
          message: 'Invalid authentication credentials',
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => mockError,
      });

      const result = await anthropicClient.testConnection('invalid-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid authentication credentials');
    });

    it('should handle connection failures', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Failed to connect')
      );

      const result = await anthropicClient.testConnection('test-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to connect');
    });
  });
});
