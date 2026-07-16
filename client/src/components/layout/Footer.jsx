import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { FOOTER_NAV } from '../../constants/navigation';
import { SITE, SOCIALS } from '../../constants/site';
import Logo from '../shared/Logo';
import Reveal from '../ui/Reveal';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-96 w-[120%] -translate-x-1/2 rounded-[100%] bg-brand-600/15 blur-[120px]" />

      {/* Newsletter band */}
      <div className="container-x relative border-b border-white/10 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal variant="up">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-400">
              Join the journey
            </p>
            <h2 className="mt-4 max-w-md font-display text-4xl leading-tight sm:text-5xl">
              Stories, secret spots & seasonal offers.
            </h2>
          </Reveal>

          <Reveal variant="up" delay={0.1}>
            <form onSubmit={(e) => e.preventDefault()} className="w-full">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  aria-label="Email address"
                  className="h-14 w-full flex-1 rounded-full border border-white/15 bg-white/5 px-6 text-white placeholder:text-white/40 outline-none transition-colors focus:border-brand-400"
                />
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-500 px-7 font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  Subscribe <ArrowRight size={18} />
                </motion.button>
              </div>
              <p className="mt-3 pl-2 text-xs text-white/40">
                No spam — just the good stuff. Unsubscribe anytime.
              </p>
            </form>
          </Reveal>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">{SITE.description}</p>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-3">
              <MapPin size={16} className="text-brand-400" /> {SITE.address}
            </li>
            <li>
              <a href={`tel:${SITE.phone}`} className="flex items-center gap-3 hover:text-white">
                <Phone size={16} className="text-brand-400" /> {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 hover:text-white">
                <Mail size={16} className="text-brand-400" /> {SITE.email}
              </a>
            </li>
          </ul>
        </div>

        {FOOTER_NAV.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-lg text-white/90">{col.title}</h3>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center text-sm text-white/60 transition-colors hover:text-brand-400"
                  >
                    <span className="mr-0 h-px w-0 bg-brand-400 transition-all duration-300 group-hover:mr-2 group-hover:w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="container-x relative flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 text-sm text-white/50 sm:flex-row">
        <p>© {new Date().getFullYear()} {SITE.name}. Crafted with care in Tbilisi.</p>
        <div className="flex gap-5">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="font-medium transition-colors hover:text-brand-400"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
