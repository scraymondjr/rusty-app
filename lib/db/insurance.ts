import 'server-only'
import { FieldValue } from 'firebase-admin/firestore'
import { dogRef, toISO } from './index'
import type { InsurancePolicy } from '@/types/db'

export async function getInsurancePolicies(): Promise<InsurancePolicy[]> {
  const snap = await dogRef().collection('insurance').orderBy('createdAt', 'desc').get()
  return snap.docs.map((doc) => ({
    id: doc.id,
    provider: doc.data().provider ?? '',
    policyNumber: doc.data().policyNumber ?? '',
    coverage: doc.data().coverage,
    documentRef: doc.data().documentRef,
    createdAt: toISO(doc.data().createdAt),
  }))
}

export async function createInsurancePolicy(
  data: Omit<InsurancePolicy, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await dogRef().collection('insurance').add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateInsurancePolicy(
  id: string,
  data: Partial<Omit<InsurancePolicy, 'id' | 'createdAt'>>,
): Promise<void> {
  await dogRef().collection('insurance').doc(id).update(data)
}

export async function deleteInsurancePolicy(id: string): Promise<void> {
  await dogRef().collection('insurance').doc(id).delete()
}
