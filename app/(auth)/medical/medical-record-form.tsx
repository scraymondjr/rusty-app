'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { saveMedicalRecord } from './actions'
import type { MedicalRecord } from '@/types/db'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

interface Props {
  initialData?: MedicalRecord
}

export function MedicalRecordForm({ initialData }: Props) {
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
        const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, '_')
        const uploadData = new FormData()
        uploadData.append('file', file)
        uploadData.append('path', `dogs/rusty/medical/${Date.now()}_${safeName}`)
        const res = await fetch('/api/upload', { method: 'POST', body: uploadData })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message ?? `Upload failed (${res.status})`)
        }
        const { path } = await res.json()
        formData.set('sourceArtifact', path)
      }

      await saveMedicalRecord(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setUploading(false)
    }
  }

  return (
    <PageShell
      title={isEditing ? 'Edit Record' : 'Add Medical Record'}
      backHref={isEditing ? `/medical/${initialData.id}` : '/medical'}
    >
      <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {initialData && <input type="hidden" name="id" value={initialData.id} />}
        {initialData?.sourceArtifact && !file && (
          <input type="hidden" name="sourceArtifact" value={initialData.sourceArtifact} />
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Visit Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-visitDate" className={labelClass}>Visit Date *</label>
              <input
                id="med-visitDate"
                name="visitDate"
                type="date"
                required
                defaultValue={initialData?.visitDate ?? new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="med-weight" className={labelClass}>Weight (lbs)</label>
              <input
                id="med-weight"
                name="weight"
                type="number"
                step="0.1"
                min="0"
                defaultValue={initialData?.weight}
                placeholder="e.g. 68.5"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="med-vet" className={labelClass}>Vet / Clinic *</label>
            <input
              id="med-vet"
              name="vet"
              type="text"
              required
              defaultValue={initialData?.vet}
              placeholder="e.g. Dr. Smith at Riverside Animal Hospital"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="med-reason" className={labelClass}>Reason for Visit *</label>
            <input
              id="med-reason"
              name="reason"
              type="text"
              required
              defaultValue={initialData?.reason}
              placeholder="e.g. Annual checkup, limping"
              className={inputClass}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Findings</h2>

          <div>
            <label htmlFor="med-diagnosis" className={labelClass}>Diagnosis</label>
            <textarea
              id="med-diagnosis"
              name="diagnosis"
              rows={2}
              defaultValue={initialData?.diagnosis}
              placeholder="e.g. Mild hip dysplasia"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="med-treatment" className={labelClass}>Treatment</label>
            <textarea
              id="med-treatment"
              name="treatment"
              rows={2}
              defaultValue={initialData?.treatment}
              placeholder="e.g. Started Carprofen 25mg twice daily"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="med-followUp" className={labelClass}>Follow-up</label>
            <input
              id="med-followUp"
              name="followUp"
              type="text"
              defaultValue={initialData?.followUp}
              placeholder="e.g. Recheck in 6 weeks"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="med-notes" className={labelClass}>Notes</label>
            <textarea
              id="med-notes"
              name="notes"
              rows={2}
              defaultValue={initialData?.notes}
              placeholder="Any other notes"
              className={inputClass}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Attach Document</h2>
          <p className="text-xs text-gray-400">PDF or photo of the vet visit summary</p>
          {initialData?.sourceArtifact && !file && (
            <p className="text-xs text-gray-500">Current attachment on file. Upload a new file to replace it.</p>
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
            {uploading ? 'Saving…' : isEditing ? 'Save Changes' : 'Save Record'}
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
