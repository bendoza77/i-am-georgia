import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import SmartImage from '../ui/SmartImage';
import { GALLERY } from '../../constants/content';
import { staggerContainer, fadeUp, viewportOnce } from '../../animations/variants';

const preview = GALLERY.slice(0, 6);

// Spans that tile with zero gaps at both 2-col and 4-col:
// a 2×2 hero, two wide bands and two squares fill every cell.
const SPAN = ['col-span-2 row-span-2', 'col-span-2', '', '', 'col-span-2', 'col-span-2'];

export default function GalleryPreview() {
  return (
    <Section className="bg-sand-100">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          eyebrow="Through the lens"
          title="A country worth framing"
          lead="A few frames from recent journeys. Every one is a place you can actually stand."
        />
        <Button to="/gallery" variant="outline" className="shrink-0">
          Open the gallery
        </Button>
      </div>

      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-14 grid auto-rows-[180px] grid-cols-2 gap-4 sm:auto-rows-[220px] md:grid-cols-4"
      >
        {preview.map((g, i) => (
          <motion.figure
            key={g.id}
            variants={fadeUp}
            className={`group relative overflow-hidden rounded-[var(--radius-md)] ${SPAN[i] ?? ''}`}
          >
            <SmartImage
              src={g.image}
              alt={g.caption}
              fallbackSeed={g.id}
              wrapperClassName="h-full w-full"
              className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink-950/70 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <figcaption className="flex items-center gap-1.5 text-sm font-medium text-white">
                <ArrowUpRight size={15} /> {g.caption}
              </figcaption>
            </div>
          </motion.figure>
        ))}
      </motion.div>
    </Section>
  );
}
