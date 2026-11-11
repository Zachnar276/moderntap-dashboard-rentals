/**
 * ModernTap Dashboard — Google Apps Script API
 *
 *   - setup()          creates any missing tabs (and test data in an empty Sheet)
 *   - clearTestTaps()  removes the fake test taps (device = "test")
 *   - doGet()          the web app API:
 *       ?action=ping
 *       ?action=house&chip=CHIP_ID&d=phone      guest tapped a chip: logs the tap, returns the house page
 *       ?action=house&property=PROPERTY_ID      house page opened directly (no tap logged)
 *       ?action=click&property=ID&type=rebook&chip=CHIP_ID&d=phone   guest clicked a link on the house page
 *       ?action=stats&property=PROPERTY_ID&days=30
 *
 * NOTE: "stats" has no login check yet. Sign in with Google is the next step.
 */

const TABS = {
  Properties: ['property_id', 'name', 'address', 'active', 'tagline'],
  Chips: ['chip_id', 'property_id', 'spot', 'link_type', 'active'],
  Links: ['property_id', 'link_type', 'label', 'url', 'details', 'placeholder', 'sort'],
  Taps: ['timestamp', 'chip_id', 'property_id', 'link_type', 'device'],
  Clicks: ['timestamp', 'property_id', 'link_type', 'chip_id', 'device'],
  Users: ['user_id', 'name', 'email', 'role', 'property_ids', 'access_code'],
  Bookings: ['booking_id', 'property_id', 'booked_date', 'stay_start', 'source'],
};

const LINK_TYPES = ['rebook', 'wifi', 'guide', 'review', 'local', 'other'];
const DEVICES = ['phone', 'tablet', 'desktop', 'unknown'];

/* ───────────────────────── Setup ───────────────────────── */

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone('America/New_York');

  // Only adds tabs that are missing, so existing data is never touched.
  Object.keys(TABS).forEach(function (name) {
    if (ss.getSheetByName(name)) return;
    const sh = ss.insertSheet(name);
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
  ss.getSheetByName('Properties').appendRow([
    'ocd-001', 'The Ocean Club of Duck', '136 Sea Eider Court, Duck, NC 27949', true,
    'Oceanfront in Tuckahoe, Duck · 8 bedrooms · Sleeps 22',
  ]);

  const chips = [
    ['ocd-kitchen', 'ocd-001', 'Kitchen', 'rebook', true],
    ['ocd-living', 'ocd-001', 'Living room', 'wifi', true],
    ['ocd-entry', 'ocd-001', 'Entryway', 'guide', true],
    ['ocd-patio', 'ocd-001', 'Patio', 'review', true],
  ];
  ss.getSheetByName('Chips').getRange(2, 1, chips.length, chips[0].length).setValues(chips);

  const links = [
    ['ocd-001', 'rebook', 'Book your next stay', 'https://www.twiddy.com/outer-banks/duck/tuckahoe/rentals/the-ocean-club-of-duck/', 'Pick your dates on Twiddy to come back to The Ocean Club of Duck.', false, 1],
    ['ocd-001', 'wifi', 'Wi-Fi', '', 'Network: OceanClub-Guest · Password: shown here', true, 2],
    ['ocd-001', 'guide', 'Guest info & FAQ', 'https://www.twiddy.com/outer-banks/guests/', 'Check-in, check-out, trash, parking and more from Twiddy.', false, 3],
    ['ocd-001', 'review', 'Leave a review', 'https://example.com/review', 'Tell future guests about your stay.', true, 4],
    ['ocd-001', 'local', 'Local favorites', 'https://example.com/local', 'Restaurants, beach access and things to do nearby.', true, 5],
  ];
  ss.getSheetByName('Links').getRange(2, 1, links.length, links[0].length).setValues(links);

  ss.getSheetByName('Users').appendRow(['u-admin', 'Admin', 'you@example.com', 'admin', '', '']);

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
  try {
    switch (p.action) {
      case 'ping':
        return json_({ ok: true, time: new Date().toISOString() });
      case 'house':
        return json_(getHouse_(p.chip, p.property, p.d));
      case 'click':
        return json_(logClick_(p.property, p.type, p.chip, p.d));
      case 'stats':
        return json_(getStats_(p.property, Number(p.days) || 30));
      default:
        return json_({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return json_({ ok: false, error: errText_(err) });
  }
}

/* ───────────────────────── Guest house page ───────────────────────── */

function getHouse_(chipId, propertyId, device) {
  let pid = String(propertyId || '').trim();
  let chip = null;

  if (chipId) {
    const id = String(chipId).trim().toLowerCase();
    chip = readTable_('Chips').filter(function (c) {
      return String(c.chip_id).trim().toLowerCase() === id && isTrue_(c.active);
    })[0];
    if (!chip) return { ok: false, error: 'Chip not found' };
    pid = String(chip.property_id);
  }

  const property = readTable_('Properties').filter(function (p) {
    return String(p.property_id) === pid && isTrue_(p.active);
  })[0];
  if (!property) return { ok: false, error: 'Property not found' };

  // A tap is logged only when the page was opened from a chip.
  let logged = null;
  if (chip) {
    logged = appendRow_('Taps', [new Date(), chip.chip_id, pid, chip.link_type, cleanDevice_(device)]);
  }

  const links = readTable_('Links')
    .filter(function (l) { return String(l.property_id) === pid; })
    .sort(function (a, b) { return (Number(a.sort) || 99) - (Number(b.sort) || 99); })
    .map(function (l) {
      const url = String(l.url || '').trim();
      return {
        type: l.link_type,
        label: l.label,
        url: /^https?:\/\//i.test(url) ? url : '',
        details: l.details || '',
        placeholder: isTrue_(l.placeholder),
      };
    });

  return {
    ok: true,
    tapLogged: logged,
    property: { id: pid, name: property.name, tagline: property.tagline || '' },
    focus: chip ? chip.link_type : null,
    chip: chip ? chip.chip_id : null,
    links: links,
  };
}

function logClick_(propertyId, linkType, chipId, device) {
  const pid = String(propertyId || '').trim();
  const exists = readTable_('Properties').some(function (p) { return String(p.property_id) === pid; });
  if (!exists) return { ok: false, error: 'Property not found' };
  const type = LINK_TYPES.indexOf(linkType) >= 0 ? linkType : 'other';
  const ok = appendRow_('Clicks', [new Date(), pid, type, String(chipId || '').slice(0, 64), cleanDevice_(device)]);
  return { ok: ok };
}

/** Appends a row under a lock. Returns false instead of throwing, so guests are never blocked. */
function appendRow_(tab, row) {
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      getSheet_(tab).appendRow(row);
    } finally {
      lock.releaseLock();
    }
    return true;
  } catch (err) {
    console.error('Could not write to ' + tab + ': ' + errText_(err));
    return false;
  }
}

function cleanDevice_(d) {
  return DEVICES.indexOf(d) >= 0 ? d : 'unknown';
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
  function dayKey(d) { return Utilities.formatDate(d, tz, 'yyyy-MM-dd'); }

  // Whole calendar days: this period = the last `days` days including today;
  // previous period = the `days` days before that.
  const periodDays = {};
  const prevDays = {};
  for (let i = 0; i < days * 2; i++) {
    const key = dayKey(new Date(now.getTime() - i * 86400000));
    if (i < days) periodDays[key] = true; else prevDays[key] = true;
  }

  const chips = readTable_('Chips').filter(function (c) { return String(c.property_id) === pid; });
  const taps = [];
  const prevTaps = [];
  readTable_('Taps').forEach(function (t) {
    if (String(t.property_id) !== pid || !(t.timestamp instanceof Date)) return;
    t.day = dayKey(t.timestamp);
    if (periodDays[t.day]) taps.push(t);
    else if (prevDays[t.day]) prevTaps.push(t);
  });
  const prevRebook = prevTaps.filter(function (t) { return t.link_type === 'rebook'; }).length;

  // Clicks on links from the guest house page, this period.
  const clicksByType = {};
  LINK_TYPES.forEach(function (t) { clicksByType[t] = 0; });
  readTable_('Clicks').forEach(function (c) {
    if (String(c.property_id) !== pid || !(c.timestamp instanceof Date)) return;
    if (!periodDays[dayKey(c.timestamp)]) return;
    clicksByType[LINK_TYPES.indexOf(c.link_type) >= 0 ? c.link_type : 'other']++;
  });

  const byType = {};
  LINK_TYPES.forEach(function (t) { byType[t] = 0; });

  const byChip = {};
  chips.forEach(function (c) {
    byChip[c.chip_id] = { chip_id: c.chip_id, spot: c.spot, link_type: c.link_type, taps: 0 };
  });

  const byDay = {};
  for (let i = days - 1; i >= 0; i--) {
    byDay[dayKey(new Date(now.getTime() - i * 86400000))] = { taps: 0, rebook: 0 };
  }

  taps.forEach(function (t) {
    const type = LINK_TYPES.indexOf(t.link_type) >= 0 ? t.link_type : 'other';
    byType[type]++;
    if (byChip[t.chip_id]) byChip[t.chip_id].taps++;
    byDay[t.day].taps++;
    if (type === 'rebook') byDay[t.day].rebook++;
  });

  return {
    ok: true,
    property: { id: pid, name: property.name },
    days: days,
    totalTaps: taps.length,
    rebookTaps: byType.rebook,
    clicksByType: clicksByType,
    prevTotalTaps: prevTaps.length,
    prevRebookTaps: prevRebook,
    byType: byType,
    byChip: Object.keys(byChip).map(function (k) { return byChip[k]; }),
    byDay: Object.keys(byDay).map(function (d) {
      return { date: d, taps: byDay[d].taps, rebook: byDay[d].rebook };
    }),
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
