#!/usr/bin/env node
/* ============================================================
   smoke-test.mjs — Headless render check for every OCRA screen.
   Requires jsdom (devDependency). Run with: npm test
   ============================================================ */
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const dom = new JSDOM(readFileSync("index.html", "utf8"), { runScripts: "outside-only" });
const { window } = dom;

// Minimal browser-global shims needed for the module IIFEs.
globalThis.window   = window;
globalThis.document = window.document;

for (const f of ["js/core.js","js/identity.js","js/screens.js","js/dashboards.js","js/app.js"]) {
  window.eval(readFileSync(f, "utf8"));
}

const O   = window.OCRA;
const app = () => window.document.getElementById("app").innerHTML;

let passed = 0, failed = 0;
function assert(label, cond) {
  if (cond) { console.log("  ✓", label); passed++; }
  else       { console.error("  ✗", label); failed++; process.exitCode = 1; }
}

console.log("\n── Render smoke test ──────────────────────────────");

// Intro (initial state)
assert("intro screen renders",          app().includes("diveIn"));
assert("O.fail defined",                typeof O.fail === "function");

// Entry-flow screens
O.go({ phase: "choose" });
assert("choose screen",                 app().includes("academics"));

O.go({ phase: "account" });
assert("account screen",                app().includes("pickAccount"));

O.go({ phase: "auth", authMode: "login" });
assert("login screen (data-auth)",      app().includes("data-auth"));

O.go({ phase: "auth", authMode: "signup" });
assert("signup screen",                 app().includes("signupNext"));

// All four dashboards
for (const d of ["personal", "family", "organization", "developer"]) {
  O.go({ phase: "dash", dash: d });
  assert(`dashboard: ${d}`,             app().length > 1000);
}

// Error surface
O.fail(new Error("sentinel-error"));
assert("error banner renders",          app().includes("OCRA hit a snag"));
assert("error message is shown",        app().includes("sentinel-error"));

// Restart clears the error and returns to intro
O.go({ phase: "intro", signupStage: 1, form: {} });
assert("restart from error goes home",  app().includes("diveIn"));

// Unknown phase renders an empty stage without throwing
O.go({ phase: "nonexistent" });
assert("unknown phase: no crash",       app().includes("stage"));

console.log(`\n── Result: ${passed} passed, ${failed} failed ──────────────────`);
if (failed) console.error("SMOKE TEST FAILED\n");
else        console.log("SMOKE TEST PASSED\n");
