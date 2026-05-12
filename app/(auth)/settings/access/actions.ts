'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/authorize'
import { getAdminDb } from '@/lib/firebase/admin'
import { sendInviteEmail } from '@/lib/email/invite'
import { FieldValue } from 'firebase-admin/firestore'
import type { AccessRole } from '@/types'

const VALID_ROLES: AccessRole[] = ['family', 'vet', 'sitter', 'owner']

export async function inviteUser(email: string, role: AccessRole) {
  await requireRole(['owner'])

  if (!email || !VALID_ROLES.includes(role)) throw new Error('Invalid input')
  const normalised = email.toLowerCase().trim()

  await getAdminDb().collection('access').doc(normalised).set({
    role,
    invitedAt: FieldValue.serverTimestamp(),
  })

  await sendInviteEmail(normalised, role)

  revalidatePath('/settings/access')
}

export async function revokeUser(email: string) {
  const session = await requireRole(['owner'])

  // Prevent owner from revoking themselves
  if (email === session.email) throw new Error('Cannot revoke your own access')

  await getAdminDb().collection('access').doc(email).delete()

  revalidatePath('/settings/access')
}

export async function updateUserRole(email: string, role: AccessRole) {
  const session = await requireRole(['owner'])

  if (!VALID_ROLES.includes(role)) throw new Error('Invalid role')

  // Prevent owner from demoting themselves
  if (email === session.email && role !== 'owner') {
    throw new Error('Cannot change your own role')
  }

  await getAdminDb().collection('access').doc(email).update({ role })

  revalidatePath('/settings/access')
}
