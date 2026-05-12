'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/authorize'
import {
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy,
} from '@/lib/db/insurance'

export async function saveInsurancePolicy(formData: FormData) {
  await requireRole(['owner'])

  const id = formData.get('id') as string | null

  const data = {
    provider:     formData.get('provider') as string,
    policyNumber: formData.get('policyNumber') as string,
    coverage:     (formData.get('coverage') as string) || undefined,
  }

  if (id) {
    await updateInsurancePolicy(id, data)
  } else {
    await createInsurancePolicy(data)
  }

  revalidatePath('/insurance')
  redirect('/insurance')
}

export async function removeInsurancePolicy(id: string) {
  await requireRole(['owner'])
  await deleteInsurancePolicy(id)
  revalidatePath('/insurance')
  redirect('/insurance')
}
