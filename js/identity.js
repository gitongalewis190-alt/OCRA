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

  // ---- GLOBAL DATA LISTS (searchable fields; free text always allowed
  //      so no user is ever limited by what we thought to list) ----
  I.DATA = {
    systems: [
      "CBC / CBE (Kenya)", "8-4-4 / KCSE (Kenya)", "KPSEA (Kenya)",
      "IGCSE (Cambridge)", "O-Level (Cambridge)", "A-Level (Cambridge)", "GCSE (UK)", "Edexcel International",
      "IB — PYP", "IB — MYP", "IB — Diploma (DP)", "IB — Career (CP)",
      "AP (Advanced Placement)", "American High School Diploma",
      "WASSCE / WAEC (West Africa)", "NECO (Nigeria)", "BECE (Ghana / Nigeria)",
      "NECTA / CSEE (Tanzania)", "UNEB — UCE / UACE (Uganda)", "REB (Rwanda)",
      "EGSECE (Ethiopia)", "Somali National Curriculum", "South Sudan CSE",
      "NSC / Matric (South Africa)", "IEB (South Africa)", "CAPS (South Africa)",
      "BGCSE (Botswana)", "MSCE (Malawi)", "ZIMSEC (Zimbabwe)", "ECZ (Zambia)", "HIGCSE (Namibia)",
      "CBSE (India)", "ICSE / CISCE (India)", "NIOS (India)", "State Board (India)",
      "Matric / FSc (Pakistan)", "SSC / HSC (Bangladesh)",
      "French Baccalauréat", "German Abitur", "Italian Maturità", "Spanish Bachillerato",
      "Dutch VWO / HAVO", "Swiss Matura", "Thanaweya Amma (Egypt)", "Tawjihi (Jordan / Palestine)",
      "Saudi Tawjihiyah", "Gaokao (China)", "ATAR (Australia)", "NCEA (New Zealand)",
      "OSSD (Canada — Ontario)", "Montessori", "Waldorf / Steiner", "ACE", "Homeschool", "Other",
    ],
    countries: [
      "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
      "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
      "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
      "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (DRC)","Congo (Republic)",
      "Costa Rica","Côte d'Ivoire","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic",
      "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland",
      "France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea",
      "Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq",
      "Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait",
      "Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
      "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico",
      "Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru",
      "Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman",
      "Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
      "Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","São Tomé and Príncipe",
      "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia",
      "South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
      "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey",
      "Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu",
      "Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
    ],
    languages: [
      "English","Kiswahili","French","Arabic","Spanish","Portuguese","German","Italian","Dutch","Mandarin Chinese",
      "Hindi","Urdu","Bengali","Punjabi","Tamil","Japanese","Korean","Russian","Turkish","Persian (Farsi)",
      "Amharic","Somali","Oromo","Hausa","Yoruba","Igbo","Zulu","Xhosa","Afrikaans","Luganda",
      "Kinyarwanda","Kirundi","Lingala","Shona","Chichewa","Wolof","Twi","Malay / Indonesian","Thai","Vietnamese",
      "Filipino (Tagalog)","Polish","Ukrainian","Greek","Hebrew","Swedish","Norwegian","Danish","Other",
    ],
  };

  // recovery questions: 2 FACTS + 2 FAVORITES (locked)
  I.recovery = [
    { k: "rq_mother", q: "Mother's name (fact)" },
    { k: "rq_friend", q: "Best friend's name (fact)" },
    { k: "rq_pet", q: "Favourite pet (favourite)" },
    { k: "rq_subject", q: "Favourite subject (favourite)" },
  ];

  // stage field configs per account type (data-driven -> scalable)
  // Fields mirror what downstream modules consume: auth.js (first/last/dob/
  // school/system/grade/email/password), report engine (age tier, system),
  // intake form (country/gender), org dashboards (orgName/county).
  // NOTE: family accounts call their learners "members" / "children";
  //       organizations call them "students".
  I.stages = {
    personal: [
      { title: "About you", fields: [["first", "First name"], ["last", "Last name"], ["nick", "Nickname (optional)"], ["dob", "Date of birth", "date"], ["gender", "Gender", "select", ["", "Female", "Male"]], ["country", "Country", "list", "countries"], ["lang", "Preferred language (optional)", "list", "languages"]] },
      { title: "Academics", fields: [["school", "School"], ["system", "Education system", "list", "systems"], ["grade", "Grade / level"]] },
      { title: "Account", fields: [["email", "Email", "email"], ["password", "Password", "password"]], recovery: true },
      { title: "Verify email", otp: true },
      { title: "Agreement", policy: true },
    ],
    family: [
      { title: "Family", fields: [["familyName", "Family surname"], ["slogan", "Slogan (optional)"], ["country", "Country", "list", "countries"], ["lang", "Preferred language (optional)", "list", "languages"], ["children", "Number of children / members (optional)"]] },
      { title: "Parents", fields: [["momEmail", "Mum email", "email"], ["dadEmail", "Dad email", "email"]] },
      { title: "Account", fields: [["password", "Password", "password"]], recovery: true },
      { title: "Verify email", otp: true },
      { title: "Agreement", policy: true },
    ],
    organization: [
      { title: "Organization", fields: [["orgName", "Organization name"], ["orgType", "Type", "select", ["", "Pre-primary / kindergarten", "Primary school", "Junior school", "Senior school", "High school", "College", "University", "TVET / vocational institute", "Tutoring centre", "Homeschool co-op", "Special needs school", "Religious school", "NGO / non-profit", "Government agency", "EdTech company", "Library / learning centre", "Other"]], ["country", "Country", "list", "countries"], ["county", "County / region"], ["lang", "Preferred language (optional)", "list", "languages"]] },
      { title: "Contact", fields: [["principal", "Principal / director"], ["email", "Org email", "email"], ["phone", "Org phone"], ["students", "Approx. number of students (optional)"]] },
      { title: "Account", fields: [["password", "Password", "password"]], recovery: true },
      { title: "Verify email", otp: true },
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
    if (stage.otp) { return ""; } // OTP is a seam — verification waived until Firebase goes live
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

  // ---- hidden developer access: hold logo OR Dive In button for 5 s ----
  // Opens the developer login (open door pre-Firebase; locks to authorised
  // credentials once Firebase is configured). Zero hint text for users.
  O.bindHold = function () {
    function bindLong(el, onStart, onCancel) {
      if (!el || el.dataset.holdBound) return;
      el.dataset.holdBound = "1";
      var timer = null;
      function start() {
        if (onStart) onStart(el);
        timer = setTimeout(function () {
          O._held = true; // suppress the click that fires on release
          O.go({ phase: "devLogin" });
        }, 5000);
      }
      function cancel() {
        clearTimeout(timer);
        if (onCancel) onCancel(el);
      }
      el.addEventListener("mousedown", start); el.addEventListener("touchstart", start, { passive: true });
      ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(function (ev) { el.addEventListener(ev, cancel); });
    }

    // 1. Logo hold — progress ring fills over 5 s
    var logoEl = document.getElementById("devHold");
    if (logoEl) {
      var ring = logoEl.querySelector("#devRing");
      bindLong(logoEl,
        function () { if (ring) { ring.style.transition = "stroke-dashoffset 5s linear"; ring.style.strokeDashoffset = "0"; } },
        function () { if (ring) { ring.style.transition = "none"; ring.style.strokeDashoffset = "289"; } }
      );
    }

    // 2. Dive In button hold — thin progress bar fills along the bottom
    var diveEl = document.getElementById("diveHold");
    if (diveEl) {
      bindLong(diveEl,
        function (el) { el.classList.add("holding"); },
        function (el) { el.classList.remove("holding"); }
      );
    }
  };

})(window.OCRA);
