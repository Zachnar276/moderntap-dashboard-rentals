# ModernTap Dashboard

## What this is
A dashboard for ModernTap: NFC plaques ("chips") placed in vacation rental properties.
Guests tap a chip, get sent to a link, and the tap is logged. The dashboard shows
property managers and owners how their chips are performing.

Sample/test property: The Ocean Club of Duck.

## Decisions (do not change without asking)
- **Roles:** admin, manager, and owner all get access (each sees what's relevant to them).
- **Multi-property:** one account can cover many properties.
- **Data:** Google Sheets is the database.
- **API:** Google Apps Script web app reads/writes the Sheet.
- **Hosting:** Netlify (static front end), deployed from this GitHub repo.
- **Chips:** every chip points to a redirect link that logs the tap, then forwards the guest.
- **Cost:** free tiers only to start. No paid services or libraries.
- **Top metric:** rebooking. It should be the most prominent number on the dashboard.

## Open questions
- How a "rebooking" is counted (tap on a rebooking link vs. confirmed booking) — ask before building the metric.

## How to work
- Propose a plan before writing code for any new feature.
- Build in small pieces; keep each change focused.
- Keep it simple: plain HTML/CSS/JavaScript unless there's a strong reason otherwise.
- Use Ocean Club of Duck as test data.
- Explain anything I need to do by hand (e.g., setting up the Sheet or deploying Apps Script).
