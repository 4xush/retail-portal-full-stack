import { useState } from 'react';
import type { CartAddOn, Product } from '../../types';
import { Modal } from '../ui/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import { calcTaxedPrice } from '../../utils/calcTaxedPrice';
import { resolveImageUrl } from '../../utils/resolveImageUrl';

export function AddOnModal({
  open,
  onClose,
  product,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (addOns: CartAddOn[]) => void;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  if (!product) return null;
  const addOns = (product.addOns ?? []) as Product[];

  const toggle = (p: Product) => {
    const id = String(p._id ?? p.id);
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const confirm = () => {
    const list: CartAddOn[] = [];
    for (const p of addOns) {
      const id = String(p._id ?? p.id);
      if (selected[id]) {
        list.push({
          productId: id,
          title: p.title,
          cost: p.cost,
          taxPercent: p.taxPercent,
        });
      }
    }
    onConfirm(list);
    setSelected({});
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-lg font-bold">Add-ons</h2>
        <p className="text-sm text-neutral-600">{product.title}</p>
        <ul className="mt-4 space-y-2">
          {addOns.map((p) => {
            const id = String(p._id ?? p.id);
            return (
              <li key={id} className="flex items-center gap-3 rounded-lg border p-2">
                <img src={resolveImageUrl(p.images?.[0])} alt="" className="h-10 w-10 rounded object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-neutral-600">
                    {formatCurrency(calcTaxedPrice(p.cost, p.taxPercent))}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!selected[id]}
                  onChange={() => toggle(p)}
                  className="h-4 w-4 accent-brand"
                />
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-brand py-3 font-semibold text-white"
          onClick={confirm}
        >
          Add to cart
        </button>
      </div>
    </Modal>
  );
}
