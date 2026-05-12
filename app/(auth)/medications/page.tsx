import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { EmptyState } from '@/components/ui/empty-state'
import { getMedications } from '@/lib/db/medications'

export const metadata: Metadata = { title: 'Medications' }

export default async function MedicationsPage() {
  const medications = await getMedications()
  const active   = medications.filter((m) => m.active)
  const inactive = medications.filter((m) => !m.active)

  return (
    <PageShell title="Medications" action={{ label: '+ Add Med', href: '/medications/new' }}>
      {medications.length === 0 ? (
        <EmptyState
          icon="💊"
          title="No medications on file"
          description="Add active prescriptions and supplements."
          action={
            <Link
              href="/medications/new"
              className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Add First Medication
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Active ({active.length})
              </h2>
              <div className="space-y-2">
                {active.map((med) => <MedCard key={med.id} med={med} />)}
              </div>
            </section>
          )}
          {inactive.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Inactive
              </h2>
              <div className="space-y-2 opacity-60">
                {inactive.map((med) => <MedCard key={med.id} med={med} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </PageShell>
  )
}

function MedCard({ med }: { med: Awaited<ReturnType<typeof getMedications>>[number] }) {
  return (
    <Link
      href={`/medications/${med.id}`}
      className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">{med.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {med.dose} · {med.frequency}
          {med.withFood ? ' · with food' : ''}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {med.refillsRemaining !== undefined && (
          <span className={`text-xs rounded px-2 py-0.5 ${
            med.refillsRemaining === 0
              ? 'bg-red-50 text-red-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {med.refillsRemaining === 0 ? '⚠ No refills' : `${med.refillsRemaining} refill${med.refillsRemaining !== 1 ? 's' : ''}`}
          </span>
        )}
      </div>
    </Link>
  )
}
