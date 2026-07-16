import { Menu, Search, Bell, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Sticky admin top bar: mobile menu trigger, global search, quick add.
 */
export default function AdminTopbar({ onMenu, search, onSearch }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenu}
        className="grid h-10 w-10 place-items-center rounded-xl text-ink-700 hover:bg-ink-50 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={search ?? ''}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder="Search hotels…"
          aria-label="Search hotels"
          className="h-10 w-full rounded-xl border border-ink-200 bg-sand-50 pl-10 pr-4 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:bg-white"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-600 hover:bg-ink-50"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>
        <button
          onClick={() => navigate('/admin/hotels/new')}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add hotel</span>
        </button>
      </div>
    </header>
  );
}
