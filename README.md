# OCRA — Optimised Career & Results Analytics

> Reads academic records and cognitive signals to decode each learner's potential and map it to real career paths.

## Live site

**`https://gitongalewis190-alt.github.io/OCRA/`**

GitHub Pages is configured via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).  
Every push to `main` that passes CI is automatically published.

## What it is

A zero-dependency, static analytics dashboard:

| Screen | Description |
|--------|-------------|
| Intro  | Branded landing with 5-second hold for developer access |
| Choose | Academics / Finances gateway |
| Account | Personal · Family · Organization selector |
| Auth   | Multi-stage signup (4 steps) and login |
| Dashboards | Personal · Family · Organization · Developer consoles |

All state lives in `OCRA.state` (in-memory). No frameworks, no build step.

## Project layout

```
OCRA/
├── index.html             Entry point
├── css/
│   ├── tokens.css         Design tokens (colours, glass-morphism variables)
│   └── layout.css         Responsive grid + component styles
├── js/
│   ├── core.js            Global state, render bus, router, charts, logo
│   ├── identity.js        Auth, signup stages, O.bindHold (dev hold-to-reveal)
│   ├── screens.js         Entry-flow renderers (intro/choose/account/auth)
│   ├── dashboards.js      Dashboard renderers (personal/family/org/developer)
│   └── app.js             Bootstrap: spin animation, global error guard, O.render()
└── scripts/
    ├── validate-sources.mjs  Syntax check + JSON-wrapper regression guard
    └── smoke-test.mjs        Headless render test (jsdom) for every screen
```

## Running locally

```bash
npm run serve          # python3 -m http.server 8000  →  http://localhost:8000
```

No build needed — open `index.html` directly in a browser or through any static file server.

## Tests

```bash
npm install            # install jsdom (dev-only, never shipped)
npm test               # validate syntax + full headless render smoke test
```

CI runs this on every push and every pull request.

## Deployment

Merging to `main` triggers `.github/workflows/deploy.yml` which:

1. Runs `npm test` (validates sources + smoke test)
2. Uploads the repo root as a GitHub Pages artifact
3. Deploys to `https://gitongalewis190-alt.github.io/OCRA/`

**One-time setup (first deploy):**  
Repo → Settings → Pages → Source: **GitHub Actions**

## Architecture notes

- **Single source of truth:** `OCRA.state` — all navigation mutates this and calls `O.render()`.
- **Render bus:** `O.render()` wraps all rendering in a `try/catch`; any error surfaces a visible banner (`O.fail`) instead of a blank page.
- **Error guard in bootstrap:** `app.js` validates that the core API loaded before calling `O.render()` — catches the exact failure mode that caused the original blank-page bug (JS files saved as JSON blobs).
- **No inline event handlers** except the signup checkbox (isolated, low-risk).
- **Backend seam:** `identity.js` has clearly-marked stubs for Firebase Auth / FastAPI endpoints — replace `I.store()` and `I.login()` bodies to go live.

## Bug history

| Commit | Bug | Impact |
|--------|-----|--------|
| `a2ad4f8` | `core.js`, `identity.js`, `screens.js`, `dashboards.js` were saved as raw JSON API responses (`{"returncode":0,"stdout":"..."}`) instead of plain JS. Browser threw `Unexpected token ':'` on load. | Blank page — nothing rendered |

The regression guard in `scripts/validate-sources.mjs` detects this pattern and blocks deployment.
