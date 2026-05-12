'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/authorize'
import { saveCareInstructions } from '@/lib/db/care'
import {
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '@/lib/db/emergency-contacts'

export async function updateCareInstructions(formData: FormData) {
  await requireRole(['owner', 'family'])

  await saveCareInstructions({
    feeding:        formData.get('feeding') as string,
    walks:          formData.get('walks') as string,
    quirks:         formData.get('quirks') as string,
    whereThingsAre: formData.get('whereThingsAre') as string,
    notes:          formData.get('notes') as string,
  })

  revalidatePath('/care')
}

export async function addEmergencyContact(formData: FormData) {
  await requireRole(['owner'])

  await createEmergencyContact({
    name:     formData.get('name') as string,
    role:     formData.get('role') as string,
    phone:    formData.get('phone') as string,
    priority: Number(formData.get('priority') ?? 99),
  })

  revalidatePath('/care')
}

export async function editEmergencyContact(id: string, formData: FormData) {
  await requireRole(['owner'])

  await updateEmergencyContact(id, {
    name:     formData.get('name') as string,
    role:     formData.get('role') as string,
    phone:    formData.get('phone') as string,
    priority: Number(formData.get('priority') ?? 99),
  })

  revalidatePath('/care')
}

export async function removeEmergencyContact(id: string) {
  await requireRole(['owner'])
  await deleteEmergencyContact(id)
  revalidatePath('/care')
}
