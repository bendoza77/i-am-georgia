import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageHero from '../../components/shared/PageHero';
import Section from '../../components/ui/Section';
import FilterPills from '../../components/ui/FilterPills';
import SmartImage from '../../components/ui/SmartImage';
import { GALLERY, GALLERY_CATEGORIES } from '../../constants/content';
import { unsplash } from '../../utils/image';

const SPAN = {
  tall: 'row-span-2',
  wide: 'sm:col-span-2',
  normal: '',
};

export default function Gallery() {
  const [category, setCategory] = useState('All');

  const filtered = useMemo(
    () => (category === 'All' ? GALLERY : GALLERY.filter((g) => g.category === category)),
    [category],
  );

  return (
    <>
      <PageHero
        eyebrow="Through the lens"
        title="Gallery"
        lead="A wall of moments from across Georgia."
        image={unsplash('1441974231531-c6227db76b6e', { w: 2000 })}
      />

      <Section className="bg-sand-50">
        <FilterPills
          items={GALLERY_CATEGORIES}
          active={category}
          onChange={setCategory}
          layoutId="gallery-pill"
          className="justify-center"
        />

        <motion.div
          layout
          className="mt-12 grid grid-flow-dense auto-rows-[200px] grid-cols-2 gap-4 sm:auto-rows-[240px] md:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((g) => (
              <motion.div
                key={g.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative overflow-hidden rounded-[var(--radius-md)] ${SPAN[g.span] ?? ''}`}
              >
                <SmartImage
                  src={g.image}
                  alt={g.caption}
                  fallbackSeed={g.id}
                  wrapperClassName="h-full w-full"
                  className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink-950/70 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="text-sm font-medium text-white">{g.caption}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Section>
    </>
  );
}
