import { motion } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import DestinationCard from '../shared/DestinationCard';
import { DESTINATIONS } from '../../constants/destinations';
import { staggerContainer, fadeUp, viewportOnce } from '../../animations/variants';

const featured = DESTINATIONS.filter((d) => d.featured).slice(0, 4);

export default function PopularDestinations() {
  return (
    <Section className="bg-sand-50">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          eyebrow="Where to go"
          title="Popular destinations"
          lead="Nine regions, one small country — each with its own light, language of stone, and reason to stay longer than you planned."
        />
        <Button to="/destinations" variant="outline" className="shrink-0">
          All destinations
        </Button>
      </div>

      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2"
      >
        {featured.map((item, i) => (
          <motion.div
            key={item.id}
            variants={fadeUp}
            className={i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}
          >
            <DestinationCard item={item} large={i === 0} className="h-full" />
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
