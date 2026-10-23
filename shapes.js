// Gives every button its own slightly different "hand-drawn" corner shape.
// Each shape is a small variation on the base shape below, so they look related but never identical.
// The variation is worked out from the button's own text and position, so a given button keeps the
// same shape every time the page loads (nothing jumps around on refresh).
(function () {
  var BASE_H = [28, 14, 26, 18];   // horizontal radii: top-left, top-right, bottom-right, bottom-left
  var BASE_V = [18, 26, 14, 28];   // vertical radii, same order
  var SPREAD = 6;                  // how far (in px) each corner can drift from the base shape
  var MIN = 8;                     // never let a corner get sharper than this

  // Small seeded random number generator, so the same seed always gives the same shape
  function seededRandom(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function wobble(base, rand) {
    return Math.max(MIN, Math.round(base + (rand() * 2 - 1) * SPREAD));
  }

  var buttons = document.querySelectorAll('.btn');
  for (var i = 0; i < buttons.length; i++) {
    var b = buttons[i];
    var rand = seededRandom(hash((b.textContent || '').trim() + '|' + (b.getAttribute('href') || '') + '|' + i));
    var h = [], v = [];
    for (var k = 0; k < 4; k++) { h.push(wobble(BASE_H[k], rand)); v.push(wobble(BASE_V[k], rand)); }
    b.style.borderRadius = h.join('px ') + 'px / ' + v.join('px ') + 'px';
  }
})();
