import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useLockBody } from '../../hooks/useLockBody';

/**
 * Reusable confirmation modal (used before destructive actions).
 */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  useLockBody(open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] grid place-items-center bg-ink-950/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-[var(--shadow-lift)]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-red-600">
              <AlertTriangle size={24} />
            </span>
            <h2 className="mt-4 font-display text-2xl text-ink-900">{title}</h2>
            <p className="mt-2 text-ink-500">{message}</p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
