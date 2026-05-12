import type { Metadata } from 'next'
import { MedicationForm } from '../medication-form'

export const metadata: Metadata = { title: 'Add Medication' }

export default function NewMedicationPage() {
  return <MedicationForm />
}
