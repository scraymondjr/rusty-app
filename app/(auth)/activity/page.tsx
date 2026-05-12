import type { Metadata } from 'next'
import { PageShell } from '@/components/page-shell'
import { EmptyState } from '@/components/ui/empty-state'
import { getActivityEntries } from '@/lib/db/activity'
import { LogActivityForm } from './log-activity-form'

export const metadata: Metadata = { title: 'Activity Log' }

const ACTIVITY_TYPES = ['note', 'feeding', 'walk', 'medication', 'grooming', 'incident'] as const

export default async function ActivityPage() {
  const entries = await getActivityEntries()

  return (
    <PageShell title="Activity Log">
      <div className="max-w-2xl space-y-6">
        <LogActivityForm />
        {entries.length === 0 ? (
          <EmptyState icon="📓" title="No entries yet" description="Log care activities here. Sitters can add updates." />
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-brand-700 bg-brand-50 rounded px-2 py-0.5 capitalize">
                    {entry.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{entry.content}</p>
                <p className="text-xs text-gray-400 mt-1.5">{entry.authorEmail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
