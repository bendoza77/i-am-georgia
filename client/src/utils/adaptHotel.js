import { hotelImages } from './hotelImages';

/**
 * Converts a raw Google-Sheet hotel into the shape the UI expects.
 * Adds parsed star rating, a "from" price label, and images.
 *
 * Raw sheet hotel:
 *   { id, name, displayName, currency, fromPrice, rooms, notes }
 */
export function adaptHotel(h) {
  const starMatch = (h.displayName || '').match(/(\d)\s*\*/);
  const name = (h.displayName || h.name).replace(/\s*\d\s*\*.*$/, '').trim() || h.name;

  return {
    id: h.id,
    name,
    stars: starMatch ? Number(starMatch[1]) : 0,
    type: 'Hotel',
    city: 'Georgia',
    tagline: (h.notes && h.notes[0]) || `${h.rooms?.length || 0} room types available`,
    images: hotelImages(h.id, 5),
    amenities: [],
    rating: null,
    reviews: null,
    featured: false,
    available: true,
    status: 'published',
    currency: h.currency || '',
    pricePerNight: h.fromPrice ?? null,
    priceLabel: h.fromPrice ? `${h.fromPrice} ${h.currency || ''}`.trim() : 'On request',
    rooms: h.rooms || [],
    notes: h.notes || [],
  };
}
