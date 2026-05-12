import 'server-only'
import { cookies } from 'next/headers'
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin'
import type { AccessRecord, SessionUser } from '@/types'

const SESSION_COOKIE_NAME = '__session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5 // 5 days

export async function createSession(idToken: string): Promise<void> {
  const expiresIn = SESSION_MAX_AGE_SECONDS * 1000
  const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    // Scope to rusty.scrjr.com only — never the parent domain
    ...(process.env.NODE_ENV === 'production' && { domain: 'rusty.scrjr.com' }),
  })
}

export async function getSession(): Promise<(SessionUser & { uid: string }) | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionCookie) return null

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true)
    const access = await getAccessRecord(decoded.email!)
    if (!access) return null
    return {
      uid:     decoded.uid,
      email:   decoded.email!,
      name:    decoded.name,
      picture: decoded.picture,
      role:    access.role,
    }
  } catch {
    return null
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionCookie) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(sessionCookie)
      await getAdminAuth().revokeRefreshTokens(decoded.sub)
    } catch {
      // Cookie already invalid — proceed to delete
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getAccessRecord(email: string): Promise<AccessRecord | null> {
  const doc = await getAdminDb().collection('access').doc(email).get()
  if (!doc.exists) return null
  return doc.data() as AccessRecord
}
