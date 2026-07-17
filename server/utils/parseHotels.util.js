// Turns each hotel tab (a room-rate table) into a clean hotel object.
//
// A tab looks roughly like this:
//
//        (name)      Green Tower 4*
//        Room Category            Double
//        Superior Single Room     61 USD
//        Standard Double/Twin*    72 USD
//        ...
//        Breakfast Included            <- free-text note (no price)
//
// We find the header row ("Room Category" / "Room Type"), read the price
// columns to its right, collect the room rows, and keep leftover text as notes.

// A price cell is JUST a number with an optional currency: "44 GEL", "$61", "110".
// This rejects promo sentences like "Promotion till June 44 USD".
const looksLikePrice = (v) =>
    /^[$€]?\s*[\d.,]+\s*(gel|usd|eur|\$|€)?\s*$/i.test(String(v).trim()) && /\d/.test(v);

const isHeaderCell = (v) => /room\s*(category|type)/i.test(String(v || ""));

// "h-green-tower" style id from the tab name.
const toId = (title) =>
    "h-" + title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Pull the number and currency out of a price string: "72 USD" -> { amount: 72, currency: "USD" }
const readPrice = (v) => {
    const amount = Number(String(v).replace(/[^\d.]/g, ""));
    const currency = (String(v).match(/gel|usd|eur/i) || [""])[0].toUpperCase();
    return { amount: Number.isNaN(amount) ? null : amount, currency };
};

const parseTab = (title, rows) => {
    // 1) Find the header row and which column holds the room name.
    let headerIndex = -1;
    let catCol = -1;
    for (let i = 0; i < rows.length; i++) {
        const idx = rows[i].findIndex((c) => isHeaderCell(c));
        if (idx !== -1) {
            headerIndex = i;
            catCol = idx;
            break;
        }
    }

    // The display name is the first bit of text above the header (e.g. "Green Tower 4*").
    let displayName = title;
    for (let i = 0; i < (headerIndex === -1 ? rows.length : headerIndex); i++) {
        const cell = (rows[i] || []).map((c) => String(c || "").trim()).find(Boolean);
        if (cell) {
            displayName = cell;
            break;
        }
    }

    // No recognisable table — keep every bit of text so nothing is lost.
    if (headerIndex === -1) {
        const notes = rows.flat().map((c) => String(c || "").trim()).filter(Boolean);
        return { id: toId(title), name: title, displayName, rooms: [], notes };
    }

    // 2) Work out the price-column labels.
    let labelRow = rows[headerIndex];
    let dataStart = headerIndex + 1;

    // Some tabs use a 2-row header (season on top, occupancy below). If the next
    // row has no room name and no prices, treat it as a second label row and merge.
    const next = rows[headerIndex + 1] || [];
    const nextHasName = String(next[catCol] || "").trim() !== "";
    const nextHasPrice = next.some((c) => looksLikePrice(c));
    if (!nextHasName && !nextHasPrice && next.some((c) => String(c || "").trim())) {
        labelRow = labelRow.map((c, i) =>
            `${String(c || "").trim()} ${String(next[i] || "").trim()}`.trim(),
        );
        dataStart = headerIndex + 2;
    }

    // 3) Read the rooms (rows with at least one price) and notes (leftover text).
    const rooms = [];
    const notes = [];
    for (let i = dataStart; i < rows.length; i++) {
        const row = rows[i];
        const category = String(row[catCol] || "").trim();

        const prices = {};
        for (let c = catCol + 1; c < Math.max(labelRow.length, row.length); c++) {
            const value = String(row[c] || "").trim();
            if (looksLikePrice(value)) {
                const label = String(labelRow[c] || `Price ${c}`).trim() || `Price ${c}`;
                prices[label] = value;
            }
        }

        if (Object.keys(prices).length) rooms.push({ category, prices });
        else if (category) notes.push(category);
    }

    // 4) Cheapest price + currency, handy for a "from X" label on cards.
    let fromPrice = null;
    let currency = "";
    rooms.forEach((room) => {
        // "Extra bed" / "crib" aren't real rooms — don't let them set the "from" price.
        const isAddon = /extra\s*bed|crib|breakfast/i.test(room.category);
        Object.values(room.prices).forEach((p) => {
            const { amount, currency: cur } = readPrice(p);
            if (!currency && cur) currency = cur;
            if (isAddon) return;
            if (amount !== null && (fromPrice === null || amount < fromPrice)) fromPrice = amount;
        });
    });

    return { id: toId(title), name: title, displayName, currency, fromPrice, rooms, notes };
};

// Parse every hotel tab. `sheets` is [{ title, rows }] from the service.
const parseHotels = (sheets) => sheets.map(({ title, rows }) => parseTab(title, rows));

module.exports = parseHotels;
