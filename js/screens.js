/* ============================================================
   DOMAIN_26 — EXPERIENCE (entry flow screens)
   intro -> choose -> account -> auth/signup
   ============================================================ */
(function (O) {
  "use strict";
  var I = O.identity;

  // ── inline SVG icons ──────────────────────────────────────────
  var ic = {
    mail:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
    lock:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
    user:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    globe:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
    phone:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
    bldg:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
    eye:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    check:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    key:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    link:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
    star:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    book:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
  };

  // ── password rules (locked spec) ──────────────────────────────
  O.PW_RULES = [
    {k:"len", label:"9+ characters", test:function(p){return p.length>=9;}},
    {k:"cap", label:"One capital",   test:function(p){return /[A-Z]/.test(p);}},
    {k:"num", label:"One number",    test:function(p){return /[0-9]/.test(p);}},
    {k:"sym", label:"One symbol",    test:function(p){return /[^A-Za-z0-9]/.test(p);}},
  ];

  function pwChecklist(val) {
    return '<ul class="auth-pwreq">' +
      O.PW_RULES.map(function (r) {
        return '<li class="' + (r.test(val || "") ? "met" : "") + '">' + r.label + '</li>';
      }).join("") +
    '</ul>';
  }

  // ── 5-section progress banner ──────────────────────────────────
  function progressBanner(stages, idx) {
    var labels = I.SECTION_LABELS;
    var segs = stages.map(function (_, i) {
      var fill  = i < idx ? 1 : (i === idx ? (I.sectionFill ? I.sectionFill(i) : 0) : 0);
      var pct   = Math.round(fill * 100);
      var color = fill >= 1 ? "#34D399"
                : fill > 0  ? "rgba(56,189,248," + (0.38 + fill * 0.62).toFixed(2) + ")"
                : "rgba(255,80,80,.3)";
      return '<div class="auth-seg">' +
        '<div class="auth-seg-fill" style="width:' + pct + '%;background:' + color + '"></div>' +
      '</div>';
    }).join("");
    var lbls = (labels || []).map(function (l, i) {
      return '<div class="auth-seg-lbl' + (i === idx ? " active" : "") + '">' + O.esc(l) + '</div>';
    }).join("");
    return '<div class="auth-banner"><div class="auth-segs">' + segs + '</div>' +
           '<div class="auth-seg-labels">' + lbls + '</div></div>';
  }

  // ── email OTP field ────────────────────────────────────────────
  function emailVerifyField(key, placeholder, f) {
    if (f.emailVerified && f._verifiedEmail === f[key]) {
      return '<div class="auth-verified">' + ic.check + ' Email verified</div>';
    }
    var sent = !!O._otpSentTo && O._otpSentTo === f[key];
    var html = '<div class="auth-otp-row">' +
      '<div class="ah">' + ic.mail +
        '<input data-field="' + key + '" type="email" placeholder="' + O.esc(placeholder) + '" value="' + O.esc(f[key] || "") + '"/>' +
      '</div>' +
      '<button class="auth-mini-btn" data-action="otpSend" data-key="' + key + '">Send code</button>' +
    '</div>';
    if (sent) {
      html += '<div class="auth-otp-row">' +
        '<div class="ah">' + ic.key +
          '<input id="otpInput" type="text" placeholder="6-digit code" maxlength="6" style="letter-spacing:.2em;font-size:18px"/>' +
        '</div>' +
        '<button class="auth-mini-btn" data-action="otpVerify" data-key="' + key + '">Verify</button>' +
      '</div>';
    }
    return html;
  }

  // ── country field (autocomplete + hint) ───────────────────────
  function countryField(fl, f) {
    var val   = f[fl[0]] || "";
    var valid = val && I.validCountry(val);
    var hint  = val
      ? (valid ? '<div class="auth-hint ok">✓ ' + O.esc(val) + ' recognised</div>'
               : '<div class="auth-hint bad">⚠ Not found — pick from the list</div>')
      : "";
    var opts = (I.DATA.countries || []).map(function (c) {
      return '<option value="' + O.esc(c) + '"/>';
    }).join("");
    return '<div class="ah">' + ic.globe +
      '<input data-field="' + fl[0] + '" list="cList_' + fl[0] + '" ' +
        'placeholder="' + O.esc(fl[4] || "Country") + '" value="' + O.esc(val) + '"/>' +
    '</div>' +
    '<datalist id="cList_' + fl[0] + '">' + opts + '</datalist>' + hint;
  }

  // ── phone field (dial code + number) ──────────────────────────
  function phoneField(fl, f) {
    var codes   = I.DATA.phoneCodes || [];
    var selCode = f.phoneCode || (f.country ? I.dialCodeForCountry(f.country) || "+254" : "+254");
    var opts = codes.map(function (p) {
      return '<option value="' + O.esc(p.code) + '"' + (selCode === p.code ? " selected" : "") + '>' +
             O.esc(p.code) + " " + O.esc(p.c) + "</option>";
    }).join("");
    return '<div class="auth-phone-row">' +
      '<div class="ah auth-code-ah">' + ic.phone +
        '<select data-field="phoneCode" style="font-size:13px;padding:14px 0">' + opts + '</select>' +
      '</div>' +
      '<div class="ah auth-num-ah">' +
        '<input data-field="' + fl[0] + '" type="tel" placeholder="700 000 000" value="' + O.esc(f[fl[0]] || "") + '"/>' +
      '</div>' +
    '</div>';
  }

  // ── level field (depends on system) ───────────────────────────
  function levelField(fl, f) {
    var disabled = !f.system;
    var levels   = f.system ? I.levelsForSystem(f.system) : [];
    var opts = levels.map(function (l) {
      return '<option value="' + O.esc(l) + '"' + (f[fl[0]] === l ? " selected" : "") + '>' + O.esc(l) + "</option>";
    }).join("");
    return '<div class="ah' + (disabled ? " disabled" : "") + '">' + ic.star +
      '<select data-field="' + fl[0] + '"' + (disabled ? ' disabled style="opacity:.4"' : "") + '>' +
        '<option value="">' + (disabled ? "Choose a system first" : "Select level") + '</option>' +
        opts +
      '</select>' +
    '</div>';
  }

  // ── academic system select ─────────────────────────────────────
  function acadSysField(fl, f) {
    var sysVals = (I.ACADEMIC_SYSTEMS || []).map(function (s) { return s.v; });
    var opts = sysVals.map(function (v) {
      return '<option value="' + O.esc(v) + '"' + (f[fl[0]] === v ? " selected" : "") + '>' + O.esc(v) + "</option>";
    }).join("");
    var hint = "";
    if (f[fl[0]] && f.country) {
      var ok = I.systemValidForCountry(f[fl[0]], f.country);
      hint = ok
        ? '<div class="auth-hint ok">✓ ' + O.esc(f[fl[0]]) + ' works in ' + O.esc(f.country) + '</div>'
        : '<div class="auth-hint bad">⚠ ' + O.esc(f[fl[0]]) + ' is not typical for ' + O.esc(f.country) + '</div>';
    }
    return '<div class="ah">' + ic.book +
      '<select data-field="' + fl[0] + '">' +
        '<option value="">Select system</option>' + opts +
      '</select>' +
    '</div>' + hint;
  }

  // ── generic field dispatcher ───────────────────────────────────
  function signupField(fl, f) {
    var key = fl[0], lab = fl[1], type = fl[2] || "text", opts = fl[3], sample = fl[4];
    var val = f[key] || "";

    var iconMap = {
      text:"user", date:"user", select:"bldg", email:"mail",
      password:"lock", country:"globe", phone:"phone",
      level:"star", acadsys:"book", url:"link",
    };
    var iconKey = iconMap[type] || "user";

    if (type === "email")   return '<div class="auth-lbl">' + O.esc(lab) + '</div>' + emailVerifyField(key, sample || "you@example.com", f);
    if (type === "country") return '<div class="auth-lbl">' + O.esc(lab) + '</div>' + countryField(fl, f);
    if (type === "phone")   return '<div class="auth-lbl">' + O.esc(lab) + '</div>' + phoneField(fl, f);
    if (type === "level")   return '<div class="auth-lbl">' + O.esc(lab) + '</div>' + levelField(fl, f);
    if (type === "acadsys") return '<div class="auth-lbl">' + O.esc(lab) + '</div>' + acadSysField(fl, f);

    if (type === "password") {
      return '<div class="auth-lbl">' + O.esc(lab) + '</div>' +
        '<div class="ah">' + ic.lock +
          '<input id="pwField" data-field="' + key + '" type="password" ' +
            'placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" value="' + O.esc(val) + '"/>' +
          '<button class="ah-eye" data-action="togglePw" type="button">' + ic.eye + '</button>' +
        '</div>' +
        pwChecklist(val);
    }

    if (type === "select") {
      var selOpts = (opts || []).map(function (o) {
        return '<option value="' + O.esc(o) + '"' + (val === o ? " selected" : "") + '>' + O.esc(o) + "</option>";
      }).join("");
      return '<div class="auth-lbl">' + O.esc(lab) + '</div>' +
        '<div class="ah">' + ic[iconKey] +
          '<select data-field="' + key + '">' + selOpts + '</select>' +
        '</div>';
    }

    if (type === "url") {
      return '<div class="auth-lbl">' + O.esc(lab) + '</div>' +
        '<div class="ah">' + ic.link +
          '<input data-field="' + key + '" type="url" placeholder="' + O.esc(sample || "https://...") + '" value="' + O.esc(val) + '"/>' +
        '</div>';
    }

    // text / date / number default
    return '<div class="auth-lbl">' + O.esc(lab) + '</div>' +
      '<div class="ah">' + ic[iconKey] +
        '<input data-field="' + key + '" type="' + type + '" ' +
          'placeholder="' + O.esc(sample || "") + '" value="' + O.esc(val) + '"/>' +
      '</div>';
  }

  // ── recovery questions group ───────────────────────────────────
  function recoveryGroup(f) {
    return '<div class="auth-group">' +
      '<div class="auth-grp-head">' +
        '<div class="auth-grp-icon">' + ic.shield + '</div>' +
        '<div>' +
          '<div class="auth-grp-title">Account recovery</div>' +
          '<div class="auth-grp-sub">Two facts + two favourites — never forgotten.</div>' +
        '</div>' +
      '</div>' +
      I.recovery.map(function (r) {
        return '<div class="auth-lbl">' + O.esc(r.q) + '</div>' +
          '<div class="ah">' + ic.key +
            '<input data-field="' + r.k + '" type="text" placeholder="Your answer" value="' + O.esc(f[r.k] || "") + '"/>' +
          '</div>';
      }).join("") +
    '</div>';
  }

  // ── congrats stage ─────────────────────────────────────────────
  function congratsStage(accountType) {
    if (O._creating) {
      return '<div class="auth-congrats">' +
        '<div class="auth-congrats-icon">&#9881;&#65039;</div>' +
        '<div class="auth-congrats-h">Creating your account&hellip;</div>' +
        '<div style="margin-top:18px"><span class="auth-spinner"></span></div>' +
      '</div>';
    }
    return '<div class="auth-congrats">' +
      '<div class="auth-congrats-icon">&#127881;</div>' +
      '<div class="auth-congrats-h">You&rsquo;re all set!</div>' +
      '<div class="auth-congrats-sub">Everything looks great. Tap <strong>Create Account</strong> to launch your ' +
        O.esc(accountType) + ' profile.</div>' +
      '<button class="auth-btn auth-btn-primary" data-action="signupCreate">Create Account</button>' +
    '</div>';
  }

  // ── signup renderer ────────────────────────────────────────────
  function signup() {
    var s = O.state, f = s.form;
    var stages = I.stages[s.account];
    if (!stages) return '<div class="auth-bg"><div class="auth-card">Invalid account type.</div></div>';
    var idx   = s.signupStage - 1;
    var stage = stages[idx] || stages[0];

    var body = "";
    if (stage.congrats) {
      body = congratsStage(s.account);
    } else {
      body = '<div class="auth-group">' +
        (stage.fields || []).map(function (fl) { return signupField(fl, f); }).join("") +
      '</div>';
      if (stage.recovery) body += recoveryGroup(f);
    }

    var isFirst = idx === 0;
    var isCongrats = !!stage.congrats;

    return '' +
    '<div class="auth-bg top">' +
      '<div class="auth-card wide" data-auth>' +
        '<div class="auth-logorow">' + O.logo(44, true) + '</div>' +
        '<div class="auth-title" style="text-transform:capitalize">' + O.esc(s.account) + ' &mdash; Sign up</div>' +
        progressBanner(stages, idx) +
        '<div style="font-size:15px;font-weight:800;color:#dce8f2;margin-bottom:18px">' + O.esc(stage.title) + '</div>' +
        body +
        /* honeypot — off-screen, aria-hidden; bots fill these, humans never see them */
        '<div style="position:absolute;left:-99999px;opacity:0;height:0;overflow:hidden;pointer-events:none" aria-hidden="true">' +
          '<input data-field="hp_name"    type="text"  name="name"    tabindex="-1" autocomplete="off"/>' +
          '<input data-field="hp_email"   type="email" name="email"   tabindex="-1" autocomplete="off"/>' +
          '<input data-field="hp_website" type="url"   name="website" tabindex="-1" autocomplete="off"/>' +
        '</div>' +
        '<p id="stageErr" class="auth-err"></p>' +
        (isCongrats ? '' :
          '<div style="display:flex;gap:10px;margin-top:4px">' +
            '<button class="auth-btn auth-btn-ghost" data-action="signupBack" style="flex:1">' +
              (isFirst ? 'Change account' : '&larr; Back') +
            '</button>' +
            '<button class="auth-btn auth-btn-primary" data-action="signupNext" style="flex:2">Continue &rarr;</button>' +
          '</div>'
        ) +
        '<div class="auth-switch">Have an account? ' +
          '<button class="auth-sw-btn" data-action="setAuthMode" data-value="login">Sign in</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function _socialRow() {
    return '<div class="auth-social">' +
      '<button class="auth-soc-btn" data-action="socialAuth" data-value="google">' +
        '<svg width="15" height="15" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.26 14.58A6.48 6.48 0 015 12c0-.9.16-1.77.44-2.58L2.96 7.64A10.7 10.7 0 001.5 12c0 1.55.3 3.04.85 4.41l2.91-1.83z"/><path fill="#FBBC05" d="M12 5.5c1.47 0 2.8.5 3.84 1.32l2.85-2.85A9.55 9.55 0 0012 1.5C8.15 1.5 4.84 3.72 3.24 6.97l2.77 2.1A6.48 6.48 0 0112 5.5z"/><path fill="#34A853" d="M12 18.5a6.48 6.48 0 01-5.99-4.07l-2.77 2.1C4.84 19.78 8.15 22 12 22c2.52 0 4.83-.93 6.59-2.46l-2.73-2.08A6.43 6.43 0 0112 18.5z"/><path fill="#4285F4" d="M22.5 12c0-.76-.07-1.5-.2-2.22H12v4.22h5.9a5.03 5.03 0 01-2.04 3.08l2.73 2.08C20.56 17.5 22.5 15 22.5 12z"/></svg>' +
        'Google</button>' +
      '<button class="auth-soc-btn" data-action="socialAuth" data-value="apple">' +
        '<svg width="15" height="15" viewBox="0 0 24 24"><path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>' +
        'Apple</button>' +
      '<button class="auth-soc-btn" data-action="socialAuth" data-value="microsoft">' +
        '<svg width="15" height="15" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10.5v10.5H1z"/><path fill="#00A4EF" d="M12.5 1H23v10.5H12.5z"/><path fill="#7FBA00" d="M1 12.5h10.5V23H1z"/><path fill="#FFB900" d="M12.5 12.5H23V23H12.5z"/></svg>' +
        'Microsoft</button>' +
    '</div>';
  }

  // ── login view (email-first) ───────────────────────────────────
  function loginView() {
    var s = O.state;
    var step = s.authStep || "email";
    var capturedEmail = s.authEmail || s.form.email || "";
    return '' +
    '<div class="auth-bg">' +
      '<div class="auth-card" data-auth>' +
        '<div class="auth-logorow">' + O.logo(56, true) + '</div>' +
        '<div class="auth-title" style="text-transform:capitalize">' + O.esc(s.account) + ' &middot; Sign in</div>' +

        (step === "email" ?
          // ── Step 1: email + social
          _socialRow() +
          '<div class="auth-divider">or</div>' +
          '<div class="ah">' + ic.mail +
            '<input id="loginEmail" data-field="email" type="email" placeholder="you@example.com" value="' + O.esc(capturedEmail) + '" autofocus/>' +
          '</div>' +
          '<p id="authMsg" class="auth-err"></p>' +
          '<button class="auth-btn auth-btn-primary" data-action="emailNext">Continue &rarr;</button>'
        :
          // ── Step 2: password
          '<div style="font-size:13px;color:rgba(220,232,242,.55);text-align:center;margin-bottom:14px">' +
            O.esc(capturedEmail) +
            ' &nbsp;<button class="auth-sw-btn sm" data-action="changeEmail">Change</button>' +
          '</div>' +
          '<div class="ah">' + ic.lock +
            '<input id="loginPw" data-field="password" type="password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" autofocus/>' +
            '<button class="ah-eye" data-action="togglePw" type="button">' + ic.eye + '</button>' +
          '</div>' +
          '<div style="text-align:right;margin:-4px 0 10px">' +
            '<button class="auth-sw-btn sm" data-action="forgotPassword">Forgot password?</button>' +
          '</div>' +
          '<p id="authMsg" class="auth-err"></p>' +
          '<button class="auth-btn auth-btn-primary" data-action="login">Sign in</button>'
        ) +

        '<div class="auth-switch">No account? ' +
          '<button class="auth-sw-btn" data-action="setAuthMode" data-value="signup">Sign up</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ── recovery view ──────────────────────────────────────────────
  function recoverView() {
    var s = O.state, f = s.form;
    var samePw = !!s.recoverSamePw;
    return '' +
    '<div class="auth-bg">' +
      '<div class="auth-card" data-auth>' +
        '<div class="auth-logorow">' + O.logo(44, true) + '</div>' +
        '<div class="auth-title">Account recovery</div>' +

        (samePw ?
          '<div style="background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.2);border-radius:14px;padding:20px;text-align:center;margin-bottom:16px">' +
            '<div style="font-size:28px;margin-bottom:8px">&#128274;</div>' +
            '<div style="font-size:14px;font-weight:700;color:#38BDF8;margin-bottom:6px">That&rsquo;s your current password</div>' +
            '<div style="font-size:12px;color:rgba(220,232,242,.5);margin-bottom:18px">Keep using it, or choose a new one.</div>' +
            '<div style="display:flex;gap:10px">' +
              '<button class="auth-btn auth-btn-ghost" data-action="recoverKeepOld" style="flex:1">Keep this one</button>' +
              '<button class="auth-btn auth-btn-primary" data-action="recoverChangePw" style="flex:1">Choose new</button>' +
            '</div>' +
          '</div>'
        :
          '<div class="auth-lbl">Email</div>' +
          '<div class="ah">' + ic.mail +
            '<input data-field="email" type="email" placeholder="you@example.com" value="' + O.esc(s.recoverEmail || f.email || "") + '"/>' +
          '</div>' +
          '<div style="font-size:11.5px;color:rgba(220,232,242,.4);margin:-4px 0 14px">Answer all four recovery questions exactly.</div>' +
          I.recovery.map(function (r) {
            return '<div class="auth-lbl">' + O.esc(r.q) + '</div>' +
              '<div class="ah">' + ic.key +
                '<input data-field="' + r.k + '" placeholder="Your answer" value="' + O.esc(f[r.k] || "") + '"/>' +
              '</div>';
          }).join("") +
          '<div class="auth-lbl">New password</div>' +
          '<div class="ah">' + ic.lock +
            '<input id="recoverPw" data-field="newPassword" type="password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" value="' + O.esc(f.newPassword || "") + '"/>' +
            '<button class="ah-eye" data-action="togglePw" type="button">' + ic.eye + '</button>' +
          '</div>' +
          pwChecklist(f.newPassword || "") +
          '<p id="recoverMsg" class="auth-err"></p>' +
          '<button class="auth-btn auth-btn-primary" data-action="recoverSubmit">Reset password</button>'
        ) +
        '<div class="auth-switch">' +
          '<button class="auth-sw-btn sm" data-action="backToLogin">&larr; Back to sign in</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ── public screen renderers ────────────────────────────────────
  O.screens.auth = function () {
    var m = O.state.authMode;
    if (m === "signup")  return signup();
    if (m === "recover") return recoverView();
    return loginView();
  };
  O.screens.recover  = recoverView;

  O.screens.devLogin = function () {
    return '' +
    '<div class="auth-bg">' +
      '<div class="auth-card" data-auth>' +
        '<div class="auth-logorow">' + O.logo(48, true) + '</div>' +
        '<div class="auth-title">Developer access</div>' +
        '<div class="ah">' + ic.mail +
          '<input id="devEmail" data-field="devEmail" type="email" placeholder="developer@ocra.app"/>' +
        '</div>' +
        '<div class="ah">' + ic.lock +
          '<input id="devPw" data-field="devPassword" type="password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"/>' +
        '</div>' +
        '<p id="devMsg" class="auth-err"></p>' +
        '<button class="auth-btn auth-btn-primary" data-action="devEnter">Enter developer console</button>' +
        '<div class="auth-switch">' +
          '<button class="auth-sw-btn sm" data-action="backToLogin">&larr; Back</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  };

  // ── INTRO — cinematic landing ──────────────────────────────────
  O.screens.intro = function () {
    var logo  = O.logo(112, true);
    var bgMap = {black:"#000000", light:"var(--bg-light)", dark:"var(--bg-dark)"};
    var bgKey = O.developerConsole && O.developerConsole.flags && O.developerConsole.flags.introBackground || "dark";
    var bg    = bgMap[bgKey] || "var(--bg-dark)";
    function orbit(tiltStyle, dur) {
      return '<div style="position:absolute;inset:0;transform-style:preserve-3d;' + tiltStyle + '">' +
        '<div style="position:absolute;inset:0;border-radius:50%;border:1px solid rgba(56,189,248,.28);animation:ocraOrbitSpin ' + dur + 's linear infinite">' +
          '<div style="position:absolute;width:7px;height:7px;background:#38BDF8;border-radius:50%;top:50%;left:3px;transform:translateY(-50%);box-shadow:0 0 10px 3px rgba(56,189,248,.42)"></div>' +
        '</div>' +
      '</div>';
    }
    return '' +
    '<div style="position:fixed;inset:0;background:' + bg + ';display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;z-index:100;overflow:hidden">' +
      '<div style="position:relative;width:200px;height:200px;display:flex;align-items:center;justify-content:center;margin-bottom:28px">' +
        '<div style="position:absolute;inset:0;perspective:900px;transform-style:preserve-3d;pointer-events:none">' +
          orbit("", 3.3) +
          orbit("transform:rotateX(62deg)", 5.2) +
          orbit("transform:rotateY(62deg)", 7.8) +
        '</div>' +
        '<div id="devHold" class="ocra-logo-enter" style="position:relative;cursor:pointer;z-index:1;display:flex;align-items:center;justify-content:center">' +
          logo +
          '<svg width="112" height="112" viewBox="0 0 100 100" style="position:absolute;width:112px;height:112px;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-90deg)">' +
            '<circle id="devRing" cx="50" cy="50" r="46" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="289" stroke-dashoffset="289" opacity=".85"/>' +
          '</svg>' +
        '</div>' +
      '</div>' +
      '<div style="text-align:center;min-height:88px">' +
        '<div id="ocra-line1" style="font-size:15px;font-weight:300;color:rgba(220,232,242,.68);letter-spacing:.06em;min-height:22px"></div>' +
        '<div id="ocra-line2" style="font-size:54px;font-weight:900;color:#38BDF8;letter-spacing:.22em;min-height:66px;line-height:1.1;margin-top:6px"></div>' +
      '</div>' +
      '<p id="ocra-brief" style="max-width:420px;text-align:center;font-size:13px;line-height:1.82;color:rgba(220,232,242,.56);margin:12px 24px 4px;display:none"></p>' +
      '<div id="ocra-sub" style="font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:rgba(220,232,242,.28);margin-bottom:34px;display:none"></div>' +
      '<div id="ocra-btn-wrap" style="display:none">' +
        '<button class="ocra-dive" data-action="diveIn">Dive In</button>' +
      '</div>' +
    '</div>';
  };

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
                            later(240, function () {
                              if (!ok()) return;
                              btnW.style.display = "block";
                            });
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

  // ── CHOOSE ────────────────────────────────────────────────────
  O.screens.choose = function () {
    return '<div class="center"><div class="choose-grid">' +
      '<button class="glass choose-tile" data-action="academics">' +
        '<div class="label" style="font-size:20px;color:var(--ink)">Academics</div>' +
        '<div class="muted" style="font-size:13px;margin-top:8px">Records &middot; analysis &middot; careers</div>' +
      '</button>' +
      '<button class="glass choose-tile soon" data-action="finances">' +
        '<div class="label" style="font-size:20px;color:var(--ink)">Finances</div>' +
        '<div class="muted" style="font-size:13px;margin-top:8px">Under development</div>' +
      '</button>' +
    '</div>';
  };

  // ── ACCOUNT ───────────────────────────────────────────────────
  O.screens.account = function () {
    var s = O.state;
    function opt(a) {
      return '<button class="btn full" data-action="pickAccount" data-value="' + a + '" ' +
        'style="padding:14px;text-transform:capitalize;' + (s.account === a ? "background:var(--ocean);color:#fff" : "") + '">' +
        a + ' Account</button>';
    }
    return '<div class="center"><div class="glass card-pad" style="max-width:460px;width:100%;text-align:center">' +
      '<div class="label" style="font-size:13px;color:var(--ink);margin-bottom:18px">Choose your account</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px">' + opt("personal") + opt("family") + opt("organization") + '</div>' +
      '<button class="btn deep full" data-action="accountNext" style="margin-top:18px;padding:14px;font-weight:700">Dive In</button>' +
    '</div></div>';
  };

  // ── BRAIN TEST START ──────────────────────────────────────────
  O.screens.brainTestStart = function () {
    return '<div class="center"><div class="glass card-pad" style="max-width:540px;text-align:center">' +
      '<div style="font-size:36px;margin-bottom:14px">&#129504;</div>' +
      '<div style="font-size:26px;font-weight:800;color:var(--ink);margin-bottom:8px">Brain Test</div>' +
      '<p class="muted" style="margin-bottom:20px;line-height:1.6">This 60-question assessment measures 6 core cognitive dimensions. One question per screen. No time limit per question, but response speed is recorded for authenticity.</p>' +
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
