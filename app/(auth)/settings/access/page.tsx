import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { getSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { InviteForm } from './invite-form'
import { AccessTable } from './access-table'
import type { AccessRole } from '@/types'

export const metadata: Metadata = { title: 'Access Management' }

interface AccessEntry {
  email: string
  role: AccessRole
  lastSeenAt?: string
  invitedAt?: string
}

export default async function AccessPage() {
  const session = await getSession()
  if (session?.role !== 'owner') redirect('/dashboard')

  const snap = await getAdminDb().collection('access').get()
  const entries: AccessEntry[] = snap.docs
    .map((doc) => ({
      email:      doc.id,
      role:       (doc.data().role ?? 'family') as AccessRole,
      lastSeenAt: doc.data().lastSeenAt?.toDate().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }),
      invitedAt: doc.data().invitedAt?.toDate().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }),
    }))
    .sort((a, b) => {
      // Owner first, then alphabetical
      if (a.email === session.email) return -1
      if (b.email === session.email) return 1
      return a.email.localeCompare(b.email)
    })

  return (
    <PageShell title="Access Management">
      <div className="max-w-xl space-y-5">
        <InviteForm />

        {entries.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">People with access</h2>
            <AccessTable entries={entries} currentEmail={session.email} />
          </div>
        )}
      </div>
    </PageShell>
  )
}
