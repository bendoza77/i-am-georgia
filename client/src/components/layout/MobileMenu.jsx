import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin, Phone, X } from 'lucide-react';
import { NAV_LINKS } from '../../constants/navigation';
import { SITE, SOCIALS } from '../../constants/site';
import { useLockBody } from '../../hooks/useLockBody';
import { cn } from '../../utils/cn';
import Logo from '../shared/Logo';
import Button from '../ui/Button';

/*
 * Side sheet, not a fullscreen curtain.
 *
 * The previous panel animated `clip-path: circle()` across the whole viewport,
 * which repaints every pixel behind it on every frame of a 0.7s reveal — the
 * single most expensive way to open a menu. Everything here animates `transform`
 * and `opacity` only, so the sheet is composited and the open/close is free.
 */

const scrim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: 'linear' } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: 'linear' } },
};

const sheet = {
  hidden: { x: '100%' },
  show: {
    x: 0,
    transition: { type: 'spring', stiffness: 280, damping: 32, mass: 0.9 },
  },
  exit: { x: '100%', transition: { duration: 0.3, ease: [0.65, 0, 0.35, 1] } },
};

const list = { hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

/** Rows in the contact block at the foot of the sheet. */
const CONTACT = [
  { icon: Phone, label: 'Call us', value: SITE.phone, href: `tel:${SITE.phone}` },
  { icon: Mail, label: 'Email us', value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: MapPin, label: 'Visit us', value: SITE.address },
];

export default function MobileMenu({ open, onClose }) {
  const { pathname } = useLocation();
  const panelRef = useRef(null);
  useLockBody(open);

  // Escape closes the sheet, and focus moves into it on open so the panel —
  // not the page behind it — is what a keyboard or screen reader lands on.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Hash links ("/tours#experiences") point at a section of a page that has
  // its own entry, so only the plain route is ever marked current.
  const isCurrent = (to) => {
    if (to.includes('#')) return false;
    return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <motion.button
            type="button"
            aria-label="Close menu"
            variants={scrim}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-ink-950/70"
          />

          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            variants={sheet}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn(
              'absolute inset-y-0 right-0 flex w-[min(26rem,92vw)] flex-col bg-ink-950 text-white outline-none',
              'border-l border-white/10 shadow-[-30px_0_70px_-25px_rgba(0,0,0,0.75)]',
            )}
          >
            {/* Brand glow. Static and behind everything, so the blur is
                rasterised once instead of per frame. */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/25 blur-[110px]" />

            {/* Header */}
            <div className="relative flex items-center justify-between gap-4 border-b border-white/10 px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
              <Logo tone="light" />
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-brand-400 hover:text-brand-400 active:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrolling body — on a short landscape phone the whole sheet
                scrolls rather than crushing the nav or hiding the CTA.
                `overscroll-contain` stops the page behind from rubber-banding. */}
            <div className="relative flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6">
              <p className="px-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/35">
                Menu
              </p>

              <motion.nav variants={list} initial="hidden" animate="show" className="mt-3 flex flex-col">
                {NAV_LINKS.map((link, i) => {
                  const current = isCurrent(link.to);
                  return (
                    <motion.div key={link.label} variants={item}>
                      <Link
                        to={link.to}
                        onClick={onClose}
                        aria-current={current ? 'page' : undefined}
                        className={cn(
                          'group relative flex items-center gap-4 rounded-[var(--radius-sm)] px-3 py-3.5 transition-colors',
                          current ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04] active:bg-white/[0.07]',
                        )}
                      >
                        {/* Current-page marker, scaled in on the compositor */}
                        <span
                          className={cn(
                            'absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-brand-500 transition-transform duration-300 ease-[var(--ease-out-expo)]',
                            current ? 'scale-y-100' : 'scale-y-0',
                          )}
                        />
                        <span
                          className={cn(
                            'font-mono text-xs tabular-nums transition-colors',
                            current ? 'text-brand-400' : 'text-white/30',
                          )}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={cn(
                            'flex-1 font-display text-2xl leading-none transition-colors sm:text-[1.75rem]',
                            current ? 'text-white' : 'text-white/80 group-hover:text-white',
                          )}
                        >
                          {link.label}
                        </span>
                        <ArrowUpRight
                          size={18}
                          className={cn(
                            'shrink-0 transition-[transform,color] duration-300',
                            current
                              ? 'text-brand-400'
                              : 'text-white/25 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-400',
                          )}
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.nav>

              {/* Contact block */}
              <motion.div variants={item} initial="hidden" animate="show" className="mt-8">
                <p className="px-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/35">
                  Get in touch
                </p>
                <ul className="mt-3 space-y-1">
                  {CONTACT.map(({ icon: Icon, label, value, href }) => {
                    const inner = (
                      <>
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-brand-400">
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[0.65rem] uppercase tracking-[0.16em] text-white/35">
                            {label}
                          </span>
                          <span className="block truncate text-sm text-white/85">{value}</span>
                        </span>
                      </>
                    );
                    return (
                      <li key={label}>
                        {href ? (
                          <a
                            href={href}
                            className="flex items-center gap-3 rounded-[var(--radius-sm)] px-1 py-2 transition-colors hover:bg-white/[0.04]"
                          >
                            {inner}
                          </a>
                        ) : (
                          <div className="flex items-center gap-3 px-1 py-2">{inner}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            </div>

            {/* Pinned footer — the booking CTA never scrolls out of reach */}
            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
              className="relative border-t border-white/10 bg-ink-950/95 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6"
            >
              <Button to="/tours" size="lg" className="w-full" onClick={onClose}>
                Book Your Journey
              </Button>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-brand-400"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
