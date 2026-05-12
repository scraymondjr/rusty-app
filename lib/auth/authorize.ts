import 'server-only'
import { getSession } from './session'
import type { AccessRole, SessionUser } from '@/types'

type AuthorizedSession = SessionUser & { uid: string }

export async function requireRole(roles: AccessRole[]): Promise<AuthorizedSession> {
  const session = await getSession()
  if (!session) throw new Error('You must be signed in to do that.')
  if (!roles.includes(session.role)) throw new Error("You don't have permission to do that.")
  return session
}
