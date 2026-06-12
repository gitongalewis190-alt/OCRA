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
  I.validUrl = function (u) { return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i.test((u || "").trim()); };

  // Country "chirp" check — the typed value must resolve to a real country.
  I.validCountry = function (name) {
    if (!name) return false;
    var n = name.trim().toLowerCase();
    return I.DATA.countries.some(function (c) { return c.toLowerCase() === n; });
  };

  // Phone: a dialing code must be chosen and the number must be 6–14 digits.
  I.validPhone = function (code, number) {
    if (!code) return false;
    var digits = (number || "").replace(/[^\d]/g, "");
    return digits.length >= 6 && digits.length <= 14;
  };

  // The five encouragement captions shown under the progress banner.
  I.SECTION_LABELS = [
    "Get started with account creation",
    "Good job — tell us more",
    "You nailed it — one more push",
    "Now secure your account",
    "Congratulations — it's all yours",
  ];

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

  // ---- PHONE DIALING CODES (Africa first, then the wider world) ----
  I.DATA.phoneCodes = [
    { n: "Kenya", d: "+254" }, { n: "Uganda", d: "+256" }, { n: "Tanzania", d: "+255" },
    { n: "Rwanda", d: "+250" }, { n: "Burundi", d: "+257" }, { n: "South Sudan", d: "+211" },
    { n: "Ethiopia", d: "+251" }, { n: "Somalia", d: "+252" }, { n: "Nigeria", d: "+234" },
    { n: "Ghana", d: "+233" }, { n: "South Africa", d: "+27" }, { n: "Egypt", d: "+20" },
    { n: "Morocco", d: "+212" }, { n: "Algeria", d: "+213" }, { n: "Tunisia", d: "+216" },
    { n: "Libya", d: "+218" }, { n: "Sudan", d: "+249" }, { n: "Senegal", d: "+221" },
    { n: "Côte d'Ivoire", d: "+225" }, { n: "Cameroon", d: "+237" }, { n: "Zambia", d: "+260" },
    { n: "Zimbabwe", d: "+263" }, { n: "Botswana", d: "+267" }, { n: "Namibia", d: "+264" },
    { n: "Malawi", d: "+265" }, { n: "Mozambique", d: "+258" }, { n: "Angola", d: "+244" },
    { n: "Congo (DRC)", d: "+243" }, { n: "Mali", d: "+223" }, { n: "Burkina Faso", d: "+226" },
    { n: "Niger", d: "+227" }, { n: "Benin", d: "+229" }, { n: "Togo", d: "+228" },
    { n: "Gambia", d: "+220" }, { n: "Sierra Leone", d: "+232" }, { n: "Liberia", d: "+231" },
    { n: "Mauritius", d: "+230" }, { n: "Madagascar", d: "+261" }, { n: "Eswatini", d: "+268" },
    { n: "Lesotho", d: "+266" }, { n: "Gabon", d: "+241" }, { n: "Chad", d: "+235" },
    { n: "United States", d: "+1" }, { n: "United Kingdom", d: "+44" }, { n: "Canada", d: "+1" },
    { n: "India", d: "+91" }, { n: "Pakistan", d: "+92" }, { n: "Bangladesh", d: "+880" },
    { n: "China", d: "+86" }, { n: "Japan", d: "+81" }, { n: "Australia", d: "+61" },
    { n: "Germany", d: "+49" }, { n: "France", d: "+33" }, { n: "Italy", d: "+39" },
    { n: "Spain", d: "+34" }, { n: "Netherlands", d: "+31" }, { n: "Brazil", d: "+55" },
    { n: "Saudi Arabia", d: "+966" }, { n: "United Arab Emirates", d: "+971" }, { n: "Qatar", d: "+974" },
    { n: "Turkey", d: "+90" }, { n: "Russia", d: "+7" }, { n: "Mexico", d: "+52" },
    { n: "Indonesia", d: "+62" }, { n: "Malaysia", d: "+60" }, { n: "Singapore", d: "+65" },
    { n: "Philippines", d: "+63" }, { n: "South Korea", d: "+82" }, { n: "New Zealand", d: "+64" },
  ];

  // ---- ACADEMIC LEVELS per system — chosen system narrows the level list ----
  I.LEVELS = {
    "CBC":      ["PP1","PP2","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"],
    "KCSE":     ["Std 1","Std 2","Std 3","Std 4","Std 5","Std 6","Std 7","Std 8","Form 1","Form 2","Form 3","Form 4"],
    "KPSEA":    ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6"],
    "IGCSE":    ["Year 7","Year 8","Year 9","IGCSE Year 1","IGCSE Year 2"],
    "O-Level":  ["O-Level Year 1","O-Level Year 2"],
    "A-Level":  ["AS Level","A2 Level"],
    "GCSE":     ["Year 9","Year 10","Year 11"],
    "IB":       ["PYP","MYP 1","MYP 2","MYP 3","MYP 4","MYP 5","DP Year 1","DP Year 2"],
    "AP":       ["Grade 9","Grade 10","Grade 11","Grade 12"],
    "American": ["Grade 9 (Freshman)","Grade 10 (Sophomore)","Grade 11 (Junior)","Grade 12 (Senior)"],
    "WASSCE":   ["JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3"],
    "NSC":      ["Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"],
    "CBSE":     ["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"],
    "_default": ["Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Year 7","Year 8","Year 9","Year 10","Year 11","Year 12"],
  };

  // Map a chosen system string to its level list (keyword match, with fallback).
  I.levelsForSystem = function (sys) {
    if (!sys) return I.LEVELS._default;
    var s = sys.toUpperCase();
    var keys = ["CBC","KCSE","KPSEA","IGCSE","O-LEVEL","A-LEVEL","GCSE","IB","AP","AMERICAN","WASSCE","NSC","CBSE"];
    for (var i = 0; i < keys.length; i++) {
      if (s.indexOf(keys[i]) >= 0) {
        var norm = keys[i].replace("-LEVEL", "-Level");
        return I.LEVELS[norm] || I.LEVELS[keys[i]] || I.LEVELS._default;
      }
    }
    return I.LEVELS._default;
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
  // Field tuple: [key, label, type, extra, sample]
  //   types: text | number | email | password | date | select | list |
  //          country | phone | multiselect | logo | level | url
  //   extra: select->options[]  list/multiselect->DATA key  level->systemKey
  //   sample: low-opacity example shown when the field is empty
  I.stages = {
    organization: [
      { title: "Tell us who you are", fields: [
        ["country", "Country", "country", null, "Kenya"],
        ["orgName", "Organization name", "text", null, "Bright Future Academy"],
        ["slogan", "Organization slogan / motto", "text", null, "Nurturing tomorrow's leaders"],
        ["orgUrl", "Organization website / URL", "url", null, "https://brightfuture.ac.ke"],
      ] },
      { title: "Your organization, in detail", fields: [
        ["directorName", "CEO / Director full name (2–3 names)", "text", null, "John Mark Johnson"],
        ["phone", "Organization phone", "phone", null, "712 345 678"],
        ["location", "Physical location / address", "text", null, "Westlands, Nairobi"],
        ["logo", "Organization logo", "logo"],
      ] },
      { title: "Scope & systems", fields: [
        ["students", "Approximate number of students", "number", null, "450"],
        ["systems", "Academic systems used (choose one or more)", "multiselect", "systems"],
      ] },
      { title: "Secure your account", fields: [
        ["email", "Organization email", "email", null, "admin@brightfuture.ac.ke"],
        ["password", "Password", "password"],
      ], recovery: true, policy: true },
      { title: "All set", congrats: true },
    ],
    personal: [
      { title: "Tell us who you are", fields: [
        ["first", "First name", "text", null, "Jane"],
        ["last", "Last name", "text", null, "Doe"],
        ["nick", "Nickname", "text", null, "Janey"],
        ["age", "Age", "number", null, "15"],
        ["gender", "Gender", "select", ["", "Female", "Male", "Prefer to self-describe"]],
      ] },
      { title: "A little more about you", fields: [
        ["country", "Country", "country", null, "Kenya"],
        ["lang", "Preferred language", "list", "languages", "English"],
        ["phone", "Phone number", "phone", null, "712 345 678"],
      ] },
      { title: "Your academics", fields: [
        ["school", "School name", "text", null, "Nairobi High School"],
        ["system", "Academic system", "list", "systems", "CBC / CBE (Kenya)"],
        ["level", "Academic level / grade", "level", "system"],
      ] },
      { title: "Secure your account", fields: [
        ["email", "Email", "email", null, "jane.doe@email.com"],
        ["password", "Password", "password"],
      ], recovery: true, policy: true },
      { title: "All set", congrats: true },
    ],
    family: [
      { title: "Your family", fields: [
        ["familyName", "Family name", "text", null, "The Johnsons"],
        ["slogan", "Family slogan / motto", "text", null, "Together we rise"],
        ["guardianType", "Who manages this account?", "select", ["", "Both parents", "Single parent / guardian"]],
        ["parent1Name", "Parent / guardian full name", "text", null, "Mary Johnson"],
        ["parent2Name", "Second parent full name (if both parents)", "text", null, "James Johnson"],
      ] },
      { title: "A little more", fields: [
        ["country", "Country", "country", null, "Kenya"],
        ["lang", "Preferred language", "list", "languages", "English"],
        ["phone", "Parent phone number", "phone", null, "712 345 678"],
        ["members", "Approximate number of children / members", "number", null, "3"],
      ] },
      { title: "Systems", fields: [
        ["systems", "Academic systems used (choose one or more)", "multiselect", "systems"],
      ] },
      { title: "Secure your account", fields: [
        ["email", "Family email", "email", null, "johnsons@email.com"],
        ["password", "Password", "password"],
      ], recovery: true, policy: true },
      { title: "All set", congrats: true },
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
    if (err) { if (box) { box.textContent = err; box.style.display = "block"; } return; }
    if (box) box.style.display = "none";
    // Advance toward the congratulations stage. The congrats stage (last)
    // carries its own "Create" button (signupCreate) — Next never creates.
    if (O.state.signupStage < stages.length) {
      O.go({ signupStage: O.state.signupStage + 1 });
    }
  };

  // Is this field allowed to be blank?
  I.fieldOptional = function (fl, f) {
    var key = fl[0];
    if (/optional/i.test(fl[1])) return true;
    // family: second parent only required when "Both parents" is chosen
    if (key === "parent2Name") return (f.guardianType !== "Both parents");
    return false;
  };

  // Validate a single field. Returns "" when ok, else an error message.
  I.validateField = function (fl, f) {
    var key = fl[0], type = fl[2] || "text", label = fl[1];
    var val = f[key];
    var optional = I.fieldOptional(fl, f);

    if (type === "multiselect") {
      if (optional) return "";
      return (val && val.length) ? "" : "Choose at least one for: " + label + ".";
    }
    if (type === "logo") {
      if (optional) return "";
      return (f.logoData || f.logoBuilt) ? "" : "Add a logo — upload one or build one.";
    }
    if (type === "phone") {
      if (optional && !(f[key] || f[key + "_code"])) return "";
      return I.validPhone(f[key + "_code"], val) ? "" : "Enter a valid " + label.toLowerCase() + " with its country code.";
    }

    // generic emptiness check
    if (!optional && (val == null || !String(val).trim())) return "Please fill in: " + label + ".";
    if (optional && (val == null || !String(val).trim())) return "";

    if (type === "email" && !I.validEmail(val)) return label + " is not a valid email.";
    if (type === "url"   && !I.validUrl(val))   return label + " is not a valid URL.";
    if (type === "country" && !I.validCountry(val)) return "Choose a real country for: " + label + ".";
    if (type === "password" && !I.validPassword(val)) return "Password needs 9+ characters, a capital, a number and a symbol.";
    return "";
  };

  I.validateStage = function (stage, f) {
    if (stage.congrats) return "";
    var fields = stage.fields || [];
    for (var i = 0; i < fields.length; i++) {
      var err = I.validateField(fields[i], f);
      if (err) return err;
      // email field must be verified by the code we sent
      if (fields[i][2] === "email" && f.emailVerified !== true) {
        return "Verify your email — enter the code we sent you.";
      }
    }
    if (stage.recovery) {
      for (var r = 0; r < I.recovery.length; r++) {
        if (!f[I.recovery[r].k] || !String(f[I.recovery[r].k]).trim()) return "Answer all 4 recovery questions.";
      }
    }
    if (stage.policy && !f.agreed) return "Please accept the Terms & Privacy Policy to continue.";
    return "";
  };

  // Fraction (0..1) of a stage's requirements that are satisfied — drives the
  // red→green banner fill. Counts fields + recovery + policy as units.
  I.sectionFill = function (stageIndex) {
    var stages = I.stages[O.state.account];
    var stage = stages[stageIndex];
    var f = O.state.form;
    if (!stage) return 0;
    if (stage.congrats) return 1;
    var total = 0, done = 0;
    (stage.fields || []).forEach(function (fl) {
      if (I.fieldOptional(fl, f)) return;
      total++;
      if (!I.validateField(fl, f)) {
        if (fl[2] === "email") { if (f.emailVerified === true) done++; }
        else done++;
      }
    });
    if (stage.recovery) {
      I.recovery.forEach(function (r) { total++; if (f[r.k] && String(f[r.k]).trim()) done++; });
    }
    if (stage.policy) { total++; if (f.agreed) done++; }
    return total ? done / total : 1;
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
