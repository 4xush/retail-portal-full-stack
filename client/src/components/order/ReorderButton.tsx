import { reorder } from '../../api/orders.api';
import { useCartStore } from '../../store/cartStore';
import type { CartAddOn } from '../../types';

export function ReorderButton({ orderId }: { orderId: string }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <button
      type="button"
      className="rounded-full border border-brand px-4 py-1 text-sm font-semibold text-brand"
      onClick={async () => {
        const { cartItems } = await reorder(orderId);
        for (const row of cartItems as {
          productId: string;
          title: string;
          image: string;
          cost: number;
          taxPercent: number;
          qty: number;
          addOns: CartAddOn[];
        }[]) {
          addItem(
            { id: row.productId, title: row.title, images: [row.image], cost: row.cost, taxPercent: row.taxPercent },
            row.qty,
            row.addOns ?? []
          );
        }
        useCartStore.getState().setDrawerOpen(true);
      }}
    >
      Reorder
    </button>
  );
}
