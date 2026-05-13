import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMedicalRecord } from '@/lib/db/medical'
import { MedicalRecordForm } from '../../medical-record-form'

export const metadata: Metadata = { title: 'Edit Medical Record' }

export default async function EditMedicalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const record = await getMedicalRecord(id)
  if (!record) notFound()

  return <MedicalRecordForm initialData={record} />
}
