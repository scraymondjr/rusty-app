'use client'

import { useRef, useState } from 'react'
import { logActivity } from './actions'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'

export function LogActivityForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async (formData: FormData) => {
    setSaving(true)
    setError(null)
    try {
      await logActivity(formData)
      formRef.current?.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log activity. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form ref={formRef} action={handleAction}
      className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Log Activity</h2>
      <div>
        <label htmlFor="activity-type" className="block text-xs font-medium text-gray-700 mb-1">Activity Type</label>
        <select id="activity-type" name="type" className={inputClass}>
          <option value="note">Note</option>
          <option value="feeding">Feeding</option>
          <option value="walk">Walk</option>
          <option value="medication">Medication given</option>
          <option value="grooming">Grooming</option>
          <option value="incident">Incident</option>
        </select>
      </div>
      <div>
        <label htmlFor="activity-content" className="block text-xs font-medium text-gray-700 mb-1">Details</label>
        <textarea id="activity-content" name="content" required rows={3} placeholder="What happened?" className={inputClass} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={saving}
        className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
        {saving ? 'Logging…' : 'Add Entry'}
      </button>
    </form>
  )
}
