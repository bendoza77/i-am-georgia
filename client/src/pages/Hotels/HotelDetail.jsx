import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BabyIcon,
  BedDouble,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  PlusCircle,
  RefreshCw,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import Section from '../../components/ui/Section';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SmartImage from '../../components/ui/SmartImage';
import FilterPills from '../../components/ui/FilterPills';
import CTA from '../../components/sections/CTA';
import { useHotelApi } from '../../hooks';
import { formatPrice } from '../../utils/adaptHotel';
import { fadeUp, viewportOnce } from '../../animations/variants';

/** Icon + label + value row used inside the sidebar summary. */
function FactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="flex shrink-0 items-center gap-2 text-sm text-ink-500">
        <Icon size={15} className="text-brand-500" />
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-ink-900">{value}</span>
    </div>
  );
}

/** Card wrapper for the "good to know" blocks below the rate table. */
function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-ink-100 bg-white p-6">
      <h3 className="flex items-center gap-2 font-display text-xl text-ink-900">
        <Icon size={18} className="text-brand-500" /> {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/**
 * One season's rates. Wide screens get a proper matrix (room types x
 * occupancy/meal-plan columns); below `md` the same data is re-laid out as a
 * card per room type, because a 5-column price table cannot shrink honestly.
 */
function RateTable({ table }) {
  const { columns, rows, currency } = table;

  if (!rows.length) {
    return (
      <p className="rounded-[var(--radius-lg)] border border-ink-100 bg-white p-6 text-ink-500">
        Rates for this period are available on request.
      </p>
    );
  }

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="overflow-hidden rounded-[var(--radius-xl)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]"
    >
      {/* Desktop / tablet: full matrix */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{table.label} rates per night</caption>
          <thead>
            <tr className="border-b border-ink-100 bg-sand-50/60">
              <th scope="col" className="px-5 py-4 font-semibold text-ink-900">
                Room type
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="whitespace-nowrap px-5 py-4 text-right font-semibold text-ink-700"
                >
                  {col.label}
                  {col.mealPlan && (
                    <span className="ml-1.5 text-xs font-medium uppercase tracking-wider text-ink-400">
                      {col.mealPlan}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-ink-100 transition-colors last:border-0 hover:bg-sand-50/50">
                <th scope="row" className="px-5 py-4 text-left font-medium text-ink-900">
                  <span className="flex items-center gap-2">
                    <BedDouble size={16} className="shrink-0 text-brand-500" />
                    {row.roomType}
                  </span>
                </th>
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-5 py-4 text-right text-ink-700">
                    {typeof row.cells[col.key] === 'number' ? (
                      <span className="font-semibold text-ink-900">
                        {formatPrice(row.cells[col.key], currency)}
                      </span>
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

      {/* Mobile: one card per room type */}
      <ul className="divide-y divide-ink-100 md:hidden">
        {rows.map((row, i) => (
          <li key={i} className="p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h4 className="flex items-center gap-2 font-semibold text-ink-900">
                <BedDouble size={16} className="shrink-0 text-brand-500" />
                {row.roomType}
              </h4>
              {row.from != null && (
                <span className="shrink-0 font-display text-lg text-ink-900">
                  {formatPrice(row.from, currency)}
                </span>
              )}
            </div>
            <dl className="mt-3 space-y-1.5">
              {columns
                .filter((col) => typeof row.cells[col.key] === 'number')
                .map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-4 text-sm">
                    <dt className="text-ink-500">
                      {col.label}
                      {col.mealPlan && <span className="text-ink-400"> · {col.mealPlan}</span>}
                    </dt>
                    <dd className="font-semibold text-ink-900">
                      {formatPrice(row.cells[col.key], currency)}
                    </dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/** Full-page placeholder shown while the hotel request is in flight. */
function DetailSkeleton() {
  return (
    <div className="pb-24">
      <div className="skeleton h-[58vh] min-h-[420px] w-full" />
      <div className="container-x mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="skeleton h-10 w-64 rounded-lg" />
          <div className="skeleton h-72 w-full rounded-[var(--radius-xl)]" />
        </div>
        <div className="skeleton h-80 w-full rounded-[var(--radius-xl)]" />
      </div>
    </div>
  );
}

export default function HotelDetail() {
  const { id } = useParams();
  const { hotel, loading, error, refresh } = useHotelApi(id);
  const [season, setSeason] = useState(0);

  // A different hotel means a different set of seasons — start from the first.
  useEffect(() => {
    setSeason(0);
  }, [id]);

  if (loading) return <DetailSkeleton />;

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
          <div className="flex flex-wrap justify-center gap-3">
            {error && (
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw size={16} /> Try again
              </Button>
            )}
            <Button to="/hotels" variant="ghost" size="sm">
              <ChevronLeft size={16} /> Back to all hotels
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const [cover, ...gallery] = hotel.images;
  const activeTable = hotel.rateTables[Math.min(season, hotel.rateTables.length - 1)];
  const hasRange = hotel.priceTo != null && hotel.priceTo !== hotel.priceFrom;
  const hasExtras =
    hotel.mealPlanNotes.length || hotel.childrenPolicy.length || hotel.extraCharges.length;

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[58vh] min-h-[420px] items-end overflow-hidden bg-ink-950">
        <SmartImage
          src={cover}
          alt={hotel.name}
          fallbackSeed={hotel.id}
          loading="eager"
          wrapperClassName="absolute inset-0 h-full w-full"
          className="scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/30" />

        <div className="container-x relative z-10 pb-12 lg:pb-16">
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="transition-colors hover:text-brand-400">Home</Link>
            <ChevronRight size={14} />
            <Link to="/hotels" className="transition-colors hover:text-brand-400">Hotels</Link>
            <ChevronRight size={14} />
            <span className="text-white/90">{hotel.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="glass">{hotel.year ? `${hotel.year} rates` : 'Live rates'}</Badge>
            <Badge tone="glass">
              {hotel.roomTypes.length} room {hotel.roomTypes.length === 1 ? 'type' : 'types'}
            </Badge>
            {hotel.guestTags.slice(0, 2).map((tag) => (
              <Badge key={tag} tone="glass">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            {hotel.name}
          </h1>

          {hotel.priceFrom != null && (
            <p className="mt-4 text-lg text-white/80">
              From <span className="font-display text-2xl text-white">{hotel.priceLabel}</span>
              <span className="text-white/60"> / night</span>
            </p>
          )}
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <Section className="bg-white py-10 sm:py-14 lg:py-16">
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

      {/* Rates + sidebar */}
      <Section className="bg-sand-50">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main column */}
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
              Rooms &amp; rates
            </span>
            <h2 className="mt-2 font-display text-3xl text-ink-900 sm:text-4xl">Choose your room</h2>
            <p className="mt-3 max-w-prose text-ink-500">
              Prices are per night in {hotel.currency}
              {hotel.seasonCount > 1 && ', and change by season — pick a period below'}.
            </p>

            {hotel.rateTables.length > 1 && (
              <div className="mt-6">
                <FilterPills
                  items={hotel.rateTables.map((t) => t.label)}
                  active={activeTable.label}
                  onChange={(label) =>
                    setSeason(hotel.rateTables.findIndex((t) => t.label === label))
                  }
                  layoutId="hotel-season"
                />
              </div>
            )}

            <div className="mt-8">
              {hotel.rateTables.length ? (
                <RateTable key={activeTable.label} table={activeTable} />
              ) : (
                <p className="rounded-[var(--radius-lg)] border border-ink-100 bg-white p-6 text-ink-500">
                  Room rates for this hotel are available on request.
                </p>
              )}
            </div>

            {/* Policies pulled straight from the rate sheet */}
            {hasExtras > 0 && (
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {hotel.mealPlanNotes.length > 0 && (
                  <InfoCard icon={UtensilsCrossed} title="Board & meals">
                    <ul className="space-y-2.5">
                      {hotel.mealPlanNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-600">
                          <Check size={16} className="mt-0.5 shrink-0 text-brand-500" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </InfoCard>
                )}

                {hotel.childrenPolicy.length > 0 && (
                  <InfoCard icon={BabyIcon} title="Children policy">
                    <dl className="space-y-3">
                      {hotel.childrenPolicy.map((p, i) => (
                        <div key={i} className="flex flex-col gap-0.5">
                          <dt className="text-sm font-semibold text-ink-900">{p.ageRange}</dt>
                          <dd className="text-sm leading-relaxed text-ink-500">{p.condition}</dd>
                        </div>
                      ))}
                    </dl>
                  </InfoCard>
                )}

                {hotel.extraCharges.length > 0 && (
                  <InfoCard icon={PlusCircle} title="Extras & supplements">
                    <ul className="divide-y divide-ink-100">
                      {hotel.extraCharges.map((c, i) => (
                        <li key={i} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                          <span className="text-sm text-ink-600">{c.type}</span>
                          <span className="shrink-0 text-sm font-semibold text-ink-900">
                            {formatPrice(c.price, c.currency || hotel.currency)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </InfoCard>
                )}

                {hotel.rawNotes.length > 0 && (
                  <InfoCard icon={Info} title="Good to know">
                    <ul className="space-y-2.5">
                      {hotel.rawNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-600">
                          <Check size={16} className="mt-0.5 shrink-0 text-brand-500" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </InfoCard>
                )}
              </div>
            )}
          </div>

          {/* Sticky booking sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[var(--radius-xl)] border border-ink-100 bg-white p-7 shadow-[var(--shadow-lift)]">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-500">
                {hotel.priceFrom != null ? 'Rates from' : 'Pricing'}
              </span>
              <div className="mt-1 font-display text-4xl text-ink-900">
                {hotel.priceFrom != null ? hotel.priceLabel : 'On request'}
              </div>
              {hotel.priceFrom != null && (
                <span className="text-sm text-ink-500">
                  per night
                  {hasRange && ` · up to ${formatPrice(hotel.priceTo, hotel.currency)}`}
                </span>
              )}

              <div className="mt-5 divide-y divide-ink-100 border-t border-ink-100">
                <FactRow icon={BedDouble} label="Room types" value={hotel.roomTypes.length} />
                <FactRow
                  icon={CalendarRange}
                  label="Seasons"
                  value={hotel.seasonCount || '—'}
                />
                <FactRow icon={UtensilsCrossed} label="Board" value={hotel.boardLabel} />
                <FactRow icon={Wallet} label="Quoted in" value={hotel.currency} />
              </div>

              {hotel.guestTags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {hotel.guestTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-ink-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <Button to="/contact" size="lg" className="mt-6 w-full justify-center">
                Enquire &amp; book <ArrowRight size={18} />
              </Button>

              <Button to="/hotels" variant="ghost" size="sm" className="mt-3 w-full justify-center">
                <ChevronLeft size={16} /> All hotels
              </Button>

              {hotel.updatedAt && (
                <p className="mt-4 text-center text-xs text-ink-400">
                  Rates updated{' '}
                  {new Date(hotel.updatedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </aside>
        </div>
      </Section>

      <CTA />
    </>
  );
}
