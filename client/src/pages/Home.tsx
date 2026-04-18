import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { fetchCategories } from '../api/categories.api';
import { fetchProductById } from '../api/products.api';
import type { Product } from '../types';
import { CategoryTabBar } from '../components/category/CategoryTabBar';
import { CategorySection } from '../components/category/CategorySection';
import { ProductDetail } from '../components/product/ProductDetail';
import { AddOnModal } from '../components/product/AddOnModal';
import { useCartStore } from '../store/cartStore';

export function Home() {
  const { data: categories = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [addonTarget, setAddonTarget] = useState<Product | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const scrollTo = useCallback((slug: string) => {
    setActiveSlug(slug);
    document.getElementById(`cat-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleAdd = async (p: Product) => {
    const id = String(p._id ?? p.id);
    if ((p.addOns?.length ?? 0) > 0) {
      // List endpoint only returns addOn ObjectIds — fetch full product to get populated addOns
      const full = await fetchProductById(id);
      setAddonTarget(full);
      return;
    }
    addItem(
      { id, title: p.title, images: p.images, cost: p.cost, taxPercent: p.taxPercent },
      1,
      []
    );
    useCartStore.getState().setDrawerOpen(true);
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-brand to-red-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-black sm:text-4xl">Finger-lickin&apos; good deals</h1>
          <p className="mt-2 max-w-xl text-sm text-red-100">
            Order hot meals, combos, and sides — fast checkout, live stock, and crisp UI.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-bold text-brand"
            onClick={() => categories[0] && scrollTo(categories[0].slug)}
          >
            Browse menu
          </button>
        </div>
      </div>

      {!isLoading && categories.length > 0 && (
        <CategoryTabBar categories={categories} activeSlug={activeSlug} onSelect={scrollTo} />
      )}

      <div className="mx-auto max-w-6xl space-y-2 py-4">
        {isLoading && <p className="px-4 text-neutral-500">Loading menu…</p>}
        {categories.map((c) => (
          <CategorySection
            key={c.slug}
            category={c}
            onProductOpen={(p) => setDetail(p)}
            onProductAdd={(p) => void handleAdd(p)}
          />
        ))}
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
        open={!!addonTarget}
        onClose={() => setAddonTarget(null)}
        product={addonTarget}
        onConfirm={(addOns) => {
          if (!addonTarget) return;
          const id = String(addonTarget._id ?? addonTarget.id);
          addItem(
            {
              id,
              title: addonTarget.title,
              images: addonTarget.images,
              cost: addonTarget.cost,
              taxPercent: addonTarget.taxPercent,
            },
            1,
            addOns
          );
          useCartStore.getState().setDrawerOpen(true);
        }}
      />
    </div>
  );
}
