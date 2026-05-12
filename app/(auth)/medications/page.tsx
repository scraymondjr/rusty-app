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
              <div className="space-y-2">
                {inactive.map((med) => <MedCard key={med.id} med={med} inactive />)}
              </div>
            </section>
          )}
        </div>
      )}
    </PageShell>
  )
}

function MedCard({
  med,
  inactive = false,
}: {
  med: Awaited<ReturnType<typeof getMedications>>[number]
  inactive?: boolean
}) {
  const lowRefills = med.refillsRemaining !== undefined && med.refillsRemaining <= 2
  const noRefills  = med.refillsRemaining === 0

  const fillDateLabel = med.fillDate
    ? `Filled ${new Date(med.fillDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : null

  return (
    <Link
      href={`/medications/${med.id}`}
      className={`flex items-center justify-between rounded-xl border p-4 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
        inactive
          ? 'bg-gray-50 border-gray-200 hover:border-gray-300'
          : 'bg-white border-gray-200 hover:border-brand-300'
      }`}
    >
      <div>
        <p className={`text-sm font-semibold ${inactive ? 'text-gray-400' : 'text-gray-900'}`}>
          {med.name}
        </p>
        <p className={`text-xs mt-0.5 ${inactive ? 'text-gray-400' : 'text-gray-500'}`}>
          {med.dose} · {med.frequency}
          {med.withFood ? ' · with food' : ''}
        </p>
        {fillDateLabel && (
          <p className={`text-xs mt-0.5 ${inactive ? 'text-gray-400' : 'text-gray-400'}`}>
            {fillDateLabel}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {med.refillsRemaining !== undefined && !inactive && (
          <span className={`text-xs rounded px-2 py-0.5 ${
            noRefills  ? 'bg-red-50 text-red-700' :
            lowRefills ? 'bg-amber-50 text-amber-700' :
                         'bg-gray-100 text-gray-600'
          }`}>
            {noRefills
              ? '⚠ No refills'
              : `${med.refillsRemaining} refill${med.refillsRemaining !== 1 ? 's' : ''}`}
          </span>
        )}
        {inactive && (
          <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">Inactive</span>
        )}
      </div>
    </Link>
  )
}
