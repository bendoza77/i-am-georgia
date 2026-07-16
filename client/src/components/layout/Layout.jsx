import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import ScrollProgress from '../ui/ScrollProgress';
import BackToTop from '../ui/BackToTop';
import Cursor from '../ui/Cursor';
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
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <BackToTop />
    </>
  );
}
