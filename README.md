# MVCC Moms Connect — Playdate Calendar

A mobile-first playdate calendar for January–May 2027. Visitors browse
read-only; the five DGLs (group leaders) add and manage playdates behind a
shared passcode.

## Stack

- **Next.js** (App Router, TypeScript) — the site itself, deployed to **Vercel**
- **Supabase** (Postgres) — stores playdates and the audit history
- No user accounts anywhere — see "How the DGL passcode works" below

## 1. Set up Supabase

1. Create a new project at supabase.com.
2. Open the SQL editor and run `supabase/schema.sql` in full.
3. Go to Project Settings → API and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this one secret — never put it in the browser)

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DGL_PASSCODE=DGL2027
```

Change `DGL_PASSCODE` to whatever you want the five DGLs to actually use —
treat it like a shared door code, not a secret worth much rigor.

## 3. Run locally

```
npm install
npm run dev
```

Visit `http://localhost:3000` for the public calendar, `/admin` for the DGL
tools.

## 4. Deploy

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the same four environment variables in Vercel's project settings
   (Settings → Environment Variables) — `.env.local` is never committed or
   deployed.
4. Deploy. Generate your QR code pointing at the deployed root URL.

## How the DGL passcode works

There's no login for DGLs — just a shared code (`DGL_PASSCODE`), by design.
A few things worth understanding about how that's implemented safely:

- The code lives only in a server-side environment variable. It is never
  sent to the browser as part of the page.
- Every write (add, edit, move, cancel, weather update, delete) goes through
  a Next.js API route, which re-checks the submitted code against that env
  variable on every single request — a device "remembering" the code
  client-side is never trusted on its own.
- The actual Supabase `service_role` key (which can write to the database
  directly) is only ever used inside those API routes, never shipped to the
  browser.
- `localStorage` is used only to save a device from re-typing the code and
  to prefill the DGL's name as host — pure convenience, not security.
- The `/api/auth/verify` endpoint is rate-limited (5 failed attempts per 15
  minutes per IP) to blunt casual guessing.

If a DGL leaves the group or you want to rotate the code, just change
`DGL_PASSCODE` in Vercel and redeploy — every device's saved code stops
working immediately.

## Data model notes

- **Soft delete only.** Deleting a playdate never removes the row — it sets
  `is_deleted = true`. The public calendar filters these out. DGLs are
  instructed in the UI to use "Mark cancelled" for real cancellations, and
  a confirmation step warns them before a true delete.
- **Moves preserve history.** `original_date` / `original_start_time` /
  `original_end_time` are set once, on the *first* move, and never
  overwritten by later moves — so a chain of moves always points back to
  what was originally announced. The public calendar shows a small "moved
  to [date]" note on the original date and the full event on the new one.
- **`playdate_history`** logs every create/edit/move/cancel/weather-update/
  delete with before/after snapshots. It's not exposed in the DGL UI in V1
  — it's a backend safety net, queryable directly in the Supabase dashboard
  if something needs investigating.
- **CSV backup**: `/admin` has a "Download full backup (CSV)" link that
  exports every playdate (including soft-deleted ones) for manual backup.

## Default month logic

The app only ever covers Jan–May 2027 (`lib/dateDefaults.ts`):
- Before Jan 1, 2027 → opens to January 2027
- During the season → opens to the current month
- After May 31, 2027 → opens to May 2027

Month navigation is disabled outside that range.
