/* ============================================================
   DOMAIN_26 — EXPERIENCE (entry flow screens)
   intro -> choose (academics/finances) -> account type -> auth/signup
   ============================================================ */
(function (O) {
  "use strict";
  var I = O.identity;

  // INTRO — animated entrance, logo press-and-hold 5 s = silent dev access
  O.screens.intro = function () {
    return '' +
    '<div class="center"><div class="ocra-intro" style="text-align:center">' +
      '<div id="devHold" style="display:inline-grid;place-items:center;margin-bottom:16px;cursor:pointer;position:relative" title="OCRA">' +
        O.logo(88, false) +
        '<svg width="88" height="88" viewBox="0 0 100 100" style="position:absolute;inset:0;transform:rotate(-90deg)">' +
          '<circle id="devRing" cx="50" cy="50" r="46" fill="none" stroke="var(--ocean)" stroke-width="3" stroke-dasharray="289" stroke-dashoffset="289" opacity=".85"/>' +
        '</svg>' +
      '</div>' +
      '<div style="font-size:46px;font-weight:800;letter-spacing:.14em;color:var(--ink);margin-bottom:10px">OCRA</div>' +
      '<p class="muted" style="font-size:14px;line-height:1.7;margin:0 0 30px;max-width:340px">' +
        'Decode each learner&rsquo;s potential.<br>Map it to real career paths.' +
      '</p>' +
      '<button class="btn primary lg" data-action="diveIn">Dive In</button>' +
    '</div></div>';
  };

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
