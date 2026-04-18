import { AnimatePresence, motion } from 'framer-motion';

export function Toast({
  message,
  open,
}: {
  message: string;
  open: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed bottom-4 right-4 z-[200] rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
