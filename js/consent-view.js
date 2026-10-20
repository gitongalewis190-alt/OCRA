/* Cookies policy page: show the stored choice without setting anything. */
(function () {
  "use strict";
  var el = document.getElementById("analytics-state");
  if (!el) return;
  var choice = null;
  try { choice = JSON.parse(localStorage.getItem("ocra_consent")); } catch (e) {}
  if (choice && choice.analytics) { el.textContent = "ON"; el.style.color = "#0E6BA8"; }
  else if (choice) { el.textContent = "OFF"; el.style.color = "#4a5a6b"; }
})();
