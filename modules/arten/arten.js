/* ============================================================
   DOMAIN_29 — ARTEN: 3D COGNITIVE AI COMPANION  v2
   Canvas 3D sphere · Voice in + out · Waveform visualiser
   Direct-answer AI · Security-bounded · Always present

   SECURITY BOUNDARY — Arten may ONLY read:
     O.state.phase           current OCRA screen (navigation only)
     O.state.user.firstName  greeting personalisation only
     O.brainTest.state.completedAt  boolean: has the test finished?
   Arten CANNOT access: email, passwordHash, account ID, role,
   academicRecords, brainTest answers, payment state, form data,
   localStorage, or any other sensitive user data.
   ============================================================ */
(function (O) {
  "use strict";

  // Graceful no-op in smoke test / headless environments
  if (typeof requestAnimationFrame === "undefined") { O.arten = {}; return; }

  var A = (O.arten = {});

  // ═══════════════════════════════════════════════════════════
  // 1. EMOTIONAL PALETTE
  // ═══════════════════════════════════════════════════════════
  var EM = {
    calm:        { base:"#0f0730", mid:"#221060", lit:"#3e1eaa", rim:"rgba(55,20,200,.55)",  eyeC:"#00ccff", glow:"rgba(35,15,175,.38)", rot:.22 },
    thinking:    { base:"#08092e", mid:"#13194a", lit:"#222f8a", rim:"rgba(25,45,190,.42)",  eyeC:"#0077cc", glow:"rgba(18,30,160,.24)", rot:.08 },
    excited:     { base:"#1e0a44", mid:"#3e18a0", lit:"#6a2acc", rim:"rgba(85,25,215,.65)",  eyeC:"#44ffee", glow:"rgba(72,15,215,.48)", rot:.58 },
    encouraging: { base:"#0a1848", mid:"#1b3390", lit:"#2c55c8", rim:"rgba(35,75,215,.52)",  eyeC:"#22ddff", glow:"rgba(25,65,195,.36)", rot:.30 },
    curious:     { base:"#1e0840", mid:"#3a1480", lit:"#6318b0", rim:"rgba(140,35,215,.52)", eyeC:"#cc88ff", glow:"rgba(100,25,195,.40)", rot:.42 },
    listening:   { base:"#083030", mid:"#115555", lit:"#1e9090", rim:"rgba(0,140,140,.60)",  eyeC:"#00ffcc", glow:"rgba(0,120,120,.40)", rot:.18 },
  };

  // ── Security read helper (only allows white-listed fields) ──
  function _ctx() {
    return {
      phase:     (O.state && O.state.phase)                               || "intro",
      firstName: (O.state && O.state.user && O.state.user.firstName)      || null,
      testDone:  !!(O.brainTest && O.brainTest.state && O.brainTest.state.completedAt),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 2. COMPREHENSIVE OCRA KNOWLEDGE BASE
  // ═══════════════════════════════════════════════════════════
  var KB = {
    brainTest: {
      q: 60, dims: ["Verbal Reasoning","Numerical Reasoning","Spatial Intelligence",
                    "Memory & Recall","Processing Speed","Critical Thinking"],
      scoring: "z-normalised across all six dimensions into a single Cognitive Range Score (CRS) plus per-dimension percentiles",
      duration: "25–35 minutes",
      approach: "There are no trick questions. Choose your first instinct — the algorithm reads timing and choice patterns as much as correctness.",
      dimensions: {
        verbal:   "How you process language, analogies, and comprehension.",
        numerical:"Pattern recognition in numbers, mental arithmetic, ratio reasoning.",
        spatial:  "Rotating and folding shapes in your mind — strongly linked to STEM careers.",
        memory:   "Short-term recall and working memory — critical for academic and legal fields.",
        speed:    "How fast you accurately process new information under time pressure.",
        critical: "Logical deduction, inference, and argument analysis.",
      },
    },
    reports: {
      count: 4, price: "KES 40", unlock: "30-day access",
      types: {
        diagnostic: "Your cognitive fingerprint — dimension scores, strengths, growth zones, a plain-language breakdown of how your brain works.",
        career:     "400+ career paths ranked by cognitive-fit score. Includes salary ranges, education paths, and a personal fit rationale for each top match.",
        study:      "A personalised study system — optimal session length, best encoding method (visual/verbal/kinesthetic), spaced-repetition schedule.",
        wellness:   "Cognitive wellness profile — sleep recommendation, peak focus windows, stress-response pattern, recovery strategies.",
      },
    },
    academic: {
      systems: ["CBC (Kenya 2017+)","8-4-4 (Kenya legacy)","IGCSE","IB","AP","A-Level","NSC (South Africa)","French Baccalauréat","American Curriculum"],
      purpose: "OCRA cross-references grades against your cognitive profile to find the gap between what you score and what your brain predicts you should score — that gap reveals untapped potential or a mismatched system.",
    },
    payment: {
      methods: ["M-Pesa","Stripe (card)"],
      price: "KES 40 per document",
      unlock: "30 days from payment",
      dev: "Developer accounts bypass payment entirely.",
      note: "You choose exactly which documents you want. You never pay for what you don't need.",
    },
    accounts: {
      personal:     "Individual learner — full brain test, academic records entry, four reports.",
      family:       "Parent-child link — one parent account connected to a child learner.",
      organization: "Schools, universities, tutoring centres — bulk cognitive mapping for students.",
    },
    signup: {
      steps: "4 stages: your personal info → academic details → email and password → agreement. Password must be 9+ characters with a capital, a number, and a symbol.",
      recovery: "Four recovery questions: mother's name, best friend's name, favourite pet, favourite subject.",
    },
    company: "OCRA is a subsidiary of Artist Life Foundation.",
    developer: "Developer access is granted exclusively — no application. It bypasses payment and unlocks all platform tools.",
    careers: {
      count: "400+",
      examples: ["Software Engineer","Clinical Psychologist","Architect","Data Scientist",
                 "Lawyer","Surgeon","Economist","UX Designer","Pilot","Educator",
                 "Financial Analyst","Research Scientist","Journalist","Product Manager"],
      note: "OCRA doesn't match your grades to job titles — it matches how your brain fires to what each career cognitively demands. That's a fundamentally more accurate kind of guidance.",
    },
  };

  // ═══════════════════════════════════════════════════════════
  // 3. AI ENGINE — DIRECT ANSWERS, NO REDIRECTS
  // ═══════════════════════════════════════════════════════════
  var FIL = {
    think: ["Hmm — ", "Right — ", "Uuuh, interesting — ", "Now — ", "Let me think — "],
    wow:   ["Ah, I see. ", "Fascinating. ", "Yes — ", "Right! ", "Oh, good one. "],
    open:  ["Here's what most people miss: ", "Now, the thing is — ",
            "Here's the real picture: ", "What I find fascinating here is — "],
    warm:  ["And you're in very good hands.", "Trust the process — it's built for you.",
            "I'm with you on this.", "That's exactly the right question to ask."],
  };

  function _p(a) { return a[Math.floor(Math.random() * a.length)]; }

  function _classify(t) {
    t = (t || "").toLowerCase();
    var sc = function (ks) { return ks.reduce(function (s, k) { return s + (t.indexOf(k) >= 0 ? 1 : 0); }, 0); };
    var map = {
      GREETING:      sc(["hello","hi ","hey ","good morning","good evening","howdy","yo ","sup "]),
      IDENTITY:      sc(["who are you","what are you","your name","arten","introduce","tell me about"]),
      CAPABILITIES:  sc(["what can you do","help me","capabilities","what do you know","how do you"]),
      BRAIN_TEST:    sc(["brain test","brain-test","cognitive test","60 question","60-question","sixty","six dimension","assessment","iq test","how does the test"]),
      DIM_VERBAL:    sc(["verbal","reading","language","words","comprehension","analogy"]),
      DIM_NUMERICAL: sc(["numerical","number","math","arithmetic","calculation","ratio"]),
      DIM_SPATIAL:   sc(["spatial","shapes","rotate","fold","3d","visual-spatial"]),
      DIM_MEMORY:    sc(["memory","recall","remember","short-term","working memory"]),
      DIM_SPEED:     sc(["processing speed","how fast","speed","quick","rapid"]),
      DIM_CRITICAL:  sc(["critical thinking","logic","deduct","argument","inference","reason"]),
      CAREER:        sc(["career","job","profession","future","work","path","vocation","industry","what should i be","which career"]),
      CAREER_LIST:   sc(["career list","which careers","what careers","examples of career","career options","top career"]),
      ACADEMIC:      sc(["grade","subject","school","education","academic","record","transcript","marks","gpa","cbc","igcse","ib ","a-level","8-4-4","nsc"]),
      REPORTS:       sc(["report","document","pdf","download","diagnostic","study report","wellness","career report","four report","what report"]),
      REPORT_DIAG:   sc(["diagnostic","cognitive report","brain report","fingerprint"]),
      REPORT_CAREER: sc(["career report","career document"]),
      REPORT_STUDY:  sc(["study report","study strategy","how to study","study plan"]),
      REPORT_WELL:   sc(["wellness","sleep","focus","stress","recovery","peak"]),
      PAYMENT:       sc(["pay","cost","price","kes","money","mpesa","stripe","forty","40","how much","purchase","billing"]),
      SIGNUP:        sc(["sign up","signup","register","create account","how to start","how do i join","password rule","recovery question"]),
      ACCOUNT_TYPE:  sc(["personal account","family account","organization","org account","which account","account type"]),
      ENCOURAGEMENT: sc(["scared","nervous","worried","stress","anxious","can't","hard","difficult","overwhelm","fear","fail","not sure","doubt"]),
      STUDY:         sc(["study","study tips","how to study","memory tip","focus","concentration","revision","learning"]),
      RESULTS:       sc(["result","score","how did i","my result","what did i get","outcome","performance"]),
      COMPANY:       sc(["company","artist life","foundation","who made","who built","who created ocra"]),
      DEVELOPER:     sc(["developer","dev access","developer account","dev mode"]),
      CONTEXT:       sc(["where am i","what screen","what page","current screen","which step"]),
    };
    var best = "UNKNOWN", bestScore = 0;
    Object.keys(map).forEach(function (k) {
      if (map[k] > bestScore) { bestScore = map[k]; best = k; }
    });
    return bestScore > 0 ? best : "UNKNOWN";
  }

  function _respond(intent, raw) {
    var c  = _ctx();
    var f  = Math.random() > 0.52 ? _p(FIL.think) : "";
    var o  = Math.random() > 0.58 ? _p(FIL.open)  : "";
    var hi = c.firstName ? c.firstName : "";

    var R = {
      GREETING: function () {
        var lines = [
          "Hello" + (hi ? ", " + hi : "") + "! I'm Arten — your cognitive companion inside OCRA. I live at the intersection of intelligence and warmth, and I'm here exclusively for you. What's on your mind?",
          "Hey" + (hi ? " " + hi : "") + ". Arten here. I know OCRA inside out — the brain test, the reports, career paths, academic records, all of it. Ask me anything and I'll give you a straight answer.",
        ];
        return { text: _p(lines), emotion: "excited" };
      },
      IDENTITY: function () {
        return { text: f + "I'm Arten — a cognitive AI companion built into OCRA. I carry deep knowledge of OCRA's architecture, cognitive science, career mapping, and academic intelligence. I think before I speak, and I give you direct answers. No redirecting. No 'tell me more.' Just clarity. What would you like to know?", emotion: "curious" };
      },
      CAPABILITIES: function () {
        return { text: o + "I can explain every part of OCRA — the brain test, all six cognitive dimensions, your reports, how payment works, academic records, career paths. I can also listen to your voice and respond. I'm your complete guide to everything OCRA. What do you need right now?", emotion: "encouraging" };
      },
      BRAIN_TEST: function () {
        var inTest = c.phase === "brainTest";
        return { text: f + (inTest ? "You're in the brain test right now. " : "") + o + "The OCRA brain test is " + KB.brainTest.q + " questions across six cognitive dimensions: " + KB.brainTest.dims.join(", ") + ". Scores are " + KB.brainTest.scoring + ". It takes about " + KB.brainTest.duration + ". Approach: " + KB.brainTest.approach, emotion: inTest ? "encouraging" : "thinking" };
      },
      DIM_VERBAL:    function () { return { text: f + "Verbal Reasoning in the OCRA brain test: " + KB.brainTest.dimensions.verbal + " It shows up in careers like law, journalism, teaching, and writing — anywhere language precision matters.", emotion: "thinking" }; },
      DIM_NUMERICAL: function () { return { text: f + "Numerical Reasoning: " + KB.brainTest.dimensions.numerical + " High scores here align strongly with finance, engineering, data science, and economics careers.", emotion: "thinking" }; },
      DIM_SPATIAL:   function () { return { text: f + "Spatial Intelligence: " + KB.brainTest.dimensions.spatial + " Architecture, surgery, game design, mechanical engineering, and aviation all demand high spatial scores.", emotion: "thinking" }; },
      DIM_MEMORY:    function () { return { text: f + "Memory & Recall: " + KB.brainTest.dimensions.memory + " Medicine, law, and research fields place heavy demands here.", emotion: "thinking" }; },
      DIM_SPEED:     function () { return { text: f + "Processing Speed: " + KB.brainTest.dimensions.speed + " Essential for emergency medicine, trading floors, air traffic control, and any high-pressure decision environment.", emotion: "thinking" }; },
      DIM_CRITICAL:  function () { return { text: f + "Critical Thinking: " + KB.brainTest.dimensions.critical + " The dimension most closely linked to strategic leadership, research, and consulting.", emotion: "thinking" }; },
      CAREER: function () {
        return { text: o + KB.careers.note + ". OCRA maps " + KB.careers.count + " career paths from your cognitive fingerprint — not just what you know, but how your brain is wired to think. Your Career Report ranks them by fit score with salary ranges and education paths for each.", emotion: "excited" };
      },
      CAREER_LIST: function () {
        return { text: f + "Some of the " + KB.careers.count + " career paths OCRA maps: " + KB.careers.examples.join(", ") + " — and hundreds more. Each one is ranked against your personal cognitive profile. Your top matches get a full fit rationale in the Career Report.", emotion: "excited" };
      },
      ACADEMIC: function () {
        return { text: f + o + "OCRA supports " + KB.academic.systems.join(", ") + ". " + KB.academic.purpose + ". You enter your grades by subject, and OCRA overlays your cognitive scores to generate a complete academic-cognitive profile.", emotion: "curious" };
      },
      REPORTS: function () {
        var list = Object.keys(KB.reports.types).map(function (k) {
          return k.charAt(0).toUpperCase() + k.slice(1) + ": " + KB.reports.types[k];
        }).join(". ");
        return { text: o + "OCRA generates " + KB.reports.count + " documents: " + list + ". Each is " + KB.reports.price + " with " + KB.reports.unlock + " access. Generated from your unique cognitive-academic fingerprint.", emotion: "calm" };
      },
      REPORT_DIAG:   function () { return { text: f + "The Diagnostic Report is your cognitive fingerprint — dimension-by-dimension scores, percentiles, key strengths, growth zones, and a plain-English breakdown of how your brain actually works. " + KB.reports.price + ", " + KB.reports.unlock + " access.", emotion: "calm" }; },
      REPORT_CAREER: function () { return { text: f + "The Career Report maps " + KB.careers.count + " career paths against your cognitive profile, ranked by fit. Each top match includes salary data, required education, and a personal fit rationale. " + KB.reports.price + ", " + KB.reports.unlock + " access.", emotion: "excited" }; },
      REPORT_STUDY:  function () { return { text: f + "The Study Report builds a personalised study system from your cognitive profile — optimal session length, your best encoding method (visual, verbal, or kinesthetic), and a spaced-repetition schedule tailored to your memory architecture. " + KB.reports.price + ", " + KB.reports.unlock + " access.", emotion: "encouraging" }; },
      REPORT_WELL:   function () { return { text: f + "The Wellness Report maps your cognitive wellness profile — sleep requirements, peak focus windows, stress-response pattern, and recovery strategies specific to your brain type. " + KB.reports.price + ", " + KB.reports.unlock + " access.", emotion: "calm" }; },
      PAYMENT: function () {
        return { text: f + KB.payment.price + " per document. Methods: " + KB.payment.methods.join(" and ") + ". " + KB.payment.unlock + " from payment. " + KB.payment.note + " " + KB.payment.dev, emotion: "calm" };
      },
      SIGNUP: function () {
        return { text: f + o + "Signing up: " + KB.signup.steps + ". Recovery questions: " + KB.signup.recovery + ". Once done you land directly on your dashboard.", emotion: "encouraging" };
      },
      ACCOUNT_TYPE: function () {
        return { text: f + "Three account types: Personal — " + KB.accounts.personal + ". Family — " + KB.accounts.family + ". Organization — " + KB.accounts.organization + ". Each unlocks the full OCRA platform.", emotion: "curious" };
      },
      ENCOURAGEMENT: function () {
        return { text: _p(FIL.warm) + " " + f + "The brain test is not a judgment — it's a map. OCRA is designed precisely for people who feel like they haven't fully reached their potential yet. " + o + "your cognitive profile is already there, waiting to be revealed. It won't take long, and what you'll learn about yourself is genuinely worth it.", emotion: "encouraging" };
      },
      STUDY: function () {
        return { text: f + o + "The Study Report gives you a personalised system — not generic tips. It looks at your processing speed, memory architecture, and verbal-spatial balance, then designs how and when to study around how your brain encodes information. Precision beats effort every time.", emotion: "excited" };
      },
      RESULTS: function () {
        if (c.testDone) {
          return { text: "Your brain test is complete. " + o + "your cognitive profile has been mapped across all six dimensions. The reports translate that map into career paths, study strategies, and wellness insights. Go to the reports section to unlock them for " + KB.reports.price + " each.", emotion: "excited" };
        }
        return { text: f + "Your results are generated the moment you complete the brain test. Scores are " + KB.brainTest.scoring + ". All four reports generate instantly after. You're not far from some very useful clarity.", emotion: "calm" };
      },
      COMPANY: function () {
        return { text: f + KB.company + " OCRA was built to give every learner — regardless of their background — access to the kind of cognitive and career intelligence that was previously only available to the privileged few.", emotion: "calm" };
      },
      DEVELOPER: function () {
        return { text: f + KB.developer + " Developer accounts have full access to all platform tools, bypass payment, and can access the developer console.", emotion: "calm" };
      },
      CONTEXT: function () {
        var map = { intro:"the landing screen", choose:"the pathway selection", auth:"sign-in", brainTestStart:"brain test intro", brainTest:"the brain test", intake:"intake form", academicEntry:"academic records", payment:"payment", dash:"your dashboard", reportView:"reports" };
        return { text: "Right now you're on " + (map[c.phase] || c.phase || "an OCRA screen") + ". I can guide you through whatever comes next.", emotion: "calm" };
      },
      UNKNOWN: function () {
        return { text: f + o + "OCRA is a cognitive and career intelligence platform. It maps how your brain works through a 60-question test across six dimensions, cross-references that against your academic records, and generates four tailored reports — diagnostic, career (" + KB.careers.count + "+ paths), study strategy, and wellness — each for " + KB.reports.price + " with 30-day access. That's the core of it. Ask me about any part and I'll go deep.", emotion: "calm" };
      },
    };

    return (R[intent] || R.UNKNOWN)();
  }

  // ═══════════════════════════════════════════════════════════
  // 4. CANVAS 3D SPHERE
  // ═══════════════════════════════════════════════════════════
  var _sc, _sCtx;
  var _fromEM = "calm", _toEM = "calm", _elt = 0;
  var _startT = Date.now();

  function _lerpC(a, b, t) {
    function h(hex) { var n = parseInt(hex.replace("#",""), 16); return [(n>>16)&255,(n>>8)&255,n&255]; }
    var A = h(a), B = h(b);
    return "rgb("+ Math.round(A[0]+(B[0]-A[0])*t) +","+ Math.round(A[1]+(B[1]-A[1])*t) +","+ Math.round(A[2]+(B[2]-A[2])*t) +")";
  }

  function _drawSphere(t) {
    if (!_sCtx || !_sc) return;
    var W = _sc.width, H = _sc.height;
    var cx = W/2, cy = H/2, r = W*0.41;
    _sCtx.clearRect(0, 0, W, H);

    if (_elt < 1) _elt = Math.min(1, _elt + 0.03);
    var eA = EM[_fromEM] || EM.calm, eB = EM[_toEM] || EM.calm, lt = _elt;
    var rot = eA.rot + (eB.rot - eA.rot) * lt;

    var breath = 1 + Math.sin(t * 1.4) * 0.017;

    // Orbiting key-light position
    var lx = cx + Math.cos(t * rot) * r * 0.44;
    var ly = cy - r * 0.30 + Math.sin(t * rot * 0.65) * r * 0.10;

    // Outer ambient halo
    var halo = _sCtx.createRadialGradient(cx, cy, r*0.88, cx, cy, r*1.55);
    halo.addColorStop(0, eB.glow.replace(/[\d.]+\)/, "0.20)"));
    halo.addColorStop(0.6, eB.glow.replace(/[\d.]+\)/, "0.07)"));
    halo.addColorStop(1, "rgba(0,0,0,0)");
    _sCtx.fillStyle = halo; _sCtx.fillRect(0, 0, W, H);

    // Sphere body
    _sCtx.save();
    _sCtx.scale(breath, breath);
    _sCtx.translate(cx*(1-breath), cy*(1-breath));

    var base = _lerpC(eA.base, eB.base, lt);
    var mid  = _lerpC(eA.mid,  eB.mid,  lt);
    var lit  = _lerpC(eA.lit,  eB.lit,  lt);
    var sg = _sCtx.createRadialGradient(lx/breath, ly/breath, 0, cx/breath, cy/breath, r);
    sg.addColorStop(0, lit); sg.addColorStop(0.32, mid);
    sg.addColorStop(0.70, base); sg.addColorStop(1, "#020114");
    _sCtx.beginPath(); _sCtx.arc(cx/breath, cy/breath, r, 0, Math.PI*2);
    _sCtx.fillStyle = sg; _sCtx.fill();

    _sCtx.save();
    _sCtx.beginPath(); _sCtx.arc(cx/breath, cy/breath, r, 0, Math.PI*2); _sCtx.clip();

    // Specular
    var sx = lx/breath - r*0.07, sy = ly/breath - r*0.05;
    var spec = _sCtx.createRadialGradient(sx, sy, 0, sx, sy, r*0.40);
    spec.addColorStop(0, "rgba(185,165,255,0.40)"); spec.addColorStop(0.38, "rgba(90,65,220,0.12)"); spec.addColorStop(1, "rgba(0,0,0,0)");
    _sCtx.fillStyle = spec; _sCtx.fillRect(-W, -H, W*3, H*3);

    // Rim glow (makes it feel spherical)
    var rim = _sCtx.createRadialGradient(cx/breath, cy/breath, r*0.68, cx/breath, cy/breath, r);
    rim.addColorStop(0, "rgba(0,0,0,0)"); rim.addColorStop(0.84, "rgba(0,0,0,0)");
    rim.addColorStop(1, eB.rim);
    _sCtx.fillStyle = rim; _sCtx.fillRect(-W, -H, W*3, H*3);
    _sCtx.restore();
    _sCtx.restore();

    // Eyes
    _sCtx.save();
    _sCtx.beginPath(); _sCtx.arc(cx, cy, r*breath, 0, Math.PI*2); _sCtx.clip();

    var eyeC    = eB.eyeC;
    var eyeY    = cy - r*0.055;
    var eyeW    = r*0.265;
    var eyeBaseH = r*0.108;
    var blink   = (t % 4.9) > 4.78;
    var eyeH    = blink ? eyeBaseH*0.04 : eyeBaseH;

    if (A._speaking)                    eyeH = eyeBaseH*(0.52 + Math.abs(Math.sin(t*9.8))*0.72);
    else if (A._listening)              eyeH = eyeBaseH*(0.7  + Math.sin(t*6.5)*0.28);
    else if (_toEM === "thinking")      eyeH = eyeBaseH*(0.25 + Math.sin(t*2.1)*0.07);
    else if (_toEM === "excited")       eyeH = eyeBaseH*(0.92 + Math.sin(t*3.8)*0.10);

    var eyeAlpha = A._speaking ? (0.72 + Math.sin(t*9.8)*0.28) : (A._listening ? 0.90 + Math.sin(t*5)*0.10 : 0.84 + Math.sin(t*1.9)*0.09);
    var eyeBlur  = 7 + (A._speaking ? Math.abs(Math.sin(t*9.8))*9 : A._listening ? 6 : 0);

    function _rr(x, y, w, h) {
      var rd = h*0.5;
      _sCtx.beginPath();
      _sCtx.moveTo(x-w/2+rd, y-h/2); _sCtx.lineTo(x+w/2-rd, y-h/2);
      _sCtx.arcTo(x+w/2, y-h/2, x+w/2, y-h/2+rd, rd);
      _sCtx.lineTo(x+w/2, y+h/2-rd); _sCtx.arcTo(x+w/2, y+h/2, x+w/2-rd, y+h/2, rd);
      _sCtx.lineTo(x-w/2+rd, y+h/2); _sCtx.arcTo(x-w/2, y+h/2, x-w/2, y+h/2-rd, rd);
      _sCtx.lineTo(x-w/2, y-h/2+rd); _sCtx.arcTo(x-w/2, y-h/2, x-w/2+rd, y-h/2, rd);
      _sCtx.closePath();
    }

    _sCtx.shadowColor = eyeC; _sCtx.shadowBlur = eyeBlur;
    _sCtx.fillStyle = eyeC; _sCtx.globalAlpha = eyeAlpha;
    _rr(cx - r*0.315, eyeY, eyeW, eyeH); _sCtx.fill();
    _rr(cx + r*0.315, eyeY, eyeW, eyeH); _sCtx.fill();

    // Eye inner highlight
    _sCtx.globalAlpha = eyeAlpha*0.32; _sCtx.shadowBlur = 0; _sCtx.fillStyle = "#fff";
    var hlW = eyeW*0.22, hlH = eyeH*0.30;
    _rr(cx-r*0.315 - eyeW*0.11, eyeY - eyeH*0.17, hlW, hlH); _sCtx.fill();
    _rr(cx+r*0.315 - eyeW*0.11, eyeY - eyeH*0.17, hlW, hlH); _sCtx.fill();

    _sCtx.globalAlpha = 1; _sCtx.shadowBlur = 0;
    _sCtx.restore();
  }

  // ═══════════════════════════════════════════════════════════
  // 5. WAVEFORM CANVAS
  // ═══════════════════════════════════════════════════════════
  var _wc, _wCtx;

  function _drawWave(t) {
    if (!_wCtx || !_wc) return;
    var W = _wc.width, H = _wc.height, cy = H/2;
    _wCtx.clearRect(0, 0, W, H);

    var mode = A._speaking ? "speaking" : A._listening ? "listening" : "idle";

    var color = mode === "listening" ? "rgba(0,255,180," : "rgba(0,200,255,";
    var grad = _wCtx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, color+"0)");
    grad.addColorStop(0.18, color + (mode === "idle" ? "0.18)" : "0.85)"));
    grad.addColorStop(0.82, color + (mode === "idle" ? "0.18)" : "0.85)"));
    grad.addColorStop(1, color+"0)");

    _wCtx.beginPath();
    for (var x = 0; x <= W; x++) {
      var nx  = x / W;
      var env = Math.sin(nx * Math.PI); // fade at edges
      var y   = cy;
      if (mode === "speaking") {
        y += Math.sin(nx*9  + t*5.8)  * 5.5 * env;
        y += Math.sin(nx*16 + t*9.5)  * 2.5 * env;
        y += Math.sin(nx*25 + t*14.5) * 1.4 * env;
      } else if (mode === "listening") {
        y += Math.sin(nx*11 + t*7.2) * 5.0 * env;
        y += Math.sin(nx*19 + t*13)  * 2.0 * env;
        y += (Math.random() - 0.5)   * 1.8 * env;
      } else {
        y += Math.sin(nx*4 + t*0.8) * 0.8 * env; // barely visible idle pulse
      }
      x === 0 ? _wCtx.moveTo(x, y) : _wCtx.lineTo(x, y);
    }
    _wCtx.strokeStyle = grad;
    _wCtx.lineWidth   = mode === "idle" ? 0.9 : 1.7;
    _wCtx.stroke();
  }

  // ═══════════════════════════════════════════════════════════
  // 6. RENDER LOOP
  // ═══════════════════════════════════════════════════════════
  function _loop() {
    var t = (Date.now() - _startT) / 1000;
    _drawSphere(t);
    _drawWave(t);
    requestAnimationFrame(_loop);
  }

  A.setEmotion = function (key) {
    if (!EM[key] || key === _toEM) return;
    _fromEM = _toEM; _toEM = key; _elt = 0;
    A._emotion = key;
  };

  // ═══════════════════════════════════════════════════════════
  // 7. VOICE IN — SPEECH RECOGNITION
  // ═══════════════════════════════════════════════════════════
  A._listening = false;
  A._speaking  = false;
  var _rec     = null;

  function _initRec() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    var r = new SR();
    r.continuous      = false;
    r.interimResults  = true;
    r.lang            = "en-US";
    r.maxAlternatives = 1;

    r.onstart = function () {
      A._listening = true;
      A.setEmotion("listening");
      _setStatus("Listening…");
      var badge = document.getElementById("arten-badge");
      if (badge) badge.style.background = "#ff4444";
    };

    r.onresult = function (e) {
      var transcript = "", isFinal = false;
      for (var i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
        if (e.results[i].isFinal) isFinal = true;
      }
      var inp = document.getElementById("arten-input");
      if (inp && !isFinal) inp.value = transcript;
      if (isFinal) {
        if (inp) inp.value = "";
        A._listening = false;
        _resetBadge();
        if (transcript.trim()) { A._addMessage("user", transcript); A.reply(transcript); }
      }
    };

    r.onend = function () {
      A._listening = false;
      _resetBadge();
      _setStatus("ready");
    };

    r.onerror = function () {
      A._listening = false;
      _resetBadge();
      _setStatus("ready");
    };

    return r;
  }

  function _resetBadge() {
    var badge = document.getElementById("arten-badge");
    if (badge) badge.style.background = "#00ddff";
  }

  A.startListening = function () {
    if (!_rec) _rec = _initRec();
    if (!_rec) { _setStatus("Voice input unavailable in this browser."); return; }
    if (A._listening) { try { _rec.stop(); } catch (e) {} return; }
    try { _rec.start(); } catch (e) { _setStatus("Mic unavailable."); }
  };

  // ═══════════════════════════════════════════════════════════
  // 8. VOICE OUT — SPEAK WITH EMOTION
  // ═══════════════════════════════════════════════════════════
  A.speak = function (text, emotion) {
    A.setEmotion(emotion || "calm");
    A._speaking = true;
    if (O.voice && !O.voice.isMuted()) {
      O.voice.say(text, "arten", { rate: 0.87, pitch: 1.02 });
      // Estimate speaking duration and release speaking state
      setTimeout(function () { A._speaking = false; if (A._emotion !== "listening") A.setEmotion("calm"); },
        text.split(/\s+/).length * 175 + 800);
    } else {
      setTimeout(function () { A._speaking = false; }, 200);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 9. CHAT UI
  // ═══════════════════════════════════════════════════════════
  A._history = [];
  A._open    = false;
  A._mounted = false;

  function _esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function _setStatus(msg) {
    var el = document.getElementById("arten-status");
    if (el) el.textContent = "· " + msg;
  }

  A.renderWidget = function () {
    return (
      '<div id="arten-wrap" style="position:fixed;bottom:24px;right:20px;z-index:8900;' +
        'display:flex;flex-direction:column;align-items:center;gap:0;pointer-events:none">' +

      /* ── Chat panel ─────────────────────────────────────── */
      '<div id="arten-chat" style="width:336px;margin-bottom:10px;display:none;flex-direction:column;pointer-events:all;' +
        'background:rgba(5,3,18,.96);backdrop-filter:blur(22px) saturate(1.4);' +
        'border:1px solid rgba(80,50,190,.32);border-radius:22px;overflow:hidden;' +
        'box-shadow:0 20px 70px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.04),0 0 60px rgba(45,15,180,.12);' +
        'transform:translateY(10px) scale(.97);opacity:0;' +
        'transition:transform .30s cubic-bezier(.34,1.56,.64,1),opacity .24s ease,scale .30s cubic-bezier(.34,1.56,.64,1)">' +

        /* Header */
        '<div style="padding:12px 16px;background:rgba(20,10,55,.75);border-bottom:1px solid rgba(80,50,190,.2);' +
             'display:flex;align-items:center;gap:9px">' +
          '<div style="width:7px;height:7px;border-radius:50%;background:#00ddff;' +
               'box-shadow:0 0 8px #00ddff,0 0 18px rgba(0,200,255,.3);flex-shrink:0;' +
               'animation:artenLivePulse 2s infinite"></div>' +
          '<span style="color:#c4d8ff;font-size:12px;font-weight:800;letter-spacing:.08em">ARTEN</span>' +
          '<span id="arten-status" style="color:rgba(130,148,200,.5);font-size:11px;margin-left:1px">· ready</span>' +
          '<button id="arten-close" style="margin-left:auto;background:rgba(255,255,255,.06);' +
            'border:1px solid rgba(255,255,255,.08);border-radius:8px;color:rgba(140,155,200,.6);' +
            'font-size:14px;cursor:pointer;padding:4px 9px;transition:all .15s;line-height:1" ' +
            'onmouseover="this.style.background=\'rgba(255,255,255,.12)\';this.style.color=\'#c4d8ff\'" ' +
            'onmouseout="this.style.background=\'rgba(255,255,255,.06)\';this.style.color=\'rgba(140,155,200,.6)\'">✕</button>' +
        '</div>' +

        /* Messages */
        '<div id="arten-msgs" style="flex:1;max-height:280px;min-height:80px;overflow-y:auto;' +
          'padding:14px 13px;display:flex;flex-direction:column;gap:11px;' +
          'scrollbar-width:thin;scrollbar-color:rgba(80,50,190,.28) transparent"></div>' +

        /* Thinking dots */
        '<div id="arten-thinking" style="padding:0 13px 6px;display:none">' +
          '<div style="display:inline-flex;gap:5px;align-items:center;padding:8px 13px;' +
            'background:rgba(28,12,70,.6);border-radius:14px;border-top-left-radius:4px">' +
            '<span style="width:5px;height:5px;border-radius:50%;background:#00ccff;animation:artenDot 1.2s 0s infinite ease-in-out"></span>' +
            '<span style="width:5px;height:5px;border-radius:50%;background:#00ccff;animation:artenDot 1.2s .2s infinite ease-in-out"></span>' +
            '<span style="width:5px;height:5px;border-radius:50%;background:#00ccff;animation:artenDot 1.2s .4s infinite ease-in-out"></span>' +
          '</div>' +
        '</div>' +

        /* Input row */
        '<div style="padding:10px 12px 12px;border-top:1px solid rgba(80,50,190,.14);display:flex;gap:7px;align-items:center">' +
          '<button id="arten-mic" title="Voice input" ' +
            'style="flex-shrink:0;width:36px;height:36px;border-radius:50%;border:1px solid rgba(80,50,190,.25);' +
            'background:rgba(255,255,255,.05);color:rgba(140,155,220,.7);font-size:14px;cursor:pointer;' +
            'transition:all .18s;display:flex;align-items:center;justify-content:center" ' +
            'onmouseover="this.style.background=\'rgba(0,180,255,.12)\';this.style.borderColor=\'rgba(0,200,255,.5)\'" ' +
            'onmouseout="this.style.background=\'rgba(255,255,255,.05)\';this.style.borderColor=\'rgba(80,50,190,.25)\'">🎤</button>' +
          '<input id="arten-input" type="text" placeholder="Ask anything about OCRA…" autocomplete="off" ' +
            'style="flex:1;background:rgba(255,255,255,.055);border:1px solid rgba(80,50,190,.22);border-radius:12px;' +
            'padding:9px 13px;color:#e4eeff;font-size:13px;outline:none;font-family:inherit;' +
            'transition:border-color .18s,background .18s" ' +
            'onfocus="this.style.borderColor=\'rgba(0,200,255,.45)\';this.style.background=\'rgba(0,200,255,.06)\'" ' +
            'onblur="this.style.borderColor=\'rgba(80,50,190,.22)\';this.style.background=\'rgba(255,255,255,.055)\'" />' +
          '<button id="arten-send" ' +
            'style="flex-shrink:0;width:36px;height:36px;border-radius:50%;border:none;' +
            'background:linear-gradient(135deg,#3311cc,#0066cc);color:#fff;font-size:15px;font-weight:700;' +
            'cursor:pointer;display:flex;align-items:center;justify-content:center;' +
            'box-shadow:0 2px 12px rgba(50,20,200,.45);transition:transform .12s,box-shadow .12s" ' +
            'onmouseover="this.style.transform=\'scale(1.08)\';this.style.boxShadow=\'0 4px 18px rgba(50,20,200,.65)\'" ' +
            'onmouseout="this.style.transform=\'scale(1)\';this.style.boxShadow=\'0 2px 12px rgba(50,20,200,.45)\'">↑</button>' +
        '</div>' +
      '</div>' +

      /* ── Sphere orb ─────────────────────────────────────── */
      '<div id="arten-orb" style="pointer-events:all;display:flex;flex-direction:column;align-items:center;gap:0;' +
        'cursor:pointer;filter:drop-shadow(0 5px 18px rgba(35,15,175,.5));' +
        'transition:filter .22s;' +
        'transform-origin:center bottom" ' +
        'onmouseover="this.style.filter=\'drop-shadow(0 8px 26px rgba(35,15,175,.72))\'" ' +
        'onmouseout="this.style.filter=\'drop-shadow(0 5px 18px rgba(35,15,175,.5))\'"> ' +
        '<canvas id="arten-canvas" width="88" height="88" style="display:block;border-radius:50%;' +
          'box-shadow:0 0 0 1px rgba(255,255,255,.05)"></canvas>' +
        '<canvas id="arten-wave" width="88" height="22" style="display:block;margin-top:-2px"></canvas>' +
        '<div style="font-size:9px;font-weight:800;letter-spacing:.22em;color:rgba(140,165,220,.55);' +
          'margin-top:3px;user-select:none">ARTEN</div>' +
        '<div id="arten-badge" style="position:absolute;bottom:54px;right:-2px;width:10px;height:10px;' +
          'border-radius:50%;background:#00ddff;box-shadow:0 0 8px #00ddff;' +
          'border:2px solid #05031a;transition:background .3s;animation:artenBadgePulse 2.4s infinite"></div>' +
      '</div>' +

      '</div>' +

      '<style>' +
        '@keyframes artenDot{0%,80%,100%{transform:scale(.65);opacity:.45}40%{transform:scale(1);opacity:1}}' +
        '@keyframes artenLivePulse{0%,100%{opacity:1}50%{opacity:.4}}' +
        '@keyframes artenBadgePulse{0%,100%{box-shadow:0 0 8px #00ddff}50%{box-shadow:0 0 16px #00ddff,0 0 28px rgba(0,200,255,.35)}}' +
      '</style>'
    );
  };

  A._addMessage = function (role, text) {
    A._history.push({ role: role, text: text, ts: Date.now() });
    var msgs = document.getElementById("arten-msgs");
    if (!msgs) return;
    var isA = role === "arten";
    var row = document.createElement("div");
    row.style.cssText = "display:flex;gap:8px;align-items:flex-start;" + (isA ? "" : "flex-direction:row-reverse");

    var ts = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    row.innerHTML =
      '<div style="width:26px;height:26px;border-radius:50%;flex-shrink:0;margin-top:1px;' +
        'display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;' +
        (isA ? 'background:linear-gradient(135deg,#1a0b44,#3311cc);color:#99b8e8'
             : 'background:rgba(255,255,255,.09);color:rgba(170,185,220,.7)') + '">' + (isA ? "A" : "U") + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:3px;' + (isA ? "" : "align-items:flex-end") + '">' +
        '<div style="background:' + (isA ? 'rgba(28,12,72,.68)' : 'rgba(255,255,255,.07)') + ';' +
          'border:1px solid ' + (isA ? 'rgba(80,50,190,.22)' : 'rgba(255,255,255,.09)') + ';' +
          'border-radius:' + (isA ? '13px 13px 13px 3px' : '13px 13px 3px 13px') + ';' +
          'padding:9px 12px;max-width:228px;font-size:13px;line-height:1.58;color:#d6e8ff;word-break:break-word">' +
          _esc(text) + '</div>' +
        '<span style="font-size:10px;color:rgba(100,120,170,.35);padding:0 4px">' + ts + '</span>' +
      '</div>';

    msgs.appendChild(row);
    setTimeout(function () { msgs.scrollTop = msgs.scrollHeight; }, 30);
  };

  A.greet = function () {
    var name = _ctx().firstName;
    var text = name
      ? "Hello, " + name + ". I'm Arten — your cognitive companion inside OCRA. I know everything about this platform and I'm here to give you straight, direct answers. What would you like to know?"
      : "Hello. I'm Arten — the cognitive intelligence layer of OCRA. I know this platform inside out. Ask me anything — I give direct answers, no redirects. What's on your mind?";
    A._addMessage("arten", text);
    A.speak(text, "excited");
  };

  A._setThinking = function (on) {
    var el = document.getElementById("arten-thinking");
    if (el) el.style.display = on ? "block" : "none";
  };

  A.reply = function (userText) {
    A.setEmotion("thinking");
    A._setThinking(true);
    _setStatus("thinking…");
    var intent = _classify(userText);
    setTimeout(function () {
      A._setThinking(false);
      var res = _respond(intent, userText);
      A._addMessage("arten", res.text);
      _setStatus("speaking…");
      A.speak(res.text, res.emotion);
      setTimeout(function () { _setStatus("ready"); }, res.text.split(/\s+/).length * 175 + 1200);
    }, 550 + Math.random() * 480);
  };

  A.toggle = function () {
    A._open = !A._open;
    var chatEl = document.getElementById("arten-chat");
    if (!chatEl) return;
    if (A._open) {
      chatEl.style.display = "flex";
      chatEl.style.flexDirection = "column";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          chatEl.style.transform = "translateY(0) scale(1)";
          chatEl.style.opacity   = "1";
        });
      });
      if (A._history.length === 0) setTimeout(A.greet, 350);
    } else {
      chatEl.style.transform = "translateY(10px) scale(.97)";
      chatEl.style.opacity   = "0";
      setTimeout(function () { chatEl.style.display = "none"; }, 290);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 10. PHASE HOOK — sphere reacts to every screen change
  // ═══════════════════════════════════════════════════════════
  A.onPhase = function (phase) {
    var map = {
      intro:"calm", choose:"curious", account:"curious",
      auth:"encouraging", devLogin:"calm",
      brainTestStart:"excited", brainTest:"excited",
      intake:"calm", academicEntry:"calm",
      payment:"calm", dash:"calm", reportView:"excited",
    };
    A.setEmotion(map[phase] || "calm");
  };

  // ═══════════════════════════════════════════════════════════
  // 11. MOUNT
  // ═══════════════════════════════════════════════════════════
  A.mount = function () {
    if (A._mounted || !document.body) return;
    A._mounted = true;

    var el = document.createElement("div");
    el.innerHTML = A.renderWidget();
    document.body.appendChild(el.firstChild);

    // Sphere canvas
    _sc = document.getElementById("arten-canvas");
    if (_sc) { try { _sCtx = _sc.getContext("2d"); } catch (e) {} }
    // Wave canvas
    _wc = document.getElementById("arten-wave");
    if (_wc) { try { _wCtx = _wc.getContext("2d"); } catch (e) {} }

    if (_sCtx) _loop();

    // Orb click → toggle
    var orb = document.getElementById("arten-orb");
    if (orb) orb.addEventListener("click", A.toggle);

    // Close
    var closeBtn = document.getElementById("arten-close");
    if (closeBtn) closeBtn.addEventListener("click", function (e) { e.stopPropagation(); A.toggle(); });

    // Mic
    var micBtn = document.getElementById("arten-mic");
    if (micBtn) micBtn.addEventListener("click", function (e) { e.stopPropagation(); A.startListening(); });

    // Send
    var input = document.getElementById("arten-input");
    var sendBtn = document.getElementById("arten-send");
    function _send() {
      if (!input || !input.value.trim()) return;
      var text = input.value.trim(); input.value = "";
      A._addMessage("user", text);
      A.reply(text);
    }
    if (sendBtn) sendBtn.addEventListener("click", function (e) { e.stopPropagation(); _send(); });
    if (input)   input.addEventListener("keydown", function (e) { if (e.key === "Enter") _send(); });
  };

  // Mount immediately (deferred scripts run post-parse, body is ready)
  if (document.body) {
    A.mount();
  } else {
    document.addEventListener("DOMContentLoaded", A.mount);
  }

  console.log("✅ Arten v2 Loaded — 3D sphere · voice in/out · waveform · direct-answer AI");

})(window.OCRA);
