// Type-safe wrapper around chrome.storage.local

export type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'deepseek';

export interface StorageData {
  selectedProvider: AIProvider;
  selectedModel: string;
  apiKeys: {
    anthropic?: string;
    openai?: string;
    gemini?: string;
    deepseek?: string;
  };
}

const DEFAULT_STORAGE: StorageData = {
  selectedProvider: 'anthropic',
  selectedModel: 'claude-sonnet-4-20250514',
  apiKeys: {},
};

export async function getStorage(): Promise<StorageData> {
  const result = await chrome.storage.local.get(Object.keys(DEFAULT_STORAGE));
  return {
    ...DEFAULT_STORAGE,
    ...result,
    apiKeys: {
      ...DEFAULT_STORAGE.apiKeys,
      ...(result.apiKeys || {}),
    },
  };
}

export async function setStorage(data: Partial<StorageData>): Promise<void> {
  await chrome.storage.local.set(data);
}

export async function getApiKey(provider: AIProvider): Promise<string | undefined> {
  const storage = await getStorage();
  return storage.apiKeys[provider];
}

export async function setApiKey(provider: AIProvider, key: string): Promise<void> {
  const storage = await getStorage();
  await setStorage({
    apiKeys: {
      ...storage.apiKeys,
      [provider]: key,
    },
  });
}

export async function getSelectedProvider(): Promise<AIProvider> {
  const storage = await getStorage();
  return storage.selectedProvider;
}

export async function setSelectedProvider(provider: AIProvider): Promise<void> {
  await setStorage({ selectedProvider: provider });
}

export async function getSelectedModel(): Promise<string> {
  const storage = await getStorage();
  return storage.selectedModel;
}

export async function setSelectedModel(model: string): Promise<void> {
  await setStorage({ selectedModel: model });
}

// Listen for storage changes
export function onStorageChange(
  callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      callback(changes);
    }
  });
}
