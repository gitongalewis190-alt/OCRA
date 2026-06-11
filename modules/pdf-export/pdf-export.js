/* ============================================================
   PDF EXPORT MODULE
   ReportLab backend seam + browser print fallback.
   Handles single-document and bundle exports.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  var PE = (O.pdfExport = {});

  PE.state = {
    generating: false,
    lastExported: null,
  };

  PE.docTitles = {
    transcript:       "Academic Transcript & Cognitive Profile",
    resultsReport:    "Results Report & Growth Analysis",
    careerGuidance:   "Career Guidance Sheet",
    revisionTimetable:"Personal Revision Timetable",
    all:              "OCRA Full Report Bundle",
  };

  PE.trigger = function (docType) {
    if (PE.state.generating) return;
    PE.state.generating = true;
    if (O.notifications) O.notifications.push("Preparing " + (PE.docTitles[docType] || "document") + " for export...", O.notifications.TYPES.INFO);

    if (typeof fetch !== "undefined") {
      PE.requestBackend(docType, function (pdfUrl) {
        PE.state.generating = false;
        PE.state.lastExported = { docType: docType, url: pdfUrl, timestamp: Date.now() };
        if (pdfUrl) {
          var a = document.createElement("a");
          a.href = pdfUrl;
          a.download = "OCRA_" + (docType || "report") + "_" + Date.now() + ".pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          if (O.notifications) O.notifications.push("PDF downloaded successfully.", O.notifications.TYPES.SUCCESS);
        } else {
          PE.printFallback(docType);
        }
      });
    } else {
      PE.state.generating = false;
      PE.printFallback(docType);
    }
  };

  PE.requestBackend = function (docType, onComplete) {
    var payload = {
      docType: docType,
      report: O.reportEngine ? O.reportEngine.state.reports[docType] : null,
      userProfile: O.state.user || {},
      timestamp: Date.now(),
    };
    fetch("/api/reports/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    .then(function (r) { return r.json(); })
    .then(function (data) { onComplete(data.pdfUrl || null); })
    .catch(function () { onComplete(null); });
  };

  PE.printFallback = function (docType) {
    PE.state.generating = false;
    if (O.notifications) O.notifications.push("PDF backend unavailable. Opening print dialog as alternative.", O.notifications.TYPES.WARNING);
    // Give the UI time to update before print dialog
    setTimeout(function () { window.print(); }, 300);
  };

  PE.bundleAll = function () {
    PE.trigger("all");
  };

  console.log("✅ PDF Export Module Loaded — backend seam + print fallback");

})(window.OCRA);
