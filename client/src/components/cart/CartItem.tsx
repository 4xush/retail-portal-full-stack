import type { CartItem as CartLine } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { calcTaxedPrice } from '../../utils/calcTaxedPrice';
import { resolveImageUrl } from '../../utils/resolveImageUrl';

export function CartItemRow({
  item,
  onQty,
  onRemove,
}: {
  item: CartLine;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  let line =
    calcTaxedPrice(item.cost, item.taxPercent) * item.qty +
    item.addOns.reduce((s, a) => s + calcTaxedPrice(a.cost, a.taxPercent) * item.qty, 0);
  return (
    <div className="flex gap-3 border-b border-neutral-100 py-3">
      <img src={resolveImageUrl(item.image)} alt="" className="h-14 w-14 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <div className="font-medium">{item.title}</div>
        {item.addOns.length > 0 && (
          <div className="text-xs text-neutral-500">
            + {item.addOns.map((a) => a.title).join(', ')}
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <button type="button" className="rounded border px-2" onClick={() => onQty(item.qty - 1)}>
            −
          </button>
          <span className="text-sm">{item.qty}</span>
          <button type="button" className="rounded border px-2" onClick={() => onQty(item.qty + 1)}>
            +
          </button>
          <button type="button" className="ml-auto text-xs text-red-600" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
      <div className="text-sm font-semibold">{formatCurrency(line)}</div>
    </div>
  );
}
