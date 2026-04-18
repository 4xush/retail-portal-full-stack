import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { calcTaxedPrice } from '../../utils/calcTaxedPrice';
import { resolveImageUrl } from '../../utils/resolveImageUrl';
import { Badge } from '../ui/Badge';

export function ProductCard({
  product,
  onOpen,
  onAdd,
}: {
  product: Product;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const price = calcTaxedPrice(product.cost, product.taxPercent);
  const addOnCount = product.addOns?.length ?? 0;

  return (
    <div className="group w-44 shrink-0 rounded-2xl border border-neutral-100 bg-white p-2 shadow-sm transition-transform hover:scale-105 sm:w-52">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
          <img
            src={resolveImageUrl(product.images?.[0])}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {product.stock === 0 ? (
            <span className="absolute left-2 top-2">
              <Badge variant="danger">Out of Stock</Badge>
            </span>
          ) : product.stock <= 5 ? (
            <span className="absolute left-2 top-2">
              <Badge variant="warning">Only {product.stock} left</Badge>
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-2 font-semibold text-neutral-900">{product.title}</h3>
        <p className="mt-1 text-sm font-bold text-brand">{formatCurrency(price)}</p>
      </button>
      <button
        type="button"
        disabled={product.stock === 0}
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className="mt-2 w-full rounded-full bg-brand py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {addOnCount > 0 ? 'Choose' : 'Add'}
      </button>
    </div>
  );
}
