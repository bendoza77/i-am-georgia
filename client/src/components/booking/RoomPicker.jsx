import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BedDouble, Check, UtensilsCrossed, Users } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import { cn } from '../../utils/cn';
import { formatPrice } from '../../utils/adaptHotel';
import { optionsForRoom } from '../../utils/booking';

const EASE = [0.16, 1, 0.3, 1];

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardIn = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Rate chip — one occupancy / meal-plan combination for a room. */
function RateChip({ option, active, onSelect, currency }) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 480, damping: 30 }}
      aria-pressed={active}
      className={cn(
        'relative flex min-w-0 flex-col items-start gap-0.5 rounded-[var(--radius-sm)] border px-4 py-3 text-left',
        'transition-colors duration-300',
        active
          ? 'border-brand-500 bg-brand-500/8'
          : 'border-ink-200 hover:border-brand-300 hover:bg-sand-50',
      )}
    >
      <span className="flex w-full items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500">
        <Users size={12} className="shrink-0 text-brand-500" />
        <span className="truncate">{option.label}</span>
      </span>
      {option.mealPlan && (
        <span className="flex items-center gap-1.5 text-xs text-ink-400">
          <UtensilsCrossed size={11} /> {option.mealPlan}
        </span>
      )}
      <span className="mt-1 font-display text-lg leading-none text-ink-900">
        {formatPrice(option.price, currency)}
        <span className="ml-1 text-xs font-sans font-normal text-ink-400">/ night</span>
      </span>

      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 26 }}
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-glow)]"
          >
            <Check size={13} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/** One room type: photo, cheapest rate, and every bookable rate beneath it. */
function RoomCard({ hotel, row, table, index, selection, onSelect, reduced }) {
  const options = optionsForRoom(table, row.roomType);
  const isSelected = selection.roomType === row.roomType;
  const image = hotel.images[(index + 1) % hotel.images.length];

  return (
    <motion.article
      variants={cardIn}
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-xl)] border bg-white transition-[border-color,box-shadow] duration-500',
        isSelected
          ? 'border-brand-400 shadow-[var(--shadow-lift)]'
          : 'border-ink-100 shadow-[var(--shadow-soft)] hover:border-ink-200',
      )}
    >
      {/* Selected accent rail — travels between cards with a shared layoutId */}
      {isSelected && (
        <motion.span
          layoutId={reduced ? undefined : 'room-rail'}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          className="absolute inset-y-0 left-0 z-10 w-1 bg-brand-500"
          aria-hidden="true"
        />
      )}

      <div className="grid gap-0 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <div className="relative hidden sm:block">
          <SmartImage
            src={image}
            alt={row.roomType}
            fallbackSeed={`${hotel.id}-${row.roomType}`}
            w={420}
            sizes="(min-width: 640px) 220px, 100vw"
            wrapperClassName="h-full min-h-[11rem] w-full"
            className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="flex min-w-0 items-center gap-2 font-display text-xl text-ink-900">
              <BedDouble size={18} className="shrink-0 text-brand-500" />
              <span className="truncate">{row.roomType}</span>
            </h3>
            {row.from != null && (
              <span className="shrink-0 text-sm text-ink-500">
                from{' '}
                <span className="font-display text-lg text-ink-900">
                  {formatPrice(row.from, table.currency)}
                </span>
              </span>
            )}
          </div>

          <p className="mt-1.5 text-sm text-ink-500">
            {options.length} rate{options.length === 1 ? '' : 's'} available for {table.label}
          </p>

          {options.length ? (
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {options.map((option) => (
                <RateChip
                  key={option.key}
                  option={option}
                  currency={table.currency}
                  active={isSelected && selection.rateKey === option.key}
                  onSelect={() => onSelect({ roomType: row.roomType, rateKey: option.key })}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-[var(--radius-sm)] bg-sand-50 px-4 py-3 text-sm text-ink-500">
              Rates for this room are on request — continue and our team will confirm.
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Room + rate selector for one season.
 *
 * @param {object} table    the active season's rate matrix
 * @param {{roomType: string|null, rateKey: string|null}} selection
 */
export default function RoomPicker({ hotel, table, selection, onSelect }) {
  const reduced = useReducedMotion();
  const rows = table?.rows ?? [];

  if (!rows.length) {
    return (
      <p className="rounded-[var(--radius-xl)] border border-ink-100 bg-white p-6 text-ink-500">
        No published rooms for this period. Send us the dates and we'll quote you directly.
      </p>
    );
  }

  return (
    <motion.div
      variants={listStagger}
      initial="hidden"
      animate="show"
      // Re-keyed by season upstream, so the list re-staggers when the guest
      // switches period rather than silently swapping prices.
      className="grid gap-4"
    >
      {rows.map((row, i) => (
        <RoomCard
          key={row.roomType}
          hotel={hotel}
          row={row}
          table={table}
          index={i}
          selection={selection}
          onSelect={onSelect}
          reduced={reduced}
        />
      ))}
    </motion.div>
  );
}
