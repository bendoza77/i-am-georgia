// The "Meta" index (the repurposed `List` tab): one row per hotel holding the
// rich fields that don't fit the room-rate tables — city, amenities, images…
//
// Row 1 of the tab is these headers, in this exact order. Reader and writer
// both import COLUMNS so the layout can never drift between them.

const COLUMNS = [
    "id",
    "name",
    "type",
    "city",
    "address",
    "tagline",
    "description",
    "stars",
    "currency",
    "rating",
    "reviews",
    "roomsCount",
    "images", // pipe-joined
    "amenities", // pipe-joined
    "status",
    "featured", // TRUE / FALSE
    "available", // TRUE / FALSE
    "checkIn",
    "checkOut",
];

const LIST_FIELDS = new Set(["images", "amenities"]);
const BOOL_FIELDS = new Set(["featured", "available"]);
const NUM_FIELDS = new Set(["stars", "rating", "reviews", "roomsCount"]);

const splitList = (v) =>
    String(v || "")
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);

// One sheet row (array of cells) -> a meta object keyed by column name.
const rowToMeta = (row) => {
    const meta = {};
    COLUMNS.forEach((col, i) => {
        const raw = row[i];
        if (LIST_FIELDS.has(col)) meta[col] = splitList(raw);
        else if (BOOL_FIELDS.has(col)) meta[col] = /^true$/i.test(String(raw).trim());
        else if (NUM_FIELDS.has(col)) {
            const n = Number(raw);
            meta[col] = raw === "" || raw == null || Number.isNaN(n) ? null : n;
        } else meta[col] = raw == null ? "" : String(raw).trim();
    });
    return meta;
};

// A hotel object -> one sheet row (array of cells), in COLUMNS order.
const metaToRow = (hotel) =>
    COLUMNS.map((col) => {
        const v = hotel[col];
        if (LIST_FIELDS.has(col)) return Array.isArray(v) ? v.join("|") : String(v || "");
        if (BOOL_FIELDS.has(col)) return v ? "TRUE" : "FALSE";
        if (v == null) return "";
        return String(v);
    });

module.exports = { COLUMNS, rowToMeta, metaToRow };
