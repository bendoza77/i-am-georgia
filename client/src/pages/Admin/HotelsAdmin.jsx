import { useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Star, MapPin, Search, BedDouble } from 'lucide-react';
import { useHotels } from '../../context/HotelsContext';
import { HOTEL_CITIES } from '../../constants/hotels';
import { StatusBadge, Toggle } from '../../components/admin/ui';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { useToast } from '../../components/admin/ToastProvider';
import SmartImage from '../../components/ui/SmartImage';
import { cn } from '../../utils/cn';

const STATUS_FILTERS = ['all', 'published', 'draft', 'archived'];

export default function HotelsAdmin() {
  const { hotels, updateHotel, removeHotel } = useHotels();
  const { search, setSearch } = useOutletContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [status, setStatus] = useState('all');
  const [city, setCity] = useState('all');
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    return hotels.filter((h) => {
      const matchStatus = status === 'all' || h.status === status;
      const matchCity = city === 'all' || h.city === city;
      const matchQuery = !q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q);
      return matchStatus && matchCity && matchQuery;
    });
  }, [hotels, search, status, city]);

  const confirmDelete = () => {
    const name = toDelete?.name;
    removeHotel(toDelete.id);
    setToDelete(null);
    toast(`“${name}” deleted`, 'success');
  };

  const toggleFeatured = (h) => {
    updateHotel(h.id, { featured: !h.featured });
    toast(h.featured ? 'Removed from featured' : 'Marked as featured', 'info');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink-900">Hotels</h1>
          <p className="mt-1 text-ink-500">
            {hotels.length} {hotels.length === 1 ? 'property' : 'properties'} · manage everything about each stay.
          </p>
        </div>
        <Link
          to="/admin/hotels/new"
          className="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus size={18} /> Add hotel
        </Link>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-[var(--shadow-soft)] lg:flex-row lg:items-center">
        <div className="relative flex-1 sm:hidden">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hotels…"
            className="h-10 w-full rounded-lg border border-ink-200 bg-sand-50 pl-9 pr-3 text-sm outline-none focus:border-brand-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors',
                status === s ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-50',
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="ml-auto h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-700 outline-none focus:border-brand-400"
          aria-label="Filter by city"
        >
          <option value="all">All cities</option>
          {HOTEL_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
            <BedDouble size={28} />
          </span>
          <p className="mt-4 font-display text-xl text-ink-900">No hotels found</p>
          <p className="mt-1 text-ink-500">Try a different filter, or add your first property.</p>
          <Link
            to="/admin/hotels/new"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <Plus size={17} /> Add hotel
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[var(--shadow-soft)] md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3.5">Hotel</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Rating</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Featured</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                <AnimatePresence>
                  {filtered.map((h) => (
                    <motion.tr
                      key={h.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, backgroundColor: 'rgba(239,68,68,0.06)' }}
                      className="group transition-colors hover:bg-sand-50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                            <SmartImage src={h.images[0]} alt={h.name} fallbackSeed={h.id} wrapperClassName="h-full w-full" />
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => navigate(`/admin/hotels/${h.id}`)}
                              className="block truncate text-left font-semibold text-ink-900 hover:text-brand-600"
                            >
                              {h.name}
                            </button>
                            <span className="flex items-center gap-1 text-sm text-ink-400">
                              <MapPin size={12} /> {h.city}
                              {!h.available && (
                                <span className="ml-1 rounded bg-red-500/10 px-1.5 text-xs font-medium text-red-600">
                                  Unavailable
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600">{h.type}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-ink-900">${h.pricePerNight}</span>
                        <span className="text-xs text-ink-400"> /night</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-sm text-ink-700">
                          <Star size={14} className="fill-gold-500 text-gold-500" />
                          {h.rating}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={h.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Toggle checked={h.featured} onChange={() => toggleFeatured(h)} label="Featured" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/hotels/${h.id}`}
                            className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-brand-500/10 hover:text-brand-600"
                            aria-label={`Edit ${h.name}`}
                          >
                            <Pencil size={17} />
                          </Link>
                          <button
                            onClick={() => setToDelete(h)}
                            className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-red-500/10 hover:text-red-600"
                            aria-label={`Delete ${h.name}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 grid gap-4 md:hidden">
            {filtered.map((h) => (
              <div key={h.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
                <div className="relative aspect-[16/9]">
                  <SmartImage src={h.images[0]} alt={h.name} fallbackSeed={h.id} wrapperClassName="h-full w-full" />
                  <div className="absolute left-3 top-3">
                    <StatusBadge status={h.status} />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink-900">{h.name}</p>
                      <p className="flex items-center gap-1 text-sm text-ink-400">
                        <MapPin size={12} /> {h.city} · {h.type}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-ink-900">${h.pricePerNight}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                    <label className="flex items-center gap-2 text-sm text-ink-600">
                      <Toggle checked={h.featured} onChange={() => toggleFeatured(h)} label="Featured" /> Featured
                    </label>
                    <div className="flex gap-1">
                      <Link
                        to={`/admin/hotels/${h.id}`}
                        className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-brand-500/10 hover:text-brand-600"
                        aria-label="Edit"
                      >
                        <Pencil size={17} />
                      </Link>
                      <button
                        onClick={() => setToDelete(h)}
                        className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-red-500/10 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this hotel?"
        message={`“${toDelete?.name}” will be permanently removed. This can’t be undone.`}
        confirmLabel="Delete hotel"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
