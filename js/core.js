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
      } else if (s.phase === "auth" || s.phase === "recover" || s.phase === "devLogin") {
        var fn = O.screens[s.phase];
        html = fn ? fn() : ""; // auth screens own their full-page container
      } else {
        var fn = O.screens[s.phase];
        html = '<div class="stage">' + (fn ? fn() : "") + '</div>';
      }

      app.innerHTML = html;
      O.bindHold();
      O._updateGates();
      if (s.phase === "intro" && O.introAnimate) O.introAnimate();
      else if (O.flowAnimate) O.flowAnimate();
    } catch (err) {
      O.fail(err);
    }
  };

  // ---- last-resort error surface: a visible banner beats a white screen ----
  O.fail = function (err) {
    try { if (window.console && console.error) console.error("[OCRA]", err); } catch (e) {}
    try { if (O.voice) O.voice.say("OCRA encountered an issue.", "adam", { volume: 0.65 }); } catch (e) {}
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

      case "academics":   return O.go({ phase: "auth", authMode: "login", authStep: "email", account: "personal" });
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

      case "pickAccount": {
        var _patch = { account: v };
        if (O.state.phase === "auth") { _patch.signupStage = 1; _patch.form = {}; _patch.authStep = "email"; }
        return O.go(_patch);
      }
      case "accountNext": return O.go({ phase: "auth", authMode: "login" });
      case "setAuthMode": {
        if (v === "signup" && O.antiCheat) O.antiCheat.startSignup();
        return O.go({ authMode: v, signupStage: 1, form: {} });
      }
      case "login": {
        var loginPwEl = document.getElementById("loginPw");
        var loginMsg  = document.getElementById("authMsg");
        if (!loginPwEl || !loginPwEl.value) {
          if (loginMsg) loginMsg.textContent = "Enter your password.";
          return;
        }
        return O.identity.login(t);
      }
      case "signupNext": {
        if (O.antiCheat) {
          var _acStg = (O.identity.stages[O.state.account] || [])[O.state.signupStage - 1];
          if (_acStg) O.antiCheat.analyzeStage(_acStg, O.state.form);
        }
        return O.identity.signupNext();
      }
      case "signupBack":  return O.identity.signupBack();
      case "signupField": return;
      case "enterDash":   return O.go({ phase: "dash", dash: O.state.account });

      // ---- auth extras ----
      case "togglePw": {
        var inp = document.getElementById("pwField") ||
                  document.getElementById("loginPw") ||
                  document.getElementById("recoverPw");
        if (inp) {
          inp.type = inp.type === "password" ? "text" : "password";
        }
        return;
      }

      case "forgotPassword": {
        var emailEl = document.querySelector('[data-field="email"]');
        var em = emailEl ? emailEl.value : (O.state.form.email || "");
        return O.go({ phase: "recover", recoverEmail: em, recoverSamePw: false });
      }

      case "emailNext": {
        var emailEl2 = document.getElementById("loginEmail") || document.querySelector('[data-field="email"]');
        var em2 = emailEl2 ? emailEl2.value.trim() : "";
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        var m3 = document.getElementById("authMsg");
        if (!em2 || !re.test(em2)) { if (m3) m3.textContent = "Enter a valid email address."; return; }
        O.state.form.email = em2;
        return O.go({ authStep: "password", authEmail: em2 });
      }

      case "changeEmail":
        return O.go({ authStep: "email", authEmail: "" });

      case "devEnter": {
        var devEmailEl = document.getElementById("devEmail") || document.querySelector('[data-field="devEmail"]');
        var devPwEl    = document.getElementById("devPw")    || document.querySelector('[data-field="devPassword"]');
        var devEm = devEmailEl ? devEmailEl.value.trim() : "";
        var devPw = devPwEl    ? devPwEl.value           : "";
        var devMsg = document.getElementById("devMsg");
        if (!devEm || !devPw) { if (devMsg) devMsg.textContent = "Enter email and password."; return; }
        if (O.auth) {
          O.auth.logIn(devEm, devPw,
            function (user) {
              if (user.role !== "developer") {
                if (devMsg) devMsg.textContent = "This account does not have developer access.";
                return;
              }
              O.go({ phase: "dash", dash: "developer" });
            },
            function (err) { if (devMsg) devMsg.textContent = err; }
          );
        }
        return;
      }

      case "backToLogin":
        return O.go({ phase: "auth", authMode: "login", authStep: "email" });

      case "socialAuth": {
        if (O.auth && O.auth.socialAuth) {
          O.auth.socialAuth(v, null,
            function (user) { O.go({ phase: "dash", dash: user.role === "developer" ? "developer" : user.accountType }); },
            function ()     { O.go({ phase: "auth", authMode: "signup" }); },
            function (err)  {
              var m = document.getElementById("authMsg");
              if (m) m.textContent = err || "Social sign-in unavailable.";
            }
          );
        } else {
          var m2 = document.getElementById("authMsg");
          if (m2) m2.textContent = v.charAt(0).toUpperCase() + v.slice(1) + " sign-in is not configured yet.";
        }
        return;
      }

      case "otpSend": {
        var keyAttr = t.getAttribute("data-key") || "email";
        var emailInput = document.querySelector('[data-field="' + keyAttr + '"]');
        var emailVal   = emailInput ? emailInput.value.trim() : (O.state.form[keyAttr] || "");
        if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
          var box = document.getElementById("stageErr");
          if (box) box.textContent = "Enter a valid email address first.";
          return;
        }
        O.state.form[keyAttr] = emailVal;
        O._otpCode   = String(Math.floor(100000 + Math.random() * 899999));
        O._otpSentTo = emailVal;
        if (O.notifications) {
          O.notifications.push("Demo — OTP code: " + O._otpCode, O.notifications.TYPES.INFO);
        } else {
          console.info("[OCRA OTP]", O._otpCode);
        }
        O.render();
        return;
      }

      case "otpVerify": {
        var keyAttr2 = t.getAttribute("data-key") || "email";
        var entered  = (document.getElementById("otpInput") || {}).value || "";
        if (entered.trim() === O._otpCode) {
          O.state.form.emailVerified  = true;
          O.state.form._verifiedEmail = O._otpSentTo;
          O._otpCode   = null;
          O._otpSentTo = null;
          if (O.notifications) O.notifications.push("Email verified ✓", O.notifications.TYPES.SUCCESS);
        } else {
          var box2 = document.getElementById("stageErr");
          if (box2) box2.textContent = "Incorrect code — check and try again.";
        }
        O.render();
        return;
      }

      case "signupCreate": {
        if (O.antiCheat) {
          var _acRes = O.antiCheat.finalCheck(O.state.form);
          if (!_acRes.passed) {
            if (!document.getElementById("ac-modal")) {
              document.body.insertAdjacentHTML("beforeend", O.antiCheat.renderChallengeModal());
            }
            O._pendingCreate = true;
            return;
          }
        }
        O._pendingCreate = false;
        O._creating = true;
        O.render();
        var f = O.state.form, acct = O.state.account;
        setTimeout(function () {
          if (O.auth) {
            O.auth.signUp(acct, f,
              function (user) {
                O._creating = false;
                try { if (O.voice) O.voice.say("Welcome to OCRA, " + (user.firstName || "there") + ".", "aria"); } catch (e) {}
                O.go({ phase: "dash", dash: user.role === "developer" ? "developer" : user.accountType, form: {}, signupStage: 1 });
              },
              function (err) {
                O._creating = false;
                O.go({ signupStage: O.state.signupStage }); // re-render congrats
                setTimeout(function () {
                  var eb = document.getElementById("stageErr");
                  if (eb) eb.textContent = err;
                }, 50);
              }
            );
          }
        }, 400);
        return;
      }

      case "recoverSubmit": {
        var card2 = t.closest("[data-auth]");
        if (!card2) return;
        var email2   = (card2.querySelector('[data-field="email"]') || {}).value || "";
        var newPw    = (card2.querySelector('[data-field="newPassword"]') || {}).value || "";
        var answers2 = {};
        O.identity.recovery.forEach(function (r) {
          var el = card2.querySelector('[data-field="' + r.k + '"]');
          answers2[r.k] = el ? el.value : "";
        });
        var msgEl = document.getElementById("recoverMsg");
        if (!O.identity.validEmail(email2)) {
          if (msgEl) msgEl.textContent = "Enter a valid email address.";
          return;
        }
        var emptyAnswer = O.identity.recovery.find(function (r) { return !answers2[r.k] || !answers2[r.k].trim(); });
        if (emptyAnswer) {
          if (msgEl) msgEl.textContent = emptyAnswer.q + " is required.";
          return;
        }
        if (!O.identity.validPassword(newPw)) {
          if (msgEl) msgEl.textContent = "Password needs 9+ chars, a capital, a number and a symbol.";
          return;
        }
        if (O.auth && O.auth.passwordMatches && O.auth.passwordMatches(email2, newPw)) {
          O.go({ recoverSamePw: true });
          return;
        }
        if (O.auth) {
          O.auth.recover(email2, answers2, newPw,
            function ()    { O.go({ phase: "auth", authMode: "login", recoverSamePw: false }); },
            function (err) { if (msgEl) msgEl.textContent = err; }
          );
        }
        return;
      }

      case "recoverKeepOld":
        if (O.auth && O.auth.isLoggedIn && O.auth.isLoggedIn()) {
          O.go({ phase: "dash", dash: O.state.user ? (O.state.user.role === "developer" ? "developer" : O.state.user.accountType) : "personal" });
        } else {
          O.go({ phase: "auth", authMode: "login", recoverSamePw: false });
        }
        return;

      case "recoverChangePw":
        return O.go({ recoverSamePw: false });

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
        if (O.antiCheat) O.antiCheat.startBrainTestTracking();
        O.brainTest.init({ sessionId: "sess_" + Date.now(), accountType: O.state.account, userId: O.state.user ? O.state.user.email : "guest" });
        O.brainTest.startQuestionTimer();
        try { if (O.voice) O.voice.say("Brain test starting. Sixty questions. Stay focused.", "ryan"); } catch (e) {}
        return O.go({ phase: "brainTest", brainTestPhase: "test" });

      case "brainTestAnswer":
        var ansVal = t.getAttribute("data-value");
        O.brainTest.recordAnswer(ansVal);
        O.brainTest.state.currentQuestion++;
        if (O.brainTest.state.currentQuestion >= 60) {
          O.brainTest.state.completedAt = Date.now();
          O.brainTest.scoreAnswers();
          if (O.antiCheat) {
            O.antiCheat.stopBrainTestTracking();
            O.antiCheat.analyzeBrainTest(
              O.brainTest.state.responsePacingMs || [],
              O.brainTest.state.answers || []
            );
          }
          try { if (O.voice) O.voice.say("Test complete. Calculating your results.", "ryan"); } catch (e) {}
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
        try { if (O.voice) O.voice.say("Your reports are ready.", "adam"); } catch (e) {}
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
        try { if (O.voice) O.voice.say("Payment confirmed. Your document is now unlocked.", "aria"); } catch (e) {}
        return;

      // ---- voice ----
      case "voiceMute":
        if (O.voice) {
          var _wasMuted = O.voice.toggle();
          if (!_wasMuted) O.voice.say("Voice on.", "adam");
          O.render();
        }
        return;

      // ---- anti-cheat ----
      case "acDismiss":
        if (O.antiCheat && O.antiCheat.dismissBanner) O.antiCheat.dismissBanner();
        return;

      case "acChallenge":
        if (O.antiCheat && !document.getElementById("ac-modal")) {
          document.body.insertAdjacentHTML("beforeend", O.antiCheat.renderChallengeModal());
        }
        return;

      case "acChallengeSubmit": {
        var _acIn = (document.getElementById("ac-ch-input") || {}).value || "";
        if (!O.antiCheat || !O.antiCheat.checkChallenge(_acIn)) {
          var _acEr = document.getElementById("ac-ch-err");
          if (_acEr) _acEr.textContent = "Wrong answer — try again.";
          if (O.antiCheat) {
            var _nc  = O.antiCheat.generateChallenge();
            var _qel = document.getElementById("ac-ch-q");
            var _iel = document.getElementById("ac-ch-input");
            if (_qel) _qel.textContent = _nc.q + " = ?";
            if (_iel) { _iel.value = ""; _iel.focus(); }
          }
          return;
        }
        if (O.antiCheat) O.antiCheat.closeChallengeModal();
        if (O._pendingCreate) {
          O._pendingCreate = false;
          O._creating = true;
          O.render();
          var _pf = O.state.form, _pa = O.state.account;
          setTimeout(function () {
            if (O.auth) {
              O.auth.signUp(_pa, _pf,
                function (user) {
                  O._creating = false;
                  O.go({ phase: "dash", dash: user.role === "developer" ? "developer" : user.accountType, form: {}, signupStage: 1 });
                },
                function (err) {
                  O._creating = false;
                  O.go({ signupStage: O.state.signupStage });
                  setTimeout(function () { var _eb = document.getElementById("stageErr"); if (_eb) _eb.textContent = err; }, 50);
                }
              );
            }
          }, 400);
        }
        return;
      }

      default: return;
    }
  });

  // capture input changes into form state + live pw checklist
  document.addEventListener("input", function (e) {
    var f = e.target.getAttribute && e.target.getAttribute("data-field");
    if (f) {
      O.state.form[f] = e.target.value;
      if (O.antiCheat) {
        O.antiCheat.recordValueChange(f, e.target.value.length);
        O.antiCheat.checkHoneypot(f, e.target.value);
      }
    }

    // live password checklist
    var isPw = e.target.id === "pwField" || e.target.id === "loginPw" || e.target.id === "recoverPw";
    if (isPw && O.PW_RULES) {
      var val2 = e.target.value;
      var list = document.querySelector(".auth-pwreq");
      if (list) {
        O.PW_RULES.forEach(function (r, i) {
          var li = list.children[i];
          if (li) li.className = r.test(val2) ? "met" : "";
        });
      }
    }

    // live gate update on every field change
    O._updateGates();

    // when country changes: auto-set phone code
    if (f === "country" && O.identity && O.identity.dialCodeForCountry) {
      var code = O.identity.dialCodeForCountry(e.target.value);
      if (code) {
        O.state.form.phoneCode = code;
        var sel = document.querySelector('[data-field="phoneCode"]');
        if (sel) sel.value = code;
      }
      // refresh system-country hint without full re-render
      O._refreshSystemHint();
    }
    // when system changes: refresh level select + coherence hint
    if (f === "system") {
      O._refreshSystemHint();
      var levelSel = document.querySelector('[data-field="level"]');
      if (levelSel && O.identity && O.identity.levelsForSystem) {
        var levels = O.identity.levelsForSystem(e.target.value);
        levelSel.innerHTML = '<option value="">Select level</option>' +
          levels.map(function (l) { return '<option value="' + l + '">' + l + '</option>'; }).join("");
        levelSel.disabled = false;
        levelSel.closest && levelSel.closest(".ah") && levelSel.closest(".ah").classList && levelSel.closest(".ah").classList.remove("disabled");
        O.state.form.level = "";
      }
    }
  });

  // keystroke timing telemetry for anti-cheat
  document.addEventListener("keydown", function (e) {
    var kf = e.target && e.target.getAttribute && e.target.getAttribute("data-field");
    if (!kf || !O.antiCheat) return;
    O.antiCheat.recordKeydown(kf, e.key === "Backspace" || e.key === "Delete");
  });

  // ---- live button gating ----
  // Called after every render and every input event.
  // Sets button.disabled via live validation — no re-render needed.
  // CSS .auth-btn:disabled already handles visual (opacity .4, no-pointer).
  O._updateGates = function () {
    if (!O.identity) return;
    var s = O.state;

    function gate(btn, enabled) {
      if (!btn) return;
      btn.disabled = !enabled;
      btn.title = enabled ? "" : (btn._gateMsg || "");
    }

    // ── signup Continue ─────────────────────────────────────────────
    if (s.phase === "auth" && s.authMode === "signup") {
      var stages  = O.identity.stages[s.account];
      var stage   = stages && stages[s.signupStage - 1];
      var nextBtn = document.querySelector('[data-action="signupNext"]');
      if (nextBtn && stage && !stage.congrats) {
        var sErr = O.identity.validateStage(stage, s.form);
        if (!sErr && s.form.system && s.form.country &&
            !O.identity.systemValidForCountry(s.form.system, s.form.country)) {
          sErr = s.form.system + " is not typical for " + s.form.country;
        }
        nextBtn._gateMsg = sErr;
        gate(nextBtn, !sErr);
      }
    }

    // ── login step 1: email Continue ────────────────────────────────
    if (s.phase === "auth" && s.authMode === "login" && s.authStep === "email") {
      var eInp   = document.getElementById("loginEmail");
      var eBtn   = document.querySelector('[data-action="emailNext"]');
      var eValid = eInp && O.identity.validEmail(eInp.value.trim());
      if (eBtn) eBtn._gateMsg = "Enter a valid email address.";
      gate(eBtn, eValid);
    }

    // ── login step 2: password Sign in ──────────────────────────────
    if (s.phase === "auth" && s.authMode === "login" && s.authStep === "password") {
      var pInp = document.getElementById("loginPw");
      var pBtn = document.querySelector('[data-action="login"]');
      if (pBtn) pBtn._gateMsg = "Enter your password.";
      gate(pBtn, pInp && pInp.value.length > 0);
    }

    // ── recovery Reset password ─────────────────────────────────────
    if (s.phase === "auth" && s.authMode === "recover" && !s.recoverSamePw) {
      var rCard = document.querySelector('[data-auth]');
      var rBtn  = document.querySelector('[data-action="recoverSubmit"]');
      if (rBtn && rCard) {
        var rEmail = ((rCard.querySelector('[data-field="email"]') || {}).value || "").trim();
        var rPw    = (rCard.querySelector('[data-field="newPassword"]') || {}).value || "";
        var rAns   = O.identity.recovery.every(function (r) {
          var el = rCard.querySelector('[data-field="' + r.k + '"]');
          return el && el.value.trim().length > 0;
        });
        var rOk = O.identity.validEmail(rEmail) && O.identity.validPassword(rPw) && rAns;
        rBtn._gateMsg = !O.identity.validEmail(rEmail) ? "Enter a valid email." :
                        !rAns ? "Answer all four recovery questions." :
                        "Password needs 9+ chars, a capital, a number and a symbol.";
        gate(rBtn, rOk);
      }
    }

    // ── developer login Enter ───────────────────────────────────────
    if (s.phase === "devLogin") {
      var dEml = document.getElementById("devEmail");
      var dPwd = document.getElementById("devPw");
      var dBtn = document.querySelector('[data-action="devEnter"]');
      if (dBtn) dBtn._gateMsg = "Enter email and password.";
      gate(dBtn, dEml && dPwd && dEml.value.trim().length > 0 && dPwd.value.length > 0);
    }
  };

  O._refreshSystemHint = function () {
    var hints = document.querySelectorAll(".auth-hint");
    hints.forEach(function (h) {
      if (h.parentNode && (h.parentNode.querySelector('[data-field="system"]') || h.parentNode.querySelector('[data-field="country"]'))) {
        // trigger re-render only for auth signup page to keep it lightweight
        var sys = O.state.form.system, ctry = O.state.form.country;
        if (sys && ctry && O.identity) {
          var ok2 = O.identity.systemValidForCountry(sys, ctry);
          h.className = "auth-hint " + (ok2 ? "ok" : "bad");
          h.textContent = ok2
            ? "✓ " + sys + " works in " + ctry
            : "⚠ " + sys + " is not typical for " + ctry;
        }
      }
    });
  };

  // ---- developer hold (5s press on logo = dev access, zero hint) ----
  O.bindHold = function () {
    var el   = document.getElementById("devHold");
    var ring = document.getElementById("devRing");
    if (!el) return;
    var _t = null, _start = 0, HOLD_MS = 5000;
    var DASH = 289; // full circumference at r=46

    function cancel() {
      clearTimeout(_t);
      if (ring) { ring.style.transition = "none"; ring.setAttribute("stroke-dashoffset", DASH); }
    }
    el.addEventListener("mousedown",   start); el.addEventListener("touchstart",  start, {passive:true});
    el.addEventListener("mouseup",     cancel); el.addEventListener("touchend",   cancel);
    el.addEventListener("mouseleave",  cancel); el.addEventListener("touchcancel",cancel);

    function start() {
      _start = Date.now();
      if (ring) {
        ring.style.transition = "stroke-dashoffset " + (HOLD_MS / 1000) + "s linear";
        ring.setAttribute("stroke-dashoffset", "0");
      }
      _t = setTimeout(function () {
        if (O.auth) {
          // log in as developer (any password accepted)
          O.auth.logIn("gitongalewis190@gmail.com", "dev",
            function (user) { O.state.user = user; O.go({ phase: "dash", dash: "developer" }); },
            function () {}
          );
        } else {
          O.go({ phase: "dash", dash: "developer" });
        }
      }, HOLD_MS);
    }
  };

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
        '&nbsp;<button class="btn" data-action="voiceMute" title="Toggle voice" style="font-size:14px;padding:5px 8px">' + (O.voice && O.voice.isMuted() ? "&#128263;" : "&#128264;") + '</button>' +
        '&nbsp;<button class="btn' + (dark ? " dark" : "") + '" data-action="logout" style="font-size:11px;padding:5px 10px">Sign out</button>' +
      '</div>' +
      '<div class="switcher">' + sw + '</div>' +
    '</div>';
  };

})(window.OCRA);
