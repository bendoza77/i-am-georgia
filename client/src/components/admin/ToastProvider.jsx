import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = { success: Check, error: AlertCircle, info: Info };
const TONES = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-brand-600',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message, type = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[120] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] ?? Info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-ink-100 bg-white py-3 pl-3 pr-4 shadow-[var(--shadow-lift)]"
              >
                <span className={`grid h-8 w-8 place-items-center rounded-full bg-ink-50 ${TONES[t.type]}`}>
                  <Icon size={17} />
                </span>
                <p className="text-sm font-medium text-ink-800">{t.message}</p>
                <button onClick={() => dismiss(t.id)} className="text-ink-300 hover:text-ink-600" aria-label="Dismiss">
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx ?? { toast: () => {} };
}
