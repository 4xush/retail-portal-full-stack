import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useInfiniteSearch, useInfiniteCategoryProducts } from '../hooks/useInfiniteProducts';
import { fetchCategories } from '../api/categories.api';
import { fetchProductById } from '../api/products.api';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { ProductDetail } from '../components/product/ProductDetail';
import { AddOnModal } from '../components/product/AddOnModal';
import { useCartStore } from '../store/cartStore';
import { LoadMore } from '../components/ui/LoadMore';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const cat = params.get('category') ?? '';

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  // Use search when q is present, otherwise browse by category
  const searchInf = useInfiniteSearch(q, cat || undefined);
  const browseInf = useInfiniteCategoryProducts(cat);
  const inf = q.trim() ? searchInf : browseInf;

  const items = inf.data?.pages.flatMap((p) => p.items as Product[]) ?? [];
  const total = inf.data?.pages[0]?.meta?.total ?? 0;

  const [detail, setDetail] = useState<Product | null>(null);
  const [addon, setAddon] = useState<Product | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  // Resolve the active category name for the heading
  const activeCatName = categories.find((c) => c.slug === cat)?.name ?? cat;
  const heading = q.trim()
    ? `${total} result${total !== 1 ? 's' : ''} for "${q}"`
    : cat
      ? `All ${activeCatName}`
      : 'Browse menu';

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 space-y-3 md:block">
        <h2 className="font-bold">Categories</h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!cat}
            onChange={() => {
              const next = new URLSearchParams(params);
              next.delete('category');
              setParams(next);
            }}
          />
          All
        </label>
        {categories.map((c) => (
          <label key={c.slug} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={cat === c.slug}
              onChange={() => {
                const next = new URLSearchParams(params);
                next.set('category', c.slug);
                setParams(next);
              }}
            />
            {c.name}
          </label>
        ))}
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold">{heading}</h1>

        {/* Mobile category pills */}
        <div className="mt-3 flex flex-wrap gap-2 md:hidden">
          <button
            type="button"
            onClick={() => { const n = new URLSearchParams(params); n.delete('category'); setParams(n); }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${!cat ? 'bg-brand text-white border-brand' : 'text-neutral-600'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => { const n = new URLSearchParams(params); n.set('category', c.slug); setParams(n); }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${cat === c.slug ? 'bg-brand text-white border-brand' : 'text-neutral-600'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {inf.isLoading && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        )}

        {!inf.isLoading && items.length === 0 && (
          <div className="mt-12 text-center text-neutral-500">
            <p className="text-4xl">🔍</p>
            <p className="mt-2 font-semibold">No items found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((p) => (
            <ProductCard
              key={String(p._id ?? p.id)}
              product={p}
              onOpen={() => setDetail(p)}
              onAdd={() => void (async () => {
                const id = String(p._id ?? p.id);
                if ((p.addOns?.length ?? 0) > 0) {
                  const full = await fetchProductById(id);
                  setAddon(full);
                } else {
                  addItem(
                    { id, title: p.title, images: p.images, cost: p.cost, taxPercent: p.taxPercent },
                    1,
                    []
                  );
                  useCartStore.getState().setDrawerOpen(true);
                }
              })()}
            />
          ))}
        </div>

        <LoadMore
          hasMore={!!inf.hasNextPage}
          loading={inf.isFetchingNextPage}
          onClick={() => void inf.fetchNextPage()}
        />
      </div>

      <ProductDetail
        open={!!detail}
        onClose={() => setDetail(null)}
        product={detail}
        onAddToCart={(qty, addOns) => {
          if (!detail) return;
          const id = String(detail._id ?? detail.id);
          addItem(
            { id, title: detail.title, images: detail.images, cost: detail.cost, taxPercent: detail.taxPercent },
            qty,
            addOns
          );
          useCartStore.getState().setDrawerOpen(true);
        }}
      />
      <AddOnModal
        open={!!addon}
        onClose={() => setAddon(null)}
        product={addon}
        onConfirm={(addOns) => {
          if (!addon) return;
          const id = String(addon._id ?? addon.id);
          addItem(
            { id, title: addon.title, images: addon.images, cost: addon.cost, taxPercent: addon.taxPercent },
            1,
            addOns
          );
          useCartStore.getState().setDrawerOpen(true);
        }}
      />
    </div>
  );
}
