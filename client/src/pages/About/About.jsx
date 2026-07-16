import { motion } from 'framer-motion';
import PageHero from '../../components/shared/PageHero';
import Section from '../../components/ui/Section';
import SectionHeader from '../../components/ui/SectionHeader';
import SmartImage from '../../components/ui/SmartImage';
import Reveal from '../../components/ui/Reveal';
import Icon from '../../components/ui/Icon';
import StatCounter from '../../components/ui/StatCounter';
import CTA from '../../components/sections/CTA';
import { VALUES, TIMELINE, TEAM } from '../../constants/content';
import { STATS } from '../../constants/site';
import { unsplash } from '../../utils/image';
import { staggerContainer, fadeUp, viewportOnce } from '../../animations/variants';

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="Who we are"
        title="Our Story"
        lead="Two friends, one shared table, and a stubborn belief that travel should feel like coming home."
        image={unsplash('1524594152303-9fd13543fe6e', { w: 2000 })}
      />

      {/* Story */}
      <Section id="story" className="bg-sand-50">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal variant="right">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--shadow-lift)]">
              <SmartImage
                src={unsplash('1602343168117-bb8ffe3e2e9f', { w: 1200 })}
                alt="Ancient Georgia"
                fallbackSeed="about-story"
                wrapperClassName="h-full w-full"
              />
            </div>
          </Reveal>
          <div>
            <SectionHeader
              eyebrow="Since 2013"
              title="Born at a Georgian table"
              lead="I'm Georgia began the way most good things here do — over wine, bread and a promise to show a visitor the country we love."
            />
            <div className="mt-6 space-y-4 text-ink-500 leading-relaxed">
              <p>
                What started as guiding friends-of-friends to our home villages in Kakheti and Svaneti
                grew, one heartfelt trip at a time, into a small studio of designers, guides and hosts.
              </p>
              <p>
                We still believe the best journeys aren&rsquo;t bought — they&rsquo;re composed. So we
                travel slowly, listen closely, and open doors that no itinerary can print.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-6">
              {STATS.slice(0, 2).map((s) => (
                <div key={s.label} className="rounded-2xl border border-ink-100 bg-white p-5">
                  <p className="font-display text-4xl text-brand-600">
                    <StatCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-sm text-ink-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Mission / Vision / Values */}
      <Section className="bg-ink-950 text-white">
        <div className="pointer-events-none absolute left-1/4 top-0 h-72 w-72 rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal variant="up" className="rounded-[var(--radius-xl)] border border-white/10 bg-white/5 p-8 lg:p-10">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Our mission</span>
            <p className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
              To let every traveller feel the warmth, wildness and wonder of Georgia — as a welcomed guest, never a tourist.
            </p>
          </Reveal>
          <Reveal variant="up" delay={0.1} className="rounded-[var(--radius-xl)] border border-white/10 bg-white/5 p-8 lg:p-10">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Our vision</span>
            <p className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
              A Georgia known worldwide not for a checklist of sights, but for the way it makes people feel — and travel that gives back to it.
            </p>
          </Reveal>
        </div>

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {VALUES.map((v) => (
            <motion.div key={v.title} variants={fadeUp} className="rounded-[var(--radius-lg)] border border-white/10 p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/15 text-brand-400">
                <Icon name={v.icon} size={22} />
              </span>
              <h3 className="mt-4 font-display text-xl text-white">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{v.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Timeline */}
      <Section className="bg-sand-100">
        <SectionHeader
          eyebrow="Our journey"
          title="A dozen years in the making"
          align="center"
          className="mx-auto"
        />
        <div className="relative mx-auto mt-16 max-w-3xl">
          <div className="absolute left-4 top-0 h-full w-px bg-ink-200 sm:left-1/2" />
          <div className="space-y-10">
            {TIMELINE.map((t, i) => (
              <Reveal
                key={t.year}
                variant={i % 2 === 0 ? 'right' : 'left'}
                className={`relative pl-12 sm:w-1/2 sm:pl-0 ${
                  i % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:ml-auto sm:pl-12'
                }`}
              >
                <span
                  className={`absolute left-2.5 top-1.5 h-4 w-4 rounded-full border-4 border-sand-100 bg-brand-500 sm:left-auto ${
                    i % 2 === 0 ? 'sm:-right-2' : 'sm:-left-2'
                  }`}
                />
                <span className="font-display text-3xl text-brand-600">{t.year}</span>
                <h3 className="mt-1 font-display text-xl text-ink-900">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{t.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Team */}
      <Section id="team" className="bg-sand-50">
        <SectionHeader
          eyebrow="The people"
          title="Meet your hosts"
          lead="Guides, designers and storytellers who were born to these mountains and valleys."
          align="center"
          className="mx-auto"
        />
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TEAM.map((m) => (
            <motion.article key={m.name} variants={fadeUp} className="group text-center">
              <div className="relative mx-auto aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)]">
                <SmartImage
                  src={m.image}
                  alt={m.name}
                  fallbackSeed={m.name}
                  wrapperClassName="h-full w-full"
                  className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mt-4 font-display text-xl text-ink-900">{m.name}</h3>
              <p className="text-sm text-brand-600">{m.role}</p>
            </motion.article>
          ))}
        </motion.div>
      </Section>

      <CTA />
    </>
  );
}
