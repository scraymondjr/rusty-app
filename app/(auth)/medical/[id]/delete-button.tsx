'use client'

import { removeMedicalRecord } from '../actions'

export function DeleteButton({ id }: { id: string }) {
  return (
    <button
      onClick={async () => {
        if (!confirm('Delete this record? This cannot be undone.')) return
        await removeMedicalRecord(id)
      }}
      className="bg-white border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors"
    >
      Delete Record
    </button>
  )
}
