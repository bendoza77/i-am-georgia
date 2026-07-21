/**
 * Booking engine helpers — calendar maths, season parsing and quoting.
 *
 * The rate sheets carry no machine-readable dates: a season is a free-text
 * `periodLabel` ("01.05 - 30.09", "15 Dec – 15 Mar 2025", "May 1 to Sep 30").
 * Everything here is defensive about that: a label we cannot parse simply
 * yields `null` and the booking flow falls back to letting the guest pick the
 * season by hand instead of by date.
 */

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

export const MONTH_LABELS = MONTHS.map((m) => m[0].toUpperCase() + m.slice(1));
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ------------------------------------------------------------------ dates */

/** Midnight-normalised copy — every comparison in the calendar is day-level. */
export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const today = () => startOfDay(new Date());

export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

export const isSameDay = (a, b) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const isBefore = (a, b) => a.getTime() < b.getTime();

/** Whole nights between two days (the billable unit for a hotel stay). */
export const nightsBetween = (from, to) =>
  !from || !to ? 0 : Math.max(0, Math.round((startOfDay(to) - startOfDay(from)) / 86400000));

/** `2026-07-21` — stable, locale-free, used as a React key and in payloads. */
export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** `Tue, 21 Jul 2026` */
export const formatDate = (d, opts) =>
  d
    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...opts })
    : '—';

/** `21 Jul` — for tight spots like the summary strip. */
export const formatDateShort = (d) => (d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—');

/**
 * One month laid out as a Monday-first 6x7 grid. Leading/trailing slots are
 * `null` rather than neighbouring-month days: the picker greys nothing out and
 * an empty cell reads more clearly than a disabled one.
 */
export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // getDay() is Sunday-first; shift so Monday === 0.
  const lead = (first.getDay() + 6) % 7;

  const cells = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ---------------------------------------------------------------- seasons */

/*
 * Season labels are typed by hotels into a spreadsheet, so the real corpus is
 * wild. Everything below is written against actual labels from the sheet:
 *
 *   01/05/26-31/10/26                      one window
 *   01/04/26-30/04/26 -16/10/26-28/12/26   two windows in one season
 *   10-13/06/26; 13-17/07/26               day ranges inside a month
 *   04/01/25-30/04/26, 01/11/26-27/12/26   comma-separated windows
 *   May/June/July/Aug/Sept/Oct 2026        a list of whole months
 *   March-August 2026                      a range of whole months
 *   September-December 19th 2026           month range with a closing day
 *   NY 20 Dec-5 Jan                        wraps into the next year
 *   General · All Seasons 2025/2026        unparseable → picked by hand
 *
 * A season is therefore a *set* of windows, and anything we cannot read
 * returns null so the UI falls back to letting the guest choose the period.
 */

const MONTH_WORD = '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?';

/** Words that decorate a label without carrying dates. */
const NOISE = /\b(ny|new year|pesach|general|all seasons?|season|high|low|mid|rates?)\b/g;

const normaliseYear = (y) => {
  if (y == null || y === '') return null;
  const n = Number(y);
  if (Number.isNaN(n)) return null;
  return n < 100 ? 2000 + n : n;
};

const lastDayOf = (year, month) => new Date(year, month + 1, 0).getDate();

/** Build a window, rolling the end into the next year when it wraps. */
function windowOf(start, end) {
  if (!start || !end) return null;
  const wraps = end < start;
  const closed = wraps ? new Date(end.getFullYear() + 1, end.getMonth(), end.getDate()) : end;
  return { start, end: closed, wraps };
}

/** Pair a flat list of dates into windows: [0,1], [2,3], … */
function pairIntoWindows(dates) {
  const windows = [];
  for (let i = 0; i + 1 < dates.length; i += 2) {
    const w = windowOf(dates[i], dates[i + 1]);
    if (w) windows.push(w);
  }
  return windows;
}

/**
 * Windows from a numeric chunk. Dates are day-first (`16/10/26` = 16 October),
 * which is how the sheets are written.
 */
function numericWindows(chunk, year) {
  const dates = [...chunk.matchAll(/(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?/g)]
    .map((m) => ({ day: +m[1], month: +m[2] - 1, year: normaliseYear(m[3]) ?? year }))
    .filter((d) => d.month >= 0 && d.month <= 11 && d.day >= 1 && d.day <= 31)
    .map((d) => new Date(d.year, d.month, d.day));

  if (dates.length >= 2) return pairIntoWindows(dates);

  // "10-13/06/26" — two days sharing one month/year. Only tried when the chunk
  // holds a single full date, otherwise the tail of one date and the head of
  // the next ("…/26-30/04/26") reads as a day range.
  const dayRange = chunk.match(/(\d{1,2})\s*-\s*(\d{1,2})[./](\d{1,2})[./](\d{2,4})/);
  if (dayRange) {
    const m = +dayRange[3] - 1;
    const y = normaliseYear(dayRange[4]) ?? year;
    const w = windowOf(new Date(y, m, +dayRange[1]), new Date(y, m, +dayRange[2]));
    return w ? [w] : [];
  }

  return [];
}

/**
 * Windows from a worded chunk. `-`/`to` between months means one span
 * ("March-August"); `/` or `+` means a list of separate months
 * ("May/June/July"), which is how these sheets encode "same rate, these months".
 */
function wordedWindows(chunk, year) {
  const re = new RegExp(
    // optional leading day, month word, optional trailing day, optional year
    `(?:(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s+)?\\b${MONTH_WORD}(?:\\s+(\\d{1,2})(?!\\d)\\s*(?:st|nd|rd|th)?)?(?:\\s*,?\\s*(\\d{4}))?`,
    'g',
  );

  const tokens = [];
  for (const m of chunk.matchAll(re)) {
    const month = MONTHS.findIndex((name) => name.startsWith(m[2]));
    if (month < 0) continue;
    tokens.push({
      month,
      day: m[1] ? +m[1] : m[3] ? +m[3] : null,
      year: normaliseYear(m[4]),
      at: m.index,
      end: m.index + m[0].length,
    });
  }
  if (!tokens.length) return [];

  const y = tokens.find((t) => t.year)?.year ?? year;

  // Is any gap between two month tokens a range separator?
  const spans = tokens.some((t, i) => {
    if (i === 0) return false;
    const gap = chunk.slice(tokens[i - 1].end, t.at);
    return /-|\bto\b|\btill\b|\buntil\b/.test(gap);
  });

  if (spans && tokens.length > 1) {
    const a = tokens[0];
    const b = tokens[tokens.length - 1];
    const w = windowOf(
      new Date(a.year ?? y, a.month, a.day ?? 1),
      new Date(b.year ?? y, b.month, b.day ?? lastDayOf(b.year ?? y, b.month)),
    );
    return w ? [w] : [];
  }

  // A list: every named month, in full.
  return tokens
    .map((t) =>
      windowOf(
        new Date(t.year ?? y, t.month, t.day ?? 1),
        new Date(t.year ?? y, t.month, t.day ?? lastDayOf(t.year ?? y, t.month)),
      ),
    )
    .filter(Boolean);
}

/**
 * Read a season's date windows out of its free-text label.
 *
 * @param {string} label e.g. `01/05/26-31/10/26`
 * @param {number} [fallbackYear] the sheet's year, used when the label omits one
 * @returns {{windows: Array<{start: Date, end: Date, wraps: boolean}>, start: Date, end: Date}|null}
 */
export function parseSeasonRange(label, fallbackYear) {
  const text = String(label || '')
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(NOISE, ' ')
    .trim();
  if (!text) return null;

  const year = normaliseYear(fallbackYear) ?? new Date().getFullYear();

  const windows = text
    .split(/[,;]/)
    .flatMap((chunk) => (/\d{1,2}[./]\d{1,2}/.test(chunk) ? numericWindows(chunk, year) : wordedWindows(chunk, year)));

  if (!windows.length) return null;
  return { windows, start: windows[0].start, end: windows[windows.length - 1].end };
}

/**
 * Does `date` fall in any of this season's windows? Seasons repeat every year,
 * so each window is projected onto the date's own year rather than compared
 * literally — a 2026 sheet still prices a 2028 stay.
 */
export function seasonCovers(range, date) {
  if (!range?.windows?.length) return false;

  return range.windows.some((w) => {
    const y = date.getFullYear();
    const start = new Date(y, w.start.getMonth(), w.start.getDate());
    const end = new Date(y, w.end.getMonth(), w.end.getDate());

    // Wrapping window ("20 Dec – 5 Jan"): inside means after the start OR
    // before the end, since the two halves sit in different calendar years.
    if (end < start) return date >= start || date <= end;
    return date >= start && date <= end;
  });
}

/**
 * Attach a parsed window to every rate table, once per hotel.
 * @returns {Array<{table: object, range: object|null, index: number}>}
 */
export const seasonsWithRanges = (hotel) =>
  (hotel?.rateTables || []).map((table, index) => ({
    table,
    index,
    range: parseSeasonRange(table.label, hotel?.year),
  }));

/** Length in days of the narrowest window in a season — used to break ties. */
function narrowestWindow(range) {
  if (!range?.windows?.length) return Infinity;
  return Math.min(...range.windows.map((w) => (w.end - w.start) / 86400000));
}

/**
 * Index of the season covering `date`, or -1.
 *
 * Seasons overlap in practice — a hotel publishes a year-long base period and
 * then a ten-day holiday period on top of it. The tighter window is the special
 * rate, so the narrowest match wins.
 */
export function seasonIndexForDate(seasons, date) {
  if (!date) return -1;

  let best = -1;
  let bestSpan = Infinity;
  seasons.forEach((s, i) => {
    if (!seasonCovers(s.range, date)) return;
    const span = narrowestWindow(s.range);
    if (span < bestSpan) {
      best = i;
      bestSpan = span;
    }
  });
  return best;
}

/** The season object covering `date`, or null. */
export function seasonForDate(seasons, date) {
  const i = seasonIndexForDate(seasons, date);
  return i < 0 ? null : seasons[i];
}

/* --------------------------------------------------------------- quoting */

/** Stable identity for a rate column: `Double · BB`. */
export const optionKey = (col) => col.key;

/** Every priced option a room type offers inside one season. */
export function optionsForRoom(table, roomType) {
  const row = (table?.rows || []).find((r) => r.roomType === roomType);
  if (!row) return [];
  return (table.columns || [])
    .filter((col) => typeof row.cells[col.key] === 'number')
    .map((col) => ({ ...col, price: row.cells[col.key] }));
}

/** Look up one night's price, falling back to the room's cheapest rate. */
function priceIn(table, roomType, key) {
  const row = (table?.rows || []).find((r) => r.roomType === roomType);
  if (!row) return null;
  const exact = row.cells[key];
  return typeof exact === 'number' ? exact : row.from;
}

/**
 * Price a stay night by night. A range that crosses a season boundary is
 * charged at each night's own season — the whole reason this is per-night and
 * not `nights × rate`.
 *
 * @returns {{nights: Array, total: number, nightCount: number, segments: Array}}
 */
export function nightlyBreakdown({ seasons, from, to, roomType, rateKey, anchorIndex = 0, pinned = false }) {
  const count = nightsBetween(from, to);
  if (!from || !count || !roomType) return { nights: [], total: 0, nightCount: 0, segments: [] };

  const fallback = seasons[anchorIndex] ?? seasons[0];
  const nights = [];

  for (let i = 0; i < count; i += 1) {
    const date = addDays(from, i);
    // `pinned` means the guest chose the period themselves — then every night
    // is priced from that table, even if the dates match another season.
    const season = (pinned ? fallback : seasonForDate(seasons, date)) ?? fallback;
    const price = season ? priceIn(season.table, roomType, rateKey) : null;
    nights.push({
      date,
      price: typeof price === 'number' ? price : 0,
      seasonLabel: season?.table.label ?? '',
      estimated: !season || typeof price !== 'number',
    });
  }

  // Collapse consecutive nights of the same season into billing lines.
  const segments = [];
  nights.forEach((n) => {
    const last = segments[segments.length - 1];
    if (last && last.seasonLabel === n.seasonLabel && last.price === n.price) {
      last.nights += 1;
      last.subtotal += n.price;
    } else {
      segments.push({ seasonLabel: n.seasonLabel, price: n.price, nights: 1, subtotal: n.price, estimated: n.estimated });
    }
  });

  return {
    nights,
    segments,
    nightCount: count,
    total: nights.reduce((sum, n) => sum + n.price, 0),
  };
}

/** Human summary of the guest mix: `2 adults · 1 child`. */
export function guestLabel({ adults = 2, children = 0, rooms = 1 }) {
  const parts = [`${adults} adult${adults === 1 ? '' : 's'}`];
  if (children) parts.push(`${children} child${children === 1 ? '' : 'ren'}`);
  if (rooms > 1) parts.push(`${rooms} rooms`);
  return parts.join(' · ');
}

/**
 * Booking reference shown on the confirmation screen. Deterministic prefix +
 * time-based tail so a guest can quote it back to the team.
 */
export const bookingReference = (hotelId = '') => {
  const tail = Date.now().toString(36).slice(-4).toUpperCase();
  const head = String(hotelId).replace(/\W/g, '').slice(-3).toUpperCase().padStart(3, 'G');
  return `IG-${head}-${tail}`;
};
