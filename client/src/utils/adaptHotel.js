import { hotelImages } from './hotelImages';

const SYMBOLS = { USD: '$', EUR: '€', GEL: '₾', GBP: '£', RUB: '₽', TRY: '₺' };

/** `USD` -> `$`, unknown codes fall back to the code itself. */
export const currencySymbol = (code) => SYMBOLS[String(code || '').toUpperCase()] ?? code ?? '';

/** Format a number with the hotel's currency, e.g. `$120`. */
export function formatPrice(amount, currency) {
  if (amount == null || Number.isNaN(amount)) return '—';
  const sym = currencySymbol(currency);
  const n = Math.round(amount).toLocaleString('en-US');
  return sym.length === 1 ? `${sym}${n}` : `${n} ${sym}`;
}

// Occupancy is free text in the sheets ("Double", "2+1", "Adult + 2 Children"),
// so it gets normalised into four guest groups the filter can actually use.
// Checked in order — the first keyword that matches wins, so
// "Adult + 2 Children" is a family rather than a couple.
const GUEST_KEYWORDS = [
  [/\b(family|children|child|kids?)\b/, 'Families'],
  [/\b(quad|quadruple)\b/, 'Families'],
  [/\b(triple)\b/, 'Small groups'],
  [/\b(double|twin|couple)\b/, 'Couples'],
  [/\b(single|solo)\b/, 'Solo'],
];

/** Guest group for a head count, used when the text carries no keyword. */
const groupForCount = (n) => {
  if (n <= 0) return null;
  if (n === 1) return 'Solo';
  if (n === 2) return 'Couples';
  if (n === 3) return 'Small groups';
  return 'Families';
};

/** Map one raw occupancy string ("Double", "2+1", "Adult + 2 Children") to a guest group. */
function guestTagsFor(occupancy) {
  const s = String(occupancy || '').toLowerCase();
  const keyword = GUEST_KEYWORDS.find(([re]) => re.test(s));
  if (keyword) return [keyword[1]];

  // "2+1" means 2 guests plus one extra bed -> 3 heads.
  const total = (s.match(/\d+/g) || []).reduce((sum, d) => sum + Number(d), 0);
  const byCount = groupForCount(total);
  return byCount ? [byCount] : [];
}

/**
 * Column heading for an occupancy value. Sheets that use bare numbers
 * ("2", "2+1") get a "guests" suffix; worded values ("Double") are left alone.
 */
export function occupancyLabel(occupancy) {
  const s = String(occupancy || '').trim();
  if (!s) return 'Rate';
  return /^[\d\s+]+$/.test(s) ? `${s} guests` : s;
}

/**
 * Turn one season into a rate matrix: room types down the side, every
 * occupancy/meal-plan combination found in that season across the top.
 * Combinations a room doesn't offer stay empty so the table can show a dash.
 */
function rateTableFor(season, currency) {
  const columns = [];
  const rows = [];

  (season.roomTypes || []).forEach((rt) => {
    const cells = {};
    (rt.prices || []).forEach((p) => {
      const key = [p.occupancy, p.mealPlan].filter(Boolean).join(' · ') || 'Rate';
      if (!columns.some((c) => c.key === key)) {
        columns.push({
          key,
          label: occupancyLabel(p.occupancy),
          occupancy: p.occupancy,
          mealPlan: p.mealPlan,
        });
      }
      cells[key] = p.price;
    });

    const roomPrices = Object.values(cells).filter((v) => typeof v === 'number');
    rows.push({
      roomType: rt.roomType || 'Room',
      cells,
      from: roomPrices.length ? Math.min(...roomPrices) : null,
    });
  });

  return { label: season.periodLabel || 'Season rates', columns, rows, currency };
}

/** Push a value into an array only if it's truthy and not already there. */
const pushUnique = (arr, value) => {
  if (value && !arr.includes(value)) arr.push(value);
};

/**
 * Turn a hotel document from `/api/hotel/all` into the flat shape the UI
 * renders. The database stores prices nested three levels deep
 * (season -> room type -> occupancy/meal-plan rows), so everything the cards
 * and filters need — price range, room types, meal plans — is derived here
 * once instead of inside render.
 *
 * @param {object} doc raw Mongo document
 * @returns {object} view model
 */
export function adaptHotel(doc) {
  const id = String(doc._id ?? doc.id ?? doc.sheetGid);
  const seasons = Array.isArray(doc.seasons) ? doc.seasons : [];

  const prices = [];
  const roomTypes = [];
  const mealPlans = [];
  const occupancies = [];
  const guestTags = [];

  seasons.forEach((season) => {
    (season.roomTypes || []).forEach((rt) => {
      pushUnique(roomTypes, rt.roomType);
      (rt.prices || []).forEach((p) => {
        pushUnique(mealPlans, p.mealPlan);
        pushUnique(occupancies, p.occupancy);
        guestTagsFor(p.occupancy).forEach((t) => pushUnique(guestTags, t));
        if (typeof p.price === 'number' && p.price > 0) prices.push(p.price);
      });
    });
  });

  const priceFrom = prices.length ? Math.min(...prices) : null;
  const priceTo = prices.length ? Math.max(...prices) : null;

  return {
    id,
    name: doc.hotelName || doc.sheetName || 'Unnamed hotel',
    sheetName: doc.sheetName,
    year: doc.year ?? null,
    currency: doc.currency || 'USD',

    // The sheet import carries no photos, so every hotel gets a stable set
    // picked from the shared pool by id.
    images: hotelImages(id, 5, { w: 1400 }),

    seasons,
    seasonCount: seasons.length,
    // One rate matrix per season, ready for the detail page's table.
    rateTables: seasons.map((s) => rateTableFor(s, doc.currency || 'USD')),
    periods: seasons.map((s) => s.periodLabel).filter(Boolean),
    roomTypes,
    mealPlans,
    occupancies,
    guestTags,

    // Most sheets leave meal_plan empty and put the board in a free-text note,
    // so fall back to the first note before giving up.
    boardLabel: mealPlans.join(' · ') || (doc.mealPlanNotes || [])[0] || 'On request',

    priceFrom,
    priceTo,
    priceLabel: priceFrom == null ? 'On request' : formatPrice(priceFrom, doc.currency),

    mealPlanNotes: doc.mealPlanNotes || [],
    childrenPolicy: doc.childrenPolicy || [],
    extraCharges: doc.extraCharges || [],
    rawNotes: doc.rawNotes || [],

    updatedAt: doc.updatedAt || null,
  };
}

export const adaptHotels = (docs = []) => docs.map(adaptHotel);
