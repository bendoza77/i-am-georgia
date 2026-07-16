import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageHero from '../../components/shared/PageHero';
import Section from '../../components/ui/Section';
import FilterPills from '../../components/ui/FilterPills';
import TourCard from '../../components/shared/TourCard';
import Experiences from '../../components/sections/Experiences';
import CTA from '../../components/sections/CTA';
import { TOURS, TOUR_FILTERS } from '../../constants/tours';
import { unsplash } from '../../utils/image';

export default function Tours() {
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(
    () => (filter === 'All' ? TOURS : TOURS.filter((t) => t.category === filter)),
    [filter],
  );

  return (
    <>
      <PageHero
        eyebrow="Signature journeys"
        title="Tours & Packages"
        lead="Small groups, licensed local guides and stays with soul. Every price is honest and all-in."
        image={unsplash('1464822759023-fed622ff2c3b', { w: 2000 })}
      />

      <Section className="bg-sand-50">
        <FilterPills items={TOUR_FILTERS} active={filter} onChange={setFilter} layoutId="tour-pill" />

        <motion.div layout className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((tour) => (
              <motion.div
                key={tour.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <TourCard tour={tour} className="h-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Section>

      <Experiences />
      <CTA />
    </>
  );
}
