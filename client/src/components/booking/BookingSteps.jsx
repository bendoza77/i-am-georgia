import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

const EASE = [0.16, 1, 0.3, 1];

/**
 * Wizard progress rail. Completed steps are clickable so a guest can go back
 * and change dates without losing the rest of the draft; steps ahead are inert.
 */
export default function BookingSteps({ steps, current, furthest, onJump, className }) {
  const reduced = useReducedMotion();
  const progress = steps.length > 1 ? current / (steps.length - 1) : 1;

  // Steps are equal-width flex columns, so the first and last discs sit half a
  // column in from each edge — the rail is inset to match, or it would run past
  // them on both sides.
  const inset = `${50 / steps.length}%`;

  return (
    <div className={cn('relative', className)}>
      {/* Rail sits behind the discs, centred on their 2.5rem height */}
      <div className="absolute top-5 h-px bg-ink-100" style={{ left: inset, right: inset }} aria-hidden="true" />
      <motion.div
        className="absolute top-5 h-px origin-left bg-brand-500"
        style={{ left: inset, right: inset }}
        initial={false}
        animate={{ scaleX: progress }}
        transition={{ type: 'spring', stiffness: 180, damping: 28 }}
        aria-hidden="true"
      />

      <ol className="relative flex items-start justify-between gap-2">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= furthest;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center text-center">
              <button
                type="button"
                onClick={() => reachable && onJump(i)}
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'relative grid h-10 w-10 place-items-center rounded-full border-2 bg-white',
                  'transition-[border-color,color,background-color] duration-300',
                  done && 'border-brand-500 bg-brand-500 text-white',
                  active && !done && 'border-brand-500 text-brand-600',
                  !done && !active && 'border-ink-200 text-ink-400',
                  reachable ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                {active && !reduced && (
                  <motion.span
                    layoutId="step-halo"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute -inset-1.5 rounded-full border border-brand-400/50"
                    aria-hidden="true"
                  />
                )}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={done ? 'check' : 'num'}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="relative z-10 text-sm font-bold tabular-nums"
                  >
                    {done ? <Check size={16} strokeWidth={3} /> : i + 1}
                  </motion.span>
                </AnimatePresence>
              </button>

              <span
                className={cn(
                  'mt-2.5 hidden text-xs font-semibold transition-colors duration-300 sm:block',
                  active ? 'text-ink-900' : 'text-ink-400',
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
