import { motion } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import TourCard from '../shared/TourCard';
import { TOURS } from '../../constants/tours';
import { staggerContainer, fadeUp, viewportOnce } from '../../animations/variants';

const featured = TOURS.filter((t) => t.featured).slice(0, 3);

export default function FeaturedTours() {
  return (
    <Section className="bg-sand-50">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          eyebrow="Signature journeys"
          title="Featured tours"
          lead="Hand-crafted itineraries, licensed local guides and stays with soul — priced with nothing hidden."
        />
        <Button to="/tours" variant="outline" className="shrink-0">
          Browse all tours
        </Button>
      </div>

      <motion.div
        variants={staggerContainer(0.14)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {featured.map((tour) => (
          <motion.div key={tour.id} variants={fadeUp}>
            <TourCard tour={tour} className="h-full" />
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
