// Outer Banks background photo + animated "Powered by ModernTap" blimp, for any element with data-beach-scene.
// The background image itself is set in css/beach.css (img/obx-*.webp / .jpg).
// Everything here is static artwork; no user data is ever inserted as HTML.
(function () {
  var LINES = [
    'Tap it. Love it. Book it again.',
    'Your next beach week is one tap away.',
    'No app. No QR code. No problem.',
    'Sandy feet welcome.',
    'Making the Outer Banks a little more tappable.',
    'Book next summer before the sunscreen dries.',
    'Wi-Fi password? Already tapped.',
  ];
  // Shorter lines for phones, so the whole blimp and banner fit on screen at once.
  var SHORT_LINES = ['Sandy feet welcome.', 'Tap it. Book it again.', 'Beach week, one tap away.', 'No app. No QR. No problem.'];

  // Nose points left, banner trails behind on the right, so it flies right-to-left.
  function blimpSvg() {
    return '<svg class="bb-svg" viewBox="0 0 520 92" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="bbBody" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#ece8df"/><stop offset="1" stop-color="#c9c2b4"/>' +
        '</linearGradient>' +
        '<linearGradient id="bbFin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8643c"/><stop offset="1" stop-color="#a8411f"/></linearGradient>' +
      '</defs>' +
      '<path class="bb-rope" d="M196 44 C214 48 226 50 238 50" stroke="#6d7a82" stroke-width="1.2" fill="none"/>' +
      '<path class="bb-banner" d="M238 32 h260 l-9 18 l9 18 h-260 z" fill="#fffaf0" stroke="#e3d3b2"/>' +
      '<text class="bb-line" x="250" y="55" font-size="15" font-weight="600" fill="#0b3a53"></text>' +
      '<path d="M176 40 l24 -20 q4 0 4 4 l-6 16 z M176 44 l24 20 q4 0 4 -4 l-6 -16 z" fill="url(#bbFin)"/>' +
      '<path d="M182 42 l22 -2 v4 z" fill="#a8411f"/>' +
      '<ellipse cx="100" cy="42" rx="92" ry="30" fill="url(#bbBody)" stroke="#bdb5a5" stroke-width="0.8"/>' +
      '<ellipse cx="78" cy="30" rx="56" ry="8" fill="#ffffff" opacity="0.6"/>' +
      '<path d="M84 70 h36 q4 0 3 4 l-3 6 h-36 l-3 -6 q-1 -4 3 -4 z" fill="#0b3a53"/>' +
      '<rect x="90" y="73" width="5" height="4" rx="1" fill="#bfe3f0"/><rect x="99" y="73" width="5" height="4" rx="1" fill="#bfe3f0"/><rect x="108" y="73" width="5" height="4" rx="1" fill="#bfe3f0"/>' +
      '<text x="100" y="47" text-anchor="middle" font-size="18" font-weight="700" fill="#0b3a53" letter-spacing="0.3">ModernTap</text>' +
      '<rect x="48" y="53" width="104" height="2.5" rx="1.2" fill="#c2502a"/>' +
    '</svg>';
  }

  // Size the banner to its text so nothing is cut off.
  function fitBanner(svg) {
    var text = svg.querySelector('.bb-line');
    var w = 0;
    try { w = text.getComputedTextLength(); } catch (e) { /* not rendered yet */ }
    if (!w) w = text.textContent.length * 8.2;
    var bannerW = Math.ceil(w + 26);
    svg.querySelector('.bb-banner').setAttribute('d', 'M238 32 h' + bannerW + ' l-9 18 l9 18 h-' + bannerW + ' z');
    svg.setAttribute('viewBox', '0 0 ' + (238 + bannerW + 6) + ' 92');
  }

  function draw(host) {
    if (host.dataset.drawn) return;
    host.dataset.drawn = '1';
    host.classList.add('beach-scene');
    var bg = document.createElement('div');
    bg.className = 'bs-bg';
    host.insertBefore(bg, host.firstChild);

    if (host.dataset.beachScene !== 'no-blimp') {
      var lane = document.createElement('div');
      lane.className = 'bb-lane';
      var blimp = document.createElement('div');
      blimp.className = 'bb';
      blimp.innerHTML = blimpSvg();
      var pool = window.innerWidth < 600 ? SHORT_LINES : LINES;
      blimp.querySelector('.bb-line').textContent =
        'Powered by ModernTap · ' + pool[Math.floor(Math.random() * pool.length)];
      lane.appendChild(blimp);
      bg.appendChild(lane);
      fitBanner(blimp.querySelector('svg'));
    }
  }

  function init() { document.querySelectorAll('[data-beach-scene]').forEach(draw); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.MTBeach = { draw: draw };
})();
