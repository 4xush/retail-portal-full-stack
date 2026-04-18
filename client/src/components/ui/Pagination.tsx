export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        type="button"
        disabled={page <= 1}
        className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <span className="text-sm text-neutral-600">
        Page {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
