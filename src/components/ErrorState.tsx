interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return <div className="empty-state error-state">{message}</div>;
}
