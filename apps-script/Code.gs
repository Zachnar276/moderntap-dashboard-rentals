/**
 * ModernTap Dashboard — Google Apps Script API
 *
 *   - setup()          creates any missing tabs (and test data in an empty Sheet)
 *   - clearTestTaps()  removes the fake test taps (device = "test")
 *   - doGet()          public actions used by guests' phones (house page, clicks)
 *   - doPost()         signed-in actions used by the dashboard (Sign in with Google)
 */

const TABS = {
  Properties: ['property_id', 'name', 'address', 'active', 'tagline'],
  Chips: ['chip_id', 'property_id', 'spot', 'link_type', 'active'],
  Links: ['property_id', 'link_type', 'label', 'url', 'details', 'placeholder', 'sort'],
  Taps: ['timestamp', 'chip_id', 'property_id', 'link_type', 'device'],
  Clicks: ['timestamp', 'property_id', 'link_type', 'chip_id', 'device'],
  Users: ['user_id', 'name', 'email', 'role', 'property_ids'],
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

  ss.getSheetByName('Users').appendRow(['u-admin', 'Admin', 'you@example.com', 'admin', '']);

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

/**
 * Public actions (guests' phones): GET.
 *   ?action=ping
 *   ?action=house&chip=CHIP_ID&d=phone&v=VISITOR    guest tapped a plaque: logs the tap, returns the house page
 *   ?action=house&property=PROPERTY_ID              house page opened directly (no tap logged)
 *   ?action=click&property=ID&type=rebook&chip=CHIP_ID&d=phone&v=VISITOR
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    switch (p.action) {
      case 'ping':
        return json_({ ok: true, time: new Date().toISOString() });
      case 'house':
        return json_(getHouse_(p.chip, p.property, p.d, p.v));
      case 'click':
        return json_(logClick_(p.property, p.type, p.chip, p.d, p.v));
      default:
        return json_({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return json_({ ok: false, error: errText_(err) });
  }
}

/**
 * Signed-in actions (dashboard): POST with a JSON body { action, token, ... }.
 * The token is a Google ID token from Sign in with Google. It is sent in the body,
 * not the address, so it never shows up in logs or browser history.
 *   { action: 'me' }
 *   { action: 'overview', days: 30 }
 *   { action: 'stats', property: 'ocd-001', days: 30 }
 */
function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const user = verifyUser_(body.token);
    if (!user.ok) return json_(user);

    const days = clampDays_(body.days);
    switch (body.action) {
      case 'me':
        return json_({ ok: true, user: publicUser_(user) });
      case 'overview':
        return json_(getOverview_(user, days));
      case 'stats':
        if (user.propertyIds.indexOf(String(body.property)) < 0) {
          return json_({ ok: false, error: 'no_access' });
        }
        return json_(getStats_(String(body.property), days));
      default:
        return json_({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return json_({ ok: false, error: errText_(err) });
  }
}

/* ───────────────────────── Sign in with Google ───────────────────────── */

const GOOGLE_CLIENT_ID = '738140668443-le3dhuc3ujmg9r51rmd6j2djlsgfei50.apps.googleusercontent.com';
const ROLES = ['admin', 'manager', 'owner'];

/**
 * Checks a Google ID token with Google, then looks the email up in the Users tab.
 * Returns { ok, email, name, role, propertyIds } or { ok: false, error }.
 */
function verifyUser_(token) {
  if (!token || typeof token !== 'string' || token.length > 4096) {
    return { ok: false, error: 'signed_out' };
  }

  const cache = CacheService.getScriptCache();
  const cacheKey = 'tok:' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token));
  let identity = null;
  const cached = cache.get(cacheKey);

  if (cached) {
    identity = JSON.parse(cached);
  } else {
    const res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
      { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) return { ok: false, error: 'signed_out' };
    const info = JSON.parse(res.getContentText());
    const issuerOk = info.iss === 'accounts.google.com' || info.iss === 'https://accounts.google.com';
    const expiresMs = Number(info.exp) * 1000;
    if (info.aud !== GOOGLE_CLIENT_ID || !issuerOk ||
        String(info.email_verified) !== 'true' || !(expiresMs > Date.now())) {
      return { ok: false, error: 'signed_out' };
    }
    identity = { email: String(info.email).toLowerCase(), name: info.name || '' };
    // Cache until the token expires (max 10 minutes).
    const ttl = Math.min(600, Math.floor((expiresMs - Date.now()) / 1000));
    if (ttl > 30) cache.put(cacheKey, JSON.stringify(identity), ttl);
  }

  const row = readTable_('Users').filter(function (u) {
    return String(u.email).trim().toLowerCase() === identity.email;
  })[0];
  const role = row ? String(row.role).trim().toLowerCase() : '';
  if (!row || ROLES.indexOf(role) < 0) {
    return { ok: false, error: 'not_authorized', email: identity.email };
  }

  const activeIds = readTable_('Properties')
    .filter(function (p) { return isTrue_(p.active); })
    .map(function (p) { return String(p.property_id); });

  const propertyIds = role === 'admin'
    ? activeIds
    : String(row.property_ids || '').split(/[,\s]+/)
        .map(function (s) { return s.trim(); })
        .filter(function (id) { return id && activeIds.indexOf(id) >= 0; });

  return { ok: true, email: identity.email, name: row.name || identity.name, role: role, propertyIds: propertyIds };
}

function publicUser_(user) {
  return { email: user.email, name: user.name, role: user.role, propertyCount: user.propertyIds.length };
}

/* ───────────────────────── Guest house page ───────────────────────── */

const VISITOR_RE = /^[a-z0-9]{8,32}$/;
const REPEAT_TAP_SECONDS = 1800;   // same phone + same plaque within 30 min counts once
const REPEAT_CLICK_SECONDS = 600;  // same phone + same link within 10 min counts once

/** True the first time this key is seen in the window; false for repeats. */
function firstInWindow_(key, seconds) {
  const cache = CacheService.getScriptCache();
  if (cache.get(key)) return false;
  cache.put(key, '1', seconds);
  return true;
}

function getHouse_(chipId, propertyId, device, visitor) {
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

  // A tap is logged only when the page was opened from a plaque, and repeats are skipped.
  let logged = null;
  if (chip) {
    const v = VISITOR_RE.test(visitor || '') ? visitor : '';
    const fresh = !v || firstInWindow_('tap:' + chip.chip_id + ':' + v, REPEAT_TAP_SECONDS);
    logged = fresh
      ? appendRow_('Taps', [new Date(), chip.chip_id, pid, chip.link_type, cleanDevice_(device)])
      : 'repeat';
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

function logClick_(propertyId, linkType, chipId, device, visitor) {
  const pid = String(propertyId || '').trim();
  const exists = readTable_('Properties').some(function (p) { return String(p.property_id) === pid; });
  if (!exists) return { ok: false, error: 'Property not found' };
  const type = LINK_TYPES.indexOf(linkType) >= 0 ? linkType : 'other';
  const v = VISITOR_RE.test(visitor || '') ? visitor : '';
  if (v && !firstInWindow_('click:' + pid + ':' + type + ':' + v, REPEAT_CLICK_SECONDS)) {
    return { ok: true, logged: 'repeat' };
  }
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

function clampDays_(d) {
  return Math.min(Math.max(Math.round(Number(d) || 30), 1), 365);
}

/**
 * One pass over Taps and Clicks for a set of houses.
 * Returns { tz, days, dayList, byProperty: { id: summary } }.
 * "This period" = the last `days` calendar days including today; "previous" = the `days` before that.
 */
function summarize_(propertyIds, days) {
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const now = new Date();
  function dayKey(d) { return Utilities.formatDate(d, tz, 'yyyy-MM-dd'); }

  const dayList = [];
  const period = {};
  const prev = {};
  for (let i = days * 2 - 1; i >= 0; i--) {
    const key = dayKey(new Date(now.getTime() - i * 86400000));
    if (i < days) { period[key] = true; dayList.push(key); } else { prev[key] = true; }
  }

  const byProperty = {};
  propertyIds.forEach(function (id) {
    const byDay = {};
    dayList.forEach(function (d) { byDay[d] = { taps: 0, rebook: 0 }; });
    const byType = {};
    const clicksByType = {};
    LINK_TYPES.forEach(function (t) { byType[t] = 0; clicksByType[t] = 0; });
    byProperty[id] = {
      totalTaps: 0, rebookTaps: 0, prevTotalTaps: 0, prevRebookTaps: 0,
      rebookClicks: 0, prevRebookClicks: 0,
      byType: byType, clicksByType: clicksByType, byDay: byDay, byChip: {},
    };
  });

  readTable_('Taps').forEach(function (t) {
    const s = byProperty[String(t.property_id)];
    if (!s || !(t.timestamp instanceof Date)) return;
    const day = dayKey(t.timestamp);
    const type = LINK_TYPES.indexOf(t.link_type) >= 0 ? t.link_type : 'other';
    if (period[day]) {
      s.totalTaps++;
      s.byType[type]++;
      s.byDay[day].taps++;
      if (type === 'rebook') { s.rebookTaps++; s.byDay[day].rebook++; }
      s.byChip[t.chip_id] = (s.byChip[t.chip_id] || 0) + 1;
    } else if (prev[day]) {
      s.prevTotalTaps++;
      if (type === 'rebook') s.prevRebookTaps++;
    }
  });

  readTable_('Clicks').forEach(function (c) {
    const s = byProperty[String(c.property_id)];
    if (!s || !(c.timestamp instanceof Date)) return;
    const day = dayKey(c.timestamp);
    const type = LINK_TYPES.indexOf(c.link_type) >= 0 ? c.link_type : 'other';
    if (period[day]) {
      s.clicksByType[type]++;
      if (type === 'rebook') s.rebookClicks++;
    } else if (prev[day] && type === 'rebook') {
      s.prevRebookClicks++;
    }
  });

  return { days: days, dayList: dayList, byProperty: byProperty };
}

function getStats_(pid, days) {
  const property = readTable_('Properties').filter(function (p) {
    return String(p.property_id) === pid;
  })[0];
  if (!property) return { ok: false, error: 'Property not found' };

  const s = summarize_([pid], days).byProperty[pid];
  const chips = readTable_('Chips').filter(function (c) { return String(c.property_id) === pid; });

  return {
    ok: true,
    property: { id: pid, name: property.name },
    days: days,
    totalTaps: s.totalTaps,
    rebookTaps: s.rebookTaps,
    prevTotalTaps: s.prevTotalTaps,
    prevRebookTaps: s.prevRebookTaps,
    rebookClicks: s.rebookClicks,
    prevRebookClicks: s.prevRebookClicks,
    byType: s.byType,
    clicksByType: s.clicksByType,
    byChip: chips.map(function (c) {
      return { chip_id: c.chip_id, spot: c.spot, link_type: c.link_type, taps: s.byChip[c.chip_id] || 0 };
    }),
    byDay: Object.keys(s.byDay).map(function (d) {
      return { date: d, taps: s.byDay[d].taps, rebook: s.byDay[d].rebook };
    }),
  };
}

function getOverview_(user, days) {
  const props = readTable_('Properties').filter(function (p) {
    return user.propertyIds.indexOf(String(p.property_id)) >= 0;
  });
  const ids = props.map(function (p) { return String(p.property_id); });
  const sum = summarize_(ids, days);

  const totals = { totalTaps: 0, rebookTaps: 0, prevTotalTaps: 0, prevRebookTaps: 0, rebookClicks: 0, prevRebookClicks: 0 };
  const houses = props.map(function (p) {
    const id = String(p.property_id);
    const s = sum.byProperty[id];
    Object.keys(totals).forEach(function (k) { totals[k] += s[k]; });
    return {
      id: id,
      name: p.name,
      tagline: p.tagline || '',
      totalTaps: s.totalTaps,
      rebookTaps: s.rebookTaps,
      prevRebookTaps: s.prevRebookTaps,
      rebookClicks: s.rebookClicks,
      prevRebookClicks: s.prevRebookClicks,
      daily: sum.dayList.map(function (d) { return s.byDay[d].taps; }),
    };
  });

  return { ok: true, user: publicUser_(user), days: days, totals: totals, houses: houses };
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
