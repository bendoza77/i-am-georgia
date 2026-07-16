import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Check } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import Section from '../../components/ui/Section';
import Field from '../../components/ui/Field';
import Reveal from '../../components/ui/Reveal';
import FAQ from '../../components/sections/FAQ';
import { SITE, SOCIALS } from '../../constants/site';
import { unsplash } from '../../utils/image';

const INFO = [
  { icon: MapPin, label: 'Visit us', value: SITE.address },
  { icon: Phone, label: 'Call us', value: SITE.phone, href: `tel:${SITE.phone}` },
  { icon: Mail, label: 'Email us', value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: Clock, label: 'Opening hours', value: SITE.hours },
];

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Say hello"
        title="Let's plan your Georgia"
        lead="Tell us your dates and your dreams — a local expert will craft a first idea within a day."
        image={unsplash('1533105079780-92b9be482077', { w: 2000 })}
      />

      <Section className="bg-sand-50">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Info + map */}
          <div>
            <div className="grid gap-5 sm:grid-cols-2">
              {INFO.map((it) => {
                const Inner = (
                  <>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-600">
                      <it.icon size={20} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{it.label}</p>
                      <p className="mt-1 text-ink-900">{it.value}</p>
                    </div>
                  </>
                );
                return (
                  <div key={it.label} className="rounded-2xl border border-ink-100 bg-white p-5">
                    {it.href ? (
                      <a href={it.href} className="flex gap-4 transition-colors hover:text-brand-600">
                        {Inner}
                      </a>
                    ) : (
                      <div className="flex gap-4">{Inner}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Map placeholder */}
            <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-ink-100">
              <img
                src={unsplash('1524661135-423995f22d0b', { w: 1200, q: 70 })}
                alt="Map of Tbilisi"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-ink-950/20" />
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-full place-items-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-glow)]"
              >
                <MapPin size={22} />
              </motion.span>
              <div className="glass absolute bottom-4 left-4 rounded-full px-4 py-2 text-sm font-medium text-ink-900">
                {SITE.name} · Tbilisi HQ
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-400 hover:text-brand-600"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <Reveal variant="left">
            <div className="rounded-[var(--radius-2xl)] border border-ink-100 bg-white p-7 shadow-[var(--shadow-soft)] sm:p-9">
              <h2 className="font-display text-3xl text-ink-900">Send us a message</h2>
              <p className="mt-2 text-ink-500">We reply within one business day.</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  setTimeout(() => setSent(false), 3500);
                }}
                className="mt-7 space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" required />
                  <Field label="Email address" type="email" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone (optional)" type="tel" />
                  <Field label="Travel dates" />
                </div>
                <Field label="Tell us about your dream trip" textarea rows={5} required />

                <motion.button
                  type="submit"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-8 font-semibold text-white transition-colors ${
                    sent ? 'bg-emerald-600' : 'bg-brand-500 hover:bg-brand-600'
                  }`}
                >
                  {sent ? (
                    <>
                      <Check size={18} /> Message sent — talk soon!
                    </>
                  ) : (
                    <>
                      Send message <Send size={17} />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </Reveal>
        </div>
      </Section>

      <FAQ />
    </>
  );
}
