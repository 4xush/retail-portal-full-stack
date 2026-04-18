export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-brand border-t-transparent ${className}`}
      role="status"
    />
  );
}
