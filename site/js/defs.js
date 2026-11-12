// "How these numbers are counted": one shared explanation for every dashboard page.
// Fills any element with data-defs. Static text only.
(function () {
  var ITEMS = [
    ['Rebooking taps', 'A guest tapped a plaque set to open the rebooking link (for example, the kitchen plaque). It shows interest, not a booking.'],
    ['Potential rebooks (clicks)', 'A guest pressed “Choose your dates” and was sent to the house’s Twiddy page. It is the strongest sign of intent we can see; the booking itself happens on Twiddy.'],
    ['Confirmed rebookings', 'Not shown yet. Counting real bookings needs booking data from Twiddy.'],
    ['Total taps', 'Every plaque tap at the house, whatever the plaque opens.'],
    ['Repeats', 'The same phone tapping the same plaque within 30 minutes counts once (clicks: within 10 minutes), so numbers aren’t inflated by refreshes or double taps.'],
    ['“vs previous period”', 'Compared with the same number of days just before the period you picked.'],
    ['Average per house', 'All rebooking taps divided by the number of houses you can see. Bigger houses usually get more taps; per-stay comparisons need occupancy data from Twiddy.'],
    ['Plaque alerts', '“Not being used” means no taps in 14+ days while the house’s other plaques were used (it may be broken, covered or removed). “Low use” means it gets under a quarter of the taps of the house’s typical plaque. Nothing is flagged when a house is empty, or during a plaque’s first 14 days.'],
    ['Guest self-help', 'How-to, Wi-Fi and guidebook plaques ask guests “Did this solve it?”. “I figured it out” counts as a call or work order that likely didn’t happen; “I still need help” shows Twiddy’s guest services number and counts as a likely work order. Answering is optional, so these are estimates from the guests who answered. The same phone answering again within a day counts once.'],
    ['Areas', 'Houses are grouped by town (for example Duck or Corolla). Pick an area to see only those houses; every number on the page updates.'],
    ['Taps per plaque', 'Taps divided by how many plaques of that kind the house has. It is the fairer way to compare houses with different numbers of plaques.'],
    ['Timeline notes', 'Short notes from ModernTap, Twiddy or the manager (for example, “plaque moved”) shown as ▼ markers on the daily chart, so changes in the numbers have context.'],
    ['Demo data', 'Taps and guest answers marked as demo were generated to show how the dashboard works. They are removed before plaques go into the houses.'],
  ];

  function render(host) {
    var d = document.createElement('details');
    d.className = 'defs card';
    var s = document.createElement('summary');
    s.textContent = 'How these numbers are counted';
    d.appendChild(s);
    var dl = document.createElement('dl');
    ITEMS.forEach(function (it) {
      var dt = document.createElement('dt'); dt.textContent = it[0];
      var dd = document.createElement('dd'); dd.textContent = it[1];
      dl.appendChild(dt); dl.appendChild(dd);
    });
    d.appendChild(dl);
    var p = document.createElement('p');
    p.className = 'hint';
    p.appendChild(document.createTextNode('What guests’ phones share with us: '));
    var a = document.createElement('a');
    a.href = '/privacy.html';
    a.textContent = 'guest privacy';
    p.appendChild(a);
    p.appendChild(document.createTextNode('.'));
    d.appendChild(p);
    host.appendChild(d);
  }

  function init() { document.querySelectorAll('[data-defs]').forEach(render); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
