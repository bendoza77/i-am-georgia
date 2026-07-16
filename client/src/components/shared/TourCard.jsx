import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Gauge, CalendarDays, Users, ArrowRight } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import Badge from '../ui/Badge';
import { cn } from '../../utils/cn';

const META = [
  { key: 'days', icon: Clock, fmt: (t) => `${t.days} days` },
  { key: 'difficulty', icon: Gauge, fmt: (t) => t.difficulty },
  { key: 'season', icon: CalendarDays, fmt: (t) => t.season },
  { key: 'groupSize', icon: Users, fmt: (t) => `${t.groupSize} guests` },
];

/**
 * Premium tour card — glass price badge, meta grid, animated CTA.
 */
export default function TourCard({ tour, className }) {
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
          src={tour.image}
          alt={tour.title}
          fallbackSeed={tour.id}
          wrapperClassName="h-full w-full"
          className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/30 to-transparent" />

        <div className="absolute left-4 top-4">
          <Badge tone="solid">{tour.category}</Badge>
        </div>

        <div className="glass absolute bottom-4 right-4 flex flex-col items-end rounded-2xl px-4 py-2 text-right">
          <span className="text-[0.65rem] font-medium uppercase tracking-wider text-ink-500">from</span>
          <span className="font-display text-2xl leading-none text-ink-900">
            ${tour.price}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-1.5 text-sm text-ink-500">
          <Star size={15} className="fill-gold-500 text-gold-500" />
          <span className="font-semibold text-ink-900">{tour.rating}</span>
          <span>({tour.reviews} reviews)</span>
        </div>

        <h3 className="font-display text-2xl text-ink-900 transition-colors group-hover:text-brand-600">
          {tour.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{tour.summary}</p>

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-ink-100 pt-5">
          {META.map(({ key, icon: I, fmt }) => (
            <div key={key} className="flex items-center gap-2 text-sm text-ink-600">
              <I size={15} className="text-brand-500" />
              <span>{fmt(tour)}</span>
            </div>
          ))}
        </div>

        <Link
          to="/tours"
          className="mt-6 inline-flex items-center justify-between rounded-full bg-sand-100 px-5 py-3 text-sm font-semibold text-ink-900 transition-colors duration-300 hover:bg-ink-900 hover:text-white"
        >
          View journey
          <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}
