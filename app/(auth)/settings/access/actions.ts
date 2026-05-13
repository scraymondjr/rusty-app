'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/authorize'
import { getAdminDb } from '@/lib/firebase/admin'
import { sendInviteEmail } from '@/lib/email/invite'
import { FieldValue } from 'firebase-admin/firestore'
import type { AccessRole } from '@/types'

const VALID_ROLES: AccessRole[] = ['family', 'vet', 'sitter', 'owner']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function inviteUser(email: string, role: AccessRole) {
  const session = await requireRole(['owner'])

  const normalised = email.toLowerCase().trim()
  if (!normalised || !EMAIL_RE.test(normalised)) throw new Error('Invalid email address')
  if (!VALID_ROLES.includes(role)) throw new Error('Invalid role')
  if (normalised === session.email) throw new Error('Cannot invite yourself')

  const db = getAdminDb()
  const existing = await db.collection('access').doc(normalised).get()
  if (existing.exists) throw new Error('This person already has access')

  await db.collection('access').doc(normalised).set({
    role,
    invitedAt: FieldValue.serverTimestamp(),
  })

  await sendInviteEmail(normalised, role)

  revalidatePath('/settings/access')
}

export async function revokeUser(email: string) {
  const session = await requireRole(['owner'])

  const normalised = email.toLowerCase().trim()
  if (normalised === session.email) throw new Error('Cannot revoke your own access')

  await getAdminDb().collection('access').doc(normalised).delete()

  revalidatePath('/settings/access')
}

export async function updateUserRole(email: string, role: AccessRole) {
  const session = await requireRole(['owner'])

  if (!VALID_ROLES.includes(role)) throw new Error('Invalid role')

  const normalised = email.toLowerCase().trim()
  if (normalised === session.email && role !== 'owner') {
    throw new Error('Cannot change your own role')
  }

  await getAdminDb().collection('access').doc(normalised).update({ role })

  revalidatePath('/settings/access')
}
