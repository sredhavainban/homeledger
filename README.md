# HomeLedger Chat

Chat-first personal finance app: React + TypeScript + Vite + Tailwind, Supabase backend, Vercel hosting.

## Status
Phase 1 of 7: scaffold, schema with RLS, email/password auth, responsive shell, Vercel config.

## Setup
1. `npm install`
2. Create a Supabase project, then run `supabase/schema.sql` in the SQL editor.
3. `cp .env.example .env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings > API).
4. `npm run dev`

## Deploy (Vercel)
Import the repo, add the same two env vars, deploy. `vercel.json` rewrites all routes to the SPA.

## Assumptions
- Default currency INR and timezone Asia/Kolkata (editable in profile settings in a later phase).
- Anthropic key will live only as a Supabase Edge Function secret (phase 4); it is never in `.env`.
- Existing users created before running the schema will not have seeded categories.
