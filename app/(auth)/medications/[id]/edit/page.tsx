import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMedication } from '@/lib/db/medications'
import { MedicationForm } from '../../medication-form'

export const metadata: Metadata = { title: 'Edit Medication' }

export default async function EditMedicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const med = await getMedication(id)
  if (!med) notFound()

  return <MedicationForm initialData={med} />
}
