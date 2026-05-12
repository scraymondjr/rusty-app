'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import {
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy,
} from '@/lib/db/insurance'

function requireOwner(role: string) {
  if (role !== 'owner') throw new Error('Unauthorized')
}

export async function saveInsurancePolicy(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  requireOwner(session.role)

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
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  requireOwner(session.role)
  await deleteInsurancePolicy(id)
  revalidatePath('/insurance')
  redirect('/insurance')
}
