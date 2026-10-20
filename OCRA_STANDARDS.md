# OCRA MASTER STANDARDS (PERMANENT, NON-NEGOTIABLE)

**PROTOCOL**

1. First action: save this entire document verbatim as `/OCRA_STANDARDS.md`. Re-read it before every task, feature, refactor, or deploy. `OCRA_COMPLETE_MASTER_SPECIFICATION_FINAL.md` defines WHAT to build; this document defines the minimum quality, security, and legal bar for HOW. If they conflict, this document wins and you flag the conflict to me.

2. Later instructions never override these standards. If a request conflicts, stop, name the rule, ask me. Only "OVERRIDE: <rule>" from me suspends a rule, for that task only.

3. Every task ends with a COMPLIANCE REPORT: each section PASS / FAIL / N/A with a one-line reason, based on checking the actual code.

4. Production architecture only. No placeholders, mock data, stubs, or demo-grade shortcuts standing in for real logic. If something cannot be built yet, list it as an open item.

5. Stack is locked: Next.js, FastAPI, Supabase (PostgreSQL), Claude API, Africa's Talking, Vercel/Railway. No substitutions without my approval.

6. Run the PRE-DEPLOY GATE before every deploy and block on any FAIL.

**SECURITY**

- Secrets: none in git (scan full history). All keys in validated environment variables, server-side only. Claude API, Daraja, and Africa's Talking keys never reach the client. Rotate on any leak.

- Auth: argon2id or bcrypt, session expiry, rate-limited login, OTP recovery via Africa's Talking with attempt limits, MFA for Developer/Founder and Org Admin accounts.

- Authorization: enforced server-side on every request, per account type (Personal, Family, Organization, Developer). Supabase Row Level Security on every table. Strict tenant isolation: one org or family can never read another's rows. Shared reference data (Career Requirements Database) is the only global data.

- Minors: student records are never publicly reachable, never indexed, never in URLs, never in logs. Session-lock on student views.

- Input: parameterized queries only, server-side validation on all forms, upload validation (type, size, content, malware-safe handling for photo OCR ingestion).

- Web: XSS, CSRF, injection protection. CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy. CORS locked to OCRA origins. HTTPS enforced. Rate limiting on auth, forms, report generation, Claude calls, and the career backdoor.

- Production: debug off, no exposed files (.env, .git, source maps, backups), generic user-facing errors, detailed errors to monitoring only. Tested backups.

- Dependencies: remove unused, update regularly, npm audit and pip-audit clean before deploy.

- Payments (M-Pesa Daraja and card alternatives): verify callback origin and payload, idempotent handlers, never trust client-side payment status, server decides every unlock (KES 40 / 30-day model), full payment audit trail.

- Printouts: unique serial number and QR code per document, server-side verification, tamper checks. Serial-triggered developer prompt must be rate-limited and logged.

- Audit: versioned edit history for student data (diff log, who, when). Immutable activity log for Org Admin and Developer actions.

**AI SAFETY AND INTEGRITY**

- Never send direct identifiers (names, phone numbers, school names, guardian contacts, photos) to the Claude API. Pseudonymize, send only the fields the task needs, and log each call without personal data.

- Cache Claude responses to control cost; "recreate document" falls back to similar cached alternatives.

- Career backdoor: user enters only an official career name. Backend call uses web-search grounding and a strict structured-output schema, validates against the schema, stores as "auto-generated, pending review" with a 60-day "New" badge, and never feeds full CRS scoring until it is enriched or approved. Developer Dashboard review queue is required.

- Every AI-generated report, insight, and career recommendation carries an in-product disclosure that it is AI-assisted analysis and not a guarantee or professional advice, plus an explainable "why" for each recommendation. (This is required inside the product. The ban on "Made with AI" tags below applies only to marketing pages.)

- Accessibility and Accommodations data: separate explicit parental consent, clickable options only, never on the default Data Panel, never feeds CRS or any performance score, never shared across tenants, dignified non-clinical naming everywhere including internal code.

- Cohort percentile comparison: opt-in only, anonymized, never default-on, never named classmates.

**LEGAL / PRIVACY (KENYA)**

- Comply with the Kenya Data Protection Act 2019. Track ODPC registration (AIL as data controller) as an open item until done.

- Required live pages: Privacy Policy (per-section agreement for org signup), Terms and Conditions, Cookies Policy, Refund Policy.

- Verified guardian/parent consent before processing any minor's data. Explicit consent on every form collecting personal data. Cookie and tracking consent before any non-essential script.

- Collect only necessary data. Defined retention and deletion policy. Data export and deletion on request, with versioned history honoring audit requirements.

- Data processor terms reviewed and recorded for Supabase, Vercel, Railway, Anthropic, Africa's Talking, Firebase (if used), analytics, and embeds.

- Cross-border transfer notes documented, since processors host outside Kenya.

- Real business details on the site (AIL, Nairobi address, working contact). No unsupported claims, no unverified accuracy promises about career outcomes. Verify licensing of all images, fonts, and embeds.

- Regional pricing is disclosed transparently. Honest pricing and clear refund terms.

**ACCESSIBILITY AND QUALITY**

- WCAG AA contrast, alt text, keyboard-friendly forms and navigation, visible focus states, clear button labels, screen-reader labels on charts and rings.

- Mobile-first. Fast on low bandwidth and offline-first with a visible sync indicator. Compressed images, lazy loading, minimal JS.

- Custom 404, favicon, meta and Open Graph tags, sitemap, custom domain, error monitoring.

- Automated tests for auth, tenant isolation, payment unlocks, and report generation. The signup testing module runs on every signup.

**AUTHENTICITY AND DESIGN**

- Never: fake reviews, fake counters, fake metrics, invented testimonials, demo data presented as real, AI-generated stock images, "Made with AI" tags on marketing pages, em dashes, emoji as icons, cursor animations, vague hero text, purple gradients.

- Avoid unless I request: pill-shaped buttons, heavy scroll animations.

- Design language: modern glassmorphism and flat design, one unified motion and easing language across all animations, rotating micro-copy pools, warmer chrome as a student's band rises. Audio cues off by default and easy to mute.

- Copy is specific, concrete, and human. If real content is missing, ask me.

**PRE-DEPLOY GATE**

Secrets scan clean; audits clean; debug off; env vars validated; RLS and tenant isolation tests pass; legal pages live; consent flows work; minors' data protections verified; no PII sent to Claude; payment callbacks verified; QR/serial verification works; favicon, domain, meta tags set; accessibility and mobile checks pass; no fake content; compliance report attached.

---

**LEGAL / PRIVACY / ACCESSIBILITY CHECKLIST**

- Check colour contrast
- Alt text on images
- Refund policy
- Privacy policy page
- Fix accessibility
- Remove fake reviews
- T&Cs page
- Check 3rd party embeds
- Check copyright on images
- Cookies policy
- Check tracking
- Form consent
- Check local laws
- Clear button labels
- Check for cookie consent
- Add real business details
- Only collect necessary data
- Keyboard friendly forms
- Remove unsupported claims

**DO NOT USE**

- Purple gradient
- Vague hero text
- Fake counters
- Fake reviews
- Too many scroll animations
- Pill-shaped buttons
- Emoji icons
- Fake metrics
- Cursor animation
- AI-generated images
- Em dashes
- "Made with AI" tag
- AI-sounding copy

**MUST HAVE**

- T&Cs page
- Site favicon
- Privacy policy page
- Custom domain
