import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSuggestions } from '../../api/search.api';
import type { Product } from '../../types';
import { SearchSuggestions } from './SearchSuggestions';

export function SearchBar() {
  const nav = useNavigate();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (term.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const s = await fetchSuggestions(term.trim());
        if (!cancelled) {
          setSuggestions(s as Product[]);
          setHighlight(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [term]);

  const goSearch = (q: string) => {
    setOpen(false);
    nav(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-xl flex-1">
      <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-brand/40">
        <span className="text-neutral-400">⌕</span>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || suggestions.length === 0) {
              if (e.key === 'Enter') goSearch(term);
              return;
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlight((h) => Math.min(suggestions.length - 1, h + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlight((h) => Math.max(0, h - 1));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              goSearch(suggestions[highlight]?.title ?? term);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Search menu…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        {term && (
          <button type="button" className="text-neutral-400 hover:text-neutral-700" onClick={() => setTerm('')}>
            ×
          </button>
        )}
      </div>
      <SearchSuggestions
        open={open}
        term={term}
        suggestions={suggestions}
        loading={loading}
        highlight={highlight}
        onHighlight={setHighlight}
        onSelect={goSearch}
      />
    </div>
  );
}
