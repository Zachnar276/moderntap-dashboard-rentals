# ModernTap Dashboard

## What this is
A dashboard for ModernTap: NFC plaques ("chips") placed in vacation rental properties.
Guests tap a chip, get sent to a link, and the tap is logged. The dashboard shows
property managers and owners how their chips are performing.

Sample/test property: The Ocean Club of Duck.

## Decisions (do not change without asking)
- **Roles:** admin, twiddy, manager, and owner all get access (each sees what's relevant to them). Twiddy sees every house plus the self-help panel.
- **Multi-property:** one account can cover many properties.
- **Data:** Google Sheets is the database.
- **API:** Google Apps Script web app reads/writes the Sheet.
- **Hosting:** Netlify (static front end), deployed from this GitHub repo.
- **Chips:** every chip opens the house's guest page (`/t/CHIP_ID`), which logs the tap and shows that chip's link first, with the house's other links below.
- **Logins:** Sign in with Google; Users tab maps email → role (admin / twiddy / manager / owner). Admins can “View as” anyone (read-only). Owners with several houses see all of them.
- **Cost:** free tiers only to start. No paid services or libraries.
- **Top metric:** rebooking. It should be the most prominent number on the dashboard.

## Rebooking definition
- For now, a rebooking = a tap on a chip whose link type is "rebook".
- Later, confirmed booking data will be imported by hand; then also show confirmed rebookings and conversion.

## Guest self-help
- Help plaques (how-to, Wi-Fi, guidebook) ask “Did this solve it?”. “I figured it out” = possible work order avoided; “I still need help” shows Twiddy guest services and counts as a likely work order.

## Plan
- See PLAN.md for the architecture, Sheet layout and build order.

## How to work
- Propose a plan before writing code for any new feature.
- Build in small pieces; keep each change focused.
- Keep it simple: plain HTML/CSS/JavaScript unless there's a strong reason otherwise.
- Use Ocean Club of Duck as test data. Links that aren't real yet are marked as placeholders and say so on the page.
- Owner meeting for Ocean Club of Duck is in late November 2026; Twiddy demo is a few months out.
- Explain anything I need to do by hand (e.g., setting up the Sheet or deploying Apps Script).
