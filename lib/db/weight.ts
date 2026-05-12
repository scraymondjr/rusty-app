import 'server-only'
import { FieldValue } from 'firebase-admin/firestore'
import { dogRef } from './index'
import type { WeightEntry } from '@/types/db'

export async function getWeightEntries(): Promise<WeightEntry[]> {
  const snap = await dogRef().collection('weight_entries').orderBy('date', 'desc').get()
  return snap.docs.map((doc) => ({
    id: doc.id,
    date: doc.data().date ?? '',
    weightLbs: doc.data().weightLbs ?? 0,
  }))
}

export async function addWeightEntry(data: Omit<WeightEntry, 'id'>): Promise<string> {
  const ref = await dogRef().collection('weight_entries').add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function deleteWeightEntry(id: string): Promise<void> {
  await dogRef().collection('weight_entries').doc(id).delete()
}
