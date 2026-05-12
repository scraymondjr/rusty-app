import 'server-only'
import { FieldValue } from 'firebase-admin/firestore'
import { dogRef, toISO } from './index'
import type { ActivityEntry } from '@/types/db'

export async function getActivityEntries(limit = 50): Promise<ActivityEntry[]> {
  const snap = await dogRef()
    .collection('activity_log')
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get()
  return snap.docs.map((doc) => ({
    id: doc.id,
    authorEmail: doc.data().authorEmail ?? '',
    timestamp: toISO(doc.data().timestamp),
    type: doc.data().type ?? 'note',
    content: doc.data().content ?? '',
    attachmentRef: doc.data().attachmentRef,
  }))
}

export async function addActivityEntry(data: {
  authorEmail: string
  type: string
  content: string
  attachmentRef?: string
}): Promise<string> {
  const ref = await dogRef().collection('activity_log').add({
    ...data,
    timestamp: FieldValue.serverTimestamp(),
  })
  return ref.id
}
