import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { HOTEL_CITIES, HOTEL_TYPES } from '../constants/hotels';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Stopgap admin auth — see server hotel.router requireAdmin. Real auth should
// replace this before production; a browser can't truly keep a secret.
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || '';

const HotelsContext = createContext(null);

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(ADMIN_SECRET ? { 'x-admin-secret': ADMIN_SECRET } : {}),
});

// Raw API hotel (sheet + Meta) -> the shape the admin UI edits. Fills in
// defaults for anything the sheet doesn't carry yet so form controls are safe.
function toAdmin(h) {
  return {
    id: h.id,
    name: h.name || '',
    type: h.type || HOTEL_TYPES[0],
    city: h.city || HOTEL_CITIES[0],
    address: h.address || '',
    tagline: h.tagline || '',
    description: h.description || '',
    stars: h.stars ?? 0,
    currency: h.currency || 'USD',
    pricePerNight: h.fromPrice ?? h.pricePerNight ?? 0,
    rating: h.rating ?? 0,
    reviews: h.reviews ?? 0,
    roomsCount: h.roomsCount ?? 0,
    rooms: Array.isArray(h.rooms) ? h.rooms : [], // rate table
    notes: Array.isArray(h.notes) ? h.notes : [],
    images: Array.isArray(h.images) ? h.images : [],
    amenities: Array.isArray(h.amenities) ? h.amenities : [],
    status: h.status || 'published',
    featured: !!h.featured,
    available: h.available !== false,
    checkIn: h.checkIn || '14:00',
    checkOut: h.checkOut || '12:00',
  };
}

// Admin hotel -> the payload the backend persists to the sheet. If there's no
// rate table but a nightly price is set, synthesize a single room so the site
// still shows a "from" price.
function toPayload(h) {
  const rooms =
    Array.isArray(h.rooms) && h.rooms.length
      ? h.rooms
      : Number(h.pricePerNight) > 0
        ? [
            {
              category: 'Standard Room',
              prices: { Rate: `${Number(h.pricePerNight)} ${h.currency || ''}`.trim() },
            },
          ]
        : [];

  return {
    name: h.name,
    type: h.type,
    city: h.city,
    address: h.address,
    tagline: h.tagline,
    description: h.description,
    stars: Number(h.stars) || 0,
    currency: h.currency,
    rating: Number(h.rating) || 0,
    reviews: Number(h.reviews) || 0,
    roomsCount: Number(h.roomsCount) || 0,
    images: h.images || [],
    amenities: h.amenities || [],
    status: h.status,
    featured: !!h.featured,
    available: h.available !== false,
    checkIn: h.checkIn,
    checkOut: h.checkOut,
    rooms,
    notes: h.notes || [],
  };
}

/**
 * Admin store for hotels, backed by the Google Sheet through the API.
 * Reads on mount, stays live via SSE, and every mutation writes back to the
 * sheet then re-reads — so the admin panel and the sheet never diverge.
 */
export function HotelsProvider({ children }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hotelsRef = useRef(hotels);
  hotelsRef.current = hotels;

  const load = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/hotels`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    const list = Array.isArray(json.data) ? json.data.map(toAdmin) : [];
    setHotels(list);
    setError(null);
    return list;
  }, []);

  useEffect(() => {
    let cancelled = false;
    load()
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));

    // Live: reflect owner sheet edits (and edits from other admins) instantly.
    const stream = new EventSource(`${API_URL}/api/hotels/stream`);
    const onChange = () => load().catch(() => {});
    stream.addEventListener('hotels', onChange);

    return () => {
      cancelled = true;
      stream.removeEventListener('hotels', onChange);
      stream.close();
    };
  }, [load]);

  const addHotel = useCallback(
    async (data) => {
      const res = await fetch(`${API_URL}/api/hotels`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(toPayload(data)),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Create failed');
      const { data: created } = await res.json();
      await load();
      return created?.id;
    },
    [load],
  );

  const updateHotel = useCallback(
    async (id, patch) => {
      // Callers may send a partial patch (e.g. { featured }); merge over the
      // current hotel so we never blank fields the caller didn't touch.
      const current = hotelsRef.current.find((h) => h.id === id) || {};
      const res = await fetch(`${API_URL}/api/hotels/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(toPayload({ ...current, ...patch })),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Update failed');
      await load();
    },
    [load],
  );

  const removeHotel = useCallback(
    async (id) => {
      const res = await fetch(`${API_URL}/api/hotels/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Delete failed');
      await load();
    },
    [load],
  );

  const getHotel = useCallback((id) => hotels.find((h) => h.id === id), [hotels]);

  // No demo seed to reset anymore — just re-pull from the sheet.
  const refresh = useCallback(() => load().catch(() => {}), [load]);

  const value = useMemo(
    () => ({
      hotels,
      loading,
      error,
      addHotel,
      updateHotel,
      removeHotel,
      getHotel,
      refresh,
      resetHotels: refresh, // back-compat: old callers used resetHotels
    }),
    [hotels, loading, error, addHotel, updateHotel, removeHotel, getHotel, refresh],
  );

  return <HotelsContext.Provider value={value}>{children}</HotelsContext.Provider>;
}

export function useHotels() {
  const ctx = useContext(HotelsContext);
  if (!ctx) throw new Error('useHotels must be used within <HotelsProvider>');
  return ctx;
}
