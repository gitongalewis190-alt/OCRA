/* ============================================================
   ACADEMIC RECORDS MODULE
   Subject score entry, validation, z-score normalisation.
   Supports KCSE (Kenya), Cambridge, IB, CBE, and generic.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  var AR = (O.academicRecords = {});

  // ---- GRADING SYSTEMS ----
  AR.gradingSystems = {
    KCSE: {
      name: "KCSE (Kenya)",
      maxScore: 500,
      subjects: ["Mathematics", "English", "Kiswahili", "Biology", "Chemistry", "Physics", "History", "Geography", "CRE/IRE", "Business Studies"],
      gradeScale: [
        { min: 80, grade: "A", points: 12 },
        { min: 75, grade: "A-", points: 11 },
        { min: 70, grade: "B+", points: 10 },
        { min: 65, grade: "B", points: 9 },
        { min: 60, grade: "B-", points: 8 },
        { min: 55, grade: "C+", points: 7 },
        { min: 50, grade: "C", points: 6 },
        { min: 45, grade: "C-", points: 5 },
        { min: 40, grade: "D+", points: 4 },
        { min: 35, grade: "D", points: 3 },
        { min: 30, grade: "D-", points: 2 },
        { min: 0,  grade: "E",  points: 1 },
      ],
    },
    Cambridge: {
      name: "Cambridge International",
      maxScore: 100,
      subjects: ["Mathematics", "English Language", "Biology", "Chemistry", "Physics", "History", "Geography", "Computer Science", "Economics", "Foreign Language"],
      gradeScale: [
        { min: 90, grade: "A*" },
        { min: 80, grade: "A" },
        { min: 70, grade: "B" },
        { min: 60, grade: "C" },
        { min: 50, grade: "D" },
        { min: 40, grade: "E" },
        { min: 30, grade: "F" },
        { min: 0,  grade: "U" },
      ],
    },
    IB: {
      name: "International Baccalaureate",
      maxScore: 7,
      subjects: ["Mathematics", "Language A", "Language B", "Sciences", "Humanities", "Arts", "Theory of Knowledge"],
      gradeScale: [
        { min: 7, grade: "7" },
        { min: 6, grade: "6" },
        { min: 5, grade: "5" },
        { min: 4, grade: "4" },
        { min: 3, grade: "3" },
        { min: 2, grade: "2" },
        { min: 1, grade: "1" },
      ],
    },
    CBE: {
      name: "Competency Based Education (CBC)",
      maxScore: 100,
      subjects: ["Mathematics", "English", "Kiswahili", "Science & Technology", "Social Studies", "Creative Arts", "Physical & Health Education", "CRE/IRE"],
      gradeScale: [
        { min: 75, grade: "Exceeds Expectation (EE)" },
        { min: 50, grade: "Meets Expectation (ME)" },
        { min: 25, grade: "Approaches Expectation (AE)" },
        { min: 0,  grade: "Below Expectation (BE)" },
      ],
    },
    generic: {
      name: "Other / General",
      maxScore: 100,
      subjects: ["Mathematics", "Science", "English", "Social Studies", "Other Subject 1", "Other Subject 2"],
      gradeScale: [
        { min: 80, grade: "A" },
        { min: 70, grade: "B" },
        { min: 60, grade: "C" },
        { min: 50, grade: "D" },
        { min: 0,  grade: "F" },
      ],
    },
  };

  AR.state = {
    system: "KCSE",
    scores: {},
    validated: false,
  };

  AR.getSystem = function () {
    var user = O.state.user || {};
    var sys = user.educationSystem || AR.state.system;
    return AR.gradingSystems[sys] || AR.gradingSystems.generic;
  };

  AR.getGrade = function (score, system) {
    var scale = system.gradeScale;
    for (var i = 0; i < scale.length; i++) {
      if (score >= scale[i].min) return scale[i].grade;
    }
    return scale[scale.length - 1].grade;
  };

  AR.calculateZScore = function (score, mean, stdDev) {
    if (stdDev === 0) return 0;
    return ((score - mean) / stdDev).toFixed(2);
  };

  AR.save = function () {
    var system = AR.getSystem();
    var scores = {};
    system.subjects.forEach(function (subj) {
      var key = subj.toLowerCase().replace(/[^a-z0-9]/g, "_");
      var el = document.querySelector("[data-ar-field='" + key + "']");
      if (el && el.value !== "") {
        scores[key + "_score"] = parseFloat(el.value) || 0;
        scores[key + "_grade"] = AR.getGrade(scores[key + "_score"], system);
      }
    });
    AR.state.scores = scores;
    AR.state.validated = true;
    O.state.academicRecords = scores;
    return scores;
  };

  AR.screens = {
    entry: function () {
      var user = O.state.user || {};
      var systemKey = user.educationSystem || AR.state.system || "KCSE";
      var system = AR.gradingSystems[systemKey] || AR.gradingSystems.generic;
      var existing = AR.state.scores || {};

      var systemOpts = Object.keys(AR.gradingSystems).map(function (k) {
        return '<option value="' + k + '"' + (systemKey === k ? " selected" : "") + '>' + AR.gradingSystems[k].name + '</option>';
      }).join("");

      var fields = system.subjects.map(function (subj) {
        var key = subj.toLowerCase().replace(/[^a-z0-9]/g, "_");
        var val = existing[key + "_score"] || "";
        return '<div class="field" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:end">' +
          '<label style="margin:0;font-size:13px;color:var(--ink)">' + O.esc(subj) + '</label>' +
          '<input data-ar-field="' + key + '" type="number" min="0" max="' + system.maxScore + '" ' +
            'placeholder="0 – ' + system.maxScore + '" value="' + O.esc(String(val)) + '" ' +
            'style="padding:10px;border-radius:10px;border:1px solid rgba(16,58,85,.15);font-size:13px" />' +
        '</div>';
      }).join("");

      return '' +
      '<div class="center"><div class="glass card-pad" style="max-width:560px;width:100%">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">' +
          '<div style="font-size:28px"><span aria-hidden="true" style="font-weight:700;color:var(--ocean)">Docs</span></div>' +
          '<div>' +
            '<div style="font-size:20px;font-weight:800;color:var(--ink)">Academic Records</div>' +
            '<div class="muted" style="font-size:12px">Enter your subject scores</div>' +
          '</div>' +
        '</div>' +
        '<div class="field" style="margin-bottom:20px">' +
          '<label>Education System</label>' +
          '<select id="arSystemSelect">' + systemOpts + '</select>' +
        '</div>' +
        '<div class="glass panel" style="background:rgba(14,107,168,.06);margin-bottom:20px;padding:12px">' +
          '<div class="muted" style="font-size:11px">Enter your most recent term scores. Scores are used to generate your Academic Transcript and personalise career recommendations.</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">' +
          fields +
        '</div>' +
        '<p id="arErr" class="err"></p>' +
        '<div style="display:flex;gap:10px;margin-top:8px">' +
          '<button class="btn" data-action="academicEntryBack" style="flex:1;padding:13px">Back</button>' +
          '<button class="btn primary" data-action="academicEntryNext" style="flex:2;padding:13px;font-weight:700">Continue to Brain Test &rarr;</button>' +
        '</div>' +
      '</div></div>';
    },
  };

  // system switcher: reload page on change
  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "arSystemSelect") {
      AR.state.system = e.target.value;
      if (O.state.user) O.state.user.educationSystem = e.target.value;
      O.render();
    }
  });

  console.log("✅ Academic Records Module Loaded · multi-system grading");

})(window.OCRA);
