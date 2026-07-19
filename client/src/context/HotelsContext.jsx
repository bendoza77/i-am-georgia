import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const HotelsContext = createContext(null);

const notImplemented = (action) => () => {
  throw new Error(`${action} is not wired to the API yet`);
};

/**
 * Admin store for hotels.
 *
 * The data layer was removed — the provider currently holds no hotels and the
 * mutations are stubs. Wire `load`, `addHotel`, `updateHotel` and `removeHotel`
 * to the backend to bring the admin panel back.
 *
 * Hotel shape the admin UI edits: see EMPTY_HOTEL in constants/hotels.js.
 */
export function HotelsProvider({ children }) {
  const [hotels, setHotels] = useState([]);
  const [loading] = useState(false);
  const [error] = useState(null);

  const getHotel = useCallback((id) => hotels.find((h) => h.id === id), [hotels]);
  const refresh = useCallback(() => {}, []);

  const value = useMemo(
    () => ({
      hotels,
      setHotels,
      loading,
      error,
      addHotel: notImplemented('addHotel'),
      updateHotel: notImplemented('updateHotel'),
      removeHotel: notImplemented('removeHotel'),
      getHotel,
      refresh,
      resetHotels: refresh, // back-compat: old callers used resetHotels
    }),
    [hotels, loading, error, getHotel, refresh],
  );

  return <HotelsContext.Provider value={value}>{children}</HotelsContext.Provider>;
}

export function useHotels() {
  const ctx = useContext(HotelsContext);
  if (!ctx) throw new Error('useHotels must be used within <HotelsProvider>');
  return ctx;
}
