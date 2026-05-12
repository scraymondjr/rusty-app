# Rusty App

A private care dashboard for Rusty, a Golden Retriever. Combines a public-facing landing page with a role-gated dashboard covering medical records, medications, insurance, care instructions, photos, and supply subscriptions.

**Live site:** [rusty.scrjr.com](https://rusty.scrjr.com)

---

## Stack

| Concern | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Hosting | Vercel |
| Auth | Firebase Auth (Google OAuth only) |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| AI ingestion | Anthropic API — Claude Sonnet (Phase 5) |

---

## Access model

Sign-in is Google OAuth only. Access is controlled by an allowlist in Firestore (`access/{email}`).
Users not in the allowlist are redirected to an access-denied page with a mailto link to the owner.

| Role | Access |
|---|---|
| `owner` | Everything + access management |
| `family` | Full read, can add activity log entries and photos |
| `vet` | Medical records, medications, vaccinations, can upload documents |
| `sitter` | Care instructions, medications (read), activity log |

---

## Development setup

See **[SETUP.md](./SETUP.md)** for the complete step-by-step guide including:
- Firebase project configuration (Auth, Firestore, Storage)
- Required Vercel environment variables
- Deploying Firestore and Storage security rules
- Seeding the owner record
- DNS and domain configuration

```bash
cp .env.local.example .env.local   # fill in Firebase credentials
npm install
npm run dev                         # → http://localhost:3000
```

---

## Build & deploy

```bash
npm run build    # type-check + production build
npm run lint     # ESLint
```

Vercel deploys automatically on push to `main`. After merging changes to
`firestore.rules` or `storage.rules`, also run:

```bash
firebase deploy --only firestore:rules,storage
```

---

## Phase status

| Phase | Description | Status |
|---|---|---|
| 1 | Foundation — Next.js + Firebase Auth + Vercel deploy | ✅ Done |
| 2 | Core data — all manual entry forms, file upload, live dashboard | ✅ Done |
| 3 | Roles & sharing — invite flow, role-filtered views | ⬜ Next |
| 4 | Public landing page | ⬜ |
| 5 | AI ingestion — Anthropic API, review screens | ⬜ |
| 6 | Subscriptions — supply tracking, runout math | ⬜ |
| 7 | Polish — reminders, weight chart, accessibility | ⬜ |

See `rusty-app-spec.md` for the full specification.

---

## Project structure

```
app/
  (auth)/          — protected routes (session-verified layout)
    dashboard/
    medical/
    medications/
    care/
    insurance/
    photos/
    activity/
    settings/access/
  api/
    auth/          — sign-in / sign-out
    upload/        — file upload to Firebase Storage
  page.tsx         — public sign-in / landing page

components/
  nav.tsx          — sidebar (desktop) + mobile drawer + bottom tab bar
  emergency-banner.tsx — pulls live data from emergency_contacts collection
  page-shell.tsx   — shared page wrapper (title, back button, action)

lib/
  auth/session.ts  — session cookie create/verify/clear (server-only)
  db/              — Firestore CRUD helpers for every collection
  firebase/
    admin.ts       — lazy-init Firebase Admin SDK
    client.ts      — Firebase client SDK
  storage/         — file upload + signed URL generation

types/
  index.ts         — auth types (AccessRole, SessionUser)
  db.ts            — Firestore data model types (serializable)

firestore.rules    — Firestore security rules
storage.rules      — Firebase Storage security rules
```
