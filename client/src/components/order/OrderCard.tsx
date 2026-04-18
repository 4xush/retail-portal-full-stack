import { useState } from 'react';
import type { Order } from '../../types';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveImageUrl } from '../../utils/resolveImageUrl';
import { ReorderButton } from './ReorderButton';

const statusVariant: Record<Order['status'], 'warning' | 'info' | 'purple' | 'success' | 'danger'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'purple',
  delivered: 'success',
  cancelled: 'danger',
};

export function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const id = String(order._id ?? order.id ?? '');
  const short = id.slice(-8);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm text-neutral-500">#{short}</span>
        <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
        <span className="ml-auto font-bold text-brand">{formatCurrency(order.total)}</span>
      </div>
      <div className="mt-1 text-xs text-neutral-500">
        {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''} · {order.items.length} items
      </div>
      <button type="button" className="mt-2 text-sm font-semibold text-brand" onClick={() => setOpen(!open)}>
        {open ? 'Hide' : 'Show'} details
      </button>
      {open && (
        <ul className="mt-3 space-y-2 border-t pt-3">
          {order.items.map((it, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <img
                src={resolveImageUrl(it.snapshot.image)}
                alt=""
                className="h-10 w-10 rounded object-cover"
              />
              <span className="flex-1">
                {it.snapshot.title} × {it.qty}
              </span>
              <span>{formatCurrency((it.snapshot.cost * (1 + it.snapshot.taxPercent / 100)) * it.qty)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex gap-2">
        <ReorderButton orderId={id} />
      </div>
    </div>
  );
}
