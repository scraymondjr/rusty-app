import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { getSession } from '@/lib/auth/session'
import { getMedicalRecord } from '@/lib/db/medical'
import { DeleteButton } from './delete-button'

export const metadata: Metadata = { title: 'Medical Record' }

export default async function MedicalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [record, session] = await Promise.all([getMedicalRecord(id), getSession()])
  if (!record) notFound()
  const canEdit = session && ['owner', 'vet'].includes(session.role)

  const visitDate = new Date(record.visitDate).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <PageShell title="Medical Record" backHref="/medical">
      <div className="max-w-2xl space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-lg font-bold text-gray-900">{visitDate}</p>
              <p className="text-sm text-gray-500 mt-0.5">{record.reason}</p>
            </div>
            {record.weight && (
              <span className="text-sm bg-gray-100 text-gray-700 rounded-lg px-3 py-1 font-medium">
                {record.weight} lbs
              </span>
            )}
          </div>
          {record.vet && (
            <Field label="Veterinarian" value={`Dr. ${record.vet}`} />
          )}
        </div>

        {(record.diagnosis || record.treatment || record.followUp) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Findings</h2>
            {record.diagnosis   && <Field label="Diagnosis"   value={record.diagnosis} />}
            {record.treatment   && <Field label="Treatment"   value={record.treatment} />}
            {record.followUp    && <Field label="Follow-up"   value={record.followUp} />}
          </div>
        )}

        {record.notes && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <Field label="Notes" value={record.notes} />
          </div>
        )}

        {record.sourceArtifactUrl && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Attached Document</h2>
            <a
              href={record.sourceArtifactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-700 hover:text-brand-900 underline"
            >
              📎 View document
            </a>
          </div>
        )}

        {canEdit && (
          <div className="flex gap-3 pt-2 pb-6">
            <Link
              href={`/medical/${id}/edit`}
              className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Edit Record
            </Link>
            <DeleteButton id={id} />
          </div>
        )}
      </div>
    </PageShell>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{value}</p>
    </div>
  )
}
