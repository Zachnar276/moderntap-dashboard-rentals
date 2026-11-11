// Outer Banks scene + "Powered by ModernTap" blimp, drawn into any element with data-beach-scene.
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

  var SCENE =
    '<svg class="bs-svg" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="bsSky" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#7fc8e2"/><stop offset="0.55" stop-color="#cdeef0"/><stop offset="1" stop-color="#fde6c8"/>' +
        '</linearGradient>' +
        '<linearGradient id="bsSea" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#2b8fb4"/><stop offset="1" stop-color="#16607f"/>' +
        '</linearGradient>' +
        '<linearGradient id="bsSand" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#f3e2c0"/><stop offset="1" stop-color="#e8d2a6"/>' +
        '</linearGradient>' +
        '<radialGradient id="bsSun"><stop offset="0" stop-color="#fff3c4"/><stop offset="0.6" stop-color="#f8cf6a"/><stop offset="1" stop-color="#f8cf6a" stop-opacity="0"/></radialGradient>' +
        '<pattern id="bsStripe" width="20" height="18" patternUnits="userSpaceOnUse"><rect width="20" height="9" fill="#fbfaf6"/><rect y="9" width="20" height="9" fill="#1d2a33"/></pattern>' +
      '</defs>' +
      '<rect width="1200" height="300" fill="url(#bsSky)"/>' +
      '<circle cx="1010" cy="118" r="90" fill="url(#bsSun)"/>' +
      '<circle cx="1010" cy="118" r="34" fill="#fbd979"/>' +
      // clouds
      '<g fill="#ffffff" opacity="0.85">' +
        '<path d="M120 70a22 22 0 0 1 40-10 18 18 0 0 1 32 8 16 16 0 0 1-2 32H128a16 16 0 0 1-8-30z"/>' +
        '<path d="M640 50a18 18 0 0 1 33-8 15 15 0 0 1 27 7 13 13 0 0 1-2 26h-52a13 13 0 0 1-6-25z" opacity="0.8"/>' +
        '<path d="M860 92a14 14 0 0 1 26-6 12 12 0 0 1 21 5 10 10 0 0 1-1 20h-41a10 10 0 0 1-5-19z" opacity="0.7"/>' +
      '</g>' +
      // lighthouse on the dunes
      '<g transform="translate(870 132)">' +
        '<path d="M14 0h20l7 92H7z" fill="url(#bsStripe)"/>' +
        '<rect x="10" y="-14" width="28" height="14" rx="2" fill="#1d2a33"/>' +
        '<rect x="14" y="-12" width="20" height="9" fill="#ffe7a1"/>' +
        '<path d="M12 -14h24l-12-12z" fill="#1d2a33"/>' +
        '<rect x="4" y="0" width="40" height="3" fill="#1d2a33"/>' +
      '</g>' +
      // ocean
      '<path d="M0 214 L1200 214 L1200 300 L0 300 Z" fill="url(#bsSea)"/>' +
      '<g class="bs-waves" fill="none" stroke="#e8f7fb" stroke-width="2" stroke-linecap="round" opacity="0.75">' +
        '<path d="M-20 228 q25 -7 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0"/>' +
        '<path d="M-45 246 q25 -7 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" opacity="0.6"/>' +
      '</g>' +
      // dunes + sea oats
      '<path d="M0 262 C120 238 220 236 330 252 C430 266 520 248 640 254 C780 262 900 240 1030 250 C1110 256 1160 262 1200 258 L1200 300 L0 300 Z" fill="url(#bsSand)"/>' +
      '<g stroke="#a98d54" stroke-width="2" fill="none" stroke-linecap="round">' +
        '<path d="M60 262 q4 -26 -6 -46"/><path d="M68 262 q2 -30 12 -48"/><path d="M76 262 q-2 -20 -14 -32"/>' +
        '<path d="M1110 258 q4 -24 -6 -42"/><path d="M1118 258 q2 -28 12 -44"/><path d="M1126 258 q-2 -18 -12 -30"/><path d="M900 250 q3 -20 -4 -34"/><path d="M907 250 q1 -22 9 -36"/>' +
        '<path d="M300 254 q3 -18 -4 -32"/><path d="M306 254 q1 -20 9 -34"/>' +
      '</g>' +
      '<g fill="#c7a660"><ellipse cx="54" cy="216" rx="3" ry="7"/><ellipse cx="80" cy="214" rx="3" ry="7"/><ellipse cx="1104" cy="216" rx="3" ry="7"/><ellipse cx="1130" cy="214" rx="3" ry="7"/></g>' +
    '</svg>';

  var BLIMP =
    '<svg class="bb-svg" viewBox="0 0 520 90" aria-hidden="true" focusable="false">' +
      // tow line + banner
      '<path d="M190 46 C220 50 240 52 262 52" stroke="#5b6b75" stroke-width="1.5" fill="none"/>' +
      '<path class="bb-banner" d="M262 34 h246 l-10 18 l10 18 h-246 z" fill="#fffaf0" stroke="#e7d7b6"/>' +
      '<text class="bb-line" x="272" y="56" font-size="15" font-weight="600" fill="#0b3a53"></text>' +
      // blimp body
      '<ellipse cx="100" cy="40" rx="90" ry="30" fill="#f6f2ea" stroke="#d8cfbf"/>' +
      '<path d="M18 30 q82 -30 164 0" stroke="#e6ddcd" fill="none"/>' +
      '<path d="M182 30 l26 -18 v20z M182 50 l26 18 v-20z" fill="#c2502a"/>' +
      '<rect x="78" y="66" width="44" height="12" rx="5" fill="#0b3a53"/>' +
      '<text x="100" y="45" text-anchor="middle" font-size="17" font-weight="700" fill="#0b3a53" letter-spacing="0.3">ModernTap</text>' +
      '<rect x="44" y="51" width="112" height="3" rx="1.5" fill="#c2502a"/>' +
    '</svg>';

  function draw(host) {
    if (host.dataset.drawn) return;
    host.dataset.drawn = '1';
    host.classList.add('beach-scene');
    var bg = document.createElement('div');
    bg.className = 'bs-bg';
    bg.innerHTML = SCENE;
    host.insertBefore(bg, host.firstChild);

    if (host.dataset.beachScene !== 'no-blimp') {
      var blimp = document.createElement('div');
      blimp.className = 'bb';
      blimp.innerHTML = BLIMP;
      blimp.querySelector('.bb-line').textContent = 'Powered by ModernTap · ' + LINES[Math.floor(Math.random() * LINES.length)];
      bg.appendChild(blimp);
    }
  }

  function init() { document.querySelectorAll('[data-beach-scene]').forEach(draw); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.MTBeach = { draw: draw };
})();
