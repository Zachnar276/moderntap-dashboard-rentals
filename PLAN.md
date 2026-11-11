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
| Tap page | `/t/CHIP_ID` → logs and forwards in under a second | Netlify (this repo) |
| Dashboard | Login, overview, property detail, admin pages | Netlify (this repo) |

Plain HTML/CSS/JavaScript. No paid services.

## Google Sheet tabs

**Properties**
| property_id | name | address | active |
|---|---|---|---|
| ocd-001 | The Ocean Club of Duck | … | TRUE |

**Chips**
| chip_id | property_id | spot | link_type | destination_url | active |
|---|---|---|---|---|---|
| ocd-kitchen | ocd-001 | Kitchen | rebook | https://… | TRUE |

`link_type` options: `rebook`, `wifi`, `guide`, `review`, `local`, `other`.

**Taps** (written automatically — never edited by hand)
| timestamp | chip_id | property_id | link_type | device |
|---|---|---|---|---|

`device` is just phone / tablet / desktop. No guest personal info is stored.

**Users**
| user_id | name | email | role | property_ids | access_code |
|---|---|---|---|---|---|

`role` is `admin`, `manager`, or `owner`. `property_ids` is a comma list; admins see everything.

**Bookings** (added later, imported by hand)
| booking_id | property_id | booked_date | stay_start | source |
|---|---|---|---|---|

## Rebooking metric
- **Now:** a rebooking = a tap on a chip with `link_type = rebook`.
  Shown as the biggest number on every dashboard view, with a trend over time.
- **Later:** once booking data is imported into the Bookings tab, also show confirmed
  rebookings and the rate of rebooking taps to confirmed bookings.

## Roles
- **Admin:** all properties; can add properties, chips and users.
- **Manager:** the properties assigned to them; can edit chip destinations.
- **Owner:** their own properties; view only.

**Login (proposed — confirm before building):** each user gets a personal access code stored
in the Users tab. Apps Script checks the code and returns only that user's properties.
Simple and free; fine for a pilot, not bank-grade security.

## Build order
1. **Sheet + Apps Script API.** Create the tabs, add Ocean Club of Duck test data,
   deploy the script. (Setup in your Google account — step-by-step instructions provided.)
2. **Tap page.** `/t/CHIP_ID` logs the tap and forwards. Test with a phone.
3. **Property page.** One property's stats: rebooking taps up top, taps by chip and by day.
4. **Overview page.** All properties at a glance, ranked by rebooking taps.
5. **Logins + roles.** Access codes; each role sees the right properties.
6. **Admin page.** Add/edit properties, chips and users without opening the Sheet.
7. **Bookings import (later).** Confirmed rebookings and conversion rate.

Each step gets tested before the next one starts.
