/* ============================================================
   DOMAIN_02 — IDENTITY & SECURITY
   Multi-stage signup, login, password rules, recovery questions,
   hidden developer access (5s hold). Mock store today.
   ---- BACKEND SEAM ----------------------------------------------------
   Replace store() / login() bodies with Firebase Auth (you already use
   Firebase) or FastAPI /auth endpoints. Everything else stays the same.
   --------------------------------------------------------------------- */
(function (O) {
  "use strict";
  var I = (O.identity = {});

  // password rule from your locked spec: 9+ chars, capital, number, symbol
  I.validPassword = function (p) {
    return /.{9,}/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);
  };
  I.validEmail = function (e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); };

  // recovery questions: 2 FACTS + 2 FAVORITES (locked)
  I.recovery = [
    { k: "rq_mother", q: "Mother's name (fact)" },
    { k: "rq_friend", q: "Best friend's name (fact)" },
    { k: "rq_pet", q: "Favourite pet (favourite)" },
    { k: "rq_subject", q: "Favourite subject (favourite)" },
  ];

  // stage field configs per account type (data-driven -> scalable)
  I.stages = {
    personal: [
      { title: "About you", fields: [["first", "First name"], ["last", "Last name"], ["dob", "Date of birth", "date"], ["gender", "Gender", "select", ["", "Female", "Male"]], ["country", "Country"]] },
      { title: "Academics", fields: [["school", "School"], ["system", "Education system", "select", ["", "CBC / CBE", "8-4-4", "IGCSE", "IB", "AP", "A-Level"]], ["grade", "Grade / level"]] },
      { title: "Account", fields: [["email", "Email", "email"], ["password", "Password", "password"]], recovery: true },
      { title: "Agreement", policy: true },
    ],
    family: [
      { title: "Family", fields: [["familyName", "Family surname"], ["slogan", "Slogan (optional)"], ["country", "Country"]] },
      { title: "Parents", fields: [["momEmail", "Mum email", "email"], ["dadEmail", "Dad email", "email"]] },
      { title: "Account", fields: [["password", "Password", "password"]], recovery: true },
      { title: "Agreement", policy: true },
    ],
    organization: [
      { title: "Organization", fields: [["orgName", "Organization name"], ["orgType", "Type", "select", ["", "Primary school", "Junior school","Senior school", "College", "University", "Tutoring centre", "NGO"]], ["county", "County / region"]] },
      { title: "Contact", fields: [["principal", "Principal / director"], ["email", "Org email", "email"], ["phone", "Org phone"]] },
      { title: "Account", fields: [["password", "Password", "password"]], recovery: true },
      { title: "Agreement", policy: true },
    ],
  };

  // ---- mock persistence (swap for Firebase/FastAPI) ----
  I.store = function (record) {
    try {
      var all = JSON.parse(localStorage.getItem("ocra_accounts") || "[]");
      all.push(record); localStorage.setItem("ocra_accounts", JSON.stringify(all));
    } catch (e) { /* private mode */ }
  };

  I.login = function (btn) {
    var card = btn.closest("[data-auth]");
    var email = card.querySelector('[data-field="email"]');
    var pass = card.querySelector('[data-field="password"]');
    var msg = card.querySelector("#authMsg");
    if (!I.validEmail(email.value)) { msg.textContent = "Please enter a valid email."; return; }
    if (!pass.value) { msg.textContent = "Enter your password."; return; }
    O.state.user = { email: email.value, type: O.state.account };
    O.go({ phase: "dash", dash: O.state.account });
  };

  I.signupBack = function () {
    if (O.state.signupStage > 1) O.go({ signupStage: O.state.signupStage - 1 });
    else O.go({ authMode: "login" });
  };

  I.signupNext = function () {
    var stages = I.stages[O.state.account];
    var idx = O.state.signupStage - 1;
    var stage = stages[idx];
    var f = O.state.form;
    var err = I.validateStage(stage, f);
    var box = document.getElementById("stageErr");
    if (err) { if (box) box.textContent = err; return; }

    if (O.state.signupStage < stages.length) {
      O.go({ signupStage: O.state.signupStage + 1 });
    } else {
      // final stage -> create account
      I.store({ type: O.state.account, fields: f, created: Date.now() });
      O.state.user = { email: f.email || f.momEmail || "user", type: O.state.account };
      O.go({ phase: "dash", dash: O.state.account, signupStage: 1, form: {} });
    }
  };

  I.validateStage = function (stage, f) {
    if (stage.policy) { return f.agreed ? "" : "Please accept the agreement to continue."; }
    var fields = stage.fields || [];
    for (var i = 0; i < fields.length; i++) {
      var key = fields[i][0], type = fields[i][2];
      var optional = /optional/i.test(fields[i][1]);
      var val = f[key];
      if (!optional && (!val || !String(val).trim())) return "Please fill in: " + fields[i][1] + ".";
      if (type === "email" && val && !I.validEmail(val)) return fields[i][1] + " is not valid.";
      if (type === "password" && !I.validPassword(val)) return "Password needs 9+ characters, a capital, a number and a symbol.";
    }
    if (stage.recovery) {
      for (var r = 0; r < I.recovery.length; r++) {
        if (!f[I.recovery[r].k]) return "Answer all 4 recovery questions.";
      }
    }
    return "";
  };

  // ---- hidden developer access: hold the intro mark for 5 seconds ----
  O.bindHold = function () {
    var el = document.getElementById("devHold");
    if (!el) return;
    var timer = null, ring = el.querySelector("#devRing");
    function start() {
      el.dataset.holding = "1";
      if (ring) ring.style.transition = "stroke-dashoffset 5s linear", ring.style.strokeDashoffset = "0";
      timer = setTimeout(function () {
        O.state.user = { email: "developer", type: "developer" };
        O.go({ phase: "dash", dash: "developer" });
      }, 5000);
    }
    function cancel() {
      clearTimeout(timer);
      if (ring) ring.style.transition = "none", ring.style.strokeDashoffset = "289";
    }
    el.addEventListener("mousedown", start); el.addEventListener("touchstart", start, { passive: true });
    ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(function (ev) { el.addEventListener(ev, cancel); });
  };

})(window.OCRA);
