import { useInfiniteQuery } from '@tanstack/react-query';
import type { Category, Product } from '../../types';
import { fetchProducts } from '../../api/products.api';
import { ProductCard } from '../product/ProductCard';
import { ProductCardSkeleton } from '../product/ProductCardSkeleton';
import { LoadMore } from '../ui/LoadMore';
import { resolveImageUrl } from '../../utils/resolveImageUrl';

export function CategorySection({
  category,
  onProductOpen,
  onProductAdd,
}: {
  category: Category;
  onProductOpen: (p: Product) => void;
  onProductAdd: (p: Product) => void;
}) {
  const q = useInfiniteQuery({
    queryKey: ['products', category.slug],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await fetchProducts({ category: category.slug, page: pageParam as number, limit: 12 });
      return res;
    },
    getNextPageParam: (last) => {
      const total = last.meta?.total ?? 0;
      const limit = last.meta?.limit ?? 12;
      const page = last.meta?.page ?? 1;
      return page * limit < total ? page + 1 : undefined;
    },
  });

  const items = q.data?.pages.flatMap((p) => (p.data as Product[]) ?? []) ?? [];
  const total = q.data?.pages[0]?.meta?.total ?? 0;
  const hasMore = items.length < total;

  return (
    <section id={`cat-${category.slug}`} className="scroll-mt-0 py-8">
      {/* Section heading */}
      <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4">
        {category.logo && (
          <img
            src={resolveImageUrl(category.logo)}
            alt=""
            className="h-10 w-10 rounded-xl object-cover ring-1 ring-neutral-100"
          />
        )}
        <div>
          <h2 className="text-xl font-black text-neutral-900">{category.name}</h2>
          {total > 0 && (
            <p className="text-xs text-neutral-400">{total} item{total !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {q.isLoading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : items.map((p) => (
              <ProductCard
                key={String(p._id ?? p.id)}
                product={p}
                onOpen={() => onProductOpen(p)}
                onAdd={() => onProductAdd(p)}
              />
            ))}
      </div>

      <LoadMore hasMore={hasMore} loading={q.isFetchingNextPage} onClick={() => void q.fetchNextPage()} />
    </section>
  );
}
