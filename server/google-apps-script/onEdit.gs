/**
 * Google Apps Script — pings the backend the instant an owner edits the sheet,
 * so the website updates within seconds instead of waiting for the cache.
 *
 * SETUP (one time):
 *   1. Open your Google Sheet.
 *   2. Extensions > Apps Script. Paste this whole file in.
 *   3. Set the two script properties (Project Settings > Script properties):
 *        REFRESH_URL    = https://YOUR-BACKEND.com/api/hotels/refresh
 *        REFRESH_SECRET = (the same value as REFRESH_SECRET in the server .env)
 *   4. Triggers (clock icon) > Add trigger:
 *        function: onSheetEdit   event: From spreadsheet > On edit
 *      (An INSTALLABLE trigger is required — the simple onEdit() cannot call
 *       external URLs.)
 *
 * Edits are debounced: rapid edits collapse into one refresh a couple of
 * seconds later, so a burst of typing doesn't hammer the backend.
 */

var DEBOUNCE_MS = 2500;

function onSheetEdit(e) {
  var props = PropertiesService.getScriptProperties();
  // Remember that an edit happened; the trigger below sends the actual ping.
  props.setProperty('pendingRefresh', String(Date.now()));
  scheduleRefresh_();
}

// Schedule a single delayed refresh, replacing any already pending one.
function scheduleRefresh_() {
  // Clear existing time-based triggers for sendRefresh_ so we don't stack them.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendRefresh_') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendRefresh_').timeBased().after(DEBOUNCE_MS).create();
}

function sendRefresh_() {
  var props = PropertiesService.getScriptProperties();
  var url = props.getProperty('REFRESH_URL');
  var secret = props.getProperty('REFRESH_SECRET');
  if (!url) return;

  try {
    UrlFetchApp.fetch(url, {
      method: 'post',
      headers: secret ? { 'x-refresh-secret': secret } : {},
      muteHttpExceptions: true,
    });
  } catch (err) {
    console.error('refresh ping failed: ' + err);
  }

  // Tidy up: remove the one-shot trigger we just ran.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendRefresh_') ScriptApp.deleteTrigger(t);
  });
}
