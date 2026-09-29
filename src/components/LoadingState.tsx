interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Consultando PokéAPI..." }: LoadingStateProps) {
  return (
    <div className="loading-box" role="status" aria-live="polite">
      <div>
        <div className="spinner" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </div>
  );
}
