import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Accessible single-open accordion (used for FAQ).
 * @param {{q:string,a:string}[]} items
 */
export default function Accordion({ items, className }) {
  const [open, setOpen] = useState(0);

  return (
    <div className={cn('divide-y divide-ink-100', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="py-2">
            <h3>
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span
                  className={cn(
                    'font-display text-lg transition-colors sm:text-xl',
                    isOpen ? 'text-brand-600' : 'text-ink-900 group-hover:text-brand-600',
                  )}
                >
                  {item.q}
                </span>
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300',
                    isOpen
                      ? 'rotate-45 border-brand-500 bg-brand-500 text-white'
                      : 'border-ink-200 text-ink-500 group-hover:border-brand-400',
                  )}
                >
                  <Plus size={17} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 pr-12 leading-relaxed text-ink-500">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
