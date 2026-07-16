import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AppRoutes from './routes/AppRoutes';
import { useLenis } from './hooks/useLenis';
import Loader from './components/ui/Loader';
import { HotelsProvider } from './context/HotelsContext';

export default function App() {
  useLenis();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <HotelsProvider>
      <BrowserRouter>
        <AnimatePresence>{loading && <Loader key="loader" />}</AnimatePresence>
        <AppRoutes />
      </BrowserRouter>
    </HotelsProvider>
  );
}
