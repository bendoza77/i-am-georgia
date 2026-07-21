import { adaptHotels, formatPrice } from '../utils/adaptHotel';

/**
 * The concierge's hotel knowledge.
 *
 * Site structure is hand-authored in `siteKnowledge.js`, but hotels are live
 * data from the sheet import — so they are loaded once per session, condensed
 * into a catalogue the model can read in its system prompt, and searchable
 * through a tool for anything more specific than "what have you got".
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Fields the model actually needs. Everything else is noise in a prompt. */
const condense = (h) => ({
  id: h.id,
  name: h.name,
  currency: h.currency,
  priceFrom: h.priceFrom,
  priceTo: h.priceTo,
  priceLabel: h.priceLabel,
  roomTypes: h.roomTypes,
  board: h.boardLabel,
  guestTags: h.guestTags,
  periods: h.periods,
  path: hotelPath(h.id),
});

/** Route to a hotel's page, or straight into its booking flow. */
export const hotelPath = (id, { book = false } = {}) =>
  `/hotels/${id}${book ? '/book' : ''}`;

let pending = null;

/**
 * Load and cache the hotel catalogue. Shared across every concierge message,
 * and a failed load is not cached — the next question retries instead of
 * leaving Nino permanently blind to hotels.
 */
export function loadHotelDirectory() {
  if (!pending) {
    pending = fetch(`${API_URL}/api/hotel/all?limit=200`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((res) => adaptHotels(res.data?.hotels ?? []).map(condense))
      .catch((err) => {
        console.warn('Concierge: could not load hotels —', err.message);
        pending = null;
        return [];
      });
  }
  return pending;
}

/**
 * One catalogue line. Deliberately just name, id and the "from" price: the
 * catalogue rides in every single request, so anything richer (rooms, board,
 * seasons) is left to `findHotels`, which is only paid for when it is asked
 * for. Free-tier Groq caps tokens per minute — a fat system prompt costs the
 * visitor a rate-limit error two messages in.
 */
const catalogueLine = (h) =>
  `- ${h.name} [${h.id}] ${h.priceFrom == null ? 'price on request' : `from ${formatPrice(h.priceFrom, h.currency)}`}`;

/**
 * The catalogue block embedded in the system prompt: every hotel we sell, so
 * Nino can recognise a name and answer "what's cheapest" without a tool call,
 * and knows the id to open it with.
 */
export function hotelCatalogue(hotels = []) {
  if (!hotels.length) {
    return 'Hotel data could not be loaded right now. Send the visitor to the /hotels page and offer the phone number instead of guessing.';
  }
  return hotels.map(catalogueLine).join('\n');
}

/* --------------------------------------------------------------- search */

const norm = (s) => String(s || '').toLowerCase();

/** Loose token score: how much of `query` shows up in this hotel's text. */
function score(hotel, query) {
  const q = norm(query).trim();
  if (!q) return 1;

  const name = norm(hotel.name);
  if (name === q) return 100;
  if (name.includes(q)) return 60;

  const haystack = [hotel.name, hotel.roomTypes.join(' '), hotel.board, hotel.guestTags.join(' ')]
    .map(norm)
    .join(' ');

  // Ignore one/two-letter noise so "a hotel in tbilisi" doesn't match on "a".
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  if (!tokens.length) return 0;

  const hits = tokens.filter((t) => haystack.includes(t)).length;
  const nameHits = tokens.filter((t) => name.includes(t)).length;
  return hits === 0 ? 0 : hits * 4 + nameHits * 8;
}

/**
 * Find hotels matching a free-text query and/or a nightly budget.
 *
 * @returns {Array} condensed hotels, best match first
 */
export function searchHotels(hotels = [], { query = '', maxPrice, minPrice, limit = 5 } = {}) {
  const budgeted = hotels.filter((h) => {
    if (maxPrice != null && (h.priceFrom == null || h.priceFrom > maxPrice)) return false;
    if (minPrice != null && (h.priceFrom == null || h.priceFrom < minPrice)) return false;
    return true;
  });

  // No query means "anything in budget" — cheapest first is the useful order.
  if (!String(query).trim()) {
    return [...budgeted]
      .sort((a, b) => (a.priceFrom ?? Infinity) - (b.priceFrom ?? Infinity))
      .slice(0, limit);
  }

  return budgeted
    .map((h) => ({ h, s: score(h, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || (a.h.priceFrom ?? Infinity) - (b.h.priceFrom ?? Infinity))
    .slice(0, limit)
    .map((x) => x.h);
}

/** Resolve a hotel by id, or by an exact-ish name when the model guesses one. */
export function resolveHotel(hotels = [], idOrName = '') {
  const needle = String(idOrName).trim();
  if (!needle) return null;

  const byId = hotels.find((h) => h.id === needle);
  if (byId) return byId;

  return searchHotels(hotels, { query: needle, limit: 1 })[0] ?? null;
}
