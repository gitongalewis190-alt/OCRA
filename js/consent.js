/* ============================================================
   COOKIE / TRACKING CONSENT
   Loaded as a normal file so the Content-Security-Policy can stay
   script-src 'self' with no 'unsafe-inline'.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "ocra_consent";
  var banner = document.getElementById("ocra-cookie");
  var SIX_MONTHS = 180 * 24 * 60 * 60 * 1000;

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function write(value) {
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch (e) {}
  }
  function isStale(choice) {
    if (!choice || !choice.at) return true;
    return Date.now() - new Date(choice.at).getTime() > SIX_MONTHS;
  }

  var existing = read();
  if (banner && (!existing || isStale(existing))) banner.classList.add("show");

  if (banner) {
    banner.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cookie]");
      if (!btn) return;
      var action = btn.getAttribute("data-cookie");
      if (action === "manage") { window.location.href = "./legal/cookies.html"; return; }
      write({
        essential: true,
        analytics: action === "accept",
        at: new Date().toISOString(),
        version: 1
      });
      banner.classList.remove("show");
      if (action === "accept" && window.OCRAAnalytics) window.OCRAAnalytics.enable();
    });
  }

  // Analytics stays off until enable() is called with a stored "accept".
  window.OCRAAnalytics = {
    enabled: false,
    enable: function () { this.enabled = true; },
    track: function (event, props) {
      if (!this.enabled) return;
      // WIRE: POST /api/analytics/event with no personal identifiers.
      if (window.console && console.debug) console.debug("[analytics]", event, props || {});
    }
  };

  var choice = read();
  if (choice && choice.analytics === true) window.OCRAAnalytics.enable();
})();
