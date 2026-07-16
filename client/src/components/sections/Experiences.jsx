import { motion } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import SmartImage from '../ui/SmartImage';
import Icon from '../ui/Icon';
import { EXPERIENCES } from '../../constants/tours';
import { staggerContainer, fadeUp, viewportOnce } from '../../animations/variants';

/** Travel categories — image tiles that reveal a caption on hover. */
export default function Experiences() {
  return (
    <Section id="experiences" className="bg-ink-950 text-white">
      <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-brand-600/20 blur-[120px]" />

      <SectionHeader
        eyebrow="Ways to travel"
        title="Choose your experience"
        lead="Whatever moves you — a summit, a cellar, a centuries-old chant — we build the whole journey around it."
        tone="light"
        align="center"
        className="relative"
      />

      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5"
      >
        {EXPERIENCES.map((exp) => (
          <motion.article
            key={exp.id}
            variants={fadeUp}
            className="group relative aspect-square overflow-hidden rounded-[var(--radius-lg)] sm:aspect-[4/5]"
          >
            <SmartImage
              src={exp.image}
              alt={exp.title}
              fallbackSeed={exp.id}
              wrapperClassName="absolute inset-0 h-full w-full"
              className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-brand-500/90 text-white shadow-[var(--shadow-glow)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-6">
                <Icon name={exp.icon} size={20} />
              </span>
              <h3 className="font-display text-xl text-white sm:text-2xl">{exp.title}</h3>
              <p className="mt-1 max-h-0 overflow-hidden text-sm leading-relaxed text-white/75 opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
                {exp.text}
              </p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </Section>
  );
}
