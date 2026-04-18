import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchCategories } from '../api/categories.api';
import { fetchProductById } from '../api/products.api';
import type { Product } from '../types';
import { CategorySidebar } from '../components/category/CategorySidebar';
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
  const scrollingRef = useRef(false);

  // Set first category active once loaded
  useEffect(() => {
    if (categories.length > 0 && !activeSlug) {
      setActiveSlug(categories[0].slug);
    }
  }, [categories, activeSlug]);

  // Scroll-spy: watch which section is nearest the top and update sidebar
  useEffect(() => {
    if (categories.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        // Pick the entry that is intersecting and closest to top
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const slug = visible[0].target.id.replace('cat-', '');
          setActiveSlug(slug);
        }
      },
      { rootMargin: '-65px 0px -60% 0px', threshold: 0 }
    );
    categories.forEach((c) => {
      const el = document.getElementById(`cat-${c.slug}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]);

  const scrollTo = useCallback((slug: string) => {
    setActiveSlug(slug);
    scrollingRef.current = true;
    document.getElementById(`cat-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Re-enable scroll-spy after animation completes
    setTimeout(() => { scrollingRef.current = false; }, 900);
  }, []);

  const handleAdd = async (p: Product) => {
    const id = String(p._id ?? p.id);
    if ((p.addOns?.length ?? 0) > 0) {
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
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-brand to-red-700 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
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

      {/* Mobile category pills — only visible below md */}
      {!isLoading && categories.length > 0 && (
        <div className="sticky top-[65px] z-40 border-b border-neutral-100 bg-white/95 backdrop-blur md:hidden">
          <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => scrollTo(c.slug)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors
                  ${activeSlug === c.slug ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-700'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="mx-auto flex max-w-7xl">
        {/* Left sidebar — desktop only */}
        <CategorySidebar
          categories={categories}
          activeSlug={activeSlug}
          onSelect={scrollTo}
        />

        {/* Main content */}
        <div className="min-w-0 flex-1 px-6 py-4">
          {isLoading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-2xl bg-neutral-100" />
              ))}
            </div>
          )}
          {categories.map((c) => (
            <CategorySection
              key={c.slug}
              category={c}
              onProductOpen={(p) => setDetail(p)}
              onProductAdd={(p) => void handleAdd(p)}
            />
          ))}
        </div>
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
