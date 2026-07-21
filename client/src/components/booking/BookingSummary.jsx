import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarRange, BedDouble, Moon, Users } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import { cn } from '../../utils/cn';
import { formatPrice } from '../../utils/adaptHotel';
import { formatDateShort, guestLabel, nightsBetween } from '../../utils/booking';

const EASE = [0.16, 1, 0.3, 1];

/** A price that rolls when it changes — the quote should feel live. */
export function AnimatedPrice({ value, currency, className }) {
  const reduced = useReducedMotion();
  return (
    <span className={cn('relative inline-grid overflow-hidden', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduced ? { opacity: 0 } : { y: '65%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={reduced ? { opacity: 0, position: 'absolute' } : { y: '-65%', opacity: 0, position: 'absolute' }}
          transition={{ duration: 0.35, ease: EASE }}
          className="tabular-nums"
        >
          {formatPrice(value, currency)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Label / value line. Values that are not chosen yet read as a soft dash. */
function Line({ icon: Icon, label, value, muted }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="flex shrink-0 items-center gap-2 text-sm text-ink-500">
        <Icon size={14} className="text-brand-500" />
        {label}
      </span>
      <span className={cn('text-right text-sm font-semibold', muted ? 'text-ink-400' : 'text-ink-900')}>
        {value}
      </span>
    </div>
  );
}

/**
 * Live quote panel. Sticky beside the wizard on desktop; the same component
 * fills the mobile sheet, so there is exactly one place the numbers are built.
 */
export default function BookingSummary({ hotel, draft, quote, extrasTotal, className }) {
  const { from, to, guests, roomType, rateKey } = draft;
  const currency = hotel.currency;
  const grandTotal = quote.total * guests.rooms + extrasTotal;
  // The quote only has a night count once a room is chosen; the stay length is
  // known as soon as the dates are.
  const nights = nightsBetween(from, to);
  const rateLabel = rateKey ? rateKey.replace(' · ', ' · ') : null;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-xl)] border border-ink-100 bg-white shadow-[var(--shadow-lift)]',
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-ink-100 p-4">
        <SmartImage
          src={hotel.images[0]}
          alt={hotel.name}
          fallbackSeed={hotel.id}
          w={140}
          wrapperClassName="h-16 w-16 shrink-0 rounded-[var(--radius-sm)]"
        />
        <span className="min-w-0">
          <span className="block truncate font-display text-lg leading-tight text-ink-900">{hotel.name}</span>
          <span className="mt-0.5 block text-xs text-ink-400">
            {hotel.year ? `${hotel.year} published rates` : 'Live rates'}
          </span>
        </span>
      </div>

      {/* The running total leads the card. It is the number a guest tracks
          while they choose, and at the bottom it would sit under the site's
          floating back-to-top / concierge controls. */}
      <div className="flex items-end justify-between gap-3 border-b border-ink-100 bg-sand-50/60 px-4 py-3.5">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">Total</span>
        <AnimatedPrice
          value={grandTotal}
          currency={currency}
          className="font-display text-3xl leading-none text-ink-900"
        />
      </div>

      <div className="divide-y divide-ink-100 px-4">
        <Line
          icon={CalendarRange}
          label="Dates"
          muted={!from || !to}
          value={from && to ? `${formatDateShort(from)} → ${formatDateShort(to)}` : 'Not chosen'}
        />
        <Line icon={Moon} label="Nights" muted={!nights} value={nights || '—'} />
        <Line icon={Users} label="Guests" value={guestLabel(guests)} />
        <Line
          icon={BedDouble}
          label="Room"
          muted={!roomType}
          value={roomType ? <span className="block max-w-[9rem] truncate">{roomType}</span> : 'Not chosen'}
        />
        {rateLabel && (
          <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="text-sm text-ink-500">Rate</span>
            <span className="max-w-[10rem] text-right text-sm font-medium text-ink-700">{rateLabel}</span>
          </div>
        )}
      </div>

      {/* Per-season billing lines — only interesting once a stay crosses a
          season boundary, so a single-segment stay stays quiet. */}
      <AnimatePresence initial={false}>
        {quote.segments.length > 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden border-t border-ink-100 bg-sand-50/60 px-4"
          >
            <p className="pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-400">
              Season split
            </p>
            <ul className="py-2">
              {quote.segments.map((s, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-1 text-xs text-ink-600">
                  <span className="truncate">
                    {s.nights} × {s.seasonLabel || 'Standard'}
                  </span>
                  <span className="shrink-0 font-semibold text-ink-900">
                    {formatPrice(s.subtotal, currency)}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-ink-100 p-4">
        {quote.total > 0 && (
          <div className="mb-2 flex items-center justify-between text-sm text-ink-500">
            <span>
              {quote.nightCount} night{quote.nightCount === 1 ? '' : 's'}
              {guests.rooms > 1 && ` × ${guests.rooms} rooms`}
            </span>
            <span className="font-semibold text-ink-700">
              {formatPrice(quote.total * guests.rooms, currency)}
            </span>
          </div>
        )}
        {extrasTotal > 0 && (
          <div className="mb-2 flex items-center justify-between text-sm text-ink-500">
            <span>Extras</span>
            <span className="font-semibold text-ink-700">{formatPrice(extrasTotal, currency)}</span>
          </div>
        )}

        <p className="text-xs leading-relaxed text-ink-400">
          Estimate based on published {currency} rates. Nothing is charged now — we confirm
          availability and the final total by email.
        </p>
      </div>
    </div>
  );
}
