# Rusty App — Setup Guide

Everything you need to do outside of Vercel to get the app fully working.

---

## 1. Firebase Project

Go to [console.firebase.google.com](https://console.firebase.google.com) → Create project → name it `rusty-app`.

### Enable Authentication
- Authentication → Sign-in method → **Google** → Enable
- Authentication → Settings → Authorized domains → Add `rusty.scrjr.com`
  (localhost is included by default for dev)

### Enable Firestore
- Firestore Database → Create database → **Start in production mode**
- Choose a region (e.g. `us-central1`)

### Get web app credentials
- Project Settings → Your Apps → Add app → Web
- Copy the `firebaseConfig` object — needed for Vercel env vars (step 2)

### Get service account credentials (Admin SDK)
- Project Settings → Service Accounts → Generate new private key
- Download the JSON — keep it secure, never commit it

---

## 2. Vercel Environment Variables

Vercel project dashboard → Settings → Environment Variables.

**From the web app `firebaseConfig`:**

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |

**From the service account JSON:**

| Variable | JSON field |
|---|---|
| `FIREBASE_ADMIN_PROJECT_ID` | `project_id` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `client_email` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | `private_key` |

**App config:**

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://rusty.scrjr.com` |
| `OWNER_EMAIL` | your Google account email |

> **Private key gotcha:** Paste the `private_key` value exactly as it appears in the JSON,
> including the `-----BEGIN...` header and literal `\n` characters. Do not replace `\n` with
> real newlines — Vercel handles them correctly as-is.

After adding all env vars, **trigger a redeploy** — Vercel doesn't pick them up automatically.

---

## 3. Deploy Firestore Security Rules

The rules live in `firestore.rules` but haven't been pushed to Firebase yet.

```bash
npm install -g firebase-tools
firebase login

# Update .firebaserc — replace YOUR_FIREBASE_PROJECT_ID with your actual project ID
firebase use <your-project-id>

firebase deploy --only firestore:rules
```

---

## 4. Seed the Owner Record

Your email must exist in the `access` Firestore collection before you can sign in.

Firebase Console → Firestore → **+ Start collection**

- Collection ID: `access`
- Document ID: your full Google email (e.g. `scraymondjr@gmail.com`)
- Fields:
  | Field | Type | Value |
  |---|---|---|
  | `role` | string | `owner` |
  | `invitedAt` | timestamp | (now) |

---

## 5. DNS — Point rusty.scrjr.com to Vercel

In your DNS provider (wherever `scrjr.com` is managed):

- Add a **CNAME** record:
  - Name: `rusty`
  - Value: your Vercel project URL (e.g. `rusty-app-abc123.vercel.app`)

Then in Vercel → your project → **Domains** → Add `rusty.scrjr.com`.
Vercel provisions SSL automatically once the CNAME propagates.

---

## 6. Google Cloud OAuth — Authorize the Domain

Firebase usually handles this when you add the authorized domain, but verify it:

- [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
- Open your **OAuth 2.0 Client ID**
- **Authorized JavaScript origins:** add `https://rusty.scrjr.com`
- **Authorized redirect URIs:** add `https://rusty.scrjr.com/__/auth/handler`

---

## Checklist

- [ ] Firebase project created
- [ ] Google Auth enabled + `rusty.scrjr.com` added as authorized domain
- [ ] Firestore database created (production mode)
- [ ] Web app registered, `firebaseConfig` values copied
- [ ] Service account private key downloaded
- [ ] All env vars added in Vercel
- [ ] Redeployed after adding env vars
- [ ] `.firebaserc` updated with real project ID
- [ ] `firebase deploy --only firestore:rules` run
- [ ] `access/<your-email>` document seeded with `role: owner`
- [ ] CNAME `rusty` → Vercel added in DNS
- [ ] `rusty.scrjr.com` added in Vercel Domains
- [ ] OAuth client authorized origins + redirect URIs updated in Google Cloud Console

---

## Local Development

```bash
cp .env.local.example .env.local
# Fill in .env.local with your Firebase credentials

npm install
npm run dev
# → http://localhost:3000
```

For local dev, Firebase Auth allows `localhost` by default — no extra configuration needed.
