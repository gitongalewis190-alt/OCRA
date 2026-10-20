/* ============================================================
   DEVELOPER CONSOLE MODULE
   Lewis Gitonga · highest hierarchy, no payment required.
   Feature flags, API key manager, usage stats, theme editor,
   module health monitor, audit log viewer.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  var DC = (O.developerConsole = {});

  // ---- FEATURE FLAGS ----
  DC.flags = {
    aiInsightsEnabled:    true,
    paymentGateEnabled:   true,
    analyticsEnabled:     true,
    intakeFormEnabled:    true,
    pdfExportEnabled:     true,
    devBypassPayment:     true,
    debugMode:            false,
    showAuditLog:         false,
    introBackground:      "dark",     // "dark" | "black" | "light"
    introPreset:          "stellar",  // "stellar" | "surge" | "drift" | "neon" | "minimal"
  };

  // restore persisted intro background choice
  try {
    var _saved = localStorage.getItem("ocra_introBackground");
    if (_saved === "dark" || _saved === "black" || _saved === "light") {
      DC.flags.introBackground = _saved;
    }
  } catch (e) {}

  // restore persisted intro preset choice
  try {
    var _savedPreset = localStorage.getItem("ocra_introPreset");
    if (_savedPreset && O._introPresets && O._introPresets[_savedPreset]) {
      DC.flags.introPreset = _savedPreset;
    }
  } catch (e) {}

  DC.setIntroBackground = function (v) {
    DC.flags.introBackground = v;
    try { localStorage.setItem("ocra_introBackground", v); } catch (e) {}
    if (O.notifications) O.notifications.push("Intro background → " + v, "info");
    O.render();
  };

  DC.setIntroPreset = function (v) {
    DC.flags.introPreset = v;
    try { localStorage.setItem("ocra_introPreset", v); } catch (e) {}
    if (O.notifications) O.notifications.push("Intro preset → " + v, "info");
    O.render();
  };

  // ---- API KEYS (seams · actual keys stored server-side) ----
  DC.apiSeams = {
    claudeApi:    { label: "Claude Sonnet (AI Insights)", status: "seam", endpoint: "/api/ai/insights" },
    mpesa:        { label: "M-Pesa Daraja API",           status: "seam", endpoint: "/api/payment/mpesa" },
    stripe:       { label: "Stripe Payments",             status: "seam", endpoint: "/api/payment/stripe" },
    pdfBackend:   { label: "ReportLab PDF Backend",       status: "seam", endpoint: "/api/reports/generate-pdf" },
    mbti:         { label: "MBTI / Personality API",      status: "seam", endpoint: "/api/mbti" },
    cohortDb:     { label: "Cohort Analytics Database",   status: "seam", endpoint: "/api/analytics/cohort" },
  };

  // ---- MODULE HEALTH ----
  DC.getModuleHealth = function () {
    var modules = [
      { name: "core",             obj: O,                   required: true },
      { name: "identity",         obj: O.identity,          required: true },
      { name: "brainTest",        obj: O.brainTest,         required: true },
      { name: "reportEngine",     obj: O.reportEngine,      required: true },
      { name: "intakeForm",       obj: O.intakeForm,        required: false },
      { name: "academicRecords",  obj: O.academicRecords,   required: false },
      { name: "aiInsights",       obj: O.aiInsights,        required: false },
      { name: "notifications",    obj: O.notifications,     required: false },
      { name: "payment",          obj: O.payment,           required: false },
      { name: "pdfExport",        obj: O.pdfExport,         required: false },
      { name: "analyticsEngine",  obj: O.analyticsEngine,   required: false },
      { name: "dataManagement",   obj: O.dataManagement,    required: false },
      { name: "developerConsole", obj: O.developerConsole,  required: false },
    ];
    return modules.map(function (m) {
      return { name: m.name, loaded: !!m.obj, required: m.required };
    });
  };

  // ---- USAGE STATS ----
  DC.stats = {
    sessionsStarted:    0,
    brainTestsComplete: 0,
    reportsGenerated:   0,
    paymentsProcessed:  0,
    pdfsExported:       0,
  };

  DC.increment = function (key) {
    if (DC.stats[key] !== undefined) DC.stats[key]++;
  };

  // ---- DEVELOPER DASHBOARD RENDERER ----
  O.dashboards.developer = function () {
    var health = DC.getModuleHealth();
    var loaded = health.filter(function (m) { return m.loaded; }).length;
    var total = health.length;
    var auditLog = O.dataManagement ? O.dataManagement.auditLog.slice(0, 10) : [];

    var healthRows = health.map(function (m) {
      var status = m.loaded ? "OK" : (m.required ? "Missing" : "Optional");
      var color = m.loaded ? "var(--green)" : (m.required ? "var(--red)" : "var(--muted)");
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;' +
        'border-bottom:1px solid rgba(255,255,255,.06);font-size:12px">' +
        '<span style="color:rgba(220,232,242,.8)">' + m.name + (m.required ? ' <span style="color:var(--red);font-size:10px">*req</span>' : '') + '</span>' +
        '<span style="color:' + color + ';font-weight:700">' + status + '</span>' +
      '</div>';
    }).join("");

    var apiRows = Object.keys(DC.apiSeams).map(function (k) {
      var api = DC.apiSeams[k];
      return '<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px">' +
        '<div style="color:rgba(220,232,242,.9);font-weight:600;margin-bottom:2px">' + O.esc(api.label) + '</div>' +
        '<div style="display:flex;justify-content:space-between">' +
          '<span class="muted" style="font-size:10px">' + O.esc(api.endpoint) + '</span>' +
          '<span style="color:var(--amber);font-size:10px">' + api.status + '</span>' +
        '</div>' +
      '</div>';
    }).join("");

    var flagRows = Object.keys(DC.flags).map(function (k) {
      var val = DC.flags[k];
      return '<div style="display:flex;justify-content:space-between;align-items:center;' +
        'padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px">' +
        '<span style="color:rgba(220,232,242,.8)">' + O.esc(k) + '</span>' +
        '<span style="color:' + (val ? "var(--green)" : "rgba(220,232,242,.3)") + ';font-weight:700">' + (val ? "ON" : "OFF") + '</span>' +
      '</div>';
    }).join("");

    var auditRows = auditLog.length ? auditLog.map(function (e) {
      return '<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:11px">' +
        '<span style="color:var(--ocean)">' + e.action + '</span>' +
        '<span style="color:rgba(220,232,242,.6);margin-left:8px">' + O.esc(e.detail) + '</span>' +
        '<div class="muted" style="font-size:9px;margin-top:2px">' + new Date(e.timestamp).toLocaleTimeString() + '</div>' +
      '</div>';
    }).join("") : '<div class="muted" style="font-size:12px;padding:10px 0">No audit entries yet.</div>';

    var statsHtml = Object.keys(DC.stats).map(function (k) {
      return '<div style="text-align:center">' +
        '<div style="font-size:24px;font-weight:800;color:var(--ocean)">' + DC.stats[k] + '</div>' +
        '<div style="font-size:10px;color:rgba(220,232,242,.6);text-transform:uppercase;letter-spacing:.08em">' + k.replace(/([A-Z])/g, " $1") + '</div>' +
      '</div>';
    }).join("");

    return '' +
    '<div class="grid-3" style="grid-template-columns:1fr 1fr 1fr">' +
      // Col 1: Module Health
      '<div class="dglass panel">' +
        '<div class="label" style="font-size:11px;color:var(--ocean);margin-bottom:4px">Module Health</div>' +
        '<div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:14px">' + loaded + '/' + total + ' loaded</div>' +
        healthRows +
      '</div>' +

      // Col 2: Stats + Flags
      '<div class="col">' +
        '<div class="dglass panel">' +
          '<div class="label" style="font-size:11px;color:var(--ocean);margin-bottom:14px">Session Stats</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">' + statsHtml + '</div>' +
        '</div>' +
        '<div class="dglass panel">' +
          '<div class="label" style="font-size:11px;color:var(--ocean);margin-bottom:10px">Feature Flags</div>' +
          flagRows +
        '</div>' +
        '<div class="dglass panel">' +
          '<div class="label" style="font-size:11px;color:var(--ocean);margin-bottom:8px">Quick Actions</div>' +
          '<div style="display:flex;flex-direction:column;gap:8px">' +
            '<button class="btn dark" style="font-size:11px;padding:10px" data-action="go" data-phase="intake">Open Intake Form</button>' +
            '<button class="btn dark" style="font-size:11px;padding:10px" data-action="go" data-phase="academicEntry">Academic Entry</button>' +
            '<button class="btn dark" style="font-size:11px;padding:10px" data-action="brainTestStart">[ Start Brain Test ]</button>' +
            '<button class="btn dark" style="font-size:11px;padding:10px" data-action="exportAll">Export All Data</button>' +
            '<button class="btn dark" style="font-size:11px;padding:10px;color:var(--red)" data-action="clearSession">Clear Session</button>' +
          '</div>' +
        '</div>' +
        '<div class="dglass panel">' +
          '<div class="label" style="font-size:11px;color:var(--ocean);margin-bottom:10px">Intro Screen Theme</div>' +
          '<div style="font-size:11px;color:rgba(220,232,242,.6);margin-bottom:10px">Current: <strong style="color:#38BDF8">' + DC.flags.introBackground + '</strong></div>' +
          '<div style="display:flex;gap:8px">' +
            (["dark","black","light"].map(function (opt) {
              var on = DC.flags.introBackground === opt;
              return '<button data-dc-bg="' + opt + '" ' +
                'style="flex:1;padding:8px 0;font-size:11px;font-family:inherit;cursor:pointer;' +
                'border-radius:8px;border:1px solid ' + (on ? "var(--ocean)" : "rgba(255,255,255,.15)") + ';' +
                'background:' + (on ? "var(--ocean)" : "rgba(255,255,255,.05)") + ';' +
                'color:' + (on ? "#fff" : "rgba(220,232,242,.7)") + '">' + opt + '</button>';
            }).join("")) +
          '</div>' +
          '<button data-action="go" data-phase="intro" ' +
            'style="width:100%;margin-top:8px;padding:9px;font-size:11px;font-family:inherit;cursor:pointer;' +
            'border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);' +
            'color:rgba(220,232,242,.6)">Preview Intro →</button>' +
        '</div>' +
        '<div class="dglass panel">' +
          '<div class="label" style="font-size:11px;color:var(--ocean);margin-bottom:10px">Animation Preset</div>' +
          '<div style="font-size:11px;color:rgba(220,232,242,.6);margin-bottom:10px">Active: <strong style="color:#38BDF8">' + DC.flags.introPreset + '</strong></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">' +
            (["stellar","surge","drift","neon","minimal"].map(function (opt) {
              var on  = DC.flags.introPreset === opt;
              var p   = O._introPresets && O._introPresets[opt];
              var ac  = p ? p.accent : "#38BDF8";
              return '<button data-dc-preset="' + opt + '" ' +
                'style="padding:8px 4px;font-size:11px;font-family:inherit;cursor:pointer;' +
                'border-radius:8px;border:1px solid ' + (on ? ac : "rgba(255,255,255,.12)") + ';' +
                'background:' + (on ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.04)") + ';' +
                'color:' + (on ? ac : "rgba(220,232,242,.6)") + '">' + opt + '</button>';
            }).join("")) +
          '</div>' +
        '</div>' +
      '</div>' +

      // Col 3: API Seams + Audit
      '<div class="col">' +
        '<div class="dglass panel">' +
          '<div class="label" style="font-size:11px;color:var(--ocean);margin-bottom:10px">API Integration Seams</div>' +
          apiRows +
        '</div>' +
        '<div class="dglass panel">' +
          '<div class="label" style="font-size:11px;color:var(--ocean);margin-bottom:10px">Recent Audit Log</div>' +
          auditRows +
        '</div>' +
      '</div>' +
    '</div>';
  };

  // CSP-safe controls: no inline handlers anywhere in the console.
  document.addEventListener("click", function (e) {
    var bg = e.target.closest && e.target.closest("[data-dc-bg]");
    if (bg) { DC.setIntroBackground(bg.getAttribute("data-dc-bg")); return; }
    var pr = e.target.closest && e.target.closest("[data-dc-preset]");
    if (pr) { DC.setIntroPreset(pr.getAttribute("data-dc-preset")); return; }
  });

  console.log("✅ Developer Console Module Loaded · Lewis Gitonga, highest hierarchy");

})(window.OCRA);
