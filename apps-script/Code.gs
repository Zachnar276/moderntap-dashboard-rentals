/**
 * ModernTap Dashboard — Google Apps Script API
 *
 * Step 1: Sheet setup + API.
 *   - setup()          creates the tabs and adds Ocean Club of Duck test data
 *   - clearTestTaps()  removes the fake test taps (device = "test")
 *   - doGet()          the web app API:
 *       ?action=ping
 *       ?action=tap&chip=CHIP_ID&d=phone|tablet|desktop
 *       ?action=stats&property=PROPERTY_ID&days=30
 *
 * NOTE: "stats" has no login check yet. Logins are added in step 5.
 */

const TABS = {
  Properties: ['property_id', 'name', 'address', 'active'],
  Chips: ['chip_id', 'property_id', 'spot', 'link_type', 'destination_url', 'active'],
  Taps: ['timestamp', 'chip_id', 'property_id', 'link_type', 'device'],
  Users: ['user_id', 'name', 'email', 'role', 'property_ids', 'access_code'],
  Bookings: ['booking_id', 'property_id', 'booked_date', 'stay_start', 'source'],
};

const LINK_TYPES = ['rebook', 'wifi', 'guide', 'review', 'local', 'other'];
const DEVICES = ['phone', 'tablet', 'desktop', 'unknown'];

// Where a guest goes if a chip is unknown or something breaks. Change to a real page later.
const FALLBACK_URL = 'https://example.com';

/* ───────────────────────── Setup ───────────────────────── */

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone('America/New_York');

  Object.keys(TABS).forEach(function (name) {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    const headers = TABS[name];
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  });

  // Remove Google's empty default tab if it's still there.
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0) ss.deleteSheet(blank);

  if (ss.getSheetByName('Properties').getLastRow() < 2) addTestData_(ss);
}

function addTestData_(ss) {
  ss.getSheetByName('Properties').appendRow(['ocd-001', 'The Ocean Club of Duck', '', true]);

  const chips = [
    ['ocd-kitchen', 'ocd-001', 'Kitchen', 'rebook', 'https://example.com/rebook', true],
    ['ocd-living', 'ocd-001', 'Living room', 'wifi', 'https://example.com/wifi', true],
    ['ocd-entry', 'ocd-001', 'Entryway', 'guide', 'https://example.com/guide', true],
    ['ocd-patio', 'ocd-001', 'Patio', 'review', 'https://example.com/review', true],
  ];
  ss.getSheetByName('Chips').getRange(2, 1, chips.length, chips[0].length).setValues(chips);

  ss.getSheetByName('Users').appendRow([
    'u-admin', 'Admin', 'you@example.com', 'admin', '', Utilities.getUuid().slice(0, 8),
  ]);

  // ~60 days of fake taps so the dashboard has something to show. Marked device = "test".
  const rows = [];
  const now = new Date();
  for (let day = 0; day < 60; day++) {
    const count = Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const chip = chips[Math.floor(Math.random() * chips.length)];
      const t = new Date(now.getTime() - day * 86400000 - Math.floor(Math.random() * 86400000));
      rows.push([t, chip[0], chip[1], chip[3], 'test']);
    }
  }
  if (rows.length) {
    ss.getSheetByName('Taps').getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

function clearTestTaps() {
  const sh = getSheet_('Taps');
  const last = sh.getLastRow();
  if (last < 2) return;
  const width = TABS.Taps.length;
  const keep = sh.getRange(2, 1, last - 1, width).getValues()
    .filter(function (r) { return r[4] !== 'test'; });
  sh.getRange(2, 1, last - 1, width).clearContent();
  if (keep.length) sh.getRange(2, 1, keep.length, width).setValues(keep);
}

/* ───────────────────────── Web app ───────────────────────── */

function doGet(e) {
  const p = (e && e.parameter) || {};

  if (p.action === 'tap') {
    // A guest must always be forwarded somewhere, even if something fails.
    try {
      return json_(logTap_(p.chip, p.d));
    } catch (err) {
      return json_({ ok: false, error: errText_(err), url: FALLBACK_URL });
    }
  }

  try {
    switch (p.action) {
      case 'ping':
        return json_({ ok: true, time: new Date().toISOString() });
      case 'stats':
        return json_(getStats_(p.property, Number(p.days) || 30));
      default:
        return json_({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return json_({ ok: false, error: errText_(err) });
  }
}

/* ───────────────────────── Taps ───────────────────────── */

function logTap_(chipId, device) {
  const id = String(chipId || '').trim().toLowerCase();
  const chip = readTable_('Chips').filter(function (c) {
    return String(c.chip_id).trim().toLowerCase() === id && isTrue_(c.active);
  })[0];

  if (!chip) return { ok: false, error: 'Chip not found', url: FALLBACK_URL };

  const url = chip.destination_url || FALLBACK_URL;
  const dev = DEVICES.indexOf(device) >= 0 ? device : 'unknown';

  // Logging should never stop the guest from being forwarded.
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      getSheet_('Taps').appendRow([new Date(), chip.chip_id, chip.property_id, chip.link_type, dev]);
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return { ok: false, error: 'Tap not logged: ' + errText_(err), url: url };
  }

  return { ok: true, url: url };
}

/* ───────────────────────── Stats ───────────────────────── */

function getStats_(propertyId, days) {
  const pid = String(propertyId || '').trim();
  const property = readTable_('Properties').filter(function (p) {
    return String(p.property_id) === pid;
  })[0];
  if (!property) return { ok: false, error: 'Property not found' };

  days = Math.min(Math.max(Math.round(days), 1), 365);
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const now = new Date();
  const since = new Date(now.getTime() - days * 86400000);

  const chips = readTable_('Chips').filter(function (c) { return String(c.property_id) === pid; });
  const taps = readTable_('Taps').filter(function (t) {
    return String(t.property_id) === pid && t.timestamp instanceof Date && t.timestamp >= since;
  });

  const byType = {};
  LINK_TYPES.forEach(function (t) { byType[t] = 0; });

  const byChip = {};
  chips.forEach(function (c) {
    byChip[c.chip_id] = { chip_id: c.chip_id, spot: c.spot, link_type: c.link_type, taps: 0 };
  });

  const byDay = {};
  for (let i = days - 1; i >= 0; i--) {
    byDay[Utilities.formatDate(new Date(now.getTime() - i * 86400000), tz, 'yyyy-MM-dd')] = 0;
  }

  taps.forEach(function (t) {
    const type = LINK_TYPES.indexOf(t.link_type) >= 0 ? t.link_type : 'other';
    byType[type]++;
    if (byChip[t.chip_id]) byChip[t.chip_id].taps++;
    const day = Utilities.formatDate(t.timestamp, tz, 'yyyy-MM-dd');
    if (day in byDay) byDay[day]++;
  });

  return {
    ok: true,
    property: { id: pid, name: property.name },
    days: days,
    totalTaps: taps.length,
    rebookTaps: byType.rebook,
    byType: byType,
    byChip: Object.keys(byChip).map(function (k) { return byChip[k]; }),
    byDay: Object.keys(byDay).map(function (d) { return { date: d, taps: byDay[d] }; }),
  };
}

/* ───────────────────────── Helpers ───────────────────────── */

function getSheet_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Missing tab "' + name + '". Run setup() first.');
  return sh;
}

function readTable_(name) {
  const values = getSheet_(name).getDataRange().getValues();
  const headers = values.shift() || [];
  return values
    .filter(function (r) { return r.some(function (v) { return v !== ''; }); })
    .map(function (r) {
      const o = {};
      headers.forEach(function (h, i) { o[h] = r[i]; });
      return o;
    });
}

function isTrue_(v) {
  return v === true || String(v).trim().toUpperCase() === 'TRUE';
}

function errText_(err) {
  return String((err && err.message) || err);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
