import { useCallback, useEffect, useState } from 'react';
import { adaptHotel, adaptHotels } from '../utils/adaptHotel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Loads every published hotel from the API and returns it in the UI shape.
 *
 * The endpoint paginates (10 per page by default) but the collection is small
 * and the page filters/sorts across the whole set, so we ask for one large
 * page and paginate on the client.
 */
export function useHotelsApi({ limit = 200 } = {}) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const req = await fetch(`${API_URL}/api/hotel/all?limit=${limit}`, {
          signal: controller.signal,
        });
        const res = await req.json();

        if (!req.ok) throw new Error(res.message || "Can't get hotels");

        setHotels(adaptHotels(res.data?.hotels ?? []));
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Network error');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [limit, reloadKey]);

  return { hotels, loading, error, refresh };
}

/** Loads a single hotel by id and returns it in the UI shape. */
export function useHotelApi(id) {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!id) return undefined;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const req = await fetch(`${API_URL}/api/hotel/${id}`, { signal: controller.signal });
        const res = await req.json();

        if (!req.ok) throw new Error(res.message || "Can't get this hotel");

        setHotel(adaptHotel(res.data?.hotel ?? res.data ?? res));
      } catch (err) {
        if (err.name === 'AbortError') return;
        setHotel(null);
        setError(err.message || 'Network error');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id, reloadKey]);

  return { hotel, loading, error, refresh };
}
