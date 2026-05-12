'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { saveMedicalRecord } from '../actions'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export default function NewMedicalPage() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData(formRef.current!)

      if (file) {
        const uploadData = new FormData()
        uploadData.append('file', file)
        uploadData.append('path', `dogs/rusty/medical/${Date.now()}_${file.name}`)
        const res = await fetch('/api/upload', { method: 'POST', body: uploadData })
        if (!res.ok) throw new Error('File upload failed')
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
    <PageShell title="Add Medical Record" backHref="/medical">
      <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Visit Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Visit Date *</label>
              <input name="visitDate" type="date" required className={inputClass}
                defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className={labelClass}>Weight (lbs)</label>
              <input name="weight" type="number" step="0.1" min="0" placeholder="e.g. 68.5" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Vet / Clinic *</label>
            <input name="vet" type="text" required placeholder="e.g. Dr. Smith at Riverside Animal Hospital" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Reason for Visit *</label>
            <input name="reason" type="text" required placeholder="e.g. Annual checkup, limping" className={inputClass} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Findings</h2>

          <div>
            <label className={labelClass}>Diagnosis</label>
            <textarea name="diagnosis" rows={2} placeholder="e.g. Mild hip dysplasia" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Treatment</label>
            <textarea name="treatment" rows={2} placeholder="e.g. Started Carprofen 25mg twice daily" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Follow-up</label>
            <input name="followUp" type="text" placeholder="e.g. Recheck in 6 weeks" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" rows={2} placeholder="Any other notes" className={inputClass} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Attach Document</h2>
          <p className="text-xs text-gray-400">PDF or photo of the vet visit summary (no AI extraction yet — Phase 5)</p>
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
            {uploading ? 'Saving…' : 'Save Record'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/medical')}
            className="bg-white border border-gray-300 text-gray-700 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </PageShell>
  )
}
