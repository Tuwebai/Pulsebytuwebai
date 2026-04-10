(function () {
  var root = document.documentElement;
  var savedTheme = null;

  try {
    savedTheme = localStorage.getItem('theme');
  } catch (error) {
    savedTheme = null;
  }

  var initialTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';

  root.style.colorScheme = initialTheme;
  root.classList.remove('light', 'dark');
  root.classList.add(initialTheme);

  window.__removePulseLoader = function () {
    var el = document.getElementById('pulse-loader');

    if (!el) {
      return;
    }

    el.classList.add('pulse-loader-exit');

    window.setTimeout(function () {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 300);
  };
})();
