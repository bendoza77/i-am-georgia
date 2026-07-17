import { useEffect, useState } from 'react';
import { adaptHotel } from '../utils/adaptHotel';

// Base URL of the backend. Set VITE_API_URL in the client .env for production.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Loads the hotels from the Google Sheet and adapts them for the UI.
 *
 * Keeps itself live: it opens a Server-Sent Events stream to the backend and
 * re-fetches whenever the data changes (owner edits the sheet or admin saves),
 * so an open tab updates within seconds — no manual reload.
 *
 * Each returned hotel has: id, name, stars, images, priceLabel, pricePerNight,
 * currency, rooms [{ category, prices }], notes [].
 *
 * Usage:
 *   const { hotels, loading, error } = useSheetHotels();
 */
export function useSheetHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/hotels`);
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data.map(adaptHotel) : [];
        if (!cancelled) {
          setHotels(list);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // Live updates: the browser's EventSource auto-reconnects using the
    // server's `retry` hint. On each "hotels" event we simply re-fetch.
    const stream = new EventSource(`${API_URL}/api/hotels/stream`);
    stream.addEventListener('hotels', load);

    return () => {
      cancelled = true;
      stream.removeEventListener('hotels', load);
      stream.close();
    };
  }, []);

  return { hotels, loading, error };
}
