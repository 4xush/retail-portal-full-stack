import type { Category } from '../../types';

export function CategoryTabBar({
  categories,
  activeSlug,
  onSelect,
}: {
  categories: Category[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-neutral-200 bg-offwhite/95 backdrop-blur">
      <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-3">
        {categories.map((c) => {
          const slug = c.slug;
          const active = activeSlug === slug;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => onSelect(slug)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active ? 'bg-brand text-white' : 'bg-white text-neutral-800 ring-1 ring-neutral-200'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
