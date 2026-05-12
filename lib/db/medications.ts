import 'server-only'
import { FieldValue } from 'firebase-admin/firestore'
import { dogRef, toISO } from './index'
import { getSignedUrl } from '@/lib/storage'
import type { Medication } from '@/types/db'

function docToMedication(doc: FirebaseFirestore.DocumentSnapshot, url?: string): Medication {
  const d = doc.data()!
  return {
    id: doc.id,
    name: d.name ?? '',
    dose: d.dose ?? '',
    frequency: d.frequency ?? '',
    withFood: d.withFood ?? false,
    fillDate: d.fillDate,
    refillsRemaining: d.refillsRemaining,
    instructions: d.instructions,
    active: d.active ?? true,
    sourceArtifact: d.sourceArtifact,
    sourceArtifactUrl: url,
    prescribedAtRecordId: d.prescribedAtRecordId,
    createdAt: toISO(d.createdAt),
  }
}

export async function getMedications(activeOnly = false): Promise<Medication[]> {
  let query = dogRef().collection('medications').orderBy('createdAt', 'desc') as FirebaseFirestore.Query
  if (activeOnly) query = query.where('active', '==', true)
  const snap = await query.get()
  return Promise.all(
    snap.docs.map(async (doc) => {
      const url = doc.data().sourceArtifact
        ? await getSignedUrl(doc.data().sourceArtifact).catch(() => undefined)
        : undefined
      return docToMedication(doc, url)
    }),
  )
}

export async function getMedication(id: string): Promise<Medication | null> {
  const doc = await dogRef().collection('medications').doc(id).get()
  if (!doc.exists) return null
  const url = doc.data()?.sourceArtifact
    ? await getSignedUrl(doc.data()!.sourceArtifact).catch(() => undefined)
    : undefined
  return docToMedication(doc, url)
}

export async function createMedication(
  data: Omit<Medication, 'id' | 'createdAt' | 'sourceArtifactUrl'>,
): Promise<string> {
  const ref = await dogRef().collection('medications').add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateMedication(
  id: string,
  data: Partial<Omit<Medication, 'id' | 'createdAt' | 'sourceArtifactUrl'>>,
): Promise<void> {
  await dogRef().collection('medications').doc(id).update(data)
}

export async function deleteMedication(id: string): Promise<void> {
  await dogRef().collection('medications').doc(id).delete()
}

export async function countActiveMedications(): Promise<number> {
  const snap = await dogRef().collection('medications').where('active', '==', true).count().get()
  return snap.data().count
}
