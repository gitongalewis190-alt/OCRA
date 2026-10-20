# OCRA Compliance Report

**Date:** 20 October 2026
**Branch:** `arena/6f075a6a-ocra`
**Spec:** `OCRA_STANDARDS.md` (permanent) plus the Legal / Privacy / Accessibility checklist and DO NOT USE / MUST HAVE lists.
**Method:** every row below was checked against the code in this repository, not against intent. Where a control belongs to the backend that has not been built yet, the row says so and the item is repeated under Open Items.

Run `npm test` to reproduce the behavioural evidence: **79 passed, 0 failed**, `Validation passed: 5 script(s) are clean.`

---

## Protocol

| # | Rule | Result | Evidence |
|---|------|--------|----------|
| 1 | Save standards verbatim, re-read before work | **PASS** | `OCRA_STANDARDS.md` in the repo root, quoted by `README.md` |
| 2 | Later instructions never override; conflicts flagged | **PASS** | Conflicts between the checklist and the existing build are flagged in "Conflicts resolved" below |
| 3 | Every task ends with this report | **PASS** | This file |
| 4 | Production architecture only; no placeholders presented as real | **PASS (static scope)** | No mock data is presented as real: dashboards carry a sample-data banner; backend seams are labelled `WIRE`; open items listed explicitly. Static baseline is not claimed as production |
| 5 | Locked stack (Next.js, FastAPI, Supabase, Claude, Africa's Talking, Vercel/Railway) | **PASS** | `README.md` stack section; this repository is the pre-migration static baseline |
| 6 | Pre-deploy gate blocks on FAIL | **PASS (documented)** | Gate rows below; production deploy remains blocked while backend rows are open |

## Security

| Control | Result | Evidence |
|---------|--------|----------|
| No secrets in git, server-side env only | **PASS (scope)** | No keys, tokens or `.env` files exist in the tree. Env validation belongs to the FastAPI service, tracked as an open item |
| No client-side privilege escalation | **PASS** | Removed the no-password developer login, the email-based developer role at signup, the email-based social elevation, and the payment gate's email allowlist (`modules/auth/auth.js`, `modules/payment/payment.js`). New assertions: `no client-side developer bypass`, `developer role bypasses payment`, `student role pays for documents` |
| Developer hold on the wordmark | **PASS** | The 5 second hold now opens the developer sign-in screen. It does not authenticate anyone (`js/core.js`) |
| Password storage | **FAIL (production)** | The static demo stores a non-cryptographic digest in `localStorage`. Commented as such. Real auth requires argon2id on the server with session cookies |
| XSS defence | **PASS** | Zero inline event handlers remain (verified by grep). All dynamic output passes `O.esc`. CSP is `script-src 'self'` with no `unsafe-inline` |
| CSP, HSTS, X-Frame-Options, XCTO, Referrer-Policy, Permissions-Policy | **PASS** | `index.html` meta CSP plus `_headers` for Cloudflare/Netlify hosts. GitHub Pages ignores `_headers`; the README names this limitation |
| Third-party scripts | **PASS** | GSAP is vendored at `assets/vendor/gsap.min.js`. No CDN, no pixel, no analytics vendor |
| Payments server-authoritative | **FAIL (production)** | Seam only. `modules/payment/payment.js` still contains a demo fallback and client-held unlock list. Must be replaced by Daraja callback verification before any real charge |
| Printouts: serial + QR verification | **FAIL (open)** | Not built. Tracked as OCRA_NEXT 07 |
| Audit trail, soft delete, export | **PASS (client scope)** | `modules/data-management/data-management.js`: 30 day soft delete, immutable-style log ring, JSON export, auto purge |

## AI Safety

| Control | Result | Evidence |
|---------|--------|----------|
| No direct identifiers to Claude | **PASS (seam)** | `modules/ai-insights/ai-insights.js` builds a pseudonymised payload; server-side call is pending |
| Disclosure on AI output | **PASS** | Report templates and the landing copy state AI-assisted analysis, not a guarantee |
| Career backdoor review queue | **FAIL (open)** | Specified, not built |
| Accommodation data separation | **PASS** | Not present on the default intake path; naming is neutral |
| Cohort comparison opt-in | **PASS** | Analytics module keeps cohort comparison off by default |

## Legal and privacy (Kenya)

| Control | Result | Evidence |
|---------|--------|----------|
| Privacy Policy live | **PASS** | `legal/privacy.html`: DPA 2019 lawful bases, children's section, processor register, retention table, rights, ODPC route, 72 hour breach note |
| Terms and Conditions live | **PASS** | `legal/terms.html`: eligibility, pricing table, acceptable use, IP, liability cap, Kenya law and NCIA/courts |
| Cookies Policy live | **PASS** | `legal/cookies.html`: storage names, durations, categories, consent matrix, withdrawal |
| Refund Policy live | **PASS** | `legal/refund.html`: eligibility matrix, 48 hour decision, 5 business day M-Pesa reversal |
| Consent before non-essential storage | **PASS** | `js/consent.js`: Accept / Reject / Manage, 6 month expiry, analytics disabled until accepted |
| Explicit form consent, no pre-ticked boxes | **PASS** | Consent checkbox in the signup confirmation stage; `signupCreate` refuses to run without it; `AUTH.validateSignup` also requires it |
| Guardian consent for minors | **PASS (flow)** | Family/organisation language in the account selector and the consent text; under 13 blocked from Personal. Server-side verification is open |
| Data minimisation | **PASS** | Privacy Policy table lists only the fields the product uses; no ID numbers, no location, no card data |
| Retention and deletion | **PASS (client)** | 30 day soft delete then purge; export available. Server retention job is open |
| Processor terms and cross-border notes | **PASS** | Processor table in the Privacy Policy with locations and the DPA s49 note |
| Real business details | **PASS** | Footer and legal pages: Artist Life Foundation, Nairobi, support/privacy/dpo addresses, phone, hours |
| Unsupported claims removed | **PASS** | Hero copy now lists exactly what is produced and what it costs. No accuracy or placement promises anywhere |
| ODPC registration | **FAIL (open)** | Tracked as an open item; stated as "in progress" rather than claimed as done |

## Accessibility and quality

| Control | Result | Evidence |
|---------|--------|----------|
| WCAG AA contrast | **PASS** | `#4a5a6b` on `#e6e9ef` = 4.8:1 (was `#8b95a3` = 2.4:1). `#103A55` on `#eef1f6` = 12.0:1. `#0E6BA8` on white = 4.6:1 |
| Keyboard operation | **PASS** | Skip link, native buttons, visible 2px focus ring, account branches are real buttons not image hotspots, no mouse-only control |
| Alt text and ARIA | **PASS** | Hero has `role="img"` + label, logo is decorative text, charts carry labels, canvas and orbit rings are `aria-hidden`, tables use header cells |
| Reduced motion | **PASS** | `prefers-reduced-motion: reduce` disables the hero breathe, orbit and accent |
| Clear button labels | **PASS** | Icon-only controls have `aria-label` (password reveal, voice toggle, toast dismiss) |
| Mobile and low bandwidth | **PASS** | Fluid type, single column under 920 px, SVG artwork instead of a 1.5 MB PNG, no external fonts |
| Favicon, 404, sitemap, meta, OG | **PASS** | `favicon.svg`, `404.html`, `sitemap.xml`, OG/Twitter tags with a 1200x630 card |
| Custom domain | **FAIL (open)** | DNS not provisioned. Adding `CNAME` before DNS exists would break the live Pages site, so it is tracked, not faked |
| Automated tests | **PASS (client)** | 79 assertions including auth, payment gating, developer-role behaviour and legal links. Server-side RLS and tenant isolation tests are open |

## Authenticity and design

| Rule | Result | Evidence |
|------|--------|----------|
| No purple gradient | **PASS** | Palette is ocean, cyan, amber only |
| No vague hero text | **PASS** | "Turn subject scores and a 60 question cognitive profile into four clear reports", followed by price and scope |
| No fake reviews or testimonials | **PASS** | None exist in the tree |
| No fake counters or metrics | **PASS** | Dashboards show a sample-data notice; the developer console says its counts are illustrative |
| No emoji as icons | **PASS** | Replaced with inline SVG or plain text. Grep for `&#1xxxx;` returns nothing |
| No cursor animation | **PASS** | Typewriter and blinking caret removed; the brief renders instantly |
| No AI-generated images | **PASS** | The AI artwork was deleted. `assets/hero.svg` is hand-authored SVG; `assets/ocra-og.png` is generated from the brand palette |
| No em dashes | **PASS** | Grep for `—` and `&mdash;` across `js`, `modules`, `css`, `index.html`, `legal`, `404.html` returns nothing |
| No "Made with AI" tag | **PASS** | Not present on any marketing surface |
| No pill buttons | **PASS** | Grep for `999px` in `css` returns nothing; controls use 10 to 14 px radii |
| One motion language | **PASS** | Single cubic-bezier set, long slow ambient loops, all motion optional under reduced motion |

## Checklist roll-up

| Item | Result |
|------|--------|
| Check colour contrast | PASS |
| Alt text on images | PASS |
| Refund policy | PASS |
| Privacy policy page | PASS |
| Fix accessibility | PASS |
| Remove fake reviews | PASS |
| T&Cs page | PASS |
| Check 3rd party embeds | PASS (none; GSAP vendored) |
| Check copyright on images | PASS (all first-party artwork) |
| Cookies policy | PASS |
| Check tracking | PASS (analytics gated, off by default) |
| Form consent | PASS |
| Check local laws | PASS (DPA 2019, CPA 2012, Copyright 2001, KRA receipts) |
| Clear button labels | PASS |
| Check for cookie consent | PASS |
| Add real business details | PASS |
| Only collect necessary data | PASS |
| Keyboard friendly forms | PASS |
| Remove unsupported claims | PASS |
| Must have: T&Cs, favicon, privacy page | PASS |
| Must have: custom domain | FAIL (open: DNS) |

## Pre-deploy gate

| Gate | Result |
|------|--------|
| Secrets scan clean | PASS |
| Dependency audit clean | PASS (`jsdom`, dev only) |
| Debug off, generic user errors | PASS |
| Env vars validated | FAIL (backend not built) |
| RLS and tenant isolation tests | FAIL (backend not built) |
| Legal pages live | PASS |
| Consent flows work | PASS |
| Minors' protections verified | PASS (client flow) |
| No PII sent to Claude | PASS (seam) |
| Payment callback verified | FAIL (seam only) |
| QR and serial verification | FAIL (not built) |
| Favicon, meta, OG set | PASS |
| Custom domain | FAIL (DNS) |
| Accessibility and mobile checks | PASS |
| No fake content | PASS |
| Compliance report attached | PASS |

**Verdict: the static baseline is cleared for staging and demonstration. It is NOT cleared for real minors' data or real money.** The blocking items are the backend four: real auth and RLS, verified Daraja callbacks, QR/serial verification, and server tests. They are the same four items in `OCRA_NEXT.md`.

## Conflicts resolved

1. **"No pill-shaped buttons" versus the neumorphic prototype.** The prototype used stadium buttons throughout. Standards win: radii are now 10 to 14 px. Flagged for your decision if you want the pill look back for one specific control.
2. **"No AI-generated images" versus the shipped hero and account artwork.** Both were AI-generated. Standards win: they were deleted and replaced with hand-authored SVG plus a real button-based account selector. The account screen no longer uses an image at all.
3. **"Developer access by 5 second hold" in `OCRA_NEXT.md` versus server-side auth.** The hold survives as a discovery affordance but no longer grants a session. Anyone can reach a sign-in screen; only a server-issued role reaches the developer dashboard.

## Open items

1. Supabase auth and Row Level Security, FastAPI service, env validation.
2. Daraja callback verification, idempotency, E-TIMS receipt.
3. QR and serial generation plus server verification.
4. Career backdoor review queue with the 60 day New badge.
5. Server-side automated tests for tenant isolation and payment unlocks.
6. ODPC registration certificate.
7. Custom domain DNS, then add `CNAME` and update `sitemap.xml` and `og:url`.
8. Offline PWA and error monitoring.
