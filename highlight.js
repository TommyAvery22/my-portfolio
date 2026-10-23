// Highlighter sweep for the home page intro.
// The highlighted sentence is split into words. Each word's orange highlight grows from left to right,
// one word after another, so the sweep travels along a row and then drops to the next row, like a highlighter pen.
//  - The whole sweep eases in and out (slow start, fast middle, long gentle finish).
//  - It waits a second after the page loads before it begins.
//  - It pauses briefly each time it moves down to the next row.
//  - It plays when the visitor arrives at the page (including coming back with the back button), and only
//    once the tab is visible. It doesn't replay on resize or scrolling.
// (Without JavaScript, or with "reduce motion" turned on, the highlight just shows normally.)
(function () {
  var els = document.querySelectorAll('.hl');
  if (!els.length) return;

  var START = 1;        // seconds to wait after the page loads before the sweep begins
  var DURATION = 2.8;   // seconds the sweep itself takes, from the first word to the last (not counting row pauses). Bigger is slower.
  var ROW_PAUSE = 0.45; // extra seconds to wait each time the highlighter drops to the next row

  // Ease in and out: slow at the start, fastest in the middle, and a long, gentle slowdown at the end.
  // This is a standard "cubic-bezier" easing curve, worked backwards: given how far along the text we are
  // (0 to 1), timeAt() returns the moment in time (0 to 1) that the highlighter reaches that point.
  //   EASE_START: bigger = a longer, slower start.   EASE_END: smaller = a longer, slower finish.
  var EASE_START = 0.6;
  var EASE_END = 0.35;

  var timeAt = (function () {
    function x(s) { var m = 1 - s; return 3 * m * m * s * EASE_START + 3 * m * s * s * EASE_END + s * s * s; }  // time along the curve
    function y(s) { var m = 1 - s; return 3 * m * s * s + s * s * s; }                                          // progress along the curve
    return function (progress) {
      var p = Math.min(1, Math.max(0, progress));
      var lo = 0, hi = 1;
      for (var i = 0; i < 40; i++) {            // find the point on the curve where progress equals p
        var mid = (lo + hi) / 2;
        if (y(mid) < p) lo = mid; else hi = mid;
      }
      return x((lo + hi) / 2);
    };
  })();

  Array.prototype.forEach.call(els, function (el) {
    // Split the sentence into words; the space after a word belongs to it, so the highlight is continuous
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    var parts = text.split(' ');
    el.textContent = '';
    parts.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'hl-word';
      span.textContent = word + (i < parts.length - 1 ? ' ' : '');
      el.appendChild(span);
    });
    el.classList.add('is-animated');

    var words = el.querySelectorAll('.hl-word');

    // Work out which row each word is on, and give the first and last word of each row a little padding.
    // Returns the row number (0, 1, 2...) of every word.
    function measureRows() {
      var rows = [];
      var row = -1;
      var prevTop = null;
      var i;
      for (i = 0; i < words.length; i++) words[i].classList.remove('row-start', 'row-end');
      for (i = 0; i < words.length; i++) {
        var top = words[i].offsetTop;
        if (prevTop === null || Math.abs(top - prevTop) > 2) {
          row++;
          words[i].classList.add('row-start');
          if (i > 0) words[i - 1].classList.add('row-end');
        }
        rows.push(row);
        prevTop = top;
      }
      if (words.length) words[words.length - 1].classList.add('row-end');
      return rows;
    }

    // Set each word's timing: eased across the sentence, plus a pause at every new row
    function schedule() {
      var rows = measureRows();
      var total = text.length;
      var chars = 0;
      for (var i = 0; i < words.length; i++) {
        var len = words[i].textContent.length;
        var t0 = timeAt(chars / total);            // when the highlighter reaches the start of this word
        var t1 = timeAt((chars + len) / total);    // and when it reaches the end
        var delay = START + DURATION * t0 + rows[i] * ROW_PAUSE;
        words[i].style.setProperty('--delay', delay.toFixed(3) + 's');
        words[i].style.setProperty('--dur', (DURATION * (t1 - t0)).toFixed(3) + 's');
        chars += len;
      }
    }

    // Play the sweep from the start (rows are measured first, so the pauses match what the visitor sees)
    function play() {
      schedule();
      el.classList.remove('play');
      void el.offsetWidth;                 // restart the animation
      el.classList.add('play');
    }

    function whenVisible(fn) {
      if (document.visibilityState === 'visible') { fn(); return; }
      document.addEventListener('visibilitychange', function handler() {
        if (document.visibilityState === 'visible') {
          document.removeEventListener('visibilitychange', handler);
          fn();
        }
      });
    }

    measureRows();
    // "pageshow" fires when the page is first shown, and again when the visitor returns to it via back/forward
    window.addEventListener('pageshow', function () { whenVisible(play); });

    // On resize, only the row padding is re-measured. The timings are left alone, so nothing replays.
    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(measureRows, 100);
    });
  });
})();
