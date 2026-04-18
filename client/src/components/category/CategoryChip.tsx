export function CategoryChip({ name }: { name: string }) {
  return (
    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
      {name}
    </span>
  );
}
