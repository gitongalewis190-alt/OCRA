/* ============================================================
   INTAKE FORM MODULE
   Age-tiered pre-test introspective questionnaire.
   Generates personalised questions based on user profile.
   Virtual fill or printable. Feeds into report engine.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  var IF = (O.intakeForm = {});

  // ---- QUESTION BANKS (by age tier) ----
  IF.questionBanks = {
    tier1: [ // 6-9: encouraging, simple, gamified
      { key: "favouriteSubject",  label: "What is your favourite subject at school?", type: "select", options: ["Maths", "English", "Science", "Art", "Physical Education", "Other"] },
      { key: "dreamJob",          label: "What do you want to be when you grow up?", type: "text" },
      { key: "strongestSubject",  label: "Which subject are you best at?", type: "select", options: ["Maths", "English", "Science", "Art", "Other"] },
      { key: "weeklyStudyHours",  label: "How many hours do you study each day?", type: "select", options: ["Less than 1", "1-2 hours", "2-3 hours", "More than 3 hours"] },
      { key: "learningStyle",     label: "How do you learn best?", type: "select", options: ["Listening", "Reading", "Drawing/writing", "Doing activities"] },
    ],
    tier2: [ // 10-12: inquisitive, structured
      { key: "favouriteSubject",  label: "Which subject do you enjoy most and why?", type: "text" },
      { key: "careerInterest",    label: "What career area interests you most?", type: "select", options: ["Science & Technology", "Health & Medicine", "Business & Finance", "Arts & Media", "Engineering", "Education", "Not sure yet"] },
      { key: "studyHabits",       label: "Describe your typical study routine.", type: "text" },
      { key: "biggestChallenge",  label: "What is your biggest academic challenge right now?", type: "text" },
      { key: "learningStyle",     label: "How do you learn best?", type: "select", options: ["Visual (charts/diagrams)", "Auditory (listening)", "Reading/writing", "Hands-on practice"] },
      { key: "weeklyStudyHours",  label: "How many hours per week do you dedicate to studies?", type: "select", options: ["Under 5", "5-10", "10-15", "15-20", "20+"] },
    ],
    tier3: [ // 13-15: analytical, clear
      { key: "subjectStrengths",  label: "Which 2 subjects are you strongest in?", type: "text" },
      { key: "subjectWeaknesses", label: "Which subject do you find most challenging?", type: "text" },
      { key: "careerDirection",   label: "Do you have a career direction in mind?", type: "select", options: ["Yes, clearly defined", "Yes, but flexible", "Exploring options", "Not yet decided"] },
      { key: "careerGoal",        label: "What career or field are you considering?", type: "text" },
      { key: "studyConsistency",  label: "How consistent is your study routine?", type: "select", options: ["Very consistent", "Mostly consistent", "Inconsistent", "I struggle to maintain a routine"] },
      { key: "extracurricular",   label: "What extracurricular activities do you do?", type: "text" },
      { key: "stressLevel",       label: "How would you rate your current academic stress level?", type: "select", options: ["Low · manageable", "Moderate · sometimes overwhelming", "High · frequently stressed", "Very high · need support"] },
      { key: "motivation",        label: "What motivates you to study?", type: "text" },
    ],
    tier4: [ // 16-18: professional, strategic
      { key: "targetUniversity",  label: "Which university or institution are you targeting?", type: "text" },
      { key: "targetCourse",      label: "What course or programme are you targeting?", type: "text" },
      { key: "gradeTarget",       label: "What grade are you aiming for this term/year?", type: "select", options: ["A (Distinction)", "B (Merit)", "C (Pass)", "Just need to improve"] },
      { key: "studyMethod",       label: "What study methods do you use?", type: "text" },
      { key: "weeklyStudyHours",  label: "How many hours per week do you study?", type: "select", options: ["Under 10", "10-20", "20-30", "30-40", "40+"] },
      { key: "stressManagement",  label: "How do you manage academic pressure?", type: "text" },
      { key: "careerGoal",        label: "Describe your 5-year career goal.", type: "text" },
      { key: "biggestObstacle",   label: "What is your biggest obstacle to achieving your academic goals?", type: "text" },
      { key: "workingStyle",      label: "Do you prefer working independently or in groups?", type: "select", options: ["Independently", "In groups", "Mix of both"] },
    ],
    tier5: [ // 19+: executive, efficiency
      { key: "currentOccupation", label: "What is your current occupation or field?", type: "text" },
      { key: "careerGoal",        label: "What career transition or advancement are you targeting?", type: "text" },
      { key: "studyTimeAvail",    label: "How many hours per week can you realistically dedicate to development?", type: "select", options: ["Under 5", "5-10", "10-20", "20+"] },
      { key: "biggestObstacle",   label: "What is your biggest obstacle to professional growth?", type: "text" },
      { key: "learningPreference",label: "What learning format works best for your lifestyle?", type: "select", options: ["Self-paced online", "Structured courses", "Mentorship", "On-the-job learning"] },
      { key: "keyStrengths",      label: "What are your top 3 professional strengths?", type: "text" },
      { key: "skillGaps",         label: "What skills do you most need to develop?", type: "text" },
    ],
  };

  IF.state = {
    answers: {},
    stage: 1,
    ageTier: null,
  };

  IF.getQuestions = function () {
    var user = O.state.user || {};
    var tier = 3;
    if (O.reportEngine && O.reportEngine.calculateAgeTier && user.dateOfBirth) {
      var t = O.reportEngine.calculateAgeTier(user.dateOfBirth);
      tier = t.tier || 3;
    }
    IF.state.ageTier = tier;
    return IF.questionBanks["tier" + tier] || IF.questionBanks.tier3;
  };

  IF.save = function () {
    var fields = document.querySelectorAll("[data-intake-field]");
    fields.forEach(function (el) {
      IF.state.answers[el.getAttribute("data-intake-field")] = el.value;
    });
    O.state.intakeAnswers = IF.state.answers;
  };

  IF.next = function () {
    IF.save();
    O.go({ phase: "academicEntry" });
  };

  IF.back = function () {
    O.go({ phase: "dash", dash: O.state.account });
  };

  IF.screens = {
    form: function () {
      var user = O.state.user || {};
      var firstName = user.firstName || "Student";
      var questions = IF.getQuestions();
      var tierNames = { 1: "Early Explorer", 2: "Curious Learner", 3: "Rising Academic", 4: "Career Tracker", 5: "Growth Seeker" };
      var tierName = tierNames[IF.state.ageTier] || "Student";

      var body = questions.map(function (q) {
        var val = IF.state.answers[q.key] || "";
        if (q.type === "select") {
          var opts = q.options.map(function (o) {
            return '<option value="' + O.esc(o) + '"' + (val === o ? " selected" : "") + '>' + O.esc(o) + '</option>';
          }).join("");
          return '<div class="field">' +
            '<label>' + O.esc(q.label) + '</label>' +
            '<select data-intake-field="' + q.key + '">' +
              '<option value="">· select ·</option>' + opts +
            '</select>' +
          '</div>';
        }
        return '<div class="field">' +
          '<label>' + O.esc(q.label) + '</label>' +
          '<input data-intake-field="' + q.key + '" type="text" value="' + O.esc(val) + '" placeholder="Your answer..." />' +
        '</div>';
      }).join("");

      return '' +
      '<div class="center"><div class="glass card-pad" style="max-width:600px;width:100%">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">' +
          '<div style="font-size:28px"><span aria-hidden="true" style="font-weight:700">Doc</span></div>' +
          '<div>' +
            '<div style="font-size:20px;font-weight:800;color:var(--ink)">Intake Form</div>' +
            '<div class="muted" style="font-size:12px">Hi ' + O.esc(firstName) + ' &middot; ' + O.esc(tierName) + ' profile</div>' +
          '</div>' +
        '</div>' +
        '<div class="glass panel" style="background:rgba(14,107,168,.06);margin-bottom:20px;padding:14px">' +
          '<div class="muted" style="font-size:12px;line-height:1.6">' +
            'These questions help OCRA personalise your cognitive analysis and generate an accurate, age-appropriate report. ' +
            'Take your time · honest answers produce the best results.' +
          '</div>' +
        '</div>' +
        body +
        '<div style="display:flex;gap:10px;margin-top:20px">' +
          '<button class="btn" data-action="intakeBack" style="flex:1;padding:13px">Back</button>' +
          '<button class="btn" data-action="intakeSkip" style="padding:13px">Skip</button>' +
          '<button class="btn primary" data-action="intakeNext" style="flex:2;padding:13px;font-weight:700">Continue &rarr;</button>' +
        '</div>' +
        '<div style="text-align:center;margin-top:12px">' +
          '<button class="btn" data-action="intakePrint" style="font-size:11px"> Print Form</button>' +
        '</div>' +
      '</div></div>';
    },
  };

  // print helper
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-action='intakePrint']")) {
      IF.save();
      window.print();
    }
  });

  console.log("✅ Intake Form Module Loaded · age-tiered questionnaire");

})(window.OCRA);
