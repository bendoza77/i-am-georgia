import { useMemo, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import Section from '../../components/ui/Section';
import FilterPills from '../../components/ui/FilterPills';
import SmartImage from '../../components/ui/SmartImage';
import { useLockBody } from '../../hooks/useLockBody';
import { GALLERY, GALLERY_CATEGORIES } from '../../constants/content';
import { unsplash } from '../../utils/image';

const SPAN = {
  tall: 'row-span-2',
  wide: 'sm:col-span-2',
  normal: '',
};

function Lightbox({ items, index, onClose, onNav }) {
  useLockBody(index !== null);

  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    },
    [onClose, onNav],
  );

  useEffect(() => {
    if (index === null) return undefined;
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [index, handleKey]);

  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink-950/95 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-brand-400 hover:text-brand-400"
          >
            <X size={22} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onNav(-1); }}
            aria-label="Previous"
            className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-brand-400 hover:text-brand-400 sm:left-8"
          >
            <ArrowLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(1); }}
            aria-label="Next"
            className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-brand-400 hover:text-brand-400 sm:right-8"
          >
            <ArrowRight size={22} />
          </button>

          <motion.figure
            key={item.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-h-[85vh] max-w-4xl overflow-hidden rounded-[var(--radius-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={unsplash(item.image.match(/photo-([^?]+)/)?.[1] ?? '', { w: 1600 })}
              alt={item.caption}
              className="max-h-[80vh] w-auto object-contain"
            />
            <figcaption className="bg-ink-900 px-5 py-3 text-center text-sm text-white/80">
              {item.caption} · <span className="text-brand-400">{item.category}</span>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Gallery() {
  const [category, setCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const filtered = useMemo(
    () => (category === 'All' ? GALLERY : GALLERY.filter((g) => g.category === category)),
    [category],
  );

  const navigate = useCallback(
    (dir) => setLightbox((i) => (i === null ? i : (i + dir + filtered.length) % filtered.length)),
    [filtered.length],
  );

  return (
    <>
      <PageHero
        eyebrow="Through the lens"
        title="Gallery"
        lead="A wall of moments from across Georgia — tap any frame to step inside it."
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
          className="mt-12 grid auto-rows-[200px] grid-cols-2 gap-4 sm:auto-rows-[240px] md:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((g, i) => (
              <motion.button
                key={g.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setLightbox(i)}
                className={`group relative overflow-hidden rounded-[var(--radius-md)] ${SPAN[g.span] ?? ''}`}
                data-cursor="hover"
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
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </Section>

      <Lightbox items={filtered} index={lightbox} onClose={() => setLightbox(null)} onNav={navigate} />
    </>
  );
}
