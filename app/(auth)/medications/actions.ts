'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/authorize'
import {
  createMedication,
  updateMedication,
  deleteMedication,
} from '@/lib/db/medications'

export async function saveMedication(formData: FormData) {
  await requireRole(['owner', 'vet'])

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
  await requireRole(['owner', 'vet'])
  await updateMedication(id, { active })
  revalidatePath('/medications')
  revalidatePath('/dashboard')
}

export async function removeMedication(id: string) {
  await requireRole(['owner', 'vet'])
  await deleteMedication(id)
  revalidatePath('/medications')
  revalidatePath('/dashboard')
  redirect('/medications')
}
