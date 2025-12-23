interface RephrasedResultProps {
  text: string;
  onUse: () => void;
  onRegenerate: () => void;
}

export function RephrasedResult({ text, onUse, onRegenerate }: RephrasedResultProps) {
  return (
    <div className="result-section animate-fadeIn">
      <div className="result-section__header">
        <div className="result-section__icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="result-section__title">Rephrased Prompt</h2>
      </div>

      <p className="result-section__text">{text}</p>

      <div className="result-section__actions">
        <button className="btn-primary" onClick={onUse}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Use This
        </button>
        <button className="btn-secondary" onClick={onRegenerate}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Regenerate
        </button>
      </div>
    </div>
  );
}
