import 'server-only'
import type { Timestamp } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'

export const DOG_ID = 'rusty'

export function toISO(ts: Timestamp | undefined | null): string {
  if (!ts) {
    console.warn('toISO: missing timestamp — Firestore doc may not have been written with FieldValue.serverTimestamp()')
    return ''
  }
  return ts.toDate().toISOString()
}

export function dogRef() {
  return getAdminDb().collection('dogs').doc(DOG_ID)
}
