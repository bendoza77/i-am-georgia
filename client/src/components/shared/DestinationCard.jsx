import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, ArrowUpRight } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import Badge from '../ui/Badge';
import { cn } from '../../utils/cn';

/**
 * Editorial destination card with image zoom, lift and reveal on hover.
 */
export default function DestinationCard({ item, className, large = false }) {
  return (
    <motion.article
      whileHover="hover"
      initial="rest"
      animate="rest"
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]',
        large ? 'aspect-[4/5] sm:aspect-[16/13]' : 'aspect-[4/5]',
        className,
      )}
    >
      <Link to="/destinations" className="absolute inset-0 z-20" aria-label={`Explore ${item.name}`} />

      <motion.div
        variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <SmartImage src={item.image} alt={item.name} fallbackSeed={item.id} wrapperClassName="h-full w-full" />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-ink-950/5" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <Badge tone="glass" className="backdrop-blur-md">
          <MapPin size={12} /> {item.region}
        </Badge>
        <span className="glass flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-900">
          <Star size={12} className="fill-gold-500 text-gold-500" /> {item.rating}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6">
        <motion.div
          variants={{ rest: { y: 0 }, hover: { y: -6 } }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
            {item.category}
          </span>
          <h3 className="mt-1.5 flex items-center gap-2 font-display text-2xl text-white sm:text-3xl">
            {item.name}
            <ArrowUpRight
              size={22}
              className="opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100"
            />
          </h3>
          <motion.p
            variants={{ rest: { opacity: 0, height: 0 }, hover: { opacity: 1, height: 'auto' } }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden text-sm leading-relaxed text-white/75"
          >
            <span className="block pt-2">{item.tagline}</span>
          </motion.p>
        </motion.div>
      </div>
    </motion.article>
  );
}
