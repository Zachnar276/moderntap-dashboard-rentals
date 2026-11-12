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
    ['Demo data', 'Taps marked as demo were generated to show how the dashboard works. They are removed before plaques go into the houses.'],
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
