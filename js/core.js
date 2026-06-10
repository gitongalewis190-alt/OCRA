/* ============================================================
   DOMAIN_01 — PLATFORM CORE
   Global state, router, render bus, helpers, SVG charts, logo.
   Other divisions register screen renderers on OCRA.screens.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  // ---- global state (single source of truth) ----
  O.state = {
    phase: "intro",          // intro | choose | account | auth | dash
    account: "personal",     // personal | family | organization
    authMode: "login",       // login | signup
    signupStage: 1,          // 1..4
    dash: "personal",        // personal | family | organization | developer
    form: {},                // collected signup fields
    user: null,              // logged-in user
  };

  O.screens = {};            // phase -> render() ; filled by other modules
  O.dashboards = {};         // type  -> render()

  // ---- router / render bus ----
  O.go = function (patch) {
    Object.assign(O.state, patch || {});
    O.render();
  };

  O.render = function () {
    var s = O.state, app = document.getElementById("app");
    if (!app) return;                 // DOM not ready / mount point missing
    try {
      var html = "";
      if (s.phase === "dash") {
        var dark = s.dash === "developer";
        html =
          '<div class="stage' + (dark ? " dark" : "") + '">' +
            O.topbar(s.dash, dark) +
            (O.dashboards[s.dash] ? O.dashboards[s.dash]() : "") +
            '<div style="text-align:center;margin-top:22px">' +
              '<button class="btn' + (dark ? " dark" : "") + '" data-action="restart" style="font-size:11px">&larr; Restart flow</button>' +
            '</div>' +
          '</div>';
      } else {
        var fn = O.screens[s.phase];
        html = '<div class="stage">' + (fn ? fn() : "") + '</div>';
      }
      app.innerHTML = html;
      O.bindHold();   // (re)attach the hidden developer hold-to-reveal
    } catch (err) {
      O.fail(err);    // never leave the user staring at a blank page
    }
  };

  // ---- last-resort error surface: a visible banner beats a white screen ----
  O.fail = function (err) {
    try { if (window.console && console.error) console.error("[OCRA]", err); } catch (e) {}
    var app = document.getElementById("app");
    if (!app) return;
    var detail = O.esc(err && err.message ? err.message : String(err || "Unknown error"));
    app.innerHTML =
      '<div role="alert" style="max-width:520px;margin:14vh auto;padding:28px;border-radius:16px;' +
        'font-family:-apple-system,system-ui,sans-serif;background:#fff;color:#103A55;' +
        'box-shadow:0 8px 30px rgba(31,72,110,.18);text-align:center">' +
        '<div style="font-size:34px;margin-bottom:8px">&#9888;</div>' +
        '<h1 style="font-size:18px;margin:0 0 8px">OCRA hit a snag</h1>' +
        '<p style="font-size:13px;color:#5B7689;margin:0 0 18px">The screen could not be rendered. ' +
          'Your data is safe &mdash; try restarting the flow.</p>' +
        '<pre style="font-size:11px;color:#FF3B30;background:#fff5f5;border-radius:8px;' +
          'padding:10px;overflow:auto;text-align:left;margin:0 0 18px">' + detail + '</pre>' +
        '<button onclick="OCRA.go({phase:\'intro\',signupStage:1,form:{}})" ' +
          'style="padding:12px 24px;border:none;border-radius:999px;background:#0E6BA8;' +
          'color:#fff;font-weight:700;cursor:pointer">Restart OCRA</button>' +
      '</div>';
  };

  // ---- delegated actions: any [data-action] element routes here ----
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action]");
    if (!t) return;
    var a = t.getAttribute("data-action");
    var v = t.getAttribute("data-value");
    switch (a) {
      case "diveIn":      return O.go({ phase: "choose" });
      case "academics":   return O.go({ phase: "account" });
      case "pickAccount": return O.go({ account: v });
      case "accountNext": return O.go({ phase: "auth", authMode: "login" });
      case "setAuthMode": return O.go({ authMode: v, signupStage: 1 });
      case "login":       return O.identity.login(t);
      case "signupNext":  return O.identity.signupNext();
      case "signupBack":  return O.identity.signupBack();
      case "signupField": return; // handled live by inputs
      case "enterDash":   return O.go({ phase: "dash", dash: O.state.account });
      case "switchDash":  return O.go({ dash: v });
      case "restart":     return O.go({ phase: "intro", signupStage: 1, form: {} });
      default: return;
    }
  });

  // capture input changes into form state
  document.addEventListener("input", function (e) {
    var f = e.target.getAttribute && e.target.getAttribute("data-field");
    if (f) O.state.form[f] = e.target.value;
  });

  // ---- helpers ----
  O.esc = function (x) {
    return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  O.dot = function (c) { return '<span class="dot" style="background:' + c + '"></span>'; };

  // ---- rotating ring logo (drop your real OCRA logo into ./assets and swap this) ----
  O.logo = function (size, dark) {
    var stroke = dark ? "rgba(255,255,255,.85)" : "#0E6BA8";
    var spin = dark ? "rgba(56,189,248,.6)" : "#38BDF8";
    return '' +
    '<span style="position:relative;display:inline-block;width:' + size + 'px;height:' + size + 'px;vertical-align:middle">' +
      '<svg class="ocra-spin" width="' + size + '" height="' + size + '" viewBox="0 0 100 100" style="position:absolute;inset:0">' +
        '<circle cx="50" cy="50" r="46" fill="none" stroke="' + stroke + '" stroke-width="3" stroke-dasharray="200 90" stroke-linecap="round"/>' +
        '<circle cx="50" cy="50" r="46" fill="none" stroke="' + spin + '" stroke-width="3" stroke-dasharray="40 250" stroke-linecap="round"/>' +
      '</svg>' +
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" style="position:absolute;inset:0">' +
        '<circle cx="50" cy="50" r="34" fill="none" stroke="' + stroke + '" stroke-width="1.5" opacity=".55"/>' +
        '<circle cx="50" cy="50" r="8" fill="' + stroke + '"/>' +
      '</svg>' +
    '</span>';
  };

  // ---- tiny dependency-free SVG charts ----
  O.lineChart = function (series, opts) {
    opts = opts || {}; var w = 320, h = 170, pad = 22, max = 100, min = 40;
    var n = series[0].data.length;
    var x = function (i) { return pad + (i * (w - pad * 2)) / (n - 1); };
    var y = function (v) { return h - pad - ((v - min) / (max - min)) * (h - pad * 2); };
    var grid = "";
    for (var g = 0; g <= 4; g++) { var gy = pad + (g * (h - pad * 2)) / 4; grid += '<line x1="' + pad + '" y1="' + gy + '" x2="' + (w - pad) + '" y2="' + gy + '" stroke="' + (opts.dark ? "rgba(255,255,255,.08)" : "rgba(16,58,85,.08)") + '"/>'; }
    var lines = series.map(function (s) {
      var pts = s.data.map(function (v, i) { return x(i) + "," + y(v); }).join(" ");
      return '<polyline points="' + pts + '" fill="none" stroke="' + s.color + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    }).join("");
    var labels = series[0].labels.map(function (l, i) {
      return '<text x="' + x(i) + '" y="' + (h - 5) + '" font-size="9" text-anchor="middle" fill="' + (opts.dark ? "rgba(220,232,242,.6)" : "#5B7689") + '">' + O.esc(l) + '</text>';
    }).join("");
    return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '">' + grid + lines + labels + '</svg>';
  };

  O.barChart = function (groups) {
    var w = 300, h = 160, pad = 24, max = 18;
    var gw = (w - pad * 2) / groups.length, bw = gw / 4;
    var bars = "";
    groups.forEach(function (grp, gi) {
      var bx = pad + gi * gw + bw / 2;
      [["Top", "#0A84FF"], ["Moderate", "#34C759"], ["Poor", "#FF3B30"]].forEach(function (b, bi) {
        var val = grp[b[0]]; var bh = (val / max) * (h - pad * 2);
        bars += '<rect x="' + (bx + bi * bw) + '" y="' + (h - pad - bh) + '" width="' + (bw - 3) + '" height="' + bh + '" rx="3" fill="' + b[1] + '"/>';
      });
      bars += '<text x="' + (pad + gi * gw + gw / 2) + '" y="' + (h - 6) + '" font-size="9" text-anchor="middle" fill="#5B7689">' + O.esc(grp.t) + '</text>';
    });
    return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '">' + bars + '</svg>';
  };

  // ---- mock analytics data (replaced by Analytics Engine later) ----
  O.data = {
    growth: { labels: ["Term 1", "Term 2", "Term 3"], sci: [55, 68, 74], hum: [48, 60, 71], all: [52, 65, 73] },
    termBars: [
      { t: "Term 1", Top: 11, Moderate: 8, Poor: 3 },
      { t: "Term 2", Top: 13, Moderate: 9, Poor: 4 },
      { t: "Term 3", Top: 15, Moderate: 10, Poor: 2 },
    ],
  };

  // ---- topbar (shared across dashboards) ----
  O.topbar = function (dash, dark) {
    var who = { personal: "Mr. Lees.", family: "The Lees", organization: "OCRA Org Dashboard", developer: "Developer Console" }[dash];
    var types = ["personal", "family", "organization", "developer"];
    var sw = types.map(function (k) {
      return '<button class="btn' + (dash === k ? " on" : "") + '" data-action="switchDash" data-value="' + k + '">' +
        k.charAt(0).toUpperCase() + k.slice(1) + '</button>';
    }).join("");
    return '' +
    '<div class="topbar">' +
      '<div class="' + (dark ? "dglass" : "pill") + '" style="padding:8px 16px;display:flex;gap:10px;align-items:center">' +
        '<span style="font-size:18px">&#9776;</span><b style="font-weight:700">' + O.esc(who) + '</b>' +
      '</div>' +
      '<div class="brand">' + O.logo(40, dark) + '<b>OCRA</b></div>' +
      '<div class="' + (dark ? "dglass" : "pill") + '" style="padding:8px 16px;display:flex;gap:8px;align-items:center">' +
        '<span style="font-size:16px">&#9881;</span><b style="font-weight:700">Settings</b>' +
      '</div>' +
      '<div class="switcher">' + sw + '</div>' +
    '</div>';
  };

})(window.OCRA);
