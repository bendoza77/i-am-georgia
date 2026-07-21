import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery } from '../../hooks';
import { cn } from '../../utils/cn';
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  addMonths,
  buildMonthGrid,
  isSameDay,
  nightsBetween,
  seasonCovers,
  startOfDay,
  today,
  toISO,
} from '../../utils/booking';

const EASE = [0.16, 1, 0.3, 1];

/**
 * One day cell. The range highlight is painted by an absolutely positioned
 * bar behind the label so the row reads as a continuous band; the endpoints
 * get their own spring-scaled disc.
 */
function Day({ date, state, onSelect, onHover, disabled, seasonLabel, reduced }) {
  const { isStart, isEnd, inRange, isToday } = state;
  const isEdge = isStart || isEnd;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(date)}
      onMouseEnter={() => onHover(date)}
      onFocus={() => onHover(date)}
      aria-label={date.toDateString()}
      aria-pressed={isEdge}
      title={seasonLabel || undefined}
      className={cn(
        'relative grid h-11 w-full place-items-center text-sm font-medium outline-offset-2',
        'transition-colors duration-200',
        disabled
          ? 'cursor-not-allowed text-ink-300'
          : 'cursor-pointer text-ink-700 hover:text-ink-900',
        isEdge && 'text-white hover:text-white',
      )}
    >
      {/* Continuous band between the two endpoints */}
      {inRange && !isEdge && (
        <span className="absolute inset-y-1 -inset-x-px bg-brand-500/12" aria-hidden="true" />
      )}
      {/* Half-bands so the band starts/ends under the endpoint discs */}
      {isStart && !isEnd && <span className="absolute inset-y-1 right-0 w-1/2 bg-brand-500/12" aria-hidden="true" />}
      {isEnd && !isStart && <span className="absolute inset-y-1 left-0 w-1/2 bg-brand-500/12" aria-hidden="true" />}

      {isEdge && (
        <motion.span
          layout={!reduced}
          initial={reduced ? false : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 30 }}
          className="absolute inset-y-0.5 left-1/2 aspect-square -translate-x-1/2 rounded-full bg-ink-900 shadow-[var(--shadow-soft)]"
          aria-hidden="true"
        />
      )}

      <span className="relative z-10 tabular-nums">{date.getDate()}</span>

      {isToday && !isEdge && (
        <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-brand-500" aria-hidden="true" />
      )}
      {/* Season dot: a night we have a published rate for */}
      {seasonLabel && !isEdge && !inRange && (
        <span className="absolute inset-x-2 bottom-0 h-px bg-brand-500/25" aria-hidden="true" />
      )}
    </button>
  );
}

/** One month: heading, weekday rule and the 6x7 grid. */
function Month({ year, month, cellProps }) {
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  return (
    <div className="min-w-0 flex-1">
      <p className="mb-3 text-center font-display text-lg text-ink-900">
        {MONTH_LABELS[month]} <span className="text-ink-400">{year}</span>
      </p>
      <div className="grid grid-cols-7 border-b border-ink-100 pb-2">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d} className="text-center text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">
            {d.slice(0, 2)}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7">
        {cells.map((date, i) =>
          date ? <Day key={toISO(date)} date={date} {...cellProps(date)} /> : <span key={`e${i}`} className="h-11" />,
        )}
      </div>
    </div>
  );
}

/**
 * Two-month (one on phones) range picker built on the booking date helpers.
 *
 * @param {{from: Date|null, to: Date|null}} value
 * @param {(next: {from: Date|null, to: Date|null}) => void} onChange
 * @param {Array} seasons  parsed rate seasons — used to mark priced nights
 */
export default function DateRangePicker({ value, onChange, seasons = [], minNights = 1, className }) {
  const reduced = useReducedMotion();
  const twoUp = useMediaQuery('(min-width: 768px)');
  const min = today();

  const [cursor, setCursor] = useState(() => addMonths(value.from || min, 0));
  const [hovered, setHovered] = useState(null);
  const [dir, setDir] = useState(1);

  const move = (step) => {
    setDir(step);
    setCursor((c) => addMonths(c, step));
  };

  // While picking the end date the hovered day stands in for it, so the band
  // follows the cursor instead of appearing only after the second click.
  const previewEnd = value.from && !value.to && hovered && hovered > value.from ? hovered : value.to;

  const select = (date) => {
    const day = startOfDay(date);
    // No start yet, or restarting: a click before the current start, or on a
    // complete range, begins a new selection.
    if (!value.from || value.to || day <= value.from) {
      onChange({ from: day, to: null });
      return;
    }
    if (nightsBetween(value.from, day) < minNights) {
      onChange({ from: day, to: null });
      return;
    }
    onChange({ from: value.from, to: day });
  };

  const cellProps = (date) => {
    const disabled = date < min;
    const isStart = isSameDay(date, value.from);
    const isEnd = isSameDay(date, previewEnd);
    const inRange = !!value.from && !!previewEnd && date > value.from && date < previewEnd;
    const season = seasons.find((s) => seasonCovers(s.range, date));

    return {
      disabled,
      onSelect: select,
      onHover: setHovered,
      reduced,
      seasonLabel: season?.table.label ?? '',
      state: { isStart, isEnd, inRange, isToday: isSameDay(date, min) },
    };
  };

  const months = twoUp ? [cursor, addMonths(cursor, 1)] : [cursor];
  const canGoBack = cursor > addMonths(min, 0);

  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border border-ink-100 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6',
        className,
      )}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <NavButton onClick={() => move(-1)} disabled={!canGoBack} label="Previous month">
          <ChevronLeft size={18} />
        </NavButton>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
          {value.from && value.to ? 'Your stay' : value.from ? 'Pick your check-out' : 'Pick your check-in'}
        </p>

        <NavButton onClick={() => move(1)} label="Next month">
          <ChevronRight size={18} />
        </NavButton>
      </div>

      {/* `mode="popLayout"` keeps the outgoing months from pushing the height
          around while the new ones slide in. */}
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout" custom={dir}>
          <motion.div
            key={`${cursor.getFullYear()}-${cursor.getMonth()}-${twoUp}`}
            custom={dir}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex gap-8"
          >
            {months.map((m) => (
              <Month
                key={`${m.getFullYear()}-${m.getMonth()}`}
                year={m.getFullYear()}
                month={m.getMonth()}
                cellProps={cellProps}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <span className="flex items-center gap-2 text-xs text-ink-400">
          <span className="h-2 w-2 rounded-full bg-brand-500" /> Today
          <span className="ml-3 h-px w-4 bg-brand-500/40" /> Nights with published rates
        </span>
        {(value.from || value.to) && (
          <button
            type="button"
            onClick={() => onChange({ from: null, to: null })}
            className="text-xs font-semibold text-ink-500 underline-offset-4 transition-colors hover:text-brand-600 hover:underline"
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}

/** Circular month-nav control. */
function NavButton({ onClick, disabled, label, children }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      whileHover={disabled ? undefined : { scale: 1.08 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink-200 text-ink-700',
        'transition-colors duration-200 hover:border-brand-400 hover:text-brand-600',
        disabled && 'pointer-events-none opacity-35',
      )}
    >
      {children}
    </motion.button>
  );
}
