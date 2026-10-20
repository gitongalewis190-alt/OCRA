/* ============================================================
   PAYMENT MODULE
   KES 40 / download gate. M-Pesa (Daraja API) + Stripe seams.
   30-day unlock window. Developer role bypass.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  var P = (O.payment = {});

  P.PRICE_KES = 40;

  P.state = {
    status: null,       // null | pending | success | failed
    provider: null,     // mpesa | stripe
    reference: null,    // transaction ref
    unlockedDocs: [],   // array of docType strings
    unlockExpiry: null, // Date when 30-day window expires
  };

  P.isDeveloper = function () {
    var user = O.state.user || {};
    // Server-issued role only. An email address never unlocks paid documents.
    return user.role === "developer";
  };

  P.isUnlocked = function (docType) {
    if (P.isDeveloper()) return true;
    if (P.state.unlockedDocs.indexOf("all") >= 0) return true;
    if (P.state.unlockedDocs.indexOf(docType) >= 0) {
      if (!P.state.unlockExpiry || new Date() < new Date(P.state.unlockExpiry)) return true;
    }
    return false;
  };

  P.unlock = function (docType) {
    docType = docType || (O.state.paymentPending && O.state.paymentPending.docType) || "all";
    if (P.state.unlockedDocs.indexOf(docType) < 0) P.state.unlockedDocs.push(docType);
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    P.state.unlockExpiry = expiry.toISOString();
    P.state.status = "success";
    O.state.paymentStatus = "success";
    if (O.notifications) O.notifications.push("Document unlocked! Download is ready. Valid for 30 days.", O.notifications.TYPES.SUCCESS);
    O.go({ phase: "reportView", reportPhase: "detail", currentDoc: docType });
  };

  // ---- M-PESA (Daraja API seam) ----
  P.initiateMpesa = function () {
    var user = O.state.user || {};
    var phone = user.phone || "";
    var docType = O.state.paymentPending && O.state.paymentPending.docType;
    P.state.status = "pending";
    P.state.provider = "mpesa";
    O.state.paymentStatus = "pending";
    O.render();

    // Backend seam: POST /api/payment/mpesa/initiate
    if (typeof fetch !== "undefined") {
      fetch("/api/payment/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          amount: P.PRICE_KES,
          docType: docType,
          userId: user.email || user.id,
          reference: "OCRA_" + Date.now(),
        }),
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          P.state.reference = data.CheckoutRequestID || data.reference;
          if (O.notifications) O.notifications.push("M-Pesa payment request sent to " + (phone || "your phone") + ". Enter your PIN to complete.", O.notifications.TYPES.INFO, { persistent: true });
          P.pollMpesa(P.state.reference);
        } else {
          P.state.status = "failed";
          O.state.paymentStatus = "failed";
          if (O.notifications) O.notifications.push("M-Pesa initiation failed: " + (data.message || "please try again"), O.notifications.TYPES.ERROR);
          O.render();
        }
      })
      .catch(function () {
        P.state.status = "failed";
        O.state.paymentStatus = "failed";
        if (O.notifications) O.notifications.push("M-Pesa connection failed. Please check your network and try again.", O.notifications.TYPES.ERROR);
        O.render();
      });
    } else {
      // Demo mode fallback
      setTimeout(function () { P.unlock(docType); }, 2000);
    }
  };

  P.pollMpesa = function (ref, attempts) {
    attempts = attempts || 0;
    if (attempts > 12) {
      P.state.status = "failed";
      if (O.notifications) O.notifications.push("Payment timed out. Please retry.", O.notifications.TYPES.WARNING);
      O.render();
      return;
    }
    setTimeout(function () {
      if (typeof fetch === "undefined") { P.unlock(); return; }
      fetch("/api/payment/mpesa/status?ref=" + encodeURIComponent(ref))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.status === "success") { P.unlock(); }
          else if (data.status === "failed") {
            P.state.status = "failed";
            O.state.paymentStatus = "failed";
            if (O.notifications) O.notifications.push("Payment cancelled or failed. Please retry.", O.notifications.TYPES.ERROR);
            O.render();
          } else {
            P.pollMpesa(ref, attempts + 1);
          }
        })
        .catch(function () { P.pollMpesa(ref, attempts + 1); });
    }, 5000);
  };

  // ---- STRIPE seam ----
  P.initiateStripe = function () {
    var docType = O.state.paymentPending && O.state.paymentPending.docType;
    P.state.status = "pending";
    P.state.provider = "stripe";

    if (typeof fetch !== "undefined") {
      fetch("/api/payment/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: P.PRICE_KES,
          currency: "kes",
          docType: docType,
          userId: (O.state.user || {}).email,
        }),
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.url) {
          window.location.href = data.url;
        } else {
          P.state.status = "failed";
          if (O.notifications) O.notifications.push("Stripe checkout unavailable. Please try M-Pesa.", O.notifications.TYPES.WARNING);
          O.render();
        }
      })
      .catch(function () {
        P.state.status = "failed";
        if (O.notifications) O.notifications.push("Stripe connection failed. Please try M-Pesa.", O.notifications.TYPES.ERROR);
        O.render();
      });
    } else {
      setTimeout(function () { P.unlock(docType); }, 1500);
    }
  };

  // ---- SCREEN ----
  P.screens = {
    gate: function () {
      var s = O.state;
      var pending = s.paymentPending || { docType: "all", amount: P.PRICE_KES };
      var status = P.state.status;

      var docLabels = {
        transcript: "Academic Transcript",
        resultsReport: "Results Report",
        careerGuidance: "Career Guidance Sheet",
        revisionTimetable: "Revision Timetable",
        all: "Full Report Bundle",
      };
      var docLabel = docLabels[pending.docType] || "Document";

      if (status === "success") {
        return '' +
        '<div class="center"><div class="glass card-pad" style="max-width:480px;text-align:center">' +
'<div style="width:44px;height:44px;display:grid;place-items:center;margin:0 auto 14px;background:#e6f8ee;border-radius:50%;color:#0a7a42;font-size:22px;font-weight:800" aria-hidden="true">✓</div>' +
          '<div style="font-size:24px;font-weight:800;color:var(--ink);margin-bottom:8px">Payment Successful</div>' +
          '<p class="muted" style="margin-bottom:20px">Your document is unlocked for 30 days.</p>' +
          '<button class="btn primary full" data-action="viewReportDoc" data-doc-type="' + O.esc(pending.docType) + '" style="padding:14px;font-weight:700">Download Document</button>' +
          '<button class="btn full" data-action="paymentBack" style="padding:12px;margin-top:8px">Back to Reports</button>' +
        '</div></div>';
      }

      if (status === "pending") {
        return '' +
        '<div class="center"><div class="glass card-pad" style="max-width:480px;text-align:center">' +
'<div style="width:44px;height:44px;margin:0 auto 14px;border:3px solid #e6e9ef;border-top-color:#0E6BA8;border-radius:50%;animation:spin 1s linear infinite" aria-hidden="true"></div>' +
          '<div style="font-size:22px;font-weight:800;color:var(--ink);margin-bottom:8px">Processing Payment</div>' +
          '<p class="muted" style="margin-bottom:8px">Waiting for confirmation' + (P.state.provider === "mpesa" ? "  -  please enter your M-Pesa PIN" : "") + '...</p>' +
          '<div style="display:flex;justify-content:center;margin:20px 0"><div class="ocra-spin" style="width:40px;height:40px;border:3px solid var(--ocean);border-radius:50%;border-top-color:transparent;animation:spin 1s linear infinite"></div></div>' +
          '<button class="btn full" data-action="paymentBack" style="padding:12px;margin-top:8px">Cancel</button>' +
        '</div></div>';
      }

      return '' +
      '<div class="center"><div class="glass card-pad" style="max-width:480px;width:100%">' +
        '<div style="text-align:center;margin-bottom:20px">' +
'<div style="font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--ocean);margin-bottom:8px;text-transform:uppercase">Secure checkout</div>' +
          '<div style="font-size:22px;font-weight:800;color:var(--ink);margin-bottom:6px">Unlock Document</div>' +
          '<div class="muted" style="font-size:13px">' + O.esc(docLabel) + '</div>' +
        '</div>' +
        '<div class="glass panel" style="background:rgba(14,107,168,.06);margin-bottom:20px;text-align:center">' +
          '<div class="muted" style="font-size:11px;margin-bottom:8px">One-time unlock</div>' +
          '<div style="font-size:36px;font-weight:800;color:var(--ocean)">KES ' + P.PRICE_KES + '</div>' +
          '<div class="muted" style="font-size:11px;margin-top:6px">Valid for 30 days &middot; Download + Print anytime</div>' +
        '</div>' +
        (status === "failed" ? '<div style="background:rgba(255,59,48,.08);border:1px solid var(--red);border-radius:10px;padding:12px;margin-bottom:16px;color:var(--red);font-size:12px;text-align:center">Payment failed. Please try again.</div>' : '') +
        '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">' +
          '<button class="btn primary full" data-action="paymentMpesa" style="padding:16px;font-weight:700;font-size:15px;background:#00B300;border-color:#00B300">' +
'Pay with M-Pesa (KES ' + P.PRICE_KES + ')' +
          '</button>' +
          '<button class="btn full" data-action="paymentStripe" style="padding:14px;font-weight:600">' +
'Pay with Card (Stripe)' +
          '</button>' +
        '</div>' +
        '<div class="muted" style="font-size:11px;text-align:center;margin-bottom:16px">Secure payment &middot; Your data is never shared</div>' +
        '<button class="btn full" data-action="paymentBack" style="padding:12px">Cancel</button>' +
      '</div></div>';
    },
  };

  console.log("✅ Payment Module Loaded  -  M-Pesa + Stripe seams, KES 40, server-verified unlock");

})(window.OCRA);
