import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import Section from '../../components/ui/Section';
import FilterPills from '../../components/ui/FilterPills';
import DestinationCard from '../../components/shared/DestinationCard';
import { DESTINATIONS, DESTINATION_CATEGORIES } from '../../constants/destinations';
import { unsplash } from '../../utils/image';

export default function Destinations() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return DESTINATIONS.filter((d) => {
      const matchCat = category === 'All' || d.category === category;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q || d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [category, query]);

  return (
    <>
      <PageHero
        eyebrow="Where to go"
        title="Destinations"
        lead="From the snow towers of Svaneti to the wine hills of Kakheti — find the region that calls you."
        image={unsplash('1508739773434-c26b3d09e071', { w: 2000 })}
      />

      <Section className="bg-sand-50">
        {/* Controls */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <FilterPills
            items={DESTINATION_CATEGORIES}
            active={category}
            onChange={setCategory}
            layoutId="dest-pill"
          />
          <div className="relative w-full max-w-sm">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations…"
              aria-label="Search destinations"
              className="h-12 w-full rounded-full border border-ink-200 bg-white pl-11 pr-4 text-ink-900 outline-none transition-colors focus:border-brand-400 focus:shadow-[0_0_0_4px_rgba(243,106,46,0.1)]"
            />
          </div>
        </div>

        {/* Grid */}
        <motion.div layout className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <DestinationCard item={item} className="h-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-lg text-ink-400">
            No destinations match your search — try another region.
          </p>
        )}
      </Section>
    </>
  );
}
