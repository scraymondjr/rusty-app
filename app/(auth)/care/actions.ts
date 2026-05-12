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

function parseContactFields(formData: FormData) {
  const name     = (formData.get('name') as string)?.trim()
  const role     = (formData.get('role') as string)?.trim() ?? ''
  const phone    = (formData.get('phone') as string)?.trim()
  const priority = Math.max(1, Math.min(999, parseInt(String(formData.get('priority') ?? '99'), 10) || 99))

  if (!name) throw new Error('Name is required')
  if (!phone) throw new Error('Phone is required')
  if (!/^[+\d\s\-().]{7,20}$/.test(phone)) throw new Error('Invalid phone number')

  return { name, role, phone, priority }
}

export async function addEmergencyContact(formData: FormData) {
  await requireRole(['owner'])
  await createEmergencyContact(parseContactFields(formData))
  revalidatePath('/care')
}

export async function editEmergencyContact(id: string, formData: FormData) {
  await requireRole(['owner'])
  await updateEmergencyContact(id, parseContactFields(formData))
  revalidatePath('/care')
}

export async function removeEmergencyContact(id: string) {
  await requireRole(['owner'])
  await deleteEmergencyContact(id)
  revalidatePath('/care')
}
