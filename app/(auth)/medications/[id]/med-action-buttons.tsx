'use client'

import { toggleMedicationActive, removeMedication } from '../actions'

export function MedActionButtons({ id, active }: { id: string; active: boolean }) {
  return (
    <div className="flex gap-3 pb-6">
      <button
        onClick={() => toggleMedicationActive(id, !active)}
        className="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Mark as {active ? 'Inactive' : 'Active'}
      </button>
      <button
        onClick={async () => {
          if (!confirm('Delete this medication? This cannot be undone.')) return
          await removeMedication(id)
        }}
        className="bg-white border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors"
      >
        Delete
      </button>
    </div>
  )
}
