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
  // Shorter lines for phones, so the whole blimp and banner fit on screen at once.
  var SHORT_LINES = ['Sandy feet welcome.', 'Tap it. Book it again.', 'Beach week, one tap away.', 'No app. No QR. No problem.'];

  // Stripe bands for the lighthouse, built once.
  var bands = '';
  for (var i = 0; i < 6; i++) bands += '<rect x="-20" y="' + (i * 18 + 9) + '" width="80" height="9" fill="#1c262d"/>';

  var SCENE =
    '<svg class="bs-svg" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="bsSky" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#8fcbe3"/><stop offset="0.5" stop-color="#c9e6ee"/>' +
          '<stop offset="0.72" stop-color="#eef1e8"/><stop offset="0.8" stop-color="#f6e6cf"/>' +
        '</linearGradient>' +
        '<linearGradient id="bsSea" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#2f7b97"/><stop offset="0.35" stop-color="#3b93ad"/>' +
          '<stop offset="0.75" stop-color="#5fb4c0"/><stop offset="1" stop-color="#9fd6cf"/>' +
        '</linearGradient>' +
        '<linearGradient id="bsWet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9c49b"/><stop offset="1" stop-color="#e6d3ad"/></linearGradient>' +
        '<linearGradient id="bsDuneBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ead8b4"/><stop offset="1" stop-color="#dcc595"/></linearGradient>' +
        '<linearGradient id="bsDune" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2e3c4"/><stop offset="1" stop-color="#e2cb9c"/></linearGradient>' +
        '<linearGradient id="bsTower" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.18"/><stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/></linearGradient>' +
        '<radialGradient id="bsSun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6dc" stop-opacity="0.95"/><stop offset="0.25" stop-color="#fde7b0" stop-opacity="0.55"/><stop offset="1" stop-color="#fde7b0" stop-opacity="0"/></radialGradient>' +
        '<filter id="bsSoft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>' +
        '<filter id="bsHaze" x="-5%" y="-50%" width="110%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>' +
        '<clipPath id="bsTowerClip"><path d="M3 0 h22 l5 104 h-32 z"/></clipPath>' +
      '</defs>' +
      '<rect width="1200" height="300" fill="url(#bsSky)"/>' +
      // soft sun glow, not a cartoon disc
      '<circle cx="1000" cy="110" r="150" fill="url(#bsSun)"/>' +
      '<circle cx="1000" cy="110" r="22" fill="#fff8e6" opacity="0.9" filter="url(#bsHaze)"/>' +
      // soft clouds
      '<g fill="#ffffff" filter="url(#bsSoft)">' +
        '<g opacity="0.85"><ellipse cx="170" cy="78" rx="70" ry="16"/><ellipse cx="150" cy="68" rx="32" ry="18"/><ellipse cx="190" cy="64" rx="28" ry="16"/></g>' +
        '<g opacity="0.6"><ellipse cx="640" cy="52" rx="60" ry="12"/><ellipse cx="625" cy="45" rx="24" ry="12"/></g>' +
        '<g opacity="0.55"><ellipse cx="820" cy="110" rx="46" ry="9"/><ellipse cx="808" cy="104" rx="18" ry="9"/></g>' +
      '</g>' +
      // ocean: darker at the horizon, turquoise near shore
      '<rect y="208" width="1200" height="92" fill="url(#bsSea)"/>' +
      '<rect y="206" width="1200" height="5" fill="#eaf3ef" opacity="0.55" filter="url(#bsHaze)"/>' +
      '<g class="bs-waves" fill="none" stroke="#f4fbfb" stroke-linecap="round">' +
        '<path d="M-60 222 q30 -3 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke-width="1" opacity="0.35"/>' +
        '<path d="M-80 236 q35 -5 70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0 t70 0" stroke-width="1.5" opacity="0.45"/>' +
      '</g>' +
      // shoreline foam + wet sand
      '<path d="M0 252 C120 247 240 255 380 250 C520 245 650 254 800 249 C950 244 1080 253 1200 248 L1200 262 L0 262 Z" fill="url(#bsWet)"/>' +
      '<path class="bs-foam" d="M0 251 C120 246 240 254 380 249 C520 244 650 253 800 248 C950 243 1080 252 1200 247" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.85"/>' +
      // back dune + lighthouse standing on it
      '<path d="M700 262 C760 236 830 226 900 228 C960 230 1010 240 1060 250 L1060 262 Z" fill="url(#bsDuneBack)"/>' +
      '<g transform="translate(878 120)">' +
        '<g clip-path="url(#bsTowerClip)"><rect x="-4" y="0" width="40" height="110" fill="#f7f4ec"/>' + bands +
        '<rect x="-4" y="0" width="40" height="110" fill="url(#bsTower)"/></g>' +
        '<rect x="-1" y="-4" width="30" height="5" rx="1" fill="#1c262d"/>' +
        '<rect x="5" y="-17" width="18" height="13" fill="#1c262d"/>' +
        '<rect x="8" y="-15" width="12" height="9" fill="#ffe9a8"/>' +
        '<path d="M3 -17 h22 l-11 -10 z" fill="#1c262d"/>' +
        '<rect x="13" y="-31" width="2" height="5" fill="#1c262d"/>' +
      '</g>' +
      // front dunes, dune fence, sea oats
      '<path d="M0 270 C110 250 210 247 320 258 C420 268 520 255 640 260 C780 266 900 250 1030 258 C1110 263 1160 268 1200 266 L1200 300 L0 300 Z" fill="url(#bsDune)"/>' +
      '<g stroke="#8a7350" stroke-width="2" stroke-linecap="round" opacity="0.8">' +
        '<path d="M430 266 v-16 M440 266 v-17 M450 265 v-17 M460 265 v-16 M470 264 v-16 M480 264 v-15 M490 264 v-15 M500 263 v-15"/>' +
        '<path d="M428 254 L502 251" stroke-width="1.2"/>' +
      '</g>' +
      '<g stroke="#9c8656" stroke-width="1.4" fill="none" stroke-linecap="round">' +
        '<path d="M58 266 q3 -24 -5 -44"/><path d="M64 266 q1 -28 10 -46"/><path d="M70 266 q-1 -20 -11 -32"/><path d="M76 267 q4 -18 12 -26"/>' +
        '<path d="M1104 266 q3 -22 -5 -40"/><path d="M1110 266 q1 -26 10 -42"/><path d="M1116 266 q-1 -18 -10 -28"/>' +
        '<path d="M296 260 q2 -16 -4 -30"/><path d="M302 260 q1 -18 8 -32"/><path d="M308 260 q-1 -12 -8 -20"/>' +
        '<path d="M612 262 q2 -14 -4 -24"/><path d="M618 262 q1 -16 7 -26"/>' +
      '</g>' +
      '<g fill="#b39a62">' +
        '<ellipse cx="53" cy="223" rx="2.2" ry="6"/><ellipse cx="74" cy="221" rx="2.2" ry="6"/><ellipse cx="1099" cy="227" rx="2.2" ry="6"/>' +
        '<ellipse cx="1120" cy="225" rx="2.2" ry="6"/><ellipse cx="310" cy="229" rx="2" ry="5"/><ellipse cx="625" cy="237" rx="2" ry="5"/>' +
      '</g>' +
    '</svg>';

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
    bg.innerHTML = SCENE;
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
