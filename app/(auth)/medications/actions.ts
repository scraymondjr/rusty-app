'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import {
  createMedication,
  updateMedication,
  deleteMedication,
} from '@/lib/db/medications'

function requireRole(role: string) {
  if (!['owner', 'vet'].includes(role)) throw new Error('Unauthorized')
}

export async function saveMedication(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  requireRole(session.role)

  const id = formData.get('id') as string | null

  const data = {
    name:              formData.get('name') as string,
    dose:              formData.get('dose') as string,
    frequency:         formData.get('frequency') as string,
    withFood:          formData.get('withFood') === 'true',
    fillDate:          (formData.get('fillDate') as string) || undefined,
    refillsRemaining:  formData.get('refillsRemaining') ? Number(formData.get('refillsRemaining')) : undefined,
    instructions:      (formData.get('instructions') as string) || undefined,
    active:            formData.get('active') !== 'false',
    sourceArtifact:    (formData.get('sourceArtifact') as string) || undefined,
    prescribedAtRecordId: (formData.get('prescribedAtRecordId') as string) || undefined,
  }

  if (id) {
    await updateMedication(id, data)
  } else {
    await createMedication(data)
  }

  revalidatePath('/medications')
  revalidatePath('/dashboard')
  redirect('/medications')
}

export async function toggleMedicationActive(id: string, active: boolean) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  requireRole(session.role)
  await updateMedication(id, { active })
  revalidatePath('/medications')
  revalidatePath('/dashboard')
}

export async function removeMedication(id: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  requireRole(session.role)
  await deleteMedication(id)
  revalidatePath('/medications')
  revalidatePath('/dashboard')
  redirect('/medications')
}
