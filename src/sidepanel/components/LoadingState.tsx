export function LoadingState() {
  return (
    <div className="loading animate-fadeIn">
      <div className="loading__spinner" />
      <p className="loading__text">Analyzing your prompt...</p>
    </div>
  );
}
