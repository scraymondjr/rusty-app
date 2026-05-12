import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { EmptyState } from '@/components/ui/empty-state'
import { getMedicalRecords } from '@/lib/db/medical'

export const metadata: Metadata = { title: 'Medical Records' }

export default async function MedicalPage() {
  const records = await getMedicalRecords()

  return (
    <PageShell title="Medical Records" action={{ label: '+ Add Record', href: '/medical/new' }}>
      {records.length === 0 ? (
        <EmptyState
          icon="🏥"
          title="No records yet"
          description="Upload a vet visit PDF or add one manually."
          action={
            <Link
              href="/medical/new"
              className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Add First Record
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Link
              key={record.id}
              href={`/medical/${record.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(record.visitDate).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">{record.reason}</p>
                  {record.vet && (
                    <p className="text-xs text-gray-400 mt-1">Dr. {record.vet}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                  {record.weight && (
                    <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">
                      {record.weight} lbs
                    </span>
                  )}
                  {record.sourceArtifact && (
                    <span className="text-xs bg-brand-50 text-brand-700 rounded px-2 py-0.5">
                      📎 attachment
                    </span>
                  )}
                </div>
              </div>
              {record.diagnosis && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                  <span className="font-medium">Dx:</span> {record.diagnosis}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  )
}
