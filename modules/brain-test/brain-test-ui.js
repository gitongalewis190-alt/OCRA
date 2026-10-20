/* ============================================================
   BRAIN TEST UI MODULE
   Single-question screen, progress tracking, answer flow.
   Integrated with main OCRA state.
   ============================================================ */
(function (O) {
  "use strict";
  var BT = O.brainTest;

  O.screens.brainTest = function () {
    var qIdx = BT.state.currentQuestion;
    var q = BT.questions[qIdx];
    var progress = (qIdx / 60) * 100;
    if (!q) return brainTestComplete();
    return brainTestQuestion(q, qIdx, progress);
  };

  function brainTestQuestion(q, qIdx, progress) {
    var dimMap = {
      spatial: "Spatial Reasoning",
      numerical: "Numerical Fluidity",
      linguistic: "Linguistic Analysis",
      abstractLogic: "Abstract Logic",
      mechanical: "Mechanical Intuition",
      focusEndurance: "Focus Endurance"
    };
    return '' +
    '<div style="max-width:720px;margin:0 auto">' +
      '<div style="margin-bottom:20px">' +
        '<div class="label muted" style="font-size:10px;margin-bottom:6px">' + (qIdx + 1) + ' of 60 &nbsp;&middot;&nbsp; ' + (dimMap[q.dimension] || q.dimension) + '</div>' +
        '<div style="width:100%;height:8px;background:rgba(16,58,85,.1);border-radius:999px;overflow:hidden">' +
          '<div style="height:100%;background:var(--ocean);width:' + progress + '%;transition:width .3s ease"></div>' +
        '</div>' +
      '</div>' +
      '<div class="glass panel" style="margin-bottom:20px">' +
        '<div style="font-size:18px;font-weight:700;color:var(--ink);margin-bottom:22px;line-height:1.55">' + O.esc(q.text) + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px">' +
          q.options.map(function (opt, i) {
            return '<button class="btn full" data-action="brainTestAnswer" data-value="' + O.esc(opt) + '" ' +
              'style="text-align:left;padding:14px 16px;font-size:14px">' +
              '<span style="display:inline-block;width:26px;height:26px;background:var(--ocean);color:#fff;' +
                'border-radius:50%;text-align:center;line-height:26px;margin-right:12px;font-size:11px;font-weight:700">' +
                String.fromCharCode(65 + i) +
              '</span>' +
              O.esc(opt) +
            '</button>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;align-items:center">' +
        '<button class="btn" data-action="brainTestBack" style="padding:12px 18px">&larr; Back</button>' +
        '<div class="glass panel" style="flex:1;text-align:center;padding:10px">' +
          '<div class="muted" style="font-size:10px">Time</div>' +
          '<div id="btTimer" style="font-size:18px;font-weight:800;color:var(--ocean)">0s</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function brainTestComplete() {
    var payload = BT.generateReportPayload();
    return '' +
    '<div style="max-width:600px;margin:0 auto">' +
      '<div class="glass panel" style="text-align:center;padding:40px 28px">' +
        '<div style="width:44px;height:44px;margin:0 auto 14px;border-radius:50%;background:#e6f8ee;color:#0a7a42;display:grid;place-items:center;font-size:20px;font-weight:800" aria-hidden="true">OK</div>' +
        '<div style="font-size:26px;font-weight:800;color:var(--ink);margin-bottom:8px">Test Complete</div>' +
        '<p class="muted" style="margin-bottom:26px;line-height:1.6">Your cognitive profile is ready.</p>' +
        scoreGrid(payload) +
        (payload.isValid === false ? antiCheatWarning(payload.message) : '') +
        '<button class="btn primary full" data-action="brainTestToReport" style="padding:14px;font-weight:700;font-size:15px;margin-bottom:10px">Generate Report</button>' +
        '<button class="btn full" data-action="restart" style="padding:14px">Back to Dashboard</button>' +
      '</div>' +
    '</div>';
  }

  function scoreGrid(payload) {
    var dims = [
      ["spatial", "Spatial"],
      ["numerical", "Numerical"],
      ["linguistic", "Linguistic"],
      ["abstractLogic", "Abstract Logic"],
      ["mechanical", "Mechanical"],
      ["focusEndurance", "Focus Endurance"]
    ];
    return '<div class="glass panel" style="text-align:left;margin-bottom:20px">' +
      '<div class="label muted" style="font-size:11px;margin-bottom:14px">Dimension Scores</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      dims.map(function (d) {
        var score = payload.scores[d[0]] || 0;
        return '<div>' +
          '<div class="muted" style="font-size:11px">' + d[1] + '</div>' +
          '<div style="font-size:22px;font-weight:800;color:var(--ocean)">' + score + '/10</div>' +
          '<div style="height:4px;background:rgba(16,58,85,.1);border-radius:4px;margin-top:4px;overflow:hidden">' +
            '<div style="height:100%;background:var(--ocean);width:' + (score * 10) + '%"></div>' +
          '</div>' +
        '</div>';
      }).join("") +
      '</div></div>';
  }

  function antiCheatWarning(msg) {
    return '<div style="background:rgba(255,59,48,.1);border:1px solid var(--red);border-radius:12px;' +
      'padding:14px;margin-bottom:20px;color:var(--red);font-size:12px;text-align:left">' +
      '<strong>&#9888; ' + O.esc(msg) + '</strong></div>';
  }

  BT.screens = BT.screens || {};

  BT.screens.results = function () {
    var payload = BT.generateReportPayload();
    return '' +
    '<div style="max-width:600px;margin:0 auto">' +
      '<div class="glass panel" style="text-align:center;padding:40px 28px">' +
        '<div style="width:44px;height:44px;margin:0 auto 14px;border-radius:50%;background:#e6f8ee;color:#0a7a42;display:grid;place-items:center;font-size:20px;font-weight:800" aria-hidden="true">OK</div>' +
        '<div style="font-size:26px;font-weight:800;color:var(--ink);margin-bottom:8px">Test Complete!</div>' +
        '<p class="muted" style="margin-bottom:26px;line-height:1.6">Your cognitive profile is ready. Review your 6-dimension scores below.</p>' +
        scoreGrid(payload) +
        (payload.isValid === false ? antiCheatWarning(payload.message) : '') +
        '<div style="background:rgba(14,107,168,.08);border-radius:12px;padding:14px;margin-bottom:20px">' +
          '<div class="label" style="font-size:10px;color:var(--ocean);margin-bottom:6px">Total Test Duration</div>' +
          '<div style="font-size:16px;font-weight:700;color:var(--ocean)">' + ((payload.totalDurationSeconds || 0)).toFixed(0) + ' seconds</div>' +
        '</div>' +
        '<button class="btn primary full" data-action="brainTestToReport" style="padding:14px;font-weight:700;font-size:15px;margin-bottom:10px">Generate My Report</button>' +
        '<button class="btn full" data-action="restart" style="padding:14px">Back to Dashboard</button>' +
      '</div>' +
    '</div>';
  };

  // ---- REPORT ENGINE SCREENS ----
  O.reportEngine = O.reportEngine || {};
  O.reportEngine.screens = {
    summary: function () {
      return '' +
      '<div style="max-width:700px;margin:0 auto">' +
        '<div class="glass panel" style="margin-bottom:20px;text-align:center">' +
          '<div style="font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--ocean);margin-bottom:12px;text-transform:uppercase">Reports</div>' +
          '<div style="font-size:26px;font-weight:800;color:var(--ink);margin-bottom:8px">Your Reports Are Ready</div>' +
          '<p class="muted" style="margin-bottom:20px;line-height:1.6">Four comprehensive documents have been generated based on your cognitive profile and academic record.</p>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px">' +
          reportCard("transcript",       "DOC", "Academic Transcript",  "Student info, results &amp; profile") +
          reportCard("resultsReport",    "RES", "Results Report",       "Performance &amp; growth analysis") +
          reportCard("careerGuidance",   "PATH", "Career Guidance",      "4-career pathways &amp; subjects") +
          reportCard("revisionTimetable","PLAN", "Revision Timetable",   "Personalised study schedule") +
        '</div>' +
        '<div class="glass panel" style="margin-bottom:20px;padding:16px;text-align:center">' +
          '<button class="btn primary full" data-action="exportReportPDF" data-doc-type="all" style="padding:14px;font-weight:700">Export Full PDF Bundle</button>' +
        '</div>' +
        '<button class="btn full" data-action="restart" style="padding:14px">Back to Dashboard</button>' +
      '</div>';
    },

    detail: function () {
      var docType = O.state.currentDoc;
      var reports = O.reportEngine.state ? O.reportEngine.state.reports : {};
      var doc = reports && reports[docType];
      if (!doc) {
        return '<div class="center"><div class="glass card-pad" style="max-width:600px;text-align:center">' +
          '<p class="muted">Document not found. Please generate a report first.</p>' +
          '<button class="btn primary" data-action="brainTestToReport" style="margin-top:14px;padding:12px 24px">Re-generate Report</button>' +
        '</div></div>';
      }
      var sectionsHtml = doc.sections.map(function (sec) {
        var content = "";
        if (typeof sec.content === "string") {
          content = '<p class="muted" style="line-height:1.6;font-size:13px">' + O.esc(sec.content) + '</p>';
        } else if (Array.isArray(sec.content)) {
          content = '<ul style="margin:0;padding-left:18px;font-size:13px;color:var(--ink);line-height:1.8">' +
            sec.content.map(function (item) {
              if (typeof item === "object") {
                return '<li>' + Object.entries(item).map(function (e) { return '<strong>' + O.esc(e[0]) + ':</strong> ' + O.esc(String(e[1])); }).join(" &middot; ") + '</li>';
              }
              return '<li>' + O.esc(String(item)) + '</li>';
            }).join("") +
          '</ul>';
        } else if (typeof sec.content === "object" && sec.content !== null) {
          content = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;color:var(--ink)">' +
            Object.entries(sec.content).map(function (e) {
              return '<div><span class="muted" style="font-size:10px">' + O.esc(e[0]) + '</span><br><strong>' + O.esc(String(e[1])) + '</strong></div>';
            }).join("") +
          '</div>';
        }
        return '<div style="margin-bottom:22px">' +
          '<div style="font-size:11px;font-weight:700;color:var(--ocean);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">' + O.esc(sec.heading) + '</div>' +
          content +
        '</div>';
      }).join("");

      return '' +
      '<div style="max-width:720px;margin:0 auto">' +
        '<button class="btn" data-action="reportBack" style="margin-bottom:20px">&larr; Back to Reports</button>' +
        '<div class="glass panel" style="padding:28px">' +
          '<div style="font-size:20px;font-weight:800;color:var(--ink);margin-bottom:20px;border-bottom:1px solid rgba(16,58,85,.1);padding-bottom:14px">' + O.esc(doc.title) + '</div>' +
          sectionsHtml +
          '<button class="btn primary full" data-action="exportReportPDF" data-doc-type="' + O.esc(docType) + '" style="padding:14px;font-weight:700;margin-top:8px">Download as PDF · KES 40</button>' +
        '</div>' +
      '</div>';
    },
  };

  function reportCard(docType, icon, title, subtitle) {
    return '<button class="glass panel" data-action="viewReportDoc" data-doc-type="' + docType + '" ' +
      'style="padding:20px;text-align:center;border:none;cursor:pointer;width:100%">' +
      '<div style="font-size:24px;margin-bottom:8px">' + icon + '</div>' +
      '<div style="font-weight:700;color:var(--ink);margin-bottom:4px">' + title + '</div>' +
      '<div class="muted" style="font-size:11px">' + subtitle + '</div>' +
    '</button>';
  }

  // timer: starts fresh each render cycle, auto-cancelled on next render
  (function tickTimer() {
    var el = document.getElementById("btTimer");
    if (!el) return;
    var start = O.brainTest && O.brainTest.state.questionStartTime ? O.brainTest.state.questionStartTime : Date.now();
    var tick = function () {
      var el2 = document.getElementById("btTimer");
      if (!el2) return;
      el2.textContent = (((Date.now() - start) / 1000) | 0) + "s";
      setTimeout(tick, 250);
    };
    tick();
  })();

  console.log("✅ Brain Test UI Module Loaded");

})(window.OCRA);
