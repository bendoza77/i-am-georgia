import { useState } from 'react';
import { ArrowUpRight, Check, Clock, Mail, MapPin, Phone, Send, ShieldCheck } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import Section from '../../components/ui/Section';
import Field from '../../components/ui/Field';
import Reveal from '../../components/ui/Reveal';
import SmartImage from '../../components/ui/SmartImage';
import FAQ from '../../components/sections/FAQ';
import { SITE, SOCIALS } from '../../constants/site';
import { unsplash } from '../../utils/image';
import { cn } from '../../utils/cn';

/*
 * Responsive strategy
 *
 * The page has two columns of very different content, and on desktop the info
 * column is roughly half the width of the viewport-based breakpoint it sits
 * under — so viewport breakpoints kept guessing wrong (info cards squeezed
 * two-up inside a 545px column while the same cards sat one-up on a 700px
 * tablet). Both columns are `@container`s instead: every card, field row and
 * tile responds to the width of the column it actually lives in.
 */

const INFO = [
  {
    icon: Phone,
    label: 'Call us',
    value: SITE.phone,
    href: `tel:${SITE.phone.replace(/\s/g, '')}`,
    action: 'Tap to call',
  },
  {
    icon: Mail,
    label: 'Email us',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    action: 'Opens your mail app',
  },
  {
    icon: MapPin,
    label: 'Visit us',
    value: SITE.address,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`,
    external: true,
    action: 'Get directions',
  },
  { icon: Clock, label: 'Opening hours', value: SITE.hours, action: 'Tbilisi time (GET)' },
];

/** What the enquiry is about — steers the message to the right specialist. */
const TOPICS = ['A tour', 'A hotel', 'A custom trip', 'Something else'];

const MAP_QUERY = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`;

/** One contact method. Renders as a link when it has somewhere to go. */
function InfoCard({ icon: Icon, label, value, href, external, action }) {
  const body = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
        <Icon size={19} />
      </span>
      {/* `min-w-0` + wrapping is what keeps a long address or email from
          blowing the card out of the grid on a 320px phone. */}
      <span className="min-w-0 flex-1">
        <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-400">
          {label}
        </span>
        <span className="mt-1 block break-words text-[0.95rem] font-medium leading-snug text-ink-900">
          {value}
        </span>
        <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-ink-400 transition-colors group-hover:text-brand-600">
          {action}
          {href && <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5" />}
        </span>
      </span>
    </>
  );

  const shell =
    'group flex min-h-[5.5rem] items-start gap-4 rounded-[var(--radius-lg)] border border-ink-100 bg-white p-4 transition-[transform,border-color,box-shadow] duration-300 ease-[var(--ease-out-expo)] sm:p-5';

  return href ? (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={cn(shell, 'hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-soft)]')}
    >
      {body}
    </a>
  ) : (
    <div className={shell}>{body}</div>
  );
}

export default function Contact() {
  const [topic, setTopic] = useState(TOPICS[0]);
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
        {/* 12-column desktop grid. Below lg it is a single stack with a
            deliberate order: the ways to reach a human come first on a phone,
            the long form second. */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16">
          {/* ---------------- Info column ---------------- */}
          <div className="@container lg:col-span-5">
            <div className="max-w-xl lg:max-w-none">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
                <span className="h-px w-6 bg-brand-500/50" />
                Reach us directly
              </span>
              <h2 className="mt-4 text-balance font-display text-[clamp(1.75rem,5vw,2.5rem)] leading-[1.1] text-ink-900">
                A real person, every time
              </h2>
              <p className="mt-3 text-pretty leading-relaxed text-ink-500">
                No ticket queues and no chatbots on this line — the team that answers is the team
                that builds your itinerary.
              </p>
            </div>

            {/* Two-up only once the column itself is genuinely wide (tablet
                full-width), never inside the narrow desktop sidebar. */}
            <div className="mt-7 grid gap-3 @2xl:grid-cols-2 @2xl:gap-4">
              {INFO.map((it) => (
                <InfoCard key={it.label} {...it} />
              ))}
            </div>

            {/* Map. The aspect ratio tightens as the column narrows so it never
                eats a whole phone screen. */}
            <a
              href={MAP_QUERY}
              target="_blank"
              rel="noreferrer"
              className="group relative mt-4 block aspect-[3/2] overflow-hidden rounded-[var(--radius-xl)] border border-ink-100 @lg:aspect-[16/9] @3xl:aspect-[2/1]"
            >
              <SmartImage
                src={unsplash('1524661135-423995f22d0b', { w: 1200, q: 70 })}
                alt={`Map showing ${SITE.name} in Tbilisi`}
                w={640}
                sizes="(min-width: 1024px) 40vw, 92vw"
                wrapperClassName="h-full w-full"
                className="transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-ink-950/25" />

              {/* CSS keyframes, not a framer loop — an infinite JS animation
                  keeps the main thread busy for as long as the page is open. */}
              <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-full animate-float place-items-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-glow)]">
                <MapPin size={21} />
              </span>

              <span className="glass absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-full py-2 pl-4 pr-3 sm:inset-x-4 sm:bottom-4">
                <span className="truncate text-sm font-medium text-ink-900">
                  {SITE.name} · Tbilisi HQ
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600">
                  Directions <ArrowUpRight size={13} />
                </span>
              </span>
            </a>

            <div className="mt-5 flex flex-wrap gap-2">
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

          {/* ---------------- Form column ---------------- */}
          <div className="@container lg:col-span-7">
            <Reveal variant="left">
              <div className="rounded-[var(--radius-2xl)] border border-ink-100 bg-white p-5 shadow-[var(--shadow-soft)] @lg:p-8 @3xl:p-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-display text-[clamp(1.5rem,4.5vw,2rem)] leading-tight text-ink-900">
                      Send us a message
                    </h2>
                    <p className="mt-2 text-ink-500">We reply within one business day.</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <ShieldCheck size={13} /> No spam, ever
                  </span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                    setTimeout(() => setSent(false), 4000);
                  }}
                  className="mt-7 space-y-4"
                >
                  {/* Topic picker — real radios, so it works with a keyboard
                      and reads correctly to assistive tech. */}
                  <fieldset>
                    <legend className="mb-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-400">
                      What's it about?
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((t) => (
                        <label
                          key={t}
                          className={cn(
                            'cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                            'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
                            topic === t
                              ? 'border-ink-900 bg-ink-900 text-white'
                              : 'border-ink-200 text-ink-600 hover:border-brand-400 hover:text-brand-600',
                          )}
                        >
                          <input
                            type="radio"
                            name="topic"
                            value={t}
                            checked={topic === t}
                            onChange={() => setTopic(t)}
                            className="sr-only"
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Paired fields split only when the card is wide enough for
                      two comfortable inputs — not at an arbitrary 640px. */}
                  <div className="grid gap-4 @lg:grid-cols-2">
                    <Field label="Full name" name="name" autoComplete="name" required />
                    <Field
                      label="Email address"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="grid gap-4 @lg:grid-cols-2">
                    <Field
                      label="Phone (optional)"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                    <Field label="Travel dates" name="dates" />
                  </div>
                  <Field
                    label="Tell us about your dream trip"
                    name="message"
                    textarea
                    rows={5}
                    required
                  />

                  <button
                    type="submit"
                    className={cn(
                      'inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-8 font-semibold text-white',
                      'transition-[background-color,transform] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 active:translate-y-0',
                      sent ? 'bg-emerald-600' : 'bg-brand-500 hover:bg-brand-600',
                    )}
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
                  </button>

                  {/* Announced to screen readers without moving anything */}
                  <p role="status" aria-live="polite" className="sr-only">
                    {sent ? 'Your message has been sent. We will reply within one business day.' : ''}
                  </p>

                  <p className="text-center text-xs leading-relaxed text-ink-400">
                    By sending this you agree we may contact you about your enquiry. Prefer to
                    talk?{' '}
                    <a
                      href={`tel:${SITE.phone.replace(/\s/g, '')}`}
                      className="font-semibold text-brand-600 underline-offset-2 hover:underline"
                    >
                      {SITE.phone}
                    </a>
                  </p>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <FAQ />
    </>
  );
}
