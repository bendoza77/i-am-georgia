import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ArrowUpRight, Phone, Mail } from 'lucide-react';
import { NAV_LINKS } from '../../constants/navigation';
import { SITE, SOCIALS } from '../../constants/site';
import { useLockBody } from '../../hooks/useLockBody';
import Logo from '../shared/Logo';
import Button from '../ui/Button';

const panel = {
  hidden: { clipPath: 'circle(0% at calc(100% - 3rem) 3rem)' },
  show: {
    clipPath: 'circle(150% at calc(100% - 3rem) 3rem)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    clipPath: 'circle(0% at calc(100% - 3rem) 3rem)',
    transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] },
  },
};

const list = { show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } };
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function MobileMenu({ open, onClose }) {
  useLockBody(open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-[90] flex flex-col bg-ink-950 text-white lg:hidden"
        >
          <div className="pointer-events-none absolute -left-1/4 top-1/3 h-96 w-96 rounded-full bg-brand-600/25 blur-[120px]" />

          <div className="container-x flex h-20 items-center justify-between">
            <Logo tone="light" />
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-brand-400 hover:text-brand-400"
            >
              <X size={22} />
            </button>
          </div>

          <motion.nav
            variants={list}
            initial="hidden"
            animate="show"
            className="container-x flex flex-1 flex-col justify-center gap-1"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div key={link.label} variants={item} className="overflow-hidden">
                <Link
                  to={link.to}
                  onClick={onClose}
                  className="group flex items-center justify-between border-b border-white/10 py-4"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-sm text-brand-400">0{i + 1}</span>
                    <span className="font-display text-4xl text-white/90 transition-colors group-hover:text-brand-400 sm:text-5xl">
                      {link.label}
                    </span>
                  </span>
                  <ArrowUpRight className="text-white/30 transition-all group-hover:translate-x-1 group-hover:text-brand-400" />
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            className="container-x flex flex-col gap-6 pb-10"
          >
            <Button to="/tours" size="lg" className="w-full" onClick={onClose}>
              Book Your Journey
            </Button>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <a href={`tel:${SITE.phone}`} className="inline-flex items-center gap-2 hover:text-white">
                <Phone size={15} /> {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 hover:text-white">
                <Mail size={15} /> {SITE.email}
              </a>
            </div>
            <div className="flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold uppercase tracking-widest text-white/50 hover:text-brand-400"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
