#!/usr/bin/env node
/* ============================================================
   smoke-test.mjs — Headless render check for every OCRA screen.
   Requires jsdom (devDependency). Run with: npm test
   ============================================================ */
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const dom = new JSDOM(readFileSync("index.html", "utf8"), { runScripts: "outside-only" });
const { window } = dom;

globalThis.window   = window;
globalThis.document = window.document;

// Safety net: jsdom can leave open handles that prevent Node from exiting,
// which would hang CI until the run is cancelled. Never let this process
// outlive the assertions. The timer is unref'd so it can't itself keep us alive.
setTimeout(() => {
  console.error("\nSMOKE TEST TIMED OUT (30s) — forcing exit\n");
  process.exit(1);
}, 30000).unref();

// localStorage mock (jsdom's window.localStorage is a getter — must use defineProperty)
const _store = {};
const _ls = {
  getItem:    (k) => Object.prototype.hasOwnProperty.call(_store, k) ? _store[k] : null,
  setItem:    (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
  clear:      () => { Object.keys(_store).forEach(k => delete _store[k]); },
};
globalThis.localStorage = _ls;
Object.defineProperty(window, "localStorage", { value: _ls, writable: true });

const coreModules = [
  "js/core.js",
  "js/identity.js",
  "js/screens.js",
  "js/dashboards.js",
  // modules (order matters — same as index.html)
  "modules/notifications/notifications.js",
  "modules/data-management/data-management.js",
  "modules/analytics-engine/analytics-engine.js",
  "modules/ai-insights/ai-insights.js",
  "modules/report-engine/report-engine.js",
  "modules/brain-test/brain-test.js",
  "modules/brain-test/brain-test-ui.js",
  "modules/intake-form/intake-form.js",
  "modules/academic-records/academic-records.js",
  "modules/payment/payment.js",
  "modules/pdf-export/pdf-export.js",
  "modules/developer-console/developer-console.js",
  "modules/auth/auth.js",
  "js/app.js",
];

for (const f of coreModules) {
  try {
    window.eval(readFileSync(f, "utf8"));
  } catch (e) {
    console.error("LOAD ERROR in " + f + ":", e.message);
    process.exitCode = 1;
  }
}

const O   = window.OCRA;
const app = () => window.document.getElementById("app").innerHTML;

let passed = 0, failed = 0;
function assert(label, cond) {
  if (cond) { console.log("  ✓", label); passed++; }
  else       { console.error("  ✗", label); failed++; process.exitCode = 1; }
}

console.log("\n── Render smoke test ──────────────────────────────");

// Initial state
assert("intro screen renders",          app().includes("diveIn"));
assert("O.fail defined",                typeof O.fail === "function");

// Entry-flow screens
O.go({ phase: "choose" });
assert("choose screen",                 app().includes("academics"));

O.go({ phase: "account" });
assert("account screen",                app().includes("pickAccount"));

O.go({ phase: "auth", authMode: "login" });
assert("login screen",                  app().includes("data-auth"));

O.go({ phase: "auth", authMode: "signup" });
assert("signup screen",                 app().includes("signupNext"));

// Brain Test start screen
O.go({ phase: "brainTestStart" });
assert("brainTestStart screen",         app().includes("brainTestBegin"));

// Intake form
O.go({ phase: "intake" });
assert("intake screen",                 app().includes("intakeNext"));

// Academic records entry
O.go({ phase: "academicEntry" });
assert("academicEntry screen",          app().includes("academicEntryNext"));

// Payment gate
O.go({ phase: "payment", paymentPending: { docType: "transcript", amount: 40 } });
assert("payment screen",                app().includes("paymentMpesa"));

// All four dashboards
for (const d of ["personal", "family", "organization", "developer"]) {
  O.go({ phase: "dash", dash: d });
  assert("dashboard: " + d,            app().length > 500);
}

// Brain test flow
O.state.user = { email: "test@ocra.app", firstName: "Test" };
O.brainTest.init({ sessionId: "smoke_test", accountType: "personal", userId: "test@ocra.app" });
O.go({ phase: "brainTest", brainTestPhase: "test" });
assert("brainTest question screen",     app().includes("brainTestAnswer"));

// Brain test results (after faking all answers)
for (var qi = 0; qi < 60; qi++) {
  var q = O.brainTest.questions[qi];
  O.brainTest.recordAnswer(q.correctAnswer);
  O.brainTest.state.currentQuestion++;
}
O.brainTest.state.completedAt = Date.now();
O.go({ phase: "brainTest", brainTestPhase: "results" });
assert("brainTest results screen",      app().includes("brainTestToReport") || app().includes("Generate"));

// Report engine
O.brainTest.scoreAnswers();
var payload = O.brainTest.generateReportPayload();
O.reportEngine.generateAllReports(payload, {}, O.state.user);
O.go({ phase: "reportView", reportPhase: "summary" });
assert("reportView summary screen",     app().includes("viewReportDoc") || app().includes("Reports Are Ready"));

O.go({ phase: "reportView", reportPhase: "detail", currentDoc: "transcript" });
assert("reportView detail screen",      app().includes("Transcript") || app().includes("exportReportPDF"));

// Error surface
O.fail(new Error("sentinel-error"));
assert("error banner renders",          app().includes("OCRA hit a snag"));
assert("error message shown",           app().includes("sentinel-error"));

// Restart
O.go({ phase: "intro", signupStage: 1, form: {} });
assert("restart from error goes home",  app().includes("diveIn"));

// Unknown phase
O.go({ phase: "nonexistent_phase_xyz" });
assert("unknown phase: no crash",       app().includes("stage"));

// Module health
assert("O.brainTest loaded",            typeof O.brainTest === "object");
assert("O.reportEngine loaded",         typeof O.reportEngine === "object");
assert("O.intakeForm loaded",           typeof O.intakeForm === "object");
assert("O.academicRecords loaded",      typeof O.academicRecords === "object");
assert("O.payment loaded",              typeof O.payment === "object");
assert("O.aiInsights loaded",           typeof O.aiInsights === "object");
assert("O.analyticsEngine loaded",      typeof O.analyticsEngine === "object");
assert("O.dataManagement loaded",       typeof O.dataManagement === "object");
assert("O.notifications loaded",        typeof O.notifications === "object");
assert("O.pdfExport loaded",            typeof O.pdfExport === "object");
assert("O.developerConsole loaded",     typeof O.developerConsole === "object");
assert("O.auth loaded",                 typeof O.auth === "object");

// Auth: sign up a test user
var signedUp = false, signupErr = null;
O.auth.signUp("personal",
  { first: "Test", last: "User", email: "test_smoke@ocra.app", password: "Smoke#Test9", dob: "2005-01-01", agreed: true },
  function () { signedUp = true; },
  function (e) { signupErr = e; }
);
assert("auth: signup creates session",  signedUp && !signupErr);
assert("auth: session user set",        O.state.user && O.state.user.email === "test_smoke@ocra.app");
assert("auth: isLoggedIn returns true", O.auth.isLoggedIn());

// Auth: log in
var loggedIn = false, loginErr = null;
O.auth.logIn("test_smoke@ocra.app", "Smoke#Test9",
  function () { loggedIn = true; },
  function (e) { loginErr = e; }
);
assert("auth: login with correct password", loggedIn && !loginErr);

// Auth: wrong password
var badLogin = false;
O.auth.logIn("test_smoke@ocra.app", "wrongpassword",
  function () { badLogin = true; },
  function () {}
);
assert("auth: rejects wrong password",  !badLogin);

// Developer bypass
O.auth.logIn("gitongalewis190@gmail.com", "anypassword",
  function (user) { O.state.user = user; },
  function () {}
);
assert("developer bypasses payment",    O.payment.isDeveloper());

console.log("\n── Result: " + passed + " passed, " + failed + " failed ──────────────────");
if (failed) console.error("SMOKE TEST FAILED\n");
else        console.log("SMOKE TEST PASSED\n");

// Tear down jsdom and force a deterministic exit. Without this the pending
// in-app timers (e.g. the notifications welcome toast) keep the event loop
// alive on CI, hanging the deploy until it gets cancelled.
try { window.close(); } catch (e) {}
process.exit(failed ? 1 : 0);
