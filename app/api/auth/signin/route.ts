import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { createSession, getAccessRecord } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body?.idToken || typeof body.idToken !== 'string') {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  try {
    const decoded = await adminAuth.verifyIdToken(body.idToken)

    if (!decoded.email_verified) {
      return NextResponse.json({ error: 'email_not_verified' }, { status: 403 })
    }

    const access = await getAccessRecord(decoded.email!)
    if (!access) {
      return NextResponse.json(
        { error: 'access_denied', email: decoded.email },
        { status: 403 },
      )
    }

    await createSession(body.idToken)

    return NextResponse.json({ role: access.role })
  } catch (err) {
    console.error('[auth/signin]', err)
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 })
  }
}
