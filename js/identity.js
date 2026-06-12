/* ============================================================
   DOMAIN_02 — IDENTITY & SECURITY
   Multi-stage signup, validation, country/phone/academic coherence.
   ============================================================ */
(function (O) {
  "use strict";
  var I = (O.identity = {});

  // ---- locked password rules ----
  I.validPassword = function (p) {
    return /.{9,}/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);
  };
  I.validEmail   = function (e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); };
  I.validUrl     = function (u) { return !u || /^https?:\/\/.+/.test(u); };
  I.validCountry = function (n) { return I.DATA.countries.indexOf(n) >= 0; };
  I.validPhone   = function (num) {
    return /^\d{6,14}$/.test((num || "").replace(/[\s\-\(\)]/g, ""));
  };

  // ---- recovery questions (locked spec) ----
  I.recovery = [
    { k: "rq_mother",  q: "Mother’s name" },
    { k: "rq_friend",  q: "Best friend’s name" },
    { k: "rq_pet",     q: "Favourite pet" },
    { k: "rq_subject", q: "Favourite subject" },
  ];

  // ---- 5-section banner labels ----
  I.SECTION_LABELS = [
    "Get started",
    "Tell us more",
    "Nearly there",
    "Secure account",
    "Congratulations",
  ];

  // ---- reference data ----
  I.DATA = {
    countries: [
      "Kenya","Nigeria","South Africa","Tanzania","Uganda","Ethiopia","Ghana","Egypt",
      "Morocco","Senegal","Rwanda","Zambia","Zimbabwe","Botswana","Namibia","Cameroon",
      "Ivory Coast","Madagascar","Mozambique","Angola","Sudan","Somalia","Malawi",
      "United States","United Kingdom","Canada","Australia","India","China","Germany",
      "France","Japan","Brazil","Mexico","Italy","Spain","Netherlands","Sweden",
      "Norway","Denmark","Finland","Switzerland","New Zealand","Singapore","UAE",
      "Saudi Arabia","Pakistan","Bangladesh","Indonesia","Philippines","Malaysia",
      "Argentina","Colombia","Chile","Peru","Portugal","Poland","Ukraine","Russia",
      "Ireland","Belgium","Austria","Czechia","Hungary","Romania","Greece","Turkey",
    ],
    phoneCodes: [
      {c:"Kenya",       code:"+254"}, {c:"Nigeria",      code:"+234"},
      {c:"South Africa",code:"+27"},  {c:"Tanzania",     code:"+255"},
      {c:"Uganda",      code:"+256"}, {c:"Ethiopia",     code:"+251"},
      {c:"Ghana",       code:"+233"}, {c:"Egypt",        code:"+20"},
      {c:"Morocco",     code:"+212"}, {c:"Senegal",      code:"+221"},
      {c:"Rwanda",      code:"+250"}, {c:"Zambia",       code:"+260"},
      {c:"Zimbabwe",    code:"+263"}, {c:"Botswana",     code:"+267"},
      {c:"Namibia",     code:"+264"}, {c:"Cameroon",     code:"+237"},
      {c:"Ivory Coast", code:"+225"}, {c:"Angola",       code:"+244"},
      {c:"Sudan",       code:"+249"}, {c:"Malawi",       code:"+265"},
      {c:"United States",code:"+1"},  {c:"United Kingdom",code:"+44"},
      {c:"Canada",      code:"+1"},   {c:"Australia",    code:"+61"},
      {c:"India",       code:"+91"},  {c:"China",        code:"+86"},
      {c:"Germany",     code:"+49"},  {c:"France",       code:"+33"},
      {c:"Japan",       code:"+81"},  {c:"Brazil",       code:"+55"},
      {c:"Mexico",      code:"+52"},  {c:"Italy",        code:"+39"},
      {c:"Spain",       code:"+34"},  {c:"Netherlands",  code:"+31"},
      {c:"Sweden",      code:"+46"},  {c:"Norway",       code:"+47"},
      {c:"UAE",         code:"+971"}, {c:"Saudi Arabia", code:"+966"},
      {c:"Singapore",   code:"+65"},  {c:"New Zealand",  code:"+64"},
      {c:"Pakistan",    code:"+92"},  {c:"Indonesia",    code:"+62"},
      {c:"Philippines", code:"+63"},  {c:"Malaysia",     code:"+60"},
      {c:"Turkey",      code:"+90"},  {c:"Ireland",      code:"+353"},
      {c:"Portugal",    code:"+351"}, {c:"Poland",       code:"+48"},
      {c:"Ukraine",     code:"+380"}, {c:"Russia",       code:"+7"},
    ],
  };

  // academic systems with country-compatibility rules
  I.ACADEMIC_SYSTEMS = [
    {v:"CBC",          label:"CBC (Kenya 2017+)",              countries:["Kenya"]},
    {v:"8-4-4",        label:"8-4-4 (Kenya legacy)",           countries:["Kenya"]},
    {v:"IGCSE",        label:"IGCSE / Cambridge",              countries:["*"]},
    {v:"IB",           label:"IB (International Baccalaureate)",countries:["*"]},
    {v:"AP",           label:"AP (Advanced Placement)",        countries:["United States","Canada","*"]},
    {v:"A-Level",      label:"A-Level",                        countries:["United Kingdom","Kenya","*"]},
    {v:"American",     label:"American Curriculum",            countries:["United States"]},
    {v:"French Bac",   label:"French Baccalauréat",       countries:["France","Senegal","Ivory Coast","Cameroon","Morocco"]},
    {v:"NSC",          label:"NSC (South Africa)",             countries:["South Africa"]},
  ];

  // levels per academic system
  I.LEVELS = {
    "CBC":        ["PP1","PP2","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6",
                   "Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"],
    "8-4-4":      ["Std 1","Std 2","Std 3","Std 4","Std 5","Std 6","Std 7","Std 8",
                   "Form 1","Form 2","Form 3","Form 4"],
    "IGCSE":      ["Year 7","Year 8","Year 9","Year 10 (GCSE)","Year 11 (GCSE)","AS Level","A Level"],
    "IB":         ["MYP 1","MYP 2","MYP 3","MYP 4","MYP 5","DP Year 1","DP Year 2"],
    "AP":         ["Grade 9","Grade 10","Grade 11 (AP)","Grade 12 (AP)"],
    "A-Level":    ["GCSE","AS Level","A2 Level"],
    "American":   ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"],
    "French Bac": ["Sixième","Cinquième","Quatrième","Troisième","Seconde","Première","Terminale"],
    "NSC":        ["Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"],
  };

  I.levelsForSystem = function (sys) {
    return I.LEVELS[sys] || ["Year 1","Year 2","Year 3","Year 4","Year 5","Year 6"];
  };

  I.dialCodeForCountry = function (country) {
    for (var i = 0; i < I.DATA.phoneCodes.length; i++) {
      if (I.DATA.phoneCodes[i].c === country) return I.DATA.phoneCodes[i].code;
    }
    return null;
  };

  I.systemValidForCountry = function (system, country) {
    if (!system || !country) return true;
    for (var i = 0; i < I.ACADEMIC_SYSTEMS.length; i++) {
      var s = I.ACADEMIC_SYSTEMS[i];
      if (s.v === system) {
        if (s.countries.indexOf("*") >= 0) return true;
        return s.countries.indexOf(country) >= 0;
      }
    }
    return true;
  };

  // ---- stage definitions (5 stages per account type) ----
  I.stages = {
    personal: [
      {
        title: "About you", section: 0,
        fields: [
          ["first",  "First name",      "text",    null, "e.g. Amara"],
          ["last",   "Last name",       "text",    null, "e.g. Osei"],
          ["dob",    "Date of birth",   "date"],
          ["gender", "Gender",          "select",  ["","Female","Male","Non-binary","Prefer not to say"]],
          ["country","Country",         "country", null, "e.g. Kenya"],
        ],
      },
      {
        title: "Your academics", section: 1,
        fields: [
          ["school", "School name",      "text",   null, "e.g. Brookhouse"],
          ["system", "Education system", "acadsys"],
          ["level",  "Current level",   "level"],
        ],
      },
      {
        title: "Contact", section: 2,
        fields: [
          ["email", "Email address", "email"],
          ["phone", "Phone number",  "phone"],
        ],
      },
      {
        title: "Security", section: 3,
        fields: [["password","Password","password"]],
        recovery: true,
      },
      {title:"Congratulations", section:4, congrats:true},
    ],
    family: [
      {
        title: "Your family", section: 0,
        fields: [
          ["familyName",  "Family surname", "text",   null, "e.g. The Mensahs"],
          ["slogan",      "Family slogan",  "text",   null, "optional"],
          ["country",     "Country",        "country",null, "e.g. Ghana"],
        ],
      },
      {
        title: "Guardians", section: 1,
        fields: [
          ["guardianType","Guardian(s)", "select", ["","Mother only","Father only","Both parents","Legal guardian"]],
          ["parent1Name", "Parent / Guardian name", "text", null, "Full name"],
          ["parent2Name", "Second parent",          "text", null, "Full name — if Both parents"],
        ],
      },
      {
        title: "Contact", section: 2,
        fields: [
          ["momEmail","Primary email", "email"],
          ["phone",   "Phone number",  "phone"],
        ],
      },
      {
        title: "Security", section: 3,
        fields: [["password","Password","password"]],
        recovery: true,
      },
      {title:"Congratulations", section:4, congrats:true},
    ],
    organization: [
      {
        title: "Your organization", section: 0,
        fields: [
          ["orgName",  "Organization name", "text",   null, "e.g. Rift Valley Academy"],
          ["orgType",  "Type",              "select", ["","Primary school","Junior school","Senior school","College","University","Tutoring centre","NGO","Other"]],
          ["country",  "Country",           "country",null, "e.g. Kenya"],
          ["county",   "County / Region",   "text",   null, "e.g. Nairobi County"],
        ],
      },
      {
        title: "Contact details", section: 1,
        fields: [
          ["principal","Principal / Director", "text", null, "Full name"],
          ["phone",    "Organization phone",  "phone"],
          ["website",  "Website",             "url",  null, "https://..."],
        ],
      },
      {
        title: "Email & systems", section: 2,
        fields: [
          ["email",  "Organization email",  "email"],
          ["system", "Education system",    "acadsys"],
        ],
      },
      {
        title: "Security", section: 3,
        fields: [["password","Password","password"]],
        recovery: true,
      },
      {title:"Congratulations", section:4, congrats:true},
    ],
  };

  // ---- field-level helpers ----
  I.fieldOptional = function (fl, f) {
    var key = fl[0];
    if (key === "slogan" || key === "website") return true;
    if (key === "parent2Name" && f.guardianType !== "Both parents") return true;
    return false;
  };

  I.validateField = function (fl, f) {
    var key = fl[0], type = fl[2] || "text", val = f[key] || "";
    if (I.fieldOptional(fl, f)) return "";
    if (!val) return (fl[1] || key) + " is required.";
    if (type === "email" && !I.validEmail(val)) return "Enter a valid email address.";
    if (type === "password" && !I.validPassword(val))
      return "Password needs 9+ chars, a capital, a number and a symbol.";
    if (type === "url" && !I.validUrl(val)) return "Enter a valid URL (https://...).";
    if (type === "country" && !I.validCountry(val)) return "Choose a country from the list.";
    if (type === "phone" && !I.validPhone(val)) return "Enter a valid phone number (6–14 digits).";
    return "";
  };

  I.validateStage = function (stage, f) {
    if (stage.congrats) return "";
    var fields = stage.fields || [];
    for (var i = 0; i < fields.length; i++) {
      var err = I.validateField(fields[i], f);
      if (err) return err;
    }
    if (stage.recovery) {
      for (var j = 0; j < I.recovery.length; j++) {
        if (!f[I.recovery[j].k]) return I.recovery[j].q + " is required for account recovery.";
      }
    }
    // email field requires OTP verification
    var hasEmail = fields.some(function (fl) { return fl[2] === "email"; });
    if (hasEmail && !f.emailVerified) return "Please verify your email address first.";
    return "";
  };

  // sectionFill: 0..1 completion fraction for banner progress
  I.sectionFill = function (idx) {
    var stages = I.stages[O.state.account];
    if (!stages) return 0;
    var stage = stages[idx];
    if (!stage || stage.congrats) return 1;
    var f = O.state.form, fields = stage.fields || [];
    var total = 0, done = 0;
    fields.forEach(function (fl) {
      if (I.fieldOptional(fl, f)) return;
      total++;
      if (f[fl[0]]) done++;
    });
    if (stage.recovery) {
      I.recovery.forEach(function (r) { total++; if (f[r.k]) done++; });
    }
    var hasEmail = fields.some(function (fl) { return fl[2] === "email"; });
    if (hasEmail) { total++; if (f.emailVerified) done++; }
    return total === 0 ? 1 : done / total;
  };

  // ---- signup navigation ----
  I.signupNext = function () {
    var stages = I.stages[O.state.account];
    var idx    = O.state.signupStage - 1;
    var stage  = stages[idx];
    if (!stage || stage.congrats) return; // congrats: "Create account" btn handles creation

    var f   = O.state.form;
    var err = I.validateStage(stage, f);
    // cross-field: system ↔ country coherence
    if (!err && f.system && f.country && !I.systemValidForCountry(f.system, f.country)) {
      err = f.system + " is not typically used in " + f.country + ". Please verify or change one.";
    }
    var box = document.getElementById("stageErr");
    if (err) { if (box) box.textContent = err; return; }
    if (box) box.textContent = "";
    if (O.state.signupStage < stages.length) {
      O.go({ signupStage: O.state.signupStage + 1 });
    }
  };

  I.signupBack = function () {
    if (O.state.signupStage > 1) {
      O.go({ signupStage: O.state.signupStage - 1 });
    } else {
      O.go({ phase: "account" });
    }
  };

  // ---- legacy shims (kept for smoke-test & auth.js compatibility) ----
  I.store = function (record) {
    try {
      var all = JSON.parse(localStorage.getItem("ocra_accounts") || "[]");
      all.push(record);
      localStorage.setItem("ocra_accounts", JSON.stringify(all));
    } catch (e) {}
  };

  I.login = function (btn) {
    // overridden by auth.js; this is the fallback
    var card  = btn && btn.closest("[data-auth]");
    var email = card ? (card.querySelector('[data-field="email"]') || {}).value : "";
    var pass  = card ? (card.querySelector('[data-field="password"]') || {}).value : "";
    var msg   = document.getElementById("authMsg");
    if (!email || !pass) { if (msg) msg.textContent = "Enter email and password."; return; }
    if (O.auth) {
      O.auth.logIn(email, pass,
        function (user) { O.go({ phase: "dash", dash: user.role === "developer" ? "developer" : user.accountType }); },
        function (e)    { if (msg) msg.textContent = e; }
      );
    }
  };

})(window.OCRA);
