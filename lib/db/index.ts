import 'server-only'
import type { Timestamp } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'

export const DOG_ID = 'rusty'

export function toISO(ts: Timestamp | undefined | null): string {
  return ts?.toDate().toISOString() ?? new Date().toISOString()
}

export function dogRef() {
  return getAdminDb().collection('dogs').doc(DOG_ID)
}
