import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Animated filter/tab pills with a shared sliding highlight (layoutId).
 */
export default function FilterPills({ items, active, onChange, layoutId = 'pill', className }) {
  return (
    <div className={cn('hide-scrollbar flex gap-2 overflow-x-auto', className)} role="tablist">
      {items.map((item) => {
        const isActive = item === active;
        return (
          <button
            key={item}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item)}
            className={cn(
              'relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300',
              isActive ? 'text-white' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-ink-900"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{item}</span>
          </button>
        );
      })}
    </div>
  );
}
