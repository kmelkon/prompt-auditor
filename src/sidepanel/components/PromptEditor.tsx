import { useCallback, type ChangeEvent, type KeyboardEvent } from 'react';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  site?: string;
}

export function PromptEditor({
  value,
  onChange,
  onSubmit,
  disabled = false,
  site,
}: PromptEditorProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Cmd/Ctrl + Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit]
  );

  const placeholder = site
    ? `Paste or type your prompt here...\nCaptured from ${site}`
    : 'Paste or type your prompt here...';

  return (
    <div className="prompt-section">
      <label className="prompt-section__label" htmlFor="prompt-input">
        Original Prompt
      </label>
      <textarea
        id="prompt-input"
        className="prompt-section__textarea"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={6}
        autoFocus
      />
      <button
        className="btn-primary"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        style={{ marginTop: 'var(--space-4)' }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Analyze & Rephrase
      </button>
      <p
        style={{
          marginTop: 'var(--space-2)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}
      >
        Press Cmd/Ctrl + Enter to submit
      </p>
    </div>
  );
}
