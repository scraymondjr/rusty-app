import type { Metadata } from 'next'
import { MedicalRecordForm } from '../medical-record-form'

export const metadata: Metadata = { title: 'Add Medical Record' }

export default function NewMedicalPage() {
  return <MedicalRecordForm />
}
