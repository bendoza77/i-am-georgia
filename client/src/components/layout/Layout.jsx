import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import ScrollProgress from '../ui/ScrollProgress';
import BackToTop from '../ui/BackToTop';
import Cursor from '../ui/Cursor';
import ConciergeWidget from '../ai/ConciergeWidget';
import RouteErrorBoundary from './RouteErrorBoundary';

function PageFallback() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
    </div>
  );
}

export default function Layout() {
  const location = useLocation();

  return (
    <>
      <Cursor />
      <ScrollProgress />
      <ScrollToTop />
      <Navbar />

      <main id="main">
        <RouteErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<PageFallback />}>
            {/* CSS-only page fade. Unlike a JS transition, it can never leave the
                page stuck invisible — the animation always ends at opacity:1
                (fill-mode: both). Keyed by path so it re-runs on each route. */}
            <div key={location.pathname} className="page-enter">
              <Outlet />
            </div>
          </Suspense>
        </RouteErrorBoundary>
      </main>

      <Footer />
      <BackToTop />
      <ConciergeWidget />
    </>
  );
}
