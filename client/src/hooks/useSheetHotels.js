import { useEffect, useState } from 'react';
import { adaptHotel } from '../utils/adaptHotel';

// Base URL of the backend. Set VITE_API_URL in the client .env for production.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Loads the hotels from the Google Sheet and adapts them for the UI.
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
        if (!cancelled) setHotels(list);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { hotels, loading, error };
}
