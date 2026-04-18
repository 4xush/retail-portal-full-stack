import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { CartItemRow } from './CartItem';
import { formatCurrency } from '../../utils/formatCurrency';
import { placeOrder } from '../../api/orders.api';
import { Toast } from '../ui/Toast';

export function CartDrawer() {
  const nav = useNavigate();
  const open = useCartStore((s) => s.drawerOpen);
  const setOpen = useCartStore((s) => s.setDrawerOpen);
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);
  const [code, setCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | undefined>();
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotalPreTax = items.reduce((s, i) => s + i.cost * i.qty + i.addOns.reduce((a, x) => a + x.cost * i.qty, 0), 0);
  const tax = items.reduce(
    (s, i) =>
      s +
      (i.cost * i.qty * i.taxPercent) / 100 +
      i.addOns.reduce((a, x) => a + (x.cost * i.qty * x.taxPercent) / 100, 0),
    0
  );
  const gross = getTotal();

  const applyCode = () => {
    setAppliedCode(code.trim() || undefined);
    setToast('Code will be applied at checkout');
    setTimeout(() => setToast(''), 2000);
  };

  const checkout = async () => {
    setSubmitting(true);
    try {
      await placeOrder({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        discountCode: appliedCode,
      });
      clearCart();
      setOpen(false);
      nav('/orders');
    } catch {
      setToast('Order failed');
      setTimeout(() => setToast(''), 2500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Toast message={toast} open={!!toast} />
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.aside
            className="fixed right-0 top-0 z-[130] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-bold">Your cart</h2>
              <button type="button" className="text-2xl leading-none text-neutral-500" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              {items.length === 0 ? (
                <p className="py-8 text-center text-neutral-500">Cart is empty</p>
              ) : (
                items.map((i) => (
                  <CartItemRow
                    key={i.productId}
                    item={i}
                    onQty={(q) => updateQty(i.productId, q)}
                    onRemove={() => removeItem(i.productId)}
                  />
                ))
              )}
            </div>
            <div className="border-t bg-offwhite p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal (ex tax)</span>
                <span>{formatCurrency(subtotalPreTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-brand">
                <span>Total</span>
                <span>{formatCurrency(gross)}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Discount code"
                  className="flex-1 rounded-lg border px-2 py-2 text-sm"
                />
                <button type="button" className="rounded-lg border px-3 text-sm font-medium" onClick={applyCode}>
                  Apply
                </button>
              </div>
              <button
                type="button"
                disabled={items.length === 0 || submitting}
                onClick={() => void checkout()}
                className="mt-2 w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50"
              >
                {submitting ? 'Placing…' : 'Place order'}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
