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

  const id   = formData.get('id') as string | null
  const name = (formData.get('name') as string)?.trim()
  const dose = (formData.get('dose') as string)?.trim()
  const frequency = (formData.get('frequency') as string)?.trim()

  if (!name) throw new Error('Medication name is required.')
  if (!dose) throw new Error('Dose is required.')
  if (!frequency) throw new Error('Frequency is required.')

  const refillsRaw = formData.get('refillsRemaining')
  const refillsRemaining = refillsRaw ? Number(refillsRaw) : undefined
  if (refillsRemaining !== undefined && (isNaN(refillsRemaining) || refillsRemaining < 0)) {
    throw new Error('Refills remaining must be 0 or more.')
  }

  const fillDate = (formData.get('fillDate') as string) || undefined
  if (fillDate && isNaN(new Date(fillDate).getTime())) {
    throw new Error('Invalid fill date.')
  }

  const data = {
    name,
    dose,
    frequency,
    withFood:          formData.get('withFood') === 'true',
    fillDate,
    refillsRemaining,
    instructions:      (formData.get('instructions') as string)?.trim() || undefined,
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
