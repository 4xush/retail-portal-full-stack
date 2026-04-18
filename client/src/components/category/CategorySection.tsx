import { Link } from 'react-router-dom';
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
      const res = await fetchProducts({ category: category.slug, page: pageParam as number, limit: 8 });
      return res;
    },
    getNextPageParam: (last) => {
      const total = last.meta?.total ?? 0;
      const limit = last.meta?.limit ?? 8;
      const page = last.meta?.page ?? 1;
      return page * limit < total ? page + 1 : undefined;
    },
  });

  const items =
    q.data?.pages.flatMap((p) => (p.data as Product[]) ?? []) ?? [];
  const total = q.data?.pages[0]?.meta?.total ?? 0;
  const hasMore = items.length < total;

  return (
    <section id={`cat-${category.slug}`} className="scroll-mt-32 px-4 py-6">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        {category.logo && (
          <img src={resolveImageUrl(category.logo)} alt="" className="h-10 w-10 rounded-lg object-cover" />
        )}
        <h2 className="text-2xl font-bold text-neutral-900">{category.name}</h2>
        <Link to={`/?category=${category.slug}`} className="ml-auto text-sm font-semibold text-brand">
          View all →
        </Link>
      </div>
      <div className="mx-auto mt-4 flex max-w-6xl snap-x gap-3 overflow-x-auto pb-2">
        {q.isLoading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : items.map((p) => (
              <div key={String(p._id ?? p.id)} className="snap-start">
                <ProductCard product={p} onOpen={() => onProductOpen(p)} onAdd={() => onProductAdd(p)} />
              </div>
            ))}
      </div>
      <div className="mx-auto max-w-6xl">
        <LoadMore hasMore={hasMore} loading={q.isFetchingNextPage} onClick={() => void q.fetchNextPage()} />
      </div>
    </section>
  );
}
