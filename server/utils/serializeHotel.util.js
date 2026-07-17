// Turns a hotel object back into the 2-D grid of a per-hotel pricing tab, in
// the canonical layout that parseHotels.util reads cleanly:
//
//        [displayName]                         e.g. "Green Tower 4*"
//        [Room Category, <label1>, <label2>]   header row
//        [<category>,    <price>,  <price> ]    one row per room
//        [<note>]                               free-text notes (no prices)
//
// `hotel.rooms` is [{ category, prices: { label: "72 USD", ... } }].
// `hotel.notes` is an array of strings.

const hotelToTabRows = (hotel) => {
    const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
    const notes = Array.isArray(hotel.notes) ? hotel.notes : [];

    // Column labels = the union of every room's price labels, first-seen order.
    const labels = [];
    rooms.forEach((r) => {
        Object.keys(r.prices || {}).forEach((l) => {
            if (!labels.includes(l)) labels.push(l);
        });
    });

    const displayName =
        hotel.displayName ||
        (hotel.stars ? `${hotel.name} ${hotel.stars}*` : hotel.name || "");

    const rows = [[displayName], ["Room Category", ...labels]];

    rooms.forEach((r) => {
        rows.push([r.category || "", ...labels.map((l) => (r.prices || {})[l] || "")]);
    });

    notes.forEach((n) => rows.push([String(n)]));

    return rows;
};

module.exports = { hotelToTabRows };
