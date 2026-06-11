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
          '<button class="ocra-dive" data-action="diveIn">Dive In</button>' +
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

  // CHOOSE — Academics / Finances
  O.screens.choose = function () {
    return '' +
    '<div class="center"><div class="choose-grid">' +
      '<button class="glass choose-tile" data-action="academics">' +
        '<div class="label" style="font-size:20px;color:var(--ink)">Academics</div>' +
        '<div class="muted" style="font-size:13px;margin-top:8px">Records &middot; analysis &middot; careers</div>' +
      '</button>' +
      '<div class="glass choose-tile soon">' +
        '<div class="label" style="font-size:20px;color:var(--ink)">Finances</div>' +
        '<div class="muted" style="font-size:13px;margin-top:8px">Under development</div>' +
      '</div>' +
    '</div></div>';
  };

  // ACCOUNT — popup-style chooser then Dive In
  O.screens.account = function () {
    var s = O.state;
    var opt = function (a) {
      return '<button class="btn full" data-action="pickAccount" data-value="' + a + '" ' +
        'style="padding:14px;text-transform:capitalize;' + (s.account === a ? "background:var(--ocean);color:#fff" : "") + '">' + a + ' Account</button>';
    };
    return '' +
    '<div class="center"><div class="glass card-pad" style="max-width:460px;width:100%;text-align:center">' +
      '<div class="label" style="font-size:13px;color:var(--ink);margin-bottom:18px">Choose your account</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px">' + opt("personal") + opt("family") + opt("organization") + '</div>' +
      '<button class="btn deep full" data-action="accountNext" style="margin-top:18px;padding:14px;font-weight:700">Dive In</button>' +
    '</div></div>';
  };

  // AUTH — login or signup (signup is multi-stage)
  O.screens.auth = function () {
    return O.state.authMode === "signup" ? signup() : loginView();
  };

  function loginView() {
    var s = O.state;
    return '' +
    '<div class="center"><div class="glass card-pad" data-auth style="max-width:420px;width:100%">' +
      '<div style="display:grid;place-items:center;margin-bottom:16px">' + O.logo(56, false) + '</div>' +
      '<div class="label" style="font-size:13px;color:var(--ink);text-align:center;margin-bottom:16px;text-transform:capitalize">' + O.esc(s.account) + ' &middot; Log in</div>' +
      '<div class="field"><label>Email</label><input data-field="email" type="email" placeholder="you@example.com"/></div>' +
      '<div class="field"><label>Password</label><input data-field="password" type="password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"/></div>' +
      '<p id="authMsg" class="err"></p>' +
      '<button class="btn primary full" data-action="login" style="padding:14px;font-weight:700;margin-top:6px">Enter</button>' +
      '<div style="text-align:center;margin-top:12px;font-size:12px" class="muted">No account? ' +
        '<button class="btn" data-action="setAuthMode" data-value="signup" style="padding:4px 10px">Sign up</button></div>' +
    '</div></div>';
  }

  function signup() {
    var s = O.state, f = s.form;
    var stages = I.stages[s.account];
    var stage = stages[s.signupStage - 1];
    var rail = stages.map(function (_, i) { return '<i class="' + (i < s.signupStage ? "on" : "") + '"></i>'; }).join("");

    var body = "";
    if (stage.policy) {
      body =
        '<p class="muted" style="font-size:13px;line-height:1.6">By continuing you agree to OCRA&rsquo;s data &amp; privacy policy. Your records stay yours; you can recover or delete them within the 30-day window.</p>' +
        '<label style="display:flex;gap:10px;align-items:center;margin-top:14px;font-size:13px;color:var(--ink)">' +
          '<input type="checkbox" data-field="agreed" ' + (f.agreed ? "checked" : "") + ' onchange="OCRA.state.form.agreed=this.checked" style="width:18px;height:18px"/> I agree.' +
        '</label>';
    } else {
      body = (stage.fields || []).map(function (fl) {
        var key = fl[0], lab = fl[1], type = fl[2] || "text", val = O.esc(f[key] || "");
        if (type === "select") {
          var opts = (fl[3] || []).map(function (o) { return '<option ' + (f[key] === o ? "selected" : "") + '>' + O.esc(o) + '</option>'; }).join("");
          return '<div class="field"><label>' + O.esc(lab) + '</label><select data-field="' + key + '">' + opts + '</select></div>';
        }
        return '<div class="field"><label>' + O.esc(lab) + '</label><input data-field="' + key + '" type="' + type + '" value="' + val + '"/>' +
          (type === "password" ? '<div class="hint">9+ characters, a capital, a number and a symbol.</div>' : "") + '</div>';
      }).join("");

      if (stage.recovery) {
        body += '<div class="label" style="font-size:11px;color:var(--ink);margin:14px 0 8px">Recovery questions</div>';
        body += I.recovery.map(function (r) {
          return '<div class="field"><label>' + O.esc(r.q) + '</label><input data-field="' + r.k + '" value="' + O.esc(f[r.k] || "") + '"/></div>';
        }).join("");
      }
    }

    var last = s.signupStage === stages.length;
    return '' +
    '<div class="center"><div class="glass card-pad" style="max-width:460px;width:100%">' +
      '<div class="rail">' + rail + '</div>' +
      '<div class="label" style="font-size:13px;color:var(--ink);margin-bottom:14px;text-transform:capitalize">' + O.esc(s.account) + ' &middot; ' + O.esc(stage.title) + '</div>' +
      body +
      '<p id="stageErr" class="err"></p>' +
      '<div style="display:flex;gap:10px;margin-top:8px">' +
        '<button class="btn" data-action="signupBack" style="flex:1;padding:13px">Back</button>' +
        '<button class="btn primary" data-action="signupNext" style="flex:2;padding:13px;font-weight:700">' + (last ? "Create account" : "Continue") + '</button>' +
      '</div>' +
      '<div style="text-align:center;margin-top:12px;font-size:12px" class="muted">Have an account? ' +
        '<button class="btn" data-action="setAuthMode" data-value="login" style="padding:4px 10px">Log in</button></div>' +
    '</div></div>';
  }


  // BRAIN TEST START — intro screen before the 60-question test
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
