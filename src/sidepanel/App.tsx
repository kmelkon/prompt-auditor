import { useState, useEffect, useCallback } from 'react';
import { PromptEditor } from './components/PromptEditor';
import { RephrasedResult } from './components/RephrasedResult';
import { LoadingState } from './components/LoadingState';
import { ProviderIndicator } from './components/ProviderIndicator';
import { sendToBackground, onMessage, createUpdatePromptMessage } from '../lib/messaging';
import { getStorage, type AIProvider } from '../lib/storage';
import { rephrase, getProviderConfig, isProviderImplemented } from '../lib/api';

interface PromptData {
  text: string;
  site: string;
}

export function App() {
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [rephrasedPrompt, setRephrasedPrompt] = useState('');
  const [site, setSite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>('anthropic');
  const [model, setModel] = useState('claude-sonnet-4-20250514');
  const [hasApiKey, setHasApiKey] = useState(false);

  // Load settings and check for pending prompt on mount
  useEffect(() => {
    async function init() {
      // Load storage settings
      const storage = await getStorage();
      setProvider(storage.selectedProvider);
      setModel(storage.selectedModel);
      setHasApiKey(!!storage.apiKeys[storage.selectedProvider]);

      // Check for pending prompt from background
      const response = await sendToBackground({ type: 'SIDEPANEL_READY' }) as { prompt: PromptData | null };
      if (response?.prompt) {
        setOriginalPrompt(response.prompt.text);
        setSite(response.prompt.site);
      }
    }

    init();
  }, []);

  // Listen for incoming prompts
  useEffect(() => {
    onMessage((message, _sender, sendResponse) => {
      if (message.type === 'PROMPT_CAPTURED' && message.payload) {
        const payload = message.payload as PromptData;
        setOriginalPrompt(payload.text);
        setSite(payload.site);
        setRephrasedPrompt('');
        setError(null);
        sendResponse({ success: true });
      }
      return false;
    });
  }, []);

  const handleRephrase = useCallback(async () => {
    if (!originalPrompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setRephrasedPrompt('');

    try {
      const storage = await getStorage();
      const apiKey = storage.apiKeys[provider];

      if (!apiKey) {
        setError('No API key configured. Please add your API key in settings.');
        setIsLoading(false);
        return;
      }

      if (!isProviderImplemented(provider)) {
        setError(`${getProviderConfig(provider).displayName} is not yet implemented. Please use Claude.`);
        setIsLoading(false);
        return;
      }

      const result = await rephrase(provider, {
        prompt: originalPrompt,
        apiKey,
        model,
      });

      if (result.success && result.rephrased) {
        setRephrasedPrompt(result.rephrased);
      } else {
        setError(result.error || 'Failed to rephrase prompt');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [originalPrompt, provider, model]);

  const handleUseRephrased = useCallback(async () => {
    if (!rephrasedPrompt) return;

    try {
      await sendToBackground(createUpdatePromptMessage(rephrasedPrompt));
    } catch (err) {
      console.error('Failed to update prompt:', err);
    }
  }, [rephrasedPrompt]);

  const handleRegenerate = useCallback(() => {
    handleRephrase();
  }, [handleRephrase]);

  const openSettings = useCallback(() => {
    chrome.runtime.openOptionsPage();
  }, []);

  return (
    <div className="sidepanel">
      <header className="header">
        <h1 className="header__title">Prompt Auditor</h1>
        <div className="header__actions">
          <button
            className="icon-button"
            onClick={openSettings}
            title="Settings"
            aria-label="Open settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
      </header>

      <main className="content">
        <ProviderIndicator
          provider={provider}
          model={model}
          hasApiKey={hasApiKey}
        />

        {error && (
          <div className="error-banner animate-fadeIn">
            <svg className="error-banner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="error-banner__message">{error}</p>
          </div>
        )}

        <PromptEditor
          value={originalPrompt}
          onChange={setOriginalPrompt}
          onSubmit={handleRephrase}
          disabled={isLoading}
          site={site}
        />

        {isLoading && <LoadingState />}

        {rephrasedPrompt && !isLoading && (
          <RephrasedResult
            text={rephrasedPrompt}
            onUse={handleUseRephrased}
            onRegenerate={handleRegenerate}
          />
        )}
      </main>

      <footer className="footer">
        <button className="footer__link" onClick={openSettings}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Configure API Keys
        </button>
      </footer>
    </div>
  );
}
