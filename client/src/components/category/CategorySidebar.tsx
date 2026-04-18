import type { Category } from '../../types';
import { resolveImageUrl } from '../../utils/resolveImageUrl';

export function CategorySidebar({
  categories,
  activeSlug,
  onSelect,
}: {
  categories: Category[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col h-full overflow-y-auto border-r border-neutral-100 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-4">
        <div className="flex items-end gap-0.5">
          <span className="h-5 w-1 rounded-sm bg-brand" />
          <span className="h-4 w-1 rounded-sm bg-brand" />
          <span className="h-3 w-1 rounded-sm bg-brand" />
        </div>
        <span className="text-xs font-black tracking-[0.18em] text-neutral-800 uppercase">
          Menu
        </span>
      </div>

      {/* Category list */}
      <nav className="flex-1 py-2">
        {categories.map((c) => {
          const active = activeSlug === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => onSelect(c.slug)}
              className={`group flex w-full items-center gap-3 border-l-[3px] px-4 py-3 text-left transition-all
                ${active
                  ? 'border-brand bg-red-50 text-brand'
                  : 'border-transparent text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
            >
              {c.logo ? (
                <img
                  src={resolveImageUrl(c.logo)}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-neutral-100"
                />
              ) : (
                <div className="h-8 w-8 shrink-0 rounded-lg bg-neutral-100" />
              )}
              <span className={`text-sm leading-snug ${active ? 'font-bold' : 'font-medium'}`}>
                {c.name}
              </span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
