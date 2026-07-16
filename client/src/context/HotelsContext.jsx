import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { HOTELS_SEED } from '../constants/hotels';

const STORAGE_KEY = 'ig_hotels_v1';
const HotelsContext = createContext(null);

function makeId() {
  return `h-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Front-end store for hotels. Seeds from constants and persists edits to
 * localStorage so admin changes survive a reload — no backend involved.
 */
export function HotelsProvider({ children }) {
  const [hotels, setHotels] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : HOTELS_SEED;
    } catch {
      return HOTELS_SEED;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
    } catch {
      /* storage unavailable — keep in-memory */
    }
  }, [hotels]);

  const addHotel = useCallback((data) => {
    const id = makeId();
    setHotels((prev) => [{ ...data, id }, ...prev]);
    return id;
  }, []);

  const updateHotel = useCallback((id, patch) => {
    setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }, []);

  const removeHotel = useCallback((id) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const getHotel = useCallback((id) => hotels.find((h) => h.id === id), [hotels]);

  const resetHotels = useCallback(() => setHotels(HOTELS_SEED), []);

  const value = useMemo(
    () => ({ hotels, addHotel, updateHotel, removeHotel, getHotel, resetHotels }),
    [hotels, addHotel, updateHotel, removeHotel, getHotel, resetHotels],
  );

  return <HotelsContext.Provider value={value}>{children}</HotelsContext.Provider>;
}

export function useHotels() {
  const ctx = useContext(HotelsContext);
  if (!ctx) throw new Error('useHotels must be used within <HotelsProvider>');
  return ctx;
}
