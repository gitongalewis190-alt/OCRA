/* ============================================================
   DOMAIN_29 — ARTEN: 3D COGNITIVE AI COMPANION
   Pure Canvas 2D with layered Phong-style gradients, specular
   highlights, rim lighting, and dynamic eye animation.
   Award-winning conversational intelligence for OCRA.
   ============================================================ */
(function (O) {
  "use strict";

  // Graceful no-op in non-browser / smoke-test environments
  if (typeof requestAnimationFrame === "undefined" || typeof document === "undefined") {
    O.arten = {};
    return;
  }

  var A = (O.arten = {});

  // ═══════════════════════════════════════════════════════════
  // 1. EMOTIONAL STATE MACHINE
  // ═══════════════════════════════════════════════════════════
  var EMOTIONS = {
    calm: {
      base: "#12093a", mid: "#2a1260", lit: "#4a20a0",
      rim: "rgba(60, 30, 200, 0.55)", eyeC: "#00ccff",
      glow: "rgba(40, 20, 180, 0.35)", rot: 0.22, pulse: 0.04,
    },
    thinking: {
      base: "#0a0b38", mid: "#161e55", lit: "#283a9a",
      rim: "rgba(30, 50, 200, 0.45)", eyeC: "#0077cc",
      glow: "rgba(20, 40, 180, 0.28)", rot: 0.09, pulse: 0.01,
    },
    excited: {
      base: "#250d4f", mid: "#4e1fa8", lit: "#7733dd",
      rim: "rgba(90, 30, 220, 0.65)", eyeC: "#44ffee",
      glow: "rgba(80, 20, 220, 0.45)", rot: 0.55, pulse: 0.22,
    },
    encouraging: {
      base: "#0c1e52", mid: "#1e3d9a", lit: "#3360cc",
      rim: "rgba(40, 80, 220, 0.55)", eyeC: "#22ddff",
      glow: "rgba(30, 70, 200, 0.38)", rot: 0.32, pulse: 0.08,
    },
    curious: {
      base: "#280a48", mid: "#4a1888", lit: "#7722bb",
      rim: "rgba(150, 40, 220, 0.55)", eyeC: "#dd88ff",
      glow: "rgba(120, 30, 200, 0.40)", rot: 0.40, pulse: 0.10,
    },
  };

  A._emotion  = "calm";
  A._speaking = false;
  A._open     = false;
  A._history  = [];
  A._mounted  = false;

  // ═══════════════════════════════════════════════════════════
  // 2. KNOWLEDGE BASE
  // ═══════════════════════════════════════════════════════════
  var KB = {
    brainTest: {
      dimensions: ["Verbal Reasoning","Numerical Reasoning","Spatial Intelligence",
                   "Memory & Recall","Processing Speed","Critical Thinking"],
      tip: "Find a quiet space. There are no wrong approaches — your natural thinking pattern is the signal.",
      scoring: "z-normalised across six dimensions into a Cognitive Range Score",
      duration: "25–35 minutes",
    },
    reports: {
      count: 4,
      types: {
        diagnostic: "dimension-by-dimension cognitive deep-dive",
        career:     "400+ career paths ranked by your actual cognitive wiring",
        study:      "study strategies matched to how your brain encodes information",
        wellness:   "cognitive wellness — sleep cycles, focus windows, recovery patterns",
      },
      price: "KES 40",
      unlock: "30-day access per document",
    },
    careers: { count: "400+",
      note: "OCRA maps how you think, not just what you know — matching the cognitive demands of each career to your exact profile" },
    academic: {
      systems: ["CBC","8-4-4","IGCSE","IB","AP","A-Level","NSC","French Bac","American"],
      insight: "The gap between your grades and your cognitive profile is where your hidden potential lives",
    },
    accounts: {
      personal: "Individual learner — full brain test, academic records, four reports",
      family:   "Parent-child link — track multiple learners under one family plan",
      organization: "Schools, universities, tutoring centres — bulk cognitive mapping",
    },
    pricing: "KES 40 per report document. Pay only for what you want. 30-day unlock.",
    company: "OCRA — a subsidiary of Artist Life Foundation",
  };

  // ═══════════════════════════════════════════════════════════
  // 3. AI RESPONSE ENGINE — SUPERCHARGED COGNITION
  // ═══════════════════════════════════════════════════════════
  var FILLERS = {
    think:    ["Hmm...", "Let me think...", "Uuuuh...", "Right, so —", "Now..."],
    wow:      ["Ah!", "Oh — I see!", "Fascinating.", "Yes —", "Right!", "Interesting —"],
    open:     ["Here's what most people miss:", "Now, here's the thing —",
               "Let me give you the real picture:", "In my analysis —",
               "What's particularly fascinating is —", "You know what I find remarkable?"],
    warmth:   ["You're in good hands.", "I'm with you on this.",
               "Trust the process — and trust yourself.", "That's exactly the right question to ask."],
    cogn:     ["My cognition tells me", "Cross-referencing what I know —",
               "From a cognitive-science perspective,", "Here's the signal beneath the noise:"],
  };

  function _p(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function _classify(input) {
    var t = (input || "").toLowerCase();
    var score = function (keys) { return keys.reduce(function (s, k) { return s + (t.indexOf(k) >= 0 ? 1 : 0); }, 0); };
    var map = {
      GREETING:      score(["hello","hi ","hey","good morning","good evening","yo","what's up","howdy","sup"]),
      IDENTITY:      score(["who are you","what are you","your name","arten","introduce","tell me about yourself","you are"]),
      CAPABILITIES:  score(["what can you do","how do you work","capabilities","help me","what do you know","guide me","assist"]),
      BRAIN_TEST:    score(["brain test","brain-test","cognitive","sixty","60 question","assessment","dimensions","iq","intelligence test","thinking test"]),
      CAREER:        score(["career","job","profession","future","work","path","vocation","field","industry","role","what should i be","job market"]),
      ACADEMIC:      score(["grade","subject","school","education","academic","record","transcript","marks","gpa","cbc","igcse","ib ","a-level","8-4-4"]),
      REPORTS:       score(["report","document","pdf","download","diagnostic","study report","wellness","career report","four report"]),
      PAYMENT:       score(["pay","cost","price","kes","money","mpesa","stripe","forty","40 ","purchase","buy","how much","billing"]),
      ENCOURAGEMENT: score(["scared","nervous","worried","stress","anxious","can't","hard","difficult","overwhelm","fear","fail","doubt","unsure"]),
      STUDY:         score(["study","learn","tips","how to prepare","improve","revision","focus","memory","concentration","reading"]),
      RESULTS:       score(["result","score","perform","how did i","outcome","progress","analysis","what did i get","my score"]),
      ACCOUNT:       score(["account","sign up","signup","login","profile","personal account","family account","organization","register"]),
      CONTEXT:       score(["where am i","what is this","what screen","what page","current","right now"]),
    };
    var best = "UNKNOWN", bestScore = 0;
    Object.keys(map).forEach(function (k) { if (map[k] > bestScore) { bestScore = map[k]; best = k; } });
    return best;
  }

  function _respond(intent, input, ctx) {
    var f = Math.random() > 0.5 ? _p(FILLERS.think) + " " : "";
    var o = Math.random() > 0.55 ? _p(FILLERS.open) + " " : "";
    var w = _p(FILLERS.warmth);
    var phase = ctx.phase || "";
    var user  = O.state && O.state.user;
    var name  = user && (user.firstName || (user.email && user.email.split("@")[0])) || null;
    var hi    = name ? name : null;

    var R = {
      GREETING: function () {
        var texts = [
          "Hello" + (hi ? ", " + hi : "") + "! " + _p(FILLERS.wow) + " I'm Arten — your cognitive companion inside OCRA. I live at the intersection of deep intelligence and genuine warmth. I think in patterns, speak with intention, and I'm here exclusively for you. What's on your mind?",
          "Hey" + (hi ? " " + hi : "") + ". Arten here. I carry deep knowledge of cognitive science, career intelligence, OCRA's inner workings, and a few things beyond. " + _p(FILLERS.wow) + " I'm wired to be useful and honest. Ask me anything — I don't do surface-level answers.",
        ];
        return { text: _p(texts), emotion: "excited" };
      },
      IDENTITY: function () {
        return {
          text: f + "I'm Arten. An AI cognitive companion — purpose-built for OCRA. " + _p(FILLERS.wow) + " I'm not just a chatbot. I carry a structured model of cognitive science, career mapping, academic intelligence, and OCRA's full architecture. I think before I speak, I reason before I conclude, and I speak with emotional nuance because intelligence without warmth is just noise. What would you like to explore?",
          emotion: "curious",
        };
      },
      CAPABILITIES: function () {
        return {
          text: o + "I can walk you through the brain test, decode your cognitive scores, explain your reports, navigate career paths, answer questions about academic records, pricing, accounts — and engage you in real conversation about what matters to you. " + w + " What do you need right now?",
          emotion: "encouraging",
        };
      },
      BRAIN_TEST: function () {
        var inTest = phase === "brainTest";
        var prefix = inTest ? "You're right in the middle of the brain test — " : "";
        return {
          text: f + prefix + o + "The OCRA brain test is 60 precision questions across six cognitive dimensions: " + KB.brainTest.dimensions.join(", ") + ". " + _p(FILLERS.wow) + " here's what most people don't realise — it's not about getting things right. It's about HOW your brain moves through each problem. The timing, the pattern, the choices. Your scores are " + KB.brainTest.scoring + ". Takes about " + KB.brainTest.duration + ". " + KB.brainTest.tip,
          emotion: inTest ? "encouraging" : "thinking",
        };
      },
      CAREER: function () {
        return {
          text: o + "OCRA maps you to " + KB.careers.count + " career paths. " + _p(FILLERS.wow) + " " + KB.careers.note + ". Most career tools match your grades to job titles. OCRA matches how your neurons actually fire to what each career cognitively demands. That's a fundamentally different — and more accurate — kind of guidance. " + w,
          emotion: "excited",
        };
      },
      ACADEMIC: function () {
        return {
          text: f + o + "Academic records in OCRA span " + KB.academic.systems.join(", ") + " — every major system worldwide. " + _p(FILLERS.wow) + " " + KB.academic.insight + ". Most intelligence tools look at grades in isolation. We cross-reference your academic performance against your cognitive profile. Where they diverge is your real story — the untapped ability, the mismatched system, the hidden strength.",
          emotion: "curious",
        };
      },
      REPORTS: function () {
        var list = Object.keys(KB.reports.types).map(function (k) {
          return "the " + k + " report — " + KB.reports.types[k];
        }).join("; ");
        return {
          text: o + "OCRA generates " + KB.reports.count + " documents: " + list + ". Each is " + KB.reports.price + " with " + KB.reports.unlock + ". " + _p(FILLERS.wow) + " every report is generated from your unique cognitive-academic fingerprint. No two are alike.",
          emotion: "calm",
        };
      },
      PAYMENT: function () {
        return {
          text: f + KB.pricing + ". " + _p(FILLERS.wow) + " You choose exactly which documents you want — you never pay for what you don't need. Payment is via M-Pesa or card. Once unlocked, full 30-day access. For developers on the platform — well, payment doesn't apply to them at all.",
          emotion: "calm",
        };
      },
      ENCOURAGEMENT: function () {
        return {
          text: _p(FILLERS.wow) + " I hear you. " + f + "Here's what I need you to understand: the brain test is not a judgment. It is a map. And maps are only useful when you start the journey. OCRA is designed precisely for people who feel like they haven't reached their real potential yet. " + w + " Intelligence is a pattern — and your pattern is worth finding.",
          emotion: "encouraging",
        };
      },
      STUDY: function () {
        return {
          text: o + "OCRA's Study Report doesn't give generic advice. " + _p(FILLERS.wow) + " it analyses your cognitive profile — specifically your processing speed, memory architecture, and verbal-spatial balance — and designs a study system around how your brain actually encodes information. Generic study tips are noise. Yours will be signal. Precision is the point.",
          emotion: "excited",
        };
      },
      RESULTS: function () {
        var done = O.brainTest && O.brainTest.state && O.brainTest.state.completedAt;
        if (done) {
          return { text: "Your results are in. " + _p(FILLERS.wow) + " your cognitive profile has been fully mapped across all six dimensions. The reports translate this into real, actionable intelligence. Want me to walk you through what each dimension means for your life?", emotion: "excited" };
        }
        return {
          text: f + "Your results generate the moment you complete the brain test. " + _p(FILLERS.open) + " the scoring runs z-normalisation across six dimensions to place you on a precise cognitive map. Instantly after completion, all four reports are generated from that map. Ready to begin?",
          emotion: "calm",
        };
      },
      ACCOUNT: function () {
        return {
          text: o + "OCRA has three account types: " + KB.accounts.personal + "; " + KB.accounts.family + "; and " + KB.accounts.organization + ". " + _p(FILLERS.wow) + " each type unlocks the full OCRA platform — brain test, academic records, all four reports. Which are you setting up?",
          emotion: "curious",
        };
      },
      CONTEXT: function () {
        var phaseMap = {
          intro: "the landing screen — OCRA's entry point",
          choose: "the pathway selection screen",
          auth: "the authentication screen",
          brainTestStart: "the brain test introduction",
          brainTest: "inside the brain test itself",
          intake: "the intake form",
          academicEntry: "academic records entry",
          payment: "the payment screen",
          dash: "your dashboard",
          reportView: "the reports section",
        };
        var desc = phaseMap[phase] || "an OCRA screen";
        return {
          text: "Right now you're on " + desc + ". " + _p(FILLERS.wow) + " I have full awareness of where you are in the OCRA flow. What would you like to do from here?",
          emotion: "calm",
        };
      },
      UNKNOWN: function () {
        var fallbacks = [
          f + _p(FILLERS.cogn) + " your question touches something interesting. Let me reason through it: " + _p(FILLERS.open) + " I may not have a precise answer, but I can think alongside you. Tell me more — what's the underlying thing you're trying to understand?",
          _p(FILLERS.think) + " " + _p(FILLERS.open) + " I'm wired for OCRA's domain, but my cognition extends beyond it. Give me more context and I'll give you more precision.",
          "Hmm — I see where you're going. My knowledge is deep within OCRA's architecture, but I engage with broader ideas too. What's the real question beneath that question?",
        ];
        return { text: _p(fallbacks), emotion: "thinking" };
      },
    };
    return (R[intent] || R.UNKNOWN)();
  }

  // ═══════════════════════════════════════════════════════════
  // 4. CANVAS 3D SPHERE RENDERER
  // ═══════════════════════════════════════════════════════════
  var _canvas, _ctx, _startT = Date.now(), _raf = null;
  var _targetEmotionK = "calm", _lerpEmotionK = "calm";
  var _lerpT = 0; // 0..1 transition progress

  function _hexToRgb(hex) {
    hex = hex.replace("#", "");
    var n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function _lerpColor(a, b, t) {
    var ra = _hexToRgb(a), rb = _hexToRgb(b);
    return "rgb(" +
      Math.round(ra[0] + (rb[0] - ra[0]) * t) + "," +
      Math.round(ra[1] + (rb[1] - ra[1]) * t) + "," +
      Math.round(ra[2] + (rb[2] - ra[2]) * t) + ")";
  }

  function _drawSphere(t) {
    if (!_ctx || !_canvas) return;
    var W  = _canvas.width, H = _canvas.height;
    var cx = W / 2, cy = H / 2, r = W * 0.40;
    _ctx.clearRect(0, 0, W, H);

    // Lerp between emotions smoothly
    if (_lerpT < 1) _lerpT = Math.min(1, _lerpT + 0.025);
    var eA = EMOTIONS[_lerpEmotionK]  || EMOTIONS.calm;
    var eB = EMOTIONS[_targetEmotionK] || EMOTIONS.calm;
    var lt = _lerpT;

    var base = _lerpColor(eA.base, eB.base, lt);
    var mid  = _lerpColor(eA.mid,  eB.mid,  lt);
    var lit  = _lerpColor(eA.lit,  eB.lit,  lt);
    var rot  = eA.rot + (eB.rot  - eA.rot)  * lt;

    // Breathing scale
    var breath = 1 + Math.sin(t * 1.4) * 0.018;

    // Light position orbits slowly
    var lx = cx + Math.cos(t * rot) * r * 0.45;
    var ly = cy - r * 0.32 + Math.sin(t * rot * 0.7) * r * 0.1;

    // ── Outer ambient glow ──────────────────────────────────
    var glowG = _ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.55);
    glowG.addColorStop(0, eB.glow.replace("0.40", "0.22").replace("0.35","0.20").replace("0.28","0.14").replace("0.38","0.18").replace("0.45","0.22"));
    glowG.addColorStop(0.5, eB.glow.replace(/[\d.]+\)$/, "0.08)"));
    glowG.addColorStop(1, "rgba(0,0,0,0)");
    _ctx.fillStyle = glowG;
    _ctx.fillRect(0, 0, W, H);

    // ── Sphere base layer ───────────────────────────────────
    _ctx.save();
    _ctx.scale(breath, breath);
    _ctx.translate(cx * (1 - breath), cy * (1 - breath));

    var sphereG = _ctx.createRadialGradient(lx / breath, ly / breath, 0, cx / breath, cy / breath, r);
    sphereG.addColorStop(0, lit);
    sphereG.addColorStop(0.35, mid);
    sphereG.addColorStop(0.72, base);
    sphereG.addColorStop(1, "#03020e");

    _ctx.beginPath();
    _ctx.arc(cx / breath, cy / breath, r, 0, Math.PI * 2);
    _ctx.fillStyle = sphereG;
    _ctx.fill();

    // ── Specular highlight ──────────────────────────────────
    _ctx.save();
    _ctx.beginPath();
    _ctx.arc(cx / breath, cy / breath, r, 0, Math.PI * 2);
    _ctx.clip();
    var sx = lx / breath - r * 0.08;
    var sy = ly / breath - r * 0.06;
    var specG = _ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.42);
    specG.addColorStop(0, "rgba(190,170,255,0.42)");
    specG.addColorStop(0.35, "rgba(100,80,230,0.14)");
    specG.addColorStop(1, "rgba(0,0,0,0)");
    _ctx.fillStyle = specG;
    _ctx.fillRect(-W, -H, W * 3, H * 3);

    // ── Rim glow (makes sphere feel 3D) ────────────────────
    var rimG = _ctx.createRadialGradient(cx / breath, cy / breath, r * 0.68, cx / breath, cy / breath, r);
    rimG.addColorStop(0, "rgba(0,0,0,0)");
    rimG.addColorStop(0.84, "rgba(0,0,0,0)");
    var rimRgb = eB.rim;
    rimG.addColorStop(1, rimRgb);
    _ctx.fillStyle = rimG;
    _ctx.fillRect(-W, -H, W * 3, H * 3);
    _ctx.restore();

    _ctx.restore(); // end scale

    // ── Eyes ───────────────────────────────────────────────
    _ctx.save();
    _ctx.beginPath();
    _ctx.arc(cx, cy, r * breath, 0, Math.PI * 2);
    _ctx.clip();

    var eyeColor = eB.eyeC;
    var eyeY  = cy - r * 0.06;
    var eyeW  = r * 0.27;
    var eyeBaseH = r * 0.105;

    // Eye height modifiers
    var blinkPeriod = t % 4.8;
    var isBlink = blinkPeriod > 4.68;
    var eyeH = isBlink ? eyeBaseH * 0.05 : eyeBaseH;

    if (A._speaking) {
      eyeH = eyeBaseH * (0.55 + Math.abs(Math.sin(t * 9.5)) * 0.75);
    } else if (_targetEmotionK === "thinking") {
      eyeH = eyeBaseH * (0.28 + Math.sin(t * 2.2) * 0.08);
    } else if (_targetEmotionK === "excited") {
      eyeH = eyeBaseH * (0.9 + Math.sin(t * 4) * 0.12);
    }

    var eyeAlpha = A._speaking
      ? (0.75 + Math.sin(t * 9.5) * 0.25)
      : (0.85 + Math.sin(t * 2) * 0.08);

    var eyeGlow = 8 + (A._speaking ? Math.abs(Math.sin(t * 9.5)) * 8 : 0);

    function _drawEye(x, y, w, h) {
      var rad = h * 0.5;
      _ctx.beginPath();
      _ctx.moveTo(x - w / 2 + rad, y - h / 2);
      _ctx.lineTo(x + w / 2 - rad, y - h / 2);
      _ctx.arcTo(x + w / 2, y - h / 2, x + w / 2, y - h / 2 + rad, rad);
      _ctx.lineTo(x + w / 2, y + h / 2 - rad);
      _ctx.arcTo(x + w / 2, y + h / 2, x + w / 2 - rad, y + h / 2, rad);
      _ctx.lineTo(x - w / 2 + rad, y + h / 2);
      _ctx.arcTo(x - w / 2, y + h / 2, x - w / 2, y + h / 2 - rad, rad);
      _ctx.lineTo(x - w / 2, y - h / 2 + rad);
      _ctx.arcTo(x - w / 2, y - h / 2, x - w / 2 + rad, y - h / 2, rad);
      _ctx.closePath();
    }

    _ctx.globalAlpha = eyeAlpha;
    _ctx.shadowColor = eyeColor;
    _ctx.shadowBlur  = eyeGlow;
    _ctx.fillStyle   = eyeColor;

    _drawEye(cx - r * 0.32, eyeY, eyeW, eyeH);
    _ctx.fill();
    _drawEye(cx + r * 0.32, eyeY, eyeW, eyeH);
    _ctx.fill();

    // Inner eye highlight
    _ctx.globalAlpha = eyeAlpha * 0.35;
    _ctx.shadowBlur = 0;
    _ctx.fillStyle = "rgba(255,255,255,0.9)";
    var hlW = eyeW * 0.22, hlH = eyeH * 0.32, hlR = hlH / 2;
    _drawEye(cx - r * 0.32 - eyeW * 0.12, eyeY - eyeH * 0.18, hlW, hlH);
    _ctx.fill();
    _drawEye(cx + r * 0.32 - eyeW * 0.12, eyeY - eyeH * 0.18, hlW, hlH);
    _ctx.fill();

    _ctx.globalAlpha = 1;
    _ctx.shadowBlur  = 0;
    _ctx.restore();
  }

  function _loop() {
    if (!_canvas) return;
    var t = (Date.now() - _startT) / 1000;
    _drawSphere(t);
    _raf = requestAnimationFrame(_loop);
  }

  A.setEmotion = function (key) {
    if (EMOTIONS[key] && key !== _targetEmotionK) {
      _lerpEmotionK  = _targetEmotionK;
      _targetEmotionK = key;
      _lerpT = 0;
    }
    A._emotion = key;
  };

  // ═══════════════════════════════════════════════════════════
  // 5. VOICE + SPEAK SYNC
  // ═══════════════════════════════════════════════════════════
  A.speak = function (text, emotion, persona) {
    A.setEmotion(emotion || "calm");
    A._speaking = true;
    if (O.voice && !O.voice.isMuted()) {
      O.voice.say(text, persona || "adam", { rate: 0.86, pitch: 1.02 });
      // Estimate duration and reset speaking state
      var msPerWord = 175;
      setTimeout(function () { A._speaking = false; }, text.split(/\s+/).length * msPerWord + 600);
    } else {
      setTimeout(function () { A._speaking = false; }, 200);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 6. CHAT UI
  // ═══════════════════════════════════════════════════════════
  function _esc(s) {
    return (O.esc ? O.esc(s) : String(s))
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  A.renderWidget = function () {
    return '<div id="arten-wrap" style="position:fixed;bottom:26px;right:22px;z-index:8888;' +
      'display:flex;flex-direction:column;align-items:flex-end;gap:10px;pointer-events:none">' +

      // Chat panel
      '<div id="arten-chat" style="width:328px;display:none;flex-direction:column;pointer-events:all;' +
        'background:rgba(6,4,22,.95);backdrop-filter:blur(20px) saturate(1.3);' +
        'border:1px solid rgba(90,60,200,.3);border-radius:20px;overflow:hidden;' +
        'box-shadow:0 16px 60px rgba(0,0,0,.75),0 0 60px rgba(50,20,180,.12);' +
        'transform:translateY(8px);opacity:0;transition:transform .28s cubic-bezier(.34,1.56,.64,1),opacity .22s ease">' +

        // Header
        '<div style="padding:13px 16px;background:rgba(25,12,65,.7);border-bottom:1px solid rgba(90,60,200,.2);' +
             'display:flex;align-items:center;gap:9px">' +
          '<div style="width:7px;height:7px;border-radius:50%;background:#00ddff;box-shadow:0 0 7px #00ddff;flex-shrink:0"></div>' +
          '<span style="color:#c4d8f8;font-size:13px;font-weight:700;letter-spacing:.06em">ARTEN</span>' +
          '<span style="color:rgba(140,155,200,.45);font-size:11px;margin-left:2px">· cognitive companion</span>' +
          '<button id="arten-close" style="margin-left:auto;background:none;border:none;color:rgba(140,155,200,.45);' +
            'font-size:20px;cursor:pointer;line-height:1;padding:0 4px;transition:color .15s" ' +
            'onmouseover="this.style.color=\'#c4d8f8\'" onmouseout="this.style.color=\'rgba(140,155,200,.45)\'">×</button>' +
        '</div>' +

        // Messages
        '<div id="arten-msgs" style="flex:1;max-height:272px;overflow-y:auto;padding:14px 12px;' +
          'display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;' +
          'scrollbar-width:thin;scrollbar-color:rgba(90,60,200,.3) transparent"></div>' +

        // Thinking indicator (hidden by default)
        '<div id="arten-thinking" style="padding:0 12px 6px;display:none">' +
          '<div style="display:flex;gap:4px;align-items:center;padding:8px 12px;' +
            'background:rgba(30,15,80,.55);border-radius:12px;border-top-left-radius:4px;width:fit-content">' +
            '<span class="arten-dot" style="width:5px;height:5px;border-radius:50%;background:#00ccff;animation:artenDot 1.2s .0s infinite"></span>' +
            '<span class="arten-dot" style="width:5px;height:5px;border-radius:50%;background:#00ccff;animation:artenDot 1.2s .2s infinite"></span>' +
            '<span class="arten-dot" style="width:5px;height:5px;border-radius:50%;background:#00ccff;animation:artenDot 1.2s .4s infinite"></span>' +
          '</div>' +
        '</div>' +

        // Input
        '<div style="padding:10px 12px;border-top:1px solid rgba(90,60,200,.15);display:flex;gap:8px">' +
          '<input id="arten-input" type="text" placeholder="Ask Arten anything…" autocomplete="off" ' +
            'style="flex:1;background:rgba(255,255,255,.055);border:1px solid rgba(90,60,200,.22);border-radius:10px;' +
            'padding:9px 13px;color:#e4eeff;font-size:13px;outline:none;font-family:inherit;transition:border-color .18s" ' +
            'onfocus="this.style.borderColor=\'rgba(0,200,255,.4)\'" onblur="this.style.borderColor=\'rgba(90,60,200,.22)\'" />' +
          '<button id="arten-send" style="background:linear-gradient(135deg,#3311cc,#0066aa);border:none;border-radius:10px;' +
            'padding:9px 15px;color:#fff;font-size:15px;cursor:pointer;font-weight:700;transition:opacity .15s" ' +
            'onmouseover="this.style.opacity=\'.85\'" onmouseout="this.style.opacity=\'1\'">↑</button>' +
        '</div>' +
      '</div>' +

      // Sphere button
      '<div id="arten-btn" style="pointer-events:all;cursor:pointer;position:relative;' +
        'filter:drop-shadow(0 4px 14px rgba(40,20,180,.4));transition:transform .15s;' +
        'transform-origin:center bottom" ' +
        'onmouseover="this.style.transform=\'scale(1.06)\'" onmouseout="this.style.transform=\'scale(1)\'">' +
        '<canvas id="arten-canvas" width="86" height="86" ' +
          'style="display:block;border-radius:50%;cursor:pointer"></canvas>' +
        '<div id="arten-badge" style="position:absolute;bottom:5px;right:5px;width:11px;height:11px;' +
          'border-radius:50%;background:#00ddff;box-shadow:0 0 7px #00ddff;' +
          'border:2px solid #06041a;animation:artenPulse 2.2s infinite"></div>' +
      '</div>' +

      '</div>' +

      // Keyframe styles
      '<style>' +
        '@keyframes artenDot{0%,80%,100%{transform:scale(.7);opacity:.5}40%{transform:scale(1);opacity:1}}' +
        '@keyframes artenPulse{0%,100%{box-shadow:0 0 7px #00ddff}50%{box-shadow:0 0 14px #00ddff,0 0 24px rgba(0,200,255,.4)}}' +
      '</style>';
  };

  A._addMessage = function (role, text) {
    A._history.push({ role: role, text: text, ts: Date.now() });
    var msgs = document.getElementById("arten-msgs");
    if (!msgs) return;
    var isArten = role === "arten";
    var div = document.createElement("div");
    div.style.cssText = "display:flex;gap:8px;align-items:flex-start;" + (isArten ? "" : "flex-direction:row-reverse");
    var avatarStyle = isArten
      ? "background:linear-gradient(135deg,#1a0b3b,#3311cc);color:#9bd;font-size:10px;font-weight:700"
      : "background:rgba(255,255,255,.1);color:rgba(180,200,230,.7);font-size:10px;font-weight:700";
    var bubbleBg   = isArten ? "rgba(35,15,90,.65)" : "rgba(255,255,255,.07)";
    var bubbleBdr  = isArten ? "rgba(90,60,200,.25)" : "rgba(255,255,255,.1)";
    var bubbleRad  = isArten ? "12px 12px 12px 4px" : "12px 12px 4px 12px";
    div.innerHTML =
      '<div style="width:26px;height:26px;border-radius:50%;flex-shrink:0;' + avatarStyle +
        ';display:flex;align-items:center;justify-content:center;margin-top:2px">' + (isArten ? "A" : "U") + '</div>' +
      '<div style="background:' + bubbleBg + ';border:1px solid ' + bubbleBdr + ';border-radius:' + bubbleRad + ';' +
        'padding:9px 12px;max-width:226px;font-size:13px;line-height:1.55;color:#d8e8ff;word-break:break-word">' +
        _esc(text) + '</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  };

  A.greet = function () {
    var name = O.state && O.state.user && O.state.user.firstName;
    var text = name
      ? "Hello, " + name + ". I'm Arten — your cognitive companion. I think deeply, speak with intention, and I'm here exclusively for you. What would you like to explore?"
      : "Hello. I'm Arten — the cognitive intelligence layer of OCRA. I think in patterns, speak with intention, and I'm wired to be genuinely useful. Ask me anything.";
    A._addMessage("arten", text);
    A.speak(text, "excited", "adam");
  };

  A._setThinking = function (on) {
    var el = document.getElementById("arten-thinking");
    if (el) el.style.display = on ? "block" : "none";
  };

  A.reply = function (userText) {
    A.setEmotion("thinking");
    A._setThinking(true);
    var intent = _classify(userText);
    var delay  = 680 + Math.random() * 540;
    setTimeout(function () {
      A._setThinking(false);
      var res = _respond(intent, userText, { phase: O.state && O.state.phase });
      A._addMessage("arten", res.text);
      A.speak(res.text, res.emotion, "adam");
    }, delay);
  };

  A.toggle = function () {
    A._open = !A._open;
    var chatEl = document.getElementById("arten-chat");
    if (!chatEl) return;
    if (A._open) {
      chatEl.style.display = "flex";
      chatEl.style.flexDirection = "column";
      requestAnimationFrame(function () {
        chatEl.style.transform = "translateY(0)";
        chatEl.style.opacity   = "1";
      });
      if (A._history.length === 0) setTimeout(A.greet, 320);
    } else {
      chatEl.style.transform = "translateY(8px)";
      chatEl.style.opacity   = "0";
      setTimeout(function () { chatEl.style.display = "none"; }, 280);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 7. MOUNT & WIRE
  // ═══════════════════════════════════════════════════════════
  A.mount = function () {
    if (A._mounted || !document.body) return;
    A._mounted = true;

    var wrap = document.createElement("div");
    wrap.innerHTML = A.renderWidget();
    document.body.appendChild(wrap.firstChild);

    // Init canvas
    _canvas = document.getElementById("arten-canvas");
    if (_canvas) {
      try { _ctx = _canvas.getContext("2d"); } catch (e) { _ctx = null; }
      if (_ctx) _loop();
    }

    // Sphere click
    var btn = document.getElementById("arten-btn");
    if (btn) btn.addEventListener("click", A.toggle);

    // Close button
    var closeBtn = document.getElementById("arten-close");
    if (closeBtn) closeBtn.addEventListener("click", A.toggle);

    // Send
    var input   = document.getElementById("arten-input");
    var sendBtn = document.getElementById("arten-send");

    function _send() {
      if (!input || !input.value.trim()) return;
      var text = input.value.trim();
      input.value = "";
      A._addMessage("user", text);
      A.reply(text);
    }
    if (sendBtn) sendBtn.addEventListener("click", _send);
    if (input) input.addEventListener("keydown", function (e) { if (e.key === "Enter") _send(); });
  };

  // Context updates from OCRA phase changes
  A.onPhase = function (phase) {
    var phaseEmotions = {
      intro: "calm", choose: "curious", account: "curious",
      auth: "encouraging", brainTestStart: "excited",
      brainTest: "excited", intake: "calm", academicEntry: "calm",
      payment: "calm", dash: "calm", reportView: "excited",
    };
    A.setEmotion(phaseEmotions[phase] || "calm");
  };

  // Mount when DOM is ready (defer scripts run after HTML parse)
  if (document.body) {
    A.mount();
  } else {
    document.addEventListener("DOMContentLoaded", A.mount);
  }

  console.log("✅ Arten Module Loaded — 3D cognitive companion, supercharged intelligence");

})(window.OCRA);
