'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { saveMedication } from './actions'
import type { Medication } from '@/types/db'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

interface Props {
  initialData?: Medication
}

export function MedicationForm({ initialData }: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData(formRef.current!)

      if (file) {
        const uploadData = new FormData()
        uploadData.append('file', file)
        uploadData.append('path', `dogs/rusty/medications/${Date.now()}_${file.name}`)
        const res = await fetch('/api/upload', { method: 'POST', body: uploadData })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message ?? `Upload failed (${res.status})`)
        }
        const { path } = await res.json()
        formData.set('sourceArtifact', path)
      }

      await saveMedication(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setUploading(false)
    }
  }

  return (
    <PageShell
      title={isEditing ? `Edit ${initialData.name}` : 'Add Medication'}
      backHref={isEditing ? `/medications/${initialData.id}` : '/medications'}
    >
      <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {initialData && <input type="hidden" name="id" value={initialData.id} />}
        <input type="hidden" name="active" value={String(initialData?.active ?? true)} />

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Medication Info</h2>

          <div>
            <label htmlFor="med-name" className={labelClass}>Medication Name *</label>
            <input
              id="med-name"
              name="name"
              type="text"
              required
              defaultValue={initialData?.name}
              placeholder="e.g. Carprofen 25mg"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-dose" className={labelClass}>Dose *</label>
              <input
                id="med-dose"
                name="dose"
                type="text"
                required
                defaultValue={initialData?.dose}
                placeholder="e.g. 1 tablet"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="med-frequency" className={labelClass}>Frequency *</label>
              <input
                id="med-frequency"
                name="frequency"
                type="text"
                required
                defaultValue={initialData?.frequency}
                placeholder="e.g. Twice daily"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="hidden" name="withFood" value="false" />
            <input
              id="withFood"
              name="withFood"
              type="checkbox"
              value="true"
              defaultChecked={initialData?.withFood ?? false}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="withFood" className="text-sm text-gray-700">Give with food</label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Refill Tracking</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-fillDate" className={labelClass}>Fill Date</label>
              <input
                id="med-fillDate"
                name="fillDate"
                type="date"
                defaultValue={initialData?.fillDate}
                max={new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="med-refills" className={labelClass}>Refills Remaining</label>
              <input
                id="med-refills"
                name="refillsRemaining"
                type="number"
                min="0"
                defaultValue={initialData?.refillsRemaining}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="med-instructions" className={labelClass}>Instructions</label>
            <textarea
              id="med-instructions"
              name="instructions"
              rows={2}
              defaultValue={initialData?.instructions}
              placeholder="e.g. Keep refrigerated. Do not crush."
              className={inputClass}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Attach Label / Prescription</h2>
          <p className="text-xs text-gray-400">Photo or PDF of the prescription label (AI extraction in Phase 5)</p>
          {initialData?.sourceArtifact && !file && (
            <p className="text-xs text-gray-500">
              Current attachment on file. Upload a new file to replace it.
            </p>
          )}
          {initialData?.sourceArtifact && (
            <input type="hidden" name="sourceArtifact" value={initialData.sourceArtifact} />
          )}
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
          />
          {file && <p className="text-xs text-gray-500">Selected: {file.name}</p>}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pb-4">
          <button
            type="submit"
            disabled={uploading}
            className="bg-brand-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Saving…' : isEditing ? 'Save Changes' : 'Save Medication'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white border border-gray-300 text-gray-700 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </PageShell>
  )
}
