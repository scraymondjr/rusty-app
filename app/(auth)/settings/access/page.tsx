import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { getSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'

export const metadata: Metadata = { title: 'Access Management' }

interface AccessEntry {
  email: string
  role: string
  lastSeenAt?: string
}

export default async function AccessPage() {
  const session = await getSession()
  if (session?.role !== 'owner') redirect('/dashboard')

  const snap = await getAdminDb().collection('access').get()
  const entries: AccessEntry[] = snap.docs.map((doc) => ({
    email: doc.id,
    role:  doc.data().role ?? '—',
    lastSeenAt: doc.data().lastSeenAt?.toDate().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }),
  }))

  return (
    <PageShell title="Access Management">
      <div className="max-w-xl space-y-4">
        <p className="text-sm text-gray-500">
          People with access to Rusty&apos;s dashboard. Invite flow coming in Phase 3.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {entries.map((entry) => (
            <div key={entry.email} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{entry.email}</p>
                {entry.lastSeenAt && (
                  <p className="text-xs text-gray-400">Last seen {entry.lastSeenAt}</p>
                )}
              </div>
              <span className="text-xs font-medium bg-brand-50 text-brand-700 rounded-full px-2.5 py-0.5 capitalize">
                {entry.role}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          To add someone now: go to Firebase Console → Firestore → <code>access</code> collection → create a document with their email as the ID and set <code>role</code> to owner, family, vet, or sitter.
        </p>
      </div>
    </PageShell>
  )
}
