import { motion } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeader from '../ui/SectionHeader';
import SmartImage from '../ui/SmartImage';
import Icon from '../ui/Icon';
import Reveal from '../ui/Reveal';
import { WHY_GEORGIA } from '../../constants/content';
import { unsplash } from '../../utils/image';
import { staggerContainer, fadeUp, viewportOnce } from '../../animations/variants';

export default function WhyGeorgia() {
  return (
    <Section className="bg-sand-100">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Image collage */}
        <Reveal variant="right" className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--shadow-lift)]">
            <SmartImage
              src={unsplash('1508739773434-c26b3d09e071', { w: 1200 })}
              alt="Svaneti towers"
              fallbackSeed="svaneti-why"
              wrapperClassName="h-full w-full"
            />
          </div>
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-8 -left-6 hidden w-44 overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-lift)] sm:block"
          >
            <div className="aspect-square">
              <SmartImage
                src={unsplash('1524594152303-9fd13543fe6e', { w: 500 })}
                alt="Georgian feast"
                fallbackSeed="supra-why"
                wrapperClassName="h-full w-full"
              />
            </div>
          </motion.div>
          <div className="glass absolute -right-4 top-8 rounded-2xl px-5 py-4 shadow-[var(--shadow-soft)]">
            <p className="font-display text-3xl text-brand-600">12</p>
            <p className="text-xs font-medium uppercase tracking-wider text-ink-500">years local</p>
          </div>
        </Reveal>

        {/* Copy + reasons */}
        <div className="order-1 lg:order-2">
          <SectionHeader
            eyebrow="Why I'm Georgia"
            title="Travel like a local, cared for like a guest"
            lead="We are Georgians first and travel designers second. Every route begins at a real table, in a real village, with people who call this home."
          />

          <motion.ul
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2"
          >
            {WHY_GEORGIA.map((r) => (
              <motion.li key={r.title} variants={fadeUp} className="flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-600">
                  <Icon name={r.icon} size={22} />
                </span>
                <div>
                  <h3 className="font-display text-lg text-ink-900">{r.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{r.text}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </Section>
  );
}
