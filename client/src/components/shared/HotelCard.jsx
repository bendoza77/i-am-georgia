import { motion } from 'framer-motion';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import Badge from '../ui/Badge';
import AmenityIcon from '../admin/AmenityIcon';
import { AMENITIES } from '../../constants/hotels';
import { cn } from '../../utils/cn';

const AMENITY_LABEL = Object.fromEntries(AMENITIES.map((a) => [a.id, a.label]));

/** Row of five-pointed stars for the hotel class rating. */
function Stars({ count }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${count}-star hotel`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} className="fill-gold-500 text-gold-500" />
      ))}
    </span>
  );
}

/**
 * Editorial hotel card — image with price + class overlay, amenity strip,
 * review score and an animated CTA. Mirrors the TourCard visual language.
 */
export default function HotelCard({ hotel, className }) {
  const cover = hotel.images?.[0];
  const amenities = (hotel.amenities ?? []).slice(0, 5);
  const soldOut = hotel.available === false;

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-ink-100 bg-white shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]',
        className,
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <SmartImage
          src={cover}
          alt={hotel.name}
          fallbackSeed={hotel.id}
          wrapperClassName="h-full w-full"
          className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/45 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge tone="solid">{hotel.type}</Badge>
          {hotel.featured && <Badge tone="gold">Featured</Badge>}
        </div>

        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/45 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/95 px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-900">
              Fully booked
            </span>
          </div>
        )}

        <div className="glass absolute bottom-4 right-4 flex flex-col items-end rounded-2xl px-4 py-2 text-right">
          <span className="text-[0.65rem] font-medium uppercase tracking-wider text-ink-500">
            per night
          </span>
          <span className="font-display text-2xl leading-none text-ink-900">
            ${hotel.pricePerNight}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <Stars count={hotel.stars} />
          <div className="flex items-center gap-1.5 text-sm text-ink-500">
            <Star size={15} className="fill-gold-500 text-gold-500" />
            <span className="font-semibold text-ink-900">{hotel.rating}</span>
            <span className="text-ink-400">({hotel.reviews})</span>
          </div>
        </div>

        <h3 className="font-display text-2xl leading-tight text-ink-900 transition-colors group-hover:text-brand-600">
          {hotel.name}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
          <MapPin size={14} className="text-brand-500" /> {hotel.city}
        </p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">{hotel.tagline}</p>

        <div className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-5 text-ink-500">
          {amenities.map((id) => (
            <span key={id} title={AMENITY_LABEL[id]} className="text-brand-500/90">
              <AmenityIcon name={id} size={18} />
            </span>
          ))}
          {hotel.amenities?.length > 5 && (
            <span className="text-xs font-semibold text-ink-400">
              +{hotel.amenities.length - 5}
            </span>
          )}
        </div>

        <button
          type="button"
          className="mt-6 inline-flex items-center justify-between rounded-full bg-sand-100 px-5 py-3 text-sm font-semibold text-ink-900 transition-colors duration-300 hover:bg-ink-900 hover:text-white"
        >
          View hotel
          <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </motion.article>
  );
}
