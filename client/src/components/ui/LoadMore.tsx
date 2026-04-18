export function LoadMore({
  loading,
  hasMore,
  onClick,
}: {
  loading?: boolean;
  hasMore: boolean;
  onClick: () => void;
}) {
  if (!hasMore) return null;
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="mt-3 rounded-full border border-brand px-4 py-1 text-sm font-medium text-brand disabled:opacity-50"
    >
      {loading ? 'Loading…' : 'Load more'}
    </button>
  );
}
