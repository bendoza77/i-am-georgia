// Converts a JS literal (single quotes, unquoted keys, trailing commas)
// into valid JSON. No eval / new Function — pure text normalization.
const jsLiteralToJson = (str) => str
  // single-quoted strings -> double-quoted (with proper escaping)
  .replace(/'((?:[^'\\]|\\.)*)'/g, (_, inner) => JSON.stringify(inner.replace(/\\'/g, "'")))
  // unquoted keys: { type: ... } / , currency: ... -> "type": / "currency":
  .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
  // trailing commas before } or ]
  .replace(/,\s*([}\]])/g, '$1');

// Always returns an array. Accepts an already-parsed array, or a string that is
// either valid JSON or a JS literal; anything unparsable falls back to [].
const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        // first try to parse as valid JSON
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
        // not valid JSON — possibly a JS literal with single quotes
            try {
                const parsed = JSON.parse(jsLiteralToJson(value));
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                console.warn('safeArray: failed to parse string:', value);
                return [];
            }
        }
    }
    return [];
};

// Maps the snake_case hotel payload (as produced by the import model) into the
// camelCase shape expected by the Hotel schema, using safeArray for list fields.
const safeHotel = (body = {}) => ({
    hotelName: body.hotel_name,
    year: body.year,
    currency: body.currency,
    seasons: (body.seasons || []).map(s => ({
        periodLabel: s.period_label,
        roomTypes: (s.room_types || []).map(rt => ({
            roomType: rt.room_type,
            prices: (rt.prices || []).map(p => ({
                occupancy: p.occupancy,
                mealPlan: p.meal_plan,
                price: p.price
            }))
        }))
    })),
    mealPlanNotes: safeArray(body.meal_plan_notes),
    childrenPolicy: safeArray((body.children_policy || [])).map(c => ({
        ageRange: c.age_range,
        condition: c.condition
    })),
    extraCharges: safeArray(body.extra_charges),
    rawNotes: safeArray(body.raw_notes)
});

module.exports = { safeArray, safeHotel };