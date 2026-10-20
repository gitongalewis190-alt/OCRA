/* ============================================================
   BOOTSTRAP · mount the app, define logo spin
   ============================================================ */
(function (O) {
  "use strict";

  // Surface any uncaught error as a banner instead of a silent blank page.
  window.addEventListener("error", function (e) {
    if (O && O.fail) O.fail(e.error || e.message);
  });
  window.addEventListener("unhandledrejection", function (e) {
    if (O && O.fail) O.fail((e.reason && e.reason.message) || e.reason);
  });

  // Bail loudly if a core module failed to load (the exact failure mode that
  // broke the live site: scripts that never defined the OCRA API).
  if (!O || typeof O.render !== "function") {
    document.body.innerHTML =
      '<div role="alert" style="max-width:520px;margin:14vh auto;padding:28px;text-align:center;' +
      'font-family:system-ui,sans-serif;color:#103A55">OCRA failed to load its core scripts. ' +
      'Check that js/core.js, identity.js, screens.js and dashboards.js are valid JavaScript.</div>';
    return;
  }

  // slow ring spin
  var st = document.createElement("style");
  st.textContent = "@keyframes ocraSpin{to{transform:rotate(360deg)}}.ocra-spin{transform-origin:50% 50%;animation:ocraSpin 7s linear infinite}@media(prefers-reduced-motion:reduce){.ocra-spin{animation:none}}";
  document.head.appendChild(st);

  O.render();
})(window.OCRA);
