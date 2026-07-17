// Central store for hotel data.
//
// One place owns: the cached list, how it's (re)built from Google, and the
// set of open SSE clients that want to be told the moment it changes.
//
// Flow:
//   - getHotels()      -> cached list, refreshing in the background if stale
//   - refresh()        -> force a rebuild from the sheet, then notify clients
//   - subscribe(res)   -> register an SSE response to receive live updates
//
// Both the /refresh webhook (owner edits) and our own write routes (admin
// edits) call refresh(), so every change funnels through the same notify path.

const { getHotelSheets, getMeta } = require("./googleSheets.service");
const parseHotels = require("../utils/parseHotels.util");

const CACHE_MS = 5 * 60 * 1000; // treat data older than this as stale

let cache = null; // last list of hotels we built
let cacheTime = 0; // when we built it (ms)
let inflight = null; // a rebuild already running, so we don't stampede Google

const clients = new Set(); // open SSE responses

// Build the list fresh from the sheet. Kept as a single shared promise so
// concurrent callers wait on one Google read instead of firing many.
const rebuild = () => {
    if (inflight) return inflight;

    inflight = (async () => {
        // Pricing tabs + the Meta index are independent reads — fetch together.
        const [sheets, meta] = await Promise.all([getHotelSheets(), getMeta()]);
        const parsed = parseHotels(sheets);

        // Overlay each hotel's Meta row (city, amenities, images…) onto its
        // parsed pricing data. Parsed price fields win where both have them.
        const hotels = parsed.map((h) => {
            const m = meta[h.id];
            if (!m) return { ...h, title: h.name };
            return {
                ...m,
                ...h,
                title: h.name, // the pricing tab's title, for later writes
                currency: h.currency || m.currency || "",
                fromPrice: h.fromPrice ?? null,
            };
        });

        // Meta-only hotels (a draft with no pricing tab yet) still show up.
        const seen = new Set(parsed.map((h) => h.id));
        Object.values(meta).forEach((m) => {
            if (m.id && !seen.has(m.id)) {
                hotels.push({ ...m, title: m.name, rooms: [], notes: [], fromPrice: null });
            }
        });

        cache = hotels;
        cacheTime = Date.now();
        return hotels;
    })();

    // Clear the inflight marker once it settles (success or failure).
    inflight.finally(() => {
        inflight = null;
    });

    return inflight;
};

const isStale = () => !cache || Date.now() - cacheTime >= CACHE_MS;

// Return the cached list. If it's stale, kick off a background rebuild but
// still serve what we have so the request stays fast. First-ever call (no
// cache yet) waits for the build.
const getHotels = async () => {
    if (!cache) return rebuild();
    if (isStale()) rebuild().then(notify).catch(() => {});
    return cache;
};

// Force a rebuild now and tell every open client the data changed.
const refresh = async () => {
    const hotels = await rebuild();
    notify();
    return hotels;
};

// Push a small "changed" event to every subscribed SSE client. We send only a
// signal (+ a fingerprint) — the client re-fetches /api/hotels to get the list.
const notify = () => {
    const payload = JSON.stringify({ updatedAt: cacheTime, count: cache?.length ?? 0 });
    for (const res of clients) {
        try {
            res.write(`event: hotels\ndata: ${payload}\n\n`);
        } catch {
            clients.delete(res);
        }
    }
};

const subscribe = (res) => {
    clients.add(res);
    return () => clients.delete(res);
};

const clientCount = () => clients.size;

module.exports = { getHotels, refresh, subscribe, notify, clientCount };
