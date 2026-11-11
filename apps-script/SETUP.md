# Step 1 setup — Google Sheet + Apps Script

Do this on a computer (the Apps Script editor doesn't work well on a phone). About 10 minutes.

## 1. Make the Sheet
1. Go to sheets.google.com and create a **blank spreadsheet**.
2. Name it **ModernTap Dashboard Data**.

## 2. Add the code
1. In the Sheet, open **Extensions → Apps Script**.
2. Name the project **ModernTap API** (click "Untitled project" at the top).
3. Delete everything in `Code.gs`.
4. Open `apps-script/Code.gs` in this GitHub repo, click **Raw**, copy all of it, and paste it in.
5. Click the **Save** icon.

## 3. Create the tabs and test data
1. In the function dropdown at the top (next to Run/Debug), choose **setup**.
2. Click **Run**.
3. Google asks for permission: **Review permissions → pick your account**.
   If you see "Google hasn't verified this app", click **Advanced → Go to ModernTap API (unsafe)**.
   That's normal — it's your own script.
4. Click **Allow**.
5. Go back to the Sheet. You should see tabs: **Properties, Chips, Taps, Users, Bookings**,
   with Ocean Club of Duck test data and about 150 fake taps (marked `test`).

## 4. Publish it as a web app
1. In Apps Script, click **Deploy → New deployment**.
2. Click the gear next to "Select type" → **Web app**.
3. Set:
   - Description: `v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy** and copy the **Web app URL** (ends in `/exec`).

"Anyone" is required so guests' phones can log taps without signing in.

## 5. Test it
Paste each into your browser, replacing `YOUR_URL` with the Web app URL:

| Test | URL | You should see |
|---|---|---|
| Ping | `YOUR_URL?action=ping` | `{"ok":true,...}` |
| Tap | `YOUR_URL?action=tap&chip=ocd-kitchen&d=phone` | `{"ok":true,"url":"https://example.com/rebook"}` and a new row in Taps |
| Stats | `YOUR_URL?action=stats&property=ocd-001&days=30` | Totals, taps by chip, taps by day |

## Later: updating the code
When the code changes, paste the new version, save, then
**Deploy → Manage deployments → pencil icon → Version: New version → Deploy**.
That keeps the same URL.

## Cleanup before going live
Run **clearTestTaps** from the function dropdown to remove the fake taps.
