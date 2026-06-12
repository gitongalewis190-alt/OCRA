/* ============================================================
   ANTI-CHEAT MODULE — Behavioural telemetry + transparent flagging
   All analysis is client-side. Signals are soft flags — no hard
   blocks without a human-solvable challenge. Never breaks UX.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";
  var AC = (O.antiCheat = {});

  // ── Severity constants ─────────────────────────────────────────
  AC.SEV = { LOW: 1, MED: 2, HIGH: 3 };

  // ── Flag catalogue ─────────────────────────────────────────────
  AC.FLAGS = {
    TOO_FAST_FILL:       { sev: AC.SEV.HIGH, label: "Suspiciously fast form completion" },
    BULK_PASTE:          { sev: AC.SEV.MED,  label: "Large text pasted at once" },
    NO_CORRECTIONS:      { sev: AC.SEV.LOW,  label: "No typos or corrections made" },
    UNIFORM_TYPING:      { sev: AC.SEV.MED,  label: "Unnaturally consistent keystroke timing" },
    FAKE_EMAIL:          { sev: AC.SEV.MED,  label: "Email looks like a test/bot account" },
    IMPOSSIBLE_AGE:      { sev: AC.SEV.HIGH, label: "Date of birth is implausible" },
    FUTURE_DOB:          { sev: AC.SEV.HIGH, label: "Date of birth is in the future" },
    PHONE_MISMATCH:      { sev: AC.SEV.MED,  label: "Phone dial code does not match country" },
    WEAK_RECOVERY:       { sev: AC.SEV.MED,  label: "Recovery answers are too short or trivial" },
    RECOVERY_ALL_SAME:   { sev: AC.SEV.HIGH, label: "All four recovery answers are identical" },
    SEQUENTIAL_PW:       { sev: AC.SEV.LOW,  label: "Password follows a predictable pattern" },
    HONEYPOT:            { sev: AC.SEV.HIGH, label: "Honeypot field was filled" },
    BRAIN_TOO_FAST:      { sev: AC.SEV.HIGH, label: "Brain test answered impossibly fast" },
    BRAIN_UNIFORM_SPEED: { sev: AC.SEV.HIGH, label: "Brain test response times suspiciously uniform" },
    BRAIN_SAME_ANSWER:   { sev: AC.SEV.HIGH, label: "Same brain test option chosen most of the time" },
    BRAIN_TAB_AWAY:      { sev: AC.SEV.MED,  label: "User left the page during brain test" },
  };

  // ── Session state ──────────────────────────────────────────────
  AC.session = {
    signupStartTs:   null,
    fieldTimes:      {},      // key → { first, last, keyIntervals:[], backspaces, pastes }
    flags:           [],      // { code, sev, label, detail, ts }
    challengePassed: false,
    honeypotFired:   false,
    tabAwayCount:    0,
    brainTest: {
      responseTimes: [],
      answerKeys:    [],
    },
  };

  // ── Internals ──────────────────────────────────────────────────
  AC._lastKeyTs = {};    // field → timestamp of last keydown
  AC._prevLens  = {};    // field → last known value length (for paste detection)
  AC._challenge = null;  // { q, answer }
  AC._btTabListener = null;

  // ── Aggregate suspicion score ──────────────────────────────────
  AC.score = function () {
    return AC.session.flags.reduce(function (acc, f) { return acc + f.sev; }, 0);
  };

  // ── Add a flag (idempotent per code per session) ───────────────
  AC.flag = function (code, detail) {
    var def = AC.FLAGS[code];
    if (!def) return;
    // deduplicate same code within session
    for (var i = 0; i < AC.session.flags.length; i++) {
      if (AC.session.flags[i].code === code) return;
    }
    var entry = { code: code, sev: def.sev, label: def.label, detail: detail || "", ts: Date.now() };
    AC.session.flags.push(entry);
    if (O.dataManagement) O.dataManagement.log("AC_FLAG", code + (detail ? " | " + detail : ""));
    AC._updateBanner();
  };

  // ── Reset for fresh signup ─────────────────────────────────────
  AC.startSignup = function () {
    AC.session.signupStartTs = Date.now();
    AC.session.fieldTimes    = {};
    AC.session.flags         = [];
    AC.session.challengePassed = false;
    AC.session.honeypotFired   = false;
    AC._lastKeyTs = {};
    AC._prevLens  = {};
    AC._challenge = null;
    AC._hideBanner();
  };

  // ── Honeypot check (called from input listener) ────────────────
  AC.checkHoneypot = function (field, value) {
    if (field === "hp_name" || field === "hp_email" || field === "hp_website") {
      if (value && value.trim()) {
        AC.session.honeypotFired = true;
        AC.flag("HONEYPOT", "field=" + field);
      }
    }
  };

  // ── Record keydown (timing telemetry) ─────────────────────────
  AC.recordKeydown = function (field, isBackspace) {
    var now = Date.now();
    var ft  = AC.session.fieldTimes[field];
    if (!ft) {
      ft = AC.session.fieldTimes[field] = { first: now, last: now, keyIntervals: [], backspaces: 0, pastes: 0 };
    }
    if (AC._lastKeyTs[field]) {
      var iv = now - AC._lastKeyTs[field];
      if (iv > 0 && iv < 2000) ft.keyIntervals.push(iv);
    }
    AC._lastKeyTs[field] = now;
    ft.last = now;
    if (isBackspace) ft.backspaces++;
  };

  // ── Record value change (paste detection) ─────────────────────
  AC.recordValueChange = function (field, newLen) {
    var prev = AC._prevLens[field] || 0;
    var delta = newLen - prev;
    AC._prevLens[field] = newLen;
    if (delta > 15) {
      var ft = AC.session.fieldTimes[field];
      if (ft) ft.pastes++;
      AC.flag("BULK_PASTE", "field=" + field + " +" + delta + "chars");
    }
  };

  // ── Analyze a completed signup stage ──────────────────────────
  AC.analyzeStage = function (stage, form) {
    // Honeypot
    if (form.hp_name || form.hp_email || form.hp_website) {
      AC.flag("HONEYPOT");
    }

    // Aggregate typing stats across stage fields
    var allIntervals = [], totalBackspaces = 0, totalKeys = 0;
    (stage.fields || []).forEach(function (fl) {
      var ft = AC.session.fieldTimes[fl[0]];
      if (!ft) return;
      allIntervals = allIntervals.concat(ft.keyIntervals);
      totalBackspaces += ft.backspaces;
      totalKeys += ft.keyIntervals.length;
    });

    // Zero corrections on a field-heavy stage
    if (totalKeys > 12 && totalBackspaces === 0) {
      AC.flag("NO_CORRECTIONS", "keys=" + totalKeys);
    }

    // Coefficient of variation on keystroke intervals
    if (allIntervals.length >= 8) {
      var mean = allIntervals.reduce(function (a, b) { return a + b; }, 0) / allIntervals.length;
      if (mean > 0) {
        var variance = allIntervals.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / allIntervals.length;
        var cv = Math.sqrt(variance) / mean;
        if (cv < 0.1) AC.flag("UNIFORM_TYPING", "cv=" + cv.toFixed(3));
      }
    }

    // Fake email patterns
    if (form.email) {
      var fakes = [/^test@/i, /^admin@/i, /^noreply@/i, /^foo@/i, /^bar@/i,
                   /^a+@/i, /^abc@/i, /^1234/, /^user\d*@/i, /^demo@/i, /^sample@/i];
      if (fakes.some(function (p) { return p.test(form.email); })) {
        AC.flag("FAKE_EMAIL", form.email);
      }
    }

    // Date of birth validation
    if (form.dob) {
      var dob = new Date(form.dob);
      if (!isNaN(dob)) {
        if (dob > new Date()) {
          AC.flag("FUTURE_DOB");
        } else {
          var ageYrs = (Date.now() - dob.getTime()) / 31557600000;
          if (ageYrs < 3 || ageYrs > 120) AC.flag("IMPOSSIBLE_AGE", "age≈" + Math.round(ageYrs));
        }
      }
    }

    // Phone dial code ↔ country mismatch
    if (form.country && form.phoneCode && O.identity && O.identity.dialCodeForCountry) {
      var expected = O.identity.dialCodeForCountry(form.country);
      if (expected && form.phoneCode !== expected) {
        AC.flag("PHONE_MISMATCH", form.country + " expects " + expected + " got " + form.phoneCode);
      }
    }

    // Recovery answer quality (stage with recovery questions)
    if (stage.recovery && O.identity) {
      var keys = O.identity.recovery.map(function (r) { return r.k; });
      var answers = keys.map(function (k) { return (form[k] || "").trim().toLowerCase(); });
      var nonEmpty = answers.filter(function (a) { return a; });
      if (nonEmpty.length > 0) {
        if (nonEmpty.some(function (a) { return a.length < 2; })) {
          AC.flag("WEAK_RECOVERY", "answer too short");
        }
        var unique = nonEmpty.filter(function (v, i, a) { return a.indexOf(v) === i; });
        if (unique.length === 1 && nonEmpty.length === 4) {
          AC.flag("RECOVERY_ALL_SAME");
        }
      }
    }

    // Sequential/trivial password
    if (form.password) {
      var trivial = /^(abc|qwerty|pass|1234|letme|admin|ocra)/i.test(form.password) ||
                    /^[a-z]+\d+[^a-z0-9]?$/i.test(form.password);
      if (trivial) AC.flag("SEQUENTIAL_PW");
    }
  };

  // ── Final pre-create check (timing + honeypot gate) ───────────
  AC.finalCheck = function (form) {
    // Total signup time
    if (AC.session.signupStartTs) {
      var elapsed = (Date.now() - AC.session.signupStartTs) / 1000;
      if (elapsed < 30) AC.flag("TOO_FAST_FILL", elapsed.toFixed(1) + "s");
    }
    // Final honeypot pass
    if (form && (form.hp_name || form.hp_email || form.hp_website)) {
      AC.flag("HONEYPOT");
    }
    var sc = AC.score();
    return {
      passed:   sc < 10 || AC.session.challengePassed,
      score:    sc,
      flags:    AC.session.flags.slice(),
      honeypot: AC.session.honeypotFired,
    };
  };

  // ── Brain test analysis ────────────────────────────────────────
  AC.analyzeBrainTest = function (responseTimes, answerKeys) {
    if (!responseTimes || responseTimes.length < 10) return;
    var n = responseTimes.length;

    // Average response time
    var sum = responseTimes.reduce(function (a, b) { return a + b; }, 0);
    var avg = sum / n;
    if (avg < 800) AC.flag("BRAIN_TOO_FAST", "avg=" + Math.round(avg) + "ms");

    // Coefficient of variation
    if (avg > 0) {
      var variance = responseTimes.reduce(function (a, t) { return a + (t - avg) * (t - avg); }, 0) / n;
      var cv = Math.sqrt(variance) / avg;
      if (cv < 0.1) AC.flag("BRAIN_UNIFORM_SPEED", "cv=" + cv.toFixed(3));
    }

    // Dominant answer frequency
    if (answerKeys && answerKeys.length >= 20) {
      var counts = {};
      answerKeys.forEach(function (a) { counts[a] = (counts[a] || 0) + 1; });
      var maxCount = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; }));
      var dominance = maxCount / answerKeys.length;
      if (dominance > 0.75) AC.flag("BRAIN_SAME_ANSWER", "dominance=" + (dominance * 100).toFixed(0) + "%");
    }

    // Tab-away detection (recorded during test)
    if (AC.session.tabAwayCount > 2) AC.flag("BRAIN_TAB_AWAY", "count=" + AC.session.tabAwayCount);
  };

  // ── Tab-away tracking (brain test) ────────────────────────────
  AC.startBrainTestTracking = function () {
    AC.session.tabAwayCount = 0;
    if (AC._btTabListener) document.removeEventListener("visibilitychange", AC._btTabListener);
    AC._btTabListener = function () {
      if (document.hidden) AC.session.tabAwayCount++;
    };
    document.addEventListener("visibilitychange", AC._btTabListener);
  };

  AC.stopBrainTestTracking = function () {
    if (AC._btTabListener) {
      document.removeEventListener("visibilitychange", AC._btTabListener);
      AC._btTabListener = null;
    }
  };

  // ── Math challenge ─────────────────────────────────────────────
  AC.generateChallenge = function () {
    var a = Math.floor(Math.random() * 8) + 2;
    var b = Math.floor(Math.random() * 8) + 2;
    var variants = [
      { q: a + " + " + b,             a: a + b },
      { q: a + " × " + b,        a: a * b },   // ×
      { q: (a + b) + " − " + a,  a: b },        // −
    ];
    var v = variants[Math.floor(Math.random() * variants.length)];
    AC._challenge = { q: v.q, answer: v.a };
    return AC._challenge;
  };

  AC.checkChallenge = function (input) {
    if (!AC._challenge) { AC.session.challengePassed = true; return true; }
    var correct = parseInt(input, 10) === AC._challenge.answer;
    if (correct) AC.session.challengePassed = true;
    return correct;
  };

  // ── Banner (transparent, non-blocking) ────────────────────────
  var _bannerDismissed = false;
  var _bannerRendered  = false;

  AC._updateBanner = function () {
    if (_bannerDismissed) return;
    if (typeof document === "undefined") return;
    var sc = AC.score();
    if (sc < 3) { AC._hideBanner(); return; }

    var el = document.getElementById("ac-banner");
    if (!el) {
      el = document.createElement("div");
      el.id = "ac-banner";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.style.display = "";
    _bannerRendered = true;

    var cls = sc >= 10 ? "high" : sc >= 6 ? "warn" : "info";
    var icon = sc >= 6 ? "⚠️" : "ℹ️";
    var msgs = {
      info: "We noticed some unusual activity — your data is still safe.",
      warn: "Some responses look unusual. Please review your entries.",
      high: "This session looks automated. Confirm you&rsquo;re human to continue.",
    };

    el.className = "ac-banner ac-banner-" + cls;
    el.innerHTML =
      '<span class="ac-icon">' + icon + '</span>' +
      '<span class="ac-msg">' + msgs[cls] + '</span>' +
      (sc >= 6
        ? '<button class="ac-cta" data-action="acChallenge">Verify me</button>'
        : '<button class="ac-dismiss" data-action="acDismiss" aria-label="Dismiss">&times;</button>'
      );
  };

  AC._hideBanner = function () {
    var el = document.getElementById("ac-banner");
    if (el) el.style.display = "none";
  };

  AC.dismissBanner = function () {
    _bannerDismissed = true;
    AC._hideBanner();
  };

  AC.renderChallengeModal = function () {
    var ch = AC.generateChallenge();
    return '' +
    '<div id="ac-modal" style="position:fixed;inset:0;z-index:9999;' +
         'display:flex;align-items:center;justify-content:center;' +
         'background:rgba(0,0,0,.7);backdrop-filter:blur(8px)">' +
      '<div style="background:rgba(12,30,48,.95);border:1px solid rgba(56,189,248,.25);' +
           'border-radius:20px;padding:34px 30px;width:340px;text-align:center;' +
           'box-shadow:0 16px 60px rgba(0,0,0,.5)">' +
        '<div style="font-size:36px;margin-bottom:12px">&#129302;</div>' +
        '<div style="font-size:17px;font-weight:800;color:#dce8f2;margin-bottom:8px">Quick human check</div>' +
        '<div style="font-size:13px;color:rgba(220,232,242,.55);margin-bottom:22px;line-height:1.6">' +
          'Solve this to confirm you&rsquo;re not a bot.' +
        '</div>' +
        '<div style="font-size:28px;font-weight:700;color:#38BDF8;margin-bottom:18px" id="ac-ch-q">' + ch.q + ' = ?</div>' +
        '<input id="ac-ch-input" type="number" placeholder="Your answer" ' +
          'style="width:100%;padding:13px;border-radius:12px;border:1px solid rgba(255,255,255,.12);' +
          'background:rgba(255,255,255,.07);color:#dce8f2;font-size:16px;font-family:inherit;' +
          'text-align:center;outline:none;margin-bottom:8px"/>' +
        '<p id="ac-ch-err" style="color:#FF6B6B;font-size:12px;min-height:18px;margin:0 0 12px"></p>' +
        '<button data-action="acChallengeSubmit" ' +
          'style="width:100%;padding:14px;border:none;border-radius:12px;' +
          'background:linear-gradient(135deg,#0e6ba8,#38BDF8);color:#fff;' +
          'font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Confirm</button>' +
      '</div>' +
    '</div>';
  };

  AC.closeChallengeModal = function () {
    var m = document.getElementById("ac-modal");
    if (m) m.parentNode.removeChild(m);
  };

  // ── Reset (test helper + new signup) ──────────────────────────
  AC.reset = function () {
    AC.session.signupStartTs   = null;
    AC.session.fieldTimes      = {};
    AC.session.flags           = [];
    AC.session.challengePassed = false;
    AC.session.honeypotFired   = false;
    AC.session.tabAwayCount    = 0;
    AC.session.brainTest       = { responseTimes: [], answerKeys: [] };
    AC._lastKeyTs = {};
    AC._prevLens  = {};
    AC._challenge = null;
    _bannerDismissed = false;
    _bannerRendered  = false;
    AC._hideBanner();
  };

  console.log("✅ Anti-Cheat Module Loaded — behavioural telemetry, honeypot, brain-test analysis");

})(window.OCRA);
