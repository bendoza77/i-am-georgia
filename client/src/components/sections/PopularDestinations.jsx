import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import DestinationCard from '../shared/DestinationCard';
import { DESTINATIONS } from '../../constants/destinations';
import { useMediaQuery } from '../../hooks/useMediaQuery';

// The whole set rides the rail — enough cards that horizontal travel matters.
const PLACES = DESTINATIONS;

/** One slide. `className` sets its footprint (kept fixed so track width is deterministic). */
function Slide({ item, className }) {
  return (
    <div className={className}>
      <DestinationCard item={item} className="h-full w-full" />
    </div>
  );
}

export default function PopularDestinations() {
  const targetRef = useRef(null);
  const trackRef = useRef(null);
  const distanceRef = useRef(0);
  const [distance, setDistance] = useState(0);

  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const pinned = isDesktop && !reduced;

  // Measure how far the rail must travel so the last card lands fully in view.
  useLayoutEffect(() => {
    if (!pinned) return undefined;
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const d = Math.max(0, track.scrollWidth - track.clientWidth);
      distanceRef.current = d;
      setDistance(d);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [pinned]);

  // Progress runs 0→1 across the whole pinned phase.
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  // Function transformer reads the live distance ref, so a resize never staleness-locks the range.
  const xRaw = useTransform(scrollYProgress, (v) => -v * distanceRef.current);
  const x = useSpring(xRaw, { stiffness: 120, damping: 30, mass: 0.35 });
  const barScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.35 });

  // ── Touch / reduced-motion: native, momentum, snap-per-card. ──
  if (!pinned) {
    return (
      <section className="relative bg-sand-50 py-20 sm:py-28 lg:py-32">
        <div className="container-x flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Where to go"
            title="Popular destinations"
            lead="Nine regions, one small country — each with its own light, language of stone, and reason to stay longer than you planned."
          />
          <Button to="/destinations" variant="outline" className="shrink-0">
            All destinations
          </Button>
        </div>
        <div
          className="hide-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-6 md:px-10"
          style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}
        >
          {PLACES.map((item) => (
            <Slide
              key={item.id}
              item={item}
              className="aspect-[4/5] w-[80vw] shrink-0 snap-start sm:w-[20rem]"
            />
          ))}
        </div>
      </section>
    );
  }

  // ── Desktop: pin the section, scroll vertical → glide horizontal. ──
  return (
    <section
      ref={targetRef}
      className="relative bg-sand-50"
      style={{ height: distance ? `calc(100vh + ${distance}px)` : '100vh' }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden py-[clamp(4rem,10vh,7rem)]">
        {/* compact header — no lead, so the rail fits the viewport */}
        <div className="container-x flex items-end justify-between gap-8">
          <SectionHeader
            eyebrow="Where to go"
            title="Popular destinations"
            lead="Nine regions, one small country — scroll to travel across them."
          />
          <Button to="/destinations" variant="outline" className="mb-2 shrink-0">
            All destinations
          </Button>
        </div>

        {/* progress rail */}
        <div className="container-x mt-7">
          <div className="h-px w-full overflow-hidden rounded-full bg-ink-900/10">
            <motion.div
              style={{ scaleX: barScale, transformOrigin: 'left' }}
              className="h-full w-full bg-brand-500"
            />
          </div>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="mt-8 flex w-full gap-6 px-16 will-change-transform"
        >
          {PLACES.map((item) => (
            <Slide
              key={item.id}
              item={item}
              className="aspect-[4/5] h-[clamp(19rem,48vh,28rem)] shrink-0"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
