import { useState, useEffect, useCallback } from 'react';
import {
  getStorage,
  setApiKey,
  setSelectedProvider,
  setSelectedModel,
  type AIProvider,
} from '../lib/storage';
import { getAllProviderConfigs, testConnection, isProviderImplemented } from '../lib/api';

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

interface ProviderState {
  apiKey: string;
  testStatus: TestStatus;
  testError?: string;
}

export function Options() {
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>('anthropic');
  const [selectedModel, setSelectedModelState] = useState('claude-sonnet-4-20250514');
  const [providerStates, setProviderStates] = useState<Record<AIProvider, ProviderState>>({
    anthropic: { apiKey: '', testStatus: 'idle' },
    openai: { apiKey: '', testStatus: 'idle' },
    gemini: { apiKey: '', testStatus: 'idle' },
    deepseek: { apiKey: '', testStatus: 'idle' },
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const configs = getAllProviderConfigs();

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      const storage = await getStorage();
      setSelectedProviderState(storage.selectedProvider);
      setSelectedModelState(storage.selectedModel);

      const newStates: Record<AIProvider, ProviderState> = {
        anthropic: { apiKey: storage.apiKeys.anthropic || '', testStatus: 'idle' },
        openai: { apiKey: storage.apiKeys.openai || '', testStatus: 'idle' },
        gemini: { apiKey: storage.apiKeys.gemini || '', testStatus: 'idle' },
        deepseek: { apiKey: storage.apiKeys.deepseek || '', testStatus: 'idle' },
      };
      setProviderStates(newStates);
    }

    loadSettings();
  }, []);

  const handleProviderChange = useCallback(async (provider: AIProvider) => {
    setSelectedProviderState(provider);
    await setSelectedProvider(provider);

    // Set default model for the provider
    const config = configs.find((c) => c.name === provider);
    if (config) {
      setSelectedModelState(config.defaultModel);
      await setSelectedModel(config.defaultModel);
    }

    showSavedIndicator();
  }, [configs]);

  const handleModelChange = useCallback(async (model: string) => {
    setSelectedModelState(model);
    await setSelectedModel(model);
    showSavedIndicator();
  }, []);

  const handleApiKeyChange = useCallback((provider: AIProvider, value: string) => {
    setProviderStates((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], apiKey: value, testStatus: 'idle' },
    }));
  }, []);

  const handleSaveApiKey = useCallback(async (provider: AIProvider) => {
    const key = providerStates[provider].apiKey;
    await setApiKey(provider, key);
    showSavedIndicator();
  }, [providerStates]);

  const handleTestConnection = useCallback(async (provider: AIProvider) => {
    const key = providerStates[provider].apiKey;
    if (!key) return;

    setProviderStates((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], testStatus: 'testing' },
    }));

    const result = await testConnection(provider, key);

    setProviderStates((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        testStatus: result.success ? 'success' : 'error',
        testError: result.error,
      },
    }));
  }, [providerStates]);

  const showSavedIndicator = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const currentConfig = configs.find((c) => c.name === selectedProvider);
  const currentState = providerStates[selectedProvider];
  const isImplemented = isProviderImplemented(selectedProvider);

  return (
    <div className="options-page">
      <header className="options-header">
        <h1 className="options-header__title">Prompt Auditor Settings</h1>
        <p className="options-header__subtitle">
          Configure your AI provider and API keys
        </p>
      </header>

      <div className="card">
        <h2 className="card__title">AI Provider</h2>

        <div className="provider-tabs">
          {configs.map((config) => (
            <button
              key={config.name}
              className={`provider-tab ${
                selectedProvider === config.name ? 'provider-tab--active' : ''
              }`}
              onClick={() => handleProviderChange(config.name as AIProvider)}
            >
              {config.displayName}
            </button>
          ))}
        </div>

        {!isImplemented && (
          <div
            className="test-result test-result--error animate-fadeIn"
            style={{ marginBottom: 'var(--space-4)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            This provider is not yet implemented. Please use Claude.
          </div>
        )}

        <div className="form-group">
          <label className="form-label form-label--required">API Key</label>
          <div className="input-group">
            <input
              type={showApiKey ? 'text' : 'password'}
              className="form-input"
              value={currentState.apiKey}
              onChange={(e) => handleApiKeyChange(selectedProvider, e.target.value)}
              placeholder={`Enter your ${currentConfig?.displayName} API key`}
            />
            <button
              className="btn btn--secondary btn--icon"
              onClick={() => setShowApiKey(!showApiKey)}
              title={showApiKey ? 'Hide' : 'Show'}
            >
              {showApiKey ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <p className="form-hint">
            Your API key is stored locally and never sent to any server except the provider.
          </p>
        </div>

        <div className="form-group">
          <div className="input-group">
            <button
              className="btn btn--secondary"
              onClick={() => handleSaveApiKey(selectedProvider)}
              disabled={!currentState.apiKey}
            >
              Save Key
            </button>
            <button
              className="btn btn--primary"
              onClick={() => handleTestConnection(selectedProvider)}
              disabled={!currentState.apiKey || currentState.testStatus === 'testing' || !isImplemented}
            >
              {currentState.testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {currentState.testStatus === 'success' && (
            <div className="test-result test-result--success animate-fadeIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Connection successful!
            </div>
          )}

          {currentState.testStatus === 'error' && (
            <div className="test-result test-result--error animate-fadeIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {currentState.testError || 'Connection failed'}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="card__title">Model Selection</h2>

        <div className="form-group">
          <label className="form-label">Model</label>
          <select
            className="form-select"
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
          >
            {currentConfig?.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} {model.description && `— ${model.description}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {saved && (
        <div className="saved-indicator animate-fadeIn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Settings saved
        </div>
      )}
    </div>
  );
}
