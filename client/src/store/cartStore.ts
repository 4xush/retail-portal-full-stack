import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartAddOn, CartItem } from '../types';
import { calcTaxedPrice } from '../utils/calcTaxedPrice';

interface CartState {
  items: CartItem[];
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (
    product: { id: string; title: string; images?: string[]; cost: number; taxPercent: number },
    qty: number,
    addOns: CartAddOn[]
  ) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
      addItem: (product, qty, addOns) => {
        const image = product.images?.[0] ?? '';
        set((s) => {
          const existing = s.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === product.id ? { ...i, qty: i.qty + qty, addOns } : i
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                productId: product.id,
                title: product.title,
                image,
                cost: product.cost,
                taxPercent: product.taxPercent,
                qty,
                addOns,
              },
            ],
          };
        });
      },
      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      updateQty: (productId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const items = get().items;
        let sum = 0;
        for (const it of items) {
          let line = calcTaxedPrice(it.cost, it.taxPercent) * it.qty;
          for (const a of it.addOns) {
            line += calcTaxedPrice(a.cost, a.taxPercent) * it.qty;
          }
          sum += line;
        }
        return sum;
      },
      getItemCount: () => get().items.reduce((n, i) => n + i.qty, 0),
    }),
    { name: 'retailportal-cart' }
  )
);
