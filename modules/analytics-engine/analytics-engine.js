/* ============================================================
   ANALYTICS ENGINE MODULE
   Percentile ranking, z-score normalisation, growth trends,
   performance forecasting, cohort comparison.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  var AE = (O.analyticsEngine = {});

  // ---- POPULATION BENCHMARKS (seeded, replaced by real cohort data later) ----
  AE.benchmarks = {
    brainTest: {
      spatial:        { mean: 5.8, stdDev: 1.9 },
      numerical:      { mean: 6.1, stdDev: 2.0 },
      linguistic:     { mean: 5.5, stdDev: 2.1 },
      abstractLogic:  { mean: 5.6, stdDev: 1.8 },
      mechanical:     { mean: 5.3, stdDev: 2.2 },
      focusEndurance: { mean: 6.4, stdDev: 1.7 },
    },
    academics: {
      mathematics:    { mean: 62, stdDev: 18 },
      physics:        { mean: 58, stdDev: 19 },
      chemistry:      { mean: 60, stdDev: 17 },
      mechanics:      { mean: 55, stdDev: 20 },
    },
  };

  // ---- Z-SCORE ----
  AE.zScore = function (value, mean, stdDev) {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  };

  // ---- PERCENTILE (approximation via CDF of normal distribution) ----
  AE.percentile = function (z) {
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    var cdf = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
    return z >= 0 ? Math.round(cdf * 100) : Math.round((1 - cdf) * 100);
  };

  // ---- SCORE ANALYSIS ----
  AE.analyseScores = function (scores, domain) {
    var bench = AE.benchmarks[domain] || {};
    var result = {};
    Object.keys(scores).forEach(function (key) {
      var b = bench[key];
      if (!b) { result[key] = { score: scores[key], z: null, percentile: null }; return; }
      var z = AE.zScore(scores[key], b.mean, b.stdDev);
      result[key] = {
        score: scores[key],
        z: parseFloat(z.toFixed(2)),
        percentile: AE.percentile(z),
        label: AE.performanceLabel(z),
      };
    });
    return result;
  };

  AE.performanceLabel = function (z) {
    if (z >= 1.5) return "Exceptional";
    if (z >= 0.5) return "Above Average";
    if (z >= -0.5) return "Average";
    if (z >= -1.5) return "Below Average";
    return "Needs Support";
  };

  // ---- GROWTH TREND ----
  AE.growthTrend = function (termScores) {
    // termScores: array of numbers (most recent last)
    if (!termScores || termScores.length < 2) return { direction: "stable", delta: 0, forecast: termScores ? termScores[termScores.length - 1] : 0 };
    var n = termScores.length;
    var latest = termScores[n - 1];
    var prev = termScores[n - 2];
    var delta = latest - prev;
    var avgDelta = (latest - termScores[0]) / (n - 1);
    var forecast = Math.min(100, Math.max(0, latest + avgDelta));
    return {
      direction: delta > 2 ? "rising" : delta < -2 ? "falling" : "stable",
      delta: parseFloat(delta.toFixed(1)),
      forecast: parseFloat(forecast.toFixed(1)),
      momentum: parseFloat(avgDelta.toFixed(1)),
    };
  };

  // ---- CAREER READINESS SCORE (CRS) ----
  AE.careerReadinessScore = function (brainScores, academics, careerRequirements) {
    var total = 0, count = 0;
    careerRequirements.forEach(function (dim) {
      var score = brainScores[dim] || 0;
      var max = 10;
      total += (score / max) * 100;
      count++;
    });
    return count > 0 ? Math.round(total / count) : 0;
  };

  // ---- FULL STUDENT ANALYSIS ----
  AE.analyse = function (brainPayload, academics) {
    var brainAnalysis = AE.analyseScores(brainPayload.scores || {}, "brainTest");
    var acadAnalysis = AE.analyseScores(academics || {}, "academics");

    var totalBrain = Object.values(brainPayload.scores || {}).reduce(function (a, b) { return a + b; }, 0);
    var brainPercentile = AE.percentile(AE.zScore(totalBrain, 34, 8));

    return {
      brainTest: brainAnalysis,
      academics: acadAnalysis,
      overall: {
        totalBrainScore: totalBrain,
        brainPercentile: brainPercentile,
        brainPerformanceLabel: AE.performanceLabel(AE.zScore(totalBrain, 34, 8)),
      },
      growth: AE.growthTrend(O.data ? [O.data.growth.all[0], O.data.growth.all[1], O.data.growth.all[2]] : [60, 65, 70]),
    };
  };

  console.log("✅ Analytics Engine Loaded · z-scores, percentiles, growth trends, CRS");

})(window.OCRA);
