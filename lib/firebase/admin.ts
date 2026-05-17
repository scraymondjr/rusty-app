import 'server-only'
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// Lazy init — runs at request time, not at module import (which would fail during `next build`)
function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]
  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

function getDb() {
  const db = getFirestore(getAdminApp())
  try {
    db.settings({ ignoreUndefinedProperties: true })
  } catch {
    // settings() throws once the client has been used — safe to ignore on subsequent calls
  }
  return db
}

export const getAdminAuth    = () => getAuth(getAdminApp())
export const getAdminDb      = () => getDb()
export const getAdminStorage = () => getStorage(getAdminApp())
