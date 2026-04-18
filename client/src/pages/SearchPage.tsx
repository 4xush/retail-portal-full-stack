import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useInfiniteSearch } from '../hooks/useInfiniteProducts';
import { fetchCategories } from '../api/categories.api';
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
  const inf = useInfiniteSearch(q, cat || undefined);
  const items = inf.data?.pages.flatMap((p) => p.items as Product[]) ?? [];
  const [detail, setDetail] = useState<Product | null>(null);
  const [addon, setAddon] = useState<Product | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
      <aside className="hidden w-56 shrink-0 space-y-3 md:block">
        <h2 className="font-bold">Categories</h2>
        <label className="flex items-center gap-2 text-sm">
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
          <label key={c.slug} className="flex items-center gap-2 text-sm">
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
      <div className="flex-1">
        <h1 className="text-xl font-bold">
          {inf.data?.pages[0]?.meta?.total ?? 0} results for &quot;{q}&quot;
        </h1>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((p) => (
            <ProductCard
              key={String(p._id ?? p.id)}
              product={p}
              onOpen={() => setDetail(p)}
              onAdd={() => {
                const id = String(p._id ?? p.id);
                if ((p.addOns?.length ?? 0) > 0) setAddon(p);
                else {
                  addItem(
                    { id, title: p.title, images: p.images, cost: p.cost, taxPercent: p.taxPercent },
                    1,
                    []
                  );
                  useCartStore.getState().setDrawerOpen(true);
                }
              }}
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
