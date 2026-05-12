import 'server-only'
import { dogRef } from './index'
import type { EmergencyContact } from '@/types/db'

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const snap = await dogRef().collection('emergency_contacts').orderBy('priority').get()
  return snap.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name ?? '',
    role: doc.data().role ?? '',
    phone: doc.data().phone ?? '',
    priority: doc.data().priority ?? 99,
  }))
}

export async function createEmergencyContact(
  data: Omit<EmergencyContact, 'id'>,
): Promise<string> {
  const ref = await dogRef().collection('emergency_contacts').add(data)
  return ref.id
}

export async function updateEmergencyContact(
  id: string,
  data: Partial<Omit<EmergencyContact, 'id'>>,
): Promise<void> {
  await dogRef().collection('emergency_contacts').doc(id).update(data)
}

export async function deleteEmergencyContact(id: string): Promise<void> {
  await dogRef().collection('emergency_contacts').doc(id).delete()
}
