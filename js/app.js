/* ============================================================
   BOOTSTRAP — mount the app, define logo spin
   ============================================================ */
(function (O) {
  "use strict";
  // slow ring spin
  var st = document.createElement("style");
  st.textContent = "@keyframes ocraSpin{to{transform:rotate(360deg)}}.ocra-spin{transform-origin:50% 50%;animation:ocraSpin 7s linear infinite}@media(prefers-reduced-motion:reduce){.ocra-spin{animation:none}}";
  document.head.appendChild(st);
  O.render();
})(window.OCRA);
