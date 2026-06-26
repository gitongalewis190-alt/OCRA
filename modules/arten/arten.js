/* ============================================================
   DOMAIN_29 — ARTEN  v3
   Cognitive AI companion of OCRA · Artist Life Intelligence
   · Only activates after the user presses Dive In (never on intro)
   · Absolute meta-awareness: knows OCRA + Artist Life Foundation
   · Canvas 2D 3D-look sphere, waveform, emotional palette
   · Voice input (SpeechRecognition) + voice output (O.voice)
   · Glassmorphism chat panel
   ============================================================ */
(function (O) {
  "use strict";
  var A = (O.arten = {});

  // ── Knowledge Base ────────────────────────────────────────────
  var KB = {
    foundation: {
      name:       "Artist Life Foundation",
      tagline:    "Art is Life Intelligence",
      mission:    "Democratising cognitive clarity — giving every learner access to deep self-knowledge previously reserved for the privileged few.",
      ocraRel:    "OCRA is a subsidiary of Artist Life Foundation.",
      artenRel:   "Arten is OCRA's cognitive AI companion, engineered under the Artist Life Intelligence framework.",
      philosophy: "Art is Life. And intelligence is the art of understanding life itself.",
    },
    ocra: {
      full:     "Optimised Career and Results Analytics",
      mission:  "OCRA reads academic records and cognitive signals to decode each learner's potential and map it to real career paths.",
      docs:     ["Cognitive Report", "Academic Transcript", "Career Pathway Map", "Psychometric Profile"],
      price:    "KES 40 per document. A one-time payment unlocks the full report suite for 30 days.",
      payment:  "OCRA accepts M-Pesa and card (via Stripe). Developer accounts bypass payment.",
      security: "OCRA is private and proprietary. No third-party access without written permission from Lewis Gitonga.",
    },
    arten: {
      name:      "Arten",
      role:      "Cognitive AI companion inside OCRA",
      framework: "Artist Life Intelligence — a framework that treats intelligence as the art of understanding life itself.",
      creator:   "Engineered by Lewis Gitonga under Artist Life Foundation.",
      voice:     "Arten speaks through the Web Speech API using the warmest available voice on your device.",
      listen:    "Arten listens via your microphone using Web Speech Recognition. Click the mic icon to activate.",
    },
    brainTest: {
      name:     "OCRA Brain Test",
      desc:     "A 60-question psychometric assessment spanning 6 cognitive dimensions.",
      dims:     ["Verbal Reasoning", "Numerical Logic", "Abstract Patterns", "Memory & Recall", "Processing Speed", "Spatial Awareness"],
      duration: "Around 20–30 minutes. Answer honestly — this is your profile, not a competition.",
    },
    careers: {
      desc:    "OCRA maps your cognitive signature to real career paths using data from academic performance and cognitive test results.",
      factors: ["cognitive strengths", "learning style", "academic trajectory", "interest signals"],
    },
    lewis: {
      name:  "Lewis Gitonga",
      role:  "Founder and highest-hierarchy developer of OCRA and Artist Life Foundation.",
      email: "gitongalewis190@gmail.com",
    },
  };

  // ── Intent map — 30 intents ───────────────────────────────────
  var f = "· Artist Life Intelligence · ";

  var INTENTS = {
    GREETING: function () {
      return { text: "I'm Arten — the cognitive AI companion inside OCRA, built under Artist Life Foundation's intelligence framework. Art is Life. And I'm here to make sure you understand yours.", emotion: "calm" };
    },
    IDENTITY: function () {
      return { text: "I'm Arten. " + KB.arten.role + ". " + KB.arten.framework + " " + KB.arten.creator, emotion: "calm" };
    },
    FOUNDATION: function () {
      return { text: f + KB.foundation.name + ". " + KB.foundation.tagline + ". " + KB.foundation.mission + " " + KB.foundation.ocraRel + " " + KB.foundation.artenRel + " " + KB.foundation.philosophy, emotion: "calm" };
    },
    OCRA: function () {
      return { text: "OCRA stands for " + KB.ocra.full + ". " + KB.ocra.mission + " It's a subsidiary of " + KB.foundation.name + ".", emotion: "encouraging" };
    },
    BRAIN_TEST: function () {
      return { text: KB.brainTest.name + " is " + KB.brainTest.desc + " It covers: " + KB.brainTest.dims.join(", ") + ". " + KB.brainTest.duration, emotion: "encouraging" };
    },
    CAREER: function () {
      return { text: KB.careers.desc + " Factors include: " + KB.careers.factors.join(", ") + ".", emotion: "encouraging" };
    },
    REPORTS: function () {
      return { text: "OCRA generates four documents: " + KB.ocra.docs.join(", ") + ". " + KB.ocra.price, emotion: "calm" };
    },
    PAYMENT: function () {
      return { text: KB.ocra.payment, emotion: "calm" };
    },
    PRICE: function () {
      return { text: KB.ocra.price, emotion: "calm" };
    },
    SECURITY: function () {
      return { text: KB.ocra.security, emotion: "calm" };
    },
    LEWIS: function () {
      return { text: KB.lewis.name + " is the " + KB.lewis.role, emotion: "calm" };
    },
    VOICE: function () {
      return { text: KB.arten.voice, emotion: "calm" };
    },
    LISTEN: function () {
      return { text: KB.arten.listen, emotion: "curious" };
    },
    HELP: function () {
      return { text: "I can help you understand OCRA's brain test, reports, career mapping, payment, and everything about Artist Life Foundation. Just ask me anything.", emotion: "encouraging" };
    },
    HELLO: function () {
      return { text: "Hello! Great to meet you. I'm Arten, your cognitive companion. Ready to help you understand yourself better.", emotion: "excited" };
    },
    HOWAMI: function () {
      return { text: "I'm running beautifully, thank you. Powered by Artist Life Intelligence — curious, attentive, and here for you.", emotion: "calm" };
    },
    THANKS: function () {
      return { text: "You're very welcome. That's exactly what I'm here for.", emotion: "calm" };
    },
    GOODBYE: function () {
      return { text: "Take care. Your journey with OCRA is just beginning. Come back anytime.", emotion: "calm" };
    },
    DIMENSIONS: function () {
      return { text: "The six cognitive dimensions measured are: " + KB.brainTest.dims.join(", ") + ".", emotion: "encouraging" };
    },
    DURATION: function () {
      return { text: "The brain test takes " + KB.brainTest.duration, emotion: "calm" };
    },
    PHILOSOPHY: function () {
      return { text: KB.foundation.philosophy + " That's the foundation of everything Artist Life Foundation and OCRA stands for.", emotion: "calm" };
    },
    MISSION: function () {
      return { text: "Our mission: " + KB.foundation.mission, emotion: "encouraging" };
    },
    ACCOUNTS: function () {
      return { text: "OCRA supports Personal, Family, and Organisation accounts — each tailored to different learning and reporting contexts.", emotion: "calm" };
    },
    DATA: function () {
      return { text: "OCRA stores your academic records and cognitive results securely. You can export or delete your data at any time from the Data Management section.", emotion: "calm" };
    },
    SCORES: function () {
      return { text: "Your cognitive scores are percentile-ranked across six dimensions. The report shows your strengths, growth areas, and career fit — all backed by your actual data.", emotion: "encouraging" };
    },
    SIGNUP: function () {
      return { text: "Creating an account is free. Once you sign up, you'll take the brain test and academic intake, then OCRA generates your personal report suite.", emotion: "encouraging" };
    },
    LOGIN: function () {
      return { text: "Log in with your email and password. If you forget your password, use the recovery questions you set up during sign-up.", emotion: "calm" };
    },
    RECOVER: function () {
      return { text: "Password recovery uses two factual questions and two favourites you chose when signing up. Answer them correctly to reset your password.", emotion: "calm" };
    },
    INTAKE: function () {
      return { text: "The intake form gathers context about your academic background — subjects, grades, and learning style — so OCRA can tailor your report accurately.", emotion: "calm" };
    },
    UNKNOWN: function () {
      return { text: "I'm Arten — " + KB.arten.role + ", built under " + KB.foundation.name + "'s Artist Life Intelligence framework. " + KB.ocra.mission + " Ask me about the brain test, your reports, career mapping, or anything OCRA-related. I'm here.", emotion: "calm" };
    },
  };

  // ── Intent classification ─────────────────────────────────────
  var _PATTERNS = [
    [/\b(who are you|what are you|introduce yourself|your name)\b/i, "IDENTITY"],
    [/\b(arten|archangel|companion|assistant)\b/i,                   "IDENTITY"],
    [/\b(artist life|foundation|mother company|parent company|art is life)\b/i, "FOUNDATION"],
    [/\b(what is ocra|about ocra|ocra mean|ocra do|ocra stand)\b/i, "OCRA"],
    [/\b(brain test|cognitive test|psychometric|assessment|quiz)\b/i, "BRAIN_TEST"],
    [/\b(career|job|path|profession|vocation|future)\b/i,            "CAREER"],
    [/\b(report|document|transcript|profile|results)\b/i,            "REPORTS"],
    [/\b(pay|payment|m.?pesa|stripe|cost|price|fee|KES)\b/i,         "PAYMENT"],
    [/\b(how much|price|cost|KES|40)\b/i,                            "PRICE"],
    [/\b(security|private|proprietary|data safe|secure)\b/i,         "SECURITY"],
    [/\b(lewis|gitonga|founder|creator|developer)\b/i,               "LEWIS"],
    [/\b(voice|speak|text.?to.?speech|TTS)\b/i,                     "VOICE"],
    [/\b(listen|microphone|mic|speech recognition|voice input)\b/i,  "LISTEN"],
    [/\b(help|assist|support|what can you)\b/i,                      "HELP"],
    [/\b(hello|hi\b|hey|greetings|good morning|good afternoon|good evening)\b/i, "HELLO"],
    [/\b(how are you|how do you do|you okay)\b/i,                    "HOWAMI"],
    [/\b(thank|thanks|appreciate|great job)\b/i,                     "THANKS"],
    [/\b(bye|goodbye|see you|take care|farewell)\b/i,                "GOODBYE"],
    [/\b(dimension|verbal|numerical|abstract|memory|spatial|processing)\b/i, "DIMENSIONS"],
    [/\b(how long|duration|time|minutes)\b/i,                        "DURATION"],
    [/\b(philosophy|meaning|life|intelligence)\b/i,                  "PHILOSOPHY"],
    [/\b(mission|purpose|goal|aim|objective)\b/i,                    "MISSION"],
    [/\b(account|personal|family|organisation|organization)\b/i,     "ACCOUNTS"],
    [/\b(data|privacy|delete|export|store|manage)\b/i,               "DATA"],
    [/\b(score|percentile|rank|result|performance)\b/i,              "SCORES"],
    [/\b(sign.?up|register|create account|new account)\b/i,          "SIGNUP"],
    [/\b(log.?in|login|sign.?in|signin)\b/i,                         "LOGIN"],
    [/\b(recover|forgot|reset|password)\b/i,                         "RECOVER"],
    [/\b(intake|form|background|subject|grade)\b/i,                  "INTAKE"],
  ];

  function _classify(text) {
    var t = text.toLowerCase();
    for (var i = 0; i < _PATTERNS.length; i++) {
      if (_PATTERNS[i][0].test(t)) return _PATTERNS[i][1];
    }
    if (t.trim().length < 4) return "GREETING";
    return "UNKNOWN";
  }

  // ── State ─────────────────────────────────────────────────────
  A._mounted   = false;
  A._emotion   = "calm";
  A._speaking  = false;
  A._listening = false;

  // ── Canvas sphere drawing ──────────────────────────────────────
  function _drawSphere(ctx, cx, cy, r, emotion, t, speaking, blinkT) {
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    var grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r);
    var colors = {
      calm:        ["#5bc8f5", "#0e6ba8"],
      thinking:    ["#a78bfa", "#5b21b6"],
      excited:     ["#34d399", "#065f46"],
      encouraging: ["#fbbf24", "#92400e"],
      curious:     ["#f87171", "#991b1b"],
      listening:   ["#6ee7b7", "#047857"],
    };
    var c = colors[emotion] || colors.calm;
    grad.addColorStop(0, c[0]);
    grad.addColorStop(1, c[1]);

    var breathe = 1 + 0.025 * Math.sin(2 * Math.PI * 1.4 * t);
    var sr = r * breathe;

    ctx.beginPath();
    ctx.arc(cx, cy, sr, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();

    // Specular highlight
    var spec = ctx.createRadialGradient(cx - sr * 0.28, cy - sr * 0.28, 0, cx - sr * 0.28, cy - sr * 0.28, sr * 0.45);
    spec.addColorStop(0, "rgba(255,255,255,0.55)");
    spec.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, sr, 0, 2 * Math.PI);
    ctx.fillStyle = spec;
    ctx.fill();

    // Rim glow
    var rim = ctx.createRadialGradient(cx, cy, sr * 0.72, cx, cy, sr * 1.08);
    rim.addColorStop(0, "rgba(255,255,255,0)");
    rim.addColorStop(1, "rgba(91,200,245,0.18)");
    ctx.beginPath();
    ctx.arc(cx, cy, sr * 1.08, 0, 2 * Math.PI);
    ctx.fillStyle = rim;
    ctx.fill();

    // Eyes
    var eyeY = cy - sr * 0.08;
    var eyeR = sr * 0.135;
    var eyeOff = sr * 0.28;
    var blinkH = (emotion === "thinking") ? eyeR * 0.35 : eyeR;

    var blinkPhase = (blinkT % 4.9);
    if (blinkPhase < 0.12) blinkH *= (blinkPhase / 0.06 < 1 ? blinkPhase / 0.06 : 2 - blinkPhase / 0.06);

    var spkGlow = speaking ? 0.7 + 0.3 * Math.sin(2 * Math.PI * 9.8 * t) : 0;

    [cx - eyeOff, cx + eyeOff].forEach(function (ex) {
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeR * 0.6, blinkH * 0.6, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(5,15,30,0.92)";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeR, blinkH, 0, 0, 2 * Math.PI);
      ctx.fillStyle = speaking ? "rgba(91,200,245," + (0.5 + spkGlow * 0.5) + ")" : "rgba(30,100,160,0.82)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex - eyeR * 0.25, eyeY - blinkH * 0.28, eyeR * 0.18, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fill();
    });
  }

  // ── Waveform drawing ──────────────────────────────────────────
  function _drawWave(ctx, w, h, mode, t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "idle") return;
    var mid = h / 2;
    ctx.beginPath();
    for (var x = 0; x <= w; x++) {
      var p = x / w, y;
      if (mode === "speaking") {
        y = mid + Math.sin(p * 12 + t * 9.4) * h * 0.38
               + Math.sin(p * 7  + t * 14.1) * h * 0.18
               + Math.sin(p * 19 + t * 5.2)  * h * 0.10;
      } else {
        y = mid + Math.sin(p * 8 + t * 7.0) * h * 0.3
               + Math.sin(p * 14 + t * 11.0) * h * 0.14
               + (Math.random() - 0.5) * h * 0.07;
      }
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = mode === "speaking" ? "rgba(91,200,245,0.85)" : "rgba(110,231,183,0.75)";
    ctx.lineWidth   = 1.6;
    ctx.stroke();
  }

  // ── Mount ─────────────────────────────────────────────────────
  A.mount = function () {
    if (A._mounted || typeof document === "undefined") return;
    A._mounted = true;

    var wrap = document.createElement("div");
    wrap.id = "arten-wrap";
    wrap.style.cssText = [
      "position:fixed;bottom:18px;left:18px;z-index:9999",
      "display:flex;flex-direction:column;align-items:center;gap:4px",
      "font-family:system-ui,sans-serif",
    ].join(";");

    var orb = document.createElement("div");
    orb.id = "arten-orb";
    orb.style.cssText = "position:relative;cursor:pointer;user-select:none;";

    var canvas = document.createElement("canvas");
    canvas.width  = 72;
    canvas.height = 72;
    canvas.style.cssText = "display:block;border-radius:50%;";
    var ctx = canvas.getContext ? canvas.getContext("2d") : null;

    var wvCvs = document.createElement("canvas");
    wvCvs.width  = 88;
    wvCvs.height = 22;
    wvCvs.style.cssText = "display:block;border-radius:4px;background:rgba(0,0,0,0.18);";
    var wvCtx = wvCvs.getContext ? wvCvs.getContext("2d") : null;

    var badge = document.createElement("div");
    badge.id = "arten-badge";
    badge.style.cssText = [
      "position:absolute;top:2px;right:2px",
      "width:18px;height:18px;border-radius:50%",
      "background:#0e6ba8;color:#fff;font-size:9px;font-weight:700",
      "display:flex;align-items:center;justify-content:center",
      "box-shadow:0 0 0 2px #fff",
    ].join(";");
    badge.textContent = "A";

    orb.appendChild(canvas);
    orb.appendChild(badge);

    var label = document.createElement("div");
    label.textContent = "Arten";
    label.style.cssText = "font-size:10px;color:rgba(255,255,255,0.7);text-align:center;letter-spacing:.5px;";

    wrap.appendChild(orb);
    wrap.appendChild(wvCvs);
    wrap.appendChild(label);

    // Chat panel
    var panel = document.createElement("div");
    panel.id = "arten-panel";
    panel.style.cssText = [
      "display:none;position:fixed;bottom:130px;left:18px;width:310px;max-height:420px",
      "background:rgba(10,20,40,0.82);backdrop-filter:blur(18px)",
      "border:1px solid rgba(91,200,245,0.25);border-radius:16px",
      "overflow:hidden;flex-direction:column;z-index:9998",
      "box-shadow:0 8px 32px rgba(0,0,0,0.45)",
    ].join(";");

    var pHead = document.createElement("div");
    pHead.style.cssText = "padding:10px 14px 8px;border-bottom:1px solid rgba(91,200,245,0.15);";
    pHead.innerHTML = '<div style="font-size:13px;font-weight:700;color:#5bc8f5;">Arten</div>' +
                      '<div style="font-size:9px;color:rgba(91,200,245,0.6);margin-top:1px;">· Artist Life Intelligence</div>';

    var msgs = document.createElement("div");
    msgs.id = "arten-msgs";
    msgs.style.cssText = "flex:1;overflow-y:auto;padding:10px 14px;display:flex;flex-direction:column;gap:8px;max-height:280px;";

    var inputRow = document.createElement("div");
    inputRow.style.cssText = "display:flex;gap:6px;padding:8px 10px;border-top:1px solid rgba(91,200,245,0.12);";

    var inp = document.createElement("input");
    inp.id = "arten-input";
    inp.placeholder = "Ask me anything…";
    inp.style.cssText = [
      "flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(91,200,245,0.2)",
      "border-radius:20px;padding:6px 12px;color:#e0f0ff;font-size:12px;outline:none",
    ].join(";");

    var micBtn = document.createElement("button");
    micBtn.id = "arten-mic";
    micBtn.title = "Hold to speak";
    micBtn.style.cssText = [
      "background:rgba(91,200,245,0.15);border:1px solid rgba(91,200,245,0.3)",
      "border-radius:50%;width:30px;height:30px;cursor:pointer;color:#5bc8f5;font-size:14px",
      "display:flex;align-items:center;justify-content:center;flex-shrink:0",
    ].join(";");
    micBtn.innerHTML = "🎙";

    var sendBtn = document.createElement("button");
    sendBtn.style.cssText = [
      "background:#0e6ba8;border:none;border-radius:50%;width:30px;height:30px",
      "cursor:pointer;color:#fff;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0",
    ].join(";");
    sendBtn.innerHTML = "↑";

    inputRow.appendChild(inp);
    inputRow.appendChild(micBtn);
    inputRow.appendChild(sendBtn);

    panel.appendChild(pHead);
    panel.appendChild(msgs);
    panel.appendChild(inputRow);

    document.body.appendChild(wrap);
    document.body.appendChild(panel);

    // ── Animation loop ────────────────────────────────────────────
    var _t0 = Date.now() / 1000, _blinkT = 0;

    function _loop() {
      var t = Date.now() / 1000 - _t0;
      _blinkT += 0.016;
      _drawSphere(ctx, 36, 36, 30, A._emotion, t, A._speaking, _blinkT);
      var wMode = A._speaking ? "speaking" : (A._listening ? "listening" : "idle");
      _drawWave(wvCtx, 88, 22, wMode, t);
      if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(_loop);
    }
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(_loop);
    } else if (ctx) {
      _drawSphere(ctx, 36, 36, 30, A._emotion, 0, false, 0);
    }

    // ── Panel toggle ──────────────────────────────────────────────
    var _open = false;
    function _togglePanel() {
      _open = !_open;
      panel.style.display = _open ? "flex" : "none";
      if (_open && msgs.children.length === 0) {
        _addMsg("arten", INTENTS.GREETING().text);
        if (O.voice) O.voice.say(INTENTS.GREETING().text, "arten", { rate: 0.87, pitch: 1.02 });
      }
    }
    orb.addEventListener("click", _togglePanel);

    // ── Message helpers ───────────────────────────────────────────
    function _addMsg(role, text) {
      var row = document.createElement("div");
      row.style.cssText = "display:flex;flex-direction:column;align-items:" + (role === "user" ? "flex-end" : "flex-start") + ";";
      var bubble = document.createElement("div");
      bubble.style.cssText = [
        "max-width:86%;padding:7px 11px;border-radius:12px;font-size:12px;line-height:1.5",
        role === "user"
          ? "background:rgba(14,107,168,0.65);color:#e0f4ff;border-bottom-right-radius:3px"
          : "background:rgba(91,200,245,0.12);color:#cce8f8;border-bottom-left-radius:3px",
      ].join(";");
      bubble.textContent = text;
      var ts = document.createElement("div");
      ts.style.cssText = "font-size:9px;color:rgba(255,255,255,0.3);margin-top:2px;";
      ts.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      row.appendChild(bubble);
      row.appendChild(ts);
      msgs.appendChild(row);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function _thinking() {
      var row = document.createElement("div");
      row.id = "arten-thinking";
      row.style.cssText = "display:flex;align-items:center;gap:3px;padding:2px 0;";
      for (var i = 0; i < 3; i++) {
        var d = document.createElement("div");
        d.style.cssText = "width:5px;height:5px;border-radius:50%;background:#5bc8f5;opacity:0.5;animation:artenDot .8s infinite alternate;animation-delay:" + (i * 0.2) + "s;";
        row.appendChild(d);
      }
      msgs.appendChild(row);
      msgs.scrollTop = msgs.scrollHeight;
      if (!document.getElementById("arten-style")) {
        var st = document.createElement("style");
        st.id = "arten-style";
        st.textContent = "@keyframes artenDot{from{opacity:.2;transform:translateY(0)}to{opacity:1;transform:translateY(-3px)}}";
        document.head.appendChild(st);
      }
      return row;
    }

    // ── Process input ─────────────────────────────────────────────
    function _respond(text) {
      if (!text.trim()) return;
      _addMsg("user", text);
      var thinkEl = _thinking();
      A.setEmotion("thinking");

      setTimeout(function () {
        if (thinkEl.parentNode) thinkEl.parentNode.removeChild(thinkEl);
        var key = _classify(text);
        var fn  = INTENTS[key] || INTENTS.UNKNOWN;
        var res = fn(text);
        A.setEmotion(res.emotion || "calm");
        _addMsg("arten", res.text);
        A._speaking = true;
        if (O.voice) O.voice.say(res.text, "arten", { rate: 0.87, pitch: 1.02 });
        setTimeout(function () { A._speaking = false; }, Math.min(res.text.length * 55, 8000));
      }, 480 + Math.random() * 350);
    }

    sendBtn.addEventListener("click", function () {
      var v = inp.value.trim();
      inp.value = "";
      if (v) _respond(v);
    });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { sendBtn.click(); }
    });

    // ── Mic / SpeechRecognition ──────────────────────────────────
    var _recog = null;
    try {
      var SRClass = (typeof SpeechRecognition !== "undefined") ? SpeechRecognition
        : (typeof webkitSpeechRecognition !== "undefined" ? webkitSpeechRecognition : null);
      if (SRClass) {
        _recog = new SRClass();
        _recog.lang = "en-US";
        _recog.interimResults = false;
        _recog.maxAlternatives = 1;
        _recog.onresult = function (e) {
          var said = e.results[0][0].transcript;
          A._listening = false;
          badge.style.background = "#0e6ba8";
          _respond(said);
        };
        _recog.onerror = _recog.onend = function () {
          A._listening = false;
          badge.style.background = "#0e6ba8";
        };
      }
    } catch (e) { _recog = null; }

    micBtn.addEventListener("click", function () {
      if (!_recog) { _addMsg("arten", "Microphone isn't available in this browser. Try typing your question."); return; }
      if (A._listening) { _recog.stop(); }
      else {
        A._listening = true;
        badge.style.background = "#ef4444";
        A.setEmotion("listening");
        if (!_open) _togglePanel();
        try { _recog.start(); } catch (e) { A._listening = false; badge.style.background = "#0e6ba8"; }
      }
    });
  };

  // ── Emotion setter ────────────────────────────────────────────
  A.setEmotion = function (em) { A._emotion = em; };

  // ── Phase hook — only activates post-Dive-In ──────────────────
  A.onPhase = function (phase) {
    if (phase === "intro") return;      // Stay invisible on landing screen
    if (!A._mounted) A.mount();        // First non-intro phase: activate
    var map = {
      choose:         "curious",
      account:        "curious",
      auth:           "encouraging",
      brainTestStart: "excited",
      brainTest:      "thinking",
      intake:         "curious",
      academicEntry:  "calm",
      payment:        "calm",
      dash:           "calm",
      reportView:     "excited",
    };
    A.setEmotion(map[phase] || "calm");
  };

  // NOT auto-mounting — activates via onPhase() when Dive In is pressed
  console.log("✅ Arten v3 Loaded — Artist Life Intelligence · activates after Dive In");

})(window.OCRA);
