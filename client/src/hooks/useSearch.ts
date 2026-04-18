import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from '../utils/debounce';
import { fetchSearch, fetchSuggestions } from '../api/search.api';
import type { Product } from '../types';

export function useSearch() {
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [meta, setMeta] = useState<{ page: number; limit: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const setDebounced = useMemo(() => debounce((v: string) => setDebouncedValue(v), 400), []);

  useEffect(() => {
    setDebounced(inputValue);
  }, [inputValue, setDebounced]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (inputValue.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setIsSuggesting(true);
      try {
        const s = await fetchSuggestions(inputValue.trim());
        if (!cancelled) setSuggestions(s as Product[]);
      } finally {
        if (!cancelled) setIsSuggesting(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [inputValue]);

  const runFullSearch = useCallback(async (q: string, category?: string, page = 1) => {
    if (!q.trim()) {
      setResults([]);
      setMeta(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetchSearch({ q: q.trim(), category, page, limit: 20 });
      setResults((res.data as Product[]) ?? []);
      setMeta(res.meta ?? null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void runFullSearch(debouncedValue);
  }, [debouncedValue, runFullSearch]);

  return {
    inputValue,
    setInputValue,
    debouncedValue,
    suggestions,
    results,
    meta,
    isLoading,
    isSuggesting,
    runFullSearch,
  };
}
