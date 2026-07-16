import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import ScrollProgress from '../ui/ScrollProgress';
import BackToTop from '../ui/BackToTop';
import Cursor from '../ui/Cursor';
import ConciergeWidget from '../ai/ConciergeWidget';
import RouteErrorBoundary from './RouteErrorBoundary';
import { pageTransition } from '../../animations/variants';

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
        {/* Suspense must sit ABOVE AnimatePresence: with a lazy route, keeping it
            inside a mode="wait" transition lets the entering page suspend while
            the old one is still exiting — they deadlock and render blank (only
            visible under network latency, e.g. on Vercel). Resolving the chunk
            first, then animating, avoids that. */}
        <RouteErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<PageFallback />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </RouteErrorBoundary>
      </main>

      <Footer />
      <BackToTop />
      <ConciergeWidget />
    </>
  );
}
