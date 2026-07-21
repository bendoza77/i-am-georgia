import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Mail,
  MessageSquare,
  Phone,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import Badge from '../../components/ui/Badge';
import SmartImage from '../../components/ui/SmartImage';
import FilterPills from '../../components/ui/FilterPills';
import BookingSteps from '../../components/booking/BookingSteps';
import BookingSummary, { AnimatedPrice } from '../../components/booking/BookingSummary';
import DateRangePicker from '../../components/booking/DateRangePicker';
import GuestCounter from '../../components/booking/GuestCounter';
import RoomPicker from '../../components/booking/RoomPicker';
import { useHotelApi, useLockBody } from '../../hooks';
import { formatPrice } from '../../utils/adaptHotel';
import { SITE } from '../../constants/site';
import { cn } from '../../utils/cn';
import {
  addDays,
  bookingReference,
  formatDate,
  guestLabel,
  nightlyBreakdown,
  nightsBetween,
  optionsForRoom,
  seasonIndexForDate,
  seasonsWithRanges,
  today,
  toISO,
} from '../../utils/booking';

const EASE = [0.16, 1, 0.3, 1];

const STEPS = [
  { id: 'dates', label: 'Dates & guests', title: 'When are you coming?', lead: 'Pick your nights — rates follow the season you land in.' },
  { id: 'room', label: 'Room & board', title: 'Choose your room', lead: 'Every published rate for your dates, per room per night.' },
  { id: 'details', label: 'Your details', title: 'Who are we booking for?', lead: 'We only use this to confirm the reservation.' },
  { id: 'review', label: 'Review', title: 'One last look', lead: 'Check it over, then send the request to our team.' },
];

/**
 * Slide the step panel in from the direction of travel.
 *
 * Deliberately an enter-only animation on a keyed element rather than an
 * AnimatePresence cross-fade: a wizard must never be able to hang between
 * steps because an exit animation didn't resolve. Same reasoning as the
 * CSS-only page transition in Layout.
 */
const panelMotion = (dir, reduced) =>
  reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        initial: { opacity: 0, x: dir * 44 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
      };

/** Section heading used inside each step. */
function StepHeading({ index, title, lead }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
        Step {index + 1} of {STEPS.length}
      </span>
      <h2 className="mt-2 text-balance font-display text-[clamp(1.6rem,4.5vw,2.25rem)] leading-tight text-ink-900">
        {title}
      </h2>
      <p className="mt-2 max-w-prose text-pretty text-ink-500">{lead}</p>
    </div>
  );
}

/** A short, quiet note — used for policies and season fallbacks. */
function Note({ icon: Icon = Info, children, tone = 'sand' }) {
  return (
    <p
      className={cn(
        'flex items-start gap-2.5 rounded-[var(--radius-sm)] px-4 py-3 text-sm leading-relaxed',
        tone === 'sand' ? 'bg-sand-100 text-ink-600' : 'bg-brand-500/8 text-ink-700',
      )}
    >
      <Icon size={15} className="mt-0.5 shrink-0 text-brand-500" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** Review line for the final step. */
function ReviewRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 border-b border-ink-100 py-3.5 last:border-0">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="min-w-0 text-right text-sm font-semibold text-ink-900">{children}</span>
    </div>
  );
}

/** Skeleton mirroring the real layout so the swap doesn't jump. */
function BookSkeleton() {
  return (
    <div className="container-x pb-24 pt-28">
      <div className="skeleton h-40 w-full rounded-[var(--radius-xl)]" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="skeleton h-8 w-52 rounded-lg" />
          <div className="skeleton h-[26rem] w-full rounded-[var(--radius-xl)]" />
        </div>
        <div className="skeleton h-96 w-full rounded-[var(--radius-xl)]" />
      </div>
    </div>
  );
}

export default function BookHotel() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { hotel, loading, error, refresh } = useHotelApi(id);
  const reduced = useReducedMotion();

  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [dir, setDir] = useState(1);

  const [range, setRange] = useState({ from: null, to: null });
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const [selection, setSelection] = useState({ roomType: null, rateKey: null });
  const [seasonPick, setSeasonPick] = useState(null);
  const [extras, setExtras] = useState([]);
  const [details, setDetails] = useState({ name: '', email: '', phone: '', country: '', notes: '' });
  const [reference, setReference] = useState(null);

  // Seasons come from free-text labels, so parse once per hotel.
  const seasons = useMemo(() => (hotel ? seasonsWithRanges(hotel) : []), [hotel]);

  // The season the check-in date falls into; -1 when the label carried no
  // readable dates (or no dates are picked yet). A guest can always override
  // the match — overlapping periods and unreadable labels both need that.
  const matchedIndex = useMemo(
    () => seasonIndexForDate(seasons, range.from),
    [seasons, range.from],
  );
  const activeIndex = Math.min(
    seasonPick ?? (matchedIndex >= 0 ? matchedIndex : 0),
    Math.max(seasons.length - 1, 0),
  );
  const activeTable = seasons[activeIndex]?.table;

  // New dates mean a fresh match — drop a stale manual override.
  useEffect(() => {
    setSeasonPick(null);
  }, [range.from]);

  // A room preselected from the hotel page's rate table.
  useEffect(() => {
    const room = params.get('room');
    if (room) setSelection((s) => (s.roomType ? s : { roomType: room, rateKey: null }));
  }, [params]);

  // Switching season can invalidate the chosen rate column — keep the room,
  // drop a rate that this season doesn't publish.
  useEffect(() => {
    if (!activeTable || !selection.roomType) return;
    const row = activeTable.rows.find((r) => r.roomType === selection.roomType);
    if (!row) {
      setSelection({ roomType: null, rateKey: null });
      return;
    }
    if (selection.rateKey && typeof row.cells[selection.rateKey] !== 'number') {
      setSelection((s) => ({ ...s, rateKey: null }));
      return;
    }
    // A room with a single published rate has nothing to choose — pick it, so a
    // deep link from the hotel page arrives ready to continue.
    if (!selection.rateKey) {
      const only = optionsForRoom(activeTable, selection.roomType);
      if (only.length === 1) setSelection((s) => ({ ...s, rateKey: only[0].key }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, activeTable]);

  const nights = nightsBetween(range.from, range.to);

  const quote = useMemo(
    () =>
      nightlyBreakdown({
        seasons,
        from: range.from,
        to: range.to,
        roomType: selection.roomType,
        rateKey: selection.rateKey,
        anchorIndex: activeIndex,
        pinned: seasonPick != null,
      }),
    [seasons, range.from, range.to, selection.roomType, selection.rateKey, activeIndex, seasonPick],
  );

  const extraCharges = hotel?.extraCharges ?? [];
  const extrasTotal = extras.reduce((sum, i) => sum + (extraCharges[i]?.price || 0), 0);
  const grandTotal = quote.total * guests.rooms + extrasTotal;

  const draft = { ...range, guests, roomType: selection.roomType, rateKey: selection.rateKey };

  const canAdvance = [
    nights >= 1,
    !!selection.roomType && !!selection.rateKey,
    details.name.trim().length > 1 && /\S+@\S+\.\S+/.test(details.email),
    true,
  ][step];

  // Steps differ a lot in height, so every move re-anchors the viewport on the
  // top of the panel. The site runs Lenis, which owns the scroll position —
  // a plain window.scrollTo is overridden by its next frame.
  const panelRef = useRef(null);
  const scrollToPanel = useCallback(() => {
    // 190 ≈ navbar + the sticky progress rail, so the step's eyebrow clears both.
    const top = Math.max((panelRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 190, 0);
    if (window.__lenis) window.__lenis.scrollTo(top, { immediate: !!reduced });
    else window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }, [reduced]);

  const go = (next) => {
    if (next < 0 || next >= STEPS.length) return;
    setDir(next > step ? 1 : -1);
    setStep(next);
    setFurthest((f) => Math.max(f, next));
    scrollToPanel();
  };

  /** Compose the request as an email so it is actionable without a backend. */
  const mailtoHref = () => {
    if (!hotel) return '#';
    const lines = [
      `Booking request — ${hotel.name}`,
      reference ? `Reference: ${reference}` : '',
      '',
      `Check-in:  ${formatDate(range.from)}`,
      `Check-out: ${formatDate(range.to)}`,
      `Nights:    ${nights}`,
      `Guests:    ${guestLabel(guests)}`,
      `Room:      ${selection.roomType ?? '—'}`,
      `Rate:      ${selection.rateKey ?? '—'}`,
      `Season:    ${activeTable?.label ?? '—'}`,
      extras.length ? `Extras:    ${extras.map((i) => extraCharges[i]?.type).join(', ')}` : '',
      `Estimate:  ${formatPrice(grandTotal, hotel.currency)} (${hotel.currency})`,
      '',
      `Name:      ${details.name}`,
      `Email:     ${details.email}`,
      `Phone:     ${details.phone || '—'}`,
      `Country:   ${details.country || '—'}`,
      details.notes ? `\nNotes:\n${details.notes}` : '',
    ].filter(Boolean);

    return `mailto:${SITE.email}?subject=${encodeURIComponent(
      `Booking request · ${hotel.name} · ${toISO(range.from ?? today())}`,
    )}&body=${encodeURIComponent(lines.join('\n'))}`;
  };

  const submit = () => {
    setReference(bookingReference(hotel.id));
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: 'auto' });
  };

  if (loading) return <BookSkeleton />;

  if (error || !hotel) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-ink-900/5 text-ink-400">
            <BedDouble size={28} />
          </span>
          <p className="text-ink-500">
            {error ? `We couldn't open the booking form (${error}).` : "We couldn't find that hotel."}
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

  /* --------------------------------------------------- confirmation screen */
  if (reference) {
    return (
      <section className="relative overflow-hidden bg-sand-50 px-6 pb-28 pt-36">
        <div className="mx-auto max-w-2xl text-center">
          <motion.span
            initial={reduced ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/12 text-emerald-600"
          >
            <CheckCircle2 size={40} />
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
            className="mt-7 font-display text-[clamp(1.9rem,6vw,3rem)] leading-tight text-ink-900"
          >
            Your request is ready
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
            className="mx-auto mt-3 max-w-lg text-pretty leading-relaxed text-ink-500"
          >
            Send it to the reservations team and we'll confirm availability at{' '}
            <span className="font-semibold text-ink-900">{hotel.name}</span> within one business
            day. Nothing has been charged.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
            className="mt-8 rounded-[var(--radius-xl)] border border-ink-100 bg-white p-6 text-left shadow-[var(--shadow-soft)] sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
                Reference
              </span>
              <span className="font-display text-xl tracking-wide text-brand-600">{reference}</span>
            </div>

            <div className="mt-2">
              <ReviewRow label="Hotel">{hotel.name}</ReviewRow>
              <ReviewRow label="Stay">
                {formatDate(range.from)} → {formatDate(range.to)} · {nights} night{nights === 1 ? '' : 's'}
              </ReviewRow>
              <ReviewRow label="Room">{selection.roomType}</ReviewRow>
              <ReviewRow label="Guests">{guestLabel(guests)}</ReviewRow>
              <ReviewRow label="Estimated total">
                {formatPrice(grandTotal, hotel.currency)}
              </ReviewRow>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href={mailtoHref()} size="lg" className="flex-1 justify-center">
                <Mail size={18} /> Send by email
              </Button>
              <Button
                href={`tel:${SITE.phone.replace(/\s/g, '')}`}
                variant="outline"
                size="lg"
                className="flex-1 justify-center"
              >
                <Phone size={17} /> Call the team
              </Button>
            </div>
          </motion.div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button to={`/hotels/${hotel.id}`} variant="ghost" size="sm">
              <ChevronLeft size={16} /> Back to {hotel.name}
            </Button>
            <Button to="/hotels" variant="ghost" size="sm">
              Browse more hotels <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </section>
    );
  }

  /* --------------------------------------------------------- booking flow */
  const activeStep = STEPS[step];
  const roomRow = activeTable?.rows.find((r) => r.roomType === selection.roomType);

  return (
    <>
      {/* Compact hero — enough to keep the hotel present without pushing the
          wizard below the fold. */}
      <section className="relative flex min-h-[15rem] items-end overflow-hidden bg-ink-950 pt-24">
        <SmartImage
          src={hotel.images[0]}
          alt={hotel.name}
          fallbackSeed={hotel.id}
          priority
          wrapperClassName="absolute inset-0 h-full w-full"
          className="scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/40" />

        <div className="container-x relative z-10 pb-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-white/60">
            <Link to="/hotels" className="transition-colors hover:text-brand-400">Hotels</Link>
            <ChevronRight size={14} />
            <Link to={`/hotels/${hotel.id}`} className="truncate transition-colors hover:text-brand-400">
              {hotel.name}
            </Link>
            <ChevronRight size={14} />
            <span className="text-white/90">Book</span>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <Badge tone="glass">
                <Sparkles size={12} /> Free to request · no card needed
              </Badge>
              <h1 className="mt-3 text-balance font-display text-[clamp(1.8rem,5vw,3rem)] leading-[1.05] text-white">
                Book {hotel.name}
              </h1>
            </div>
            {hotel.priceFrom != null && (
              <p className="text-white/70">
                from <span className="font-display text-2xl text-white">{hotel.priceLabel}</span> / night
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Progress rail — sticks under the navbar for the whole flow. */}
      {/* `bg-white/90` (not /85) because that is one of the opacities the dark
          theme remaps to a raised surface — an unmapped step stays literally
          white when the site is in dark mode. */}
      <div className="sticky top-[4.25rem] z-40 border-b border-ink-100 bg-white/90 backdrop-blur-xl">
        <div className="container-x py-4">
          <BookingSteps steps={STEPS} current={step} furthest={furthest} onJump={go} className="mx-auto max-w-2xl" />
        </div>
      </div>

      <section className="bg-sand-50 pb-40 pt-10 sm:pt-14 lg:pb-24">
        <div className="container-x grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
          {/* ------------------------------------------------ step panels */}
          <div ref={panelRef} className="min-w-0">
            <motion.div key={activeStep.id} {...panelMotion(dir, reduced)} className="min-w-0">
                <StepHeading index={step} title={activeStep.title} lead={activeStep.lead} />

                {/* ------------------------------------------ 1 · dates */}
                {step === 0 && (
                  <div className="mt-7 space-y-5">
                    <DateRangePicker value={range} onChange={setRange} seasons={seasons} />

                    {/* Quick lengths — most stays are 2–7 nights. */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-ink-500">Quick stay:</span>
                      {[2, 3, 5, 7].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            const from = range.from ?? addDays(today(), 14);
                            setRange({ from, to: addDays(from, n) });
                          }}
                          className={cn(
                            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200',
                            nights === n
                              ? 'border-ink-900 bg-ink-900 text-white'
                              : 'border-ink-200 text-ink-600 hover:border-brand-400 hover:text-brand-600',
                          )}
                        >
                          {n} nights
                        </button>
                      ))}
                    </div>

                    <GuestCounter value={guests} onChange={setGuests} />

                    {guests.children > 0 && hotel.childrenPolicy.length > 0 && (
                      <Note icon={Users} tone="brand">
                        <span className="font-semibold text-ink-900">Children policy:</span>{' '}
                        {hotel.childrenPolicy
                          .map((p) => `${p.ageRange} — ${p.condition}`)
                          .join(' · ')}
                      </Note>
                    )}

                    {range.from && matchedIndex < 0 && seasons.length > 0 && (
                      <Note>
                        We couldn't read dates from this hotel's season labels, so pick the period
                        that matches your stay on the next step.
                      </Note>
                    )}
                  </div>
                )}

                {/* ------------------------------------------- 2 · rooms */}
                {step === 1 && (
                  <div className="mt-7 space-y-5">
                    {/* Season: derived from the dates when we can read them,
                        otherwise a manual choice. */}
                    {seasons.length > 1 && (
                      <div className="rounded-[var(--radius-xl)] border border-ink-100 bg-white p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                            Rate period
                          </span>
                          {matchedIndex >= 0 && seasonPick == null && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <CalendarCheck size={12} /> Matched to your dates
                            </span>
                          )}
                        </div>
                        <div className="mt-3">
                          <FilterPills
                            items={seasons.map((s) => s.table.label)}
                            active={activeTable?.label}
                            onChange={(label) =>
                              setSeasonPick(seasons.findIndex((s) => s.table.label === label))
                            }
                            layoutId="booking-season"
                          />
                        </div>
                      </div>
                    )}

                    {activeTable ? (
                      <RoomPicker
                        key={activeTable.label}
                        hotel={hotel}
                        table={activeTable}
                        selection={selection}
                        onSelect={setSelection}
                      />
                    ) : (
                      <Note>This hotel has no published rate table yet — send us the dates and we'll quote you.</Note>
                    )}

                    {/* Optional supplements straight off the rate sheet */}
                    {extraCharges.length > 0 && (
                      <div className="rounded-[var(--radius-xl)] border border-ink-100 bg-white p-5 sm:p-6">
                        <h3 className="flex items-center gap-2 font-display text-xl text-ink-900">
                          <PlusCircle size={18} className="text-brand-500" /> Add extras
                        </h3>
                        <p className="mt-1 text-sm text-ink-500">Optional supplements, charged per stay.</p>
                        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                          {extraCharges.map((charge, i) => {
                            const on = extras.includes(i);
                            return (
                              <motion.button
                                key={`${charge.type}-${i}`}
                                type="button"
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  setExtras((list) =>
                                    on ? list.filter((x) => x !== i) : [...list, i],
                                  )
                                }
                                aria-pressed={on}
                                className={cn(
                                  'flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border px-4 py-3 text-left transition-colors duration-300',
                                  on ? 'border-brand-500 bg-brand-500/8' : 'border-ink-200 hover:border-brand-300',
                                )}
                              >
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <span
                                    className={cn(
                                      'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
                                      on ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-300',
                                    )}
                                  >
                                    <AnimatePresence>
                                      {on && (
                                        <motion.span
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          exit={{ scale: 0 }}
                                          transition={{ type: 'spring', stiffness: 520, damping: 24 }}
                                        >
                                          <CheckCircle2 size={12} strokeWidth={3} />
                                        </motion.span>
                                      )}
                                    </AnimatePresence>
                                  </span>
                                  <span className="truncate text-sm font-medium text-ink-800">{charge.type}</span>
                                </span>
                                <span className="shrink-0 text-sm font-semibold text-ink-900">
                                  {formatPrice(charge.price, charge.currency || hotel.currency)}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {hotel.mealPlanNotes.length > 0 && (
                      <Note>{hotel.mealPlanNotes.join(' · ')}</Note>
                    )}
                  </div>
                )}

                {/* ----------------------------------------- 3 · details */}
                {step === 2 && (
                  <div className="mt-7 space-y-5">
                    <div className="rounded-[var(--radius-xl)] border border-ink-100 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Full name"
                          autoComplete="name"
                          required
                          value={details.name}
                          onChange={(e) => setDetails({ ...details, name: e.target.value })}
                        />
                        <Field
                          label="Email address"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          required
                          value={details.email}
                          onChange={(e) => setDetails({ ...details, email: e.target.value })}
                        />
                        <Field
                          label="Phone (optional)"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={details.phone}
                          onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                        />
                        <Field
                          label="Country of residence"
                          autoComplete="country-name"
                          value={details.country}
                          onChange={(e) => setDetails({ ...details, country: e.target.value })}
                        />
                      </div>
                      <Field
                        className="mt-4"
                        label="Special requests (late arrival, bed setup, allergies…)"
                        textarea
                        rows={4}
                        value={details.notes}
                        onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                      />
                    </div>

                    <Note icon={ShieldCheck} tone="brand">
                      No card details are ever taken on this site. We hold the room, confirm the
                      final price with the hotel, and only then agree payment with you.
                    </Note>
                  </div>
                )}

                {/* ------------------------------------------ 4 · review */}
                {step === 3 && (
                  <div className="mt-7 space-y-5">
                    <div className="rounded-[var(--radius-xl)] border border-ink-100 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
                      <h3 className="font-display text-xl text-ink-900">Your stay</h3>
                      <div className="mt-3">
                        <ReviewRow label="Hotel">{hotel.name}</ReviewRow>
                        <ReviewRow label="Check-in">{formatDate(range.from, { weekday: 'short' })}</ReviewRow>
                        <ReviewRow label="Check-out">{formatDate(range.to, { weekday: 'short' })}</ReviewRow>
                        <ReviewRow label="Nights">{nights}</ReviewRow>
                        <ReviewRow label="Guests">{guestLabel(guests)}</ReviewRow>
                        <ReviewRow label="Room">{selection.roomType}</ReviewRow>
                        <ReviewRow label="Rate">{selection.rateKey}</ReviewRow>
                        {roomRow?.from != null && (
                          <ReviewRow label="Period">{activeTable?.label}</ReviewRow>
                        )}
                        {extras.length > 0 && (
                          <ReviewRow label="Extras">
                            {extras.map((i) => extraCharges[i]?.type).filter(Boolean).join(', ')}
                          </ReviewRow>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[var(--radius-xl)] border border-ink-100 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
                      <h3 className="font-display text-xl text-ink-900">Guest</h3>
                      <div className="mt-3">
                        <ReviewRow label="Name">{details.name}</ReviewRow>
                        <ReviewRow label="Email">{details.email}</ReviewRow>
                        {details.phone && <ReviewRow label="Phone">{details.phone}</ReviewRow>}
                        {details.country && <ReviewRow label="Country">{details.country}</ReviewRow>}
                        {details.notes && (
                          <ReviewRow label="Requests">
                            <span className="block max-w-sm whitespace-pre-line text-left font-normal text-ink-600">
                              {details.notes}
                            </span>
                          </ReviewRow>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => go(2)}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 underline-offset-4 hover:underline"
                      >
                        <MessageSquare size={14} /> Edit details
                      </button>
                    </div>

                    <Note>
                      Sending this places a request, not a confirmed reservation. A travel designer
                      checks live availability with {hotel.name} and replies within one business day.
                    </Note>
                  </div>
                )}

                {/* ------------------------------------------ navigation */}
                <div className="mt-8 hidden items-center justify-between gap-4 lg:flex">
                  {step > 0 ? (
                    <Button variant="ghost" onClick={() => go(step - 1)}>
                      <ArrowLeft size={16} /> Back
                    </Button>
                  ) : (
                    <Button to={`/hotels/${hotel.id}`} variant="ghost">
                      <ArrowLeft size={16} /> Hotel page
                    </Button>
                  )}

                  {step < STEPS.length - 1 ? (
                    <Button size="lg" disabled={!canAdvance} onClick={() => go(step + 1)}>
                      Continue <ArrowRight size={18} />
                    </Button>
                  ) : (
                    <Button size="lg" onClick={submit}>
                      Confirm request <CheckCircle2 size={18} />
                    </Button>
                  )}
                </div>

                {!canAdvance && step < STEPS.length - 1 && (
                  <p className="mt-3 hidden text-sm text-ink-400 lg:block">
                    {step === 0 && 'Choose a check-in and a check-out date to continue.'}
                    {step === 1 && 'Pick a room and one of its rates to continue.'}
                    {step === 2 && 'Add your name and a valid email address to continue.'}
                  </p>
                )}
            </motion.div>
          </div>

          {/* ----------------------------------------------- live summary */}
          <aside className="hidden lg:sticky lg:top-40 lg:block lg:self-start">
            <BookingSummary hotel={hotel} draft={draft} quote={quote} extrasTotal={extrasTotal} />
          </aside>
        </div>
      </section>

      {/* Mobile action bar: the running total plus the primary action, always
          in reach without scrolling back to the summary. */}
      <MobileBar
        hotel={hotel}
        total={grandTotal}
        nights={nights}
        step={step}
        canAdvance={canAdvance}
        onBack={() => go(step - 1)}
        onNext={() => (step < STEPS.length - 1 ? go(step + 1) : submit())}
        summary={<BookingSummary hotel={hotel} draft={draft} quote={quote} extrasTotal={extrasTotal} />}
      />
    </>
  );
}

/** Fixed bottom bar on phones/tablets, with an expandable quote sheet. */
function MobileBar({ hotel, total, nights, step, canAdvance, onBack, onNext, summary }) {
  const [open, setOpen] = useState(false);
  const last = step === STEPS.length - 1;

  // The sheet covers the page — stop the page (and Lenis) scrolling behind it.
  useLockBody(open);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[70] bg-ink-950/45 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-x-0 bottom-0 z-[71] max-h-[80vh] overflow-y-auto rounded-t-[var(--radius-xl)] bg-sand-50 p-4 pb-28 lg:hidden"
            >
              <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-ink-300" aria-hidden="true" />
              {summary}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 z-[72] border-t border-ink-100 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="min-w-0 flex-1 text-left"
            aria-expanded={open}
          >
            <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-400">
              {nights ? `${nights} night${nights === 1 ? '' : 's'} · tap for details` : 'Estimated total'}
            </span>
            <AnimatedPrice
              value={total}
              currency={hotel.currency}
              className="font-display text-2xl leading-tight text-ink-900"
            />
          </button>

          {step > 0 && (
            <Button variant="outline" size="sm" onClick={onBack} aria-label="Previous step">
              <ArrowLeft size={16} />
            </Button>
          )}
          <Button size="md" disabled={!canAdvance} onClick={onNext}>
            {last ? 'Confirm' : 'Continue'} <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </>
  );
}
