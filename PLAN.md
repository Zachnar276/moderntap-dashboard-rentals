# ModernTap Dashboard — Plan

## How it fits together

```
Guest taps chip
   │
   ▼
https://<site>.netlify.app/t/CHIP_ID      (the URL written to the chip — never changes)
   │  Netlify page asks Apps Script: "log this tap, where should it go?"
   ▼
Apps Script web app ──► writes a row to the Taps tab
   │                    looks up the chip's destination
   ▼
Guest is forwarded to the destination (rebooking page, Wi-Fi info, guidebook, etc.)


Manager / owner / admin
   │
   ▼
Netlify dashboard pages ──► Apps Script API ──► reads Google Sheet ──► charts + numbers
```

**Why the chip points to our site instead of straight to the destination:** we can log every
tap, and we can change where a chip goes later without reprogramming the physical chip.

## Pieces

| Piece | What it is | Where it lives |
|---|---|---|
| Google Sheet | The database | Your Google Drive |
| Apps Script | The API: logs taps, serves dashboard data, checks logins | Attached to the Sheet |
| Guest house page | `/t/CHIP_ID` → logs the tap and shows the house's links | Netlify (this repo) |
| Dashboard | Login, overview, property detail, admin pages | Netlify (this repo) |

Plain HTML/CSS/JavaScript. No paid services.

## Google Sheet tabs

**Properties**
| property_id | name | address | active | tagline |
|---|---|---|---|---|
| ocd-001 | The Ocean Club of Duck | … | TRUE | Oceanfront in Tuckahoe… |

**Chips**
| chip_id | property_id | spot | link_type | active |
|---|---|---|---|---|
| ocd-kitchen | ocd-001 | Kitchen | rebook | TRUE |

**Links** (what the guest page shows; one row per link per house)
| property_id | link_type | label | url | details | placeholder | sort |
|---|---|---|---|---|---|---|
| ocd-001 | rebook | Book your next stay | https://www.twiddy.com/… | … | FALSE | 1 |

**Clicks** (written automatically when a guest opens a link on the house page)
| timestamp | property_id | link_type | chip_id | device |
|---|---|---|---|---|

`link_type` options: `rebook`, `wifi`, `guide`, `review`, `local`, `other`.

**Taps** (written automatically — never edited by hand)
| timestamp | chip_id | property_id | link_type | device |
|---|---|---|---|---|

`device` is just phone / tablet / desktop. No guest personal info is stored.

**Users**
| user_id | name | email | role | property_ids |
|---|---|---|---|---|

`role` is `admin`, `manager`, or `owner`. `property_ids` is a comma list; admins see everything.

**Bookings** (added later, imported by hand)
| booking_id | property_id | booked_date | stay_start | source |
|---|---|---|---|---|

## Security notes
- Stats are only served to signed-in users (Google ID token checked with Google, email must be in Users).
- Owners/managers only get the houses listed in their `property_ids`; admins get all.
- Guest tap/click logging is public by design; repeat taps from the same phone are ignored for 30 min
  (clicks: 10 min) using an anonymous random ID that is never stored. Numbers are estimates.
- Nothing secret is in this repo: the Apps Script URL and Google client ID are public by design.
- Anything on a guest page (e.g. a Wi-Fi password) is effectively public.
- Admin edits are checked on the server: admin-only, IDs/emails/links validated, links must be https,
  text that could act as a Sheet formula is escaped, and you can't remove your own admin access.
- Sign-in is in Google "testing" mode: each person must also be added as a test user in Google Cloud.

## Plaques (flexible by design)
- Each plaque is one row in Chips, so a house can have any number (1, 4, 15…), set per house in Admin.
- Plaque IDs are permanent (they're written on the chip). A plaque can be moved to a different spot
  or changed to open a different link; past taps keep the link type they had when tapped.
- Plaques with tap history can be turned off but not deleted, so stats stay accurate.
  Never-tapped plaques can be deleted.
- If a plaque opens a link type the house doesn't have, the guest sees the full list (Admin warns about it).

## Design
- Beachy Outer Banks look on every page: background illustration in `site/img/obx-*` (wide, 1400px and a phone
  crop, WebP + JPEG fallbacks, 41–155 KB), set in `css/beach.css`. Image made by Zach with ChatGPT.
- A "Powered by ModernTap" blimp drifts across with a rotating cheeky line. Motion stops for people who
  turn on "reduce motion".
- Chart colors were re-checked for color-blind safety and contrast on the new sand/ocean backgrounds.

## Owner-meeting features
- "How these numbers are counted" on every dashboard page (`js/defs.js`).
- Overview ranks houses (#1 of N) and compares each with the portfolio average; sortable by alerts.
- Plaque health on each house: Working / Not being used / Low use / New / Off, with last-tap date.
  Rules live at the top of the Plaque health section in Code.gs (14-day window, quarter-of-median).
- "What guests open": link presses per guest-page link.
- House switcher on every dashboard page (All houses + each house), keeps the date range.
- "Where the numbers come from" on the overview: each house's share of rebooking taps / potential rebooks,
  or all taps split by plaque type (validated 6-color order, legend + table view).
- Demo-data banner whenever demo taps are in the period.
- Guest privacy page (`privacy.html`), linked from guest pages and sign-in. Not legal advice; have it reviewed.

## Rebooking metric
- **Now:** a rebooking = a tap on a chip with `link_type = rebook`.
  Shown as the biggest number on every dashboard view, with a trend over time.
- **Potential rebooks (clicks):** guests who pressed "Choose your dates" on the house page (Clicks tab).
- **Later:** once booking data is imported into the Bookings tab, also show confirmed
  rebookings and the rate of rebooking taps to confirmed bookings.

## Roles
- **Admin:** all properties; can add properties, chips and users.
- **Manager:** the properties assigned to them; can edit chip destinations.
- **Owner:** their own properties; view only.


## Guest house page (decided)
- A chip opens the house's guest page (`/t/CHIP_ID`), with that chip's link as the main card and the
  house's other links below. `/h/PROPERTY_ID` opens the same page without logging a tap.
- The page also works as a small ModernTap demo, with a link to the ModernTap website.
- Rebooking links go to Twiddy's page for that house (guests pick dates there).
- Links that aren't real yet are marked `placeholder` in the Links tab and show a "Demo placeholder" note.
- Clicks on links are logged in the Clicks tab.

## Logins (decided)
- Sign in with Google. Users tab maps each email to a role.
- Admin: everything. Manager: assigned houses, can edit links. Owner: their houses, view only.
  Owners with several houses see all of them (`property_ids` is a comma list).

## Build order
Re-ordered for the Ocean Club of Duck owner meeting (late November 2026).

1. ✅ **Sheet + Apps Script API** (code written — see `apps-script/SETUP.md`). Create the tabs, add Ocean Club of Duck test data,
   deploy the script. (Setup in your Google account — step-by-step instructions provided.)
2. ✅ **Tap logging** (now part of the guest house page).
3. ✅ **Property page** (`site/property.html?p=PROPERTY_ID`; needs the updated Apps Script redeployed). One property's stats: rebooking taps up top, taps by chip and by day.
4. ✅ **Guest house page** (`site/house.html`).
5. ✅ **Sign in with Google + access levels** (`index.html` → `dashboard.html`).
6. ✅ **Overview page** (`dashboard.html`): every house the user can see, totals, sortable; built for 9+ houses.
7. ✅ **Admin page** (`admin.html`, admins only): houses, plaques (with the link to write on each chip,
   copy, preview, printable list), guest page links, and people/access.
8. **Before plaques go in:** run `clearTestTaps` to remove demo taps (both houses' demo taps are marked `test`).
9. **Bookings import (later).** Confirmed rebookings and conversion rate.

Each step gets tested before the next one starts.
