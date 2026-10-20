/* ============================================================
   AI INSIGHTS MODULE
   Claude Sonnet backend seam + comprehensive template fallbacks.
   Age-tiered language. Generates insights for all 4 documents.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  var AI = (O.aiInsights = {});

  // ---- DIMENSION DESCRIPTORS ----
  AI.dimDescriptors = {
    spatial:        { high: "exceptional spatial reasoning",  mid: "solid spatial awareness",    low: "developing spatial skills" },
    numerical:      { high: "strong numerical fluency",       mid: "functional numerical skills", low: "foundational numeracy" },
    linguistic:     { high: "articulate linguistic mastery",  mid: "capable linguistic reasoning",low: "growing language skills" },
    abstractLogic:  { high: "sharp logical deduction",        mid: "reliable logical thinking",   low: "emerging abstract reasoning" },
    mechanical:     { high: "intuitive mechanical insight",   mid: "competent physical intuition",low: "basic mechanical awareness" },
    focusEndurance: { high: "excellent sustained focus",      mid: "good cognitive endurance",    low: "focus consistency developing" },
  };

  AI.getDimLevel = function (score) {
    if (score >= 8) return "high";
    if (score >= 5) return "mid";
    return "low";
  };

  AI.getTopDimensions = function (scores, n) {
    n = n || 3;
    return Object.keys(scores)
      .sort(function (a, b) { return scores[b] - scores[a]; })
      .slice(0, n);
  };

  // ---- AGE-TIERED TONE ADAPTOR ----
  AI.adaptTone = function (text, tier) {
    var tones = {
      1: function (t) { return "Great job! " + t; },
      2: function (t) { return t; },
      3: function (t) { return t; },
      4: function (t) { return t; },
      5: function (t) { return t; },
    };
    return (tones[tier] || tones[3])(text);
  };

  // ---- TEMPLATE FALLBACKS ----
  AI.templates = {
    strengthsSummary: function (scores, ageTier) {
      var top = AI.getTopDimensions(scores, 3);
      var descs = top.map(function (d) {
        var level = AI.getDimLevel(scores[d]);
        return AI.dimDescriptors[d][level];
      });
      var text = "Your cognitive profile reveals " + descs[0] + ", complemented by " + descs[1] + " and " + descs[2] + ". " +
        "These dimensions form a distinctive cognitive signature that positions you well for analytical and structured fields.";
      return AI.adaptTone(text, ageTier ? ageTier.tier : 3);
    },

    performanceNarrative: function (scores, academics, ageTier) {
      var total = Object.values(scores).reduce(function (a, b) { return a + b; }, 0);
      var pct = ((total / 60) * 100).toFixed(0);
      var tier = ageTier ? ageTier.tier : 3;
      var narratives = {
        1: "You answered " + total + " out of 60 questions correctly (" + pct + "%). That is brilliant work for your age!",
        2: "Your overall cognitive score is " + total + "/60 (" + pct + "%). You are showing strong potential across multiple dimensions.",
        3: "Your cognitive assessment yielded a total score of " + total + "/60 (" + pct + "%), placing you in a strong developmental position.",
        4: "Your total cognitive score is " + total + "/60 (" + pct + "%). This result, combined with your academic record, informs your career readiness profile.",
        5: "Assessment result: " + total + "/60 (" + pct + "%). Your cognitive profile has been mapped against professional competency benchmarks.",
      };
      return narratives[tier] || narratives[3];
    },

    psychologicalOverview: function (scores, ageTier) {
      var top = AI.getTopDimensions(scores, 2);
      var tier = ageTier ? ageTier.tier : 3;
      var insights = {
        1: "You are a curious and creative thinker. Keep exploring!",
        2: "You show a balanced blend of logical and creative thinking, typical of a well-rounded learner at this stage.",
        3: "Your cognitive pattern suggests a methodical, analytical disposition with notable strengths in " + top[0] + " and " + top[1] + ". Channel this into focused study habits.",
        4: "Your profile indicates a strategic cognitive orientation. Your " + top[0] + " and " + top[1] + " strengths align well with competitive academic and professional pathways.",
        5: "Your profile reflects a mature cognitive approach. Your dominant dimensions·" + top[0] + " and " + top[1] + "·are indicators of professional competence and growth capacity.",
      };
      return insights[tier] || insights[3];
    },

    studyRecommendations: function (scores, ageTier) {
      var low = Object.keys(scores).sort(function (a, b) { return scores[a] - scores[b]; }).slice(0, 2);
      var tier = ageTier ? ageTier.tier : 3;
      var recs = low.map(function (d) {
        var labels = { spatial: "visualisation exercises", numerical: "daily mental arithmetic", linguistic: "reading and vocabulary", abstractLogic: "logic puzzles", mechanical: "physics problem sets", focusEndurance: "timed practice sessions" };
        return labels[d] || d;
      });
      var base = "Focus development on " + recs[0] + " and " + recs[1] + " to build a more balanced cognitive profile.";
      var additions = {
        1: " Try making it a fun daily game!",
        2: " Incorporate these into your weekly study plan.",
        3: " Dedicated practice of 20-30 minutes daily will produce measurable improvement within one term.",
        4: " Systematic practice in these areas will directly improve your exam performance and career readiness.",
        5: " Targeted skill-building in these dimensions will accelerate your professional development trajectory.",
      };
      return base + (additions[tier] || additions[3]);
    },

    careerInsight: function (career, scores, ageTier) {
      var tier = ageTier ? ageTier.tier : 3;
      var intro = { 1: "When you grow up, you could be a ", 2: "You might enjoy a career as a ", 3: "Your profile aligns with a career in ", 4: "Your cognitive strengths position you for ", 5: "Your profile indicates strong alignment with " };
      return (intro[tier] || intro[3]) + career.name + ". " +
        "Your strongest dimensions support the analytical and problem-solving demands of this field.";
    },

    revisionMotivation: function (ageTier) {
      var tier = ageTier ? ageTier.tier : 3;
      var messages = {
        1: "Every page you read makes your brain stronger. You are doing amazing!",
        2: "Consistency is your superpower. Small daily efforts add up to big results.",
        3: "Your brain is at its sharpest during growth years. Every hour of focused study now compounds over years.",
        4: "You are building the foundation of your career. University offers await the prepared mind.",
        5: "Professional growth is a lifelong investment. Your focus now is your asset tomorrow.",
      };
      return messages[tier] || messages[3];
    },
  };

  // ---- BACKEND SEAM (Claude Sonnet API) ----
  AI.generateWithClaude = function (prompt, onSuccess, onFail) {
    // Backend seam: POST /api/ai/insights with prompt
    // On success, calls onSuccess(text)
    // On failure, calls onFail(error) which triggers template fallback
    if (typeof fetch === "undefined") { onFail("fetch not available"); return; }
    fetch("/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt, model: "claude-sonnet-4-6" }),
    })
    .then(function (r) { return r.json(); })
    .then(function (data) { onSuccess(data.content || data.text || ""); })
    .catch(function (err) { onFail(err); });
  };

  // ---- MAIN ENTRY POINT ----
  AI.generate = function (brainPayload, academics, userProfile, onComplete) {
    var ageTier = null;
    if (O.reportEngine && O.reportEngine.calculateAgeTier && userProfile && userProfile.dateOfBirth) {
      ageTier = O.reportEngine.calculateAgeTier(userProfile.dateOfBirth);
    }
    var scores = brainPayload.scores || {};

    // Try Claude API, fall back to templates
    var prompt = "Generate personalised academic insights for a student. " +
      "Age tier: " + (ageTier ? ageTier.name : "TRANSITIONAL_ACADEMIC") + ". " +
      "Cognitive scores: " + JSON.stringify(scores) + ". " +
      "Academic records: " + JSON.stringify(academics || {}) + ". " +
      "Provide: strengths summary, performance narrative, psychological overview, study recommendations. Be concise and encouraging.";

    AI.generateWithClaude(prompt, function (aiText) {
      onComplete({ source: "claude", text: aiText, ageTier: ageTier });
    }, function () {
      // Template fallback
      onComplete({
        source: "template",
        strengthsSummary:       AI.templates.strengthsSummary(scores, ageTier),
        performanceNarrative:   AI.templates.performanceNarrative(scores, academics, ageTier),
        psychologicalOverview:  AI.templates.psychologicalOverview(scores, ageTier),
        studyRecommendations:   AI.templates.studyRecommendations(scores, ageTier),
        revisionMotivation:     AI.templates.revisionMotivation(ageTier),
        ageTier: ageTier,
      });
    });
  };

  console.log("✅ AI Insights Module Loaded · Claude Sonnet + template fallbacks");

})(window.OCRA);
