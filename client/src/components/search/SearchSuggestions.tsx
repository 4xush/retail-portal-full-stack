import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../../types';
import { CategoryChip } from '../category/CategoryChip';
import { resolveImageUrl } from '../../utils/resolveImageUrl';
import { formatCurrency } from '../../utils/formatCurrency';
import { calcTaxedPrice } from '../../utils/calcTaxedPrice';
import { Skeleton } from '../ui/Skeleton';

export function SearchSuggestions({
  open,
  term,
  suggestions,
  loading,
  highlight,
  onHighlight,
  onSelect,
}: {
  open: boolean;
  term: string;
  suggestions: Product[];
  loading: boolean;
  highlight: number;
  onHighlight: (i: number) => void;
  onSelect: (q: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && term.trim().length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-xl"
        >
          {loading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-8 w-8 shrink-0 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {suggestions.map((s, idx) => {
                const id = String(s._id ?? s.id);
                const cat = s.category as { name?: string; slug?: string } | undefined;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                        idx === highlight ? 'bg-red-50' : 'hover:bg-neutral-50'
                      }`}
                      onMouseEnter={() => onHighlight(idx)}
                      onClick={() => onSelect(s.title)}
                    >
                      <img
                        src={resolveImageUrl(s.images?.[0])}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded object-cover"
                      />
                      <span className="line-clamp-2 flex-1 font-medium">{s.title}</span>
                      {cat?.name && <CategoryChip name={cat.name} />}
                      <span className="text-xs text-neutral-500">
                        {formatCurrency(calcTaxedPrice(s.cost, s.taxPercent))}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="border-t border-neutral-100 p-2">
            <Link
              to={`/search?q=${encodeURIComponent(term)}`}
              className="block text-center text-sm font-semibold text-brand"
              onClick={() => onSelect(term)}
            >
              See all results for &apos;{term}&apos; →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
