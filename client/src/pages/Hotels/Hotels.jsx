import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BedDouble,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import Section from '../../components/ui/Section';
import SectionHeader from '../../components/ui/SectionHeader';
import FilterPills from '../../components/ui/FilterPills';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SmartImage from '../../components/ui/SmartImage';
import HotelRateCard, { HotelRateCardSkeleton } from '../../components/shared/HotelRateCard';
import CTA from '../../components/sections/CTA';
import { useHotelsApi } from '../../hooks';
import { formatPrice } from '../../utils/adaptHotel';
import { staggerContainer, fadeUp, viewportOnce } from '../../animations/variants';
import { unsplash } from '../../utils/image';
import { cn } from '../../utils/cn';

// Hotels sold "on request" (no price rows in the sheet) always sort to the bottom.
const priceOf = (h) => (h.priceFrom == null ? Infinity : h.priceFrom);

const SORTS = {
  Recommended: (a, b) => b.roomTypes.length - a.roomTypes.length || priceOf(a) - priceOf(b),
  'Price: low to high': (a, b) => priceOf(a) - priceOf(b),
  'Price: high to low': (a, b) => (priceOf(b) === Infinity ? -1 : priceOf(b)) - (priceOf(a) === Infinity ? -1 : priceOf(a)),
  'Most room types': (a, b) => b.roomTypes.length - a.roomTypes.length,
  'Name (A–Z)': (a, b) => a.name.localeCompare(b.name),
};

const PER_PAGE = 9; // hotels shown per page

// Display order for the guest-group pills (only the ones present are shown).
const GUEST_ORDER = ['Solo', 'Couples', 'Small groups', 'Families'];

/** Build a compact list of page numbers with "…" gaps: [1, '…', 4, 5, 6, '…', 20]. */
function pageList(current, total) {
  const pages = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= current - 1 && p <= current + 1)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }
  return pages;
}

/** Numbered pagination with prev/next arrows. */
function Pagination({ page, totalPages, onChange }) {
  const btn =
    'grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm font-semibold transition-colors';
  return (
    <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={cn(btn, 'border-ink-200 bg-white text-ink-700 hover:border-brand-400 disabled:cursor-not-allowed disabled:opacity-40')}
      >
        <ChevronLeft size={18} />
      </button>

      {pageList(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-ink-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              btn,
              p === page
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-ink-200 bg-white text-ink-700 hover:border-brand-400',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={cn(btn, 'border-ink-200 bg-white text-ink-700 hover:border-brand-400 disabled:cursor-not-allowed disabled:opacity-40')}
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

/**
 * Full-width spotlight for the best-value stay, with a live preview of the
 * cheapest rows from its first season so the pricing is visible before the
 * visitor even opens the hotel.
 */
function Spotlight({ hotel }) {
  // Flatten the first season into a few "room · occupancy · meal plan · price"
  // rows, cheapest first — a taster of the full rate table on the detail page.
  const previewRows = useMemo(() => {
    const season = hotel.seasons?.[0];
    if (!season) return [];
    const rows = [];
    (season.roomTypes || []).forEach((rt) =>
      (rt.prices || []).forEach((p) =>
        rows.push({ room: rt.roomType, occupancy: p.occupancy, mealPlan: p.mealPlan, price: p.price }),
      ),
    );
    return rows.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)).slice(0, 4);
  }, [hotel]);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="group grid overflow-hidden rounded-[var(--radius-2xl)] border border-ink-100 bg-white shadow-[var(--shadow-lift)] lg:grid-cols-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[21/9] lg:aspect-auto">
        <SmartImage
          src={hotel.images?.[0]}
          alt={hotel.name}
          fallbackSeed={hotel.id}
          wrapperClassName="h-full w-full"
          className="transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/45 to-transparent lg:bg-gradient-to-r" />
        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <Badge tone="gold" icon={<Sparkles size={13} />}>
            Featured stay
          </Badge>
          <Badge tone="glass">{hotel.year ? `${hotel.year} rates` : 'Live rates'}</Badge>
        </div>
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-6 p-6 sm:p-8 lg:p-12">
        <div>
          <h3 className="text-balance font-display text-[clamp(1.75rem,5vw,3rem)] leading-[1.05] text-ink-900">
            {hotel.name}
          </h3>
          <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <BedDouble size={15} className="text-brand-500" /> {hotel.roomTypes.length} room types
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarRange size={15} className="text-brand-500" /> {hotel.seasonCount} seasons
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UtensilsCrossed size={15} className="text-brand-500" /> {hotel.boardLabel}
            </span>
          </p>
        </div>

        {previewRows.length > 0 && (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-ink-100 bg-sand-50">
            <div className="border-b border-ink-100 px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-400">
              {hotel.seasons[0].periodLabel || 'Season rates'}
            </div>
            <ul className="divide-y divide-ink-100">
              {previewRows.map((row, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">{row.room}</p>
                    <p className="truncate text-xs text-ink-500">
                      {[row.occupancy, row.mealPlan].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-lg text-ink-900">
                    {formatPrice(row.price, hotel.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink-100 pt-6">
          <div className="flex items-end gap-1.5">
            <span className="pb-1 text-sm text-ink-500">from</span>
            <span className="font-display text-4xl text-ink-900">{hotel.priceLabel}</span>
            <span className="pb-1 text-sm text-ink-500">/ night</span>
          </div>
          <Button to={`/hotels/${hotel.id}`} size="md">
            See all rates <ArrowRight size={17} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Hotels() {
  const { hotels, loading, error, refresh } = useHotelsApi();
  const [guests, setGuests] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Recommended');
  const [page, setPage] = useState(1);

  // The rate sheets have no cities or amenities — the occupancy rows are the
  // one facet that varies, normalised into guest groups by the adapter.
  const guestFilters = useMemo(() => {
    const present = new Set(hotels.flatMap((h) => h.guestTags));
    return ['All', ...GUEST_ORDER.filter((t) => present.has(t))];
  }, [hotels]);

  // The spotlight goes to the hotel with the richest sheet (most room types
  // across most seasons). Prices are not comparable here — hotels quote in
  // different currencies — so "cheapest" would be meaningless.
  const spotlight = useMemo(() => {
    const priced = hotels.filter((h) => h.priceFrom != null);
    if (!priced.length) return null;
    const score = (h) => h.roomTypes.length * 2 + h.seasonCount;
    return priced.reduce((best, h) => (score(h) > score(best) ? h : best));
  }, [hotels]);

  const stats = useMemo(() => {
    const roomTypes = hotels.reduce((s, h) => s + h.roomTypes.length, 0);
    const seasons = hotels.reduce((s, h) => s + h.seasonCount, 0);
    // Hotels quote in different currencies, so a single "from" price would be
    // misleading — we show how fresh the sheets are instead.
    const latest = hotels.reduce(
      (max, h) => (h.updatedAt && (!max || h.updatedAt > max) ? h.updatedAt : max),
      null,
    );
    const updated = latest
      ? new Date(latest).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      : '—';
    return [
      { label: 'Hotels', value: hotels.length },
      { label: 'Room types', value: roomTypes },
      { label: 'Seasonal periods', value: seasons },
      { label: 'Rates updated', value: updated },
    ];
  }, [hotels]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = hotels.filter((h) => {
      const matchesGuests = guests === 'All' || h.guestTags.includes(guests);
      const matchesQuery =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.roomTypes.some((r) => r.toLowerCase().includes(q)) ||
        h.periods.some((p) => p.toLowerCase().includes(q));
      return matchesGuests && matchesQuery;
    });
    return [...list].sort(SORTS[sort]);
  }, [hotels, guests, query, sort]);

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // Reset to page 1 whenever the filter/search/sort changes.
  useEffect(() => {
    setPage(1);
  }, [guests, query, sort]);
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const goToPage = (p) => {
    setPage(p);
    // Scroll back up to the collection so the new page starts at the top.
    document.getElementById('hotel-collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetFilters = () => {
    setGuests('All');
    setQuery('');
  };

  return (
    <>
      <PageHero
        eyebrow="Where you'll rest"
        title="Hotels & Stays"
        lead="From industrial-chic boutiques in Tbilisi to glass alpine lodges under Kazbek — a handpicked collection of places worth checking into, with live seasonal rates."
        image={unsplash('1566073771259-6a8506099945', { w: 2000 })}
      />

      {/* Stats strip */}
      <section className="border-b border-ink-100 bg-white">
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="container-x grid grid-cols-2 gap-y-10 py-10 sm:py-12 md:grid-cols-4"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className={cn(
                'px-2 text-center',
                // Hairline separators between columns, reset at the start of
                // each row — two per row on mobile, four from md up.
                'border-l border-ink-100 first:border-l-0',
                i % 2 === 0 && 'border-l-0 md:border-l',
                'md:first:border-l-0',
              )}
            >
              <div className="font-display text-[clamp(1.9rem,7vw,3rem)] leading-none text-ink-900">
                {loading ? (
                  <span className="skeleton mx-auto block h-9 w-16 rounded-lg sm:w-24" />
                ) : (
                  s.value
                )}
              </div>
              <div className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-400 sm:text-xs sm:tracking-[0.16em]">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Spotlight */}
      {!loading && !error && spotlight && (
        <Section className="bg-sand-50">
          <SectionHeader
            eyebrow="The one to book first"
            title="Our featured stay"
            lead="The best nightly rate in the collection right now, straight from this season's price sheet."
          />
          <div className="mt-10">
            <Spotlight hotel={spotlight} />
          </div>
        </Section>
      )}

      {/* Collection */}
      <Section id="hotel-collection" className="scroll-mt-24 bg-sand-100">
        {/* The heading keeps the full content width — the controls never
            compete with the display type for horizontal space. */}
        <SectionHeader eyebrow="The collection" title="Every stay in Georgia" />

        {/* Filter bar. Sticks under the navbar once the grid starts scrolling,
            so filters stay reachable on long lists and short phone viewports.
            Stays inside the container — a full-bleed bar would overflow between
            1440px and 1568px, where `container-x` is already capped at 90rem. */}
        <div className="sticky top-[4.25rem] z-20 mt-8 rounded-[var(--radius-lg)] border border-ink-200/70 bg-sand-100/85 p-3 shadow-[var(--shadow-soft)] backdrop-blur-md sm:p-4 lg:top-[4.75rem]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search grows, sort stays intrinsic — both full width on phones */}
            <div className="flex w-full gap-3 lg:w-auto lg:shrink-0">
              <div className="relative min-w-0 flex-1 lg:w-72 lg:flex-none">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  id="hotel-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search hotels or rooms…"
                  aria-label="Search hotels or room types"
                  className="h-11 w-full rounded-full border border-ink-200 bg-white pl-10 pr-10 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 hover:border-brand-400 focus-visible:border-brand-500"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 transition-colors hover:text-ink-900"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <select
                id="hotel-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort hotels"
                className="h-11 max-w-[9.5rem] shrink-0 rounded-full border border-ink-200 bg-white px-4 pr-8 text-sm font-semibold text-ink-900 outline-none transition-colors hover:border-brand-400 focus-visible:border-brand-500 sm:max-w-none sm:px-5 sm:pr-9"
              >
                {Object.keys(SORTS).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Pills scroll horizontally on narrow screens with a fade edge
                so it reads as scrollable instead of clipped. */}
            <div className="flex min-w-0 items-center gap-4 lg:justify-end">
              {guestFilters.length > 1 ? (
                <FilterPills
                  items={guestFilters}
                  active={guests}
                  onChange={setGuests}
                  layoutId="hotel-guests"
                  className="scroll-fade-x -my-1 min-w-0 flex-1 py-1 lg:flex-none"
                />
              ) : (
                <span className="text-sm text-ink-400">All room configurations</span>
              )}
              <p className="hidden shrink-0 whitespace-nowrap text-sm text-ink-500 sm:block">
                <span className="font-semibold text-ink-900">{filtered.length}</span>{' '}
                {filtered.length === 1 ? 'stay' : 'stays'}
              </p>
            </div>
          </div>
        </div>

        {/* Result count lives on its own line on phones, where the bar is tight */}
        <p className="mt-4 text-sm text-ink-500 sm:hidden">
          <span className="font-semibold text-ink-900">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'stay' : 'stays'}
          {guests !== 'All' && (
            <>
              {' '}for <span className="font-semibold text-ink-900">{guests.toLowerCase()}</span>
            </>
          )}
        </p>

        {loading && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <HotelRateCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-ink-900/5 text-ink-400">
              <BedDouble size={28} />
            </span>
            <p className="text-ink-500">
              Couldn’t load hotels ({error}). Make sure the server is running.
            </p>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw size={16} /> Try again
            </Button>
          </div>
        )}

        {!loading && !error && (
          <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {pageItems.map((hotel) => (
                <motion.div
                  key={hotel.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <HotelRateCard hotel={hotel} to={`/hotels/${hotel.id}`} className="h-full" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-ink-900/5 text-ink-400">
              <BedDouble size={28} />
            </span>
            <p className="text-ink-500">
              {hotels.length === 0
                ? 'No hotels have been imported yet — add a rate sheet to see them here.'
                : 'No stays match those filters — try widening your search.'}
            </p>
            {hotels.length > 0 && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Show all stays
              </Button>
            )}
          </div>
        )}

        {/* Reassurance row */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
