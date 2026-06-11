# OCRA NEXT

**Trigger phrase:** Say **OCRA NEXT** to advance to the next item on this list.
Works like a playlist. Every session picks up exactly where the last one left off.

---

## Confirmed Design Decisions (bring these up when relevant)

| Decision | Detail | Confirmed |
|---|---|---|
| Intro background | Dark navy (`--bg-dark`) default; black (`#000`) also available; toggled from developer dashboard | ✅ 2026-06-11 |
| Intro animation | Logo spirals from far below, atom orbital rings (3 × tilted), typewriter sequence | ✅ 2026-06-11 |
| Typewriter copy | "Introducing....." → cursor → O·C·R·A → OCRA brief → "a subsidiary of Artist Life Foundation" | ✅ 2026-06-11 |
| OCRA name colour | `#38BDF8` electric cyan — distinct from all surrounding text | ✅ 2026-06-11 |
| Developer access | Logo press-and-hold 5 s → developer dashboard, zero hint text | ✅ 2026-06-11 |
| Payment bypass | `gitongalewis190@gmail.com` always developer; never pays | ✅ locked |
| Password rules | 9+ chars, 1 capital, 1 number, 1 symbol | ✅ locked |
| Recovery questions | 2 facts (mother's name, best friend) + 2 favourites (pet, subject) | ✅ locked |
| Soft delete | 30-day recovery window for all user data | ✅ locked |
| Price | KES 40 per document download, 30-day unlock | ✅ locked |
| Subsidiary | "a subsidiary of Artist Life Foundation" | ✅ locked |

---

## Master Build List — Chronological

| # | Item | Status | Depends On |
|---|---|---|---|
| 01 | **Real Auth & Database** — Firebase/Supabase, persistent login, role-based sessions | ✅ DONE | — |
| 02 | **Brain Test Diagram Assets** — images for 12 spatial/mechanical questions | 🔲 NEXT | — |
| 03 | **Multi-Student Flow** — family & org accounts: add, switch, test per student | 🔲 | 01 |
| 04 | **Claude Sonnet AI Wiring** — live `/api/ai/insights`, age-tiered report language | 🔲 | 01 |
| 05 | **M-Pesa Daraja Integration** — live KES 40 payments, STK push, callback | 🔲 | 01 |
| 06 | **Stripe Integration** — card payments, webhook, receipt | 🔲 | 01 |
| 07 | **PDF Generation** — ReportLab or Puppeteer backend, real document download | 🔲 | 01 04 |
| 08 | **Email Notifications** — welcome, report ready, payment confirm, recovery | 🔲 | 01 |
| 09 | **MBTI Personality Layer** — API integration, personality type added to reports | 🔲 | 01 04 |
| 10 | **Real Cohort Analytics** — live percentile benchmarks, growth across sessions | 🔲 | 01 |
| 11 | **Print Stylesheets** — 4 documents print beautifully, landscape timetable | 🔲 | 07 |
| 12 | **CSS & Visual Design Pass** — full design system, all screens pixel-perfect | 🔲 | — |
| 13 | **PWA / Mobile** — installable app, offline caching, service worker | 🔲 | 12 |
| 14 | **Security Audit** — auth hardening, RLS, input sanitisation, rate limiting | 🔲 | 01–08 |
| 15 | **Landing Page** — marketing page for new users, before the Dive In flow | 🔲 | 12 |
| 16 | **Developer Admin Panel** — Lewis: usage stats, flag controls, user management | 🔲 | 01 |
| 17 | **Organisation Bulk Tools** — CSV import, class management, teacher logins | 🔲 | 03 |
| 18 | **Report Versioning** — save every generated report, compare across terms | 🔲 | 01 07 |
| 19 | **Notifications Backend** — server-side alerts, push notifications | 🔲 | 01 08 |
| 20 | **Production Infrastructure** — hosting, CDN, environment secrets, monitoring | 🔲 | all |

---

## Rules

- **Lewis decides WHAT and WHY.** Claude executes HOW.
- One item at a time. No moving forward until current item is committed and pushed.
- Say **OCRA NEXT** to advance.
- Each item ships with tests, commits, and a clean CI green before moving on.

---

*Started: 2026-06-11. Foundation: 34/34 tests, 12 modules, deployed to GitHub Pages.*
