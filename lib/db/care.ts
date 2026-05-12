import 'server-only'
import { FieldValue } from 'firebase-admin/firestore'
import { dogRef, toISO } from './index'
import type { CareInstructions } from '@/types/db'

const CARE_DOC_ID = 'main'

export async function getCareInstructions(): Promise<CareInstructions | null> {
  const doc = await dogRef().collection('care_instructions').doc(CARE_DOC_ID).get()
  if (!doc.exists) return null
  const d = doc.data()!
  return {
    feeding: d.feeding ?? '',
    walks: d.walks ?? '',
    quirks: d.quirks ?? '',
    whereThingsAre: d.whereThingsAre ?? '',
    notes: d.notes ?? '',
    updatedAt: toISO(d.updatedAt),
  }
}

export async function saveCareInstructions(data: Omit<CareInstructions, 'updatedAt'>): Promise<void> {
  await dogRef()
    .collection('care_instructions')
    .doc(CARE_DOC_ID)
    .set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
}
