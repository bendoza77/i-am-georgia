import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import { ToastProvider } from '../../components/admin/ToastProvider';

function AdminFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
    </div>
  );
}

/**
 * Admin shell — dark sidebar + sticky topbar + content outlet.
 * Search state is shared with pages through the router Outlet context.
 */
export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <ToastProvider>
      <div className="min-h-screen bg-sand-100 text-ink-900">
        <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="lg:pl-64">
          <AdminTopbar onMenu={() => setMobileOpen(true)} search={search} onSearch={setSearch} />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            <Suspense fallback={<AdminFallback />}>
              <Outlet context={{ search, setSearch }} />
            </Suspense>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
