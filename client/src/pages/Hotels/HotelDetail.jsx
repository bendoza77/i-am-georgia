import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ChevronRight, ChevronLeft, BedDouble, Check, Info, ArrowRight } from 'lucide-react';
import Section from '../../components/ui/Section';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SmartImage from '../../components/ui/SmartImage';
import CTA from '../../components/sections/CTA';
import { useSheetHotels } from '../../hooks';
import { fadeUp, viewportOnce } from '../../animations/variants';

/** Star row for the hotel class. */
function Stars({ count }) {
  if (!count) return null;
  return (
    <span className="flex items-center gap-0.5" aria-label={`${count}-star hotel`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={16} className="fill-gold-400 text-gold-400" />
      ))}
    </span>
  );
}

export default function HotelDetail() {
  const { id } = useParams();
  const { hotels, loading, error } = useSheetHotels();
  const hotel = useMemo(() => hotels.find((h) => h.id === id), [hotels, id]);

  // Every distinct price column across the rooms, kept in order of appearance.
  const priceLabels = useMemo(() => {
    if (!hotel) return [];
    const labels = [];
    hotel.rooms.forEach((r) =>
      Object.keys(r.prices).forEach((l) => {
        if (!labels.includes(l)) labels.push(l);
      }),
    );
    return labels;
  }, [hotel]);

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center text-ink-500">Loading hotel…</div>;
  }

  if (error || !hotel) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-ink-900/5 text-ink-400">
            <BedDouble size={28} />
          </span>
          <p className="text-ink-500">
            {error ? `Couldn’t load this hotel (${error}).` : 'We couldn’t find that hotel.'}
          </p>
          <Button to="/hotels" variant="outline" size="sm">
            <ChevronLeft size={16} /> Back to all hotels
          </Button>
        </div>
      </div>
    );
  }

  const [cover, ...gallery] = hotel.images;

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[58vh] min-h-[420px] items-end overflow-hidden bg-ink-950">
        <SmartImage
          src={cover}
          alt={hotel.name}
          fallbackSeed={hotel.id}
          wrapperClassName="absolute inset-0 h-full w-full"
          className="scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/30" />

        <div className="container-x relative z-10 pb-12 lg:pb-16">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="transition-colors hover:text-brand-400">Home</Link>
            <ChevronRight size={14} />
            <Link to="/hotels" className="transition-colors hover:text-brand-400">Hotels</Link>
            <ChevronRight size={14} />
            <span className="text-white/90">{hotel.name}</span>
          </nav>

          <div className="flex items-center gap-3">
            <Stars count={hotel.stars} />
            <Badge tone="glass">{hotel.rooms.length} room types</Badge>
          </div>

          <h1 className="mt-3 max-w-3xl font-display text-5xl text-white sm:text-6xl">{hotel.name}</h1>

          {hotel.pricePerNight != null && (
            <p className="mt-4 text-lg text-white/80">
              From <span className="font-display text-2xl text-white">{hotel.priceLabel}</span>
              <span className="text-white/60"> / night</span>
            </p>
          )}
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <Section className="bg-white" containerClassName="">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-[var(--radius-lg)]">
                <SmartImage
                  src={src}
                  alt={`${hotel.name} photo ${i + 1}`}
                  fallbackSeed={`${hotel.id}-${i}`}
                  wrapperClassName="aspect-[4/3] w-full"
                  className="transition-transform duration-700 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Rooms & rates + sidebar */}
      <Section className="bg-sand-50">
        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          {/* Main */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
              Rooms &amp; rates
            </span>
            <h2 className="mt-2 font-display text-4xl text-ink-900">Choose your room</h2>
            <p className="mt-3 max-w-prose text-ink-500">
              Live prices from our reservation system. Rates are per night unless noted.
            </p>

            {hotel.rooms.length > 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="mt-8 overflow-hidden rounded-[var(--radius-xl)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]"
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 bg-sand-50/60">
                        <th className="px-5 py-4 font-semibold text-ink-900">Room type</th>
                        {priceLabels.map((label) => (
                          <th key={label} className="whitespace-nowrap px-5 py-4 text-right font-semibold text-ink-700">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hotel.rooms.map((room, i) => (
                        <tr key={i} className="border-b border-ink-100 last:border-0 hover:bg-sand-50/50">
                          <td className="px-5 py-4 font-medium text-ink-900">
                            <span className="flex items-center gap-2">
                              <BedDouble size={16} className="text-brand-500" />
                              {room.category}
                            </span>
                          </td>
                          {priceLabels.map((label) => (
                            <td key={label} className="whitespace-nowrap px-5 py-4 text-right text-ink-700">
                              {room.prices[label] ? (
                                <span className="font-semibold text-ink-900">{room.prices[label]}</span>
                              ) : (
                                <span className="text-ink-300">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <p className="mt-8 rounded-[var(--radius-lg)] border border-ink-100 bg-white p-6 text-ink-500">
                Room rates for this hotel are available on request.
              </p>
            )}

            {/* Good to know */}
            {hotel.notes.length > 0 && (
              <div className="mt-10">
                <h3 className="flex items-center gap-2 font-display text-2xl text-ink-900">
                  <Info size={20} className="text-brand-500" /> Good to know
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {hotel.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-600">
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-500" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sticky booking sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[var(--radius-xl)] border border-ink-100 bg-white p-7 shadow-[var(--shadow-lift)]">
              <div className="flex items-center justify-between">
                <Stars count={hotel.stars} />
                <Badge tone="solid">{hotel.type}</Badge>
              </div>

              <div className="mt-5 border-t border-ink-100 pt-5">
                <span className="text-xs font-medium uppercase tracking-wider text-ink-500">
                  {hotel.pricePerNight != null ? 'Rates from' : 'Pricing'}
                </span>
                <div className="mt-1 font-display text-4xl text-ink-900">
                  {hotel.pricePerNight != null ? hotel.priceLabel : 'On request'}
                </div>
                {hotel.pricePerNight != null && <span className="text-sm text-ink-500">per night</span>}
              </div>

              <Button to="/contact" size="lg" className="mt-6 w-full justify-center">
                Enquire &amp; book <ArrowRight size={18} />
              </Button>

              <Button to="/hotels" variant="ghost" size="sm" className="mt-3 w-full justify-center">
                <ChevronLeft size={16} /> All hotels
              </Button>
            </div>
          </aside>
        </div>
      </Section>

      <CTA />
    </>
  );
}
