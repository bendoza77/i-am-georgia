import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Star,
  Settings,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLockBody } from '../../hooks/useLockBody';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/hotels', label: 'Hotels', icon: BedDouble },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck, soon: true },
  { to: '/admin/reviews', label: 'Reviews', icon: Star, soon: true },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarInner({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-ink-950 text-white">
      {/* Brand */}
      <div className="flex items-center justify-between px-6 py-6">
        <Link to="/admin" onClick={onNavigate} className="flex items-center gap-2.5" aria-label="I'm Georgia admin">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 font-display text-lg font-semibold text-white">
            iG
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg">I&rsquo;m Georgia</span>
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-brand-400">
              Admin Suite
            </span>
          </span>
        </Link>
        <button onClick={onNavigate} className="text-white/50 hover:text-white lg:hidden" aria-label="Close menu">
          <X size={22} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="px-3 pb-2 pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/30">
          Manage
        </p>
        {NAV.map((item) => {
          const Icon = item.icon;
          if (item.soon) {
            return (
              <span
                key={item.label}
                className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/35"
              >
                <span className="flex items-center gap-3">
                  <Icon size={19} />
                  {item.label}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide">
                  Soon
                </span>
              </span>
            );
          }
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-500/15 text-brand-300' : 'text-white/70 hover:bg-white/5 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="admin-active"
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-500"
                    />
                  )}
                  <Icon size={19} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink size={19} /> View live site
        </Link>
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80"
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">Nino K.</p>
            <p className="truncate text-xs text-white/50">Administrator</p>
          </div>
          <button className="text-white/40 hover:text-white" aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar({ mobileOpen, onClose }) {
  useLockBody(mobileOpen);

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarInner onNavigate={() => {}} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <SidebarInner onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
