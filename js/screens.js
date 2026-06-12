/* ============================================================
   DOMAIN_26 — EXPERIENCE (entry flow screens)
   intro -> choose (academics/finances) -> account type -> auth/signup
   ============================================================ */
(function (O) {
  "use strict";
  var I = O.identity;

  // helper: one feature item for side panels
  function ifeat(accent, title, sub) {
    return '<div class="ifeat" style="opacity:0">' +
      '<div style="font-size:12px;font-weight:700;color:' + accent + ';letter-spacing:.06em;margin-bottom:3px">' + title + '</div>' +
      '<div style="font-size:10px;color:rgba(220,232,242,.45);letter-spacing:.03em">' + sub + '</div>' +
    '</div>';
  }

  // INTRO — cinematic landing: PNG logo from z-depth, split panels converge, mouse parallax, typewriter
  O.screens.intro = function () {
    var DC  = O.developerConsole;
    var key = DC && DC.flags && DC.flags.introPreset || "stellar";
    var p   = O._introPresets && O._introPresets[key] || { bg:"#080c14", accent:"#38BDF8", nc:"#38BDF8", glowC:"rgba(56,189,248,.22)" };

    var iLetters = "INTRODUCING".split("").map(function (c) {
      return '<span class="iletter" style="display:inline-block;opacity:0">' + c + '</span>';
    }).join("");
    var nLetters = "OCRA".split("").map(function (c) {
      return '<span class="nletter" style="display:inline-block;opacity:0;color:' + p.nc + '">' + c + '</span>';
    }).join("");

    return '' +
    '<div id="ocra-intro-stage" style="position:fixed;inset:0;background:' + p.bg + ';overflow:hidden;z-index:100">' +

      // ambient glow backdrop
      '<div id="intro-glow" style="position:absolute;inset:0;pointer-events:none;opacity:0;' +
           'background:radial-gradient(ellipse 60% 60% at 50% 50%,' + p.glowC + ' 0%,transparent 70%)"></div>' +

      // left feature panel
      '<div class="intro-left" style="position:absolute;top:50%;left:0;width:22%;display:none;opacity:0;padding:0 28px;pointer-events:none">' +
        '<div style="display:flex;flex-direction:column;gap:24px">' +
          ifeat(p.accent, "Academic Records",  "Grades \xb7 subjects \xb7 trajectories") +
          ifeat(p.accent, "Brain Test",        "60-question cognitive deep-dive") +
          ifeat(p.accent, "Career Analysis",   "Mapped to 400+ real career paths") +
        '</div>' +
      '</div>' +

      // right feature panel
      '<div class="intro-right" style="position:absolute;top:50%;right:0;width:22%;display:none;opacity:0;padding:0 28px;pointer-events:none">' +
        '<div style="display:flex;flex-direction:column;gap:24px">' +
          ifeat(p.accent, "AI-Powered Insights", "Claude Sonnet analysis engine") +
          ifeat(p.accent, "4-Document Reports",  "Full diagnostic \xb7 career \xb7 study \xb7 wellness") +
          ifeat(p.accent, "KES 40 / Download", "30-day access per document") +
        '</div>' +
      '</div>' +

      // centre hero
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px">' +

        // logo wrapper — CSS perspective so z-translate on child creates depth
        '<div id="ocra-logo-wrap" style="position:relative;margin-bottom:32px;perspective:1200px">' +
          '<div id="devHold" style="position:relative;cursor:pointer;display:flex;align-items:center;justify-content:center">' +
            '<div id="logo-halo" style="position:absolute;inset:-40px;border-radius:50%;opacity:0;pointer-events:none;' +
                 'background:radial-gradient(circle,' + p.glowC + ' 0%,transparent 70%)"></div>' +
            '<img id="ocra-logo-img" src="./assets/ocra-logo.png" width="176" height="176" alt="OCRA" ' +
                 'style="border-radius:50%;position:relative;z-index:1;opacity:0;display:block"/>' +
            '<svg width="196" height="196" viewBox="0 0 100 100" ' +
                 'style="position:absolute;width:196px;height:196px;top:50%;left:50%;' +
                 'transform:translate(-50%,-50%) rotate(-90deg);z-index:2;pointer-events:none">' +
              '<circle id="devRing" cx="50" cy="50" r="46" fill="none" stroke="' + p.accent + '" ' +
                      'stroke-width="2" stroke-dasharray="289" stroke-dashoffset="289" opacity=".8"/>' +
            '</svg>' +
          '</div>' +
        '</div>' +

        // "INTRODUCING"
        '<div id="ocra-label" style="font-size:11px;font-weight:400;letter-spacing:.32em;text-transform:uppercase;' +
             'color:rgba(220,232,242,.5);margin-bottom:10px;min-height:16px">' + iLetters + '</div>' +

        // "OCRA" — letter colour comes from preset
        '<div id="ocra-name" style="font-size:72px;font-weight:900;letter-spacing:.18em;line-height:1;' +
             'margin-bottom:18px;min-height:80px">' + nLetters + '</div>' +

        // brief (filled by typewriter)
        '<p id="ocra-brief" style="max-width:460px;text-align:center;font-size:13px;line-height:1.85;' +
           'color:rgba(220,232,242,.55);margin:0 24px 8px;opacity:0"></p>' +

        // subsidiary line
        '<div id="ocra-sub" style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;' +
             'color:rgba(220,232,242,.25);margin-bottom:40px;opacity:0"></div>' +

        // Dive In (liquid glass button)
        '<div id="ocra-btn-wrap" style="opacity:0">' +
          '<button class="ocra-dive" id="diveHold" data-action="diveIn">Dive In</button>' +
        '</div>' +

      '</div>' +
    '</div>';
  };

  // ─────────────────────────────────────────────────────────────
  // GSAP cinematic animation — 5 presets + GSAP timeline
  // O._introPresets is defined here so O.screens.intro can read it
  // ─────────────────────────────────────────────────────────────
  O.introAnimate = (function () {
    var _spinTween = null;
    var _paraFn    = null;

    O._introPresets = {
      stellar: { bg:"#080c14", accent:"#38BDF8", nc:"#38BDF8", glowC:"rgba(56,189,248,.22)", spinDur:22, ease:"power3.out",         letterEase:"back.out(2)"        },
      surge:   { bg:"#0c0500", accent:"#FF6B35", nc:"#FF6B35", glowC:"rgba(255,107,53,.22)",  spinDur:8,  ease:"power4.out",         letterEase:"back.out(1.5)"      },
      drift:   { bg:"#080e1c", accent:"#7E7BD8", nc:"#7E7BD8", glowC:"rgba(126,123,216,.18)", spinDur:35, ease:"power2.out",         letterEase:"power3.out"         },
      neon:    { bg:"#000000", accent:"#00ff88", nc:"#00ff88", glowC:"rgba(0,255,136,.18)",   spinDur:14, ease:"elastic.out(1,0.3)", letterEase:"elastic.out(1,0.4)" },
      minimal: { bg:"#090d14", accent:"#e8eaf0", nc:"#e8eaf0", glowC:"rgba(255,255,255,.07)", spinDur:30, ease:"power3.out",         letterEase:"power3.out"         }
    };

    return function () {
      // teardown previous run
      if (_spinTween) { _spinTween.kill(); _spinTween = null; }
      if (_paraFn)    { document.removeEventListener("mousemove", _paraFn); _paraFn = null; }

      var stage    = document.getElementById("ocra-intro-stage");
      var glow     = document.getElementById("intro-glow");
      var logoWrap = document.getElementById("ocra-logo-wrap");
      var holdEl   = document.getElementById("devHold");
      var halo     = document.getElementById("logo-halo");
      var logoImg  = document.getElementById("ocra-logo-img");
      var brief    = document.getElementById("ocra-brief");
      var sub      = document.getElementById("ocra-sub");
      var btnW     = document.getElementById("ocra-btn-wrap");
      var leftEl   = document.querySelector(".intro-left");
      var rightEl  = document.querySelector(".intro-right");

      if (!stage || !logoImg) return;

      var DC      = O.developerConsole;
      var key     = DC && DC.flags && DC.flags.introPreset || "stellar";
      var p       = O._introPresets[key] || O._introPresets.stellar;
      var BRIEF   = "OCRA performs deep analysis across different stratums — academics, finances, and more coming soon. It delivers insights, remedies, and reveals your true potential.";
      var SUB     = "a subsidiary of Artist Life Foundation";
      var desktop = window.innerWidth > 820;
      var hw      = window.innerWidth  / 2;
      var vh      = window.innerHeight / 2;

      // ── No GSAP (smoke test / offline): instant reveal ──────────
      if (!window.gsap) {
        [logoImg, brief, sub, btnW].forEach(function (el) { if (el) el.style.opacity = "1"; });
        if (brief) brief.textContent = BRIEF;
        if (sub)   sub.textContent   = SUB;
        [].forEach.call(document.querySelectorAll(".iletter,.nletter"), function (s) { s.style.opacity = "1"; });
        if (desktop && leftEl && rightEl) {
          leftEl.style.display  = "block"; leftEl.style.opacity  = "1";
          rightEl.style.display = "block"; rightEl.style.opacity = "1";
          [].forEach.call(document.querySelectorAll(".ifeat"), function (f) { f.style.opacity = "1"; });
        }
        return;
      }

      var gsap = window.gsap;

      // ── Side panel setup (desktop) ───────────────────────────────
      if (desktop && leftEl && rightEl) {
        gsap.set(leftEl,  { display: "block", yPercent: -50, x: -(hw * 0.85), opacity: 0 });
        gsap.set(rightEl, { display: "block", yPercent: -50, x:  (hw * 0.85), opacity: 0 });
      }

      // ── Main timeline (total ~6.2 s) ─────────────────────────────
      var tl = gsap.timeline();

      // Logo: rises from deep z-space with clockwise spiral (0 → 1.1 s)
      tl.fromTo(logoImg,
        { opacity: 0, z: -2200, rotation: -360, scale: 0.5 },
        { opacity: 1, z: 0,     rotation: 0,    scale: 1,   duration: 1.1, ease: p.ease },
        0
      );

      // Continuous clockwise spin begins the moment entrance ends
      tl.call(function () {
        _spinTween = gsap.to(logoImg, { rotation: "+=360", duration: p.spinDur, ease: "none", repeat: -1 });
      }, null, 1.1);

      // Ambient glow + logo halo bloom
      tl.to([glow, halo], { opacity: 1, duration: 1.2, ease: "power2.out" }, 0.4);

      // Panels converge from screen edges
      if (desktop && leftEl && rightEl) {
        tl.to(leftEl,  { x: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 0.65);
        tl.to(rightEl, { x: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 0.65);
        tl.to(".intro-left .ifeat, .intro-right .ifeat",
          { opacity: 1, stagger: { each: 0.1, from: "start" }, duration: 0.35, ease: "power2.out" },
          1.25
        );
      }

      // "INTRODUCING" letters cascade up (1.3 → ~2.0 s)
      tl.fromTo(".iletter",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0,  stagger: 0.04, duration: 0.28, ease: p.letterEase },
        1.3
      );

      // "OCRA" letters stamp in (2.05 → ~2.95 s)
      tl.fromTo(".nletter",
        { opacity: 0, y: 28, scale: 1.35 },
        { opacity: 1, y: 0,  scale: 1, stagger: 0.12, duration: 0.52, ease: p.letterEase },
        2.05
      );

      // Brief typewriter (2.9 → 4.4 s)
      var bProxy = { v: 0 };
      tl.to(bProxy, {
        v: BRIEF.length, duration: 1.5, ease: "none",
        onStart:  function () { gsap.set(brief, { opacity: 1 }); brief.textContent = ""; },
        onUpdate: function () { brief.textContent = BRIEF.slice(0, Math.round(bProxy.v)); }
      }, 2.9);

      // Subsidiary typewriter (4.55 → 5.35 s)
      var sProxy = { v: 0 };
      tl.to(sProxy, {
        v: SUB.length, duration: 0.8, ease: "none",
        onStart:  function () { gsap.set(sub, { opacity: 1 }); sub.textContent = ""; },
        onUpdate: function () { sub.textContent = SUB.slice(0, Math.round(sProxy.v)); }
      }, 4.55);

      // Dive In button rises (5.5 → 6.15 s)
      tl.fromTo(btnW,
        { opacity: 0, scale: 0.82, y: 18 },
        { opacity: 1, scale: 1,    y: 0,  duration: 0.65, ease: "back.out(1.7)" },
        5.5
      );

      // ── Mouse parallax (activates after panels land) ─────────────
      tl.call(function () {
        _paraFn = function (e) {
          if (!document.getElementById("ocra-intro-stage")) {
            document.removeEventListener("mousemove", _paraFn); _paraFn = null; return;
          }
          var dx = (e.clientX - hw) / hw;
          var dy = (e.clientY - vh) / vh;
          gsap.to(logoWrap, { rotateY: dx * 16, rotateX: -dy * 11, duration: 0.5, ease: "power2.out", overwrite: "auto" });
          if (desktop && leftEl && rightEl) {
            gsap.to(leftEl,  { x: dx * -18, duration: 0.9, ease: "power2.out", overwrite: "auto" });
            gsap.to(rightEl, { x: dx *  18, duration: 0.9, ease: "power2.out", overwrite: "auto" });
          }
        };
        document.addEventListener("mousemove", _paraFn);
      }, null, 1.65);
    };
  })();

  // helper: dark full-screen flow stage (continuation of the intro mood)
  function fx(inner) {
    return '<div class="fxstage">' + inner + '</div>';
  }

  // ── Inline SVG icons ────────────────────────────────────
  var _chk  = '<svg width="11" height="9" viewBox="0 0 11 9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4.5 4 7.5 10 1.5"/></svg>';
  var _arr  = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  var _bck  = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
  var _eye  = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  var _eyex = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  var _mail = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  var _lock = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  var _user = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  var _glob = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  var _school = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
  var _goog = '<svg width="17" height="17" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>';
  var _appl = '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>';
  var _msft = '<svg width="17" height="17" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>';
  var _chevDown = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  var _phone = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';

  O._svgEye  = _eye;
  O._svgEyeX = _eyex;

  // ── Shared helpers ───────────────────────────────────────

  function brandBar() {
    return '<div class="auth-brand-bar">' + O.logo(34, true) + '<b>OCRA</b></div>';
  }

  function socialRow() {
    return '' +
    '<div class="auth-socials">' +
      '<button class="auth-social" data-action="socialAuth" data-value="Google">' + _goog + '<span>Google</span></button>' +
      '<button class="auth-social" data-action="socialAuth" data-value="Apple">' + _appl + '<span>Apple</span></button>' +
      '<button class="auth-social" data-action="socialAuth" data-value="Microsoft">' + _msft + '<span>Microsoft</span></button>' +
    '</div>';
  }

  function holder(icon, inputHtml) {
    return '<div class="ah"><span class="ah-icon">' + icon + '</span>' + inputHtml + '</div>';
  }

  function pwHolder(fieldName, placeholder, autocomplete) {
    return '' +
    '<div class="ah">' +
      '<span class="ah-icon">' + _lock + '</span>' +
      '<input data-field="' + fieldName + '" type="password" placeholder="' + (placeholder || 'Password') + '" autocomplete="' + (autocomplete || 'current-password') + '"/>' +
      '<button type="button" class="ah-eye" data-action="togglePw" aria-label="Toggle password">' + _eye + '</button>' +
    '</div>';
  }

  function errBox(id) {
    return '<p id="' + (id || 'authErr') + '" class="auth-err"></p>';
  }

  // ── Live password-requirements checklist ─────────────────
  // The four rules are LOCKED: 9+ chars, a capital, a number, a symbol.
  // core.js updates the `.met` state live on every keystroke of the
  // matching password field (matched by data-pwfor).
  O.PW_RULES = [
    { k: 'len',   label: 'At least 9 characters', test: function (p) { return /.{9,}/.test(p); } },
    { k: 'upper', label: 'One capital letter',    test: function (p) { return /[A-Z]/.test(p); } },
    { k: 'num',   label: 'One number',            test: function (p) { return /[0-9]/.test(p); } },
    { k: 'sym',   label: 'One symbol',            test: function (p) { return /[^A-Za-z0-9]/.test(p); } },
  ];

  function pwChecklist(fieldName, currentVal) {
    var items = O.PW_RULES.map(function (r) {
      var met = r.test(currentVal || '');
      return '<li class="auth-pwreq-item' + (met ? ' met' : '') + '" data-rule="' + r.k + '">' +
        '<span class="auth-pwreq-ic">' + _chk + '</span>' +
        '<span>' + r.label + '</span>' +
      '</li>';
    }).join('');
    return '<ul class="auth-pwreq" data-pwfor="' + fieldName + '">' + items + '</ul>';
  }

  // ── Privacy policy content per account type ──────────────

  function policyContent(accountType) {
    var personal =
      '<div class="auth-policy-h">What we collect</div>' +
      '<ul>' +
        '<li>Personal details — name, date of birth, country, gender, preferred language</li>' +
        '<li>Academic information — school, education system, grade / level</li>' +
        '<li>Cognitive assessment responses (60 questions, 6 dimensions)</li>' +
        '<li>Academic results — subject scores you enter manually</li>' +
        '<li>Career profile — generated from your cognitive and academic data</li>' +
        '<li>Account credentials — email, encrypted password, recovery answers</li>' +
      '</ul>' +
      '<div class="auth-policy-h">How we use it</div>' +
      '<ul>' +
        '<li>Generate your 4-document academic report bundle</li>' +
        '<li>Power AI-driven career guidance personalised to your profile</li>' +
        '<li>Deliver cognitive insights across 6 measured dimensions</li>' +
        '<li>Improve OCRA\'s assessment accuracy using fully anonymised signals</li>' +
      '</ul>' +
      '<div class="auth-policy-h">What we never do</div>' +
      '<ul>' +
        '<li>Sell your personal data to any third party</li>' +
        '<li>Share identifiable information without your explicit consent</li>' +
        '<li>Retain data beyond the 30-day window after account deletion</li>' +
        '<li>Use your data for advertising or external profiling</li>' +
      '</ul>';

    var family =
      '<div class="auth-policy-h">What we collect</div>' +
      '<ul>' +
        '<li>Family profile — family name, parent / guardian email addresses</li>' +
        '<li>Each learner\'s personal and academic details (name, DOB, school, grade)</li>' +
        '<li>Cognitive assessment responses per learner</li>' +
        '<li>Academic results per learner</li>' +
        '<li>Account credentials — encrypted password, recovery answers</li>' +
      '</ul>' +
      '<div class="auth-policy-h">How we use it</div>' +
      '<ul>' +
        '<li>Generate individual report bundles for each registered learner</li>' +
        '<li>Provide parents / guardians with a consolidated family dashboard</li>' +
        '<li>Enable academic and cognitive comparison across your family\'s learners</li>' +
      '</ul>' +
      '<div class="auth-policy-h">Children\'s data — extra protections</div>' +
      '<ul>' +
        '<li>Children\'s data is never shared, sold, or used for advertising</li>' +
        '<li>Parental consent is required for all learner profiles under 18</li>' +
        '<li>Individual learner data is purged within 30 days of account deletion</li>' +
      '</ul>' +
      '<div class="auth-policy-h">What we never do</div>' +
      '<ul>' +
        '<li>Share learner profiles with third parties in any identifiable form</li>' +
        '<li>Use children\'s data for commercial profiling or advertising</li>' +
      '</ul>';

    var organization =
      '<div class="auth-policy-h">What we collect</div>' +
      '<ul>' +
        '<li>Organization profile — name, type, county / region, contact person</li>' +
        '<li>Administrator contact information — email, phone</li>' +
        '<li>Student enrollment counts and grade distribution (aggregate, not individual by default)</li>' +
        '<li>Cognitive and academic data for each assessed student (with opt-in)</li>' +
        '<li>Platform usage analytics — session counts, feature engagement (anonymised)</li>' +
      '</ul>' +
      '<div class="auth-policy-h">How we use it</div>' +
      '<ul>' +
        '<li>Provide cohort-level analytics dashboards for administrators</li>' +
        '<li>Support bulk academic report generation for students</li>' +
        '<li>Enable school-level performance benchmarking across terms</li>' +
        '<li>Help identify at-risk learners and subject-area gaps</li>' +
      '</ul>' +
      '<div class="auth-policy-h">What we never do</div>' +
      '<ul>' +
        '<li>Sell organizational data or individual student records</li>' +
        '<li>Share student identifiers externally without administrator consent</li>' +
        '<li>Retain student data after an organization closes its account (30-day window)</li>' +
      '</ul>';

    var credentials =
      '<div class="auth-policy-h">Your account credentials — what &amp; why</div>' +
      '<ul>' +
        '<li><b>Names</b> — printed on your documents and used to personalise remarks, insights and recommendations</li>' +
        '<li><b>Email</b> — your login identity, account-recovery channel, and where we send verification codes and notifications</li>' +
        '<li><b>Password</b> — stored only as a one-way hash (never in readable form); it secures every future login</li>' +
        '<li><b>Recovery answers</b> — stored hashed; the only way to regain access if you forget your password</li>' +
      '</ul>';

    var liability =
      '<div class="auth-policy-h">Limitation of liability — please read</div>' +
      '<ul>' +
        '<li>OCRA is provided on a best-effort basis; while we protect your data carefully, the system is <b>not liable for data loss</b> caused by events beyond our reasonable control</li>' +
        '<li>We are <b>not liable for unauthorised account access</b> resulting from shared, weak, or compromised credentials — keep your password and recovery answers private</li>' +
        '<li>Insights, reports and career guidance are decision-support tools, not guarantees of any outcome</li>' +
        '<li>You are responsible for the accuracy of the information you enter</li>' +
      '</ul>';

    var common =
      '<div class="auth-policy-h">Universal protections (all account types)</div>' +
      '<ul>' +
        '<li>All data is encrypted in transit (TLS) and at rest</li>' +
        '<li>Session tokens expire after 7 days; no persistent cookies beyond that</li>' +
        '<li>Soft delete with a 30-day recovery window — you can restore your account</li>' +
        '<li>Full right to access, export, and permanently delete your data at any time</li>' +
        '<li>OCRA is a subsidiary of Artist Life Foundation — a non-profit educational initiative</li>' +
      '</ul>';

    var specific = { personal: personal, family: family, organization: organization }[accountType] || personal;
    return specific + credentials + common + liability;
  }

  // ─────────────────────────────────────────────────────────
  // INTRO — cinematic landing (unchanged)
  // ─────────────────────────────────────────────────────────
  O.screens.intro = function () {
    var logo  = O.logo(112, true);
    var bgMap = { "black": "#000000", "light": "var(--bg-light)", "dark": "var(--bg-dark)" };
    var bgKey = O.developerConsole && O.developerConsole.flags && O.developerConsole.flags.introBackground || "dark";
    var bg    = bgMap[bgKey] || "var(--bg-dark)";

    function orbit(tiltStyle, dur) {
      return '' +
      '<div style="position:absolute;inset:0;transform-style:preserve-3d;' + tiltStyle + '">' +
        '<div style="position:absolute;inset:0;border-radius:50%;border:1px solid rgba(56,189,248,.28);' +
             'animation:ocraOrbitSpin ' + dur + 's linear infinite">' +
          '<div style="position:absolute;width:7px;height:7px;background:#38BDF8;border-radius:50%;' +
               'top:50%;left:3px;transform:translateY(-50%);box-shadow:0 0 10px 3px rgba(56,189,248,.42)"></div>' +
        '</div>' +
      '</div>';
    }

    return '' +
    '<div style="position:fixed;inset:0;background:' + bg + ';display:flex;flex-direction:column;' +
         'align-items:center;justify-content:center;padding:20px;z-index:100;overflow:hidden">' +
      '<div style="position:relative;width:200px;height:200px;display:flex;align-items:center;' +
           'justify-content:center;margin-bottom:28px">' +
        '<div style="position:absolute;inset:0;perspective:900px;transform-style:preserve-3d;pointer-events:none">' +
          orbit("", 3.3) + orbit("transform:rotateX(62deg)", 5.2) + orbit("transform:rotateY(62deg)", 7.8) +
        '</div>' +
        '<div id="devHold" class="ocra-logo-enter" style="position:relative;cursor:pointer;z-index:1;' +
             'display:flex;align-items:center;justify-content:center">' +
          logo +
          '<svg width="112" height="112" viewBox="0 0 100 100" style="position:absolute;width:112px;height:112px;' +
               'top:50%;left:50%;transform:translate(-50%,-50%) rotate(-90deg)">' +
            '<circle id="devRing" cx="50" cy="50" r="46" fill="none" stroke="#38BDF8" stroke-width="2.5" ' +
                    'stroke-dasharray="289" stroke-dashoffset="289" opacity=".85"/>' +
          '</svg>' +
        '</div>' +
      '</div>' +
      '<div style="text-align:center;min-height:88px">' +
        '<div id="ocra-line1" style="font-size:15px;font-weight:300;color:rgba(220,232,242,.68);' +
             'letter-spacing:.06em;min-height:22px"></div>' +
        '<div id="ocra-line2" style="font-size:54px;font-weight:900;color:#38BDF8;letter-spacing:.22em;' +
             'min-height:66px;line-height:1.1;margin-top:6px"></div>' +
      '</div>' +
      '<p id="ocra-brief" style="max-width:420px;text-align:center;font-size:13px;line-height:1.82;' +
         'color:rgba(220,232,242,.56);margin:12px 24px 4px;display:none"></p>' +
      '<div id="ocra-sub" style="font-size:10px;letter-spacing:.15em;text-transform:uppercase;' +
           'color:rgba(220,232,242,.28);margin-bottom:34px;display:none"></div>' +
      '<div id="ocra-btn-wrap" style="display:none">' +
        '<button id="diveHold" class="ocra-dive" data-action="diveIn">Dive In</button>' +
      '</div>' +
    '</div>';
  };

  // Typewriter sequence (unchanged)
  O.introAnimate = (function () {
    var _t = [], _run = 0;
    function clear() { _t.forEach(clearTimeout); _t = []; }
    function later(ms, fn) { _t.push(setTimeout(fn, ms)); }
    var BRIEF = "OCRA performs deep analysis across different stratums — academics, finances, and more coming soon. It delivers insights, remedies, and reveals your true potential. Defining who you really are, better than any system would.";
    var SUB   = "a subsidiary of Artist Life Foundation";
    return function () {
      clear();
      var run = ++_run;
      function ok() { return run === _run && !!document.getElementById("ocra-line1"); }
      var line1 = document.getElementById("ocra-line1");
      var line2 = document.getElementById("ocra-line2");
      var brief = document.getElementById("ocra-brief");
      var sub   = document.getElementById("ocra-sub");
      var btnW  = document.getElementById("ocra-btn-wrap");
      if (!line1) return;
      function type(el, text, ms, done) {
        var i = 0; el.textContent = "";
        (function step() {
          if (!ok()) return;
          if (i <= text.length) { el.textContent = text.slice(0, i++); _t.push(setTimeout(step, ms)); }
          else if (done) { done(); }
        })();
      }
      later(1700, function () {
        if (!ok()) return;
        type(line1, "Introducing", 55, function () {
          if (!ok()) return;
          var d = 0;
          (function dot() {
            if (!ok()) return;
            if (d < 5) { line1.textContent += "."; d++; _t.push(setTimeout(dot, 160)); }
            else {
              var cur = document.createElement("span");
              cur.className = "ocra-cursor";
              line1.appendChild(cur);
              later(1500, function () {
                if (!ok()) return;
                if (cur.parentNode) cur.parentNode.removeChild(cur);
                var letters = ["O","C","R","A"], li = 0;
                line2.textContent = "";
                (function letter() {
                  if (!ok()) return;
                  if (li < letters.length) { line2.textContent += letters[li++]; _t.push(setTimeout(letter, 115)); }
                  else {
                    later(220, function () {
                      if (!ok()) return;
                      brief.style.display = "block";
                      type(brief, BRIEF, 11, function () {
                        if (!ok()) return;
                        later(160, function () {
                          if (!ok()) return;
                          sub.style.display = "block";
                          type(sub, SUB, 22, function () {
                            if (!ok()) return;
                            later(240, function () { if (!ok()) return; btnW.style.display = "block"; });
                          });
                        });
                      });
                    });
                  }
                })();
              });
            }
          })();
        });
      });
    };
  })();

  // ─────────────────────────────────────────────────────────
  // CHOOSE — Academics / Finances
  // ─────────────────────────────────────────────────────────
  O.screens.choose = function () {
    return '' +
    '<div class="auth-stage">' +
      brandBar() +
      '<div class="auth-choose-wrap">' +
        '<h1 class="auth-h1" style="text-align:center;margin-bottom:6px">What brings you here?</h1>' +
        '<p class="auth-sub" style="text-align:center;margin-bottom:22px">Choose your path to get started.</p>' +
        '<div class="auth-choices">' +

          '<button class="auth-choice" data-action="academics">' +
            '<div class="auth-choice-icon acad">&#128218;</div>' +
            '<div style="flex:1">' +
              '<div style="font-size:15px;font-weight:700;margin-bottom:4px">Academics</div>' +
              '<div style="font-size:12.5px;color:rgba(220,232,242,.5)">Records &middot; cognitive test &middot; career reports</div>' +
            '</div>' +
            '<span class="auth-choice-arrow">' + _arr + '</span>' +
          '</button>' +

          '<button class="auth-choice auth-soon" data-action="finances">' +
            '<div class="auth-choice-icon fin">&#128178;</div>' +
            '<div style="flex:1">' +
              '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
                '<span style="font-size:15px;font-weight:700">Finances</span>' +
                '<span class="auth-badge soon">Coming soon</span>' +
              '</div>' +
              '<div style="font-size:12.5px;color:rgba(220,232,242,.35)">Budgeting &middot; savings &middot; financial health</div>' +
            '</div>' +
          '</button>' +

        '</div>' +
        '<p style="text-align:center;font-size:11px;color:rgba(220,232,242,.22);margin-top:28px;letter-spacing:.1em;text-transform:uppercase">a subsidiary of Artist Life Foundation</p>' +
      '</div>' +
    '</div>';
  };

  // ─────────────────────────────────────────────────────────
  // ACCOUNT TYPE
  // ─────────────────────────────────────────────────────────
  O.screens.account = function () {
    var s = O.state;
    var types = [
      { k: 'personal',     icon: '&#128100;', title: 'Personal',     desc: 'Individual students and learners' },
      { k: 'family',       icon: '&#128106;', title: 'Family',       desc: 'Parents managing multiple learners' },
      { k: 'organization', icon: '&#127963;', title: 'Organization', desc: 'Schools, colleges, and institutes' },
    ];
    var cards = types.map(function (a) {
      var on = s.account === a.k ? ' on' : '';
      return '' +
      '<button class="auth-acct' + on + '" data-action="pickAccount" data-value="' + a.k + '">' +
        '<div class="auth-acct-radio"></div>' +
        '<div class="auth-acct-icon">' + a.icon + '</div>' +
        '<div>' +
          '<div class="auth-acct-title">' + a.title + '</div>' +
          '<div class="auth-acct-desc">' + a.desc + '</div>' +
        '</div>' +
      '</button>';
    }).join("");

    return '' +
    '<div class="auth-stage">' +
      brandBar() +
      '<div class="auth-card">' +
        '<button class="auth-back" data-action="backToChoose">' + _bck + ' Back</button>' +
        '<h1 class="auth-h1">Who are you?</h1>' +
        '<p class="auth-sub">Select the account type that fits you best.</p>' +
        '<div class="auth-accts">' + cards + '</div>' +
        '<button class="auth-submit" data-action="accountNext">Get Started ' + _arr + '</button>' +
      '</div>' +
    '</div>';
  };

  // ─────────────────────────────────────────────────────────
  // AUTH — routes to login / recover / signup
  // ─────────────────────────────────────────────────────────
  O.screens.auth = function () {
    var mode = O.state.authMode;
    if (mode === 'signup')  return signup();
    if (mode === 'recover') return recoverView();
    return loginView();
  };

  // ── Login ──────────────────────────────────────────────

  function loginView() {
    var s    = O.state;
    var step = s.authStep || 'email';

    if (step === 'password') {
      return '' +
      '<div class="auth-stage">' +
        brandBar() +
        '<div class="auth-card">' +
          '<h1 class="auth-h1">Enter password</h1>' +
          '<p class="auth-sub" style="margin-bottom:18px">' +
            '<span style="color:rgba(220,232,242,.85);font-weight:600">' + O.esc(s.authEmail || (s.form && s.form.email) || '') + '</span>' +
            ' &nbsp;&mdash;&nbsp; <button class="auth-link" style="font-size:13px" data-action="changeEmail">Change</button>' +
          '</p>' +
          '<div data-auth>' +
            pwHolder('password', 'Your password', 'current-password') +
            errBox() +
            '<button class="auth-submit" data-action="loginSubmit">Sign In ' + _arr + '</button>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;margin-top:16px">' +
            '<button class="auth-link" style="font-size:12.5px" data-action="setAuthMode" data-value="recover">Forgot password?</button>' +
            '<button class="auth-link" style="font-size:12.5px" data-action="setAuthMode" data-value="signup">Create account</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    // Email step
    return '' +
    '<div class="auth-stage">' +
      brandBar() +
      '<div class="auth-card">' +
        '<h1 class="auth-h1">Welcome back</h1>' +
        '<p class="auth-sub">Sign in to your ' + O.esc(s.account) + ' account.</p>' +
        '<div class="auth-tabs">' +
          '<button class="auth-tab on" data-action="setAuthMode" data-value="login">Sign In</button>' +
          '<button class="auth-tab" data-action="setAuthMode" data-value="signup">Create Account</button>' +
        '</div>' +
        socialRow() +
        '<div class="auth-divider">or continue with email</div>' +
        '<div data-auth>' +
          holder(_mail, '<input data-field="email" type="email" placeholder="Email address" value="' + O.esc(s.form && s.form.email || '') + '" autocomplete="email"/>') +
          errBox() +
          '<button class="auth-submit" data-action="emailNext">Continue ' + _arr + '</button>' +
        '</div>' +
        '<div style="text-align:center;margin-top:14px">' +
          '<button class="auth-link" style="font-size:12.5px" data-action="setAuthMode" data-value="recover">Forgot password?</button>' +
        '</div>' +
        '<p class="auth-toggle-line">New to OCRA? <button class="auth-link" data-action="setAuthMode" data-value="signup">Create an account</button></p>' +
      '</div>' +
    '</div>';
  }

  // ── Recovery ────────────────────────────────────────────

  function recoverView() {
    var s = O.state;
    var f = s.form || {};
    var emailVal = O.esc(f.recoverEmail || s.authEmail || f.email || '');

    // Same-password state: identity verified, but the "new" password they
    // typed is already their current one. Let them keep it or change it.
    // (The password itself is never shown — only its match is detected.)
    if (s.recoverSamePw) {
      return '' +
      '<div class="auth-stage">' +
        brandBar() +
        '<div class="auth-card" style="max-width:460px;text-align:center">' +
          '<div style="font-size:34px;margin-bottom:10px">&#128273;</div>' +
          '<h1 class="auth-h1">That\'s your current password</h1>' +
          '<p class="auth-sub" style="margin-bottom:20px">Good news — the password you entered is already the one on your account. You can keep using it, or set a different one.</p>' +
          '<button class="auth-submit" style="margin-top:0" data-action="recoverKeepOld">Keep using it ' + _arr + '</button>' +
          '<button class="auth-btn-sec" style="width:100%;margin-top:12px;justify-content:center" data-action="recoverChangePw">Choose a different one</button>' +
          '<p class="auth-toggle-line"><button class="auth-link" data-action="setAuthMode" data-value="login">Back to Sign In</button></p>' +
        '</div>' +
      '</div>';
    }

    return '' +
    '<div class="auth-stage">' +
      brandBar() +
      '<div class="auth-card" style="max-width:460px">' +
        '<h1 class="auth-h1">Reset password</h1>' +
        '<p class="auth-sub">Answer your four recovery questions and set a new password.</p>' +
        '<div data-auth>' +
          '<div class="auth-section-lbl">Your email</div>' +
          holder(_mail, '<input data-field="recoverEmail" type="email" placeholder="your@email.com" value="' + emailVal + '" autocomplete="email"/>') +
          '<div class="auth-section-lbl">Recovery questions</div>' +
          I.recovery.map(function (r) {
            return holder(_lock, '<input data-field="' + r.k + '" placeholder="' + O.esc(r.q) + '" value="' + O.esc(f[r.k] || '') + '"/>');
          }).join("") +
          '<div class="auth-section-lbl">New password</div>' +
          pwHolder('newPassword', 'Create a new password', 'new-password') +
          pwChecklist('newPassword', f.newPassword || '') +
          errBox() +
          '<button class="auth-submit" data-action="recoverSubmit">Reset Password</button>' +
        '</div>' +
        '<p class="auth-toggle-line"><button class="auth-link" data-action="setAuthMode" data-value="login">Back to Sign In</button></p>' +
      '</div>' +
    '</div>';
  }

  // ── Signup (multi-stage) ──────────────────────────────

  // Five-section progress banner. Each section is 20% of the journey; the
  // active/earlier sections fill red→green by completion, and the caption
  // underneath changes with the stage.
  function progressBanner(stages, idx) {
    var seg = stages.map(function (st, i) {
      var fill = 0;
      if (i < idx) fill = 1;
      else if (i === idx) fill = I.sectionFill(i);
      var cls = fill >= 1 ? 'full' : (i === idx ? 'active' : '');
      return '<div class="auth-seg ' + cls + '">' +
        '<div class="auth-seg-fill" style="width:' + Math.round(fill * 100) + '%"></div>' +
      '</div>';
    }).join('');
    var caption = (I.SECTION_LABELS && I.SECTION_LABELS[idx]) || stages[idx].title;
    return '<div class="auth-banner">' +
      '<div class="auth-segs">' + seg + '</div>' +
      '<div class="auth-banner-cap">' + O.esc(caption) + '</div>' +
    '</div>';
  }

  // Render one signup field by type.
  function signupField(fl, f) {
    var key  = fl[0];
    var lab  = fl[1];
    var type = fl[2] || 'text';
    var extra = fl[3];
    var sample = fl[4];
    var val  = O.esc(f[key] == null ? '' : f[key]);
    var ph   = sample ? ('e.g. ' + sample) : lab;
    var label = '<div class="ah-label">' + O.esc(lab) + '</div>';

    if (type === 'select') {
      var opts = (extra || []).map(function (o) {
        return '<option value="' + O.esc(o) + '"' + (f[key] === o ? ' selected' : '') + '>' + O.esc(o || 'Choose…') + '</option>';
      }).join('');
      return '<div class="af">' + label +
        '<div class="ah"><select data-field="' + key + '">' + opts + '</select></div>' +
      '</div>';
    }

    if (type === 'list' || type === 'country') {
      var listKey  = (type === 'country') ? 'countries' : extra;
      var listData = (I.DATA && I.DATA[listKey]) || [];
      var dataOpts = listData.map(function (o) { return '<option value="' + O.esc(o) + '">'; }).join('');
      var icon = (type === 'country') ? _glob : (listKey === 'systems' ? _school : _glob);
      return '<div class="af">' + label +
        holder(icon,
          '<input data-field="' + key + '" list="dl_' + key + '" placeholder="' + O.esc(ph) + '" value="' + val + '" autocomplete="off"/>' +
          '<datalist id="dl_' + key + '">' + dataOpts + '</datalist>'
        ) +
        (type === 'country' ? '<div class="auth-hint" id="hint_' + key + '">Type your country — we\'ll confirm it exists.</div>' : '') +
      '</div>';
    }

    if (type === 'level') {
      var sysVal = f[extra];
      var levels = I.levelsForSystem(sysVal);
      var lopts = '<option value="">' + (sysVal ? 'Choose your level…' : 'Pick an academic system first') + '</option>' +
        levels.map(function (o) { return '<option value="' + O.esc(o) + '"' + (f[key] === o ? ' selected' : '') + '>' + O.esc(o) + '</option>'; }).join('');
      return '<div class="af">' + label +
        '<div class="ah"><select data-field="' + key + '"' + (sysVal ? '' : ' disabled') + '>' + lopts + '</select></div>' +
      '</div>';
    }

    if (type === 'password') {
      return '<div class="af">' + label +
        pwHolder(key, 'Create a strong password', 'new-password') +
        pwChecklist(key, f[key] || '') +
      '</div>';
    }

    if (type === 'phone') {
      var codes = (I.DATA && I.DATA.phoneCodes) || [];
      var copts = codes.map(function (c) {
        var lblc = c.d + '  ' + c.n;
        return '<option value="' + O.esc(c.d) + '"' + (f[key + '_code'] === c.d ? ' selected' : '') + '>' + O.esc(lblc) + '</option>';
      }).join('');
      return '<div class="af">' + label +
        '<div class="ah auth-phone">' +
          '<span class="ah-icon">' + _phone + '</span>' +
          '<select data-field="' + key + '_code" class="auth-phone-code">' + '<option value="">Code</option>' + copts + '</select>' +
          '<input data-field="' + key + '" type="tel" inputmode="numeric" placeholder="' + O.esc(ph) + '" value="' + val + '" autocomplete="tel"/>' +
        '</div>' +
      '</div>';
    }

    if (type === 'multiselect') {
      var msData = (I.DATA && I.DATA[extra]) || [];
      var chosen = f[key] || [];
      var chips = msData.map(function (o) {
        var on = chosen.indexOf(o) >= 0;
        return '<button type="button" class="auth-chip' + (on ? ' on' : '') + '" data-action="multiToggle" data-field="' + key + '" data-value="' + O.esc(o) + '">' +
          (on ? '<span class="auth-chip-ic">' + _chk + '</span>' : '') + O.esc(o) +
        '</button>';
      }).join('');
      return '<div class="af">' + label +
        '<div class="auth-hint" style="margin-top:0;margin-bottom:8px">Choose every system your learners follow — don\'t leave anyone behind.</div>' +
        '<div class="auth-chips" id="chips_' + key + '">' + chips + '</div>' +
        '<div class="auth-chip-count" id="count_' + key + '">' + chosen.length + ' selected</div>' +
      '</div>';
    }

    if (type === 'logo') {
      return '<div class="af">' + label + logoField(f) + '</div>';
    }

    if (type === 'date') {
      return '<div class="af">' + label + holder(_user, '<input data-field="' + key + '" type="date" value="' + val + '"/>') + '</div>';
    }

    if (type === 'number') {
      return '<div class="af">' + label + holder(_user, '<input data-field="' + key + '" type="number" min="0" placeholder="' + O.esc(ph) + '" value="' + val + '"/>') + '</div>';
    }

    if (type === 'url') {
      return '<div class="af">' + label + holder(_glob, '<input data-field="' + key + '" type="url" placeholder="' + O.esc(ph) + '" value="' + val + '" autocomplete="url"/>') + '</div>';
    }

    if (type === 'email') {
      return '<div class="af">' + label + emailVerifyField(key, ph, f) + '</div>';
    }

    // default text
    var ic = /school|grade|system|org|principal|director|location|family|slogan/i.test(key) ? _school : _user;
    return '<div class="af">' + label +
      holder(ic, '<input data-field="' + key + '" type="text" placeholder="' + O.esc(ph) + '" value="' + val + '"/>') +
    '</div>';
  }

  // Logo: upload an image OR build one (colour + abbreviation + symbol).
  function logoField(f) {
    var preview;
    if (f.logoData) {
      preview = '<img src="' + f.logoData + '" alt="logo" class="auth-logo-img"/>';
    } else if (f.logoBuilt) {
      var b = f.logoBuilt;
      preview = '<div class="auth-logo-built" style="background:' + O.esc(b.color || '#0E6BA8') + '">' +
        '<span>' + O.esc(b.symbol || '') + '</span><b>' + O.esc(b.abbr || '') + '</b></div>';
    } else {
      preview = '<div class="auth-logo-empty">' + _school + '</div>';
    }
    var palette = ['#0E6BA8','#38BDF8','#7E7BD8','#34C759','#FF6B35','#FF3B30','#F5A623','#111827'];
    var symbols = ['🎓','📚','🏫','🔬','✏️','🌍','⭐','🦉'];
    var b2 = f.logoBuilt || {};
    var colorRow = palette.map(function (c) {
      return '<button type="button" class="auth-swatch' + (b2.color === c ? ' on' : '') + '" style="background:' + c + '" data-action="logoColor" data-value="' + c + '"></button>';
    }).join('');
    var symRow = symbols.map(function (sy) {
      return '<button type="button" class="auth-symbol' + (b2.symbol === sy ? ' on' : '') + '" data-action="logoSymbol" data-value="' + sy + '">' + sy + '</button>';
    }).join('');
    return '<div class="auth-logo">' +
      '<div class="auth-logo-top">' +
        preview +
        '<div class="auth-logo-actions">' +
          '<label class="auth-logo-upload">' + 'Upload image' +
            '<input type="file" accept="image/*" data-action="logoUpload" style="display:none"/>' +
          '</label>' +
          '<span class="auth-hint" style="margin:6px 0 0">PNG/JPG, or build one below</span>' +
        '</div>' +
      '</div>' +
      '<div class="auth-logo-build">' +
        '<div class="ah-label" style="margin-top:4px">Abbreviation</div>' +
        '<div class="ah"><span class="ah-icon">' + _school + '</span>' +
          '<input data-field="logoAbbr" maxlength="4" placeholder="e.g. BFA" value="' + O.esc(b2.abbr || '') + '" data-action="logoAbbr"/></div>' +
        '<div class="ah-label">Colour</div><div class="auth-swatches">' + colorRow + '</div>' +
        '<div class="ah-label">Symbol</div><div class="auth-symbols">' + symRow + '</div>' +
      '</div>' +
    '</div>';
  }

  // Email + verification code (the OTP the system "sends").
  function emailVerifyField(key, ph, f) {
    var val = O.esc(f[key] || '');
    var verified = (f.emailVerified === true);
    var sent = (O._otpSentTo && O._otpSentTo === (f[key] || '').toLowerCase());
    var row =
      '<div class="ah">' +
        '<span class="ah-icon">' + _mail + '</span>' +
        '<input data-field="' + key + '" type="email" placeholder="' + O.esc(ph) + '" value="' + val + '" autocomplete="email"' + (verified ? ' readonly' : '') + '/>' +
        (verified
          ? '<span class="auth-verified">' + _chk + ' Verified</span>'
          : '<button type="button" class="auth-mini-btn" data-action="otpSend">' + (sent ? 'Resend' : 'Send code') + '</button>') +
      '</div>';
    var codeRow = (sent && !verified)
      ? '<div class="ah" style="margin-top:8px">' +
          '<span class="ah-icon">' + _lock + '</span>' +
          '<input data-field="otpCode" inputmode="numeric" maxlength="6" placeholder="Enter 6-digit code" value="' + O.esc(f.otpCode || '') + '"/>' +
          '<button type="button" class="auth-mini-btn" data-action="otpVerify">Verify</button>' +
        '</div>' +
        '<div class="auth-hint">We sent a code to your email. Enter it to confirm ownership.</div>'
      : '';
    return row + codeRow;
  }

  function signup() {
    var s      = O.state;
    var f      = s.form;
    var stages = (I.stages && I.stages[s.account]) || I.stages.personal;
    var idx    = s.signupStage - 1;
    var stage  = stages[idx];

    // ── Congratulations stage ──────────────────────────────
    if (stage.congrats) {
      var creating = !!O._creating;
      var noun = (s.account === 'organization') ? 'students' : (s.account === 'family' ? 'children' : 'you');
      var headline = (s.account === 'personal')
        ? 'Welcome aboard!'
        : 'Thank you for choosing us!';
      var blurb = (s.account === 'personal')
        ? 'Everything is ready. Let\'s uncover who you really are and map the path ahead.'
        : 'We\'re ready to work with your ' + noun + ' and grow with them. Together, we go far.';
      return '' +
      '<div class="auth-stage">' +
        brandBar() +
        '<div class="auth-card" style="max-width:460px;text-align:center">' +
          progressBanner(stages, idx) +
          '<div class="auth-congrats">' +
            '<div class="auth-congrats-burst">' + (creating ? '<span class="auth-spinner"></span>' : '🎉') + '</div>' +
            '<h1 class="auth-h1" style="margin-top:6px">' + O.esc(headline) + '</h1>' +
            '<p class="auth-sub" style="margin-bottom:22px">' + O.esc(blurb) + '</p>' +
          '</div>' +
          errBox('stageErr') +
          (creating
            ? '<button class="auth-submit" style="margin-top:0" disabled>Creating your account…</button>'
            : '<button class="auth-submit" style="margin-top:0" data-action="signupCreate">Create account ' + _arr + '</button>') +
          (creating ? '' : '<button class="auth-btn-sec" style="width:100%;margin-top:12px;justify-content:center" data-action="signupBack">' + _bck + ' Back</button>') +
        '</div>' +
      '</div>';
    }

    // ── Normal field stage — every concern in its own panel ─
    // Each data group sits in a respected, separated section so unrelated
    // fields are never visually mixed. The credentials stage (email +
    // password) splits each datum into its own titled group.
    var body = '';
    var isSecure = !!(stage.recovery || stage.policy);

    if (isSecure) {
      // split credentials into individually-respected groups
      (stage.fields || []).forEach(function (fl) {
        var head = (fl[2] === 'email')
          ? { ic: _mail, t: 'Verify your email', sub: "We'll send a one-time code to confirm it's really you." }
          : (fl[2] === 'password')
            ? { ic: _lock, t: 'Choose a password', sub: 'This secures every future login — make it strong.' }
            : null;
        body += '<div class="auth-group">' +
          (head ? '<div class="auth-group-head"><span class="auth-group-ic">' + head.ic + '</span>' + head.t + '</div><div class="auth-group-sub">' + head.sub + '</div>' : '') +
          signupField(fl, f) +
        '</div>';
      });
    } else {
      body += '<div class="auth-group">' +
        (stage.fields || []).map(function (fl) { return signupField(fl, f); }).join('') +
      '</div>';
    }

    if (stage.recovery) {
      body += '<div class="auth-group">' +
        '<div class="auth-group-head"><span class="auth-group-ic">' + _lock + '</span>Password recovery</div>' +
        '<div class="auth-group-sub">Two facts and two favourites — so only you can ever recover this account.</div>' +
        I.recovery.map(function (r) {
          return '<div class="af"><div class="ah-label">' + O.esc(r.q) + '</div>' +
            holder(_lock, '<input data-field="' + r.k + '" type="text" placeholder="Your answer" value="' + O.esc(f[r.k] || '') + '"/>') +
          '</div>';
        }).join('') +
      '</div>';
    }

    if (stage.policy) {
      var acctLabel = { personal: 'personal', family: 'family', organization: 'organization' }[s.account] || s.account;
      body += '<div class="auth-group auth-group-policy">' +
        '<div class="auth-group-head"><span class="auth-group-ic">&#128737;</span>Terms &amp; Privacy</div>' +
        '<button class="auth-policy-btn" data-action="togglePolicy" id="policyToggleBtn">' +
          '<span>&#128274; Read how we handle your ' + acctLabel + ' data</span>' +
          '<span class="auth-policy-arrow">' + _chevDown + '</span>' +
        '</button>' +
        '<div class="auth-policy-body" id="policyContent">' + policyContent(s.account) + '</div>' +
        '<label class="auth-agree-row">' +
          '<input type="checkbox" data-field="agreed"' + (f.agreed ? ' checked' : '') + ' onchange="OCRA.state.form.agreed=this.checked"/>' +
          '<span class="auth-agree-lbl">I have read and agree to OCRA\'s <button class="auth-link" style="font-size:13px" data-action="togglePolicy">Terms &amp; Privacy Policy</button></span>' +
        '</label>' +
      '</div>';
    }

    var acctName = { personal: 'Personal', family: 'Family', organization: 'Organization' }[s.account] || s.account;
    var socialBlock = (s.signupStage === 1)
      ? socialRow() + '<div class="auth-divider">or sign up with email</div>'
      : '';

    return '' +
    '<div class="auth-stage">' +
      brandBar() +
      '<div class="auth-card auth-signup">' +
        progressBanner(stages, idx) +
        '<h1 class="auth-h1">' + O.esc(stage.title) + '</h1>' +
        '<p class="auth-sub" style="margin-bottom:18px">' + O.esc(acctName) + ' account &middot; Step ' + s.signupStage + ' of ' + stages.length + '</p>' +
        socialBlock +
        body +
        errBox('stageErr') +
        '<div class="auth-nav-row">' +
          '<button class="auth-btn-sec" data-action="signupBack">' + _bck + ' Back</button>' +
          '<button class="auth-submit" style="margin-top:0" data-action="signupNext">Continue ' + _arr + '</button>' +
        '</div>' +
        '<p class="auth-toggle-line">Have an account? <button class="auth-link" data-action="setAuthMode" data-value="login">Sign in</button></p>' +
      '</div>' +
    '</div>';
  }

  // ─────────────────────────────────────────────────────────
  // DEVELOPER LOGIN
  // ─────────────────────────────────────────────────────────
  O.screens.devLogin = function () {
    return '' +
    '<div class="auth-stage">' +
      brandBar() +
      '<div class="auth-card">' +
        '<h1 class="auth-h1">Developer Login</h1>' +
        '<p class="auth-sub">Restricted access. Developer credentials required.</p>' +
        '<div id="devLoginForm" data-auth>' +
          holder(_mail, '<input data-field="email" type="email" placeholder="developer@ocra.app" autocomplete="email"/>') +
          pwHolder('password', 'Password', 'current-password') +
          errBox() +
          '<button class="auth-submit cyan" data-action="devEnter">Enter Console ' + _arr + '</button>' +
        '</div>' +
        '<p class="auth-toggle-line"><button class="auth-link" data-action="diveIn">&#8592; Back to intro</button></p>' +
      '</div>' +
    '</div>';
  };

  // ─────────────────────────────────────────────────────────
  // BRAIN TEST START (unchanged)
  // ─────────────────────────────────────────────────────────
  O.screens.brainTestStart = function () {
    return '' +
    '<div class="center"><div class="glass card-pad" style="max-width:540px;text-align:center">' +
      '<div style="font-size:36px;margin-bottom:14px">&#129504;</div>' +
      '<div style="font-size:26px;font-weight:800;color:var(--ink);margin-bottom:8px">Brain Test</div>' +
      '<p class="muted" style="margin-bottom:20px;line-height:1.6">' +
        'This 60-question assessment measures 6 core cognitive dimensions. One question per screen. ' +
        'No time limit per question, but response speed is recorded for authenticity.' +
      '</p>' +
      '<div class="glass panel" style="text-align:left;margin-bottom:20px;background:rgba(14,107,168,.08)">' +
        '<div class="label" style="font-size:12px;color:var(--ocean);margin-bottom:10px">What to expect</div>' +
        '<ul style="margin:0;padding-left:20px;font-size:12px;color:var(--ink);line-height:1.8">' +
          '<li><strong>60 questions</strong> total &mdash; roughly 15&ndash;30 minutes</li>' +
          '<li><strong>6 dimensions</strong> (10 questions each)</li>' +
          '<li><strong>One per screen</strong> &mdash; easy to focus</li>' +
          '<li><strong>No penalties</strong> for time &mdash; authenticity matters</li>' +
          '<li><strong>Your answers are private</strong> &mdash; used only for your report</li>' +
        '</ul>' +
      '</div>' +
      '<button class="btn primary full lg" data-action="brainTestBegin" style="margin-bottom:10px;padding:16px;font-weight:700">Start Test</button>' +
      '<button class="btn full" data-action="enterDash" style="padding:12px">Back to Dashboard</button>' +
    '</div></div>';
  };

})(window.OCRA);
