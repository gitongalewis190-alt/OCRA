# OCRA Security, Quality & Legal Audit — 20 Oct 2026

> **Scope:** Static review of `gitongalewis190-alt/OCRA` at `arena/6f075a6a-ocra` (branched from `main@c1ba7b9`). Covers `js/`, `modules/`, `css/`, `index.html`, `auth/`, `scripts/`, GitHub Actions, and linked build list (`OCRA_NEXT.md`). No dynamic pen-test — findings are from code + architecture.

---

## 0) TL;DR

| Area | Verdict |
|------|---------|
| **UX / Visual execution** | Strong — cinematic landing, stratum deck, account branches, neumorphic auth all match prototype intent |
| **Engineering hygiene** | Good — zero-deps, modular, render bus, `O.fail` banner, CI smoke test, local vendor for GSAP |
| **Data + Brain Test design** | Solid domain model (6 dims, 60 Qs, report engine, age-tiering) — but questions are mostly placeholder text |
| **Security** | **Weak — currently PWA-static + localStorage auth, not safe for real minors/fintech without a backend** |
| **Privacy / Legal (Kenya DPA 2019)** | **Not compliant yet** — no Privacy Policy, ToS, consent flows, DPO/DPIA, retention or children's safeguards |
| **Payments (KES 40)** | Seam is clean, but client-side trust + no receipt/webhook makes it legally / financially risky |

**Bottom line:** For a demo / pre-launch on GitHub Pages, OCRA is impressive. For handling **real children's academic + cognitive data + money in Kenya**, you must ship Items 01 (Real Auth/DB), 05/06 (M-Pesa/Stripe webhooks), 07 (real PDFs), and **14 (Security Audit) before you charge KES 40 or store minors' data**.

---

## 1) What's Strong — keep & double down

### 1.1 Architecture
- **Single source of truth:** `OCRA.state` + `O.go(patch) → O.render()` is predictable, easy to reason about. Render bus wraps in `try/catch → O.fail` banner — no blank-page death.
- **Separation of concerns:** `core.js` (platform), `identity.js` (validation/coherence), `screens.js` (experience), `dashboards.js` (views), `modules/*` (domain). Clear seams for backend (Firebase/Supabase/FastAPI) with `// WIRE:` comments.
- **Zero-build, static-first:** No bundler fragility. Works offline, on any host, fast TTFB. `validate-sources.mjs` regression guard caught the old JSON-blob bug — smart.
- **CI that actually blocks deploy:** `npm test = validate + jsdom smoke` → only green on all 5 phases + dashboards. `deploy.yml` requires Pages via Actions. Shallow-safe.

### 1.2 UX / Design System
- Tokens, glass/dark-glass, neumorphic auth, landingFx canvas — coherent. `tokens.css`, `landing.css` etc are well scoped.
- **Entry flow invention:** 5s hold for dev (no hint text), stratum deck scroll, account hotspots on image — all implemented accessibly (focus-visible, aria).
- **Signup wizard done right:** One field per screen + live gating (`_updateGates()` disables Continue without a full re-render), country↔dialCode auto-sync, system↔country coherence hint, password checklist live.
- **Voice + anti-cheat touches:** `voice.js` and `anti-cheat.js` are not gimmicks — behavioural telemetry, honeypot, tab-away detection, human challenge modal are production-grade concepts.

### 1.3 Domain Model
- Brain Test 60Q across 6 dimensions, intake → academicEntry → brainTest → report pipeline, Report Engine (4 docs), age-tiering (5 tiers), Data Management (audit log, soft-delete 30 days, export) — aligned with `OCRA_NEXT` master list (20 items). Roadmap is sane and sequential.

---

## 2) What's Weak / Risky — grouped

### 2.1 Critical Security Issues (fix before any real user data)

| # | Finding | Why it matters | File(s) |
|---|---------|----------------|---------|
| C1 | **All auth is localStorage with a toy hash** (`djB2 hash → ocra_<base36>_<len>`) | Passwords are reversible in seconds; any XSS or shared device = full account takeover. No salt, no cost factor, no server verification. | `modules/auth/auth.js:299`, `js/identity.js:355` |
| C2 | **Developer bypass = any password for `gitongalewis190@gmail.com`** | 5-second hold on `devHold` logs in as developer with `"dev"` — if deployed without a backend, anyone who reads the JS can become admin. | `js/core.js:729`, `modules/auth/auth.js:113` |
| C3 | **`O.esc` is the only XSS defence, not a CSP** | No `Content-Security-Policy`, no sanitisation of rich fields (family slogan, school name) beyond esc. Inline `onclick` on Restart banner (`O.fail`) is still there. | `js/core.js:96`, `index.html` |
| C4 | **Client is the source of truth for payments** | `payment.js` stores `unlockedDocs` + `unlockExpiry` in-memory and trusts `paymentSuccess` action. No webhook signature, no idempotency. A user can replay unlock or never be charged. | `modules/payment/payment.js:38` |
| C5 | **Session token is client-generated & long-lived (7 days)** | `tok_<time>_<rand>` in localStorage, no HttpOnly, no rotation, no revocation list. `isLoggedIn()` just checks `Date.now() < expiresAt`. | `modules/auth/auth.js:254` |
| C6 | **Sensitive Q&A stored in plaintext in localStorage** | Recovery answers + intake data + academic scores live in `ocra_accounts_v1` JSON, readable by any script or extension. | `modules/auth/auth.js:80` |
| C7 | **OTP is `Math.random()` + console/info toast** | 6-digit code generated client-side, shown in notifications. No SMS/email backend, no rate limit, no expiry. | `js/core.js:281` |

### 2.2 High — Privacy & Children's Data

| # | Finding | Kenya Law Impact |
|---|---------|------------------|
| H1 | **No consent, no Privacy Policy, no Terms** — signup never shows a checkbox that actually gates creation (`validateSignup` checks `agreed` but no UI renders it). | **Data Protection Act 2019 (DPA) s28-30:** requires explicit, informed consent with purpose stated. No lawful basis to process adult or child data. |
| H2 | **Processing minors' data (ages 6-18) without verifiable parental consent** | DPA + ODPC Guidance on Children: guardian consent + DPIA required. `intake-form` collects even more. Unlawful to retain. |
| H3 | **No Data Controller registration, DPO, DPIA, breach notice plan** | ODPC penalties up to KES 5M or 1% global turnover. Audit must prove registration. |
| H4 | **Cross-border transfer risk** — Firebase/Supabase not yet set, but defaulting to US region = transfer outside Kenya without safeguards (DPA s49). |
| H5 | **30-day soft-delete exists, but no real erasure** — user cannot request deletion/portability (DPA s40 rights). `data-management` purge is in-memory only. |
| H6 | **No cookie/tracker disclosure** — GSAP is vendored (good), but `localStorage` use = "similar tech" under ODPC that must be disclosed. |

### 2.3 High — Money & Consumer Protection

| # | Finding | Kenya Law Impact |
|---|---------|------------------|
| H7 | **No payment receipts, refunds, T&C, or provider disclosure** | Consumer Protection Act 2012 + CBK E-Money Regs: must show total cost, merchant name, refund window, dispute contact before `Pay with M-Pesa`. |
| H8 | **KES 40 / 30-day unlock vs Kenya pricing norms** — dark pattern risk if expiry isn't upfront. Must state auto-renewal? (OCRA doesn't renew — say so). |
| H9 | **Stripe not licensed locally for domestic KES** — M-Pesa Daraja STK push is fine, but Stripe for Kenya consumers needs cross-border disclosure + FX. |
| H10 | **No VAT/E-TIMS thought** — KRA requires e-invoicing for paid digital services above threshold. At least log P2 receipts now. |

### 2.4 Medium — Product / Accessibility / Ops

- **Package.json says `MIT` while `LICENSE` says Proprietary — contradiction** will confuse GitHub and void your private claim.
- **Auth pages (`/auth/*.html`) are huge standalone docs (48KB) but never routed** — duplicative SEO, split analytics; consolidate or remove.
- **Accessibility:** Typewriter `cur` cursor has no `aria-live`; brain test timing should respect `prefers-reduced-motion`; colour contrast on `muted` fails WCAG on glass.
- **Offline promise vs reality:** GitHub Pages serves without `Cache-Control` or service worker — offline only if browser cached. Item 13 PWA not yet done.
- **Brain Test content quality:** 40/60 questions are placeholders (`"Option A"`, `"Which shape should replace ?"` no image). Don't brand as psychometric until validated by a Kenyan psychologist.
- **Email deliverability:** No SPF/DKIM domain for `gitongalewis190@gmail.com` — transactional mail will hit spam/promotions.
- **No rate limiting, no CAPTCHA** beyond anti-cheat (client-side only — bots bypass it by skipping JS).

### 2.5 Low — Nice polish

- `js/app.js` global error `console.error` + voice `say` leaks stack traces to users.
- `developer-console.js` shows hardcoded user counts — should be feature-flagged off in prod.
- `arten` AI assistant disabled but still in bundle path.

---

## 3) Making OCRA Secure — concrete plan

### P0 — Do before touching real PII/money (1–2 weeks)

1. **Move auth to a real backend — today it's demo-only.**
   - Choose Supabase Auth (cheaper, RLS) or Firebase Auth + Firestore. Add `httpOnly, Secure, SameSite=Strict` cookies or Supabase `sb-*` tokens.
   - Replace `hashPassword` / `localStorage` accounts with `bcrypt/Argon2id` on server + JWT+refresh rotation. Remove dev bypass or gate it behind `ENV !== production`.

2. **Remove secrets & hardcoded roles from client.**
   ```js
   // DELETE: js/core.js ~L729 and modules/auth/auth.js ~L13
   // REPLACE with: fetch('/api/dev/unlock', { method:'POST', credentials:'include' })
   ```

3. **Lock down `index.html` with CSP + security headers:**
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'none'">
   ```
   On GitHub Pages, add `_headers` (Cloudflare Pages) or move to Vercel/Cloudflare to set `Strict-Transport-Security`, `X-Frame-Options: DENY`, `Permissions-Policy`.

4. **Sanitise every dynamic field through a single helper** — replace `innerHTML = html` with `DOMParser` or keep `O.esc` but add an `O.sanitize(str)` wrapper that strips `<script`, `on*=`, `javascript:` and caps length (e.g. 120 chars for free-text).

5. **Payments must be server-authoritative.**
   - Frontend: `POST /api/payment/mpesa/initiate` → backend calls Daraja STK + stores `CheckoutRequestID` with `pending`.
   - Daraja callback → verify `ResultCode === 0`, signature, amount === 40, then `INSERT INTO entitlements(user_id, doc_type, expiry)`.
   - Every `Export PDF` request checks entitlements server-side; never trust `P.state.unlockedDocs`.

6. **Rate limit + OTP properly:** Move OTP to server, 6-digit via SMS/email, 5 min TTL, 3 tries / 15 min, CAPTCHA after 5 failures. Delete client `O._otpCode`.

### P1 — Privacy + Children's data (Weeks 2–4)

7. **Implement consent properly:**
   - Signup now: checkbox `[ ] I agree to the Terms & Privacy Policy` (links) — block `signupCreate` until checked. Store `{ consentAt, consentVersion, ipHash }`.
   - **Under-18:** If `age < 18`, require guardian email + OTP to guardian, not child. Don't allow `personal` account for <13. Add `family` managed-child flow (Item 03).

8. **Align with DPA 2019:**
   - Register as Data Controller with ODPC (portal: odpc.go.ke) — keep certificate in repo private `.odpc/`.
   - Appoint DPO (can be you, published contact: dpo@ocra.app).
   - Publish DPIA summary for "cognitive + academic profiling of minors" (ODPC threshold: high risk).
   - Minimise: stop collecting `rq_mother`, `rq_friend` etc unless you can justify "proportionate" (ODPC: mother's name = sensitive). Replace with email-OTP + authenticator 2FA.

9. **Rights UI:** Add `Settings → Privacy`: Export My Data (`dataManagement.exportUserData()` already exists — wire it to backend), Request Deletion, Correct Data. 30-day response SLA.

10. **Cross-border:** Host personal data in `africa: cape-town / nairobi edge` (Supabase `ap-southeast` not enough). Get explicit consent if US-region persists.

### P2 — Hardening & Compliance ops (Month 2)

11. **Add a real WAF/edge:** Cloudflare free + Turnstile CAPTCHA on signup/payment. `anti-cheat` stays, but server scores too (IP reputation, device fingerprint).

12. **Logging & breach plan:** Ship `dataManagement.log` to server (append-only, 90 days). Write the 72-hour ODPC breach notification SOP; test it once.

13. **E-TIMS/KRA:** If you exceed KES 5M annual revenue, register for e-invoicing — log every KES 40 as `etimsReceiptId` from Daraja.

14. **Fix licence contradiction:**
    ```json
    // package.json
    "license": "SEE LICENSE IN LICENSE"
    // LICENSE stays PROPRIETARY
    ```

15. **Accessibility pass:** `aria-live="polite"` for typewriter + brain test, keyboard trap audit, contrast check (muted `#5B7689` on `#e6e9ef` is OK, on glass not).

### P3 — Trust & Growth (Month 3)

16. **Content validation:** Partner with an educational psychologist (CUE-registered) to rewrite 60 Qs + validate norming; remove "Career Blockchain" language until peer-reviewed.
17. **PWA offline + Print stylesheets (Items 11, 13):** Workbox precache + `@media print` for 4 docs.
18. **Marketing page (`/landing`) separate from `intro`:** SEO meta, schema.org `EducationalOrganization`, clear pricing table.
19. **Developer Console RBAC:** Only `role=developer` after server check; audit every `clearAll`, `Codebase` edit.

---

## 4) T&C / Legal Docs you must publish (draft outlines)

OCRA has **none of these today** — required before PlayStore/AppStore or KES 40.

### 4.1 Privacy Policy — must contain (DPA s29)
- Who you are (Artist Life Foundation, OCRA subsidiary — KRA PIN, physical address, dpo@ocra.app)
- What you collect (personal, family/org, academic, brain-test scores, payment metadata — **no card numbers**)
- Why (career guidance, analytics, payments) — each purpose → lawful basis (consent / contract / legitimate interest)
- Children's data: verifiable parental consent, age gates, DPIA date
- Retention: `30-day soft-delete + 30-day hard delete + audit log 90 days + entitlements until expiry`
- Rights: access, correction, deletion, portability, object, withdraw consent
- Transfers: M-Pesa (Safaricom), hosting region
- How to complain: ODPC (complaints@odpc.go.ke) + your DPO
- Breach notice: 72h to ODPC + without delay to data subject if high risk
- Cookies / localStorage list + purposes + expiry

### 4.2 Terms of Service / EULA
- Age eligibility: 13+ with guardian for <18 (or 18+ if you prefer)
- Account types (Personal/Family/Org/Developer) + responsibilities
- Licence (non-transferable, proprietary)
- Acceptable use (no bulk scraping, no cheating — anti-cheat flags ≠ bans)
- Pricing: KES 40 per doc, 30-day access, no auto-renewal, payment provider terms incorporated by reference
- Refunds: e.g. "7-day refund if download failed and not viewed" + chargeback via Safaricom dispute
- IP: OCRA reports are personal-use licence, not professional psycho-diagnosis; disclaimer: not a clinical/KEC placement tool
- Liability cap: to fees paid per Kenyan law; disclaimer of warranties
- Termination + governing law: **Kenya** (Nairobi courts / arbitration), not US
- Changes: 30-day notice by banner + email

### 4.3 Cookie / Similar Tech Notice (ODPC cookie rules 2024)
- `ocra_session_v1`, `ocra_accounts_v1` (localStorage), `antiCheat` telemetry — first-party, strictly necessary vs analytics.

### 4.4 Refund & Payment Policy (Consumer Protection s56)
- Merchant of record, Daraja Paybill/Till, receipt example, failed-payment retry, dispute email + phone, 48h response SLA.

### 4.5 Child Safety / Guardian Consent (addendum for Family/Org)
- Separate flow: guardian creates child profile → child assent → data minimisation by default.

> **Template tip:** Don't copy a US Privacy Policy. Use the ODPC model notices + Kenya Law templates, then have a Nairobi advocate review (~KES 25-60k flat fee). I can draft these as `docs/PRIVACY.md`, `docs/TERMS.md` if you say the word.

---

## 5) 90-Day Ship Plan tied to OCRA NEXT

| Week | OCRA NEXT item | What ships | Legal/security wins |
|------|----------------|------------|---------------------|
| 1 | **01 Real Auth & DB** + CSP headers | Supabase Auth, RLS, server sessions | Kills C1/C2/C5/C6; enables consent logs |
| 2 | **14 Security Audit (early)** | Remove dev bypass, OTP server, rate limit, Turnstile | ODPC-ready, blocks bots |
| 3 | **05 M-Pesa** (Daraja) + receipts | Webhook-verified entitlements, E-TIMS | CPA-compliant payments |
| 4 | **08 Email + Privacy UI** | Consent checkbox, export/delete, Privacy/Terms pages | DPA consent + rights |
| 5-6 | **04 AI + 09 MBTI** | Server-side Claude Sonnet (never client keys) | No API key leak |
| 7-8 | **02 Diagrams + 10 Cohort** | Validated Q images, anonymised cohort | Anti-cheat stays client+server |
| 9-10 | **07 PDF + 11 Print** | ReportLab backend, signed PDFs | Watermark + entitlement check |
| 11-12 | **13 PWA + 20 Infra** | SW, CDN, monitoring, backup, DPIA filed | ODPC registration done |

---

## 6) Quick Wins you can do on this branch today (no backend)

- [ ] `package.json` license fix + add `engines`, `author` email.
- [ ] Add `docs/PRIVACY.md` (stub) + footer links in `index.html` (to satisfy Lighthouse SEO).
- [ ] Gate `signupCreate` on `form.agreed` with visible checkbox.
- [ ] Wrap `O.fail` banner: escape + no stack in prod, log to `dataManagement.log`.
- [ ] Add `_headers` for CSP if you keep GitHub Pages, else move to Cloudflare Pages for header control.
- [ ] Delete `auth/*.html` or make them canonical to `index.html#auth`.

---

## 7) How I'd run the next session with you

1. You pick one P0 (e.g. "Real Auth & DB") — I wire Supabase, migrate `ocra_accounts` to `profiles` + `sessions`.
2. Then we flip `OCRA NEXT` to ✅ 01 and write tests for auth RLS.
3. Repeat: **OWASP Top 10 pass**, then M-Pesa Daraja, then Privacy docs — each as a tiny PR.

Say **OCRA NEXT** when you're ready, or tell me which risk worries you most (kids' data? payments? being sued?) and we'll start there.

---

*Prepared with care — not legal advice. For Kenya-specific compliance, run the drafts past your advocate + ODPC portal.*
