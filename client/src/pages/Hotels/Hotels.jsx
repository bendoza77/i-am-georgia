import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, MapPin, ArrowRight, BedDouble, Clock } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import Section from '../../components/ui/Section';
import SectionHeader from '../../components/ui/SectionHeader';
import FilterPills from '../../components/ui/FilterPills';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SmartImage from '../../components/ui/SmartImage';
import HotelCard from '../../components/shared/HotelCard';
import CTA from '../../components/sections/CTA';
import AmenityIcon from '../../components/admin/AmenityIcon';
import { useHotels } from '../../context/HotelsContext';
import { AMENITIES } from '../../constants/hotels';
import { staggerContainer, fadeUp, viewportOnce } from '../../animations/variants';
import { unsplash } from '../../utils/image';

const AMENITY_LABEL = Object.fromEntries(AMENITIES.map((a) => [a.id, a.label]));

const SORTS = {
  Recommended: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
  'Price: low to high': (a, b) => a.pricePerNight - b.pricePerNight,
  'Price: high to low': (a, b) => b.pricePerNight - a.pricePerNight,
  'Top rated': (a, b) => b.rating - a.rating,
  'Most stars': (a, b) => b.stars - a.stars,
};

/** Little five-pointed star row for a hotel's class. */
function Stars({ count }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${count}-star hotel`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={15} className="fill-gold-500 text-gold-500" />
      ))}
    </span>
  );
}

/** Full-width spotlight for the top featured stay. */
function Spotlight({ hotel }) {
  if (!hotel) return null;
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="group grid overflow-hidden rounded-[var(--radius-2xl)] border border-ink-100 bg-white shadow-[var(--shadow-lift)] lg:grid-cols-2"
    >
      <div className="relative aspect-[16/12] overflow-hidden lg:aspect-auto">
        <SmartImage
          src={hotel.images?.[0]}
          alt={hotel.name}
          fallbackSeed={hotel.id}
          wrapperClassName="h-full w-full"
          className="transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent lg:bg-gradient-to-r" />
        <div className="absolute left-5 top-5 flex gap-2">
          <Badge tone="gold">Featured stay</Badge>
          <Badge tone="glass">{hotel.type}</Badge>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-5 p-8 lg:p-12">
        <div className="flex items-center justify-between gap-4">
          <Stars count={hotel.stars} />
          <div className="flex items-center gap-1.5 text-sm text-ink-500">
            <Star size={16} className="fill-gold-500 text-gold-500" />
            <span className="font-semibold text-ink-900">{hotel.rating}</span>
            <span className="text-ink-400">({hotel.reviews} reviews)</span>
          </div>
        </div>

        <div>
          <h3 className="font-display text-4xl leading-[1.05] text-ink-900 sm:text-5xl">
            {hotel.name}
          </h3>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-500">
            <MapPin size={15} className="text-brand-500" /> {hotel.address}
          </p>
        </div>

        <p className="max-w-prose leading-relaxed text-ink-600">{hotel.description}</p>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-600">
          {(hotel.amenities ?? []).slice(0, 6).map((id) => (
            <span key={id} className="inline-flex items-center gap-2">
              <AmenityIcon name={id} size={16} className="text-brand-500" />
              {AMENITY_LABEL[id]}
            </span>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4 border-t border-ink-100 pt-6">
          <div className="flex items-end gap-1">
            <span className="font-display text-4xl text-ink-900">${hotel.pricePerNight}</span>
            <span className="pb-1 text-sm text-ink-500">/ night</span>
          </div>
          <Button size="md">
            Reserve now <ArrowRight size={17} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Hotels() {
  const { hotels } = useHotels();
  const [city, setCity] = useState('All');
  const [sort, setSort] = useState('Recommended');

  // Only published hotels are public-facing.
  const published = useMemo(
    () => hotels.filter((h) => h.status === 'published'),
    [hotels],
  );

  const cities = useMemo(
    () => ['All', ...Array.from(new Set(published.map((h) => h.city))).sort()],
    [published],
  );

  const spotlight = useMemo(
    () => published.find((h) => h.featured) ?? null,
    [published],
  );

  const stats = useMemo(() => {
    const count = published.length;
    const avg = count
      ? (published.reduce((s, h) => s + h.rating, 0) / count).toFixed(1)
      : '0.0';
    const cityCount = new Set(published.map((h) => h.city)).size;
    const from = count ? Math.min(...published.map((h) => h.pricePerNight)) : 0;
    return [
      { label: 'Handpicked stays', value: count },
      { label: 'Destinations', value: cityCount },
      { label: 'Avg. guest rating', value: avg },
      { label: 'Nightly rates from', value: `$${from}` },
    ];
  }, [published]);

  const filtered = useMemo(() => {
    const list = city === 'All' ? published : published.filter((h) => h.city === city);
    return [...list].sort(SORTS[sort]);
  }, [published, city, sort]);

  return (
    <>
      <PageHero
        eyebrow="Where you'll rest"
        title="Hotels & Stays"
        lead="From industrial-chic boutiques in Tbilisi to glass alpine lodges under Kazbek — a handpicked collection of places worth checking into."
        image={unsplash('1566073771259-6a8506099945', { w: 2000 })}
      />

      {/* Stats strip */}
      <section className="border-b border-ink-100 bg-white">
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="container-x grid grid-cols-2 gap-y-8 py-12 lg:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center">
              <div className="font-display text-4xl text-ink-900 sm:text-5xl">{s.value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Spotlight */}
      {spotlight && (
        <Section className="bg-sand-50">
          <SectionHeader
            eyebrow="The one to book first"
            title="Our featured stay"
            lead="The address our guests keep coming back to this season."
          />
          <div className="mt-10">
            <Spotlight hotel={spotlight} />
          </div>
        </Section>
      )}

      {/* Collection */}
      <Section className="bg-sand-100">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader eyebrow="The collection" title="Every stay in Georgia" />
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
              Sort by
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 rounded-full border border-ink-200 bg-white px-5 pr-9 text-sm font-semibold text-ink-900 outline-none transition-colors hover:border-brand-400 focus-visible:border-brand-500"
            >
              {Object.keys(SORTS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-b border-ink-200/70 pb-6 md:flex-row md:items-center md:justify-between">
          <FilterPills items={cities} active={city} onChange={setCity} layoutId="hotel-city" />
          <p className="shrink-0 text-sm text-ink-500">
            <span className="font-semibold text-ink-900">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'stay' : 'stays'}
            {city !== 'All' && (
              <>
                {' '}in <span className="font-semibold text-ink-900">{city}</span>
              </>
            )}
          </p>
        </div>

        <motion.div layout className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((hotel) => (
              <motion.div
                key={hotel.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <HotelCard hotel={hotel} className="h-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-ink-900/5 text-ink-400">
              <BedDouble size={28} />
            </span>
            <p className="text-ink-500">No stays in {city} just yet — try another destination.</p>
            <Button variant="outline" size="sm" onClick={() => setCity('All')}>
              Show all stays
            </Button>
          </div>
        )}

        {/* Reassurance row */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Star, title: 'Vetted in person', copy: 'Every property is visited and rated by our team.' },
            { icon: Clock, title: 'Free 24h cancellation', copy: 'Plans change — cancel within a day, no fees.' },
            { icon: MapPin, title: 'Local concierge', copy: 'On-the-ground support for the whole stay.' },
          ].map(({ icon: I, title, copy }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-ink-100 bg-white p-6"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-500/10 text-brand-600">
                <I size={20} />
              </span>
              <div>
                <h4 className="font-semibold text-ink-900">{title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <CTA />
    </>
  );
}
