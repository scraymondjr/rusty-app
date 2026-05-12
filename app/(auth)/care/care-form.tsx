'use client'

import { useState } from 'react'
import { updateCareInstructions } from './actions'
import type { CareInstructions } from '@/types/db'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export function CareForm({ initialData }: { initialData: CareInstructions | null }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleAction = async (formData: FormData) => {
    setSaving(true)
    try {
      await updateCareInstructions(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
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
