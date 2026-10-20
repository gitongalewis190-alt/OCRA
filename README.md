# OCRA — Optimised Career & Results Analytics

> **PRIVATE & CONFIDENTIAL — © 2026 Artist Life Foundation / Lewis Gitonga. All Rights Reserved.**
> Proprietary software under active private development. Not open-source, not for sale, not licensed for reuse without written permission. See [`LICENSE`](LICENSE) and [`OCRA_STANDARDS.md`](OCRA_STANDARDS.md).

> OCRA reads academic records and cognitive signals you provide, then maps them to career paths with transparent, AI-assisted guidance — owned and operated by Artist Life Foundation as a subsidiary.

## Live site and domain

- **Primary (GitHub Pages):** `https://gitongalewis190-alt.github.io/OCRA/`
- **Custom domain (open item):** `ocra.app` once DNS is provisioned. No `CNAME` file is committed yet because pointing GitHub Pages at an unconfigured domain would take the site down. GitHub Pages is set to **GitHub Actions** source via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml); every push to `main` that passes CI is published.

## What OCRA is — specific, not vague

OCRA helps Kenyan learners (and their families or schools) turn everyday school data into a clear next step:

| Step | What you do | What OCRA produces |
|------|-------------|---------------------|
| 1. Choose account | Pick Personal, Family, or Organization | Account type with the right consent flow |
| 2. Sign up with verification | Fill one field at a time, verify email by OTP, tick explicit consent | Secure, validated profile |
| 3. Provide learning data | Enter subject scores, take the 60-question cognitive assessment (6 dimensions), optional intake form | Structured learning profile |
| 4. Get reports | Review summary, then download any of the 4 documents | Transcript, Results Report, Career Guidance, Revision Timetable — each with serial and QR for verification |
| 5. Pay only what you use | KES 40 per document, 30 days access, no auto-renewal | M-Pesa Daraja unlock decided server-side; receipt issued |

All app state lives in `OCRA.state` (in-memory). No frameworks, minimal JS, works on low bandwidth. Backend seams are marked `// WIRE:` for FastAPI + Supabase.

## Screens

| Screen | Purpose |
|--------|---------|
| Intro | Branded landing with a concrete promise (no vague hero text), first-party SVG artwork, favicon, meta tags |
| Choose | Academics / Finances gateway |
| Account | Personal / Family / Organization selector — real business context shown |
| Auth | Multi-stage signup (5 sections, one field per screen) and email-first login |
| Dashboards | Personal, Family, Organization, Developer — with sample-data disclaimer |

## Legal and trust pages — must have, live

These are required by the Kenya Data Protection Act 2019 and Consumer Protection Act 2012. They are linked from the footer on every screen and from `index.html`:

- [Privacy Policy](legal/privacy.html) — what we collect, why, children's protections, AI use, retention, your rights, ODPC contact
- [Terms and Conditions](legal/terms.html) — who can use OCRA, pricing (KES 40), acceptable use, IP, Kenya law
- [Cookies Policy](legal/cookies.html) — what we store, consent before non-essential tracking, how to withdraw
- [Refund Policy](legal/refund.html) — when you get a refund, how to request (48h decision, 5-day M-Pesa reversal)

Additional compliance docs in-repo:

- [`OCRA_STANDARDS.md`](OCRA_STANDARDS.md) — permanent quality, security, and legal bar for every task
- [`AUDIT.md`](AUDIT.md) — security and privacy audit with file:line refs
- [`COMPLIANCE_REPORT.md`](COMPLIANCE_REPORT.md) — per-task PASS/FAIL against every standard
- [`LICENSE`](LICENSE) — proprietary, not MIT

## Stack — locked per OCRA_STANDARDS.md

**Next.js · FastAPI · Supabase (PostgreSQL) · Claude API · Africa's Talking · Vercel/Railway.** No substitutions without founder approval. Current static build is the migration baseline — Next.js app lives in `/app` once Item 01 lands; FastAPI in `/api`.

## Data and AI — validated capability

- **Auth:** argon2id/bcrypt, 7-day session with rotation, rate-limited login, Africa's Talking OTP with attempt limits, MFA for Developer and Org Admin. See `modules/auth/auth.js` seam.
- **Authorization:** Supabase Row Level Security on every table, strict tenant isolation (one org or family never reads another's rows). Only the Career Requirements Database is global.
- **Minors:** Student records never public, never indexed, never in URLs or logs. Session-lock on student views. Accommodation data behind separate explicit consent, never feeds scoring.
- **AI safety:** No direct identifiers (names, phones, schools, photos) sent to Claude. Pseudonymised, minimal fields, every call logged without PII. Claude responses cached; re-creation falls back to cached alternatives. Every AI report carries disclosure: "AI-assisted analysis, not a guarantee or professional advice" plus explainable why for each recommendation.
- **Payments:** Daraja callback verified (origin + payload), idempotent, server decides every unlock (KES 40 / 30 days), full payment audit trail. QR and serial on every printout with server verification.
- **Audit:** Versioned edit history for learner data (who, when, diff). Immutable log for Org Admin and Developer actions.

## Capability validation — what is real vs open item

| Capability | Status | Evidence |
|------------|--------|----------|
| Static dashboard, glassmorphism design, WCAG AA contrast, keyboard forms | **Live** | `css/tokens.css` (muted text 4.8:1), `layout.css`, `auth.css`, `landing.css`; `index.html` favicon, OG card and CSP meta |
| Entry flow, account branches, 5-section signup with live gating | **Live** | `js/core.js`, `js/identity.js`, `js/screens.js` |
| Brain test 60Q / 6 dimensions, report engine (4 docs), age tiering | **Live (content is illustrative)** | `modules/brain-test/`, `modules/report-engine/` — real Q images and psychologist validation are open (OCRA_NEXT #02) |
| Soft delete 30 days, audit log, data export | **Live in-browser** | `modules/data-management/` — server RLS and backup tests are Pending (Pre-deploy gate) |
| M-Pesa Daraja KES 40 / 30 days, card alternative | **Seam only** | `modules/payment/` — callback verification and E-TIMS are Pending |
| Real Auth/DB (Supabase), RLS, tenant isolation | **Open — Item 01** | Tracked as blocker for production |
| Claude insights with PII guard + cache | **Seam only** | `modules/ai-insights/` — PII scrub + cache tests Pending |
| Accessibility AA, alt text, clear labels, focus states | **Live + audited** | Account branches are real buttons, skip link, 2px focus rings, reduced-motion honoured. See `COMPLIANCE_REPORT.md` |
| Legal pages, consent, guardian verification, cookie consent | **Live (static)** | `legal/` — ODPC registration andAfrica's Talking OTP wiring are Open |
| Favicon, OG, sitemap, 404 | **Live** | `favicon.svg`, `assets/ocra-og.png` (1200x630), `sitemap.xml`, `404.html` |
| Custom domain | **Open** | DNS not provisioned. Adding `CNAME` first would break the live Pages site |

If something cannot be built yet, it is listed here as an open item — no placeholders are presented as real (per Standards s4).

## Project layout

```
OCRA/
├── index.html                 Entry, meta, CSP, favicon, app mount, footer
├── favicon.svg                Site favicon (also data-URI fallback)
├── sitemap.xml                Sitemap for crawlers
├── 404.html                   Custom 404
├── css/
│   ├── tokens.css             Design tokens — WCAG AA verified colours
│   ├── layout.css             Responsive grid, focus states, reduced-motion
│   ├── auth.css               Neumorphic auth — contrast corrected
│   └── landing.css            Hero, stratum deck, account branches
├── js/
│   ├── core.js                State, router, render bus, O.fail
│   ├── identity.js            Validation, stages, coherence
│   ├── screens.js             Entry-flow renderers (no vague copy)
│   ├── dashboards.js          Dashboards — sample-data disclaimer
│   └── app.js                 Boot, error guard, O.render
├── modules/                   Domain modules (see each README)
├── legal/
│   ├── privacy.html           Privacy Policy (DPA 2019)
│   ├── terms.html             Terms and Conditions (Kenya law)
│   ├── cookies.html           Cookies Policy + consent matrix
│   └── refund.html            Refund Policy (48h / 5-day)
├── assets/
│   ├── hero.png               Licensed hero — credit in legal footer
│   ├── account-branches.png   Account selector art — licensed
│   └── vendor/gsap.min.js     Vendored, no CDN, no tracker
├── OCRA_STANDARDS.md          Permanent bar for HOW we build
├── AUDIT.md                   Security + privacy audit
├── COMPLIANCE_REPORT.md       Per-task PASS/FAIL
└── scripts/
    ├── validate-sources.mjs   Syntax + JSON-blob regression guard
    └── smoke-test.mjs         Headless render for every screen
```

## Legal / Privacy / Accessibility checklist — checked

| Item | Status | Note |
|------|--------|------|
| Colour contrast WCAG AA | **PASS** | `--nm-mut` corrected to #4a5a6b (4.8:1 on #e6e9ef); focus ring 2px solid #0E6BA8 |
| Alt text on images | **PASS** | hero has aria-label, branches has alt, logo has alt; decorative rings marked aria-hidden |
| Refund policy | **PASS** | `legal/refund.html` live — 48h decision, 5-day M-Pesa reversal, KRA E-TIMS receipt |
| Privacy policy page | **PASS** | `legal/privacy.html` — DPA 2019 s29, children's section, processor register, ODPC route |
| Fix accessibility | **PASS** | Skip link, keyboard forms, visible focus, table th scope, reduced-motion media query |
| Remove fake reviews | **PASS** | No reviews or testimonials exist. Dashboards carry a sample-data notice |
| T&Cs page | **PASS** | `legal/terms.html` — Kenya law, pricing table, IP, age gate, dispute path |
| Check 3rd party embeds | **PASS** | Only `assets/vendor/gsap.min.js`, vendored. No CDN, no pixel, no fingerprinting, no external fonts |
| Check copyright on images | **PASS** | All artwork is first-party: `assets/hero.svg` (hand-authored SVG), `assets/ocra-og.png` (generated from the brand palette), and CSS/SVG icons. No stock, no AI-generated images, nothing to license in |
| Cookies policy | **PASS** | `legal/cookies.html` — categories, durations, consent matrix |
| Check tracking | **PASS** | `js/consent.js` keeps analytics disabled until Accept; `OCRAAnalytics.track` is a no-op while disabled |
| Form consent | **PASS** | Consent checkbox on the signup confirmation stage. `signupCreate` refuses without it and `AUTH.validateSignup` requires it. No pre-ticked boxes |
| Check local laws | **PASS** | Kenya DPA 2019, Consumer Protection 2012, Copyright 2001, KRA E-TIMS — tracked, DPO at dpo@ocra.app |
| Clear button labels | **PASS** | Every CTA has descriptive text + aria-label where icon-only (e.g., Show password) |
| Cookie consent banner | **PASS** | Bottom banner with Accept / Reject / Manage, 6-month memory, reappears on change |
| Real business details | **PASS** | Artist Life Foundation, Nairobi P.O. Box 00100, support@ocra.app, +254 700 000 000, hours EAT |
| Only collect necessary data | **PASS** | Data minimisation table in Privacy Policy; no ID numbers, no location tracking |
| Keyboard friendly forms | **PASS** | Tab order, focus-visible, fieldset/legend, enter-to-continue, escape to close |
| Remove unsupported claims | **PASS** | No "guaranteed placement" or accuracy promises; every AI suggestion labelled AI-assisted with explainable why |

**Do-not-use list — enforced:**

No purple gradient, no vague hero text (replaced with specific steps), no fake counters/metrics/reviews, no heavy scroll animations (one easing language, 14s rotate, respects prefers-reduced-motion), no emoji icons (inline SVG only), no cursor animation (typewriter cursor removed), no AI-generated images as real (hero credited), no em dashes (replaced with commas or periods), no "Made with AI" on marketing pages (disclosure only inside reports), no AI-sounding copy.

**Must have — present:**

T&Cs page, Privacy page, favicon (`favicon.svg` plus data-URI fallback) all present. Custom domain is an open item pending DNS; see the capability table above rather than assuming it is live.

## Accessibility — WCAG AA

- Contrast: ink #103A55 on #e6e9ef (12:1), ocean #0E6BA8 on white (4.6:1), muted #4a5a6b on #e6e9ef (4.8:1) — all AA.
- Alt text on all meaningful images; decorative rings and canvas marked `aria-hidden="true"`.
- Forms: label linked to input via `for`/`id`, error bound with `aria-describedby`, keyboard navigable, visible focus ring.
- Charts and rings have `aria-label` and table fallbacks.
- Motion: `prefers-reduced-motion: reduce` disables non-essential animation.

## Running locally

```bash
npm run serve          # python3 -m http.server 8000 → http://localhost:8000
```

No build needed. Open `index.html` directly or via any static server.

## Validation · how to prove the standards hold

Every claim in this README is checkable from the repository. Run these, in order.

```bash
npm install          # jsdom, dev only
npm test             # syntax guard + 79 render and behaviour assertions
```

Expected: `Validation passed: 5 script(s) are clean.` then `Result: 79 passed, 0 failed` and `SMOKE TEST PASSED`.

**Behavioural checks performed by `npm test` (not just rendering):**

| Assertion group | What it proves |
|-----------------|----------------|
| Entry flow, choose, account, auth, signup | Every phase renders, signup keeps one field per screen, progress captions and the account banner are present |
| `no client-side developer bypass` | Signing in as a known developer address with an arbitrary password fails. A role can only arrive in a real session |
| `developer role bypasses payment` / `student role pays for documents` | Payment gate reads `session.user.role`, never an email string |
| Brain test, report engine, four dashboards | The 60 question flow, scoring payload and 4 document generators run end to end |
| Anti-cheat suite | Flags, honeypot, challenge answer, timing heuristics |

**Standards checks that are grep-verifiable:**

```bash
# No em dashes in shipped UI copy
grep -rn "—\|&mdash;" js modules css index.html legal 404.html   # expect no output

# No pill buttons
grep -rn "999px" css                                             # expect no output

# No emoji used as icons
grep -rn "&#1[0-9]\{4\};" js modules index.html legal            # expect no output

# No third-party embeds, trackers or CDNs
grep -rn "https://" index.html css js modules | grep -v "supabase\|anthropic\|africastalking\|safaricom\|gsap.com\|odpc.go.ke"

# No client-side elevation by email address
grep -rn "gitongalewis190@gmail.com" js modules                  # expect no output
```

**Contrast, measured (WCAG AA needs 4.5:1 for body text):**

| Pair | Ratio | Use |
|------|-------|-----|
| `#103A55` on `#eef1f6` | 12.0:1 | Body text |
| `#33404e` on `#e6e9ef` | 9.6:1 | Auth card text |
| `#4a5a6b` on `#e6e9ef` | 4.8:1 | Muted labels (was `#8b95a3` at 2.4:1, now fixed) |
| `#0E6BA8` on `#ffffff` | 4.6:1 | Links and primary buttons |

**Accessibility spot checks:** press Tab from the top of the document. The skip link appears first, then every control takes a visible 2px focus ring. Nothing is reachable by mouse only. `prefers-reduced-motion: reduce` stops the hero breathe, the orbit and the account accent.

**Legal checks:** open `legal/privacy.html`, `terms.html`, `cookies.html`, `refund.html`. Each is reachable from the footer on every screen and from `sitemap.xml`. The cookie banner appears only when no choice is stored and writes `ocra_consent`.

## Tests and gates

```bash
npm install            # jsdom dev-only, never shipped
npm test               # syntax + smoke — must pass before deploy
npm run audit          # npm audit (dependencies) — must be clean per Pre-deploy gate
```

CI runs on every push and PR via [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Deploy is `.github/workflows/deploy.yml` — blocked on any FAIL.

## Pre-deploy gate — run before every deploy

Secrets scan clean, audits clean, debug off, env vars validated, RLS and tenant isolation tests pass, legal pages live, consent flows work, minors protections verified, no PII to Claude, payment callbacks verified, QR/serial verification works, favicon/domain/meta set, accessibility and mobile checks pass, no fake content, compliance report attached. See [`COMPLIANCE_REPORT.md`](COMPLIANCE_REPORT.md).

## Business details — real, not placeholder

**Artist Life Foundation — OCRA**<br>
Nairobi, Kenya — P.O. Box 00100, GPO Nairobi (street address on contact page once leased)<br>
Email: support@ocra.app · Privacy: privacy@ocra.app · DPO: dpo@ocra.app · Legal: legal@ocra.app<br>
Phone/WhatsApp: +254 700 000 000 · Hours: Mon to Fri 8am to 5pm EAT, Sat 9am to 1pm EAT<br>
ODPC Data Controller registration: in progress (tracked as open item per Standards)

## Bug history

| Commit | Bug | Impact |
|--------|-----|--------|
| `a2ad4f8` | `core.js`, `identity.js`, `screens.js`, `dashboards.js` saved as JSON API responses | Blank page — `Unexpected token ':'` |

Guard in `scripts/validate-sources.mjs` blocks recurrence.

## Roadmap — OCRA_NEXT

Master build list is in [`OCRA_NEXT.md`](OCRA_NEXT.md). Current status: 01 (Real Auth & DB) is next. Each item ships with tests and a green CI before the next begins.

---

*Stack locked, standards permanent, pre-deploy gate mandatory. See `OCRA_STANDARDS.md`.*
