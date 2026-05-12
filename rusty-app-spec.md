# Rusty App — Implementation Spec

A web app to manage information about Rusty, a Golden Retriever. Combines a public-facing landing page with a private, role-gated dashboard covering medical records, medications, insurance, care instructions, photos, and supply subscriptions.

---

## 1. Overview

- **Domain:** `rusty.scrjr.com` (subdomain of personal domain `scrjr.com`)
- **Primary user:** Owner (Sam)
- **Secondary users:** Family, dog sitters, vet
- **Access model:** Anonymous public landing page + Google-authenticated private dashboard with role-based visibility

---

## 2. Tech stack

**Recommended (lowest-friction path):**

| Concern | Choice |
|---|---|
| Frontend | Next.js (App Router) |
| Hosting | Vercel or Firebase Hosting |
| Auth | Firebase Auth (Google provider only) |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| AI ingestion | Anthropic API (Claude Sonnet, vision + PDF input) |

**Alternative:** Supabase (Postgres + Auth + Storage) if SQL is preferred over a document store. Adjust schema accordingly.

**DNS:** CNAME `rusty.scrjr.com` to the chosen host. SSL is handled by the host.

**Cookie scope:** All session cookies must be scoped to `rusty.scrjr.com` only — NEVER to `.scrjr.com` (would leak sessions to other subdomains).

---

## 3. Authentication & access control

### Sign-in
- Google OAuth only. No email/password, no other providers.
- Register OAuth client in Google Cloud Console with:
  - Authorized JavaScript origin: `https://rusty.scrjr.com`
  - Authorized redirect URI: as required by chosen auth library (e.g. `https://rusty.scrjr.com/api/auth/callback/google` for NextAuth)
  - Also register `http://localhost:3000` (or equivalent) for local dev

### Allowlist model
- An `access` collection maps `email` → `role` + metadata
- On sign-in: check the authenticated user's verified email against `access`; if absent, redirect to an "access denied" page with a "request access" mailto link to the owner
- Public landing page is the only route that does NOT require authentication

### Roles

| Role | Visibility | Notes |
|------|------------|-------|
| `owner` | Everything | Manages allowlist; site settings |
| `family` | Full read; can add activity log entries | No allowlist management |
| `vet` | Medical, medications, vaccinations, weight, attached documents | Can upload medical records |
| `sitter` | Care instructions, emergency, activity log, medications (read-only), basic info | No medical or insurance details |

Only `owner` can modify the allowlist or settings.

### Invite flow
1. Owner enters email + selects role on `/settings/access`
2. Backend creates `access/{email}` record with `invitedAt`
3. App sends an invite email with a link to `rusty.scrjr.com`
4. Recipient signs in with Google
5. Email matches → role assigned → dropped into role-appropriate view

---

## 4. Data model

Top-level collections:

```
dogs/{dogId}                  — single dog for v1; schema supports multiple later
access/{email}                — { role, invitedAt, lastSeenAt }
audit_log/{eventId}           — append-only event stream
```

Subcollections under `dogs/{dogId}`:

```
medical_records/{recordId}
  visitDate, vet, reason, weight, diagnosis, treatment, followUp, notes
  sourceArtifact: storage path to original PDF
  linkedMedicationIds: string[]
  subcollections:
    vaccinations/{vacId}: { name, type, givenDate, expiresDate }

medications/{medId}
  name, dose, frequency, withFood, fillDate, refillsRemaining, instructions
  active: boolean
  sourceArtifact: storage path to original photo/PDF
  prescribedAtRecordId: string (optional, → medical_records id)

weight_entries/{entryId}
  date, weightLbs

insurance/{policyId}
  provider, policyNumber, coverage, documentRef
  subcollection: claims/{claimId}

care_instructions/{singleton}
  feeding[], walks[], quirks, whereThingsAre, notes

emergency_contacts/{contactId}
  name, role, phone, priority

subscriptions/{subId}
  see schema in §6

photos/{photoId}
  storageRef, caption, isPublic, source: 'manual'|'instagram', addedAt, instagramId?

activity_log/{entryId}
  authorEmail, timestamp, type, content, attachmentRef?

documents/{docId}
  generic uploads not tied to a specific record
```

### Subscription schema (detail)

```
subscriptions/{subId}
  name: string                   // "Cosequin DS Plus — joint chews"
  retailer: 'amazon'|'chewy'|'other'
  productUrl: string
  productImage: storageRef
  cadenceDays: number            // 84 for every 12 weeks
  nextShipDate: date
  onHandQuantity: number
  unitName: string               // "chew"|"cup"|"tablet"|"dose"
  unitsPerShipment: number
  pricePerShipment: number
  consumptionRate: {
    ratePerDay: number
    since: date
  }
  consumptionHistory: [{
    ratePerDay: number
    since: date
    reason: string               // "Vet visit — osteoarthritis dx"
    linkedRecordId?: string      // optional → medical_records id
  }]
  linkedMedicationId?: string    // optional → medications id
  active: boolean
  createdAt: date
```

**Runout calculation (computed at read time, NOT stored):**

```
daysOfSupply = onHandQuantity / consumptionRate.ratePerDay
runoutDate = today + daysOfSupply
shipGapDays = (nextShipDate - runoutDate) in days

status =
  shipGapDays > 7  → 'on_track'    (green)
  shipGapDays >= 0 → 'tight'       (amber)
  shipGapDays < 0  → 'action_needed' (red)
```

---

## 5. Screen inventory

### Public (unauthenticated)

**P1. Landing page** (`/`)
- Hero photo of Rusty
- Name, breed, age, short bio
- Photo gallery (only photos with `isPublic: true`)
- Fun facts cards
- "Found me?" contact form (emails owner)
- No medical, schedule, or location detail

### Authenticated

**A1. Owner dashboard** (`/dashboard`)
- Emergency vet banner (pinned site-wide for all authenticated views)
- Metric cards: next dose, next vet visit, active meds, supplies status, last checkup
- Feature cards linking to each tab

**A2. Medical** (`/medical`, `/medical/[id]`, `/medical/new`, `/medical/new/review`)
- List view: chronological visits, vaccination status summary, weight chart
- Detail view of one record
- Add flow: choose PDF upload OR manual entry → review screen → save

**A3. Medications** (`/medications`, `/medications/[id]`, `/medications/new`, `/medications/new/review`)
- List view: active medications + recently completed
- Add flow: photo / PDF / manual → review screen → save
- Detail view: dose schedule, instructions, source artifact, refill tracking

**A4. Insurance** (`/insurance`)
- Policy details, claim history, document attachments

**A5. Care instructions** (`/care`)
- Same data, two presentations:
  - **Owner edit mode:** all fields editable, full nav
  - **Sitter view:** cross-tab nav hidden, emergency + quirks + "where things are" promoted to top, "Log activity" button prominent

**A6. Supplies** (`/supplies`, `/supplies/[id]`)
- List view: inventory bars per subscription, action-needed alert at top
- Detail view: inventory math, consumption rate with history, recent activity, linked medication, actions (log shipment, adjust on-hand, pause, cancel, "ship sooner" — disabled in v1)

**A7. Photos** (`/photos`)
- Grid of all photos
- Source badges (manual / Instagram), public/private indicator
- Upload + caption flow with "Show on public page" toggle

**A8. Activity log** (`/activity`)
- Chronological feed of care entries
- Add entry button (sitters write here)

**A9. Settings → Access** (`/settings/access`, owner-only)
- Table of allowlisted people: name, email, role, last seen, revoke button
- Invite form: email + role select + send

---

## 6. AI ingestion pattern

Shared service used by Medical and Medications.

### Interface

```
extract(file: File, schema: JSONSchema, context?: string) → ExtractedFields
```

### Flow

1. User uploads photo (mobile camera or file picker) or PDF
2. File is sent to Anthropic API in a single call with:
   - The image or PDF as a content block
   - A prompt: "Extract these fields from this {medication label | vet record}. Return JSON matching this schema: {schema}. For each field, also return a confidence flag: 'high' | 'medium' | 'low'."
3. Response parsed and used to pre-fill the review form
4. Low-confidence fields highlighted with a different border color in the UI
5. User reviews, edits, saves
6. Save structured record AND keep original artifact in Storage with reference

### Critical constraints

- **Never auto-save extracted data.** Always route through the review form.
- **Always show source thumbnail next to fields** during review so user can cross-check
- **Multi-page PDFs:** preview supports page navigation
- **Multi-medication PDFs:** allow splitting one extraction into multiple records via "Add as medication" buttons
- **Failed/empty extractions:** fall through to manual entry form, with the artifact pre-attached
- **Linked medications from medical records:** when a medical record mentions a prescription, surface an "Add as medication" action that opens the medication review pre-filled from the same source

### Medical record extraction — fields

`visitDate`, `vet`, `reason`, `weight`, `diagnosis`, `treatment`, `vaccinations[]` (each: name, type, givenDate, expiresDate), `medicationsPrescribed[]` (each: name, dose, frequency, instructions), `followUp`, `notes`

### Medication extraction — fields

`drugName`, `dose`, `frequency`, `withFood`, `prescribingVet`, `fillDate`, `refillsRemaining`, `instructions`, `warnings`

### Privacy note

Anthropic API does not train on inputs by default. Mention this in the invite-acceptance flow when granting vet access.

---

## 7. Phased build plan

### v1 — usable baseline

**Phase 1 — Foundation** (~weekend)
- Stack setup, domain, Google sign-in working
- Baseline Firestore security rules (deny-all default)
- Hello-world deployed at `rusty.scrjr.com` that authenticates owner

**Phase 2 — Core data** (~1 week)
- Schemas + manual entry forms for: medical, medications, insurance, care, emergency contacts, weight, photos
- PDF/image attachment upload (no parsing yet)
- Emergency banner component, applied to all authenticated layouts
- Owner dashboard with metric cards (data manually populated where automated reasoning not yet implemented)

**Phase 3 — Roles & sharing** (~1 week)
- `access` collection + management UI
- Invite flow + invite email
- Role-filtered views, sitter and vet variants
- Revoke

**Phase 4 — Public page** (~2-3 days)
- Landing, photo gallery, contact form
- Fully mobile responsive (QR code from collar tag will land here)

**→ Ship v1**

### v1.5 — smart upgrades

**Phase 5 — AI ingestion** (~1 week)
- Anthropic API integration
- Review screens for medical and medication ingestion
- Source artifact storage and retrieval

**Phase 6 — Subscriptions** (~1 week)
- Schema, list view, detail view, runout math
- "Action needed" alerts
- Dashboard supplies card

**Phase 7 — Polish** (~ongoing)
- Reminders (dose, refill, vaccination expiration)
- Weight trend chart
- Mobile pass on all screens
- Accessibility audit

**→ Ship v1.5**

### Beyond v1.5 (do NOT build in v1; design slots only)

**Phase 8 — Instagram (read-only)** (~1 week + Meta review)
- Convert Rusty's IG to Creator account
- Meta dev app registration, app review for `instagram_basic` scope
- OAuth flow with 50-day token refresh job
- Pull-only import to gallery; photos badged with source

**Phase 9 — Retailer APIs** (~2-3 weeks)
- Chewy and Amazon order history reading
- Auto-increment on-hand from received shipments
- Wire up "Ship sooner" action (disabled placeholder exists in v1)

**Phase 10 — Stretch**
- Instagram publishing (additional Meta review)
- Multi-pet support
- Native mobile apps

---

## 8. Routing structure

```
/                              public landing
/dashboard                     owner dashboard
/medical                       list
/medical/[id]                  detail
/medical/new                   entry method picker
/medical/new/review            review extraction
/medications                   list
/medications/[id]              detail
/medications/new               entry method picker
/medications/new/review        review extraction
/insurance                     list/detail
/care                          care instructions (role-adapted)
/supplies                      subscription list
/supplies/[id]                 subscription detail
/photos                        photo manager
/activity                      activity log
/settings/access               allowlist management (owner only)
```

---

## 9. Security rules sketch (Firestore)

Every document under `dogs/{dogId}` must check the requesting user's email against `access/{email}`.

```
function hasAccess(roles) {
  return request.auth != null
    && request.auth.token.email_verified == true
    && exists(/databases/$(database)/documents/access/$(request.auth.token.email))
    && get(/databases/$(database)/documents/access/$(request.auth.token.email)).data.role in roles;
}

match /dogs/{dogId}/medical_records/{recordId} {
  allow read:  if hasAccess(['owner', 'family', 'vet']);
  allow write: if hasAccess(['owner', 'vet']);
}

match /dogs/{dogId}/medications/{medId} {
  allow read:  if hasAccess(['owner', 'family', 'vet', 'sitter']);
  allow write: if hasAccess(['owner', 'vet']);
}

match /dogs/{dogId}/insurance/{policyId} {
  allow read:  if hasAccess(['owner', 'family']);
  allow write: if hasAccess(['owner']);
}

match /dogs/{dogId}/care_instructions/{doc} {
  allow read:  if hasAccess(['owner', 'family', 'vet', 'sitter']);
  allow write: if hasAccess(['owner', 'family']);
}

match /dogs/{dogId}/subscriptions/{subId} {
  allow read:  if hasAccess(['owner']);
  allow write: if hasAccess(['owner']);
}

match /dogs/{dogId}/photos/{photoId} {
  allow read:  if resource.data.isPublic == true || hasAccess(['owner', 'family', 'vet', 'sitter']);
  allow write: if hasAccess(['owner', 'family']);
}

match /access/{email} {
  allow read:  if request.auth != null && request.auth.token.email == email;
  allow write: if hasAccess(['owner']);
}
```

Storage rules should mirror this — private files require auth, public photos check `isPublic` flag.

---

## 10. Design constraints (do NOT violate)

- **Never auto-save AI-extracted data.** Always route through review.
- **The public landing page must NEVER query private collections.** Public photos are served via a hard query filter `where('isPublic', '==', true)`.
- **Cookies scoped to `rusty.scrjr.com` only.** Never `.scrjr.com`.
- **No `localStorage` for sensitive data.** Session state goes through the auth library.
- **No native mobile apps in v1.** Responsive web only.
- **Emergency banner must be present on every authenticated screen.** Phone number tappable on mobile.

---

## 11. Design slots reserved for future phases

These should be visible (but disabled or empty) in v1 so the Phase 5+ work plugs in cleanly:

- **Source artifact field** on `medical_records` and `medications` — start populating from Phase 2 (just the PDF, no extraction yet)
- **"Ship sooner" button** on subscription detail — disabled, labeled "soon"
- **Multi-pet shape in schema** — `dogs` is already a collection; UI assumes one dog but database does not
- **Photo source badge** — set every Phase 2 photo's source to `'manual'` so the badge logic works when Instagram lands

---

## 12. Open questions to confirm before starting

1. Firebase vs Supabase — decision affects schema syntax but not screen design
2. Reminders: email, push, or both?
3. Activity log: real-time collaborative (sitter posts updates while you're away) or batched?
4. Will a QR code on Rusty's collar tag point to the public page? If yes, optimize the public page mobile layout for emergency contact above the fold.
5. Confirm Rusty's actual data (vet name, insurance provider, current medications, subscriptions) before building — or scaffold with placeholder data and import later?

---

## 13. Starting point for Claude Code

Suggested first session goals:

1. Scaffold Next.js app with Firebase Auth and Google sign-in
2. Set up Firestore with the deny-all default rules
3. Seed `access/sam@scrjr.com` with role `owner` manually via Firebase console
4. Implement the owner dashboard shell with the emergency banner component and metric card placeholders
5. Deploy to `rusty.scrjr.com` and verify end-to-end auth

That is the Phase 1 deliverable. Phase 2 begins immediately after with the medical and medications forms.
