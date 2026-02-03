/**
 * Theme Toggle with Cookie Persistence
 * เก็บค่าธีมไว้ในคุกกี้เพื่อจำการตั้งค่าของผู้ใช้
 */
(function () {
  // Cookie utility functions
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
  }

  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function checkCookieConsent() {
    return getCookie("cookie_consent") === "accepted";
  }

  // Theme management
  var toggleButton = document.getElementById("theme-toggle");
  var text = document.getElementById("theme-text");
  var body = document.body;

  // Load saved theme from cookie (only if consent given)
  var savedTheme = checkCookieConsent() ? getCookie("theme") : null;
  var isNight = savedTheme === "night";

  function applyTheme() {
    body.dataset.theme = isNight ? "night" : "day";
    if (text) {
      text.textContent = "";
    }

    // Save to cookie only if consent given
    if (checkCookieConsent()) {
      setCookie("theme", isNight ? "night" : "day", 365);
    }
  }

  if (toggleButton) {
    toggleButton.addEventListener("click", function () {
      isNight = !isNight;
      applyTheme();
    });
  }

  // Apply theme on load
  applyTheme();

  // Expose function to update theme after consent
  window.applyThemeFromCookie = function () {
    var savedTheme = getCookie("theme");
    if (savedTheme) {
      isNight = savedTheme === "night";
      applyTheme();
    }
  };
})();
