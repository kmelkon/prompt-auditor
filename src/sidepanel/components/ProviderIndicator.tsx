import { getProviderConfig } from '../../lib/api';
import type { AIProvider } from '../../lib/storage';

interface ProviderIndicatorProps {
  provider: AIProvider;
  model: string;
  hasApiKey: boolean;
}

export function ProviderIndicator({ provider, model, hasApiKey }: ProviderIndicatorProps) {
  const config = getProviderConfig(provider);
  const modelInfo = config.models.find((m) => m.id === model);
  const displayModel = modelInfo?.name || model;

  return (
    <div
      className={`provider-indicator ${!hasApiKey ? 'provider-indicator--error' : ''}`}
      style={{ marginBottom: 'var(--space-4)' }}
    >
      <span className="provider-indicator__dot" />
      <span>
        {config.displayName} / {displayModel}
      </span>
      {!hasApiKey && (
        <span style={{ color: 'var(--color-error)' }}> (No API key)</span>
      )}
    </div>
  );
}
