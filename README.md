# Campus Shield & Verify

Proof of what's real.

Web portal that proves what is real instead of guessing what is fake using exact cryptographic SHA-256 fingerprints.

## Golden Hash

Golden SHA-256 hash of the first seed file (`seed-assets/official/memorandum-2026-001.png`):
```
6e2a05566a4d9e654afad23570b73e5c09d8b8848c70c8e43190c0b17fa8d865
```

## Setup & Deployment

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env.local` and set your server-only Supabase credentials:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Database initialization:**
   Execute `supabase/schema.sql` in the Supabase SQL Editor to create tables (`verified_records`, `reports`), enum (`report_status`), indexes, RLS, and storage buckets (`official-files`, `report-files`).

4. **Seed database:**
   ```bash
   node --env-file=.env.local scripts/seed.mjs
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Preflight check:**
   Verify all demo files against your running local server or deployed Vercel URL:
   ```bash
   node scripts/preflight.mjs http://localhost:3000
   # or
   node scripts/preflight.mjs https://your-project.vercel.app
   ```

## Environment Variables

- `SUPABASE_URL`: Supabase project URL (server-side only, never exposed to browser)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only, bypasses RLS)

## AI Usage Declaration

In accordance with HackFest guidelines, the following AI tools and models were used during the development of this project:

- **AI Assistants & Models:** Google DeepMind Antigravity agentic coding assistant with Gemini 3.8 Flash (High).
- **Architecture & Scaffolding:** Initial Next.js project setup and dependency configuration following the project specification.
- **Backend & Schemas:** Supabase schema design (`supabase/schema.sql`), Zod contract definitions and mappers (`lib/types.ts`), cryptographic hashing utilities (`lib/hash.ts`), file validation (`lib/validateFile.ts`), and API route handlers (`app/api/stamp`, `app/api/records`, `app/api/verify`, `app/api/reports`).
- **Frontend Pages & Components:** Implementation of user and official workflows (`/`, `/verify`, `/stamp`, `/queue`) and shared components (`Header`, `RoleToggle`, `FileDrop`, `ResultBanner`, `StatusBadge`).
- **Automated Scripts:** Database seeding script (`scripts/seed.mjs`) and preflight verification testing harness (`scripts/preflight.mjs`).
