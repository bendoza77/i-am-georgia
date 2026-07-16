import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Phone } from 'lucide-react';
import { NAV_LINKS } from '../../constants/navigation';
import { SITE } from '../../constants/site';
import { useScrolled } from '../../hooks/useScrolled';
import { useMagnetic } from '../../hooks/useMagnetic';
import { cn } from '../../utils/cn';
import Logo from '../shared/Logo';
import Button from '../ui/Button';
import MobileMenu from './MobileMenu';

/** A single desktop nav link with an animated underline. */
function NavItem({ to, label }) {
  return (
    <NavLink to={to} className="group relative px-1 py-2 text-sm font-medium" data-cursor="hover">
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'transition-colors duration-300',
              isActive ? 'text-brand-600' : 'text-inherit group-hover:text-brand-600',
            )}
          >
            {label}
          </span>
          <span
            className={cn(
              'absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-brand-500 transition-all duration-500 ease-[var(--ease-out-expo)]',
              isActive ? 'w-full' : 'w-0 group-hover:w-full',
            )}
          />
        </>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const scrolled = useScrolled(40);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const bookBtn = useMagnetic(0.25);

  // Home hero is dark → nav text is light until scrolled.
  const overHero = location.pathname === '/' && !scrolled;
  const textTone = overHero ? 'text-white/85' : 'text-ink-700';

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed inset-x-0 top-0 z-[80] transition-[background,box-shadow,padding] duration-500',
          scrolled
            ? 'glass py-2.5 shadow-[0_8px_30px_-12px_rgba(20,18,16,0.15)]'
            : 'bg-transparent py-4',
        )}
      >
        <nav className="container-x flex items-center justify-between gap-6">
          <Logo tone={overHero ? 'light' : 'dark'} />

          <div className={cn('hidden items-center gap-7 lg:flex', textTone)}>
            {NAV_LINKS.map((link) => (
              <NavItem key={link.label} to={link.to} label={link.label} />
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={`tel:${SITE.phone}`}
              className={cn(
                'inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-brand-500',
                textTone,
              )}
            >
              <Phone size={15} /> {SITE.phone}
            </a>
            <span
              ref={bookBtn.ref}
              onMouseMove={bookBtn.onMouseMove}
              onMouseLeave={bookBtn.onMouseLeave}
              className="inline-block transition-transform duration-300 ease-out will-change-transform"
            >
              <Button to="/tours" size="sm">
                Book Now
              </Button>
            </span>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className={cn(
              'grid h-11 w-11 place-items-center rounded-full border transition-colors lg:hidden',
              overHero ? 'border-white/25 text-white' : 'border-ink-200 text-ink-900',
            )}
          >
            <Menu size={22} />
          </button>
        </nav>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
