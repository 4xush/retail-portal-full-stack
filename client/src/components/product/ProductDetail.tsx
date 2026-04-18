import { useState } from 'react';
import type { CartAddOn, Product } from '../../types';
import { Modal } from '../ui/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import { calcTaxedPrice } from '../../utils/calcTaxedPrice';
import { resolveImageUrl } from '../../utils/resolveImageUrl';

export function ProductDetail({
  open,
  onClose,
  product,
  onAddToCart,
}: {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (qty: number, addOns: CartAddOn[]) => void;
}) {
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  if (!product) return null;
  const addOns = (product.addOns ?? []) as Product[];
  const base = product.cost;
  const tax = (base * product.taxPercent) / 100;
  const gross = calcTaxedPrice(base, product.taxPercent);

  const toggle = (p: Product) => {
    const id = String(p._id ?? p.id);
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const add = () => {
    const list: CartAddOn[] = [];
    for (const p of addOns) {
      const id = String(p._id ?? p.id);
      if (selected[id]) {
        list.push({ productId: id, title: p.title, cost: p.cost, taxPercent: p.taxPercent });
      }
    }
    onAddToCart(qty, list);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4">
        <img
          src={resolveImageUrl(product.images?.[0])}
          alt=""
          className="aspect-video w-full rounded-xl object-cover"
        />
        <h2 className="mt-3 text-xl font-bold">{product.title}</h2>
        <p className="mt-2 text-sm text-neutral-600">{product.description}</p>
        <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm">
          <div className="flex justify-between">
            <span>Base</span>
            <span>{formatCurrency(base)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({product.taxPercent}%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="mt-2 flex justify-between font-bold text-brand">
            <span>Total</span>
            <span>{formatCurrency(gross)}</span>
          </div>
        </div>
        {addOns.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Add-ons</h3>
            <ul className="mt-2 space-y-2">
              {addOns.map((p) => {
                const id = String(p._id ?? p.id);
                return (
                  <li key={id} className="flex items-center justify-between rounded border px-2 py-1">
                    <span>{p.title}</span>
                    <input
                      type="checkbox"
                      checked={!!selected[id]}
                      onChange={() => toggle(p)}
                      className="accent-brand"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border px-3 py-1"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="font-medium">{qty}</span>
          <button type="button" className="rounded-lg border px-3 py-1" onClick={() => setQty((q) => q + 1)}>
            +
          </button>
        </div>
        <button
          type="button"
          disabled={product.stock === 0}
          className="mt-4 w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50"
          onClick={add}
        >
          Add to cart
        </button>
      </div>
    </Modal>
  );
}
