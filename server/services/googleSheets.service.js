const { google } = require("googleapis");

// --- Connect to Google using the service account from .env ---
// The private key in .env has literal "\n" text, so we turn it back into real line breaks.
const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

const SHEET_ID = () => process.env.GOOGLE_SHEET_ID;

// The spreadsheet has ONE tab per hotel, plus a "List" index tab we skip.
// This reads every hotel tab and returns [{ title, rows }] where
// rows is an array of arrays (the raw cells of that tab).
const getHotelSheets = async () => {
    // 1) Get the names of every tab.
    const meta = await sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID(),
        fields: "sheets(properties(title))",
    });

    const titles = meta.data.sheets
        .map((s) => s.properties.title)
        .filter((t) => t.trim().toLowerCase() !== "list");

    // 2) Read the cells of every tab. batchGet lets us grab many tabs per
    //    request, so we chunk into groups of 100 to stay well within limits.
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

module.exports = getHotelSheets;
