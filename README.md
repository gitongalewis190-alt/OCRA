# OCRA

Optimised Career & Results Analytics. The app opens straight into the personal dashboard. Sign-in is required to reach it.

## Stack

- Next.js 15 (App Router, TypeScript)
- Supabase (Postgres, Auth, RLS)
- Claude API (cached responses), M-Pesa Daraja, Africa's Talking
- Vitest for unit tests

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values.
3. Run the migrations in order in the Supabase SQL editor:
   - `supabase/migrations/0001_personal_foundation.sql`
   - `supabase/migrations/0002_foundation_expansion.sql`
4. In Supabase Auth settings, enable email confirmation and set the site URL to `NEXT_PUBLIC_SITE_URL`.
5. `npm run dev`, then open http://localhost:3000.

## Scripts

- `npm run dev` start locally
- `npm run typecheck` TypeScript check
- `npm test` unit tests
- `npm run build` production build

## Structure

- `app/` routes: `/` (personal dashboard), `/login`, `/signup`, `/auth/callback`, `/admin` (staff), `/api/mpesa/callback` (webhook)
- `app/auth/` sign-up, sign-in, sign-out actions and the email callback
- `components/dashboard/` dashboard shell, account summary, profile form
- `features/` feature logic, one folder per area: `profile`, `students`, `brain-test`, `careers`, `reports`, `payments`, `notifications`; `registry.ts` lists dashboard modules
- `lib/auth/` session guard and role guard
- `lib/config/` server-only environment access
- `lib/external/` Claude, M-Pesa and Africa's Talking clients (server only)
- `lib/supabase/` browser-safe env, server client, admin client (service role, server only)
- `lib/validation/` shared rules: password, profile, student, phone
- `supabase/migrations/` schema, row-level security, audit

## Access model

- Users see only what row-level security allows: their own profile, their families, organisations they belong to, and students they can read.
- Staff (`admin`, `developer`) read across records and manage career entries.
- Payments, entitlements, memberships, AI cache and career enrichment are written only by server code with the service-role key.
- Account type and role cannot be changed by users.
- Every change to profiles, students, academic records, careers, reports and payments is logged in `audit_log`.

## Security notes

- The service-role key bypasses row-level security. It must never reach the browser or a `NEXT_PUBLIC_` variable.
- The M-Pesa callback is public because Safaricom cannot sign in. It only completes payments that match a pending record and the paid amount.
- Deletion is soft (`deleted_at`). A 30-day purge job is planned.
