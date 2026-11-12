// House switcher: a dropdown with "All houses" + every house the signed-in user can see.
// Fills <select data-house-switcher data-current="all|PROPERTY_ID">. Picking one navigates there,
// keeping the selected date range.
(function () {
  function days() {
    var d = Number(new URLSearchParams(location.search).get('days'));
    return [7, 30, 90].indexOf(d) >= 0 ? d : 30;
  }

  function fill(select, houses) {
    var current = select.dataset.current || 'all';
    select.textContent = '';
    var all = document.createElement('option');
    all.value = 'all';
    all.textContent = 'All houses (' + houses.length + ')';
    select.appendChild(all);
    houses.slice().sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); }).forEach(function (h) {
      var o = document.createElement('option');
      o.value = h.id;
      o.textContent = h.name;
      select.appendChild(o);
    });
    select.value = houses.some(function (h) { return h.id === current; }) ? current : 'all';
    select.disabled = false;
    if (!select.dataset.bound) {
      select.dataset.bound = '1';
      select.addEventListener('change', function () {
        location.href = select.value === 'all'
          ? '/dashboard.html?days=' + days()
          : '/property.html?p=' + encodeURIComponent(select.value) + '&days=' + days();
      });
    }
  }

  /** Fill every switcher on the page. Pass a house list if you already have one; otherwise it is fetched. */
  function populate(houses) {
    var selects = document.querySelectorAll('select[data-house-switcher]');
    if (!selects.length) return;
    if (houses) { selects.forEach(function (s) { fill(s, houses); }); return; }
    MTAuth.api('houses').then(function (d) {
      if (d.ok) selects.forEach(function (s) { fill(s, d.houses); });
    });
  }

  window.MTSwitcher = { populate: populate };
})();
