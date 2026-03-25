(function () {
  // Apply saved preference immediately to prevent flash of wrong theme
  var t = localStorage.getItem('hlp-theme');
  if (t === 'dark' || t === 'light') {
    document.documentElement.setAttribute('data-theme', t);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    function isDark() {
      var a = document.documentElement.getAttribute('data-theme');
      if (a === 'dark') return true;
      if (a === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('hlp-theme', next);
    });

    // Keep button label current when system preference changes (no manual override)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      // CSS handles icon swap; nothing extra needed here
    });
  });
})();
