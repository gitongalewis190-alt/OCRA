#!/usr/bin/env bash
# ============================================================
#  OCRA — GO LIVE
#  One command to ship the current branch to production.
#
#  Usage:  bash scripts/go-live.sh
#
#  What it does:
#    1. Runs source validation + smoke tests (hard gate).
#    2. Fast-forwards `main` to the current branch's work.
#    3. Pushes `main`, which triggers .github/workflows/deploy.yml
#       and publishes to GitHub Pages.
#    4. Returns you to your working branch.
#
#  Trigger phrase: when the owner says "let's go live", run this.
# ============================================================
set -euo pipefail

ORIGIN="origin"
MAIN="main"
CURRENT="$(git rev-parse --abbrev-ref HEAD)"

echo "▶ OCRA go-live from branch: $CURRENT"

# 1. Gate — never deploy a red build
echo "▶ Validating sources + smoke tests…"
node scripts/validate-sources.mjs
node scripts/smoke-test.mjs

# 2. Make sure the working branch is pushed
git push -u "$ORIGIN" "$CURRENT"

# 3. Bring main up to this branch and push (triggers Pages deploy)
echo "▶ Updating $MAIN…"
git fetch "$ORIGIN" "$MAIN" || true
git checkout "$MAIN"
git merge --no-ff "$CURRENT" -m "deploy: go live — merge $CURRENT into $MAIN"
git push "$ORIGIN" "$MAIN"

# 4. Back to where you were
git checkout "$CURRENT"

echo "✅ Pushed to $MAIN. GitHub Actions is now building & deploying to Pages."
echo "   Live URL: https://gitongalewis190-alt.github.io/OCRA/"
