import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { getMedication } from '@/lib/db/medications'
import { MedActionButtons } from './med-action-buttons'

export const metadata: Metadata = { title: 'Medication' }

export default async function MedicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const med = await getMedication(id)
  if (!med) notFound()

  return (
    <PageShell title={med.name} backHref="/medications">
      <div className="max-w-2xl space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${
              med.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {med.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <Field label="Dose"      value={med.dose} />
          <Field label="Frequency" value={med.frequency} />
          <Field label="With Food" value={med.withFood ? 'Yes' : 'No'} />
          {med.instructions && <Field label="Instructions" value={med.instructions} />}
        </div>

        {(med.fillDate !== undefined || med.refillsRemaining !== undefined) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Refill Info</h2>
            {med.fillDate && (
              <Field label="Fill Date" value={new Date(med.fillDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            )}
            {med.refillsRemaining !== undefined && (
              <Field label="Refills Remaining" value={String(med.refillsRemaining)} />
            )}
          </div>
        )}

        {med.sourceArtifactUrl && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Prescription Label</h2>
            <a
              href={med.sourceArtifactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-700 hover:text-brand-900 underline"
            >
              📎 View label / document
            </a>
          </div>
        )}

        <MedActionButtons id={id} active={med.active} />
      </div>
    </PageShell>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  )
}
