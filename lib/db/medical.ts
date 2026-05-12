import 'server-only'
import { FieldValue } from 'firebase-admin/firestore'
import { dogRef, toISO } from './index'
import { getSignedUrl } from '@/lib/storage'
import type { MedicalRecord } from '@/types/db'

export async function getMedicalRecords(): Promise<MedicalRecord[]> {
  const snap = await dogRef()
    .collection('medical_records')
    .orderBy('visitDate', 'desc')
    .get()

  return Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        visitDate: d.visitDate ?? '',
        vet: d.vet ?? '',
        reason: d.reason ?? '',
        weight: d.weight,
        diagnosis: d.diagnosis,
        treatment: d.treatment,
        followUp: d.followUp,
        notes: d.notes,
        sourceArtifact: d.sourceArtifact,
        sourceArtifactUrl: d.sourceArtifact ? await getSignedUrl(d.sourceArtifact).catch(() => undefined) : undefined,
        linkedMedicationIds: d.linkedMedicationIds ?? [],
        createdAt: toISO(d.createdAt),
      } satisfies MedicalRecord
    }),
  )
}

export async function getMedicalRecord(id: string): Promise<MedicalRecord | null> {
  const doc = await dogRef().collection('medical_records').doc(id).get()
  if (!doc.exists) return null
  const d = doc.data()!
  return {
    id: doc.id,
    visitDate: d.visitDate ?? '',
    vet: d.vet ?? '',
    reason: d.reason ?? '',
    weight: d.weight,
    diagnosis: d.diagnosis,
    treatment: d.treatment,
    followUp: d.followUp,
    notes: d.notes,
    sourceArtifact: d.sourceArtifact,
    sourceArtifactUrl: d.sourceArtifact ? await getSignedUrl(d.sourceArtifact).catch(() => undefined) : undefined,
    linkedMedicationIds: d.linkedMedicationIds ?? [],
    createdAt: toISO(d.createdAt),
  }
}

export async function createMedicalRecord(
  data: Omit<MedicalRecord, 'id' | 'createdAt' | 'sourceArtifactUrl' | 'linkedMedicationIds'>,
): Promise<string> {
  const ref = await dogRef().collection('medical_records').add({
    ...data,
    linkedMedicationIds: [],
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateMedicalRecord(
  id: string,
  data: Partial<Omit<MedicalRecord, 'id' | 'createdAt' | 'sourceArtifactUrl'>>,
): Promise<void> {
  await dogRef().collection('medical_records').doc(id).update(data)
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  await dogRef().collection('medical_records').doc(id).delete()
}

export async function getLatestMedicalRecord(): Promise<MedicalRecord | null> {
  const snap = await dogRef()
    .collection('medical_records')
    .orderBy('visitDate', 'desc')
    .limit(1)
    .get()
  if (snap.empty) return null
  const doc = snap.docs[0]
  const d = doc.data()
  return {
    id: doc.id,
    visitDate: d.visitDate ?? '',
    vet: d.vet ?? '',
    reason: d.reason ?? '',
    weight: d.weight,
    diagnosis: d.diagnosis,
    treatment: d.treatment,
    followUp: d.followUp,
    notes: d.notes,
    sourceArtifact: d.sourceArtifact,
    linkedMedicationIds: d.linkedMedicationIds ?? [],
    createdAt: toISO(d.createdAt),
  }
}
