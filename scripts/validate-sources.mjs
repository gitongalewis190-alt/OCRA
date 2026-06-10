#!/usr/bin/env node
/* ============================================================
   validate-sources.mjs
   Guards every browser script in js/ before it can reach the
   live site. Two checks:
     1. Regression guard — the live-display bug was caused by a
        file saved as a raw JSON API blob ({"returncode":...,
        "stdout":"...the real code..."}) instead of JavaScript.
        We refuse to ship any file that looks like that.
     2. Syntax check — `node --check` parses each file so a stray
        token can never silently blank the page again.
   Run with: npm run validate   (or: node scripts/validate-sources.mjs)
   ============================================================ */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}

const files = walk("js");
let failed = false;

for (const f of files) {
  const src = readFileSync(f, "utf8");

  // 1. Regression guard: reject raw JSON-API-response files.
  const head = src.trimStart();
  if (head.startsWith("{") && /"returncode"\s*:/.test(src) && /"stdout"\s*:/.test(src)) {
    console.error(`✗ ${f}: looks like a raw JSON API response, not JavaScript ` +
      `(this is the exact bug that blanked the live site)`);
    failed = true;
    continue;
  }

  // 2. Syntax check (parse only — browser globals are never executed).
  try {
    execFileSync(process.execPath, ["--check", f], { stdio: "pipe" });
    console.log(`✓ ${f}`);
  } catch (e) {
    const msg = (e.stderr && e.stderr.toString()) || e.message;
    console.error(`✗ ${f}: syntax error\n${msg}`);
    failed = true;
  }
}

if (failed) {
  console.error("\nValidation FAILED — fix the files above before deploying.");
  process.exit(1);
}
console.log(`\nValidation passed: ${files.length} script(s) are clean.`);
