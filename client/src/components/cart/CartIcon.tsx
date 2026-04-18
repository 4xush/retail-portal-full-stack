import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';

export function CartIcon() {
  const count = useCartStore((s) => s.getItemCount());
  const setOpen = useCartStore((s) => s.setDrawerOpen);

  return (
    <button
      type="button"
      className="relative rounded-full border border-neutral-200 bg-white p-2 shadow-sm"
      aria-label="Open cart"
      onClick={() => setOpen(true)}
    >
      <span className="text-xl">🛒</span>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
