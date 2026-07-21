import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

/** Round +/- control. Disabled ends stay visible but inert. */
function Step({ onClick, disabled, label, children }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      whileHover={disabled ? undefined : { scale: 1.1 }}
      whileTap={disabled ? undefined : { scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 520, damping: 26 }}
      className={cn(
        'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink-200 text-ink-700',
        'transition-colors duration-200 hover:border-brand-400 hover:text-brand-600',
        disabled && 'pointer-events-none opacity-30',
      )}
    >
      {children}
    </motion.button>
  );
}

/**
 * One counted row (adults, children, rooms). The number swaps with a short
 * vertical roll so a change is felt rather than just seen.
 */
function CounterRow({ label, hint, value, onChange, min = 0, max = 12 }) {
  const reduced = useReducedMotion();

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="min-w-0">
        <span className="block font-semibold text-ink-900">{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-ink-500">{hint}</span>}
      </span>

      <span className="flex shrink-0 items-center gap-2">
        <Step onClick={() => onChange(value - 1)} disabled={value <= min} label={`One fewer ${label}`}>
          <Minus size={16} />
        </Step>

        <span className="relative grid h-10 w-10 place-items-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={reduced ? { opacity: 0 } : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: -14, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute font-display text-xl tabular-nums text-ink-900"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </span>

        <Step onClick={() => onChange(value + 1)} disabled={value >= max} label={`One more ${label}`}>
          <Plus size={16} />
        </Step>
      </span>
    </div>
  );
}

/**
 * Guest mix picker: adults, children and room count.
 * @param {{adults:number, children:number, rooms:number}} value
 */
export default function GuestCounter({ value, onChange, className }) {
  const set = (key) => (next) => onChange({ ...value, [key]: next });

  return (
    <div
      className={cn(
        'divide-y divide-ink-100 rounded-[var(--radius-xl)] border border-ink-100 bg-white px-5 shadow-[var(--shadow-soft)] sm:px-6',
        className,
      )}
    >
      <CounterRow label="Adults" hint="13 years and over" value={value.adults} onChange={set('adults')} min={1} />
      <CounterRow label="Children" hint="Ages 0–12 — policies apply" value={value.children} onChange={set('children')} />
      <CounterRow label="Rooms" hint="Rate is charged per room, per night" value={value.rooms} onChange={set('rooms')} min={1} max={6} />
    </div>
  );
}
