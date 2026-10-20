/* ============================================================
   REPORT ENGINE MODULE
   Brain Test payload + academic records -> 4 documents.
   Academic Transcript, Results Report, Career Guidance,
   Revision Timetable. Age-tiered tone + AI fallback.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  var RE = (O.reportEngine = O.reportEngine || {});

  RE.state = {
    brainTestPayload: null,
    academicRecords: null,
    userProfile: null,
    reports: {},
    aiInsights: null,
  };

  RE.calculateAgeTier = function (dateOfBirth) {
    var today = new Date();
    var birth = new Date(dateOfBirth);
    var age = today.getFullYear() - birth.getFullYear();
    var m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age >= 6 && age <= 9)   return { tier: 1, name: "EARLY_DEVELOPMENT",    tone: "encouraging_gamified" };
    if (age >= 10 && age <= 12) return { tier: 2, name: "FORMATIVE_EXPLORATION", tone: "inquisitive_structured" };
    if (age >= 13 && age <= 15) return { tier: 3, name: "TRANSITIONAL_ACADEMIC", tone: "analytical_clear" };
    if (age >= 16 && age <= 18) return { tier: 4, name: "CAREER_TARGETING",      tone: "professional_strategic" };
    if (age >= 19)              return { tier: 5, name: "ADULT_REALIGNMENT",     tone: "executive_efficiency" };
    return { tier: 3, name: "TRANSITIONAL_ACADEMIC", tone: "analytical_clear" };
  };

  RE.matchCareers = function (brainScores, academics) {
    var careerProfiles = [
      { name: "Software Engineer",   dimensions: ["abstractLogic", "numerical"],                  minScore: 5 },
      { name: "Architect",           dimensions: ["spatial", "mechanical"],                       minScore: 5 },
      { name: "Neurosurgeon",        dimensions: ["spatial", "mechanical", "linguistic"],         minScore: 6 },
      { name: "Data Scientist",      dimensions: ["numerical", "abstractLogic", "linguistic"],    minScore: 5 },
      { name: "Structural Engineer", dimensions: ["mechanical", "numerical", "spatial"],          minScore: 5 },
      { name: "Journalist",          dimensions: ["linguistic", "abstractLogic"],                 minScore: 6 },
      { name: "Medical Doctor",      dimensions: ["linguistic", "mechanical", "focusEndurance"],  minScore: 6 },
      { name: "Research Scientist",  dimensions: ["abstractLogic", "numerical", "focusEndurance"],minScore: 6 },
      { name: "Pilot",               dimensions: ["spatial", "mechanical", "focusEndurance"],     minScore: 6 },
      { name: "Economist",           dimensions: ["numerical", "abstractLogic", "linguistic"],    minScore: 5 },
    ];
    var scored = careerProfiles.map(function (career) {
      var total = 0;
      career.dimensions.forEach(function (dim) { total += brainScores[dim] || 0; });
      var avg = career.dimensions.length > 0 ? total / career.dimensions.length : 0;
      return Object.assign({}, career, { matchScore: avg, crs: Math.round((avg / 10) * 100) });
    });
    scored.sort(function (a, b) { return b.matchScore - a.matchScore; });
    return scored.slice(0, 4);
  };

  RE.getInsight = function (key, fallback) {
    if (RE.state.aiInsights && RE.state.aiInsights[key]) return RE.state.aiInsights[key];
    return fallback;
  };

  RE.generateTranscript = function () {
    var profile = RE.state.userProfile || {};
    var academics = RE.state.academicRecords || {};
    var payload = RE.state.brainTestPayload || { scores: {} };
    var ageTier = profile.dateOfBirth ? RE.calculateAgeTier(profile.dateOfBirth) : { tier: 3, name: "TRANSITIONAL_ACADEMIC" };
    var careers = RE.matchCareers(payload.scores, academics);
    return {
      type: "academic_transcript",
      title: "Academic Transcript & Cognitive Profile",
      ageTier: ageTier,
      sections: [
        { heading: "Student Information", content: { name: (profile.firstName || "") + " " + (profile.lastName || ""), school: profile.school || "·", level: profile.grade || "·", system: profile.educationSystem || "·", dateGenerated: new Date().toLocaleDateString("en-GB") } },
        { heading: "Academic Results Summary", content: academics },
        { heading: "6-Dimension Cognitive Profile", content: payload.scores },
        { heading: "Strengths & Key Observations", content: RE.getInsight("strengthsSummary", "Cognitive assessment indicates a well-rounded learner with notable analytical potential.") },
        { heading: "Top 4 Career Matches", content: careers.map(function (c) { return c.name + " (CRS: " + c.crs + "%)"; }) },
        { heading: "Signatures & Approval", content: "Student Signature: ____________________   Date: __________\nParent/Guardian: ______________________   Date: __________" },
      ],
    };
  };

  RE.generateResultsReport = function () {
    var payload = RE.state.brainTestPayload || { scores: {} };
    var totalScore = Object.values(payload.scores).reduce(function (a, b) { return a + b; }, 0);
    return {
      type: "results_report",
      title: "Results Report & Growth Analysis",
      sections: [
        { heading: "Performance Summary", content: RE.getInsight("performanceNarrative", "Cognitive assessment total: " + totalScore + "/60 (" + ((totalScore / 60) * 100).toFixed(0) + "%).") },
        { heading: "6-Dimension Score Breakdown", content: Object.entries(payload.scores).map(function (e) { return e[0] + ": " + e[1] + "/10"; }) },
        { heading: "Growth Trajectory (3-Term View)", content: "Term-on-term growth analysis will populate here once 3+ sessions have been recorded." },
        { heading: "Academic Blueprint", content: { strengths: RE.getInsight("strengthsSummary", "Strong analytical dimensions detected."), studyRecommendations: RE.getInsight("studyRecommendations", "Targeted practice in weaker dimensions recommended.") } },
        { heading: "Psychological Overview", content: RE.getInsight("psychologicalOverview", "Response patterns suggest a consistent, methodical thinking style.") },
      ],
    };
  };

  RE.generateCareerGuidance = function () {
    var payload = RE.state.brainTestPayload || { scores: {} };
    var careers = RE.matchCareers(payload.scores, RE.state.academicRecords || {});
    var scores = payload.scores || {};
    var sorted = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
    return {
      type: "career_guidance",
      title: "Career Guidance Sheet",
      sections: [
        { heading: "Your Cognitive Strengths", content: RE.getInsight("strengthsSummary", "Top dimensions: " + sorted.slice(0, 3).join(", ") + ".") },
        { heading: "Development Opportunities", content: RE.getInsight("studyRecommendations", "Areas for improvement: " + sorted.slice(-2).join(", ") + ".") },
        { heading: "Career Blockchain (4-Career Grid)", content: careers.map(function (c) { return { career: c.name, crs: c.crs + "%", requiredDimensions: c.dimensions.join(", "), pathway: "University degree or vocational pathway", subjects: "Mathematics, Sciences, applied subjects" }; }) },
        { heading: "Next Steps", content: ["1. Share this report with your teacher or career counsellor", "2. Focus elective choices on top 2 career matches", "3. Re-take the Brain Test each term", "4. Use the Revision Timetable to optimise study schedule"] },
      ],
    };
  };

  RE.generateRevisionTimetable = function () {
    var profile = RE.state.userProfile || {};
    var ageTier = profile.dateOfBirth ? RE.calculateAgeTier(profile.dateOfBirth) : { tier: 3, name: "TRANSITIONAL_ACADEMIC" };
    var academics = RE.state.academicRecords || {};
    var subjectKeys = Object.keys(academics).filter(function (k) { return k.endsWith("_score"); });
    var subjects = subjectKeys.length ? subjectKeys.map(function (k) { return k.replace("_score", "").replace(/_/g, " "); }) : ["Mathematics", "Sciences", "Languages", "Humanities"];
    var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    var slots = ["06:00–08:00", "09:00–12:00", "14:00–16:00"];
    var schedule = days.map(function (day) {
      var picks = subjects.slice(0, 3);
      return day + ": " + picks.map(function (s, j) { return slots[j % slots.length] + " " + s; }).join(" | ");
    });
    return {
      type: "revision_timetable",
      title: "Personal Revision Timetable",
      format: "landscape",
      sections: [
        { heading: "Your Personalised Study Schedule", content: schedule },
        { heading: "Optimal Study Windows (Chronobiology-Based)", content: ["06:00–08:00: Analytical focus (maths, logic)", "09:00–12:00: Peak hours (new content)", "14:00–16:00: Creative problem-solving", "18:00–21:00: Review and consolidation"] },
        { heading: "Weekly Distribution Principles", content: ["Prioritise lowest-scoring subjects for morning slots", "Alternate science and humanities to prevent fatigue", "Use Focus Endurance quick-fire quizzes in evening slots", "Sunday: rest and light review only"] },
        { heading: "Motivation & Commitment (" + ageTier.name + ")", content: [RE.getInsight("revisionMotivation", "Consistent effort compounds. Each session builds on the last."), "Burnout prevention: 45 min work / 15 min rest. No screens during breaks.", "Student Commitment: I commit to following this timetable. Signed: ________________"] },
      ],
    };
  };

  RE.generateAllReports = function (brainPayload, academicRecords, userProfile) {
    RE.state.brainTestPayload = brainPayload;
    RE.state.academicRecords = academicRecords;
    RE.state.userProfile = userProfile;

    if (O.aiInsights) {
      O.aiInsights.generate(brainPayload, academicRecords, userProfile, function (insights) {
        RE.state.aiInsights = insights;
        RE.state.reports.transcript       = RE.generateTranscript();
        RE.state.reports.resultsReport    = RE.generateResultsReport();
        RE.state.reports.careerGuidance   = RE.generateCareerGuidance();
        RE.state.reports.revisionTimetable = RE.generateRevisionTimetable();
      });
    }

    RE.state.reports = {
      transcript:          RE.generateTranscript(),
      resultsReport:       RE.generateResultsReport(),
      careerGuidance:      RE.generateCareerGuidance(),
      revisionTimetable:   RE.generateRevisionTimetable(),
    };

    if (O.developerConsole) O.developerConsole.increment("reportsGenerated");
    if (O.dataManagement)   O.dataManagement.log("REPORT_GENERATED", "4 documents generated");

    return RE.state.reports;
  };

  RE.exportAsPDF = function (reportType) {
    if (O.pdfExport) return O.pdfExport.trigger(reportType);
    return "PDF export module not loaded";
  };

  RE.screens = RE.screens || {};

  console.log("✅ Report Engine Module Loaded · 4-document generation, age-tiered, AI-wired");

})(window.OCRA);
