// Custom cursor: a "PLAY" circle that follows the mouse over video thumbnails.
// The normal cursor returns over the bottom strip of the video so the controls stay usable.
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.textContent = 'Play';
  document.body.appendChild(cursor);

  var CONTROLS_ZONE = 64; // px at the bottom of a video left to the normal cursor

  document.querySelectorAll('.media video').forEach(function (video) {
    video.addEventListener('mousemove', function (e) {
      var rect = video.getBoundingClientRect();
      var overControls = e.clientY > rect.bottom - CONTROLS_ZONE;
      if (overControls) {
        video.style.cursor = 'auto';
        cursor.classList.remove('on');
        return;
      }
      video.style.cursor = 'none';
      cursor.textContent = video.paused ? 'Play' : 'Pause';
      cursor.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px) scale(1)';
      cursor.classList.add('on');
    });
    video.addEventListener('mouseleave', function () {
      cursor.classList.remove('on');
      video.style.cursor = '';
    });
  });
})();
