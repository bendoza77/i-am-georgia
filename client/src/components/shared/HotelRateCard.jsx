import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BedDouble, CalendarRange, UtensilsCrossed } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import Badge from '../ui/Badge';
import { formatPrice } from '../../utils/adaptHotel';
import { cn } from '../../utils/cn';

/** Icon + value + caption, used for the three-up meta strip. */
function Meta({ icon: Icon, value, label, className }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="flex min-w-0 items-center gap-1.5 text-ink-900">
        <Icon size={15} className="shrink-0 text-brand-500" />
        <span className="truncate text-sm font-semibold">{value}</span>
      </span>
      <span className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ink-400">
        {label}
      </span>
    </div>
  );
}

/**
 * Editorial card for a rate-sheet hotel. Everything shown is derived from the
 * imported sheet: the season count, the room categories and the price range —
 * there are no star ratings or reviews in this data set.
 */
export default function HotelRateCard({ hotel, to, className }) {
  const rooms = hotel.roomTypes.slice(0, 2);
  const extraRooms = hotel.roomTypes.length - rooms.length;
  const hasRange = hotel.priceTo != null && hotel.priceTo !== hotel.priceFrom;

  const Wrapper = to ? motion(Link) : motion.article;

  return (
    <Wrapper
      {...(to ? { to } : {})}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-ink-100 bg-white shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]',
        className,
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <SmartImage
          src={hotel.images?.[0]}
          alt={hotel.name}
          fallbackSeed={hotel.id}
          wrapperClassName="h-full w-full"
          className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/55 via-ink-950/5 to-transparent" />

        {/* Kept to a single row: a wrapping badge stack would cover the photo
            once the card narrows to two-up. */}
        <div className="absolute inset-x-4 top-4 flex items-center gap-2 overflow-hidden">
          <Badge tone="solid" className="shrink-0">
            {hotel.year ? `${hotel.year} rates` : 'Live rates'}
          </Badge>
          {hotel.guestTags[0] && (
            <Badge tone="glass" className="hidden shrink-0 xl:inline-flex">
              {hotel.guestTags[0]}
            </Badge>
          )}
        </div>

        <div className="glass absolute bottom-4 right-4 flex flex-col items-end rounded-2xl px-4 py-2 text-right">
          <span className="text-[0.65rem] font-medium uppercase tracking-wider text-ink-500">
            {hotel.priceFrom == null ? 'rates' : 'from / night'}
          </span>
          <span className="font-display text-2xl leading-none text-ink-900">
            {hotel.priceLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-balance font-display text-xl leading-tight text-ink-900 transition-colors group-hover:text-brand-600 sm:text-2xl">
          {hotel.name}
        </h3>

        {rooms.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {rooms.map((room) => (
              <span
                key={room}
                title={room}
                className="max-w-full truncate rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-ink-600"
              >
                {room}
              </span>
            ))}
            {extraRooms > 0 && (
              <span className="rounded-full px-2 py-1 text-xs font-semibold text-ink-400">
                +{extraRooms} more
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Two short numeric facts share a row; the board label — free text
            that can run long — always gets the full card width. */}
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-ink-100 pt-5">
          <Meta icon={BedDouble} value={hotel.roomTypes.length || '—'} label="Room types" />
          <Meta icon={CalendarRange} value={hotel.seasonCount || '—'} label="Seasons" />
          <Meta
            icon={UtensilsCrossed}
            value={hotel.boardLabel}
            label="Board"
            className="col-span-2"
          />
        </div>

        {hasRange && (
          <p className="mt-4 text-xs text-ink-400">
            Rate range {hotel.priceLabel} – {formatPrice(hotel.priceTo, hotel.currency)} per night
          </p>
        )}

        <span className="mt-5 inline-flex items-center justify-between rounded-full bg-sand-100 px-5 py-3 text-sm font-semibold text-ink-900 transition-colors duration-300 group-hover:bg-ink-900 group-hover:text-white">
          View rates
          <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Wrapper>
  );
}

/** Matching placeholder shown while the API request is in flight. */
export function HotelRateCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
      <div className="skeleton aspect-[16/11] w-full" />
      <div className="flex flex-col gap-3 p-6">
        <div className="skeleton h-7 w-3/4 rounded-full" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="skeleton mt-3 h-12 w-full rounded-lg" />
        <div className="skeleton mt-2 h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
