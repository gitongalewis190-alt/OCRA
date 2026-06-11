/* ============================================================
   BRAIN TEST MODULE — Data Model & Scaffolding
   60 questions, 6 dimensions, 10 per dimension.
   Dimensions: Spatial, Numerical, Linguistic, Abstract Logic, 
   Mechanical, Focus Endurability.
   Structure: modular, ready for logic wiring.
   ============================================================ */

window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  // ---- BRAIN TEST REGISTRY ----
  var BT = (O.brainTest = {});

  // ---- STATE ----
  BT.state = {
    sessionId: null,
    accountType: null,  // personal / family / organization
    userId: null,
    startedAt: null,
    completedAt: null,
    currentQuestion: 0,
    answers: [],        // array of { qid, answer, responseTimeMs }
    scores: {
      spatial: 0,
      numerical: 0,
      linguistic: 0,
      abstractLogic: 0,
      mechanical: 0,
      focusEndurance: 0,
    },
    rawScoresArray: [],  // for report engine (60 x 1/0)
    responsePacingMs: [], // for anti-cheat detection
    isComplete: false,
    isValid: true,       // anti-cheat flag
  };

  // ---- QUESTION BANK (60 total, 10 per dimension) ----
  // Structure: { qid, dimension, text, options[], correctAnswer }
  BT.questions = [
    // DIMENSION 1: SPATIAL REASONING (Q1-Q10)
    {
      qid: 1,
      dimension: "spatial",
      text: "Which 3D rotation of this cube matches the original?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      type: "multiChoice"
    },
    {
      qid: 2,
      dimension: "spatial",
      text: "If you fold this net, which face is opposite the marked face?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "C",
      type: "multiChoice"
    },
    {
      qid: 3,
      dimension: "spatial",
      text: "How many triangles can you identify in this figure?",
      options: ["6", "8", "10", "12"],
      correctAnswer: "10",
      type: "multiChoice"
    },
    {
      qid: 4,
      dimension: "spatial",
      text: "Rotate this shape 90° clockwise. Which image results?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "B",
      type: "multiChoice"
    },
    {
      qid: 5,
      dimension: "spatial",
      text: "Which view shows the top of this 3D object?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "D",
      type: "multiChoice"
    },
    {
      qid: 6,
      dimension: "spatial",
      text: "If this pattern continues, what shape comes next?",
      options: ["Circle", "Square", "Triangle", "Pentagon"],
      correctAnswer: "Pentagon",
      type: "multiChoice"
    },
    {
      qid: 7,
      dimension: "spatial",
      text: "Count the cubes in this 3D arrangement.",
      options: ["12", "15", "18", "20"],
      correctAnswer: "18",
      type: "multiChoice"
    },
    {
      qid: 8,
      dimension: "spatial",
      text: "Which piece completes the puzzle?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      type: "multiChoice"
    },
    {
      qid: 9,
      dimension: "spatial",
      text: "Determine the correct orientation after two 45° rotations.",
      options: ["A", "B", "C", "D"],
      correctAnswer: "C",
      type: "multiChoice"
    },
    {
      qid: 10,
      dimension: "spatial",
      text: "How many hidden surfaces are visible in this diagram?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "5",
      type: "multiChoice"
    },

    // DIMENSION 2: NUMERICAL FLUIDITY (Q11-Q20)
    {
      qid: 11,
      dimension: "numerical",
      text: "2, 4, 8, 16, ?, 64. What is the missing number?",
      options: ["24", "32", "36", "48"],
      correctAnswer: "32",
      type: "multiChoice"
    },
    {
      qid: 12,
      dimension: "numerical",
      text: "If 5 apples cost 150 shillings, how much do 8 apples cost?",
      options: ["200", "240", "300", "360"],
      correctAnswer: "240",
      type: "multiChoice"
    },
    {
      qid: 13,
      dimension: "numerical",
      text: "3, 6, 12, 24, ?, 96. Find the pattern.",
      options: ["36", "48", "60", "72"],
      correctAnswer: "48",
      type: "multiChoice"
    },
    {
      qid: 14,
      dimension: "numerical",
      text: "What is 15% of 200?",
      options: ["20", "25", "30", "35"],
      correctAnswer: "30",
      type: "multiChoice"
    },
    {
      qid: 15,
      dimension: "numerical",
      text: "1, 4, 9, 16, 25, ?, 49. What comes next?",
      options: ["30", "35", "36", "40"],
      correctAnswer: "36",
      type: "multiChoice"
    },
    {
      qid: 16,
      dimension: "numerical",
      text: "If a train travels 240 km in 4 hours, what is its speed?",
      options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
      correctAnswer: "60 km/h",
      type: "multiChoice"
    },
    {
      qid: 17,
      dimension: "numerical",
      text: "5, 10, 20, 40, ?, 160. Find the missing term.",
      options: ["60", "70", "80", "90"],
      correctAnswer: "80",
      type: "multiChoice"
    },
    {
      qid: 18,
      dimension: "numerical",
      text: "What is 25% of 120?",
      options: ["20", "25", "30", "35"],
      correctAnswer: "30",
      type: "multiChoice"
    },
    {
      qid: 19,
      dimension: "numerical",
      text: "2, 3, 5, 8, 13, ?, 34. What is the pattern?",
      options: ["19", "21", "23", "25"],
      correctAnswer: "21",
      type: "multiChoice"
    },
    {
      qid: 20,
      dimension: "numerical",
      text: "If 3 workers build a wall in 6 days, how long for 2 workers?",
      options: ["4 days", "6 days", "9 days", "12 days"],
      correctAnswer: "9 days",
      type: "multiChoice"
    },

    // DIMENSION 3: LINGUISTIC & CONCEPTUAL ANALYSIS (Q21-Q30)
    {
      qid: 21,
      dimension: "linguistic",
      text: "Which word is most similar to 'ancient'?",
      options: ["Modern", "Old", "Broken", "Distant"],
      correctAnswer: "Old",
      type: "multiChoice"
    },
    {
      qid: 22,
      dimension: "linguistic",
      text: "Complete: Teacher is to school as doctor is to ___.",
      options: ["Hospital", "Medicine", "Health", "Patient"],
      correctAnswer: "Hospital",
      type: "multiChoice"
    },
    {
      qid: 23,
      dimension: "linguistic",
      text: "What does 'eloquent' mean?",
      options: ["Loud", "Fluent and persuasive", "Confused", "Silent"],
      correctAnswer: "Fluent and persuasive",
      type: "multiChoice"
    },
    {
      qid: 24,
      dimension: "linguistic",
      text: "Choose the correctly spelled word.",
      options: ["Necesary", "Necessary", "Neceserry", "Necesary"],
      correctAnswer: "Necessary",
      type: "multiChoice"
    },
    {
      qid: 25,
      dimension: "linguistic",
      text: "Lion is to pride as wolf is to ___.",
      options: ["Pack", "Herd", "Flock", "Colony"],
      correctAnswer: "Pack",
      type: "multiChoice"
    },
    {
      qid: 26,
      dimension: "linguistic",
      text: "What is the main idea of this passage? [passage text here]",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option B",
      type: "multiChoice"
    },
    {
      qid: 27,
      dimension: "linguistic",
      text: "Which word is the odd one out?",
      options: ["Run", "Jump", "Walk", "Colour"],
      correctAnswer: "Colour",
      type: "multiChoice"
    },
    {
      qid: 28,
      dimension: "linguistic",
      text: "Complete: Happy is to sad as hot is to ___.",
      options: ["Warm", "Cold", "Cool", "Freezing"],
      correctAnswer: "Cold",
      type: "multiChoice"
    },
    {
      qid: 29,
      dimension: "linguistic",
      text: "What is a synonym for 'ambiguous'?",
      options: ["Clear", "Unclear", "Strong", "Weak"],
      correctAnswer: "Unclear",
      type: "multiChoice"
    },
    {
      qid: 30,
      dimension: "linguistic",
      text: "Infer: If 'All birds have wings' and 'A sparrow is a bird', then ___.",
      options: ["Sparrows fly", "Sparrows have wings", "Birds are small", "Wings are feathered"],
      correctAnswer: "Sparrows have wings",
      type: "multiChoice"
    },

    // DIMENSION 4: ABSTRACT LOGIC & INDUCTIVE THINKING (Q31-Q40)
    {
      qid: 31,
      dimension: "abstractLogic",
      text: "If all X are Y and all Y are Z, are all X definitely Z?",
      options: ["Yes", "No", "Maybe", "Insufficient info"],
      correctAnswer: "Yes",
      type: "multiChoice"
    },
    {
      qid: 32,
      dimension: "abstractLogic",
      text: "Which statement logically follows? If (P→Q) and (Q→R), then ___.",
      options: ["R→P", "P→R", "Q→P", "R→Q"],
      correctAnswer: "P→R",
      type: "multiChoice"
    },
    {
      qid: 33,
      dimension: "abstractLogic",
      text: "A, B, C, D, E, ?. What comes next in this sequence?",
      options: ["F", "A", "E", "G"],
      correctAnswer: "F",
      type: "multiChoice"
    },
    {
      qid: 34,
      dimension: "abstractLogic",
      text: "If some cats are black and some black things are cars, can we conclude some cats are cars?",
      options: ["Yes, definitely", "No, we cannot", "Maybe", "Needs more info"],
      correctAnswer: "No, we cannot",
      type: "multiChoice"
    },
    {
      qid: 35,
      dimension: "abstractLogic",
      text: "Deduction: All roses are flowers. This is a rose. Therefore ___.",
      options: ["It smells", "It is a flower", "It is red", "It blooms in spring"],
      correctAnswer: "It is a flower",
      type: "multiChoice"
    },
    {
      qid: 36,
      dimension: "abstractLogic",
      text: "Which shape should replace the question mark?",
      options: ["Circle", "Square", "Triangle", "Pentagon"],
      correctAnswer: "Pentagon",
      type: "multiChoice"
    },
    {
      qid: 37,
      dimension: "abstractLogic",
      text: "If P is true and Q is false, what is (P AND Q)?",
      options: ["True", "False", "Unknown", "Depends"],
      correctAnswer: "False",
      type: "multiChoice"
    },
    {
      qid: 38,
      dimension: "abstractLogic",
      text: "Complete the analogy: 2:4 = 3:?",
      options: ["5", "6", "8", "9"],
      correctAnswer: "6",
      type: "multiChoice"
    },
    {
      qid: 39,
      dimension: "abstractLogic",
      text: "If NOT(X OR Y), then which is true?",
      options: ["X is true", "Y is true", "Both X and Y are false", "At least one is true"],
      correctAnswer: "Both X and Y are false",
      type: "multiChoice"
    },
    {
      qid: 40,
      dimension: "abstractLogic",
      text: "Induction: Crow is black. Raven is black. Magpie is dark. Therefore ___.",
      options: ["All birds are black", "Some black birds are corvids", "Birds tend to be dark", "Everything is black"],
      correctAnswer: "Some black birds are corvids",
      type: "multiChoice"
    },

    // DIMENSION 5: MECHANICAL & PHYSICAL INTUITION (Q41-Q50)
    {
      qid: 41,
      dimension: "mechanical",
      text: "If you push a box on a frictionless surface, it will ___.",
      options: ["Stop immediately", "Accelerate indefinitely", "Move at constant velocity", "Slow down gradually"],
      correctAnswer: "Move at constant velocity",
      type: "multiChoice"
    },
    {
      qid: 42,
      dimension: "mechanical",
      text: "A lever with a longer arm provides ___.",
      options: ["Less mechanical advantage", "More mechanical advantage", "No advantage", "Disadvantage"],
      correctAnswer: "More mechanical advantage",
      type: "multiChoice"
    },
    {
      qid: 43,
      dimension: "mechanical",
      text: "What happens when you increase tension in a rope?",
      options: ["It stretches more", "Stress increases", "Breaking point decreases", "Elasticity changes"],
      correctAnswer: "Stress increases",
      type: "multiChoice"
    },
    {
      qid: 44,
      dimension: "mechanical",
      text: "In a pulley system, if you have 4 supporting ropes, the mechanical advantage is ___.",
      options: ["2", "3", "4", "8"],
      correctAnswer: "4",
      type: "multiChoice"
    },
    {
      qid: 45,
      dimension: "mechanical",
      text: "When a ball is thrown upward, at the peak of its motion, the velocity is ___.",
      options: ["Maximum", "Zero", "Negative", "Constant"],
      correctAnswer: "Zero",
      type: "multiChoice"
    },
    {
      qid: 46,
      dimension: "mechanical",
      text: "Friction force depends on which factors?",
      options: ["Only surface texture", "Normal force and texture", "Only speed", "Only weight"],
      correctAnswer: "Normal force and texture",
      type: "multiChoice"
    },
    {
      qid: 47,
      dimension: "mechanical",
      text: "A gear with twice the radius rotates at ___.",
      options: ["Twice the speed", "Half the speed", "Same speed", "Variable speed"],
      correctAnswer: "Half the speed",
      type: "multiChoice"
    },
    {
      qid: 48,
      dimension: "mechanical",
      text: "When you apply force to a hydraulic press, the output force is ___.",
      options: ["Less", "Equal", "Greater", "Unpredictable"],
      correctAnswer: "Greater",
      type: "multiChoice"
    },
    {
      qid: 49,
      dimension: "mechanical",
      text: "Center of gravity affects ___.",
      options: ["Speed only", "Stability and balance", "Color only", "Size only"],
      correctAnswer: "Stability and balance",
      type: "multiChoice"
    },
    {
      qid: 50,
      dimension: "mechanical",
      text: "In circular motion, centripetal force acts ___.",
      options: ["Outward", "Tangentially", "Toward the center", "Randomly"],
      correctAnswer: "Toward the center",
      type: "multiChoice"
    },

    // DIMENSION 6: FOCUS ENDURABILITY & PACING (Q51-Q60)
    // These test reaction speed, consistency, and fatigue resistance
    {
      qid: 51,
      dimension: "focusEndurance",
      text: "Quick: What is 5 + 3?",
      options: ["6", "7", "8", "9"],
      correctAnswer: "8",
      type: "multiChoice"
    },
    {
      qid: 52,
      dimension: "focusEndurance",
      text: "Quick: Is a tomato a fruit?",
      options: ["Yes", "No", "Sometimes", "Unclear"],
      correctAnswer: "Yes",
      type: "multiChoice"
    },
    {
      qid: 53,
      dimension: "focusEndurance",
      text: "Quick: Spell 'necessary' correctly.",
      options: ["Necessary", "Necesary", "Neceserry", "Necessry"],
      correctAnswer: "Necessary",
      type: "multiChoice"
    },
    {
      qid: 54,
      dimension: "focusEndurance",
      text: "Quick: 2 × 6 = ?",
      options: ["10", "12", "14", "16"],
      correctAnswer: "12",
      type: "multiChoice"
    },
    {
      qid: 55,
      dimension: "focusEndurance",
      text: "Quick: Capital of Kenya?",
      options: ["Mombasa", "Nairobi", "Kisumu", "Nakuru"],
      correctAnswer: "Nairobi",
      type: "multiChoice"
    },
    {
      qid: 56,
      dimension: "focusEndurance",
      text: "Quick: What is 50 ÷ 5?",
      options: ["8", "9", "10", "11"],
      correctAnswer: "10",
      type: "multiChoice"
    },
    {
      qid: 57,
      dimension: "focusEndurance",
      text: "Quick: Is a penguin a mammal?",
      options: ["Yes", "No", "Maybe", "Unknown"],
      correctAnswer: "No",
      type: "multiChoice"
    },
    {
      qid: 58,
      dimension: "focusEndurance",
      text: "Quick: 3² = ?",
      options: ["6", "9", "12", "15"],
      correctAnswer: "9",
      type: "multiChoice"
    },
    {
      qid: 59,
      dimension: "focusEndurance",
      text: "Quick: Which is larger, 0.5 or 0.05?",
      options: ["0.5", "0.05", "Equal", "Unclear"],
      correctAnswer: "0.5",
      type: "multiChoice"
    },
    {
      qid: 60,
      dimension: "focusEndurance",
      text: "Quick: What is 100 - 37?",
      options: ["60", "63", "65", "70"],
      correctAnswer: "63",
      type: "multiChoice"
    },
  ];

  // ---- SCORING ENGINE (uses pre-recorded rawScoresArray) ----
  BT.scoreAnswers = function () {
    var scores = { spatial: 0, numerical: 0, linguistic: 0, abstractLogic: 0, mechanical: 0, focusEndurance: 0 };
    
    // Tally correct answers by dimension (rawScoresArray already populated during test)
    BT.state.answers.forEach(function (ans) {
      var q = BT.questions[ans.qid - 1];
      var dimKey = q.dimension;
      scores[dimKey] += ans.isCorrect;
    });

    BT.state.scores = scores;
    return scores;
  };

  // ---- QUESTION TIMING ----
  BT.startQuestionTimer = function () {
    BT.state.questionStartTime = Date.now();
  };

  BT.recordAnswer = function (answerValue) {
    var responseTime = Date.now() - (BT.state.questionStartTime || Date.now());
    var qIdx = BT.state.currentQuestion;
    var q = BT.questions[qIdx];
    var isCorrect = answerValue === q.correctAnswer ? 1 : 0;

    BT.state.answers.push({
      qid: qIdx + 1,
      answer: answerValue,
      responseTimeMs: responseTime,
      isCorrect: isCorrect,
    });
    BT.state.responsePacingMs.push(responseTime);
    BT.state.rawScoresArray.push(isCorrect);

    return isCorrect;
  };

  // ---- PACING VALIDATION (anti-cheat) ----
  BT.validatePacing = function () {
    if (BT.state.responsePacingMs.length === 0) return "valid";
    var totalTime = BT.state.responsePacingMs.reduce(function (a, b) { return a + b; }, 0);
    var avgTime = totalTime / BT.state.responsePacingMs.length;
    // flag if total time < 20 seconds (obvious bot) or extreme variance
    if (totalTime < 20000) {
      BT.state.isValid = false;
      return "Inauthentic Test Pattern Exception: suspiciously fast completion";
    }
    if (avgTime < 100) {
      BT.state.isValid = false;
      return "Inauthentic Test Pattern Exception: sub-100ms average response";
    }
    return "valid";
  };

  // ---- REPORT PAYLOAD (for report engine) ----
  BT.generateReportPayload = function () {
    BT.scoreAnswers();
    BT.validatePacing();
    return {
      sessionId: BT.state.sessionId,
      accountType: BT.state.accountType,
      userId: BT.state.userId,
      startedAt: BT.state.startedAt,
      completedAt: BT.state.completedAt,
      totalDurationSeconds: (BT.state.completedAt - BT.state.startedAt) / 1000,
      scores: BT.state.scores,
      rawScoresArray: BT.state.rawScoresArray,
      responsePacingMs: BT.state.responsePacingMs,
      isValid: BT.state.isValid,
      message: BT.validatePacing(),
    };
  };

  // ---- UI SCAFFOLDING (to be wired later) ----
  BT.render = function () {
    // placeholder: will be wired to render individual questions
    return '<div>Brain Test UI (scaffolded, logic to be wired)</div>';
  };

  BT.init = function (config) {
    BT.state.sessionId = config.sessionId || "session_" + Date.now();
    BT.state.accountType = config.accountType || "personal";
    BT.state.userId = config.userId || null;
    BT.state.startedAt = Date.now();
    BT.state.answers = [];
    BT.state.responsePacingMs = [];
  };

  console.log("✅ Brain Test Module Loaded — 60 questions, 6 dimensions, scaffolded");

})(window.OCRA);
