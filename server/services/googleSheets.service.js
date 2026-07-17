const { google } = require("googleapis");
const { COLUMNS, rowToMeta, metaToRow } = require("../utils/hotelMeta.util");
const { hotelToTabRows } = require("../utils/serializeHotel.util");

// --- Connect to Google using the service account from .env ---
// The private key in .env has literal "\n" text, so we turn it back into real
// line breaks. We need READ + WRITE now (admin edits write back to the sheet),
// so the scope is the full spreadsheets scope, not spreadsheets.readonly.
const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const SHEET_ID = () => process.env.GOOGLE_SHEET_ID;

// The tab that holds the Meta index (rich fields: city, amenities, images…).
// This is a NEW tab we own — NOT the owner's existing "List" index tab, which
// holds their own hotel-name/year list and must be left untouched.
const META_TAB = "Meta";

// Tabs that are NOT hotel pricing tabs, so the reader skips them: our Meta tab
// plus the owner's "List" index.
const SKIP_TABS = new Set([META_TAB.toLowerCase(), "list"]);
const isSkipTab = (t) => SKIP_TABS.has(t.trim().toLowerCase());
const isMetaTab = (t) => t.trim().toLowerCase() === META_TAB.toLowerCase();

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

// Read every hotel (pricing) tab -> [{ title, rows }]. Skips the Meta tab.
const getHotelSheets = async () => {
    const meta = await sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID(),
        fields: "sheets(properties(title))",
    });

    const titles = meta.data.sheets
        .map((s) => s.properties.title)
        .filter((t) => !isSkipTab(t));

    const result = [];
    for (let i = 0; i < titles.length; i += 100) {
        const chunk = titles.slice(i, i + 100);
        const res = await sheets.spreadsheets.values.batchGet({
            spreadsheetId: SHEET_ID(),
            ranges: chunk.map((t) => `'${t}'!A1:J30`),
        });

        res.data.valueRanges.forEach((vr, j) => {
            result.push({ title: chunk[j], rows: vr.values || [] });
        });
    }

    return result;
};

// Read the Meta tab -> { [id]: metaObject }. Empty object if the tab or its
// header row isn't set up yet, so the site still works before Meta exists.
const getMeta = async () => {
    let res;
    try {
        res = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID(),
            range: `'${META_TAB}'!A1:${lastColumn()}1000`,
        });
    } catch {
        return {}; // tab missing — treat as no meta
    }

    const rows = res.data.values || [];
    if (rows.length < 2) return {}; // header only (or empty)

    const byId = {};
    for (let i = 1; i < rows.length; i++) {
        const meta = rowToMeta(rows[i]);
        if (meta.id) byId[meta.id] = meta;
    }
    return byId;
};

// ---------------------------------------------------------------------------
// WRITE
// ---------------------------------------------------------------------------

// A1 letter for the last Meta column (e.g. 19 cols -> "S").
const lastColumn = () => {
    let n = COLUMNS.length;
    let s = "";
    while (n > 0) {
        const r = (n - 1) % 26;
        s = String.fromCharCode(65 + r) + s;
        n = Math.floor((n - 1) / 26);
    }
    return s;
};

// Map of tab title -> sheetId, plus whether the Meta tab exists.
const getSheetIndex = async () => {
    const res = await sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID(),
        fields: "sheets(properties(sheetId,title))",
    });
    const byTitle = {};
    res.data.sheets.forEach((s) => {
        byTitle[s.properties.title] = s.properties.sheetId;
    });
    return byTitle;
};

// Make sure the Meta tab exists and has the header row. Safe to call repeatedly.
const ensureMetaTab = async (index) => {
    const idx = index || (await getSheetIndex());
    const exists = Object.keys(idx).some((t) => isMetaTab(t));

    if (!exists) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID(),
            requestBody: { requests: [{ addSheet: { properties: { title: META_TAB } } }] },
        });
    }

    // Write the header row (idempotent — always the same values).
    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID(),
        range: `'${META_TAB}'!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [COLUMNS] },
    });
};

// Find the 1-based Meta row for an id, or -1. Row 1 is the header.
const findMetaRow = async (id) => {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID(),
        range: `'${META_TAB}'!A1:A1000`,
    });
    const col = res.data.values || [];
    for (let i = 1; i < col.length; i++) {
        if (String(col[i][0] || "").trim() === id) return i + 1;
    }
    return -1;
};

// Create or update one hotel: writes its pricing tab AND its Meta row.
const upsertHotel = async (hotel) => {
    const index = await getSheetIndex();
    await ensureMetaTab(index);

    const title = hotel.title || hotel.name;
    if (!title) throw new Error("hotel needs a name");

    // 1) Pricing tab — create if missing, then rewrite in canonical layout.
    if (!(title in index)) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID(),
            requestBody: { requests: [{ addSheet: { properties: { title } } }] },
        });
    }
    await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID(),
        range: `'${title}'!A1:Z100`,
    });
    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID(),
        range: `'${title}'!A1`,
        valueInputOption: "RAW",
        requestBody: { values: hotelToTabRows(hotel) },
    });

    // 2) Meta row — update in place if the id already has a row, else append.
    const row = metaToRow(hotel);
    const existingRow = await findMetaRow(hotel.id);
    if (existingRow === -1) {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID(),
            range: `'${META_TAB}'!A1`,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [row] },
        });
    } else {
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID(),
            range: `'${META_TAB}'!A${existingRow}`,
            valueInputOption: "RAW",
            requestBody: { values: [row] },
        });
    }

    return hotel;
};

// Delete a hotel: remove its pricing tab and blank its Meta row.
const deleteHotel = async (id, title) => {
    const index = await getSheetIndex();

    if (title && title in index) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID(),
            requestBody: { requests: [{ deleteSheet: { sheetId: index[title] } }] },
        });
    }

    const existingRow = await findMetaRow(id);
    if (existingRow !== -1) {
        // Clear the row's cells (leaves an empty row; getMeta skips id-less rows).
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SHEET_ID(),
            range: `'${META_TAB}'!A${existingRow}:${lastColumn()}${existingRow}`,
        });
    }
};

module.exports = { getHotelSheets, getMeta, upsertHotel, deleteHotel };
