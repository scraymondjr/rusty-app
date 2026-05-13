# Rusty App — Remaining Tasks

Items from the Phase 3 review that haven't been fixed yet, ordered by priority.

---

## Medium priority

- **PWA icons missing** — `/public/icons/` directory has no actual image files. `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` are referenced in `manifest.json` and `app/layout.tsx` but don't exist. Home screen installs show a blank icon on iOS/Android.

- **Emergency contact edit UI** — Contacts can only be added or deleted. Fixing a typo in a phone number requires delete + re-add. `editEmergencyContact` action exists in `care/actions.ts` but there is no edit UI in `emergency-contacts-list.tsx`.

- **Session cookie `domain` hardcoded** — `lib/auth/session.ts:21` has `domain: 'rusty.scrjr.com'` hardcoded. This will silently break cookie setting on preview/staging deployments. Move to `process.env.COOKIE_DOMAIN`.

- **`checkRevoked: true` on every request** — `lib/auth/session.ts:31` makes a Firebase Auth network call on every authenticated page load, adding ~100–300ms of latency. Switch to `checkRevoked: false` for normal requests; only check revocation during sensitive operations.

- **Insurance form missing fields** — Only captures `provider`, `policyNumber`, and free-form `coverage`. Missing: coverage limit ($/year), deductible, reimbursement rate, provider phone/email, policy start/end dates. These are needed for Phase 4 claims tracking.

- **Photos role guard** — No `layout.tsx` in `app/(auth)/photos/`. Vets and sitters can currently browse the full photo gallery. Decide intentionally whether this is desired and either add a `layout.tsx` guard or document the decision.

- **`URL.createObjectURL` memory leak** — `app/(auth)/photos/photo-upload.tsx:20` creates a blob URL for preview but never calls `URL.revokeObjectURL`. Add a `useEffect` cleanup.

- **Upload body size limit mismatch** — `app/api/upload/route.ts` advertises a 20 MB limit but Next.js Route Handlers cap at ~4.5 MB by default. Either lower `MAX_SIZE_BYTES` to match reality or configure `bodySizeLimit` in `next.config.ts`.

---

## Low priority

- **`next.config.ts` `remotePatterns` too broad** — `hostname: 'firebasestorage.googleapis.com'` with no `pathname` allows `<Image>` to proxy content from any Firebase Storage bucket on that host. Scope to the app's own bucket path.

- **Plain `<img>` in photo grid** — `app/(auth)/photos/photo-grid.tsx:12` uses `<img>` instead of Next.js `<Image>`. Bypasses lazy-loading, optimization, and layout-shift protection.

- **`lastSeenAt` never updated** — The `lastSeenAt` field on access records is never written after sign-in. Update it in `app/api/auth/signin/route.ts` so owners can see when each person last used the app.

- **Optimistic access table revert on error** — `app/(auth)/settings/access/access-table.tsx` updates role/revoke state optimistically but doesn't revert on server error. If the action fails the UI shows a stale state until the next reload.

- **Inlined Firestore call in access page** — `app/(auth)/settings/access/page.tsx:23` calls `getAdminDb()` directly instead of going through `lib/db/`. Extract to a `listAccessEntries()` helper in `lib/db/access.ts`.

- **`getAdminApp()[0]` assumption** — `lib/firebase/admin.ts:9` uses `getApps()[0]` which returns the first initialized app. Use a named app or `getApp()` for the default to avoid returning the wrong app if another library initialises Firebase first.

- **Magic-bytes file validation** — `app/api/upload/route.ts` trusts `Content-Type` from the client. A file named `shell.jpg` with PHP content passes through. Add a magic-bytes check on `buffer` for JPEG/PNG/WebP/PDF signatures. The `file-type` npm package handles this in two lines.

- **Vaccination type has no DB layer** — `types/db.ts` defines a `Vaccination` interface but there is no `lib/db/vaccinations.ts` with CRUD operations. The feature is non-functional. Either implement or remove until needed.

- **`dangling linkedMedicationIds`** — `MedicalRecord.linkedMedicationIds` stores medication IDs. When a medication is deleted, those references aren't cleaned up. `deleteMedication` in `lib/db/medications.ts` should remove the ID from all referencing medical records.
