import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, CheckCircle2, Star, DollarSign, ArrowUpRight, Plus } from 'lucide-react';
import { useHotels } from '../../context/HotelsContext';
import { StatusBadge } from '../../components/admin/ui';
import SmartImage from '../../components/ui/SmartImage';

function StatCard({ icon: Icon, label, value, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-ink-100 bg-white p-5 shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
          <Icon size={22} />
        </span>
        {sub && <span className="text-xs font-semibold text-emerald-600">{sub}</span>}
      </div>
      <p className="mt-4 font-display text-3xl text-ink-900">{value}</p>
      <p className="mt-1 text-sm text-ink-500">{label}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { hotels } = useHotels();

  const published = hotels.filter((h) => h.status === 'published').length;
  const avgRating = hotels.length
    ? (hotels.reduce((s, h) => s + Number(h.rating || 0), 0) / hotels.length).toFixed(1)
    : '0.0';
  const avgPrice = hotels.length
    ? Math.round(hotels.reduce((s, h) => s + Number(h.pricePerNight || 0), 0) / hotels.length)
    : 0;

  // City distribution for the mini bar chart
  const byCity = hotels.reduce((acc, h) => {
    acc[h.city] = (acc[h.city] || 0) + 1;
    return acc;
  }, {});
  const cityRows = Object.entries(byCity).sort((a, b) => b[1] - a[1]);
  const maxCity = Math.max(1, ...cityRows.map(([, n]) => n));

  const recent = hotels.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink-900">Dashboard</h1>
          <p className="mt-1 text-ink-500">Welcome back — here&rsquo;s how your hotels are doing.</p>
        </div>
        <Link
          to="/admin/hotels/new"
          className="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus size={18} /> Add hotel
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BedDouble} label="Total hotels" value={hotels.length} sub="+2 this month" delay={0} />
        <StatCard icon={CheckCircle2} label="Published" value={published} delay={0.06} />
        <StatCard icon={Star} label="Avg. guest rating" value={avgRating} delay={0.12} />
        <StatCard icon={DollarSign} label="Avg. nightly rate" value={`$${avgPrice}`} delay={0.18} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent hotels */}
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink-900">Recent hotels</h2>
            <Link to="/admin/hotels" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-ink-100">
            {recent.map((h) => (
              <li key={h.id}>
                <Link to={`/admin/hotels/${h.id}`} className="group flex items-center gap-3 py-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                    <SmartImage src={h.images[0]} alt={h.name} fallbackSeed={h.id} wrapperClassName="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900 group-hover:text-brand-600">{h.name}</p>
                    <p className="truncate text-sm text-ink-500">
                      {h.city} · {h.type}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="font-semibold text-ink-900">${h.pricePerNight}</p>
                    <p className="text-xs text-ink-400">/ night</p>
                  </div>
                  <StatusBadge status={h.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* City distribution */}
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-xl text-ink-900">Hotels by city</h2>
          <ul className="mt-5 space-y-4">
            {cityRows.map(([city, n]) => (
              <li key={city}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-700">{city}</span>
                  <span className="text-ink-400">{n}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(n / maxCity) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
