import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStorage,
  setStorage,
  getApiKey,
  setApiKey,
  getSelectedProvider,
  setSelectedProvider,
  getSelectedModel,
  setSelectedModel,
  type StorageData,
  type AIProvider,
} from '../../src/lib/storage';

describe('Storage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('getStorage', () => {
    it('should return default storage when no data exists', async () => {
      const mockGet = vi.fn().mockResolvedValue({});
      global.chrome.storage.local.get = mockGet;

      const result = await getStorage();

      expect(result).toEqual({
        selectedProvider: 'anthropic',
        selectedModel: 'claude-sonnet-4-20250514',
        apiKeys: {},
      });
    });

    it('should merge stored data with defaults', async () => {
      const storedData = {
        selectedProvider: 'openai',
        apiKeys: { anthropic: 'test-key' },
      };
      const mockGet = vi.fn().mockResolvedValue(storedData);
      global.chrome.storage.local.get = mockGet;

      const result = await getStorage();

      expect(result.selectedProvider).toBe('openai');
      expect(result.apiKeys.anthropic).toBe('test-key');
      expect(result.selectedModel).toBe('claude-sonnet-4-20250514'); // default
    });

    it('should preserve all API keys when merging', async () => {
      const storedData = {
        apiKeys: {
          anthropic: 'anthropic-key',
          openai: 'openai-key',
          gemini: 'gemini-key',
        },
      };
      const mockGet = vi.fn().mockResolvedValue(storedData);
      global.chrome.storage.local.get = mockGet;

      const result = await getStorage();

      expect(result.apiKeys).toEqual({
        anthropic: 'anthropic-key',
        openai: 'openai-key',
        gemini: 'gemini-key',
      });
    });
  });

  describe('setStorage', () => {
    it('should call chrome.storage.local.set with correct data', async () => {
      const mockSet = vi.fn().mockResolvedValue(undefined);
      global.chrome.storage.local.set = mockSet;

      const testData: Partial<StorageData> = {
        selectedProvider: 'gemini',
      };

      await setStorage(testData);

      expect(mockSet).toHaveBeenCalledWith(testData);
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple fields', async () => {
      const mockSet = vi.fn().mockResolvedValue(undefined);
      global.chrome.storage.local.set = mockSet;

      const testData: Partial<StorageData> = {
        selectedProvider: 'openai',
        selectedModel: 'gpt-4o',
        apiKeys: { openai: 'new-key' },
      };

      await setStorage(testData);

      expect(mockSet).toHaveBeenCalledWith(testData);
    });
  });

  describe('getApiKey', () => {
    it('should return API key for specified provider', async () => {
      const storedData = {
        apiKeys: { anthropic: 'test-anthropic-key' },
      };
      const mockGet = vi.fn().mockResolvedValue(storedData);
      global.chrome.storage.local.get = mockGet;

      const result = await getApiKey('anthropic');

      expect(result).toBe('test-anthropic-key');
    });

    it('should return undefined when API key does not exist', async () => {
      const mockGet = vi.fn().mockResolvedValue({ apiKeys: {} });
      global.chrome.storage.local.get = mockGet;

      const result = await getApiKey('gemini');

      expect(result).toBeUndefined();
    });
  });

  describe('setApiKey', () => {
    it('should set API key for specified provider', async () => {
      const existingData = {
        apiKeys: { anthropic: 'old-key' },
      };
      const mockGet = vi.fn().mockResolvedValue(existingData);
      const mockSet = vi.fn().mockResolvedValue(undefined);
      global.chrome.storage.local.get = mockGet;
      global.chrome.storage.local.set = mockSet;

      await setApiKey('openai', 'new-openai-key');

      expect(mockSet).toHaveBeenCalledWith({
        apiKeys: {
          anthropic: 'old-key',
          openai: 'new-openai-key',
        },
      });
    });

    it('should preserve existing API keys', async () => {
      const existingData = {
        apiKeys: {
          anthropic: 'anthropic-key',
          gemini: 'gemini-key',
        },
      };
      const mockGet = vi.fn().mockResolvedValue(existingData);
      const mockSet = vi.fn().mockResolvedValue(undefined);
      global.chrome.storage.local.get = mockGet;
      global.chrome.storage.local.set = mockSet;

      await setApiKey('deepseek', 'deepseek-key');

      expect(mockSet).toHaveBeenCalledWith({
        apiKeys: {
          anthropic: 'anthropic-key',
          gemini: 'gemini-key',
          deepseek: 'deepseek-key',
        },
      });
    });
  });

  describe('getSelectedProvider', () => {
    it('should return selected provider', async () => {
      const storedData = { selectedProvider: 'openai' };
      const mockGet = vi.fn().mockResolvedValue(storedData);
      global.chrome.storage.local.get = mockGet;

      const result = await getSelectedProvider();

      expect(result).toBe('openai');
    });

    it('should return default provider when not set', async () => {
      const mockGet = vi.fn().mockResolvedValue({});
      global.chrome.storage.local.get = mockGet;

      const result = await getSelectedProvider();

      expect(result).toBe('anthropic');
    });
  });

  describe('setSelectedProvider', () => {
    it('should set selected provider', async () => {
      const mockSet = vi.fn().mockResolvedValue(undefined);
      global.chrome.storage.local.set = mockSet;

      await setSelectedProvider('gemini');

      expect(mockSet).toHaveBeenCalledWith({ selectedProvider: 'gemini' });
    });
  });

  describe('getSelectedModel', () => {
    it('should return selected model', async () => {
      const storedData = { selectedModel: 'gpt-4o' };
      const mockGet = vi.fn().mockResolvedValue(storedData);
      global.chrome.storage.local.get = mockGet;

      const result = await getSelectedModel();

      expect(result).toBe('gpt-4o');
    });

    it('should return default model when not set', async () => {
      const mockGet = vi.fn().mockResolvedValue({});
      global.chrome.storage.local.get = mockGet;

      const result = await getSelectedModel();

      expect(result).toBe('claude-sonnet-4-20250514');
    });
  });

  describe('setSelectedModel', () => {
    it('should set selected model', async () => {
      const mockSet = vi.fn().mockResolvedValue(undefined);
      global.chrome.storage.local.set = mockSet;

      await setSelectedModel('gemini-2.0-flash');

      expect(mockSet).toHaveBeenCalledWith({ selectedModel: 'gemini-2.0-flash' });
    });
  });
});
