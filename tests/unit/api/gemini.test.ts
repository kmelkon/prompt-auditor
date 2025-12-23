import { describe, it, expect, beforeEach, vi } from 'vitest';
import { geminiClient } from '../../../src/lib/api/gemini';
import type { RephraseRequest } from '../../../src/lib/api/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('Gemini API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('config', () => {
    it('should have correct provider configuration', () => {
      expect(geminiClient.config.name).toBe('gemini');
      expect(geminiClient.config.displayName).toBe('Google Gemini');
      expect(geminiClient.config.defaultModel).toBe('gemini-2.0-flash');
      expect(geminiClient.config.models.length).toBeGreaterThan(0);
    });
  });

  describe('rephrase', () => {
    it('should successfully rephrase a prompt', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Rephrased prompt here' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          totalTokenCount: 150,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Original prompt',
        apiKey: 'test-api-key',
        model: 'gemini-2.0-flash',
      };

      const result = await geminiClient.rephrase(request);

      expect(result.success).toBe(true);
      expect(result.rephrased).toBe('Rephrased prompt here');
      expect(result.error).toBeUndefined();
    });

    it('should include API key in URL and correct headers', async () => {
      const mockResponse = {
        candidates: [
          {
            content: { parts: [{ text: 'Rephrased' }] },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key-123',
        model: 'gemini-2.0-flash',
      };

      await geminiClient.rephrase(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('key=test-key-123'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should send system instruction and user content', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'Rephrased' }] } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test prompt',
        apiKey: 'test-key',
        model: 'gemini-2.0-flash',
      };

      await geminiClient.rephrase(request);

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.systemInstruction).toBeDefined();
      expect(requestBody.systemInstruction.parts[0].text).toContain('Prompt Auditor');
      expect(requestBody.contents).toHaveLength(1);
      expect(requestBody.contents[0].parts[0].text).toBe('Test prompt');
    });

    it('should use correct endpoint format', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'Rephrased' }] } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'gemini-1.5-pro',
      };

      await geminiClient.rephrase(request);

      const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(url).toContain('generativelanguage.googleapis.com/v1beta/models');
      expect(url).toContain('gemini-1.5-pro:generateContent');
    });

    it('should handle API errors', async () => {
      const mockError = {
        error: {
          code: 400,
          message: 'API_KEY_INVALID',
          status: 'INVALID_ARGUMENT',
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'invalid-key',
        model: 'gemini-2.0-flash',
      };

      const result = await geminiClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('API_KEY_INVALID');
      expect(result.rephrased).toBeUndefined();
    });

    it('should handle empty candidates', async () => {
      const mockResponse = {
        candidates: [],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'gemini-2.0-flash',
      };

      const result = await geminiClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No response received from API');
    });

    it('should handle network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network request failed')
      );

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'gemini-2.0-flash',
      };

      const result = await geminiClient.rephrase(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network request failed');
    });

    it('should trim whitespace from rephrased text', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: '\n\n  Rephrased with spaces  \t\n' }],
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
        model: 'gemini-2.0-flash',
      };

      const result = await geminiClient.rephrase(request);

      expect(result.rephrased).toBe('Rephrased with spaces');
    });

    it('should set maxOutputTokens in generation config', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'Rephrased' }] } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: RephraseRequest = {
        prompt: 'Test',
        apiKey: 'test-key',
        model: 'gemini-2.0-flash',
      };

      await geminiClient.rephrase(request);

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.generationConfig.maxOutputTokens).toBe(2048);
    });
  });

  describe('testConnection', () => {
    it('should return success for valid API key', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'Hi' }] } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geminiClient.testConnection('valid-api-key');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should use lightweight config for testing', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'Hi' }] } }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await geminiClient.testConnection('test-key');

      const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(url).toContain('gemini-2.0-flash');
      expect(requestBody.generationConfig.maxOutputTokens).toBe(10);
      expect(requestBody.contents[0].parts[0].text).toBe('Hi');
    });

    it('should return error for invalid API key', async () => {
      const mockError = {
        error: {
          code: 401,
          message: 'Invalid API key',
          status: 'UNAUTHENTICATED',
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => mockError,
      });

      const result = await geminiClient.testConnection('invalid-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('should handle connection failures', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Failed to fetch')
      );

      const result = await geminiClient.testConnection('test-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch');
    });
  });
});
