import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveImageUrl } from '../../utils/resolveImageUrl';
import { ReorderButton } from './ReorderButton';

const STEPS: Array<{ key: Order['status']; label: string; icon: string }> = [
  { key: 'pending',   label: 'Order placed', icon: '🛒' },
  { key: 'confirmed', label: 'Confirmed',    icon: '✅' },
  { key: 'preparing', label: 'Preparing',    icon: '👨‍🍳' },
  { key: 'delivered', label: 'Delivered',    icon: '🎉' },
];

const STEP_INDEX: Record<Order['status'], number> = {
  pending:   0,
  confirmed: 1,
  preparing: 2,
  delivered: 3,
  cancelled: -1,
};

function StatusStepper({ status }: { status: Order['status'] }) {
  if (status === 'cancelled') {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2">
        <span className="text-base">❌</span>
        <span className="text-xs font-semibold text-red-700">Order cancelled</span>
      </div>
    );
  }

  const current = STEP_INDEX[status];

  return (
    <div className="mt-4 px-1">
      <div className="relative flex items-center justify-between">
        {/* connector line */}
        <div className="absolute inset-x-0 top-3.5 h-0.5 bg-neutral-200" />
        <motion.div
          className="absolute top-3.5 h-0.5 bg-brand origin-left"
          style={{ width: `${(current / (STEPS.length - 1)) * 100}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        />

        {STEPS.map((step, i) => {
          const done = i <= current;
          const active = i === current;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1">
              <motion.div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors
                  ${done
                    ? 'border-brand bg-brand text-white'
                    : 'border-neutral-300 bg-white text-neutral-400'
                  }`}
                initial={active ? { scale: 0.8 } : {}}
                animate={active ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
              >
                {done ? (i < current ? '✓' : step.icon) : i + 1}
              </motion.div>
              <span
                className={`text-[9px] font-semibold leading-tight text-center w-14
                  ${done ? 'text-brand' : 'text-neutral-400'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const id = String(order._id ?? order.id ?? '');
  const short = id.slice(-8).toUpperCase();
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : '';

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Top stripe */}
      <div className={`h-1 w-full ${order.status === 'cancelled' ? 'bg-red-400' : order.status === 'delivered' ? 'bg-green-500' : 'bg-brand'}`} />

      <div className="px-4 py-4">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-mono text-xs text-neutral-400">#{short}</p>
            <p className="mt-0.5 text-[11px] text-neutral-400">{date}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-brand">{formatCurrency(order.total)}</p>
            <p className="text-[11px] text-neutral-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Status stepper */}
        <StatusStepper status={order.status} />

        {/* Discount badge */}
        {order.discountAmount > 0 && (
          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
            🏷️ Saved {formatCurrency(order.discountAmount)} with {order.discountCode}
          </p>
        )}

        {/* Item thumbnails preview */}
        <div className="mt-3 flex items-center gap-1.5">
          {order.items.slice(0, 4).map((it, i) => (
            <img
              key={i}
              src={resolveImageUrl(it.snapshot.image)}
              alt={it.snapshot.title}
              title={it.snapshot.title}
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-neutral-100"
            />
          ))}
          {order.items.length > 4 && (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-500">
              +{order.items.length - 4}
            </span>
          )}
          <button
            type="button"
            className="ml-auto text-xs font-semibold text-brand"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Hide' : 'Details'}
          </button>
        </div>

        {/* Expanded item list */}
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2 border-t pt-3">
                {order.items.map((it, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <img
                      src={resolveImageUrl(it.snapshot.image)}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <span className="flex-1 truncate text-neutral-700">{it.snapshot.title}</span>
                    <span className="shrink-0 text-xs text-neutral-400">×{it.qty}</span>
                    <span className="shrink-0 font-medium">
                      {formatCurrency(it.snapshot.cost * (1 + it.snapshot.taxPercent / 100) * it.qty)}
                    </span>
                  </li>
                ))}
                <div className="flex justify-between border-t pt-2 text-xs text-neutral-500">
                  <span>Tax included</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              </div>
            </motion.ul>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <ReorderButton orderId={id} />
        </div>
      </div>
    </div>
  );
}
