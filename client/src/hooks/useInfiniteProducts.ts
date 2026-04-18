import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchSearch } from '../api/search.api';
import { fetchProducts } from '../api/products.api';

export function useInfiniteSearch(q: string, category?: string) {
  return useInfiniteQuery({
    queryKey: ['search', q, category ?? ''],
    enabled: q.trim().length > 0,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await fetchSearch({
        q,
        category: category || undefined,
        page: pageParam as number,
        limit: 20,
      });
      return { items: res.data as unknown[], meta: res.meta };
    },
    getNextPageParam: (last) => {
      const meta = last.meta;
      if (!meta) return undefined;
      const loaded = meta.page * meta.limit;
      return loaded < meta.total ? meta.page + 1 : undefined;
    },
  });
}

/** Browse all products in a category (no search query needed). */
export function useInfiniteCategoryProducts(category: string) {
  return useInfiniteQuery({
    queryKey: ['products', 'browse', category],
    enabled: category.trim().length > 0,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await fetchProducts({ category, page: pageParam as number, limit: 20 });
      return { items: res.data, meta: res.meta };
    },
    getNextPageParam: (last) => {
      const meta = last.meta;
      if (!meta) return undefined;
      const loaded = meta.page * meta.limit;
      return loaded < meta.total ? meta.page + 1 : undefined;
    },
  });
}
