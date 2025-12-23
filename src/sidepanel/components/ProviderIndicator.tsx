import { getProviderConfig } from '../../lib/api';
import type { AIProvider } from '../../lib/storage';

interface ProviderIndicatorProps {
  provider: AIProvider;
  model: string;
  hasApiKey: boolean;
  availableProviders: AIProvider[];
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
}

export function ProviderIndicator({
  provider,
  model,
  hasApiKey,
  availableProviders,
  onProviderChange,
  onModelChange,
}: ProviderIndicatorProps) {
  const config = getProviderConfig(provider);
  const hasAvailableProviders = availableProviders.length > 0;

  return (
    <div
      className={`provider-selector ${!hasApiKey ? 'provider-selector--error' : ''}`}
      style={{ marginBottom: 'var(--space-4)' }}
    >
      <span className={`provider-selector__dot ${hasApiKey ? '' : 'provider-selector__dot--error'}`} />

      {hasAvailableProviders ? (
        <>
          <select
            className="provider-selector__select"
            value={provider}
            onChange={(e) => onProviderChange(e.target.value as AIProvider)}
            aria-label="Select AI provider"
          >
            {availableProviders.map((p) => {
              const pConfig = getProviderConfig(p);
              return (
                <option key={p} value={p}>
                  {pConfig.displayName}
                </option>
              );
            })}
          </select>

          <span className="provider-selector__separator">/</span>

          <select
            className="provider-selector__select"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            aria-label="Select model"
          >
            {config.models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </>
      ) : (
        <span className="provider-selector__empty">No API keys configured</span>
      )}
    </div>
  );
}
