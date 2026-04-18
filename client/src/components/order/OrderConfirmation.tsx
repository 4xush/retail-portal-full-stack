import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Order } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveImageUrl } from '../../utils/resolveImageUrl';

const STATUS_MESSAGES: Record<Order['status'], string> = {
  pending:   'We received your order and are getting things ready.',
  confirmed: 'Your order has been confirmed by the restaurant.',
  preparing: 'The kitchen is preparing your meal.',
  delivered: 'Your order has been delivered. Enjoy!',
  cancelled: 'This order was cancelled.',
};

interface Props {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}

export function OrderConfirmation({ open, order, onClose }: Props) {
  const nav = useNavigate();
  const id = String(order?._id ?? order?.id ?? '');
  const short = id.slice(-8).toUpperCase();

  return (
    <AnimatePresence>
      {open && order && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Centring wrapper — flex handles positioning, Framer Motion only scales */}
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <motion.div
            className="w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Brand top bar */}
            <div className="h-1.5 w-full rounded-t-3xl bg-brand" />

            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {/* Animated checkmark */}
              <div className="mt-6 flex justify-center">
                <motion.div
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 ring-4 ring-green-100"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', damping: 14, stiffness: 260 }}
                >
                  <motion.svg
                    viewBox="0 0 52 52"
                    className="h-10 w-10"
                    fill="none"
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.circle
                      cx="26" cy="26" r="24"
                      stroke="#22c55e"
                      strokeWidth="3"
                      variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
                      transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                    />
                    <motion.path
                      d="M14 27l9 9 16-18"
                      stroke="#22c55e"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
                      transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
                    />
                  </motion.svg>
                </motion.div>
              </div>

              {/* Headline */}
              <motion.div
                className="mt-4 text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900">
                  Order Placed!
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {STATUS_MESSAGES[order.status]}
                </p>
              </motion.div>

              {/* Order meta */}
              <motion.div
                className="mt-4 flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    Order ID
                  </p>
                  <p className="font-mono text-sm font-bold text-neutral-800">#{short}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    Est. ready
                  </p>
                  <p className="text-sm font-bold text-brand">~20 min</p>
                </div>
              </motion.div>

              {/* Status pill */}
              <motion.div
                className="mt-3 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
              >
                <StatusPill status={order.status} />
              </motion.div>

              {/* Items */}
              <motion.div
                className="mt-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Your order
                </p>
                <ul className="space-y-2">
                  {order.items.map((it, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <img
                        src={resolveImageUrl(it.snapshot.image)}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover ring-1 ring-neutral-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-800">
                          {it.snapshot.title}
                        </p>
                        <p className="text-xs text-neutral-400">Qty: {it.qty}</p>
                      </div>
                      <span className="text-sm font-semibold text-neutral-700">
                        {formatCurrency(
                          it.snapshot.cost * (1 + it.snapshot.taxPercent / 100) * it.qty
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Price breakdown */}
              <motion.div
                className="mt-4 space-y-1 rounded-2xl border border-neutral-100 px-4 py-3 text-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
              >
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({order.discountCode})</span>
                    <span>−{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-bold text-brand">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </motion.div>
            </div>

            {/* CTAs */}
            <motion.div
              className="flex gap-2 border-t bg-white px-5 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
            >
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Continue shopping
              </button>
              <button
                type="button"
                onClick={() => { onClose(); nav('/orders'); }}
                className="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand/90"
              >
                Track order
              </button>
            </motion.div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

const STATUS_COLOR: Record<Order['status'], string> = {
  pending:   'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};
const STATUS_DOT: Record<Order['status'], string> = {
  pending:   'bg-amber-400',
  confirmed: 'bg-blue-400',
  preparing: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-400',
};

function StatusPill({ status }: { status: Order['status'] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLOR[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}
