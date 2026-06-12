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
    phase: "intro",          // intro | choose | account | auth | dash | brainTest | reportView | intake | academicEntry | payment
    account: "personal",     // personal | family | organization
    authMode: "login",       // login | signup | recover
    authStep: "email",       // email | password (email-first smart login)
    authEmail: "",           // email captured at step 1
    recoverSamePw: false,    // recovery: new password equals current one
    signupStage: 1,          // 1..N
    dash: "personal",        // personal | family | organization | developer
    form: {},                // collected signup fields
    user: null,              // logged-in user

    // Brain Test
    brainTestPhase: "test",  // test | results
    academicRecords: null,   // { mathematics_score, physics_score, chemistry_score, mechanics_score }

    // Report
    reportPhase: "summary",  // summary | detail
    currentDoc: null,        // transcript | resultsReport | careerGuidance | revisionTimetable

    // Intake
    intakeStage: 1,

    // Payment
    paymentPending: null,    // { docType, amount }
    paymentStatus: null,     // null | pending | success | failed
  };

  O.screens   = {};          // phase -> render() ; filled by other modules
  O.dashboards = {};         // type  -> render()

  // ---- router / render bus ----
  O.go = function (patch) {
    Object.assign(O.state, patch || {});
    O.render();
  };

  O.render = function () {
    var s = O.state, app = document.getElementById("app");
    if (!app) return;
    try {
      var html = "";

      if (s.phase === "brainTest") {
        if (s.brainTestPhase === "results" && O.brainTest && O.brainTest.screens) {
          html = '<div class="stage">' + O.brainTest.screens.results() + '</div>';
        } else if (O.screens.brainTest) {
          html = '<div class="stage">' + O.screens.brainTest() + '</div>';
        }
      } else if (s.phase === "reportView") {
        if (O.reportEngine && O.reportEngine.screens && O.reportEngine.screens[s.reportPhase]) {
          html = '<div class="stage">' + O.reportEngine.screens[s.reportPhase]() + '</div>';
        }
      } else if (s.phase === "payment") {
        if (O.payment && O.payment.screens) {
          html = '<div class="stage">' + O.payment.screens.gate() + '</div>';
        }
      } else if (s.phase === "intake") {
        if (O.intakeForm && O.intakeForm.screens) {
          html = '<div class="stage">' + O.intakeForm.screens.form() + '</div>';
        }
      } else if (s.phase === "academicEntry") {
        if (O.academicRecords && O.academicRecords.screens) {
          html = '<div class="stage">' + O.academicRecords.screens.entry() + '</div>';
        }
      } else if (s.phase === "dash") {
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
      O.bindHold();
      if (s.phase === "intro" && O.introAnimate) O.introAnimate();
      else if (O.flowAnimate) O.flowAnimate();
    } catch (err) {
      O.fail(err);
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

  // ---- delegated actions ----
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action]");
    if (!t) return;
    var a = t.getAttribute("data-action");
    var v = t.getAttribute("data-value");

    switch (a) {
      // ---- entry flow ----
      case "diveIn":
        if (O._held) { O._held = false; return; }
        return O.go({ phase: "choose" });

      case "academics":   return O.go({ phase: "account" });
      case "backToChoose": return O.go({ phase: "choose" });

      case "finances": {
        if (window.gsap) {
          window.gsap.fromTo(t, { x: 0 }, { x: 7, duration: 0.05, repeat: 9, yoyo: true, ease: "none", clearProps: "x" });
        } else {
          t.classList.add("auth-shake");
          t.addEventListener("animationend", function () { t.classList.remove("auth-shake"); }, { once: true });
        }
        return;
      }

      case "pickAccount": return O.go({ account: v });

      case "accountNext":
        return O.go({ phase: "auth", authMode: "login", authStep: "email", authEmail: "" });

      case "setAuthMode":
        return O.go({ authMode: v, signupStage: 1, authStep: "email", authEmail: "", recoverSamePw: false });

      // ── Email-first login flow ──────────────────────────
      case "emailNext": {
        var w = document.querySelector("[data-auth]");
        var emailEl = w ? w.querySelector('input[data-field="email"]') : null;
        var errEl   = document.getElementById("authErr");
        var email   = (emailEl ? emailEl.value : O.state.form.email || "").trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (errEl) { errEl.textContent = "Enter a valid email address."; errEl.style.display = "block"; }
          return;
        }
        if (errEl) errEl.textContent = "";
        O.state.form.email = email;
        var known = O.auth && O.auth.findAccount && (O.auth.findAccount(email) ||
          (O.auth.DEV_EMAILS && O.auth.DEV_EMAILS.indexOf(email.toLowerCase()) >= 0));
        if (known) {
          return O.go({ authStep: "password", authEmail: email });
        } else {
          if (O.notifications) O.notifications.push("No account found — let’s create one.", "info");
          return O.go({ authMode: "signup", authStep: "email", authEmail: email, signupStage: 1, form: { email: email } });
        }
      }

      case "changeEmail":
        return O.go({ authStep: "email", authEmail: "" });

      // ── Password toggle ────────────────────────────────
      case "togglePw": {
        var inp  = t.closest(".ah") && t.closest(".ah").querySelector("input");
        if (!inp) return;
        var showing = inp.type === "text";
        inp.type = showing ? "password" : "text";
        t.innerHTML = showing ? (O._svgEye || "") : (O._svgEyeX || "");
        return;
      }

      // ── Social auth (Google / Apple / Microsoft) ────────
      // Same flow big platforms use: provider verifies identity, returns a
      // profile; existing account signs straight in (passwordless), a new
      // identity is carried into signup pre-filled. Works on both the login
      // and signup screens.
      case "socialAuth": {
        if (!O.auth || !O.auth.socialAuth) return;
        // Simulated provider account picker (replaced by Firebase popup on wire).
        var picked = window.prompt(
          "Continue with " + v + "\n\nChoose the " + v + " account to use — enter its email address:",
          O.state.authEmail || (O.state.form && O.state.form.email) || ""
        );
        if (picked == null) return; // user dismissed the picker
        picked = picked.trim();
        if (!picked) return;

        var nameGuess = picked.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });

        O.auth.socialAuth(v, { email: picked, firstName: nameGuess },
          function (user) {
            // existing account — straight in
            var dest = (user.role === "developer") ? "developer" : (user.accountType || O.state.account);
            if (O.notifications) O.notifications.push("Signed in with " + v + ".", "success");
            O.go({ phase: "dash", dash: dest, user: user });
          },
          function (profile) {
            // new identity — pre-fill signup with the provider profile
            if (O.notifications) O.notifications.push("Welcome! Finish setting up your " + v + " account.", "info");
            O.go({
              authMode: "signup", authStep: "email", signupStage: 1,
              authEmail: profile.email,
              form: { email: profile.email, first: profile.firstName, authProvider: profile.provider }
            });
          },
          function (msg) {
            if (O.notifications) O.notifications.push(msg, "error");
          }
        );
        return;
      }

      // ── Login submit ───────────────────────────────────
      case "loginSubmit": {
        var s2 = O.state;
        var w2 = document.querySelector("[data-auth]");
        var pwEl  = w2 ? w2.querySelector('input[data-field="password"]') : null;
        var errEl2 = document.getElementById("authErr");
        var em2   = s2.authEmail || (s2.form && s2.form.email) || "";
        var pw2   = (pwEl ? pwEl.value : "") || "";
        if (!em2 || !pw2) {
          if (errEl2) { errEl2.textContent = "Enter your email and password."; errEl2.style.display = "block"; }
          return;
        }
        O.auth.logIn(em2, pw2, function (user) {
          var dest = (user.role === "developer") ? "developer" : (user.accountType || O.state.account);
          O.go({ phase: "dash", dash: dest, user: user });
        }, function (msg) {
          if (errEl2) { errEl2.textContent = msg; errEl2.style.display = "block"; }
        });
        return;
      }

      // ── Recovery submit ────────────────────────────────
      case "recoverSubmit": {
        var w3    = document.querySelector("[data-auth]");
        var eEl   = w3 ? w3.querySelector('input[data-field="recoverEmail"]') : null;
        var npEl  = w3 ? w3.querySelector('input[data-field="newPassword"]') : null;
        var errEl3 = document.getElementById("authErr");
        var recEmail = (eEl ? eEl.value : (O.state.form.recoverEmail || "")).trim();
        var newPw    = npEl ? npEl.value : (O.state.form.newPassword || "");
        var answers  = {
          rq_mother:  (O.state.form.rq_mother  || ""),
          rq_friend:  (O.state.form.rq_friend  || ""),
          rq_pet:     (O.state.form.rq_pet     || ""),
          rq_subject: (O.state.form.rq_subject || ""),
        };
        O.state.form.recoverEmail = recEmail;
        O.state.form.newPassword  = newPw;

        if (!recEmail) {
          if (errEl3) { errEl3.textContent = "Enter your email."; errEl3.style.display = "block"; }
          return;
        }
        // 1. verify recovery answers first (no change made yet)
        var vErr = O.auth.verifyRecoveryAnswers(recEmail, answers);
        if (vErr) {
          if (errEl3) { errEl3.textContent = vErr; errEl3.style.display = "block"; }
          return;
        }
        // 2. enforce password rules
        if (!O.identity.validPassword(newPw)) {
          if (errEl3) { errEl3.textContent = "Password needs 9+ characters, a capital, a number and a symbol."; errEl3.style.display = "block"; }
          return;
        }
        // 3. detect: did they just type their CURRENT password?
        if (O.auth.passwordMatches(recEmail, newPw)) {
          return O.go({ authMode: "recover", recoverSamePw: true, authEmail: recEmail });
        }
        // 4. genuinely new — reset it
        O.auth.recover(recEmail, answers, newPw, function () {
          if (O.notifications) O.notifications.push("Password updated. Sign in with your new password.", "success");
          O.go({ authMode: "login", authStep: "email", authEmail: recEmail, recoverSamePw: false, form: { email: recEmail } });
        }, function (msg) {
          if (errEl3) { errEl3.textContent = msg; errEl3.style.display = "block"; }
        });
        return;
      }

      // ── Recovery: keep the existing (remembered) password ──
      case "recoverKeepOld": {
        var keepEmail = (O.state.authEmail || O.state.form.recoverEmail || "").trim();
        if (O.notifications) O.notifications.push("Good — keep using your current password to sign in.", "success");
        return O.go({ authMode: "login", authStep: "email", authEmail: keepEmail, recoverSamePw: false, form: { email: keepEmail } });
      }

      // ── Recovery: choose a different password instead ──────
      case "recoverChangePw":
        O.state.form.newPassword = "";
        return O.go({ authMode: "recover", recoverSamePw: false });

      // ── Developer login ────────────────────────────────
      case "devEnter": {
        var w4    = document.getElementById("devLoginForm");
        var deEl  = w4 ? w4.querySelector('input[data-field="email"]') : null;
        var dpEl  = w4 ? w4.querySelector('input[data-field="password"]') : null;
        var errEl4 = document.getElementById("authErr");
        var devEm = (deEl ? deEl.value : "").trim() || "gitongalewis190@gmail.com";
        var devPw = dpEl ? dpEl.value : "";
        var enterDev = function (user) { O.go({ phase: "dash", dash: "developer", user: user }); };
        O.auth.logIn(devEm, devPw, enterDev, function (msg) {
          // open-door pre-Firebase: any dev-email still enters
          if (O.auth.DEV_EMAILS && O.auth.DEV_EMAILS.indexOf(devEm.toLowerCase()) >= 0) {
            O.state.user = { email: devEm, role: "developer", accountType: "developer", firstName: "Lewis" };
            O.go({ phase: "dash", dash: "developer" });
          } else if (errEl4) { errEl4.textContent = msg; errEl4.style.display = "block"; }
        });
        return;
      }

      // ── Policy toggle ──────────────────────────────────
      case "togglePolicy": {
        var body   = document.getElementById("policyContent");
        var arrow  = document.querySelector(".auth-policy-arrow");
        if (!body) return;
        var open = body.classList.toggle("open");
        body.style.display = open ? "block" : "none";
        if (arrow) arrow.style.transform = open ? "rotate(180deg)" : "";
        return;
      }

      // ── Legacy ─────────────────────────────────────────
      case "login":       return O.identity && O.identity.login && O.identity.login(t);
      case "signupNext":  return O.identity.signupNext();
      case "signupBack":  return O.identity.signupBack();
      case "signupField": return;
      case "enterDash":   return O.go({ phase: "dash", dash: O.state.account });
      case "switchDash":  return O.go({ dash: v });
      case "restart":
        if (O.brainTest) {
          O.brainTest.state.currentQuestion = 0;
          O.brainTest.state.answers = [];
          O.brainTest.state.responsePacingMs = [];
          O.brainTest.state.rawScoresArray = [];
          O.brainTest.state.isComplete = false;
          O.brainTest.state.isValid = true;
        }
        return O.go({ phase: "intro", signupStage: 1, form: {}, authStep: "email", authEmail: "", recoverSamePw: false, brainTestPhase: "test", academicRecords: null, paymentStatus: null });

      // ---- brain test ----
      case "brainTestStart":
      case "brainTestBegin":
        O.brainTest.init({ sessionId: "sess_" + Date.now(), accountType: O.state.account, userId: O.state.user ? O.state.user.email : "guest" });
        O.brainTest.startQuestionTimer();
        return O.go({ phase: "brainTest", brainTestPhase: "test" });

      case "brainTestAnswer":
        var ansVal = t.getAttribute("data-value");
        O.brainTest.recordAnswer(ansVal);
        O.brainTest.state.currentQuestion++;
        if (O.brainTest.state.currentQuestion >= 60) {
          O.brainTest.state.completedAt = Date.now();
          O.brainTest.scoreAnswers();
          return O.go({ phase: "brainTest", brainTestPhase: "results" });
        }
        O.brainTest.startQuestionTimer();
        return O.render();

      case "brainTestBack":
        if (O.brainTest.state.currentQuestion > 0) {
          O.brainTest.state.currentQuestion--;
          O.brainTest.state.answers.pop();
          O.brainTest.state.responsePacingMs.pop();
          O.brainTest.state.rawScoresArray.pop();
          O.brainTest.startQuestionTimer();
          return O.render();
        }
        return;

      // ---- intake form ----
      case "intakeStart":
        return O.go({ phase: "intake" });

      case "intakeNext":
        if (O.intakeForm && O.intakeForm.next) { O.intakeForm.next(); }
        return;
      case "intakeBack":
        if (O.intakeForm && O.intakeForm.back) { O.intakeForm.back(); }
        return;
      case "intakeSkip":
        return O.go({ phase: "academicEntry" });

      // ---- academic records entry ----
      case "academicEntryNext":
        if (O.academicRecords && O.academicRecords.save) { O.academicRecords.save(); }
        return O.go({ phase: "brainTestStart" });
      case "academicEntryBack":
        return O.go({ phase: "intake" });

      // ---- report flow ----
      case "brainTestToReport":
        var payload = O.brainTest.generateReportPayload();
        O.reportEngine.state.brainTestPayload = payload;
        O.reportEngine.state.userProfile = O.state.user || {};
        O.reportEngine.state.academicRecords = O.state.academicRecords || {};
        O.reportEngine.generateAllReports(payload, O.state.academicRecords || {}, O.state.user || {});
        return O.go({ phase: "reportView", reportPhase: "summary" });

      case "viewReportDoc":
        var docType = t.getAttribute("data-doc-type");
        return O.go({ phase: "reportView", reportPhase: "detail", currentDoc: docType });

      case "reportBack":
        return O.go({ phase: "reportView", reportPhase: "summary" });

      // ---- payment / export ----
      case "exportReportPDF":
        var docT = t.getAttribute("data-doc-type");
        var isDev = O.state.user && O.state.user.role === "developer";
        if (isDev) {
          if (O.pdfExport) { O.pdfExport.trigger(docT); }
          else { alert("PDF export queued: " + docT); }
        } else {
          return O.go({ phase: "payment", paymentPending: { docType: docT, amount: 40 } });
        }
        return;

      case "paymentMpesa":
        if (O.payment) { O.payment.initiateMpesa(); }
        return;
      case "paymentStripe":
        if (O.payment) { O.payment.initiateStripe(); }
        return;
      case "paymentBack":
        return O.go({ phase: "reportView", reportPhase: "summary" });
      case "paymentSuccess":
        if (O.payment) { O.payment.unlock(); }
        return;

      default: return;
    }
  });

  // capture input changes into form state
  document.addEventListener("input", function (e) {
    var f = e.target.getAttribute && e.target.getAttribute("data-field");
    if (!f) return;
    O.state.form[f] = e.target.value;

    // live password-requirements checklist: tick rules as they're met
    if (O.PW_RULES) {
      var list = document.querySelector('.auth-pwreq[data-pwfor="' + f + '"]');
      if (list) {
        var val = e.target.value || "";
        O.PW_RULES.forEach(function (r) {
          var item = list.querySelector('[data-rule="' + r.k + '"]');
          if (item) item.classList.toggle("met", r.test(val));
        });
      }
    }
  });

  // ---- helpers ----
  O.esc = function (x) {
    return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  O.dot = function (c) { return '<span class="dot" style="background:' + c + '"></span>'; };

  // ---- rotating ring logo ----
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

  // ---- SVG charts ----
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

  // ---- mock analytics data (replaced by Analytics Engine) ----
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
    var s = O.state;
    var displayName = s.user ? (s.user.firstName || s.user.email || "User") : "Guest";
    var who = {
      personal: displayName,
      family: "Family Dashboard",
      organization: s.user ? (s.user.organization || "Organization") : "Organization",
      developer: "Developer Console"
    }[dash] || displayName;
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
        '&nbsp;<button class="btn' + (dark ? " dark" : "") + '" data-action="logout" style="font-size:11px;padding:5px 10px">Sign out</button>' +
      '</div>' +
      '<div class="switcher">' + sw + '</div>' +
    '</div>';
  };

})(window.OCRA);
