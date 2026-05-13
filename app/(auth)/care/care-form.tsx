'use client'

import { useState } from 'react'
import { useUser } from '@/components/user-provider'
import { updateCareInstructions } from './actions'
import type { CareInstructions } from '@/types/db'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

function ReadOnlyField({ label, value, placeholder }: { label: string; value?: string; placeholder: string }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{value || <span className="text-gray-400">{placeholder}</span>}</p>
    </div>
  )
}

export function CareForm({ initialData }: { initialData: CareInstructions | null }) {
  const { role } = useUser()
  const canEdit = role === 'owner' || role === 'family'
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async (formData: FormData) => {
    setSaving(true)
    setError(null)
    try {
      await updateCareInstructions(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!canEdit) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <ReadOnlyField label="Feeding" value={initialData?.feeding} placeholder="No feeding instructions yet." />
        <ReadOnlyField label="Walks" value={initialData?.walks} placeholder="No walk instructions yet." />
        <ReadOnlyField label="Quirks & Behavior" value={initialData?.quirks} placeholder="No quirks noted." />
        <ReadOnlyField label="Where Things Are" value={initialData?.whereThingsAre} placeholder="Not specified." />
        <ReadOnlyField label="Notes" value={initialData?.notes} placeholder="No additional notes." />
      </div>
    )
  }

  return (
    <form action={handleAction} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div>
        <label htmlFor="care-feeding" className={labelClass}>Feeding</label>
        <textarea id="care-feeding" name="feeding" rows={3} defaultValue={initialData?.feeding ?? ''}
          placeholder="e.g. 1 cup kibble in the morning, 1 cup at dinner. Always has access to water." className={inputClass} />
      </div>
      <div>
        <label htmlFor="care-walks" className={labelClass}>Walks</label>
        <textarea id="care-walks" name="walks" rows={2} defaultValue={initialData?.walks ?? ''}
          placeholder="e.g. 30 min walk morning and evening. Avoid hot pavement." className={inputClass} />
      </div>
      <div>
        <label htmlFor="care-quirks" className={labelClass}>Quirks &amp; Behavior</label>
        <textarea id="care-quirks" name="quirks" rows={3} defaultValue={initialData?.quirks ?? ''}
          placeholder="e.g. Afraid of thunderstorms. Loves the green ball. Don't let him eat grass." className={inputClass} />
      </div>
      <div>
        <label htmlFor="care-whereThingsAre" className={labelClass}>Where Things Are</label>
        <textarea id="care-whereThingsAre" name="whereThingsAre" rows={3} defaultValue={initialData?.whereThingsAre ?? ''}
          placeholder="e.g. Food in pantry, leash on hook by door, meds in bathroom cabinet." className={inputClass} />
      </div>
      <div>
        <label htmlFor="care-notes" className={labelClass}>Notes</label>
        <textarea id="care-notes" name="notes" rows={2} defaultValue={initialData?.notes ?? ''}
          placeholder="Anything else a sitter should know." className={inputClass} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>
    </form>
  )
}
