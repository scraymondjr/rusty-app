'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/authorize'
import {
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from '@/lib/db/medical'
import { addWeightEntry } from '@/lib/db/weight'

export async function saveMedicalRecord(formData: FormData) {
  const session = await requireRole(['owner', 'vet'])

  const id = formData.get('id') as string | null
  const weight = formData.get('weight') ? Number(formData.get('weight')) : undefined

  const data = {
    visitDate:    formData.get('visitDate') as string,
    vet:          formData.get('vet') as string,
    reason:       formData.get('reason') as string,
    weight,
    diagnosis:    (formData.get('diagnosis') as string) || undefined,
    treatment:    (formData.get('treatment') as string) || undefined,
    followUp:     (formData.get('followUp') as string) || undefined,
    notes:        (formData.get('notes') as string) || undefined,
    sourceArtifact: (formData.get('sourceArtifact') as string) || undefined,
  }

  // Log weight entry alongside the record if provided
  if (weight && data.visitDate) {
    await addWeightEntry({ date: data.visitDate, weightLbs: weight })
  }

  if (id) {
    await updateMedicalRecord(id, data)
  } else {
    await createMedicalRecord(data)
  }

  revalidatePath('/medical')
  revalidatePath('/dashboard')
  redirect('/medical')
}

export async function removeMedicalRecord(id: string) {
  await requireRole(['owner', 'vet'])
  await deleteMedicalRecord(id)
  revalidatePath('/medical')
  revalidatePath('/dashboard')
  redirect('/medical')
}
